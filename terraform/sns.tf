# SNS topics for expense management notifications

resource "aws_sns_topic" "expense_notifications" {
  name              = "${var.project}-${var.environment}-expense-notifications"
  kms_master_key_id = aws_kms_key.sns.id

  tags = local.common_tags
}

resource "aws_sns_topic" "approval_requests" {
  name              = "${var.project}-${var.environment}-approval-requests"
  kms_master_key_id = aws_kms_key.sns.id

  tags = local.common_tags
}

resource "aws_sns_topic" "budget_alerts" {
  name              = "${var.project}-${var.environment}-budget-alerts"
  kms_master_key_id = aws_kms_key.sns.id

  tags = local.common_tags
}

resource "aws_kms_key" "sns" {
  description             = "KMS key for SNS topic encryption"
  deletion_window_in_days = 7
  enable_key_rotation     = true

  tags = local.common_tags
}

resource "aws_kms_alias" "sns" {
  name          = "alias/${var.project}-${var.environment}-sns"
  target_key_id = aws_kms_key.sns.key_id
}

# Email subscriptions for budget alerts (ops team)
resource "aws_sns_topic_subscription" "budget_alerts_email" {
  for_each  = toset(var.budget_alert_emails)
  topic_arn = aws_sns_topic.budget_alerts.arn
  protocol  = "email"
  endpoint  = each.value
}

# SQS queue for async notification processing
resource "aws_sqs_queue" "notification_queue" {
  name                       = "${var.project}-${var.environment}-notifications"
  visibility_timeout_seconds = 300
  message_retention_seconds  = 86400
  kms_master_key_id          = aws_kms_key.sns.id

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.notification_dlq.arn
    maxReceiveCount     = 3
  })

  tags = local.common_tags
}

resource "aws_sqs_queue" "notification_dlq" {
  name                      = "${var.project}-${var.environment}-notifications-dlq"
  message_retention_seconds = 1209600 # 14 days
  kms_master_key_id         = aws_kms_key.sns.id

  tags = local.common_tags
}

resource "aws_sqs_queue_policy" "notification_queue" {
  queue_url = aws_sqs_queue.notification_queue.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "sns.amazonaws.com" }
      Action    = "sqs:SendMessage"
      Resource  = aws_sqs_queue.notification_queue.arn
      Condition = {
        ArnLike = {
          "aws:SourceArn" = [
            aws_sns_topic.expense_notifications.arn,
            aws_sns_topic.approval_requests.arn,
          ]
        }
      }
    }]
  })
}

resource "aws_sns_topic_subscription" "expense_notifications_sqs" {
  topic_arn = aws_sns_topic.expense_notifications.arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.notification_queue.arn

  filter_policy = jsonencode({
    event_type = ["submitted", "approved", "rejected", "payment_processed"]
  })
}

resource "aws_sns_topic_subscription" "approval_requests_sqs" {
  topic_arn = aws_sns_topic.approval_requests.arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.notification_queue.arn
}

# CloudWatch alarm for DLQ messages
resource "aws_cloudwatch_metric_alarm" "notification_dlq_depth" {
  alarm_name          = "${var.project}-${var.environment}-notification-dlq-depth"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "ApproximateNumberOfMessagesVisible"
  namespace           = "AWS/SQS"
  period              = 300
  statistic           = "Sum"
  threshold           = 0
  alarm_description   = "Messages in notification DLQ - investigate failed deliveries"
  alarm_actions       = [aws_sns_topic.budget_alerts.arn]

  dimensions = {
    QueueName = aws_sqs_queue.notification_dlq.name
  }

  tags = local.common_tags
}

output "expense_notifications_topic_arn" {
  value = aws_sns_topic.expense_notifications.arn
}

output "approval_requests_topic_arn" {
  value = aws_sns_topic.approval_requests.arn
}

output "budget_alerts_topic_arn" {
  value = aws_sns_topic.budget_alerts.arn
}

output "notification_queue_url" {
  value = aws_sqs_queue.notification_queue.url
}
