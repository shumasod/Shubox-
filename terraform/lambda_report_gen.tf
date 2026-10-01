# ---------------------------------------------------------------------------
# Lambda — async PDF report generation triggered via SQS
# ---------------------------------------------------------------------------

data "archive_file" "report_gen" {
  type        = "zip"
  output_path = "${path.module}/.lambda_zips/report_gen.zip"

  source {
    content  = <<-PYTHON
      import json, os, boto3
      from datetime import datetime

      s3  = boto3.client('s3')
      ses = boto3.client('ses', region_name=os.environ['SES_REGION'])

      def handler(event, context):
          for record in event['Records']:
              payload   = json.loads(record['body'])
              tenant_id = payload['tenant_id']
              user_email= payload['user_email']
              export_id = payload['export_id']
              report_key= f"reports/tenant_{tenant_id}/{export_id}.pdf"

              # Placeholder: in production, generate PDF using weasyprint or reportlab
              pdf_content = b'%PDF-1.4 placeholder'
              s3.put_object(
                  Bucket=os.environ['REPORT_BUCKET'],
                  Key=report_key,
                  Body=pdf_content,
                  ContentType='application/pdf',
                  ServerSideEncryption='aws:kms',
              )

              presigned_url = s3.generate_presigned_url(
                  'get_object',
                  Params={'Bucket': os.environ['REPORT_BUCKET'], 'Key': report_key},
                  ExpiresIn=3600,
              )

              ses.send_email(
                  Source=os.environ['SES_FROM'],
                  Destination={'ToAddresses': [user_email]},
                  Message={
                      'Subject': {'Data': 'Your expense report is ready'},
                      'Body': {'Text': {'Data': f'Download: {presigned_url}'}},
                  },
              )
    PYTHON
    filename = "handler.py"
  }
}

resource "aws_lambda_function" "report_gen" {
  function_name = "${var.project}-${var.environment}-report-gen"
  role          = aws_iam_role.lambda_report_gen.arn
  handler       = "handler.handler"
  runtime       = "python3.12"
  timeout       = 300
  memory_size   = 512

  filename         = data.archive_file.report_gen.output_path
  source_code_hash = data.archive_file.report_gen.output_base64sha256

  environment {
    variables = {
      REPORT_BUCKET = var.report_bucket_name
      SES_FROM      = "noreply@${var.ses_domain}"
      SES_REGION    = var.aws_region
    }
  }

  tracing_config { mode = "Active" }

  tags = { Project = var.project, Environment = var.environment }
}

# SQS queue for report generation requests
resource "aws_sqs_queue" "report_gen" {
  name                      = "${var.project}-${var.environment}-report-gen"
  visibility_timeout_seconds = 360
  message_retention_seconds  = 86400
  kms_master_key_id         = "alias/aws/sqs"

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.report_gen_dlq.arn
    maxReceiveCount     = 3
  })

  tags = { Project = var.project, Environment = var.environment }
}

resource "aws_sqs_queue" "report_gen_dlq" {
  name                      = "${var.project}-${var.environment}-report-gen-dlq"
  message_retention_seconds = 604800
  kms_master_key_id         = "alias/aws/sqs"

  tags = { Project = var.project, Environment = var.environment }
}

resource "aws_lambda_event_source_mapping" "report_gen" {
  event_source_arn = aws_sqs_queue.report_gen.arn
  function_name    = aws_lambda_function.report_gen.arn
  batch_size       = 1
}

# IAM role for Lambda
resource "aws_iam_role" "lambda_report_gen" {
  name = "${var.project}-${var.environment}-lambda-report-gen"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Action    = "sts:AssumeRole"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_report_basic" {
  role       = aws_iam_role.lambda_report_gen.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "lambda_report_gen" {
  name = "report-gen-permissions"
  role = aws_iam_role.lambda_report_gen.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      { Effect = "Allow", Action = ["s3:PutObject", "s3:GetObject"], Resource = "arn:aws:s3:::${var.report_bucket_name}/*" },
      { Effect = "Allow", Action = ["ses:SendEmail"],                Resource = "*" },
      { Effect = "Allow", Action = ["sqs:ReceiveMessage", "sqs:DeleteMessage", "sqs:GetQueueAttributes"], Resource = aws_sqs_queue.report_gen.arn },
      { Effect = "Allow", Action = ["xray:PutTraceSegments", "xray:PutTelemetryRecords"], Resource = "*" },
    ]
  })
}
