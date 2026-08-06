variable "vpc_id" {
  description = "VPC ID to enable flow logging on"
  type        = string
}

variable "flow_log_retention_days" {
  description = "CloudWatch log retention in days for VPC flow logs"
  type        = number
  default     = 90
}

variable "rejected_traffic_threshold" {
  description = "Rejected packet count per 5 minutes before alarming"
  type        = number
  default     = 10000
}
