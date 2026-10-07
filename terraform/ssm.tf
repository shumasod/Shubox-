# ──────────────────────────────────────────────
# Application secrets (SecureString, KMS-encrypted)
# Values are placeholders - set via CI/CD or console after apply
# ──────────────────────────────────────────────
resource "aws_ssm_parameter" "app_key" {
  name        = "/${var.project}/${var.environment}/APP_KEY"
  description = "Laravel application encryption key"
  type        = "SecureString"
  value       = var.app_key
  key_id      = var.kms_key_arn

  lifecycle {
    ignore_changes = [value]
  }

  tags = var.common_tags
}

resource "aws_ssm_parameter" "db_password" {
  name        = "/${var.project}/${var.environment}/DB_PASSWORD"
  description = "Aurora MySQL master password"
  type        = "SecureString"
  value       = var.db_password
  key_id      = var.kms_key_arn

  lifecycle {
    ignore_changes = [value]
  }

  tags = var.common_tags
}

resource "aws_ssm_parameter" "redis_auth_token" {
  name        = "/${var.project}/${var.environment}/REDIS_PASSWORD"
  description = "ElastiCache Redis AUTH token"
  type        = "SecureString"
  value       = var.redis_auth_token
  key_id      = var.kms_key_arn

  lifecycle {
    ignore_changes = [value]
  }

  tags = var.common_tags
}

resource "aws_ssm_parameter" "mail_password" {
  name        = "/${var.project}/${var.environment}/MAIL_PASSWORD"
  description = "SES SMTP password"
  type        = "SecureString"
  value       = var.mail_password
  key_id      = var.kms_key_arn

  lifecycle {
    ignore_changes = [value]
  }

  tags = var.common_tags
}

# ──────────────────────────────────────────────
# Non-secret config parameters (String type)
# ──────────────────────────────────────────────
resource "aws_ssm_parameter" "app_url" {
  name  = "/${var.project}/${var.environment}/APP_URL"
  type  = "String"
  value = var.app_url

  tags = var.common_tags
}

resource "aws_ssm_parameter" "app_env" {
  name  = "/${var.project}/${var.environment}/APP_ENV"
  type  = "String"
  value = var.environment

  tags = var.common_tags
}

resource "aws_ssm_parameter" "db_host" {
  name  = "/${var.project}/${var.environment}/DB_HOST"
  type  = "String"
  value = var.db_host

  tags = var.common_tags
}

resource "aws_ssm_parameter" "redis_host" {
  name  = "/${var.project}/${var.environment}/REDIS_HOST"
  type  = "String"
  value = var.redis_host

  tags = var.common_tags
}

resource "aws_ssm_parameter" "s3_bucket" {
  name  = "/${var.project}/${var.environment}/AWS_BUCKET"
  type  = "String"
  value = var.s3_bucket_name

  tags = var.common_tags
}

# ──────────────────────────────────────────────
# IAM policy for ECS task to read SSM parameters
# ──────────────────────────────────────────────
data "aws_iam_policy_document" "ssm_read" {
  statement {
    effect = "Allow"
    actions = [
      "ssm:GetParameter",
      "ssm:GetParameters",
      "ssm:GetParametersByPath",
    ]
    resources = [
      "arn:aws:ssm:${var.aws_region}:${data.aws_caller_identity.current.account_id}:parameter/${var.project}/${var.environment}/*",
    ]
  }

  statement {
    effect    = "Allow"
    actions   = ["kms:Decrypt"]
    resources = [var.kms_key_arn]
  }
}

resource "aws_iam_policy" "ssm_read" {
  name        = "${var.project}-${var.environment}-ssm-read"
  description = "Allow ECS task execution role to read SSM parameters"
  policy      = data.aws_iam_policy_document.ssm_read.json

  tags = var.common_tags
}

output "ssm_parameter_prefix" {
  description = "SSM parameter path prefix for the application"
  value       = "/${var.project}/${var.environment}"
}

output "ssm_read_policy_arn" {
  description = "IAM policy ARN for reading SSM parameters (attach to ECS task execution role)"
  value       = aws_iam_policy.ssm_read.arn
}
