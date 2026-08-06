# AWS Backup plan for Aurora MySQL and S3 data protection

resource "aws_backup_vault" "main" {
  name        = "${var.project}-${var.environment}-vault"
  kms_key_arn = aws_kms_key.backup.arn

  tags = local.common_tags
}

resource "aws_backup_vault" "secondary" {
  provider    = aws.secondary_region
  name        = "${var.project}-${var.environment}-vault-secondary"
  kms_key_arn = aws_kms_key.backup_secondary.arn

  tags = local.common_tags
}

resource "aws_kms_key" "backup" {
  description             = "KMS key for AWS Backup vault"
  deletion_window_in_days = 7
  enable_key_rotation     = true
  tags                    = local.common_tags
}

resource "aws_kms_key" "backup_secondary" {
  provider                = aws.secondary_region
  description             = "KMS key for AWS Backup vault (secondary region)"
  deletion_window_in_days = 7
  enable_key_rotation     = true
  tags                    = local.common_tags
}

resource "aws_backup_plan" "main" {
  name = "${var.project}-${var.environment}-backup-plan"

  rule {
    rule_name         = "daily-backup"
    target_vault_name = aws_backup_vault.main.name
    schedule          = "cron(0 2 * * ? *)" # 02:00 UTC daily
    start_window      = 60
    completion_window = 360

    lifecycle {
      cold_storage_after = 30  # move to cold storage after 30 days
      delete_after       = 90  # delete after 90 days total
    }

    copy_action {
      destination_vault_arn = aws_backup_vault.secondary.arn

      lifecycle {
        delete_after = 30
      }
    }
  }

  rule {
    rule_name         = "weekly-backup"
    target_vault_name = aws_backup_vault.main.name
    schedule          = "cron(0 3 ? * SUN *)" # 03:00 UTC every Sunday
    start_window      = 60
    completion_window = 480

    lifecycle {
      cold_storage_after = 90
      delete_after       = 365
    }
  }

  tags = local.common_tags
}

resource "aws_iam_role" "backup" {
  name = "${var.project}-${var.environment}-backup-role"

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

# Assign Aurora cluster to the backup plan
resource "aws_backup_selection" "aurora" {
  name         = "aurora-${var.environment}"
  plan_id      = aws_backup_plan.main.id
  iam_role_arn = aws_iam_role.backup.arn

  resources = [
    aws_rds_cluster.main.arn,
  ]
}

# Assign report S3 bucket to the backup plan
resource "aws_backup_selection" "s3_reports" {
  name         = "s3-reports-${var.environment}"
  plan_id      = aws_backup_plan.main.id
  iam_role_arn = aws_iam_role.backup.arn

  resources = [
    "arn:aws:s3:::${var.project}-${var.environment}-reports",
  ]
}

output "backup_vault_arn" {
  value = aws_backup_vault.main.arn
}

output "backup_plan_id" {
  value = aws_backup_plan.main.id
}
