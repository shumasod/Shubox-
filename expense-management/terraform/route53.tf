# -------------------------------------------------------
# Route53 ホステッドゾーン（外部から参照）
# -------------------------------------------------------
variable "domain_name" {
  description = "アプリケーションのドメイン名 (e.g. expense.example.com)"
  type        = string
}

variable "route53_zone_id" {
  description = "Route53 ホステッドゾーン ID"
  type        = string
}

# -------------------------------------------------------
# ALB への A レコード（Alias）
# -------------------------------------------------------
resource "aws_route53_record" "api" {
  zone_id = var.route53_zone_id
  name    = "api.${var.domain_name}"
  type    = "A"

  alias {
    name                   = aws_lb.main.dns_name
    zone_id                = aws_lb.main.zone_id
    evaluate_target_health = true
  }
}

# -------------------------------------------------------
# ACM 証明書の DNS 認証レコード
# -------------------------------------------------------
resource "aws_acm_certificate" "api" {
  domain_name               = "api.${var.domain_name}"
  subject_alternative_names = ["*.${var.domain_name}"]
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = local.tags
}

resource "aws_route53_record" "acm_validation" {
  for_each = {
    for dvo in aws_acm_certificate.api.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  zone_id         = var.route53_zone_id
  name            = each.value.name
  type            = each.value.type
  records         = [each.value.record]
  ttl             = 60
  allow_overwrite = true
}

resource "aws_acm_certificate_validation" "api" {
  certificate_arn         = aws_acm_certificate.api.arn
  validation_record_fqdns = [for record in aws_route53_record.acm_validation : record.fqdn]
}

# -------------------------------------------------------
# ヘルスチェック用 Route53 ヘルスチェック
# -------------------------------------------------------
resource "aws_route53_health_check" "api" {
  fqdn              = "api.${var.domain_name}"
  port              = 443
  type              = "HTTPS"
  resource_path     = "/health"
  failure_threshold = 3
  request_interval  = 30

  tags = merge(local.tags, {
    Name = "${local.prefix}-api-health"
  })
}

output "api_fqdn" {
  description = "API エンドポイント FQDN"
  value       = aws_route53_record.api.fqdn
}

output "acm_certificate_arn" {
  description = "ACM 証明書 ARN"
  value       = aws_acm_certificate.api.arn
}
