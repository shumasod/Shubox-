variable "alarm_ecs_cpu_threshold" {
  description = "ECS CPU utilization % threshold for alarm"
  type        = number
  default     = 80
}

variable "alarm_ecs_memory_threshold" {
  description = "ECS memory utilization % threshold for alarm"
  type        = number
  default     = 85
}

variable "alarm_aurora_connections_threshold" {
  description = "Aurora maximum connection count threshold"
  type        = number
  default     = 800
}

variable "alarm_aurora_replica_lag_ms" {
  description = "Aurora replica lag threshold in milliseconds"
  type        = number
  default     = 1000
}

variable "alarm_redis_evictions_threshold" {
  description = "Redis eviction count threshold per minute"
  type        = number
  default     = 0
}

variable "alarm_redis_memory_threshold" {
  description = "Redis memory usage % threshold"
  type        = number
  default     = 80
}

variable "alarm_alb_5xx_threshold" {
  description = "ALB 5xx error count per minute threshold"
  type        = number
  default     = 10
}

variable "alarm_alb_latency_seconds" {
  description = "ALB p95 response time threshold in seconds"
  type        = number
  default     = 3
}

variable "ecs_cluster_name" {
  description = "ECS cluster name for alarm dimensions"
  type        = string
}

variable "ecs_service_name" {
  description = "ECS service name for alarm dimensions"
  type        = string
}

variable "aurora_cluster_identifier" {
  description = "Aurora DB cluster identifier for alarm dimensions"
  type        = string
}

variable "redis_replication_group_id" {
  description = "ElastiCache replication group ID for alarm dimensions"
  type        = string
}

variable "alb_arn_suffix" {
  description = "ALB ARN suffix for alarm dimensions (e.g. app/my-alb/1234567890)"
  type        = string
}

variable "sns_ops_alerts_arn" {
  description = "SNS topic ARN for operational alerts"
  type        = string
}
