resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "${var.project_name}-overview"

  dashboard_body = jsonencode({
    widgets = [
      # ---- ECS CPU / Memory ----
      {
        type   = "metric"
        x = 0; y = 0; width = 12; height = 6
        properties = {
          title  = "ECS CPU & Memory Utilization"
          period = 60
          stat   = "Average"
          metrics = [
            ["AWS/ECS", "CPUUtilization",    "ClusterName", var.ecs_cluster_name, "ServiceName", var.ecs_service_name, { label = "CPU %" }],
            ["AWS/ECS", "MemoryUtilization", "ClusterName", var.ecs_cluster_name, "ServiceName", var.ecs_service_name, { label = "Memory %" }],
          ]
          yAxis = { left = { min = 0, max = 100 } }
          view  = "timeSeries"
        }
      },
      # ---- ALB Request Count / 5xx ----
      {
        type   = "metric"
        x = 12; y = 0; width = 12; height = 6
        properties = {
          title  = "ALB Requests & 5xx Errors"
          period = 60
          metrics = [
            ["AWS/ApplicationELB", "RequestCount",   "LoadBalancer", var.alb_arn_suffix, { stat = "Sum",     label = "Requests" }],
            ["AWS/ApplicationELB", "HTTPCode_ELB_5XX_Count", "LoadBalancer", var.alb_arn_suffix, { stat = "Sum", label = "5xx Errors", color = "#d62728" }],
          ]
          view = "timeSeries"
        }
      },
      # ---- ALB Target Response Time ----
      {
        type   = "metric"
        x = 0; y = 6; width = 12; height = 6
        properties = {
          title  = "ALB Target Response Time (p50 / p95 / p99)"
          period = 60
          metrics = [
            ["AWS/ApplicationELB", "TargetResponseTime", "LoadBalancer", var.alb_arn_suffix, { stat = "p50", label = "p50" }],
            ["AWS/ApplicationELB", "TargetResponseTime", "LoadBalancer", var.alb_arn_suffix, { stat = "p95", label = "p95" }],
            ["AWS/ApplicationELB", "TargetResponseTime", "LoadBalancer", var.alb_arn_suffix, { stat = "p99", label = "p99", color = "#d62728" }],
          ]
          view = "timeSeries"
        }
      },
      # ---- RDS CPU / Connections ----
      {
        type   = "metric"
        x = 12; y = 6; width = 12; height = 6
        properties = {
          title  = "Aurora CPU & Database Connections"
          period = 60
          metrics = [
            ["AWS/RDS", "CPUUtilization",      "DBClusterIdentifier", var.aurora_cluster_id, { stat = "Average", label = "CPU %" }],
            ["AWS/RDS", "DatabaseConnections", "DBClusterIdentifier", var.aurora_cluster_id, { stat = "Average", label = "Connections", yAxis = "right" }],
          ]
          view = "timeSeries"
        }
      },
      # ---- ElastiCache ----
      {
        type   = "metric"
        x = 0; y = 12; width = 12; height = 6
        properties = {
          title  = "Redis Memory & Cache Hits"
          period = 60
          metrics = [
            ["AWS/ElastiCache", "DatabaseMemoryUsagePercentage", "ReplicationGroupId", var.redis_replication_group_id, { stat = "Average", label = "Memory %" }],
            ["AWS/ElastiCache", "CacheHitRate",                  "ReplicationGroupId", var.redis_replication_group_id, { stat = "Average", label = "Hit Rate %", yAxis = "right" }],
          ]
          view = "timeSeries"
        }
      },
      # ---- SQS Queue Depth ----
      {
        type   = "metric"
        x = 12; y = 12; width = 12; height = 6
        properties = {
          title  = "SQS Queue Depth"
          period = 60
          metrics = [
            ["AWS/SQS", "ApproximateNumberOfMessagesVisible", "QueueName", "${var.project_name}-emails",        { stat = "Maximum", label = "emails" }],
            ["AWS/SQS", "ApproximateNumberOfMessagesVisible", "QueueName", "${var.project_name}-notifications", { stat = "Maximum", label = "notifications" }],
            ["AWS/SQS", "ApproximateNumberOfMessagesVisible", "QueueName", "${var.project_name}-default",       { stat = "Maximum", label = "default" }],
          ]
          view = "timeSeries"
        }
      },
      # ---- Error Rate Text Widget ----
      {
        type = "text"
        x = 0; y = 18; width = 24; height = 2
        properties = {
          markdown = "## Expense Management — Operations Dashboard\n> Auto-refresh every 60s. All times UTC."
        }
      },
    ]
  })
}
