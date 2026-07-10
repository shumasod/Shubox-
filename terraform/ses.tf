# ---------------------------------------------------------------------------
# SES — domain identity, DKIM, configuration set, and CloudWatch alarms
# ---------------------------------------------------------------------------

resource "aws_ses_domain_identity" "main" {
  domain = var.ses_domain
}

resource "aws_ses_domain_dkim" "main" {
  domain = aws_ses_domain_identity.main.domain
}

# Route53 DKIM CNAME records
resource "aws_route53_record" "dkim" {
  count   = 3
  zone_id = var.route53_zone_id
  name    = "${aws_ses_domain_dkim.main.dkim_tokens[count.index]}._domainkey.${var.ses_domain}"
  type    = "CNAME"
  ttl     = 600
  records = ["${aws_ses_domain_dkim.main.dkim_tokens[count.index]}.dkim.amazonses.com"]
}

# Route53 MX record for SES inbound (optional)
resource "aws_route53_record" "ses_mx" {
  zone_id = var.route53_zone_id
  name    = var.ses_domain
  type    = "TXT"
  ttl     = 600
  records = ["v=spf1 include:amazonses.com ~all"]
}

# SES configuration set with engagement tracking
resource "aws_ses_configuration_set" "main" {
  name = "${var.project}-${var.environment}"

  delivery_options {
    tls_policy = "Require"
  }

  reputation_metrics_enabled = true
  sending_enabled            = true
}

# CloudWatch event destination for bounces and complaints
resource "aws_ses_event_destination" "cloudwatch" {
  name                   = "cloudwatch-metrics"
  configuration_set_name = aws_ses_configuration_set.main.name
  enabled                = true
  matching_types         = ["bounce", "complaint", "delivery", "reject"]

  cloudwatch_destination {
    default_value  = "0"
    dimension_name = "EmailType"
    value_source   = "messageTag"
  }
}

# SNS topic for bounce/complaint notifications
resource "aws_sns_topic" "ses_bounces" {
  name              = "${var.project}-${var.environment}-ses-bounces"
  kms_master_key_id = "alias/aws/sns"
}

resource "aws_ses_identity_notification_topic" "bounce" {
  topic_arn                = aws_sns_topic.ses_bounces.arn
  notification_type        = "Bounce"
  identity                 = aws_ses_domain_identity.main.domain
  include_original_headers = false
}

resource "aws_ses_identity_notification_topic" "complaint" {
  topic_arn                = aws_sns_topic.ses_bounces.arn
  notification_type        = "Complaint"
  identity                 = aws_ses_domain_identity.main.domain
  include_original_headers = false
}

# CloudWatch alarm: bounce rate > 5%
resource "aws_cloudwatch_metric_alarm" "ses_bounce_rate" {
  alarm_name          = "${var.project}-${var.environment}-ses-bounce-rate"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "Reputation.BounceRate"
  namespace           = "AWS/SES"
  period              = 3600
  statistic           = "Average"
  threshold           = 0.05
  alarm_description   = "SES bounce rate exceeded 5% — risk of sending suspension"
  alarm_actions       = [aws_sns_topic.ses_bounces.arn]
  treat_missing_data  = "notBreaching"
}

# CloudWatch alarm: complaint rate > 0.1%
resource "aws_cloudwatch_metric_alarm" "ses_complaint_rate" {
  alarm_name          = "${var.project}-${var.environment}-ses-complaint-rate"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "Reputation.ComplaintRate"
  namespace           = "AWS/SES"
  period              = 3600
  statistic           = "Average"
  threshold           = 0.001
  alarm_description   = "SES complaint rate exceeded 0.1%"
  alarm_actions       = [aws_sns_topic.ses_bounces.arn]
  treat_missing_data  = "notBreaching"
}

# SES suppression list — account-level
resource "aws_sesv2_account_suppression_attributes" "main" {
  suppressed_reasons = ["BOUNCE", "COMPLAINT"]
}
