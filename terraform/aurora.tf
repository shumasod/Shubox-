resource "aws_db_subnet_group" "aurora" {
  name       = "${var.project_name}-aurora-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = merge(var.common_tags, { Name = "${var.project_name}-aurora-subnet-group" })
}

resource "aws_security_group" "aurora" {
  name        = "${var.project_name}-aurora-sg"
  description = "Aurora MySQL security group"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "MySQL from ECS tasks"
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.common_tags, { Name = "${var.project_name}-aurora-sg" })
}

resource "aws_kms_key" "aurora" {
  description             = "KMS key for Aurora MySQL encryption at rest"
  deletion_window_in_days = 7
  enable_key_rotation     = true

  tags = merge(var.common_tags, { Name = "${var.project_name}-aurora-kms" })
}

resource "aws_kms_alias" "aurora" {
  name          = "alias/${var.project_name}-aurora"
  target_key_id = aws_kms_key.aurora.key_id
}

resource "aws_rds_cluster" "main" {
  cluster_identifier      = "${var.project_name}-aurora"
  engine                  = "aurora-mysql"
  engine_version          = "8.0.mysql_aurora.3.05.2"
  engine_mode             = "provisioned"
  database_name           = var.db_name
  master_username         = var.db_username
  master_password         = var.db_password

  db_subnet_group_name    = aws_db_subnet_group.aurora.name
  vpc_security_group_ids  = [aws_security_group.aurora.id]

  # Encryption
  storage_encrypted       = true
  kms_key_id              = aws_kms_key.aurora.arn

  # Serverless v2 scaling
  serverlessv2_scaling_configuration {
    min_capacity = var.aurora_min_acu
    max_capacity = var.aurora_max_acu
  }

  # Backups
  backup_retention_period   = 7
  preferred_backup_window   = "01:00-02:00"
  copy_tags_to_snapshot     = true
  deletion_protection       = var.aurora_deletion_protection
  skip_final_snapshot       = false
  final_snapshot_identifier = "${var.project_name}-aurora-final"

  # Maintenance
  preferred_maintenance_window    = "sun:03:00-sun:05:00"
  apply_immediately               = false
  enabled_cloudwatch_logs_exports = ["audit", "error", "slowquery"]

  tags = var.common_tags

  lifecycle {
    ignore_changes = [master_password]
  }
}

resource "aws_rds_cluster_instance" "writer" {
  identifier         = "${var.project_name}-aurora-writer"
  cluster_identifier = aws_rds_cluster.main.id
  instance_class     = "db.serverless"
  engine             = aws_rds_cluster.main.engine
  engine_version     = aws_rds_cluster.main.engine_version

  db_subnet_group_name    = aws_db_subnet_group.aurora.name
  monitoring_role_arn     = aws_iam_role.rds_enhanced_monitoring.arn
  monitoring_interval     = 60
  performance_insights_enabled = true
  performance_insights_kms_key_id = aws_kms_key.aurora.arn
  performance_insights_retention_period = 7

  auto_minor_version_upgrade = true
  tags = var.common_tags
}

resource "aws_rds_cluster_instance" "reader" {
  count              = var.aurora_reader_count
  identifier         = "${var.project_name}-aurora-reader-${count.index + 1}"
  cluster_identifier = aws_rds_cluster.main.id
  instance_class     = "db.serverless"
  engine             = aws_rds_cluster.main.engine
  engine_version     = aws_rds_cluster.main.engine_version

  db_subnet_group_name    = aws_db_subnet_group.aurora.name
  monitoring_role_arn     = aws_iam_role.rds_enhanced_monitoring.arn
  monitoring_interval     = 60
  performance_insights_enabled = true
  performance_insights_kms_key_id = aws_kms_key.aurora.arn

  tags = var.common_tags
}

resource "aws_iam_role" "rds_enhanced_monitoring" {
  name = "${var.project_name}-rds-enhanced-monitoring"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "monitoring.rds.amazonaws.com" }
    }]
  })

  managed_policy_arns = ["arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"]
  tags = var.common_tags
}

output "aurora_writer_endpoint" {
  description = "Aurora cluster writer endpoint"
  value       = aws_rds_cluster.main.endpoint
  sensitive   = true
}

output "aurora_reader_endpoint" {
  description = "Aurora cluster reader endpoint"
  value       = aws_rds_cluster.main.reader_endpoint
  sensitive   = true
}
