
variable "name" {
  type    = string
  default = "offline-notion"
}

variable "region" {
  type    = string
  default = "us-east-1"
}

variable "az" {
  type    = string
  default = "us-east-1a"
}


# Lock SSH down if you can; defaults are open.
variable "ssh_ipv4_cidrs" {
  type    = list(string)
  default = ["0.0.0.0/0"]
}

variable "ssh_ipv6_cidrs" {
  type    = list(string)
  default = ["::/0"]
}

# Which address inside the subnet /64 to use
variable "ipv6_host_number" {
  type    = number
  default = 10
}


variable "base_domain" {
  default = "yongbeom.com"
}

variable "project_domain" {
  default = "docs.yongbeom.com"
}