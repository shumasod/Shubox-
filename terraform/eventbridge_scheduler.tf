# ---------------------------------------------------------------------------
# EventBridge Scheduler — trigger Laravel artisan commands via ECS run-task
# ---------------------------------------------------------------------------

data "aws_iam_policy_document" "scheduler_assume_role" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["scheduler.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "eventbridge_scheduler" {
  name               = "${var.project}-${var.environment}-eb-scheduler"
  assume_role_policy = data.aws_iam_policy_document.scheduler_assume_role.json

  tags = { Project = var.project, Environment = var.environment }
}

resource "aws_iam_role_policy" "scheduler_ecs" {
  name = "run-ecs-tasks"
  role = aws_iam_role.eventbridge_scheduler.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "ecs:RunTask",
        "iam:PassRole",
      ]
      Resource = "*"
    }]
  })
}

# Schedule group
resource "aws_scheduler_schedule_group" "app" {
  name = "${var.project}-${var.environment}"

  tags = { Project = var.project, Environment = var.environment }
}

# Helper locals for ECS run-task target template
locals {
  ecs_target_base = {
    Arn            = var.ecs_cluster_arn
    RoleArn        = aws_iam_role.eventbridge_scheduler.arn
    TaskCount      = 1
    LaunchType     = "FARGATE"
    NetworkConfiguration = {
      AwsvpcConfiguration = {
        Subnets        = var.private_subnet_ids
        SecurityGroups = [var.ecs_security_group_id]
        AssignPublicIp = "DISABLED"
      }
    }
  }
}

# 1. Generate recurring expenses every day at 01:00 JST (16:00 UTC)
resource "aws_scheduler_schedule" "generate_recurring_expenses" {
  name       = "generate-recurring-expenses"
  group_name = aws_scheduler_schedule_group.app.name

  flexible_time_window { mode = "OFF" }
  schedule_expression          = "cron(0 16 * * ? *)"
  schedule_expression_timezone = "Asia/Tokyo"

  target {
    arn     = var.ecs_cluster_arn
    role_arn = aws_iam_role.eventbridge_scheduler.arn

    ecs_parameters {
      task_definition_arn = var.ecs_task_definition_arn
      launch_type         = "FARGATE"
      task_count          = 1

      network_configuration {
        assign_public_ip = false
        subnets          = var.private_subnet_ids
        security_groups  = [var.ecs_security_group_id]
      }

      overrides = jsonencode({
        containerOverrides = [{
          name    = "app"
          command = ["php", "artisan", "expenses:generate-recurring"]
        }]
      })
    }

    retry_policy {
      maximum_retry_attempts       = 2
      maximum_event_age_in_seconds = 3600
    }
  }
}

# 2. Send monthly summary reports on the 1st of each month at 08:00 JST
resource "aws_scheduler_schedule" "monthly_report" {
  name       = "monthly-expense-report"
  group_name = aws_scheduler_schedule_group.app.name

  flexible_time_window { mode = "OFF" }
  schedule_expression          = "cron(0 23 L * ? *)"
  schedule_expression_timezone = "UTC"

  target {
    arn      = var.ecs_cluster_arn
    role_arn = aws_iam_role.eventbridge_scheduler.arn

    ecs_parameters {
      task_definition_arn = var.ecs_task_definition_arn
      launch_type         = "FARGATE"
      task_count          = 1

      network_configuration {
        assign_public_ip = false
        subnets          = var.private_subnet_ids
        security_groups  = [var.ecs_security_group_id]
      }

      overrides = jsonencode({
        containerOverrides = [{
          name    = "app"
          command = ["php", "artisan", "reports:send-monthly-summary"]
        }]
      })
    }

    retry_policy {
      maximum_retry_attempts       = 1
      maximum_event_age_in_seconds = 7200
    }
  }
}
