resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = local.prefix

  dashboard_body = jsonencode({
    widgets = [
      # -------------------------------------------------------
      # ALB メトリクス
      # -------------------------------------------------------
      {
        type       = "metric"
        x = 0; y = 0; width = 12; height = 6
        properties = {
          title  = "ALB リクエスト数 / エラー率"
          region = var.aws_region
          metrics = [
            ["AWS/ApplicationELB", "RequestCount", "LoadBalancer", aws_lb.main.arn_suffix, { stat = "Sum", period = 60 }],
            [".", "HTTPCode_Target_5XX_Count", ".", ".", { stat = "Sum", period = 60, color = "#d62728" }],
            [".", "HTTPCode_Target_4XX_Count", ".", ".", { stat = "Sum", period = 60, color = "#ff7f0e" }],
          ]
          view    = "timeSeries"
          stacked = false
        }
      },
      {
        type       = "metric"
        x = 12; y = 0; width = 12; height = 6
        properties = {
          title  = "ALB レスポンスタイム (p50/p95/p99)"
          region = var.aws_region
          metrics = [
            ["AWS/ApplicationELB", "TargetResponseTime", "LoadBalancer", aws_lb.main.arn_suffix, { stat = "p50",  period = 60 }],
            [".", ".", ".", ".", { stat = "p95",  period = 60, color = "#ff7f0e" }],
            [".", ".", ".", ".", { stat = "p99",  period = 60, color = "#d62728" }],
          ]
          view    = "timeSeries"
          yAxis   = { left = { min = 0, max = 2 } }
        }
      },
      # -------------------------------------------------------
      # ECS メトリクス
      # -------------------------------------------------------
      {
        type       = "metric"
        x = 0; y = 6; width = 8; height = 6
        properties = {
          title  = "ECS CPU 利用率 (%)"
          region = var.aws_region
          metrics = [
            ["AWS/ECS", "CPUUtilization", "ClusterName", aws_ecs_cluster.main.name, "ServiceName", aws_ecs_service.app.name, { stat = "Average", period = 60 }],
          ]
          view  = "timeSeries"
          yAxis = { left = { min = 0, max = 100 } }
        }
      },
      {
        type       = "metric"
        x = 8; y = 6; width = 8; height = 6
        properties = {
          title  = "ECS メモリ利用率 (%)"
          region = var.aws_region
          metrics = [
            ["AWS/ECS", "MemoryUtilization", "ClusterName", aws_ecs_cluster.main.name, "ServiceName", aws_ecs_service.app.name, { stat = "Average", period = 60 }],
          ]
          view  = "timeSeries"
          yAxis = { left = { min = 0, max = 100 } }
        }
      },
      {
        type       = "metric"
        x = 16; y = 6; width = 8; height = 6
        properties = {
          title  = "ECS タスク数"
          region = var.aws_region
          metrics = [
            ["ECS/ContainerInsights", "RunningTaskCount", "ClusterName", aws_ecs_cluster.main.name, "ServiceName", aws_ecs_service.app.name, { stat = "Average", period = 60 }],
          ]
          view = "timeSeries"
        }
      },
      # -------------------------------------------------------
      # RDS メトリクス
      # -------------------------------------------------------
      {
        type       = "metric"
        x = 0; y = 12; width = 8; height = 6
        properties = {
          title  = "RDS DB 接続数"
          region = var.aws_region
          metrics = [
            ["AWS/RDS", "DatabaseConnections", "DBClusterIdentifier", aws_rds_cluster.main.cluster_identifier, { stat = "Average", period = 60 }],
          ]
          view = "timeSeries"
        }
      },
      {
        type       = "metric"
        x = 8; y = 12; width = 8; height = 6
        properties = {
          title  = "RDS クエリレイテンシー (ms)"
          region = var.aws_region
          metrics = [
            ["AWS/RDS", "SelectLatency", "DBClusterIdentifier", aws_rds_cluster.main.cluster_identifier, { stat = "Average", period = 60 }],
            [".", "InsertLatency", ".", ".", { stat = "Average", period = 60 }],
          ]
          view = "timeSeries"
        }
      },
      {
        type       = "metric"
        x = 16; y = 12; width = 8; height = 6
        properties = {
          title  = "ElastiCache Redis ヒット率"
          region = var.aws_region
          metrics = [
            ["AWS/ElastiCache", "CacheHitRate", "ReplicationGroupId", aws_elasticache_replication_group.redis.id, { stat = "Average", period = 60 }],
          ]
          view  = "timeSeries"
          yAxis = { left = { min = 0, max = 1 } }
        }
      },
    ]
  })
}
