# ---------------------------------------------------------------------------
# GuardDuty — threat detection with findings alerts
# ---------------------------------------------------------------------------

resource "aws_guardduty_detector" "main" {
  enable = true

  datasources {
    s3_logs {
      enable = true
    }
    kubernetes {
      audit_logs {
        enable = false
      }
    }
    malware_protection {
      scan_ec2_instance_with_findings {
        ebs_volumes {
          enable = true
        }
      }
    }
  }

  finding_publishing_frequency = "SIX_HOURS"

  tags = {
    Project     = var.project
    Environment = var.environment
  }
}

# SNS topic for high-severity findings
resource "aws_sns_topic" "guardduty_alerts" {
  name              = "${var.project}-${var.environment}-guardduty-alerts"
  kms_master_key_id = "alias/aws/sns"

  tags = {
    Project     = var.project
    Environment = var.environment
  }
}

# Email subscription for security team
resource "aws_sns_topic_subscription" "guardduty_email" {
  count     = var.security_alert_email != "" ? 1 : 0
  topic_arn = aws_sns_topic.guardduty_alerts.arn
  protocol  = "email"
  endpoint  = var.security_alert_email
}

# EventBridge rule — HIGH and CRITICAL severity findings only
resource "aws_cloudwatch_event_rule" "guardduty_findings" {
  name        = "${var.project}-${var.environment}-guardduty-high-severity"
  description = "Route GuardDuty HIGH/CRITICAL findings to SNS"

  event_pattern = jsonencode({
    source      = ["aws.guardduty"]
    detail-type = ["GuardDuty Finding"]
    detail = {
      severity = [{ numeric = [">=", 7] }]
    }
  })

  tags = {
    Project     = var.project
    Environment = var.environment
  }
}

resource "aws_cloudwatch_event_target" "guardduty_to_sns" {
  rule      = aws_cloudwatch_event_rule.guardduty_findings.name
  target_id = "guardduty-to-sns"
  arn       = aws_sns_topic.guardduty_alerts.arn

  input_transformer {
    input_paths = {
      severity    = "$.detail.severity"
      type        = "$.detail.type"
      region      = "$.region"
      account     = "$.account"
      description = "$.detail.description"
      time        = "$.time"
    }
    input_template = <<-EOT
      "GuardDuty ALERT [severity: <severity>]\n"
      "Type: <type>\n"
      "Region: <region> | Account: <account>\n"
      "Time: <time>\n"
      "Description: <description>"
    EOT
  }
}

# SNS topic policy — allow EventBridge to publish
resource "aws_sns_topic_policy" "guardduty_alerts" {
  arn = aws_sns_topic.guardduty_alerts.arn

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid       = "AllowEventBridgePublish"
      Effect    = "Allow"
      Principal = { Service = "events.amazonaws.com" }
      Action    = "SNS:Publish"
      Resource  = aws_sns_topic.guardduty_alerts.arn
    }]
  })
}

# CloudWatch metric filter — count of GuardDuty findings for dashboarding
resource "aws_cloudwatch_log_metric_filter" "guardduty_finding_count" {
  count          = 0  # enable if CloudWatch Logs GuardDuty export is configured
  name           = "guardduty-finding-count"
  pattern        = "{ $.detail-type = \"GuardDuty Finding\" }"
  log_group_name = "/aws/events/guardduty"

  metric_transformation {
    name      = "GuardDutyFindingCount"
    namespace = "Security/${var.project}"
    value     = "1"
  }
}
