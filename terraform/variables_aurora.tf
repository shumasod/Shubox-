variable "aurora_db_name" {
  description = "Name of the default database to create"
  type        = string
  default     = "expense_db"
}

variable "aurora_master_username" {
  description = "Aurora master username"
  type        = string
  default     = "admin"
}

variable "aurora_backup_retention_days" {
  description = "Aurora automated backup retention period in days"
  type        = number
  default     = 7
}

variable "aurora_deletion_protection" {
  description = "Enable deletion protection for the Aurora cluster"
  type        = bool
  default     = true
}

variable "aurora_min_acu" {
  description = "Minimum Aurora Capacity Units for Serverless v2"
  type        = number
  default     = 0.5
}

variable "aurora_max_acu" {
  description = "Maximum Aurora Capacity Units for Serverless v2"
  type        = number
  default     = 16
}

variable "aurora_reader_count" {
  description = "Number of Aurora reader instances"
  type        = number
  default     = 1
}

variable "ecs_security_group_id" {
  description = "Security group ID of ECS tasks (allowed to connect to Aurora)"
  type        = string
}
