variable "name" {
  type    = string
  default = "offline-notion"
}

variable "region" {
  type    = string
  default = "us-east-1"
}

variable "base_domain" {
  default = "yongbeom.com"
}

variable "project_domain" {
  default = "docs.yongbeom.com"
}

variable "public_ipv4" {
  description = "IPv4 address for DNS A records"
  type        = string
}

variable "public_ipv6" {
  description = "IPv6 address for DNS AAAA records"
  type        = string
}