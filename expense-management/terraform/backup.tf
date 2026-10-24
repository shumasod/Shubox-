# IAM role for AWS Backup
resource "aws_iam_role" "backup" {
  name = "${local.name_prefix}-backup-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "backup.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "backup" {
  role       = aws_iam_role.backup.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSBackupServiceRolePolicyForBackup"
}

resource "aws_iam_role_policy_attachment" "backup_restore" {
  role       = aws_iam_role.backup.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSBackupServiceRolePolicyForRestores"
}

# Backup vault
resource "aws_backup_vault" "main" {
  name        = "${local.name_prefix}-vault"
  kms_key_arn = aws_kms_key.main.arn

  tags = local.common_tags
}

resource "aws_backup_vault_lock_configuration" "main" {
  backup_vault_name   = aws_backup_vault.main.name
  changeable_for_days = 3
  max_retention_days  = 366
  min_retention_days  = 7
}

# Backup plan
resource "aws_backup_plan" "main" {
  name = "${local.name_prefix}-backup-plan"

  rule {
    rule_name         = "daily-7days"
    target_vault_name = aws_backup_vault.main.name
    schedule          = "cron(0 18 * * ? *)" # 03:00 JST
    start_window      = 60
    completion_window = 180

    lifecycle {
      delete_after = 7
    }
  }

  rule {
    rule_name         = "weekly-30days"
    target_vault_name = aws_backup_vault.main.name
    schedule          = "cron(0 18 ? * SUN *)" # Sunday 03:00 JST
    start_window      = 60
    completion_window = 360

    lifecycle {
      delete_after = 30
    }
  }

  rule {
    rule_name         = "monthly-365days"
    target_vault_name = aws_backup_vault.main.name
    schedule          = "cron(0 18 1 * ? *)" # 1st of month 03:00 JST
    start_window      = 60
    completion_window = 480

    lifecycle {
      cold_storage_after = 30
      delete_after       = 365
    }
  }

  tags = local.common_tags
}

# Backup selection — RDS cluster
resource "aws_backup_selection" "rds" {
  name         = "${local.name_prefix}-rds"
  plan_id      = aws_backup_plan.main.id
  iam_role_arn = aws_iam_role.backup.arn

  resources = [aws_rds_cluster.main.arn]
}

# Backup selection — S3 receipts bucket
resource "aws_backup_selection" "s3" {
  name         = "${local.name_prefix}-s3"
  plan_id      = aws_backup_plan.main.id
  iam_role_arn = aws_iam_role.backup.arn

  resources = [aws_s3_bucket.receipts.arn]
}

# KMS key (shared with other encrypted resources)
resource "aws_kms_key" "main" {
  description             = "${local.name_prefix} backup encryption key"
  deletion_window_in_days = 7
  enable_key_rotation     = true

  tags = local.common_tags
}

resource "aws_kms_alias" "main" {
  name          = "alias/${local.name_prefix}-backup"
  target_key_id = aws_kms_key.main.key_id
}
