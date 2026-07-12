variable "backup_daily_retention_days" {
  description = "Retention period for daily backups in days"
  type        = number
  default     = 14
}

variable "backup_weekly_retention_days" {
  description = "Retention period for weekly backups in days"
  type        = number
  default     = 60
}

variable "backup_monthly_retention_days" {
  description = "Retention period for monthly backups in days (moved to cold storage after 30d)"
  type        = number
  default     = 365
}
