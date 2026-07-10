variable "app_key" {
  description = "Laravel APP_KEY (base64: prefix + 32 random bytes)"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Aurora MySQL master user password"
  type        = string
  sensitive   = true
}

variable "redis_auth_token" {
  description = "ElastiCache Redis AUTH token (min 16 chars)"
  type        = string
  sensitive   = true
}

variable "slack_webhook_url" {
  description = "Slack incoming webhook URL"
  type        = string
  sensitive   = true
  default     = ""
}

variable "aurora_cluster_endpoint" {
  description = "Aurora cluster writer endpoint (set after aurora module creates it)"
  type        = string
  default     = ""
}
