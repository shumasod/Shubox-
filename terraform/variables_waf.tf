variable "waf_blocked_countries" {
  description = "ISO 3166-1 alpha-2 country codes to geo-block at CloudFront WAF"
  type        = list(string)
  default     = []
}
