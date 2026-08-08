# SES domain identity
resource "aws_ses_domain_identity" "main" {
  domain = var.domain_name
}

resource "aws_ses_domain_dkim" "main" {
  domain = aws_ses_domain_identity.main.domain
}

# Route53 DKIM CNAME records
resource "aws_route53_record" "ses_dkim" {
  count   = 3
  zone_id = var.route53_zone_id
  name    = "${aws_ses_domain_dkim.main.dkim_tokens[count.index]}._domainkey.${var.domain_name}"
  type    = "CNAME"
  ttl     = 300
  records = ["${aws_ses_domain_dkim.main.dkim_tokens[count.index]}.dkim.amazonses.com"]
}

# SPF TXT record
resource "aws_route53_record" "ses_spf" {
  zone_id = var.route53_zone_id
  name    = var.domain_name
  type    = "TXT"
  ttl     = 300
  records = ["v=spf1 include:amazonses.com -all"]
}

# DMARC TXT record
resource "aws_route53_record" "ses_dmarc" {
  zone_id = var.route53_zone_id
  name    = "_dmarc.${var.domain_name}"
  type    = "TXT"
  ttl     = 300
  records = ["v=DMARC1; p=quarantine; rua=mailto:dmarc@${var.domain_name}; pct=100"]
}

# SES Configuration Set for tracking
resource "aws_ses_configuration_set" "main" {
  name = "${local.name_prefix}-config-set"

  reputation_metrics_enabled = true
  sending_enabled            = true
}

# SNS topic for SES bounce/complaint notifications
resource "aws_sns_topic" "ses_notifications" {
  name              = "${local.name_prefix}-ses-notifications"
  kms_master_key_id = "alias/aws/sns"
  tags              = local.common_tags
}

resource "aws_ses_identity_notification_topic" "bounce" {
  topic_arn                = aws_sns_topic.ses_notifications.arn
  notification_type        = "Bounce"
  identity                 = aws_ses_domain_identity.main.domain
  include_original_headers = false
}

resource "aws_ses_identity_notification_topic" "complaint" {
  topic_arn                = aws_sns_topic.ses_notifications.arn
  notification_type        = "Complaint"
  identity                 = aws_ses_domain_identity.main.domain
  include_original_headers = false
}

# CloudWatch alarm on bounce rate
resource "aws_cloudwatch_metric_alarm" "ses_bounce_rate" {
  alarm_name          = "${local.name_prefix}-ses-bounce-rate-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "Reputation.BounceRate"
  namespace           = "AWS/SES"
  period              = 900
  statistic           = "Average"
  threshold           = 0.05
  alarm_description   = "SES bounce rate > 5% (AWS threshold: 10%)"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  treat_missing_data  = "notBreaching"
  tags                = local.common_tags
}

output "ses_domain_verification_token" {
  description = "Add this TXT record to DNS to verify the SES domain"
  value       = aws_ses_domain_identity.main.verification_token
}
