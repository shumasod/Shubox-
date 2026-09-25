# S3 bucket for ALB access logs
resource "aws_s3_bucket" "alb_logs" {
  bucket = "${var.project_name}-alb-access-logs-${data.aws_caller_identity.current.account_id}"

  tags = var.common_tags
}

resource "aws_s3_bucket_versioning" "alb_logs" {
  bucket = aws_s3_bucket.alb_logs.id
  versioning_configuration { status = "Disabled" }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "alb_logs" {
  bucket = aws_s3_bucket.alb_logs.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "alb_logs" {
  bucket                  = aws_s3_bucket.alb_logs.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "alb_logs" {
  bucket = aws_s3_bucket.alb_logs.id

  rule {
    id     = "expire-old-logs"
    status = "Enabled"
    expiration { days = var.alb_log_retention_days }

    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }
    transition {
      days          = 60
      storage_class = "GLACIER"
    }
  }
}

# Allow ELB service to write access logs
data "aws_elb_service_account" "main" {}

resource "aws_s3_bucket_policy" "alb_logs" {
  bucket = aws_s3_bucket.alb_logs.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = { AWS = data.aws_elb_service_account.main.arn }
        Action    = "s3:PutObject"
        Resource  = "${aws_s3_bucket.alb_logs.arn}/alb/AWSLogs/${data.aws_caller_identity.current.account_id}/*"
      },
      {
        Effect    = "Allow"
        Principal = { Service = "delivery.logs.amazonaws.com" }
        Action    = "s3:PutObject"
        Resource  = "${aws_s3_bucket.alb_logs.arn}/alb/AWSLogs/${data.aws_caller_identity.current.account_id}/*"
        Condition = { StringEquals = { "s3:x-amz-acl" = "bucket-owner-full-control" } }
      },
      {
        Effect    = "Allow"
        Principal = { Service = "delivery.logs.amazonaws.com" }
        Action    = "s3:GetBucketAcl"
        Resource  = aws_s3_bucket.alb_logs.arn
      }
    ]
  })
}

# Athena database + table for querying ALB logs
resource "aws_athena_database" "alb_logs" {
  name   = replace("${var.project_name}_alb_logs", "-", "_")
  bucket = aws_s3_bucket.alb_logs.bucket
}

resource "aws_athena_named_query" "alb_logs_create_table" {
  name      = "${var.project_name}-create-alb-logs-table"
  database  = aws_athena_database.alb_logs.name
  workgroup = "primary"

  query = <<-SQL
    CREATE EXTERNAL TABLE IF NOT EXISTS alb_access_logs (
      type                string,
      time                string,
      elb                 string,
      client_ip           string,
      client_port         int,
      target_ip           string,
      target_port         int,
      request_processing_time double,
      target_processing_time  double,
      response_processing_time double,
      elb_status_code     string,
      target_status_code  string,
      received_bytes      bigint,
      sent_bytes          bigint,
      request_verb        string,
      request_url         string,
      request_proto       string,
      user_agent          string,
      ssl_cipher          string,
      ssl_protocol        string,
      target_group_arn    string,
      trace_id            string,
      domain_name         string,
      chosen_cert_arn     string,
      matched_rule_priority string,
      request_creation_time string,
      actions_executed    string,
      redirect_url        string,
      error_reason        string
    )
    ROW FORMAT SERDE 'org.apache.hadoop.hive.serde2.RegexSerDe'
    WITH SERDEPROPERTIES (
      'serialization.format' = '1',
      'input.regex' = '([^ ]*) ([^ ]*) ([^ ]*) ([^ ]*):([0-9]*) ([^ ]*)[:-]([0-9]*) ([-.0-9]*) ([-.0-9]*) ([-.0-9]*) (|[-0-9]*) (-|[-0-9]*) ([-0-9]*) ([-0-9]*) "([^ ]*) (.*) (- |[^ ]*)" "([^"]*)" ([A-Z0-9-_]+) ([A-Za-z0-9.-]*) ([^ ]*) "([^"]*)" "([^"]*)" "([^"]*)" ([-.0-9]*) ([^ ]*) "([^"]*)" "([^"]*)" "([^ ]*)" "([^\s]+?)" "([^\s]+)" "([^ ]*)" "([^ ]*)"'
    )
    LOCATION 's3://${aws_s3_bucket.alb_logs.bucket}/alb/AWSLogs/${data.aws_caller_identity.current.account_id}/elasticloadbalancing/${var.aws_region}/';
  SQL
}

variable "alb_log_retention_days" {
  description = "Days to retain ALB access logs in S3"
  type        = number
  default     = 90
}

output "alb_logs_bucket" {
  description = "S3 bucket name for ALB access logs"
  value       = aws_s3_bucket.alb_logs.bucket
}
