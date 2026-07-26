variable "cloudfront_aliases" {
  description = "Custom domain names (CNAMEs) for the CloudFront distribution"
  type        = list(string)
  default     = []
}

variable "cloudfront_price_class" {
  description = "CloudFront price class — PriceClass_100 (US/EU) or PriceClass_All"
  type        = string
  default     = "PriceClass_100"

  validation {
    condition     = contains(["PriceClass_100", "PriceClass_200", "PriceClass_All"], var.cloudfront_price_class)
    error_message = "Must be PriceClass_100, PriceClass_200, or PriceClass_All."
  }
}

variable "cloudfront_acm_certificate_arn" {
  description = "ACM certificate ARN (must be in us-east-1) for HTTPS on custom aliases"
  type        = string
  default     = ""
}
