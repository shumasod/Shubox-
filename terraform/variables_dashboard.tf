variable "ecs_cluster_name" {
  description = "ECS cluster name for dashboard metrics"
  type        = string
}

variable "ecs_service_name" {
  description = "ECS service name for dashboard metrics"
  type        = string
}

variable "alb_arn_suffix" {
  description = "ALB ARN suffix (last part of the ARN) for CloudWatch metrics"
  type        = string
}

variable "aurora_cluster_id" {
  description = "Aurora cluster identifier for CloudWatch metrics"
  type        = string
}

variable "redis_replication_group_id" {
  description = "ElastiCache Redis replication group ID for CloudWatch metrics"
  type        = string
}
