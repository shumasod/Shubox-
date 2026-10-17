# CloudWatch Log Group for VPC Flow Logs
resource "aws_cloudwatch_log_group" "vpc_flow" {
  name              = "/aws/vpc/flowlogs/${local.name_prefix}"
  retention_in_days = 90
  kms_key_id        = aws_kms_key.cloudwatch.arn

  tags = local.common_tags
}

# IAM role for VPC Flow Logs to write to CloudWatch
resource "aws_iam_role" "flow_logs" {
  name = "${local.name_prefix}-flow-logs-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "vpc-flow-logs.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy" "flow_logs" {
  name   = "${local.name_prefix}-flow-logs-policy"
  role   = aws_iam_role.flow_logs.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = [
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

# Enable Flow Logs on the main VPC
resource "aws_flow_log" "main" {
  vpc_id          = aws_vpc.main.id
  traffic_type    = "ALL"
  iam_role_arn    = aws_iam_role.flow_logs.arn
  log_destination = aws_cloudwatch_log_group.vpc_flow.arn

  log_format = "$${version} $${account-id} $${interface-id} $${srcaddr} $${dstaddr} $${srcport} $${dstport} $${protocol} $${packets} $${bytes} $${start} $${end} $${action} $${log-status} $${vpc-id} $${subnet-id} $${tcp-flags}"

  tags = local.common_tags
}

# CloudWatch Metric Filter: count REJECT traffic
resource "aws_cloudwatch_log_metric_filter" "vpc_rejects" {
  name           = "${local.name_prefix}-vpc-rejects"
  pattern        = "[version, accountid, interfaceid, srcaddr, dstaddr, srcport, dstport, protocol, packets, bytes, start, end, action=REJECT, logstatus, ...]"
  log_group_name = aws_cloudwatch_log_group.vpc_flow.name

  metric_transformation {
    name      = "VpcRejectCount"
    namespace = "${local.name_prefix}/VPC"
    value     = "1"
  }
}

# Alarm when REJECT count spikes (possible port scan / intrusion)
resource "aws_cloudwatch_metric_alarm" "vpc_rejects_high" {
  alarm_name          = "${local.name_prefix}-vpc-rejects-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "VpcRejectCount"
  namespace           = "${local.name_prefix}/VPC"
  period              = 300
  statistic           = "Sum"
  threshold           = 500
  treat_missing_data  = "notBreaching"
  alarm_description   = "VPC REJECT traffic > 500 in 5 minutes — possible port scan"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  tags                = local.common_tags
}

# KMS key for CloudWatch Logs encryption
resource "aws_kms_key" "cloudwatch" {
  description             = "${local.name_prefix} CloudWatch Logs encryption key"
  deletion_window_in_days = 7
  enable_key_rotation     = true

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "Enable IAM Policies"
        Effect    = "Allow"
        Principal = { AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root" }
        Action    = "kms:*"
        Resource  = "*"
      },
      {
        Sid       = "Allow CloudWatch Logs"
        Effect    = "Allow"
        Principal = { Service = "logs.${var.aws_region}.amazonaws.com" }
        Action    = ["kms:Encrypt*", "kms:Decrypt*", "kms:ReEncrypt*", "kms:GenerateDataKey*", "kms:Describe*"]
        Resource  = "*"
      },
    ]
  })

  tags = local.common_tags
}

resource "aws_kms_alias" "cloudwatch" {
  name          = "alias/${local.name_prefix}-cloudwatch"
  target_key_id = aws_kms_key.cloudwatch.key_id
}

data "aws_caller_identity" "current" {}
