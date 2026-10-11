variable "app_key" {
  description = "Laravel APP_KEY (base64:... format). Set via TF_VAR_app_key env var — never commit."
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Aurora MySQL master password. Set via TF_VAR_db_password env var."
  type        = string
  sensitive   = true
}

variable "redis_password" {
  description = "ElastiCache Redis AUTH token. Set via TF_VAR_redis_password env var."
  type        = string
  sensitive   = true
}

variable "ses_smtp_password" {
  description = "SES SMTP password. Set via TF_VAR_ses_smtp_password env var."
  type        = string
  sensitive   = true
  default     = ""
}
