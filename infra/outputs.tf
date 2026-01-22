

output "instance_id" {
  value = aws_instance.t4g.id
}

output "fixed_ipv6" {
  value = local.fixed_ipv6
}

output "public_ipv4" {
  value = local.fixed_ipv4
}