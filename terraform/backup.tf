# ──────────────────────────────────────────────
# AWS Backup vault
# ──────────────────────────────────────────────
resource "aws_backup_vault" "main" {
  name        = "${var.project}-${var.environment}-vault"
  kms_key_arn = var.kms_key_arn

  tags = var.common_tags
}

# ──────────────────────────────────────────────
# Backup plan with daily, weekly, and monthly rules
# ──────────────────────────────────────────────
resource "aws_backup_plan" "main" {
  name = "${var.project}-${var.environment}-backup-plan"

  rule {
    rule_name         = "daily-backup"
    target_vault_name = aws_backup_vault.main.name
    schedule          = "cron(0 18 * * ? *)" # 03:00 JST daily
    start_window      = 60
    completion_window = 180

    lifecycle {
      delete_after = var.backup_daily_retention_days
    }

    copy_action {
      destination_vault_arn = aws_backup_vault.main.arn

      lifecycle {
        delete_after = var.backup_daily_retention_days
      }
    }
  }

  rule {
    rule_name         = "weekly-backup"
    target_vault_name = aws_backup_vault.main.name
    schedule          = "cron(0 18 ? * 1 *)" # Monday 03:00 JST
    start_window      = 60
    completion_window = 360

    lifecycle {
      delete_after = var.backup_weekly_retention_days
    }
  }

  rule {
    rule_name         = "monthly-backup"
    target_vault_name = aws_backup_vault.main.name
    schedule          = "cron(0 18 1 * ? *)" # 1st of month 03:00 JST
    start_window      = 60
    completion_window = 480

    lifecycle {
      cold_storage_after = 30
      delete_after       = var.backup_monthly_retention_days
    }
  }

  tags = var.common_tags
}

# ──────────────────────────────────────────────
# IAM role for AWS Backup service
# ──────────────────────────────────────────────
data "aws_iam_policy_document" "backup_assume_role" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["backup.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "backup" {
  name               = "${var.project}-${var.environment}-backup-role"
  assume_role_policy = data.aws_iam_policy_document.backup_assume_role.json

  tags = var.common_tags
}

resource "aws_iam_role_policy_attachment" "backup_service" {
  role       = aws_iam_role.backup.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSBackupServiceRolePolicyForBackup"
}

resource "aws_iam_role_policy_attachment" "backup_restore" {
  role       = aws_iam_role.backup.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSBackupServiceRolePolicyForRestores"
}

# ──────────────────────────────────────────────
# Backup selection: Aurora cluster + S3 bucket by tag
# ──────────────────────────────────────────────
resource "aws_backup_selection" "main" {
  name         = "${var.project}-${var.environment}-selection"
  plan_id      = aws_backup_plan.main.id
  iam_role_arn = aws_iam_role.backup.arn

  selection_tag {
    type  = "STRINGEQUALS"
    key   = "BackupEnabled"
    value = "true"
  }

  resources = [
    "arn:aws:rds:${var.aws_region}:${data.aws_caller_identity.current.account_id}:cluster:*",
    "arn:aws:s3:::${var.s3_bucket_name}",
  ]
}

# ──────────────────────────────────────────────
# Vault notifications -> SNS ops-alerts
# ──────────────────────────────────────────────
resource "aws_backup_vault_notifications" "main" {
  backup_vault_name   = aws_backup_vault.main.name
  sns_topic_arn       = var.sns_ops_alerts_arn

  backup_vault_events = [
    "BACKUP_JOB_FAILED",
    "COPY_JOB_FAILED",
    "RESTORE_JOB_FAILED",
  ]
}

output "backup_vault_arn" {
  description = "AWS Backup vault ARN"
  value       = aws_backup_vault.main.arn
}

output "backup_plan_id" {
  description = "AWS Backup plan ID"
  value       = aws_backup_plan.main.id
}
