# GuardDuty detector
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

  tags = local.common_tags
}

# CloudWatch Events rule to forward HIGH/MEDIUM findings to SNS
resource "aws_cloudwatch_event_rule" "guardduty_findings" {
  name        = "${local.name_prefix}-guardduty-findings"
  description = "Forward GuardDuty HIGH and MEDIUM findings to SNS"

  event_pattern = jsonencode({
    source      = ["aws.guardduty"]
    detail-type = ["GuardDuty Finding"]
    detail = {
      severity = [{ numeric = [">", 4] }]
    }
  })

  tags = local.common_tags
}

resource "aws_cloudwatch_event_target" "guardduty_sns" {
  rule      = aws_cloudwatch_event_rule.guardduty_findings.name
  target_id = "GuardDutyToSNS"
  arn       = aws_sns_topic.alerts.arn

  input_transformer {
    input_paths = {
      severity    = "$.detail.severity"
      type        = "$.detail.type"
      description = "$.detail.description"
      account     = "$.account"
      region      = "$.region"
    }
    input_template = <<-EOT
      "GuardDuty Finding [Severity: <severity>]\n
Type: <type>\nAccount: <account> / Region: <region>\n\nDescription: <description>"
    EOT
  }
}

# Allow EventBridge to publish to our SNS alerts topic
resource "aws_sns_topic_policy" "guardduty_publish" {
  arn = aws_sns_topic.alerts.arn

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid       = "AllowEventBridgePublish"
      Effect    = "Allow"
      Principal = { Service = "events.amazonaws.com" }
      Action    = "sns:Publish"
      Resource  = aws_sns_topic.alerts.arn
    }]
  })
}

output "guardduty_detector_id" {
  description = "GuardDuty detector ID"
  value       = aws_guardduty_detector.main.id
}
