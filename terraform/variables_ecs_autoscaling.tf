variable "ecs_min_capacity" {
  description = "Minimum number of ECS tasks (off-peak and weekend)"
  type        = number
  default     = 1
}

variable "ecs_max_capacity" {
  description = "Maximum number of ECS tasks allowed by auto scaling"
  type        = number
  default     = 10
}

variable "ecs_business_hours_min_capacity" {
  description = "Minimum ECS tasks during business hours (Mon-Fri 09:00-20:00 JST)"
  type        = number
  default     = 2
}

variable "ecs_cpu_target_value" {
  description = "Target CPU utilization percentage for ECS auto scaling"
  type        = number
  default     = 70
}

variable "ecs_memory_target_value" {
  description = "Target memory utilization percentage for ECS auto scaling"
  type        = number
  default     = 75
}
