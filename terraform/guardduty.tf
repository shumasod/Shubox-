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

  tags = var.common_tags
}

# ──────────────────────────────────────────────
# EventBridge rule: forward HIGH/CRITICAL findings to SNS
# ──────────────────────────────────────────────
resource "aws_cloudwatch_event_rule" "guardduty_findings" {
  name        = "${var.project}-${var.environment}-guardduty-findings"
  description = "Forward GuardDuty HIGH/CRITICAL findings to SNS"

  event_pattern = jsonencode({
    source      = ["aws.guardduty"]
    detail-type = ["GuardDuty Finding"]
    detail = {
      severity = [{ numeric = [">", var.guardduty_alert_severity_threshold] }]
    }
  })

  tags = var.common_tags
}

resource "aws_cloudwatch_event_target" "guardduty_sns" {
  rule      = aws_cloudwatch_event_rule.guardduty_findings.name
  target_id = "GuardDutyFindingsToSNS"
  arn       = var.sns_ops_alerts_arn

  input_transformer {
    input_paths = {
      severity    = "$.detail.severity"
      type        = "$.detail.type"
      description = "$.detail.description"
      region      = "$.region"
      account     = "$.account"
      time        = "$.time"
    }
    input_template = jsonencode({
      subject = "[GuardDuty] <severity> severity finding in <region>"
      message = "Type: <type>\nSeverity: <severity>\nAccount: <account>\nRegion: <region>\nTime: <time>\n\n<description>"
    })
  }
}

# Allow EventBridge to publish to the SNS topic
data "aws_iam_policy_document" "guardduty_sns_publish" {
  statement {
    effect    = "Allow"
    actions   = ["SNS:Publish"]
    resources = [var.sns_ops_alerts_arn]

    principals {
      type        = "Service"
      identifiers = ["events.amazonaws.com"]
    }
  }
}

# ──────────────────────────────────────────────
# GuardDuty filter: suppress known-safe test findings
# ──────────────────────────────────────────────
resource "aws_guardduty_filter" "suppress_test_findings" {
  count       = var.environment != "production" ? 1 : 0
  detector_id = aws_guardduty_detector.main.id
  name        = "suppress-test-findings"
  action      = "ARCHIVE"
  rank        = 1

  finding_criteria {
    criterion {
      field  = "type"
      equals = ["UnauthorizedAccess:IAMUser/InstanceCredentialExfiltration.OutsideAWS"]
    }
  }
}

output "guardduty_detector_id" {
  description = "GuardDuty detector ID"
  value       = aws_guardduty_detector.main.id
}
