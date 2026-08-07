variable "budget_alert_emails" {
  description = "Email addresses to subscribe to budget alert SNS topic"
  type        = list(string)
  default     = []
}
