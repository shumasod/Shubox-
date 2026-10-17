variable "acm_certificate_arn" {
  description = "ACM certificate ARN for HTTPS listener"
  type        = string
}

variable "public_subnet_ids" {
  description = "Public subnet IDs for ALB placement"
  type        = list(string)
}

variable "private_subnet_ids" {
  description = "Private subnet IDs for ECS task placement"
  type        = list(string)
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}
