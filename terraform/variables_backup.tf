variable "backup_secondary_region" {
  description = "AWS region for cross-region backup copies"
  type        = string
  default     = "ap-northeast-3"
}

variable "backup_cold_storage_days" {
  description = "Days after which daily backups are moved to cold storage"
  type        = number
  default     = 30
}

variable "backup_retention_days" {
  description = "Days after which daily backups are deleted"
  type        = number
  default     = 90
}
