# ── Auto Scaling Target ───────────────────────────────────────────────────────────
resource "aws_appautoscaling_target" "ecs" {
  max_capacity       = var.ecs_max_capacity
  min_capacity       = var.ecs_min_capacity
  resource_id        = "service/${var.ecs_cluster_name}/${var.ecs_service_name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"

  tags = var.common_tags
}

# ── CPU Tracking Policy ───────────────────────────────────────────────────────────
resource "aws_appautoscaling_policy" "ecs_cpu" {
  name               = "${var.project}-${var.environment}-ecs-cpu-tracking"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs.scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs.service_namespace

  target_tracking_scaling_policy_configuration {
    target_value       = var.ecs_cpu_target_value
    scale_in_cooldown  = 300
    scale_out_cooldown = 60

    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
  }
}

# ── Memory Tracking Policy ────────────────────────────────────────────────────────
resource "aws_appautoscaling_policy" "ecs_memory" {
  name               = "${var.project}-${var.environment}-ecs-memory-tracking"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs.scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs.service_namespace

  target_tracking_scaling_policy_configuration {
    target_value       = var.ecs_memory_target_value
    scale_in_cooldown  = 300
    scale_out_cooldown = 60

    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageMemoryUtilization"
    }
  }
}

# ── Scheduled Scale-Out for Business Hours ─────────────────────────────────
resource "aws_appautoscaling_scheduled_action" "scale_out_morning" {
  name               = "${var.project}-${var.environment}-scale-out-morning"
  resource_id        = aws_appautoscaling_target.ecs.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs.scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs.service_namespace
  schedule           = "cron(0 9 ? * MON-FRI *)" # 09:00 JST (UTC+9 = 00:00 UTC)

  scalable_target_action {
    min_capacity = var.ecs_business_hours_min_capacity
    max_capacity = var.ecs_max_capacity
  }
}

resource "aws_appautoscaling_scheduled_action" "scale_in_evening" {
  name               = "${var.project}-${var.environment}-scale-in-evening"
  resource_id        = aws_appautoscaling_target.ecs.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs.scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs.service_namespace
  schedule           = "cron(0 20 ? * MON-FRI *)" # 20:00 JST (11:00 UTC)

  scalable_target_action {
    min_capacity = var.ecs_min_capacity
    max_capacity = var.ecs_max_capacity
  }
}

# ── CloudWatch Alarm ───────────────────────────────────────────────────────────
resource "aws_cloudwatch_metric_alarm" "ecs_max_capacity_reached" {
  alarm_name          = "${var.project}-${var.environment}-ecs-at-max-capacity"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 2
  metric_name         = "RunningTaskCount"
  namespace           = "ECS/ContainerInsights"
  period              = 60
  statistic           = "Average"
  threshold           = var.ecs_max_capacity
  alarm_description   = "ECS service has reached maximum desired task count"
  treat_missing_data  = "notBreaching"

  dimensions = {
    ClusterName = var.ecs_cluster_name
    ServiceName = var.ecs_service_name
  }

  alarm_actions = [var.sns_alert_topic_arn]

  tags = var.common_tags
}
