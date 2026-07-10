variable "app_key" {
  description = "Laravel APP_KEY (base64-encoded 32-byte key)"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Aurora MySQL master user password"
  type        = string
  sensitive   = true
}

variable "redis_auth_token" {
  description = "ElastiCache Redis AUTH token"
  type        = string
  sensitive   = true
}

variable "mail_password" {
  description = "SES SMTP password / mail provider credential"
  type        = string
  sensitive   = true
}

variable "app_url" {
  description = "Application base URL (e.g. https://app.example.com)"
  type        = string
}

variable "db_host" {
  description = "Aurora cluster endpoint hostname"
  type        = string
}

variable "redis_host" {
  description = "ElastiCache primary endpoint hostname"
  type        = string
}

variable "s3_bucket_name" {
  description = "S3 bucket name for application file storage"
  type        = string
}

variable "kms_key_arn" {
  description = "KMS key ARN for SSM SecureString encryption"
  type        = string
  sensitive   = true
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-northeast-1"
}
