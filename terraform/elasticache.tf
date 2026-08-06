resource "aws_elasticache_subnet_group" "main" {
  name       = "${var.project_name}-redis-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = var.common_tags
}

resource "aws_security_group" "redis" {
  name        = "${var.project_name}-redis-sg"
  description = "ElastiCache Redis security group"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "Redis from ECS tasks"
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.common_tags, { Name = "${var.project_name}-redis-sg" })
}

resource "aws_kms_key" "redis" {
  description             = "KMS key for ElastiCache Redis encryption at rest"
  deletion_window_in_days = 7
  enable_key_rotation     = true

  tags = merge(var.common_tags, { Name = "${var.project_name}-redis-kms" })
}

resource "aws_kms_alias" "redis" {
  name          = "alias/${var.project_name}-redis"
  target_key_id = aws_kms_key.redis.key_id
}

resource "aws_elasticache_replication_group" "main" {
  replication_group_id = "${var.project_name}-redis"
  description          = "Redis replication group for ${var.project_name}"

  node_type            = var.redis_node_type
  num_cache_clusters   = var.redis_num_replicas + 1
  engine_version       = "7.1"
  port                 = 6379

  subnet_group_name  = aws_elasticache_subnet_group.main.name
  security_group_ids = [aws_security_group.redis.id]

  # Encryption
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  kms_key_id                 = aws_kms_key.redis.arn
  auth_token                 = var.redis_auth_token

  # High availability
  automatic_failover_enabled = var.redis_num_replicas >= 1
  multi_az_enabled           = var.redis_num_replicas >= 1

  # Maintenance
  maintenance_window       = "sun:02:00-sun:04:00"
  snapshot_window          = "00:00-02:00"
  snapshot_retention_limit = 7

  # Logging
  log_delivery_configuration {
    destination      = aws_cloudwatch_log_group.redis_slow_log.name
    destination_type = "cloudwatch-logs"
    log_format       = "json"
    log_type         = "slow-log"
  }

  log_delivery_configuration {
    destination      = aws_cloudwatch_log_group.redis_engine_log.name
    destination_type = "cloudwatch-logs"
    log_format       = "json"
    log_type         = "engine-log"
  }

  apply_immediately          = false
  auto_minor_version_upgrade = true

  tags = var.common_tags
}

resource "aws_cloudwatch_log_group" "redis_slow_log" {
  name              = "/elasticache/${var.project_name}/slow-log"
  retention_in_days = 30
  tags              = var.common_tags
}

resource "aws_cloudwatch_log_group" "redis_engine_log" {
  name              = "/elasticache/${var.project_name}/engine-log"
  retention_in_days = 14
  tags              = var.common_tags
}

output "redis_primary_endpoint" {
  description = "Redis primary endpoint address"
  value       = aws_elasticache_replication_group.main.primary_endpoint_address
  sensitive   = true
}

output "redis_reader_endpoint" {
  description = "Redis reader endpoint address"
  value       = aws_elasticache_replication_group.main.reader_endpoint_address
  sensitive   = true
}
