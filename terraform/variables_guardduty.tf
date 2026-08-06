variable "guardduty_alert_severity_threshold" {
  description = "Minimum GuardDuty finding severity to alert on (4=MEDIUM, 7=HIGH, 8.9=CRITICAL)"
  type        = number
  default     = 7
}
