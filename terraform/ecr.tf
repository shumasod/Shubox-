resource "aws_ecr_repository" "app" {
  name                 = "${var.project}-${var.environment}-app"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "KMS"
    kms_key         = var.kms_key_arn
  }

  tags = var.common_tags
}

# Lifecycle policy: keep last N tagged images + clean untagged after 1 day
resource "aws_ecr_lifecycle_policy" "app" {
  repository = aws_ecr_repository.app.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Remove untagged images after 1 day"
        selection = {
          tagStatus   = "untagged"
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = 1
        }
        action = { type = "expire" }
      },
      {
        rulePriority = 2
        description  = "Keep last ${var.ecr_keep_image_count} tagged images"
        selection = {
          tagStatus     = "tagged"
          tagPrefixList = ["sha-", "v", "release-"]
          countType     = "imageCountMoreThan"
          countNumber   = var.ecr_keep_image_count
        }
        action = { type = "expire" }
      }
    ]
  })
}

# Repository policy: allow GitHub Actions OIDC role to push
data "aws_iam_policy_document" "ecr_push" {
  statement {
    sid    = "AllowGitHubActionsOIDCPush"
    effect = "Allow"

    principals {
      type        = "AWS"
      identifiers = [var.github_actions_role_arn]
    }

    actions = [
      "ecr:GetDownloadUrlForLayer",
      "ecr:BatchGetImage",
      "ecr:BatchCheckLayerAvailability",
      "ecr:PutImage",
      "ecr:InitiateLayerUpload",
      "ecr:UploadLayerPart",
      "ecr:CompleteLayerUpload",
    ]
  }

  statement {
    sid    = "AllowECSTaskPull"
    effect = "Allow"

    principals {
      type        = "AWS"
      identifiers = [var.ecs_task_execution_role_arn]
    }

    actions = [
      "ecr:GetDownloadUrlForLayer",
      "ecr:BatchGetImage",
      "ecr:BatchCheckLayerAvailability",
    ]
  }
}

resource "aws_ecr_repository_policy" "app" {
  repository = aws_ecr_repository.app.name
  policy     = data.aws_iam_policy_document.ecr_push.json
}

# EventBridge rule to alert on HIGH/CRITICAL scan findings
resource "aws_cloudwatch_event_rule" "ecr_scan_findings" {
  name        = "${var.project}-${var.environment}-ecr-scan-findings"
  description = "Alert on HIGH/CRITICAL ECR image scan findings"

  event_pattern = jsonencode({
    source      = ["aws.ecr"]
    detail-type = ["ECR Image Scan"]
    detail = {
      repository-name   = [aws_ecr_repository.app.name]
      scan-status       = ["COMPLETE"]
      finding-severity-counts = {
        HIGH     = [{ exists = true }]
      }
    }
  })

  tags = var.common_tags
}

resource "aws_cloudwatch_event_target" "ecr_scan_sns" {
  rule      = aws_cloudwatch_event_rule.ecr_scan_findings.name
  target_id = "ECRScanFindingsToSNS"
  arn       = var.sns_ops_alerts_arn
}

output "ecr_repository_url" {
  description = "ECR repository URL for Docker push"
  value       = aws_ecr_repository.app.repository_url
}

output "ecr_repository_arn" {
  description = "ECR repository ARN"
  value       = aws_ecr_repository.app.arn
}
