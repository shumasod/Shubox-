resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "${var.project}-${var.environment}-operations"

  dashboard_body = jsonencode({
    widgets = [
      # ── ECS ────────────────────────────────────────────────────────────
      {
        type   = "metric"
        x      = 0; y = 0; width = 8; height = 6
        properties = {
          title  = "ECS CPU Utilization"
          region = var.aws_region
          metrics = [
            ["AWS/ECS", "CPUUtilization", "ClusterName", var.ecs_cluster_name,
             "ServiceName", var.ecs_service_name, { stat = "Average", period = 60 }],
            ["...", { stat = "Maximum", period = 60 }]
          ]
          yAxis = { left = { min = 0, max = 100 } }
          view  = "timeSeries"
        }
      },
      {
        type   = "metric"
        x      = 8; y = 0; width = 8; height = 6
        properties = {
          title  = "ECS Memory Utilization"
          region = var.aws_region
          metrics = [
            ["AWS/ECS", "MemoryUtilization", "ClusterName", var.ecs_cluster_name,
             "ServiceName", var.ecs_service_name, { stat = "Average", period = 60 }]
          ]
          yAxis = { left = { min = 0, max = 100 } }
          view  = "timeSeries"
        }
      },
      {
        type   = "metric"
        x      = 16; y = 0; width = 8; height = 6
        properties = {
          title  = "ECS Running Task Count"
          region = var.aws_region
          metrics = [
            ["ECS/ContainerInsights", "RunningTaskCount", "ClusterName", var.ecs_cluster_name,
             "ServiceName", var.ecs_service_name, { stat = "Average", period = 60 }]
          ]
          view = "timeSeries"
        }
      },
      # ── ALB ────────────────────────────────────────────────────────────
      {
        type   = "metric"
        x      = 0; y = 6; width = 12; height = 6
        properties = {
          title  = "ALB Request Count & 5XX Errors"
          region = var.aws_region
          metrics = [
            ["AWS/ApplicationELB", "RequestCount", "LoadBalancer", var.alb_arn_suffix,
             { stat = "Sum", period = 60, label = "Requests" }],
            [".", "HTTPCode_Target_5XX_Count", ".", var.alb_arn_suffix,
             { stat = "Sum", period = 60, label = "5XX Errors", color = "#d62728" }]
          ]
          view = "timeSeries"
        }
      },
      {
        type   = "metric"
        x      = 12; y = 6; width = 12; height = 6
        properties = {
          title  = "ALB Target Response Time (P50/P95/P99)"
          region = var.aws_region
          metrics = [
            ["AWS/ApplicationELB", "TargetResponseTime", "LoadBalancer", var.alb_arn_suffix,
             { stat = "p50", period = 60, label = "p50" }],
            ["...", { stat = "p95", period = 60, label = "p95" }],
            ["...", { stat = "p99", period = 60, label = "p99", color = "#d62728" }]
          ]
          view = "timeSeries"
        }
      },
      # ── Aurora ─────────────────────────────────────────────────────────
      {
        type   = "metric"
        x      = 0; y = 12; width = 8; height = 6
        properties = {
          title  = "Aurora DB Connections"
          region = var.aws_region
          metrics = [
            ["AWS/RDS", "DatabaseConnections", "DBClusterIdentifier", var.aurora_cluster_id,
             { stat = "Average", period = 60 }]
          ]
          view = "timeSeries"
        }
      },
      {
        type   = "metric"
        x      = 8; y = 12; width = 8; height = 6
        properties = {
          title  = "Aurora Read/Write IOPS"
          region = var.aws_region
          metrics = [
            ["AWS/RDS", "ReadIOPS", "DBClusterIdentifier", var.aurora_cluster_id,
             { stat = "Average", period = 60, label = "Read" }],
            [".", "WriteIOPS", ".", var.aurora_cluster_id,
             { stat = "Average", period = 60, label = "Write" }]
          ]
          view = "timeSeries"
        }
      },
      {
        type   = "metric"
        x      = 16; y = 12; width = 8; height = 6
        properties = {
          title  = "Aurora ACU Utilization"
          region = var.aws_region
          metrics = [
            ["AWS/RDS", "ServerlessDatabaseCapacity", "DBClusterIdentifier", var.aurora_cluster_id,
             { stat = "Average", period = 60 }]
          ]
          view = "timeSeries"
        }
      },
      # ── ElastiCache ────────────────────────────────────────────────────
      {
        type   = "metric"
        x      = 0; y = 18; width = 12; height = 6
        properties = {
          title  = "Redis Cache Hit/Miss Rate"
          region = var.aws_region
          metrics = [
            ["AWS/ElastiCache", "CacheHits", "CacheClusterId", var.redis_cluster_id,
             { stat = "Sum", period = 60, label = "Hits" }],
            [".", "CacheMisses", ".", var.redis_cluster_id,
             { stat = "Sum", period = 60, label = "Misses", color = "#d62728" }]
          ]
          view = "timeSeries"
        }
      },
      {
        type   = "metric"
        x      = 12; y = 18; width = 12; height = 6
        properties = {
          title  = "Redis Memory & Connections"
          region = var.aws_region
          metrics = [
            ["AWS/ElastiCache", "DatabaseMemoryUsagePercentage", "CacheClusterId", var.redis_cluster_id,
             { stat = "Average", period = 60, label = "Memory %" }],
            [".", "CurrConnections", ".", var.redis_cluster_id,
             { stat = "Average", period = 60, label = "Connections", yAxis = "right" }]
          ]
          view = "timeSeries"
        }
      },
    ]
  })
}

resource "aws_cloudwatch_metric_alarm" "alb_5xx_rate" {
  alarm_name          = "${var.project}-${var.environment}-alb-5xx-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Sum"
  threshold           = 50
  alarm_description   = "ALB 5XX error count exceeded 50 in 1 minute"
  treat_missing_data  = "notBreaching"

  dimensions = {
    LoadBalancer = var.alb_arn_suffix
  }

  alarm_actions = [var.sns_alert_topic_arn]
  ok_actions    = [var.sns_alert_topic_arn]

  tags = var.common_tags
}

resource "aws_cloudwatch_metric_alarm" "alb_response_time_p99" {
  alarm_name          = "${var.project}-${var.environment}-alb-latency-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  extended_statistic  = "p99"
  metric_name         = "TargetResponseTime"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  threshold           = 2.0
  alarm_description   = "P99 ALB response time exceeded 2 seconds"
  treat_missing_data  = "notBreaching"

  dimensions = {
    LoadBalancer = var.alb_arn_suffix
  }

  alarm_actions = [var.sns_alert_topic_arn]

  tags = var.common_tags
}
