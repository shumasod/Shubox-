variable "ses_domain" {
  description = "Domain to verify in SES for email sending"
  type        = string
}

variable "route53_zone_id" {
  description = "Route 53 hosted zone ID for DKIM DNS records"
  type        = string
}
