data "aws_route53_zone" "main" {
  name = "${var.base_domain}."
}

resource "aws_route53_record" "canon" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = var.project_domain
  type    = "A"
  ttl     = 300
  records = [var.public_ipv4]
}

resource "aws_route53_record" "canon_ipv6" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = var.project_domain
  type    = "AAAA"
  ttl     = 300
  records = [var.public_ipv6]
}

resource "aws_route53_record" "www" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "www.${var.project_domain}"
  type    = "A"
  ttl     = 300
  records = [var.public_ipv4]
}

resource "aws_route53_record" "www_ipv6" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "www.${var.project_domain}"
  type    = "AAAA"
  ttl     = 300
  records = [var.public_ipv6]
}
