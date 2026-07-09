data "archive_file" "thumbnail_lambda" {
  type        = "zip"
  output_path = "${path.module}/.terraform/lambda/thumbnail.zip"

  source {
    content  = <<-PYTHON
import boto3, io, os
from PIL import Image

s3 = boto3.client('s3')

THUMBNAIL_SIZES = [(150, 150), (400, 400)]
SUPPORTED_TYPES = {'image/jpeg', 'image/png', 'image/webp'}

def handler(event, context):
    for record in event['Records']:
        bucket = record['s3']['bucket']['name']
        key    = record['s3']['object']['key']

        if not key.startswith('receipts/original/'):
            return

        head = s3.head_object(Bucket=bucket, Key=key)
        if head.get('ContentType', '') not in SUPPORTED_TYPES:
            print(f'Skipping unsupported type: {head.get("ContentType")}')
            return

        obj   = s3.get_object(Bucket=bucket, Key=key)
        image = Image.open(io.BytesIO(obj['Body'].read()))
        image = image.convert('RGB')

        filename = key.split('/')[-1]

        for w, h in THUMBNAIL_SIZES:
            thumb = image.copy()
            thumb.thumbnail((w, h), Image.LANCZOS)
            buf = io.BytesIO()
            thumb.save(buf, format='JPEG', quality=85, optimize=True)
            buf.seek(0)

            dest_key = f'receipts/thumbnails/{w}x{h}/{filename}'
            s3.put_object(
                Bucket=bucket,
                Key=dest_key,
                Body=buf,
                ContentType='image/jpeg',
                CacheControl='public, max-age=31536000',
            )
            print(f'Created thumbnail: {dest_key}')
PYTHON
    filename = "lambda_function.py"
  }
}

resource "aws_iam_role" "thumbnail_lambda" {
  name = "${var.project_name}-thumbnail-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })

  tags = var.common_tags
}

resource "aws_iam_role_policy" "thumbnail_lambda" {
  name = "thumbnail-lambda-policy"
  role = aws_iam_role.thumbnail_lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["s3:GetObject", "s3:HeadObject"]
        Resource = "arn:aws:s3:::${var.s3_receipts_bucket}/receipts/original/*"
      },
      {
        Effect   = "Allow"
        Action   = ["s3:PutObject"]
        Resource = "arn:aws:s3:::${var.s3_receipts_bucket}/receipts/thumbnails/*"
      },
      {
        Effect   = "Allow"
        Action   = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
        Resource = "arn:aws:logs:*:*:*"
      }
    ]
  })
}

resource "aws_lambda_function" "thumbnail" {
  function_name    = "${var.project_name}-receipt-thumbnail"
  role             = aws_iam_role.thumbnail_lambda.arn
  handler          = "lambda_function.handler"
  runtime          = "python3.12"
  filename         = data.archive_file.thumbnail_lambda.output_path
  source_code_hash = data.archive_file.thumbnail_lambda.output_base64sha256
  timeout          = 30
  memory_size      = 512

  layers = [var.pillow_lambda_layer_arn]

  environment {
    variables = {
      LOG_LEVEL = "INFO"
    }
  }

  tags = var.common_tags
}

resource "aws_lambda_permission" "allow_s3" {
  statement_id  = "AllowS3Invoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.thumbnail.function_name
  principal     = "s3.amazonaws.com"
  source_arn    = "arn:aws:s3:::${var.s3_receipts_bucket}"
}

resource "aws_s3_bucket_notification" "receipt_upload" {
  bucket = var.s3_receipts_bucket

  lambda_function {
    lambda_function_arn = aws_lambda_function.thumbnail.arn
    events              = ["s3:ObjectCreated:*"]
    filter_prefix       = "receipts/original/"
    filter_suffix       = ""
  }

  depends_on = [aws_lambda_permission.allow_s3]
}

variable "s3_receipts_bucket" {
  description = "S3 bucket name for receipt storage"
  type        = string
}

variable "pillow_lambda_layer_arn" {
  description = "ARN of Lambda layer containing Pillow (PIL) library"
  type        = string
}
