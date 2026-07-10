# ---------------------------------------------------------------------------
# VPC Flow Logs — capture accepted/rejected traffic for security analysis
# ---------------------------------------------------------------------------

resource "aws_cloudwatch_log_group" "vpc_flow_logs" {
  name              = "/aws/vpc/${var.project}-${var.environment}/flow-logs"
  retention_in_days = var.flow_log_retention_days
  kms_key_id        = aws_kms_key.cloudwatch.arn

  tags = { Project = var.project, Environment = var.environment }
}

resource "aws_kms_key" "cloudwatch" {
  description             = "KMS key for CloudWatch Logs encryption"
  deletion_window_in_days = 7
  enable_key_rotation     = true

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "EnableRootAccess"
        Effect = "Allow"
        Principal = { AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root" }
        Action   = "kms:*"
        Resource = "*"
      },
      {
        Sid    = "AllowCloudWatchLogs"
        Effect = "Allow"
        Principal = { Service = "logs.${var.aws_region}.amazonaws.com" }
        Action = [
          "kms:Encrypt", "kms:Decrypt", "kms:ReEncrypt*",
          "kms:GenerateDataKey*", "kms:DescribeKey",
        ]
        Resource = "*"
        Condition = {
          ArnLike = {
            "kms:EncryptionContext:aws:logs:arn" = "arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:*"
          }
        }
      }
    ]
  })

  tags = { Project = var.project, Environment = var.environment }
}

resource "aws_kms_alias" "cloudwatch" {
  name          = "alias/${var.project}-${var.environment}-cloudwatch"
  target_key_id = aws_kms_key.cloudwatch.key_id
}

# IAM role for VPC Flow Logs to write to CloudWatch
data "aws_iam_policy_document" "flow_logs_assume" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["vpc-flow-logs.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "vpc_flow_logs" {
  name               = "${var.project}-${var.environment}-vpc-flow-logs"
  assume_role_policy = data.aws_iam_policy_document.flow_logs_assume.json

  tags = { Project = var.project, Environment = var.environment }
}

resource "aws_iam_role_policy" "vpc_flow_logs" {
  name = "cloudwatch-write"
  role = aws_iam_role.vpc_flow_logs.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:DescribeLogGroups",
        "logs:DescribeLogStreams",
      ]
      Resource = "*"
    }]
  })
}

# VPC Flow Log resource
resource "aws_flow_log" "main" {
  vpc_id          = var.vpc_id
  traffic_type    = "ALL"
  iam_role_arn    = aws_iam_role.vpc_flow_logs.arn
  log_destination = aws_cloudwatch_log_group.vpc_flow_logs.arn

  tags = { Project = var.project, Environment = var.environment }
}

# Metric filter: count REJECT actions
resource "aws_cloudwatch_log_metric_filter" "rejected_traffic" {
  name           = "${var.project}-${var.environment}-rejected-traffic"
  log_group_name = aws_cloudwatch_log_group.vpc_flow_logs.name
  pattern        = "[version, account, eni, source, destination, srcport, destport, protocol, packets, bytes, windowstart, windowend, action=REJECT, flowlogstatus]"

  metric_transformation {
    name      = "RejectedPackets"
    namespace = "Security/${var.project}"
    value     = "$packets"
    unit      = "Count"
  }
}

# Alarm: sudden spike in rejected traffic (potential port scan)
resource "aws_cloudwatch_metric_alarm" "rejected_traffic_spike" {
  alarm_name          = "${var.project}-${var.environment}-rejected-traffic-spike"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "RejectedPackets"
  namespace           = "Security/${var.project}"
  period              = 300
  statistic           = "Sum"
  threshold           = var.rejected_traffic_threshold
  alarm_description   = "Possible port scan or DDoS: high volume of rejected VPC traffic"
  alarm_actions       = [aws_sns_topic.guardduty_alerts.arn]
  treat_missing_data  = "notBreaching"
}

data "aws_caller_identity" "current" {}
