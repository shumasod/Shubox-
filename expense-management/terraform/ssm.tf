# Application secrets stored as SecureString in SSM
resource "aws_ssm_parameter" "app_key" {
  name        = "/${local.name_prefix}/app-key"
  type        = "SecureString"
  value       = var.app_key
  description = "Laravel APP_KEY — rotate via artisan key:generate"
  key_id      = aws_kms_key.ssm.arn
  tags        = local.common_tags

  lifecycle {
    ignore_changes = [value]
  }
}

resource "aws_ssm_parameter" "db_password" {
  name        = "/${local.name_prefix}/db-password"
  type        = "SecureString"
  value       = var.db_password
  description = "Aurora MySQL master password"
  key_id      = aws_kms_key.ssm.arn
  tags        = local.common_tags

  lifecycle {
    ignore_changes = [value]
  }
}

resource "aws_ssm_parameter" "redis_password" {
  name        = "/${local.name_prefix}/redis-password"
  type        = "SecureString"
  value       = var.redis_password
  description = "ElastiCache Redis AUTH token"
  key_id      = aws_kms_key.ssm.arn
  tags        = local.common_tags

  lifecycle {
    ignore_changes = [value]
  }
}

resource "aws_ssm_parameter" "ses_smtp_password" {
  name        = "/${local.name_prefix}/ses-smtp-password"
  type        = "SecureString"
  value       = var.ses_smtp_password
  description = "SES SMTP password for Laravel Mail"
  key_id      = aws_kms_key.ssm.arn
  tags        = local.common_tags

  lifecycle {
    ignore_changes = [value]
  }
}

# Non-secret config parameters (String type)
resource "aws_ssm_parameter" "app_url" {
  name  = "/${local.name_prefix}/app-url"
  type  = "String"
  value = "https://${var.domain_name}"
  tags  = local.common_tags
}

resource "aws_ssm_parameter" "db_host" {
  name  = "/${local.name_prefix}/db-host"
  type  = "String"
  value = aws_rds_cluster.main.endpoint
  tags  = local.common_tags
}

resource "aws_ssm_parameter" "redis_host" {
  name  = "/${local.name_prefix}/redis-host"
  type  = "String"
  value = aws_elasticache_replication_group.main.primary_endpoint_address
  tags  = local.common_tags
}

# KMS key for SSM SecureString parameters
resource "aws_kms_key" "ssm" {
  description             = "${local.name_prefix} SSM parameter encryption key"
  deletion_window_in_days = 7
  enable_key_rotation     = true
  tags                    = local.common_tags
}

resource "aws_kms_alias" "ssm" {
  name          = "alias/${local.name_prefix}-ssm"
  target_key_id = aws_kms_key.ssm.key_id
}

# IAM policy to allow ECS task role to read these parameters
resource "aws_iam_policy" "ssm_read" {
  name        = "${local.name_prefix}-ssm-read"
  description = "Allow ECS tasks to read app secrets from SSM"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["ssm:GetParameter", "ssm:GetParameters", "ssm:GetParametersByPath"]
        Resource = "arn:aws:ssm:${var.aws_region}:*:parameter/${local.name_prefix}/*"
      },
      {
        Effect   = "Allow"
        Action   = ["kms:Decrypt"]
        Resource = aws_kms_key.ssm.arn
      },
    ]
  })

  tags = local.common_tags
}
