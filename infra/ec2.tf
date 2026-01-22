resource "aws_vpc" "this" {
  cidr_block                       = "10.0.0.0/16"
  enable_dns_support               = true
  enable_dns_hostnames             = true
  assign_generated_ipv6_cidr_block = true

  tags = { Name = "${var.name}-vpc" }
}

resource "aws_internet_gateway" "this" {
  vpc_id = aws_vpc.this.id
  tags   = { Name = "${var.name}-igw" }
}

resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.this.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true

  # carve a /64 out of the VPC’s Amazon-provided IPv6 range
  ipv6_cidr_block                 = cidrsubnet(aws_vpc.this.ipv6_cidr_block, 8, 0)
  assign_ipv6_address_on_creation = false

  availability_zone = var.az

  tags = { Name = "${var.name}-public-subnet" }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.this.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.this.id
  }

  route {
    ipv6_cidr_block = "::/0"
    gateway_id      = aws_internet_gateway.this.id
  }

  tags = { Name = "${var.name}-public-rt" }
}

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

# --- Security group (SSH + optional ICMPv6) ---
resource "aws_security_group" "ssh" {
  name        = "${var.name}-ssh"
  description = "SSH (IPv4+IPv6)"
  vpc_id      = aws_vpc.this.id

  ingress {
    description = "SSH IPv4"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.ssh_ipv4_cidrs
  }

  ingress {
    description      = "SSH IPv6"
    from_port        = 22
    to_port          = 22
    protocol         = "tcp"
    ipv6_cidr_blocks = var.ssh_ipv6_cidrs
  }

  ingress {
    description      = "HTTP"
    from_port        = 80
    to_port          = 80
    protocol         = "tcp"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  ingress {
    description      = "HTTPS"
    from_port        = 443
    to_port          = 443
    protocol         = "tcp"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  # Helpful for IPv6 troubleshooting (ping)
  ingress {
    description      = "ICMPv6"
    from_port        = -1
    to_port          = -1
    protocol         = "icmpv6"
    ipv6_cidr_blocks = ["::/0"]
  }

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  tags = { Name = "${var.name}-sg" }
}

# --- AMI (Ubuntu Server 24.04 LTS, Free tier eligible, Arm64) ---
# ARM64 Ubuntu: ami-0071c8c431eea0edb (64-bit (Arm)), HVM, EBS, ENA enabled
data "aws_ami" "ubuntu_2404_arm64" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "image-id"
    values = ["ami-0071c8c431eea0edb"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}


# --- Fixed IPv6 via ENI ---
resource "aws_network_interface" "this" {
  subnet_id       = aws_subnet.public.id
  security_groups = [aws_security_group.ssh.id]

  # pick a stable IPv6 inside the subnet /64
  # host number must be >0; "10" is arbitrary but stable
  ipv6_addresses = [cidrhost(aws_subnet.public.ipv6_cidr_block, var.ipv6_host_number)]

  tags = { Name = "${var.name}-eni" }
}

resource "aws_instance" "t4g" {
  ami           = data.aws_ami.ubuntu_2404_arm64.id
  instance_type = "t4g.micro"

  primary_network_interface {
    network_interface_id = aws_network_interface.this.id
  }

  # 20 GiB EBS root volume
  root_block_device {
    volume_size = 20
    volume_type = "gp3"
    encrypted   = true
  }

  tags = { Name = "${var.name}-t4g-micro" }
}

resource "aws_eip" "this" {
  domain = "vpc"

  tags = { Name = "${var.name}-eip" }
}

resource "aws_eip_association" "this" {
  allocation_id        = aws_eip.this.id
  network_interface_id = aws_network_interface.this.id
}

locals {
	fixed_ipv6 = tolist(aws_network_interface.this.ipv6_addresses)[0]
  fixed_ipv4 = aws_eip.this.public_ip
}