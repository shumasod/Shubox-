# ---------------------------------------------------------------------------
# EventBridge Scheduler — recurring business jobs
# ---------------------------------------------------------------------------

resource "aws_iam_role" "scheduler" {
  name = "${var.project}-${var.environment}-scheduler-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "scheduler.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })

  tags = local.common_tags
}

data "aws_iam_policy_document" "scheduler_policy" {
  statement {
    sid     = "InvokeECS"
    actions = ["ecs:RunTask"]
    resources = [
      "arn:aws:ecs:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:task-definition/${var.project}-${var.environment}:*",
    ]
    condition {
      test     = "ArnLike"
      variable = "ecs:cluster"
      values   = [aws_ecs_cluster.main.arn]
    }
  }

  statement {
    sid       = "PassRole"
    actions   = ["iam:PassRole"]
    resources = [
      aws_iam_role.ecs_task_execution.arn,
      aws_iam_role.ecs_task.arn,
    ]
  }

  statement {
    sid       = "InvokeLambda"
    actions   = ["lambda:InvokeFunction"]
    resources = [aws_lambda_function.report_generator.arn]
  }
}

resource "aws_iam_policy" "scheduler" {
  name   = "${var.project}-${var.environment}-scheduler-policy"
  policy = data.aws_iam_policy_document.scheduler_policy.json
}

resource "aws_iam_role_policy_attachment" "scheduler" {
  role       = aws_iam_role.scheduler.name
  policy_arn = aws_iam_policy.scheduler.arn
}

# Scheduler group — all schedules live under this group
resource "aws_scheduler_schedule_group" "main" {
  name = "${var.project}-${var.environment}"
  tags = local.common_tags
}

# Daily reminder: notify users with pending expense reports (JST 09:00 = UTC 00:00)
resource "aws_scheduler_schedule" "expense_reminder" {
  name       = "expense-submission-reminder"
  group_name = aws_scheduler_schedule_group.main.name
  state      = var.scheduler_enabled ? "ENABLED" : "DISABLED"

  flexible_time_window { mode = "OFF" }
  schedule_expression          = "cron(0 0 * * ? *)"
  schedule_expression_timezone = "Asia/Tokyo"

  target {
    arn      = aws_ecs_cluster.main.arn
    role_arn = aws_iam_role.scheduler.arn

    ecs_parameters {
      task_definition_arn = aws_ecs_task_definition.app.arn
      task_count          = 1
      launch_type         = "FARGATE"

      network_configuration {
        assign_public_ip = false
        security_groups  = [aws_security_group.ecs_tasks.id]
        subnets          = aws_subnet.private[*].id
      }

      overrides {
        container_override {
          name    = "app"
          command = ["php", "artisan", "expenses:send-reminders"]
        }
      }
    }

    retry_policy {
      maximum_retry_attempts       = 2
      maximum_event_age_in_seconds = 3600
    }

    dead_letter_config {
      arn = aws_sqs_queue.dlq.arn
    }
  }
}

# Weekly digest: send spend summary email every Monday JST 08:00 (UTC Sun 23:00)
resource "aws_scheduler_schedule" "weekly_digest" {
  name       = "weekly-spend-digest"
  group_name = aws_scheduler_schedule_group.main.name
  state      = var.scheduler_enabled ? "ENABLED" : "DISABLED"

  flexible_time_window { mode = "OFF" }
  schedule_expression          = "cron(0 23 ? * SUN *)"
  schedule_expression_timezone = "UTC"

  target {
    arn      = aws_lambda_function.report_generator.arn
    role_arn = aws_iam_role.scheduler.arn

    input = jsonencode({
      report_type   = "weekly_digest"
      format        = "email"
      notify_admins = true
    })

    retry_policy {
      maximum_retry_attempts       = 1
      maximum_event_age_in_seconds = 7200
    }
  }
}

# Monthly fiscal close reminder: 3 business days before month end
# Simplified as the 26th of each month at JST 10:00
resource "aws_scheduler_schedule" "fiscal_close_reminder" {
  name       = "fiscal-close-reminder"
  group_name = aws_scheduler_schedule_group.main.name
  state      = var.scheduler_enabled ? "ENABLED" : "DISABLED"

  flexible_time_window { mode = "OFF" }
  schedule_expression          = "cron(0 1 26 * ? *)"
  schedule_expression_timezone = "Asia/Tokyo"

  target {
    arn      = aws_ecs_cluster.main.arn
    role_arn = aws_iam_role.scheduler.arn

    ecs_parameters {
      task_definition_arn = aws_ecs_task_definition.app.arn
      task_count          = 1
      launch_type         = "FARGATE"

      network_configuration {
        assign_public_ip = false
        security_groups  = [aws_security_group.ecs_tasks.id]
        subnets          = aws_subnet.private[*].id
      }

      overrides {
        container_override {
          name    = "app"
          command = ["php", "artisan", "expenses:fiscal-close-reminder"]
        }
      }
    }

    retry_policy {
      maximum_retry_attempts       = 1
      maximum_event_age_in_seconds = 3600
    }
  }
}

# Dead-letter queue for failed schedule targets
resource "aws_sqs_queue" "dlq" {
  name                       = "${var.project}-${var.environment}-scheduler-dlq"
  message_retention_seconds  = 1209600 # 14 days
  kms_master_key_id          = aws_kms_key.s3.arn

  tags = local.common_tags
}
