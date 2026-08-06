variable "waf_rate_limit_api" {
  description = "Max requests per 5-minute window per IP on /api/* paths"
  type        = number
  default     = 1000
}

variable "waf_rate_limit_auth" {
  description = "Max requests per 5-minute window per IP on /api/auth/* paths"
  type        = number
  default     = 20
}
