output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "alb_dns_name" {
  description = "ALB の DNS 名"
  value       = aws_lb.main.dns_name
}

output "alb_zone_id" {
  description = "ALB の Route53 Zone ID"
  value       = aws_lb.main.zone_id
}

output "ecs_cluster_name" {
  description = "ECS クラスター名"
  value       = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  description = "ECS サービス名"
  value       = aws_ecs_service.app.name
}

output "ecs_task_execution_role_arn" {
  description = "ECS タスク実行ロール ARN"
  value       = aws_iam_role.ecs_task_execution.arn
}

output "ecs_task_role_arn" {
  description = "ECS タスクロール ARN"
  value       = aws_iam_role.ecs_task.arn
}

output "rds_endpoint" {
  description = "Aurora クラスターエンドポイント"
  value       = aws_rds_cluster.main.endpoint
  sensitive   = true
}

output "rds_reader_endpoint" {
  description = "Aurora リーダーエンドポイント"
  value       = aws_rds_cluster.main.reader_endpoint
  sensitive   = true
}

output "elasticache_endpoint" {
  description = "ElastiCache Redis エンドポイント"
  value       = aws_elasticache_replication_group.redis.primary_endpoint_address
  sensitive   = true
}

output "s3_receipt_bucket" {
  description = "領収書 S3 バケット名"
  value       = aws_s3_bucket.receipts.bucket
}

output "cloudwatch_log_group" {
  description = "CloudWatch ロググループ名"
  value       = "/ecs/${local.prefix}"
}

output "sns_alarm_topic_arn" {
  description = "アラート SNS トピック ARN"
  value       = aws_sns_topic.alarms.arn
}
