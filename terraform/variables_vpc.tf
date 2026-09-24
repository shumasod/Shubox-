variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "List of availability zones to use (2 or 3)"
  type        = list(string)
  default     = ["ap-northeast-1a", "ap-northeast-1c"]
}

variable "single_nat_gateway" {
  description = "Use a single NAT gateway instead of one per AZ (cheaper for non-prod)"
  type        = bool
  default     = false
}
