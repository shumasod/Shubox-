variable "redis_node_type" {
  description = "ElastiCache Redis node type"
  type        = string
  default     = "cache.t4g.medium"
}

variable "redis_num_replicas" {
  description = "Number of read replicas (0 = standalone, 1+ = multi-AZ)"
  type        = number
  default     = 1

  validation {
    condition     = var.redis_num_replicas >= 0 && var.redis_num_replicas <= 5
    error_message = "redis_num_replicas must be between 0 and 5."
  }
}

variable "redis_auth_token" {
  description = "Redis AUTH token for in-transit encryption (min 16 chars)"
  type        = string
  sensitive   = true
}
