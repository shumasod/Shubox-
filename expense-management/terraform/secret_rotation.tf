# EventBridge rule to trigger secret rotation check monthly
resource "aws_cloudwatch_event_rule" "secret_rotation_reminder" {
  name                = "${local.name_prefix}-secret-rotation-reminder"
  description         = "Monthly reminder to rotate application secrets"
  schedule_expression = "cron(0 9 1 * ? *)" # 09:00 UTC on 1st of each month

  tags = local.common_tags
}

resource "aws_cloudwatch_event_target" "rotation_sns" {
  rule      = aws_cloudwatch_event_rule.secret_rotation_reminder.name
  target_id = "SecretRotationToSNS"
  arn       = aws_sns_topic.alerts.arn

  input = jsonencode({
    type    = "SECRET_ROTATION_REMINDER"
    message = "Monthly reminder: rotate application secrets in SSM Parameter Store. Check /${local.name_prefix}/app-key, db-password, redis-password."
  })
}

# CloudWatch alarm: alert if SSM parameter hasn't been updated in 90 days
# We track last-modified via a custom metric emitted by a Lambda.
resource "aws_lambda_function" "ssm_age_check" {
  function_name = "${local.name_prefix}-ssm-age-check"
  role          = aws_iam_role.ssm_age_lambda.arn
  runtime       = "python3.12"
  handler       = "index.handler"
  timeout       = 30

  filename         = data.archive_file.ssm_age_check.output_path
  source_code_hash = data.archive_file.ssm_age_check.output_base64sha256

  environment {
    variables = {
      PARAMETER_PREFIX = "/${local.name_prefix}/"
      MAX_AGE_DAYS     = "90"
      NAMESPACE        = "${local.name_prefix}/Secrets"
    }
  }

  tags = local.common_tags
}

data "archive_file" "ssm_age_check" {
  type        = "zip"
  output_path = "/tmp/ssm_age_check.zip"

  source {
    content  = <<-PYTHON
import boto3, os, json, datetime

def handler(event, context):
    ssm = boto3.client('ssm')
    cw  = boto3.client('cloudwatch')
    prefix   = os.environ['PARAMETER_PREFIX']
    max_days = int(os.environ['MAX_AGE_DAYS'])
    ns       = os.environ['NAMESPACE']

    paginator = ssm.get_paginator('describe_parameters')
    for page in paginator.paginate(ParameterFilters=[{'Key':'Name','Option':'BeginsWith','Values':[prefix]}]):
        for param in page['Parameters']:
            if param['Type'] != 'SecureString':
                continue
            age = (datetime.datetime.now(datetime.timezone.utc) - param['LastModifiedDate']).days
            cw.put_metric_data(Namespace=ns, MetricData=[{
                'MetricName': 'ParameterAgeDays',
                'Dimensions': [{'Name': 'ParameterName', 'Value': param['Name']}],
                'Value': age,
                'Unit': 'Count',
            }])
    PYTHON
    filename = "index.py"
  }
}

resource "aws_iam_role" "ssm_age_lambda" {
  name = "${local.name_prefix}-ssm-age-lambda"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{ Effect = "Allow", Principal = { Service = "lambda.amazonaws.com" }, Action = "sts:AssumeRole" }]
  })

  managed_policy_arns = ["arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"]

  inline_policy {
    name   = "ssm-describe-cw-put"
    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [
        { Effect = "Allow", Action = ["ssm:DescribeParameters"], Resource = "*" },
        { Effect = "Allow", Action = ["cloudwatch:PutMetricData"], Resource = "*" },
      ]
    })
  }

  tags = local.common_tags
}

# Schedule Lambda weekly
resource "aws_cloudwatch_event_rule" "ssm_age_check" {
  name                = "${local.name_prefix}-ssm-age-check"
  schedule_expression = "rate(7 days)"
  tags                = local.common_tags
}

resource "aws_cloudwatch_event_target" "ssm_age_lambda" {
  rule      = aws_cloudwatch_event_rule.ssm_age_check.name
  target_id = "SsmAgeLambda"
  arn       = aws_lambda_function.ssm_age_check.arn
}

resource "aws_lambda_permission" "ssm_age_eventbridge" {
  statement_id  = "AllowEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.ssm_age_check.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.ssm_age_check.arn
}

# Alarm: secret older than 90 days
resource "aws_cloudwatch_metric_alarm" "secret_stale" {
  alarm_name          = "${local.name_prefix}-secret-stale"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "ParameterAgeDays"
  namespace           = "${local.name_prefix}/Secrets"
  period              = 604800 # 7 days
  statistic           = "Maximum"
  threshold           = 90
  treat_missing_data  = "notBreaching"
  alarm_description   = "An SSM SecureString parameter has not been rotated in > 90 days"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  tags                = local.common_tags
}
