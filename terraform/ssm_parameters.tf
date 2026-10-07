# ---------------------------------------------------------------------------
# SSM Parameter Store — application secrets and runtime config
# ---------------------------------------------------------------------------

locals {
  ssm_prefix = "/${var.project}/${var.environment}"
}

# KMS key for SecureString parameters
resource "aws_kms_key" "ssm" {
  description             = "KMS key for SSM Parameter Store"
  deletion_window_in_days = 7
  enable_key_rotation     = true

  tags = {
    Project     = var.project
    Environment = var.environment
  }
}

resource "aws_kms_alias" "ssm" {
  name          = "alias/${var.project}-${var.environment}-ssm"
  target_key_id = aws_kms_key.ssm.key_id
}

# Application secrets (values must be provided via tfvars or AWS Secrets Manager)
resource "aws_ssm_parameter" "app_key" {
  name        = "${local.ssm_prefix}/app/APP_KEY"
  type        = "SecureString"
  value       = var.app_key
  key_id      = aws_kms_key.ssm.key_id
  description = "Laravel application encryption key"

  tags = { Project = var.project, Environment = var.environment }
}

resource "aws_ssm_parameter" "db_password" {
  name        = "${local.ssm_prefix}/db/DB_PASSWORD"
  type        = "SecureString"
  value       = var.db_password
  key_id      = aws_kms_key.ssm.key_id
  description = "Aurora MySQL master password"

  tags = { Project = var.project, Environment = var.environment }
}

resource "aws_ssm_parameter" "redis_auth" {
  name        = "${local.ssm_prefix}/cache/REDIS_PASSWORD"
  type        = "SecureString"
  value       = var.redis_auth_token
  key_id      = aws_kms_key.ssm.key_id
  description = "ElastiCache Redis AUTH token"

  tags = { Project = var.project, Environment = var.environment }
}

resource "aws_ssm_parameter" "slack_webhook" {
  name        = "${local.ssm_prefix}/integrations/SLACK_WEBHOOK_URL"
  type        = "SecureString"
  value       = var.slack_webhook_url
  key_id      = aws_kms_key.ssm.key_id
  description = "Slack incoming webhook URL for notifications"

  tags = { Project = var.project, Environment = var.environment }
}

# Non-secret config (String type)
resource "aws_ssm_parameter" "app_url" {
  name        = "${local.ssm_prefix}/app/APP_URL"
  type        = "String"
  value       = "https://${var.app_domain}"
  description = "Application base URL"

  tags = { Project = var.project, Environment = var.environment }
}

resource "aws_ssm_parameter" "db_host" {
  name        = "${local.ssm_prefix}/db/DB_HOST"
  type        = "String"
  value       = var.aurora_cluster_endpoint
  description = "Aurora cluster writer endpoint"

  tags = { Project = var.project, Environment = var.environment }
}

# IAM policy for ECS task role to read parameters
resource "aws_iam_policy" "ssm_read" {
  name        = "${var.project}-${var.environment}-ssm-read"
  description = "Allow reading SSM parameters for this environment"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "ReadParameters"
        Effect = "Allow"
        Action = [
          "ssm:GetParameter",
          "ssm:GetParameters",
          "ssm:GetParametersByPath",
        ]
        Resource = "arn:aws:ssm:${var.aws_region}:*:parameter${local.ssm_prefix}/*"
      },
      {
        Sid      = "DecryptSSMParameters"
        Effect   = "Allow"
        Action   = ["kms:Decrypt"]
        Resource = aws_kms_key.ssm.arn
      }
    ]
  })
}
