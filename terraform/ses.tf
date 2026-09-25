# ---------------------------------------------------------------------------
# SES — domain identity, DKIM, configuration set, and sending limits
# ---------------------------------------------------------------------------

resource "aws_ses_domain_identity" "main" {
  domain = var.ses_domain
}

resource "aws_ses_domain_dkim" "main" {
  domain = aws_ses_domain_identity.main.domain
}

# Route53 DKIM CNAME records (creates only if manage_dns = true)
resource "aws_route53_record" "dkim" {
  count   = var.ses_manage_dns ? 3 : 0
  zone_id = var.ses_route53_zone_id
  name    = "${aws_ses_domain_dkim.main.dkim_tokens[count.index]}._domainkey.${var.ses_domain}"
  type    = "CNAME"
  ttl     = 600
  records = ["${aws_ses_domain_dkim.main.dkim_tokens[count.index]}.dkim.amazonses.com"]
}

# SPF via TXT record on root domain
resource "aws_route53_record" "spf" {
  count   = var.ses_manage_dns ? 1 : 0
  zone_id = var.ses_route53_zone_id
  name    = var.ses_domain
  type    = "TXT"
  ttl     = 600
  records = ["v=spf1 include:amazonses.com -all"]
}

# DMARC record
resource "aws_route53_record" "dmarc" {
  count   = var.ses_manage_dns ? 1 : 0
  zone_id = var.ses_route53_zone_id
  name    = "_dmarc.${var.ses_domain}"
  type    = "TXT"
  ttl     = 600
  records = ["v=DMARC1; p=quarantine; rua=mailto:${var.ses_dmarc_rua_email}; pct=100"]
}

# SES configuration set for tracking and reputation
resource "aws_ses_configuration_set" "main" {
  name = "${var.project}-${var.environment}"

  reputation_metrics_enabled = true
  sending_enabled            = true

  tracking_options {
    custom_redirect_domain = var.ses_tracking_domain != "" ? var.ses_tracking_domain : null
  }

  suppression_options {
    suppressed_reasons = ["BOUNCE", "COMPLAINT"]
  }
}

# CloudWatch event destination — publishes send/bounce/complaint metrics
resource "aws_ses_event_destination" "cloudwatch" {
  name                   = "cloudwatch-metrics"
  configuration_set_name = aws_ses_configuration_set.main.name
  enabled                = true
  matching_types         = ["send", "bounce", "complaint", "delivery", "reject"]

  cloudwatch_destination {
    default_value  = "0"
    dimension_name = "MessageTag"
    value_source   = "messageTag"
  }
}

# SNS event destination for bounce/complaint notifications
resource "aws_ses_event_destination" "sns" {
  name                   = "sns-bounces"
  configuration_set_name = aws_ses_configuration_set.main.name
  enabled                = true
  matching_types         = ["bounce", "complaint"]

  sns_destination {
    topic_arn = aws_sns_topic.ops_alerts.arn
  }
}

# From address identity for IAM condition in Lambda
resource "aws_ses_email_identity" "from" {
  email = var.ses_from_address
}

# Dedicated IP assignment group (optional — skipped if no dedicated IPs)
resource "aws_ses_dedicated_ip_pool" "main" {
  count          = var.ses_dedicated_ip_pool_name != "" ? 1 : 0
  pool_name      = var.ses_dedicated_ip_pool_name
  scaling_mode   = "STANDARD"
}

# CloudWatch alarm: high bounce rate (> 5% = danger zone)
resource "aws_cloudwatch_metric_alarm" "ses_bounce_rate" {
  alarm_name          = "${var.project}-${var.environment}-ses-bounce-rate"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "Reputation.BounceRate"
  namespace           = "AWS/SES"
  period              = 86400
  statistic           = "Average"
  threshold           = 0.05
  treat_missing_data  = "notBreaching"
  alarm_description   = "SES bounce rate exceeded 5% — risk of sending suspension"
  alarm_actions       = [aws_sns_topic.ops_alerts.arn]
}

resource "aws_cloudwatch_metric_alarm" "ses_complaint_rate" {
  alarm_name          = "${var.project}-${var.environment}-ses-complaint-rate"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "Reputation.ComplaintRate"
  namespace           = "AWS/SES"
  period              = 86400
  statistic           = "Average"
  threshold           = 0.001
  treat_missing_data  = "notBreaching"
  alarm_description   = "SES complaint rate exceeded 0.1% — risk of sending suspension"
  alarm_actions       = [aws_sns_topic.ops_alerts.arn]
}

output "ses_domain_verification_token" {
  description = "SES domain verification TXT record value"
  value       = aws_ses_domain_identity.main.verification_token
}

output "ses_dkim_tokens" {
  description = "DKIM tokens to create as CNAME records (used when ses_manage_dns = false)"
  value       = aws_ses_domain_dkim.main.dkim_tokens
}
