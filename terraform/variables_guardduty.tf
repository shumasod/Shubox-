variable "security_alert_email" {
  description = "Email address for GuardDuty high-severity finding alerts (leave empty to skip subscription)"
  type        = string
  default     = ""
}
