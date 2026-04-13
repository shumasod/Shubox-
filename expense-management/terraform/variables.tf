variable "project" {
  description = "プロジェクト名"
  type        = string
  default     = "expense"
}

variable "environment" {
  description = "環境 (prod, staging, dev)"
  type        = string
  validation {
    condition     = contains(["prod", "staging", "dev"], var.environment)
    error_message = "environment must be one of: prod, staging, dev"
  }
}

variable "aws_region" {
  description = "AWS リージョン"
  type        = string
  default     = "ap-northeast-1"
}

variable "vpc_cidr" {
  description = "VPC CIDR"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "使用するAZ"
  type        = list(string)
  default     = ["ap-northeast-1a", "ap-northeast-1c", "ap-northeast-1d"]
}

variable "private_subnets" {
  type    = list(string)
  default = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "public_subnets" {
  type    = list(string)
  default = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
}

variable "database_subnets" {
  type    = list(string)
  default = ["10.0.201.0/24", "10.0.202.0/24", "10.0.203.0/24"]
}

variable "acm_certificate_arn" {
  description = "ACM 証明書 ARN"
  type        = string
}

variable "ecr_repository_url" {
  description = "ECR リポジトリURL"
  type        = string
}

variable "image_tag" {
  description = "Dockerイメージタグ"
  type        = string
  default     = "latest"
}

variable "task_cpu" {
  description = "ECSタスクCPU (vCPU * 1024)"
  type        = number
  default     = 512
}

variable "task_memory" {
  description = "ECSタスクメモリ (MB)"
  type        = number
  default     = 1024
}

variable "desired_count" {
  description = "ECSサービスの希望タスク数"
  type        = number
  default     = 2
}

variable "min_capacity" {
  description = "Auto Scalingの最小タスク数"
  type        = number
  default     = 1
}

variable "max_capacity" {
  description = "Auto Scalingの最大タスク数"
  type        = number
  default     = 10
}

variable "db_name" {
  description = "データベース名"
  type        = string
  default     = "expense_db"
}

variable "db_username" {
  description = "データベースユーザー名"
  type        = string
  default     = "expense"
}

variable "redis_node_type" {
  description = "Elasticache Redisノードタイプ"
  type        = string
  default     = "cache.t4g.micro"
}

variable "error_rate_threshold" {
  description = "APIエラーレートアラームの閾値（件数/5分）"
  type        = number
  default     = 10
}

variable "slack_webhook_url" {
  description = "Slackアラート用Webhook URL"
  type        = string
  sensitive   = true
}
