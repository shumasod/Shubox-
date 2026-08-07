variable "lambda_report_memory_mb" {
  description = "Memory in MB allocated to the report generator Lambda"
  type        = number
  default     = 1024
}

variable "lambda_report_timeout_seconds" {
  description = "Maximum execution time for the report generator Lambda in seconds"
  type        = number
  default     = 900
}

variable "report_s3_retention_days" {
  description = "Days before generated reports are automatically deleted from S3"
  type        = number
  default     = 90
}

variable "scheduled_reports_enabled" {
  description = "Whether the monthly scheduled report EventBridge rule is enabled"
  type        = bool
  default     = true
}

variable "ses_from_address" {
  description = "SES sender address used by the report generator Lambda for notifications"
  type        = string
}
