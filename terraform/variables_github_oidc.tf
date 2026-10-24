variable "github_repos" {
  description = "GitHub repos allowed to assume the Actions role (format: org/repo)"
  type        = list(string)
  default     = []
}

variable "create_github_oidc_provider" {
  description = "Create the OIDC provider (false if already exists in the account)"
  type        = bool
  default     = true
}
