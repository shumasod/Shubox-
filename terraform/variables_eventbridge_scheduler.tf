variable "scheduler_enabled" {
  description = "Whether EventBridge Scheduler schedules are ENABLED (set false in dev to avoid unintended runs)"
  type        = bool
  default     = true
}
