# ---------------------------------------------------------------------------
# AWS Backup — automated backup plan for Aurora RDS
# ---------------------------------------------------------------------------

resource "aws_backup_vault" "main" {
  name        = "${var.project}-${var.environment}-backup-vault"
  kms_key_arn = aws_kms_key.backup.arn

  tags = { Project = var.project, Environment = var.environment }
}

resource "aws_kms_key" "backup" {
  description             = "KMS key for AWS Backup vault encryption"
  deletion_window_in_days = 7
  enable_key_rotation     = true

  tags = { Project = var.project, Environment = var.environment }
}

resource "aws_kms_alias" "backup" {
  name          = "alias/${var.project}-${var.environment}-backup"
  target_key_id = aws_kms_key.backup.key_id
}

resource "aws_backup_plan" "main" {
  name = "${var.project}-${var.environment}-backup-plan"

  # Daily backups — retain for 30 days
  rule {
    rule_name         = "daily-30d"
    target_vault_name = aws_backup_vault.main.name
    schedule          = "cron(0 17 * * ? *)"  # 02:00 JST
    start_window      = 60
    completion_window = 120

    lifecycle {
      delete_after = 30
    }

    recovery_point_tags = {
      BackupFrequency = "daily"
      Project         = var.project
    }
  }

  # Weekly backups — retain for 90 days
  rule {
    rule_name         = "weekly-90d"
    target_vault_name = aws_backup_vault.main.name
    schedule          = "cron(0 17 ? * SUN *)"  # Sunday 02:00 JST
    start_window      = 60
    completion_window = 180

    lifecycle {
      delete_after = 90
    }

    recovery_point_tags = {
      BackupFrequency = "weekly"
      Project         = var.project
    }
  }

  # Monthly backups — retain for 365 days
  rule {
    rule_name         = "monthly-365d"
    target_vault_name = aws_backup_vault.main.name
    schedule          = "cron(0 17 1 * ? *)"  # 1st of month 02:00 JST
    start_window      = 60
    completion_window = 300

    lifecycle {
      cold_storage_after = 30
      delete_after       = 365
    }

    recovery_point_tags = {
      BackupFrequency = "monthly"
      Project         = var.project
    }
  }

  tags = { Project = var.project, Environment = var.environment }
}

# IAM role for AWS Backup
data "aws_iam_policy_document" "backup_assume" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["backup.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "aws_backup" {
  name               = "${var.project}-${var.environment}-aws-backup"
  assume_role_policy = data.aws_iam_policy_document.backup_assume.json

  managed_policy_arns = ["arn:aws:iam::aws:policy/service-role/AWSBackupServiceRolePolicyForBackup"]

  tags = { Project = var.project, Environment = var.environment }
}

# Assign Aurora cluster to the backup plan
resource "aws_backup_selection" "aurora" {
  name         = "aurora-cluster"
  plan_id      = aws_backup_plan.main.id
  iam_role_arn = aws_iam_role.aws_backup.arn

  resources = [var.aurora_cluster_arn]
}

# CloudWatch alarm for failed backup jobs
resource "aws_cloudwatch_metric_alarm" "backup_failed" {
  alarm_name          = "${var.project}-${var.environment}-backup-job-failed"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "NumberOfBackupJobsFailed"
  namespace           = "AWS/Backup"
  period              = 86400
  statistic           = "Sum"
  threshold           = 0
  alarm_description   = "One or more backup jobs failed in the last 24 hours"
  alarm_actions       = [aws_sns_topic.ses_bounces.arn]
  treat_missing_data  = "notBreaching"
}
