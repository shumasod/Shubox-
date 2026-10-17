variable "ecs_cluster_name" {
  description = "ECS cluster name for CloudWatch metrics"
  type        = string
}

variable "ecs_service_name" {
  description = "ECS service name for CloudWatch metrics"
  type        = string
}

variable "alb_arn_suffix" {
  description = "ALB ARN suffix (last two segments of the ARN) for CloudWatch metrics"
  type        = string
}

variable "aurora_cluster_id" {
  description = "Aurora DB cluster identifier for CloudWatch metrics"
  type        = string
}

variable "redis_cluster_id" {
  description = "ElastiCache Redis cluster ID for CloudWatch metrics"
  type        = string
}

variable "sns_alert_topic_arn" {
  description = "SNS topic ARN for CloudWatch alarm notifications"
  type        = string
}
