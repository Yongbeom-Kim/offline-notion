data "aws_route53_zone" "main" {
  name = "${var.base_domain}."
}

resource "aws_route53_record" "canon" {
  for_each = toset(var.project_domains)

  zone_id = data.aws_route53_zone.main.zone_id
  name    = each.value
  type    = "A"
  ttl     = 300
  records = [var.public_ipv4]
}

resource "aws_route53_record" "canon_ipv6" {
  for_each = toset(var.project_domains)

  zone_id = data.aws_route53_zone.main.zone_id
  name    = each.value
  type    = "AAAA"
  ttl     = 300
  records = [var.public_ipv6]
}

resource "aws_route53_record" "www" {
  for_each = toset(var.project_domains)

  zone_id = data.aws_route53_zone.main.zone_id
  name    = "www.${each.value}"
  type    = "A"
  ttl     = 300
  records = [var.public_ipv4]
}

resource "aws_route53_record" "www_ipv6" {
  for_each = toset(var.project_domains)

  zone_id = data.aws_route53_zone.main.zone_id
  name    = "www.${each.value}"
  type    = "AAAA"
  ttl     = 300
  records = [var.public_ipv6]
}
