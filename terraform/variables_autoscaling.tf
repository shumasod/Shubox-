variable "ecs_min_capacity" {
  description = "Minimum number of ECS tasks"
variable "autoscaling_min_capacity" {
  description = "Minimum number of ECS tasks during off-hours"
  type        = number
  default     = 1
}

variable "autoscaling_max_capacity" {
  description = "Maximum number of ECS tasks the service can scale to"
  type        = number
  default     = 10
}

variable "autoscaling_business_hours_min" {
  description = "Minimum tasks during business hours (JST 08:00–22:00)"
  type        = number
  default     = 2
}

variable "ecs_max_capacity" {
  description = "Maximum number of ECS tasks"
  type        = number
  default     = 20
}

variable "ecs_cpu_target_value" {
  description = "Target CPU utilization percentage for ECS auto-scaling"
variable "autoscaling_cpu_target" {
  description = "Target CPU utilization percentage for scale-out (0–100)"
  type        = number
  default     = 60
}

variable "autoscaling_memory_target" {
  description = "Target memory utilization percentage for scale-out (0–100)"
  type        = number
  default     = 70
}

variable "ecs_memory_target_value" {
  description = "Target memory utilization percentage for ECS auto-scaling"
  type        = number
  default     = 80
}

variable "enable_scheduled_scaling" {
  description = "Enable scheduled scale-up/down for business hours (JST)"
  type        = bool
  default     = true
}

variable "ecs_business_hours_min" {
  description = "Minimum ECS tasks during business hours (JST 08:00-20:00)"
  type        = number
  default     = 4
variable "autoscaling_scale_in_cooldown" {
  description = "Seconds to wait after a scale-in event before allowing another"
  type        = number
  default     = 300
}

variable "autoscaling_scale_out_cooldown" {
  description = "Seconds to wait after a scale-out event before allowing another"
  type        = number
  default     = 60
}

variable "autoscaling_request_count_threshold" {
  description = "ALB RequestCountPerTarget threshold that triggers ops alert"
  type        = number
  default     = 1000
}
