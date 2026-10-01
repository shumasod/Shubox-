variable "waf_blocked_ips" {
  description = "List of CIDR blocks to manually block at the WAF layer"
  type        = list(string)
  default     = []
}
