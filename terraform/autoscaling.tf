# ---------------------------------------------------------------------------
# ECS Application Auto Scaling — target tracking on CPU and memory
# ---------------------------------------------------------------------------

resource "aws_appautoscaling_target" "ecs" {
  service_namespace  = "ecs"
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.app.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  min_capacity       = var.autoscaling_min_capacity
  max_capacity       = var.autoscaling_max_capacity

  depends_on = [aws_ecs_service.app]
}

# CPU target tracking — scale out when average CPU > 60%
resource "aws_appautoscaling_policy" "cpu" {
  name               = "${var.project}-${var.environment}-cpu-tracking"
  policy_type        = "TargetTrackingScaling"
  service_namespace  = aws_appautoscaling_target.ecs.service_namespace
  resource_id        = aws_appautoscaling_target.ecs.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs.scalable_dimension

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value       = var.autoscaling_cpu_target
    scale_in_cooldown  = var.autoscaling_scale_in_cooldown
    scale_out_cooldown = var.autoscaling_scale_out_cooldown
  }
}

# Memory target tracking — scale out when average memory > 70%
resource "aws_appautoscaling_policy" "memory" {
  name               = "${var.project}-${var.environment}-memory-tracking"
  policy_type        = "TargetTrackingScaling"
  service_namespace  = aws_appautoscaling_target.ecs.service_namespace
  resource_id        = aws_appautoscaling_target.ecs.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs.scalable_dimension

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageMemoryUtilization"
    }
    target_value       = var.autoscaling_memory_target
    scale_in_cooldown  = var.autoscaling_scale_in_cooldown
    scale_out_cooldown = var.autoscaling_scale_out_cooldown
  }
}

# Scheduled scale-up for business hours (JST 08:00 = UTC 23:00 previous day)
resource "aws_appautoscaling_scheduled_action" "scale_up_business_hours" {
  name               = "${var.project}-${var.environment}-scale-up-business-hours"
  service_namespace  = aws_appautoscaling_target.ecs.service_namespace
  resource_id        = aws_appautoscaling_target.ecs.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs.scalable_dimension
  schedule           = "cron(0 23 ? * SUN-THU *)"

  scalable_target_action {
    min_capacity = var.autoscaling_business_hours_min
    max_capacity = var.autoscaling_max_capacity
  }
}

# Scheduled scale-down after business hours (JST 22:00 = UTC 13:00)
resource "aws_appautoscaling_scheduled_action" "scale_down_off_hours" {
  name               = "${var.project}-${var.environment}-scale-down-off-hours"
  service_namespace  = aws_appautoscaling_target.ecs.service_namespace
  resource_id        = aws_appautoscaling_target.ecs.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs.scalable_dimension
  schedule           = "cron(0 13 ? * MON-FRI *)"

  scalable_target_action {
    min_capacity = var.autoscaling_min_capacity
    max_capacity = var.autoscaling_max_capacity
  }
}

# CloudWatch alarm: scale-out when request count per target > threshold
resource "aws_cloudwatch_metric_alarm" "alb_high_request_count" {
  alarm_name          = "${var.project}-${var.environment}-alb-high-requests"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "RequestCountPerTarget"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Sum"
  threshold           = var.autoscaling_request_count_threshold
  treat_missing_data  = "notBreaching"
  alarm_description   = "ALB request count per target exceeded threshold — ECS may need to scale"

  dimensions = {
    TargetGroup  = aws_lb_target_group.app.arn_suffix
    LoadBalancer = aws_lb.main.arn_suffix
  }

  alarm_actions = [aws_sns_topic.ops_alerts.arn]
  ok_actions    = [aws_sns_topic.ops_alerts.arn]
}
