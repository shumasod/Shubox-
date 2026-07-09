variable "db_name" {
  description = "Aurora database name"
  type        = string
  default     = "expense_management"
}

variable "db_username" {
  description = "Aurora master username"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Aurora master password (managed via lifecycle ignore_changes)"
  type        = string
  sensitive   = true
}

variable "aurora_min_acu" {
  description = "Minimum Aurora Serverless v2 ACU capacity"
  type        = number
  default     = 0.5
}

variable "aurora_max_acu" {
  description = "Maximum Aurora Serverless v2 ACU capacity"
  type        = number
  default     = 16
}

variable "aurora_reader_count" {
  description = "Number of Aurora read replicas"
  type        = number
  default     = 1
}

variable "aurora_deletion_protection" {
  description = "Enable deletion protection on the Aurora cluster"
  type        = bool
  default     = true
}
