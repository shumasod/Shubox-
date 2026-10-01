# ECS Fargate cluster and service for the Laravel API

resource "aws_ecs_cluster" "main" {
  name = "${var.project}-${var.environment}"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = local.common_tags
}

resource "aws_ecs_cluster_capacity_providers" "main" {
  cluster_name       = aws_ecs_cluster.main.name
  capacity_providers = ["FARGATE", "FARGATE_SPOT"]

  default_capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight            = 1
    base              = 1
  }
}

resource "aws_cloudwatch_log_group" "ecs_app" {
  name              = "/ecs/${var.project}-${var.environment}/app"
  retention_in_days = 30
  tags              = local.common_tags
}

resource "aws_ecs_task_definition" "app" {
  family                   = "${var.project}-${var.environment}-app"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.ecs_task_cpu
  memory                   = var.ecs_task_memory
  execution_role_arn       = aws_iam_role.ecs_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([
    {
      name      = "app"
      image     = "${aws_ecr_repository.app.repository_url}:${var.app_image_tag}"
      essential = true

      portMappings = [{
        containerPort = 9000
        protocol      = "tcp"
      }]

      environment = [
        { name = "APP_ENV",         value = var.environment },
        { name = "LOG_CHANNEL",     value = "stderr" },
        { name = "CACHE_DRIVER",    value = "redis" },
        { name = "SESSION_DRIVER",  value = "redis" },
        { name = "QUEUE_CONNECTION", value = "sqs" },
      ]

      secrets = [
        { name = "APP_KEY",       valueFrom = "${aws_ssm_parameter.app_key.arn}" },
        { name = "DB_HOST",       valueFrom = "${aws_ssm_parameter.db_host.arn}" },
        { name = "DB_PASSWORD",   valueFrom = "${aws_ssm_parameter.db_password.arn}" },
        { name = "REDIS_HOST",    valueFrom = "${aws_ssm_parameter.redis_host.arn}" },
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs_app.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "app"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "curl -sf http://localhost:9000/health || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60
      }
    },
    {
      name      = "nginx"
      image     = "nginx:1.25-alpine"
      essential = true

      portMappings = [{
        containerPort = 80
        protocol      = "tcp"
      }]

      dependsOn = [{
        containerName = "app"
        condition     = "HEALTHY"
      }]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs_app.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "nginx"
        }
      }
    }
  ])

  tags = local.common_tags
}

resource "aws_ecs_service" "app" {
  name                               = "${var.project}-${var.environment}-app"
  cluster                            = aws_ecs_cluster.main.id
  task_definition                    = aws_ecs_task_definition.app.arn
  desired_count                      = var.ecs_desired_count
  launch_type                        = "FARGATE"
  platform_version                   = "LATEST"
  health_check_grace_period_seconds  = 120
  enable_execute_command             = var.environment != "production"

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  deployment_controller {
    type = "ECS"
  }

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.app.arn
    container_name   = "nginx"
    container_port   = 80
  }

  lifecycle {
    ignore_changes = [task_definition, desired_count]
  }

  tags = local.common_tags
}

resource "aws_security_group" "ecs" {
  name        = "${var.project}-${var.environment}-ecs"
  description = "ECS task security group"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = local.common_tags
}

# ECS execution role
resource "aws_iam_role" "ecs_execution" {
  name = "${var.project}-${var.environment}-ecs-execution"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "ecs_execution" {
  role       = aws_iam_role.ecs_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy" "ecs_execution_ssm" {
  name = "ssm-secrets"
  role = aws_iam_role.ecs_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = ["ssm:GetParameters", "kms:Decrypt"]
      Resource = [
        "arn:aws:ssm:${var.aws_region}:*:parameter/${var.project}/${var.environment}/*"
      ]
    }]
  })
}

# ECS task role
resource "aws_iam_role" "ecs_task" {
  name = "${var.project}-${var.environment}-ecs-task"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy" "ecs_task_s3" {
  name = "s3-access"
  role = aws_iam_role.ecs_task.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
        Resource = "arn:aws:s3:::${var.project}-${var.environment}-*/*"
      },
      {
        Effect   = "Allow"
        Action   = ["ses:SendEmail", "ses:SendRawEmail"]
        Resource = "*"
      },
      {
        Effect   = "Allow"
        Action   = ["sqs:SendMessage", "sqs:ReceiveMessage", "sqs:DeleteMessage"]
        Resource = "arn:aws:sqs:${var.aws_region}:*:${var.project}-${var.environment}-*"
      }
    ]
  })
}

output "ecs_cluster_name" {
  value = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  value = aws_ecs_service.app.name
}
