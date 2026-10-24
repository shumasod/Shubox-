variable "ecr_keep_image_count" {
  description = "Number of tagged images to retain in ECR (older images are expired)"
  type        = number
  default     = 20
}

variable "github_actions_role_arn" {
  description = "IAM role ARN assumed by GitHub Actions OIDC for ECR push"
  type        = string
}

variable "ecs_task_execution_role_arn" {
  description = "ECS task execution role ARN allowed to pull from ECR"
  type        = string
}
