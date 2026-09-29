# ── DB Subnet Group ────────────────────────────────────────────────────────────
resource "aws_db_subnet_group" "aurora" {
  name       = "${var.project}-${var.environment}-aurora"
  subnet_ids = var.private_subnet_ids

  tags = merge(var.common_tags, { Name = "${var.project}-${var.environment}-aurora" })
}

# ── KMS Key ────────────────────────────────────────────────────────────────────
resource "aws_kms_key" "aurora" {
  description             = "KMS key for Aurora cluster encryption"
  deletion_window_in_days = 14
  enable_key_rotation     = true

  tags = merge(var.common_tags, { Name = "${var.project}-${var.environment}-aurora-kms" })
}

resource "aws_kms_alias" "aurora" {
  name          = "alias/${var.project}-${var.environment}-aurora"
  target_key_id = aws_kms_key.aurora.key_id
}

# ── Security Group ────────────────────────────────────────────────────────────
resource "aws_security_group" "aurora" {
  name        = "${var.project}-${var.environment}-aurora"
  description = "Aurora MySQL security group"
  vpc_id      = var.vpc_id

  ingress {
    description     = "MySQL from ECS tasks"
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [var.ecs_security_group_id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.common_tags, { Name = "${var.project}-${var.environment}-aurora" })
}

# ── Parameter Group ───────────────────────────────────────────────────────────
resource "aws_rds_cluster_parameter_group" "aurora" {
  name   = "${var.project}-${var.environment}-aurora8"
  family = "aurora-mysql8.0"

  parameter {
    name  = "character_set_server"
    value = "utf8mb4"
  }
  parameter {
    name  = "collation_server"
    value = "utf8mb4_unicode_ci"
  }
  parameter {
    name  = "time_zone"
    value = "Asia/Tokyo"
  }
  parameter {
    name  = "slow_query_log"
    value = "1"
  }
  parameter {
    name  = "long_query_time"
    value = "1"
  }
  parameter {
    name  = "log_output"
    value = "FILE"
  }

  tags = var.common_tags
}

# ── Aurora Serverless v2 Cluster ──────────────────────────────────────────────────
resource "aws_rds_cluster" "aurora" {
  cluster_identifier      = "${var.project}-${var.environment}"
  engine                  = "aurora-mysql"
  engine_mode             = "provisioned"
  engine_version          = "8.0.mysql_aurora.3.04.0"
  database_name           = var.aurora_db_name
  master_username         = var.aurora_master_username
  manage_master_user_password = true # Secrets Manager rotation
  kms_key_id              = aws_kms_key.aurora.arn
  storage_encrypted       = true
  db_subnet_group_name    = aws_db_subnet_group.aurora.name
  vpc_security_group_ids  = [aws_security_group.aurora.id]
  db_cluster_parameter_group_name = aws_rds_cluster_parameter_group.aurora.name

  backup_retention_period      = var.aurora_backup_retention_days
  preferred_backup_window      = "17:00-18:00" # 02:00-03:00 JST
  preferred_maintenance_window = "sun:18:00-sun:19:00" # Sun 03:00 JST
  copy_tags_to_snapshot        = true
  deletion_protection          = var.aurora_deletion_protection
  skip_final_snapshot          = false
  final_snapshot_identifier    = "${var.project}-${var.environment}-final-${formatdate("YYYY-MM-DD", timestamp())}"

  enabled_cloudwatch_logs_exports = ["audit", "error", "general", "slowquery"]

  serverlessv2_scaling_configuration {
    min_capacity = var.aurora_min_acu
    max_capacity = var.aurora_max_acu
  }

  tags = merge(var.common_tags, { Name = "${var.project}-${var.environment}-aurora" })

  lifecycle {
    ignore_changes = [final_snapshot_identifier]
  }
}

# ── Aurora Writer Instance ─────────────────────────────────────────────────────────
resource "aws_rds_cluster_instance" "writer" {
  identifier           = "${var.project}-${var.environment}-writer"
  cluster_identifier   = aws_rds_cluster.aurora.id
  instance_class       = "db.serverless"
  engine               = aws_rds_cluster.aurora.engine
  engine_version       = aws_rds_cluster.aurora.engine_version
  db_subnet_group_name = aws_db_subnet_group.aurora.name
  monitoring_interval  = 60
  monitoring_role_arn  = aws_iam_role.rds_enhanced_monitoring.arn
  auto_minor_version_upgrade = true

  performance_insights_enabled          = true
  performance_insights_kms_key_id       = aws_kms_key.aurora.arn
  performance_insights_retention_period = 7

  tags = merge(var.common_tags, { Name = "${var.project}-${var.environment}-writer" })
}

# ── Aurora Reader Instance ─────────────────────────────────────────────────────────
resource "aws_rds_cluster_instance" "reader" {
  count                = var.aurora_reader_count
  identifier           = "${var.project}-${var.environment}-reader-${count.index + 1}"
  cluster_identifier   = aws_rds_cluster.aurora.id
  instance_class       = "db.serverless"
  engine               = aws_rds_cluster.aurora.engine
  engine_version       = aws_rds_cluster.aurora.engine_version
  db_subnet_group_name = aws_db_subnet_group.aurora.name
  monitoring_interval  = 60
  monitoring_role_arn  = aws_iam_role.rds_enhanced_monitoring.arn
  auto_minor_version_upgrade = true

  performance_insights_enabled          = true
  performance_insights_kms_key_id       = aws_kms_key.aurora.arn
  performance_insights_retention_period = 7

  tags = merge(var.common_tags, { Name = "${var.project}-${var.environment}-reader-${count.index + 1}" })
}

# ── Enhanced Monitoring IAM Role ────────────────────────────────────────────────
resource "aws_iam_role" "rds_enhanced_monitoring" {
  name = "${var.project}-${var.environment}-rds-monitoring"
  assume_role_policy = jsonencode({
    Version   = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "monitoring.rds.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
  managed_policy_arns = ["arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"]

  tags = var.common_tags
}

# ── Outputs ────────────────────────────────────────────────────────────────────
output "aurora_cluster_endpoint" {
  description = "Aurora writer endpoint"
  value       = aws_rds_cluster.aurora.endpoint
}

output "aurora_reader_endpoint" {
  description = "Aurora reader endpoint (load-balanced across read replicas)"
  value       = aws_rds_cluster.aurora.reader_endpoint
}

output "aurora_cluster_id" {
  description = "Aurora cluster identifier"
  value       = aws_rds_cluster.aurora.cluster_identifier
}
