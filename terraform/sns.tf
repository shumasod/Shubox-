# ── KMS Key for SNS encryption ─────────────────────────────────────────────────────
resource "aws_kms_key" "sns" {
  description             = "KMS key for ${var.project}-${var.environment} SNS topic encryption"
  deletion_window_in_days = 14
  enable_key_rotation     = true

  tags = merge(var.common_tags, { Name = "${var.project}-${var.environment}-sns-kms" })
}

resource "aws_kms_alias" "sns" {
  name          = "alias/${var.project}-${var.environment}-sns"
  target_key_id = aws_kms_key.sns.key_id
}

# ── Ops alert topic (CloudWatch alarms, GuardDuty) ─────────────────────────
resource "aws_sns_topic" "ops_alerts" {
  name              = "${var.project}-${var.environment}-ops-alerts"
  kms_master_key_id = aws_kms_key.sns.id

  tags = merge(var.common_tags, { Name = "${var.project}-${var.environment}-ops-alerts" })
}

resource "aws_sns_topic_subscription" "ops_alerts_email" {
  count     = length(var.ops_alert_emails)
  topic_arn = aws_sns_topic.ops_alerts.arn
  protocol  = "email"
  endpoint  = var.ops_alert_emails[count.index]
}

# ── Approval notification topic ─────────────────────────────────────────────
resource "aws_sns_topic" "expense_approvals" {
  name              = "${var.project}-${var.environment}-expense-approvals"
  kms_master_key_id = aws_kms_key.sns.id

  tags = merge(var.common_tags, { Name = "${var.project}-${var.environment}-expense-approvals" })
}

# ── Export ready topic ─────────────────────────────────────────────────────────
resource "aws_sns_topic" "export_ready" {
  name              = "${var.project}-${var.environment}-export-ready"
  kms_master_key_id = aws_kms_key.sns.id

  tags = merge(var.common_tags, { Name = "${var.project}-${var.environment}-export-ready" })
}

# ── SNS topic policy: allow CloudWatch to publish to ops-alerts ────────────────
data "aws_iam_policy_document" "sns_ops_alerts_policy" {
  statement {
    sid     = "AllowCloudWatchPublish"
    actions = ["SNS:Publish"]
    principals {
      type        = "Service"
      identifiers = ["cloudwatch.amazonaws.com"]
    }
    resources = [aws_sns_topic.ops_alerts.arn]
    condition {
      test     = "ArnLike"
      variable = "aws:SourceArn"
      values   = ["arn:aws:cloudwatch:${var.aws_region}:${data.aws_caller_identity.current.account_id}:alarm:*"]
    }
  }
}

resource "aws_sns_topic_policy" "ops_alerts" {
  arn    = aws_sns_topic.ops_alerts.arn
  policy = data.aws_iam_policy_document.sns_ops_alerts_policy.json
}

# ── Outputs ────────────────────────────────────────────────────────────────────
output "sns_ops_alerts_arn" {
  description = "ARN of the ops-alerts SNS topic"
  value       = aws_sns_topic.ops_alerts.arn
}

output "sns_expense_approvals_arn" {
  description = "ARN of the expense-approvals SNS topic"
  value       = aws_sns_topic.expense_approvals.arn
}

output "sns_export_ready_arn" {
  description = "ARN of the export-ready SNS topic"
  value       = aws_sns_topic.export_ready.arn
}
