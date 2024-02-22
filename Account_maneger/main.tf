# main.tf

provider "aws" {
  region = "us-east-1" # リージョンを適切なものに変更
}

resource "aws_ecs_cluster" "example" {
  name = "account-management-cluster"
}

resource "aws_ecs_task_definition" "example" {
  family                   = "account-management-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"

  execution_role_arn = aws_iam_role.execution_role.arn
  task_role_arn      = aws_iam_role.task_role.arn

  container_definitions = jsonencode([{
    name  = "account-management-container"
    image = "your-docker-image-url"
    portMappings = [{
      containerPort = 80
      hostPort      = 80
    }]
  }])
}

resource "aws_ecs_service" "example" {
  name            = "account-management-service"
  cluster         = aws_ecs_cluster.example.id
  task_definition = aws_ecs_task_definition.example.arn
  launch_type     = "FARGATE"
  desired_count   = 1

  network_configuration {
    subnets = aws_subnet.example[*].id
    security_groups = [aws_security_group.example.id]
  }
}

resource "aws_iam_role" "execution_role" {
  name = "ecs_execution_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Action = "sts:AssumeRole",
      Effect = "Allow",
      Principal = {
        Service = "ecs-tasks.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role" "task_role" {
  name = "ecs_task_role"
  # 必要なポリシーを追加
}

resource "aws_subnet" "example" {
  count                   = 2
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  cidr_block              = cidrsubnet(data.aws_vpcs.example.cidr_block, 8, count.index)
  vpc_id                  = data.aws_vpcs.example.id
  map_public_ip_on_launch = true
}

resource "aws_security_group" "example" {
  name        = "account-management-sg"
  description = "Allow inbound traffic"
  vpc_id      = data.aws_vpcs.example.id

  ingress {
    from_port = 80
    to_port   = 80
    protocol  = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

data "aws_availability_zones" "available" {}

data "aws_vpcs" "example" {
  default = true
}
