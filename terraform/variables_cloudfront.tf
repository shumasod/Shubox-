variable "cloudfront_aliases" {
  description = "Custom domain aliases for CloudFront distribution"
  type        = list(string)
  default     = []
}

variable "acm_certificate_arn" {
  description = "ARN of ACM certificate in us-east-1 for CloudFront HTTPS (must be in us-east-1)"
  type        = string
}

variable "alb_dns_name" {
  description = "ALB DNS name for CloudFront API origin"
  type        = string
}

variable "log_bucket_domain_name" {
  description = "S3 bucket domain name for CloudFront access logs"
  type        = string
}

variable "waf_web_acl_arn" {
  description = "WAFv2 Web ACL ARN (must be CLOUDFRONT scope, created in us-east-1)"
  type        = string
}
