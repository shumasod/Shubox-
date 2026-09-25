variable "redis_node_type" {
  description = "ElastiCache Redis node instance type"
  type        = string
  default     = "cache.t4g.small"
}

variable "redis_num_cache_nodes" {
  description = "Number of cache nodes in the Redis replication group"
  type        = number
  default     = 2
}

variable "redis_auth_token" {
  description = "AUTH token for Redis in-transit encryption (min 16 chars)"
  type        = string
  sensitive   = true
}
