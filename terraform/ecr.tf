# ---------------------------------------------------------------------------
# ECR — container registry with lifecycle policy and image scan on push
# ---------------------------------------------------------------------------

resource "aws_ecr_repository" "app" {
  name                 = "${var.project}-${var.environment}-app"
  image_tag_mutability = "IMMUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "KMS"
    kms_key         = aws_kms_key.ecr.arn
  }

  tags = {
    Project     = var.project
    Environment = var.environment
  }
}

resource "aws_kms_key" "ecr" {
  description             = "KMS key for ECR repository encryption"
  deletion_window_in_days = 7
  enable_key_rotation     = true

  tags = {
    Project     = var.project
    Environment = var.environment
  }
}

resource "aws_kms_alias" "ecr" {
  name          = "alias/${var.project}-${var.environment}-ecr"
  target_key_id = aws_kms_key.ecr.key_id
}

# Lifecycle policy: keep last 10 production images, delete untagged after 1 day
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
        description  = "Keep last 10 release-tagged images"
        selection = {
          tagStatus     = "tagged"
          tagPrefixList = ["release-", "v"]
          countType     = "imageCountMoreThan"
          countNumber   = 10
        }
        action = { type = "expire" }
      },
      {
        rulePriority = 3
        description  = "Keep last 5 main/develop branch images"
        selection = {
          tagStatus     = "tagged"
          tagPrefixList = ["main-", "develop-", "sha-"]
          countType     = "imageCountMoreThan"
          countNumber   = 5
        }
        action = { type = "expire" }
      }
    ]
  })
}

# Repository policy: restrict pull to ECS task role and CI/CD role
resource "aws_ecr_repository_policy" "app" {
  repository = aws_ecr_repository.app.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowECSPull"
        Effect = "Allow"
        Principal = {
          AWS = [
            aws_iam_role.ecs_task_execution.arn,
          ]
        }
        Action = [
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:BatchCheckLayerAvailability",
        ]
      }
    ]
  })
}

output "ecr_repository_url" {
  value       = aws_ecr_repository.app.repository_url
  description = "ECR repository URL for Docker push/pull"
}
