# ---------------------------------------------------------------------------
# Lambda — async report generation triggered by EventBridge or SQS
# ---------------------------------------------------------------------------

data "aws_iam_policy_document" "lambda_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "lambda_report" {
  name               = "${var.project}-${var.environment}-lambda-report"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json

  tags = local.common_tags
}

data "aws_iam_policy_document" "lambda_report_policy" {
  statement {
    sid     = "Logs"
    actions = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
    resources = ["arn:aws:logs:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:log-group:/aws/lambda/${var.project}-${var.environment}-report-generator:*"]
  }

  statement {
    sid       = "S3Write"
    actions   = ["s3:PutObject", "s3:GetObject"]
    resources = ["${aws_s3_bucket.reports.arn}/*"]
  }

  statement {
    sid       = "KMS"
    actions   = ["kms:GenerateDataKey", "kms:Decrypt"]
    resources = [aws_kms_key.s3.arn]
  }

  statement {
    sid       = "SSM"
    actions   = ["ssm:GetParameter", "ssm:GetParametersByPath"]
    resources = ["arn:aws:ssm:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:parameter/${var.project}/${var.environment}/*"]
  }

  statement {
    sid       = "SES"
    actions   = ["ses:SendEmail", "ses:SendRawEmail"]
    resources = ["*"]
    condition {
      test     = "StringEquals"
      variable = "ses:FromAddress"
      values   = [var.ses_from_address]
    }
  }

  statement {
    sid       = "VPC"
    actions   = ["ec2:CreateNetworkInterface", "ec2:DescribeNetworkInterfaces", "ec2:DeleteNetworkInterface"]
    resources = ["*"]
  }
}

resource "aws_iam_policy" "lambda_report" {
  name   = "${var.project}-${var.environment}-lambda-report-policy"
  policy = data.aws_iam_policy_document.lambda_report_policy.json
}

resource "aws_iam_role_policy_attachment" "lambda_report" {
  role       = aws_iam_role.lambda_report.name
  policy_arn = aws_iam_policy.lambda_report.arn
}

resource "aws_s3_bucket" "reports" {
  bucket        = "${var.project}-${var.environment}-reports-${data.aws_caller_identity.current.account_id}"
  force_destroy = var.environment != "production"

  tags = local.common_tags
}

resource "aws_s3_bucket_server_side_encryption_configuration" "reports" {
  bucket = aws_s3_bucket.reports.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.s3.arn
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "reports" {
  bucket = aws_s3_bucket.reports.id

  rule {
    id     = "expire-old-reports"
    status = "Enabled"

    expiration {
      days = var.report_s3_retention_days
    }
  }
}

resource "aws_s3_bucket_public_access_block" "reports" {
  bucket                  = aws_s3_bucket.reports.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_lambda_function" "report_generator" {
  function_name = "${var.project}-${var.environment}-report-generator"
  role          = aws_iam_role.lambda_report.arn
  package_type  = "Image"
  image_uri     = "${aws_ecr_repository.app.repository_url}:lambda-report-latest"

  memory_size = var.lambda_report_memory_mb
  timeout     = var.lambda_report_timeout_seconds

  environment {
    variables = {
      APP_ENV        = var.environment
      S3_BUCKET      = aws_s3_bucket.reports.bucket
      SSM_PREFIX     = "/${var.project}/${var.environment}"
      DB_SSM_KEY     = "/${var.project}/${var.environment}/DB_PASSWORD"
    }
  }

  vpc_config {
    subnet_ids         = aws_subnet.private[*].id
    security_group_ids = [aws_security_group.lambda.id]
  }

  tracing_config {
    mode = "Active"
  }

  tags = local.common_tags

  depends_on = [aws_iam_role_policy_attachment.lambda_report]
}

resource "aws_security_group" "lambda" {
  name        = "${var.project}-${var.environment}-lambda-sg"
  description = "Lambda report generator outbound to Aurora and S3"
  vpc_id      = aws_vpc.main.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, { Name = "${var.project}-${var.environment}-lambda-sg" })
}

# EventBridge rule: trigger report generation on schedule or custom event
resource "aws_cloudwatch_event_rule" "report_scheduler" {
  name                = "${var.project}-${var.environment}-scheduled-reports"
  description         = "Trigger monthly summary report generation on the 1st of each month at 06:00 JST"
  schedule_expression = "cron(0 21 L * ? *)" # 21:00 UTC = 06:00 JST next day (1st)
  state               = var.scheduled_reports_enabled ? "ENABLED" : "DISABLED"
}

resource "aws_cloudwatch_event_target" "report_lambda" {
  rule = aws_cloudwatch_event_rule.report_scheduler.name
  arn  = aws_lambda_function.report_generator.arn
  input = jsonencode({
    report_type = "monthly_summary"
    format      = "xlsx"
    notify_admins = true
  })
}

resource "aws_lambda_permission" "eventbridge_invoke" {
  statement_id  = "AllowEventBridgeInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.report_generator.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.report_scheduler.arn
}

resource "aws_lambda_function_event_invoke_config" "report_generator" {
  function_name          = aws_lambda_function.report_generator.function_name
  maximum_retry_attempts = 1

  destination_config {
    on_failure {
      destination = aws_sns_topic.ops_alerts.arn
    }
  }
}
