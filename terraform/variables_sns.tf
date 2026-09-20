variable "ops_alert_emails" {
  description = "List of email addresses to subscribe to the ops-alerts SNS topic"
  type        = list(string)
  default     = []
}
