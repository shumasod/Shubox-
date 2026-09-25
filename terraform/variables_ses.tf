variable "ses_domain" {
  description = "Domain to use for SES sending (e.g. mail.shubox.example.com)"
  type        = string
}

variable "ses_from_address" {
  description = "Default FROM address for all application emails"
  type        = string
}

variable "ses_manage_dns" {
  description = "Whether Terraform should create Route53 DKIM/SPF/DMARC records automatically"
  type        = bool
  default     = true
}

variable "ses_route53_zone_id" {
  description = "Route53 hosted zone ID for the SES domain (required when ses_manage_dns = true)"
  type        = string
  default     = ""
}

variable "ses_dmarc_rua_email" {
  description = "Email address to receive DMARC aggregate reports"
  type        = string
  default     = ""
}

variable "ses_tracking_domain" {
  description = "Custom click/open tracking domain (leave empty to use SES default)"
  type        = string
  default     = ""
}

variable "ses_dedicated_ip_pool_name" {
  description = "Dedicated IP pool name (leave empty to use shared IPs)"
  type        = string
  default     = ""
}
