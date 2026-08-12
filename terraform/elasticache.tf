# ── Subnet Group ──────────────────────────────────────────────────────────────────
resource "aws_elasticache_subnet_group" "redis" {
  name       = "${var.project}-${var.environment}-redis"
  subnet_ids = var.private_subnet_ids

  tags = merge(var.common_tags, { Name = "${var.project}-${var.environment}-redis" })
}

# ── Security Group ───────────────────────────────────────────────────────────
resource "aws_security_group" "redis" {
  name        = "${var.project}-${var.environment}-redis"
  description = "ElastiCache Redis security group"
  vpc_id      = var.vpc_id

  ingress {
    description     = "Redis from ECS tasks"
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [var.ecs_security_group_id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.common_tags, { Name = "${var.project}-${var.environment}-redis" })
}

# ── KMS Key ────────────────────────────────────────────────────────────────────
resource "aws_kms_key" "redis" {
  description             = "KMS key for ElastiCache Redis encryption at rest"
  deletion_window_in_days = 14
  enable_key_rotation     = true

  tags = merge(var.common_tags, { Name = "${var.project}-${var.environment}-redis-kms" })
}

resource "aws_kms_alias" "redis" {
  name          = "alias/${var.project}-${var.environment}-redis"
  target_key_id = aws_kms_key.redis.key_id
}

# ── Parameter Group ───────────────────────────────────────────────────────────
resource "aws_elasticache_parameter_group" "redis" {
  name   = "${var.project}-${var.environment}-redis7"
  family = "redis7"

  parameter {
    name  = "maxmemory-policy"
    value = "allkeys-lru"
  }
  parameter {
    name  = "notify-keyspace-events"
    value = "" # disable keyspace notifications in production
  }
  parameter {
    name  = "tcp-keepalive"
    value = "300"
  }

  tags = var.common_tags
}

# ── Replication Group (Redis Cluster with auto-failover) ────────────────────────
resource "aws_elasticache_replication_group" "redis" {
  replication_group_id = "${var.project}-${var.environment}"
  description          = "${var.project} ${var.environment} Redis cluster"

  engine               = "redis"
  engine_version       = "7.1"
  node_type            = var.redis_node_type
  num_cache_clusters   = var.redis_num_cache_nodes
  parameter_group_name = aws_elasticache_parameter_group.redis.name
  subnet_group_name    = aws_elasticache_subnet_group.redis.name
  security_group_ids   = [aws_security_group.redis.id]

  automatic_failover_enabled  = true
  multi_az_enabled            = true
  at_rest_encryption_enabled  = true
  transit_encryption_enabled  = true
  kms_key_id                  = aws_kms_key.redis.arn
  auth_token                  = var.redis_auth_token
  auth_token_update_strategy  = "ROTATE"

  snapshot_retention_limit     = 1
  snapshot_window              = "17:00-18:00" # 02:00 JST
  maintenance_window           = "sun:18:30-sun:19:30"

  apply_immediately = false
  auto_minor_version_upgrade = true

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

  tags = merge(var.common_tags, { Name = "${var.project}-${var.environment}-redis" })
}

resource "aws_cloudwatch_log_group" "redis_slow_log" {
  name              = "/elasticache/${var.project}-${var.environment}/slow-log"
  retention_in_days = 30
  tags              = var.common_tags
}

resource "aws_cloudwatch_log_group" "redis_engine_log" {
  name              = "/elasticache/${var.project}-${var.environment}/engine-log"
  retention_in_days = 14
  tags              = var.common_tags
}

# ── Outputs ────────────────────────────────────────────────────────────────────
output "redis_primary_endpoint" {
  description = "Redis primary endpoint address"
  value       = aws_elasticache_replication_group.redis.primary_endpoint_address
}

output "redis_reader_endpoint" {
  description = "Redis reader endpoint address"
  value       = aws_elasticache_replication_group.redis.reader_endpoint_address
}

output "redis_port" {
  description = "Redis port"
  value       = aws_elasticache_replication_group.redis.port
}
