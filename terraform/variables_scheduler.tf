variable "ecs_cluster_arn" {
  description = "ARN of the ECS cluster to run scheduled tasks on"
  type        = string
}

variable "ecs_task_definition_arn" {
  description = "ARN of the ECS task definition to use for scheduled tasks"
  type        = string
}

variable "ecs_security_group_id" {
  description = "Security group ID to attach to scheduled ECS tasks"
  type        = string
}

variable "private_subnet_ids" {
  description = "Private subnet IDs for scheduled ECS task networking"
  type        = list(string)
}
