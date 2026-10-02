variable "monthly_budget_usd" {
  description = "Monthly AWS cost budget in USD. Alerts fire at 80% forecast, 100% and 120% actual."
  type        = number
  default     = 500
}
