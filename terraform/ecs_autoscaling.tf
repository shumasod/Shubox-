resource "aws_appautoscaling_target" "ecs" {
  max_capacity       = var.ecs_max_capacity
  min_capacity       = var.ecs_min_capacity
  resource_id        = "service/${var.ecs_cluster_name}/${var.ecs_service_name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"

  depends_on = [aws_ecs_service.app]
}

# Scale out when average CPU > 70%
resource "aws_appautoscaling_policy" "ecs_cpu" {
  name               = "${var.project_name}-ecs-cpu-tracking"
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

# Scale out when average Memory > 80%
resource "aws_appautoscaling_policy" "ecs_memory" {
  name               = "${var.project_name}-ecs-memory-tracking"
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

# Scheduled scale-up for business hours (JST 08:00 = UTC 23:00 prev day)
resource "aws_appautoscaling_scheduled_action" "scale_up_business_hours" {
  count = var.enable_scheduled_scaling ? 1 : 0

  name               = "${var.project_name}-ecs-scale-up-business-hours"
  service_namespace  = aws_appautoscaling_target.ecs.service_namespace
  resource_id        = aws_appautoscaling_target.ecs.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs.scalable_dimension
  schedule           = "cron(0 23 ? * SUN-THU *)"

  scalable_target_action {
    min_capacity = var.ecs_business_hours_min
    max_capacity = var.ecs_max_capacity
  }
}

# Scheduled scale-down for off-hours (JST 20:00 = UTC 11:00)
resource "aws_appautoscaling_scheduled_action" "scale_down_off_hours" {
  count = var.enable_scheduled_scaling ? 1 : 0

  name               = "${var.project_name}-ecs-scale-down-off-hours"
  service_namespace  = aws_appautoscaling_target.ecs.service_namespace
  resource_id        = aws_appautoscaling_target.ecs.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs.scalable_dimension
  schedule           = "cron(0 11 ? * MON-FRI *)"

  scalable_target_action {
    min_capacity = var.ecs_min_capacity
    max_capacity = var.ecs_max_capacity
  }
}
