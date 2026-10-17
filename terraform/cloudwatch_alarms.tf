# ──────────────────────────────────────────────
# ECS Fargate alarms
# ──────────────────────────────────────────────
resource "aws_cloudwatch_metric_alarm" "ecs_cpu_high" {
  alarm_name          = "${var.project}-${var.environment}-ecs-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = 60
  statistic           = "Average"
  threshold           = var.alarm_ecs_cpu_threshold
  alarm_description   = "ECS CPU utilization exceeded ${var.alarm_ecs_cpu_threshold}% for 2 consecutive minutes"
  alarm_actions       = [var.sns_ops_alerts_arn]
  ok_actions          = [var.sns_ops_alerts_arn]
  treat_missing_data  = "notBreaching"

  dimensions = {
    ClusterName = var.ecs_cluster_name
    ServiceName = var.ecs_service_name
  }

  tags = var.common_tags
}

resource "aws_cloudwatch_metric_alarm" "ecs_memory_high" {
  alarm_name          = "${var.project}-${var.environment}-ecs-memory-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "MemoryUtilization"
  namespace           = "AWS/ECS"
  period              = 60
  statistic           = "Average"
  threshold           = var.alarm_ecs_memory_threshold
  alarm_description   = "ECS memory utilization exceeded ${var.alarm_ecs_memory_threshold}%"
  alarm_actions       = [var.sns_ops_alerts_arn]
  ok_actions          = [var.sns_ops_alerts_arn]
  treat_missing_data  = "notBreaching"

  dimensions = {
    ClusterName = var.ecs_cluster_name
    ServiceName = var.ecs_service_name
  }

  tags = var.common_tags
}

# ──────────────────────────────────────────────
# Aurora MySQL alarms
# ──────────────────────────────────────────────
resource "aws_cloudwatch_metric_alarm" "aurora_connections_high" {
  alarm_name          = "${var.project}-${var.environment}-aurora-connections-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "DatabaseConnections"
  namespace           = "AWS/RDS"
  period              = 60
  statistic           = "Maximum"
  threshold           = var.alarm_aurora_connections_threshold
  alarm_description   = "Aurora connection count exceeds ${var.alarm_aurora_connections_threshold}"
  alarm_actions       = [var.sns_ops_alerts_arn]
  ok_actions          = [var.sns_ops_alerts_arn]
  treat_missing_data  = "notBreaching"

  dimensions = {
    DBClusterIdentifier = var.aurora_cluster_identifier
  }

  tags = var.common_tags
}

resource "aws_cloudwatch_metric_alarm" "aurora_replication_lag" {
  alarm_name          = "${var.project}-${var.environment}-aurora-replica-lag"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "AuroraReplicaLag"
  namespace           = "AWS/RDS"
  period              = 60
  statistic           = "Maximum"
  threshold           = var.alarm_aurora_replica_lag_ms
  alarm_description   = "Aurora replica lag exceeded ${var.alarm_aurora_replica_lag_ms}ms"
  alarm_actions       = [var.sns_ops_alerts_arn]
  treat_missing_data  = "notBreaching"

  dimensions = {
    DBClusterIdentifier = var.aurora_cluster_identifier
  }

  tags = var.common_tags
}

# ──────────────────────────────────────────────
# ElastiCache Redis alarms
# ──────────────────────────────────────────────
resource "aws_cloudwatch_metric_alarm" "redis_evictions" {
  alarm_name          = "${var.project}-${var.environment}-redis-evictions"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "Evictions"
  namespace           = "AWS/ElastiCache"
  period              = 60
  statistic           = "Sum"
  threshold           = var.alarm_redis_evictions_threshold
  alarm_description   = "Redis evictions detected — cache may be under-provisioned"
  alarm_actions       = [var.sns_ops_alerts_arn]
  treat_missing_data  = "notBreaching"

  dimensions = {
    ReplicationGroupId = var.redis_replication_group_id
  }

  tags = var.common_tags
}

resource "aws_cloudwatch_metric_alarm" "redis_memory_high" {
  alarm_name          = "${var.project}-${var.environment}-redis-memory-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "DatabaseMemoryUsagePercentage"
  namespace           = "AWS/ElastiCache"
  period              = 60
  statistic           = "Average"
  threshold           = var.alarm_redis_memory_threshold
  alarm_description   = "Redis memory usage exceeded ${var.alarm_redis_memory_threshold}%"
  alarm_actions       = [var.sns_ops_alerts_arn]
  ok_actions          = [var.sns_ops_alerts_arn]
  treat_missing_data  = "notBreaching"

  dimensions = {
    ReplicationGroupId = var.redis_replication_group_id
  }

  tags = var.common_tags
}

# ──────────────────────────────────────────────
# ALB alarms
# ──────────────────────────────────────────────
resource "aws_cloudwatch_metric_alarm" "alb_5xx_errors" {
  alarm_name          = "${var.project}-${var.environment}-alb-5xx"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "HTTPCode_ELB_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Sum"
  threshold           = var.alarm_alb_5xx_threshold
  alarm_description   = "ALB 5xx error count exceeded ${var.alarm_alb_5xx_threshold} in 1 minute"
  alarm_actions       = [var.sns_ops_alerts_arn]
  ok_actions          = [var.sns_ops_alerts_arn]
  treat_missing_data  = "notBreaching"

  dimensions = {
    LoadBalancer = var.alb_arn_suffix
  }

  tags = var.common_tags
}

resource "aws_cloudwatch_metric_alarm" "alb_target_response_time" {
  alarm_name          = "${var.project}-${var.environment}-alb-latency"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "TargetResponseTime"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  extended_statistic  = "p95"
  threshold           = var.alarm_alb_latency_seconds
  alarm_description   = "ALB p95 latency exceeded ${var.alarm_alb_latency_seconds}s"
  alarm_actions       = [var.sns_ops_alerts_arn]
  treat_missing_data  = "notBreaching"

  dimensions = {
    LoadBalancer = var.alb_arn_suffix
  }

  tags = var.common_tags
}
