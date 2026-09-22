variable "waf_rate_limit_per_ip" {
  description = "Max requests per IP per 5 minutes before blocking"
  type        = number
  default     = 2000
}

variable "waf_auth_rate_limit" {
  description = "Max auth endpoint requests per IP per 5 minutes"
  type        = number
  default     = 100
}

variable "waf_max_body_size_bytes" {
  description = "Max allowed request body size in bytes for non-upload endpoints"
  type        = number
  default     = 65536
}

variable "waf_log_retention_days" {
  description = "CloudWatch log retention for WAF logs in days"
  type        = number
  default     = 90
}

variable "kms_key_arn_us_east_1" {
  description = "KMS key ARN in us-east-1 for WAF log encryption"
  type        = string
  sensitive   = true
}
