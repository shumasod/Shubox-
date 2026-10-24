# WAFv2 Web ACL — must be deployed in us-east-1 for CloudFront
resource "aws_wafv2_web_acl" "main" {
  provider    = aws.us_east_1
  name        = "${var.project}-${var.environment}-web-acl"
# WAFv2 must be created in us-east-1 for CloudFront association
resource "aws_wafv2_web_acl" "main" {
  provider    = aws.us_east_1
  name        = "${var.project}-${var.environment}-waf"
  description = "WAF for ${var.project} CloudFront distribution"
  scope       = "CLOUDFRONT"

  default_action {
    allow {}
  }

  # AWS Managed Rules — Common Rule Set
  # AWS Managed Rules: Core rule set
  rule {
    name     = "AWSManagedRulesCommonRuleSet"
    priority = 10

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"

        rule_action_override {
          name = "SizeRestrictions_BODY"
          action_to_use {
            allow {}
          }
        }
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "CommonRuleSet"
      metric_name                = "${var.project}-${var.environment}-common-rules"
      sampled_requests_enabled   = true
    }
  }

  # AWS Managed Rules — Known Bad Inputs
  # AWS Managed Rules: Known bad inputs
  rule {
    name     = "AWSManagedRulesKnownBadInputsRuleSet"
    priority = 20

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesKnownBadInputsRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "KnownBadInputs"
      metric_name                = "${var.project}-${var.environment}-bad-inputs"
      sampled_requests_enabled   = true
    }
  }

  # AWS Managed Rules — SQL Injection
  # AWS Managed Rules: SQL injection
  rule {
    name     = "AWSManagedRulesSQLiRuleSet"
    priority = 30

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesSQLiRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "SQLiRuleSet"
      metric_name                = "${var.project}-${var.environment}-sqli"
      sampled_requests_enabled   = true
    }
  }

  # Custom rate limiting — 1000 req/5min per IP on /api/*
  rule {
    name     = "ApiRateLimit"
  # Custom: IP-based rate limiting per 5-minute window
  rule {
    name     = "RateLimitPerIP"
    priority = 40

    action {
      block {}
    }

    statement {
      rate_based_statement {
        limit              = 1000
        limit              = var.waf_rate_limit_per_ip
        aggregate_key_type = "IP"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${var.project}-${var.environment}-rate-limit"
      sampled_requests_enabled   = true
    }
  }

  # Custom: Strict rate limiting on auth endpoints
  rule {
    name     = "RateLimitAuthEndpoints"
    priority = 50

    action {
      block {}
    }

    statement {
      rate_based_statement {
        limit              = var.waf_auth_rate_limit
        aggregate_key_type = "IP"

        scope_down_statement {
          byte_match_statement {
            field_to_match {
              uri_path {}
            }
            positional_constraint = "STARTS_WITH"
            search_string         = "/api/"
            search_string         = "/api/auth"
            field_to_match {
              uri_path {}
            }
            text_transformation {
              priority = 0
              type     = "LOWERCASE"
            }
            positional_constraint = "STARTS_WITH"
          }
        }
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "ApiRateLimit"
      metric_name                = "${var.project}-${var.environment}-auth-rate-limit"
      sampled_requests_enabled   = true
    }
  }

  # Stricter rate limit on auth endpoints — 20 req/5min per IP
  rule {
    name     = "AuthRateLimit"
    priority = 50
  # Custom: Block requests with oversized bodies on upload endpoint
  rule {
    name     = "BlockLargeBodyOnNonUpload"
    priority = 60

    action {
      block {}
    }

    statement {
      rate_based_statement {
        limit              = 20
        aggregate_key_type = "IP"

        scope_down_statement {
          byte_match_statement {
            field_to_match {
              uri_path {}
            }
            positional_constraint = "STARTS_WITH"
            search_string         = "/api/auth/"
            text_transformation {
              priority = 0
              type     = "LOWERCASE"
      and_statement {
        statement {
          size_constraint_statement {
            field_to_match {
              body {
                oversize_handling = "MATCH"
              }
            }
            comparison_operator = "GT"
            size                = var.waf_max_body_size_bytes
            text_transformation {
              priority = 0
              type     = "NONE"
            }
          }
        }

        statement {
          not_statement {
            statement {
              byte_match_statement {
                search_string         = "/api/import"
                field_to_match {
                  uri_path {}
                }
                text_transformation {
                  priority = 0
                  type     = "LOWERCASE"
                }
                positional_constraint = "STARTS_WITH"
              }
            }
          }
        }
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "AuthRateLimit"
      metric_name                = "${var.project}-${var.environment}-large-body"
      sampled_requests_enabled   = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "${var.project}-${var.environment}-web-acl"
    sampled_requests_enabled   = true
  }

  tags = local.common_tags
}

# CloudWatch dashboard for WAF metrics
resource "aws_cloudwatch_log_group" "waf" {
  provider          = aws.us_east_1
  name              = "/aws/waf/${var.project}-${var.environment}"
  retention_in_days = 90

  tags = local.common_tags
    metric_name                = "${var.project}-${var.environment}-waf"
    sampled_requests_enabled   = true
  }

  tags = var.common_tags
}

# CloudWatch log group for WAF logs (must start with aws-waf-logs-)
resource "aws_cloudwatch_log_group" "waf" {
  provider          = aws.us_east_1
  name              = "aws-waf-logs-${var.project}-${var.environment}"
  retention_in_days = var.waf_log_retention_days
  kms_key_id        = var.kms_key_arn_us_east_1

  tags = var.common_tags
}

resource "aws_wafv2_web_acl_logging_configuration" "main" {
  provider                = aws.us_east_1
  log_destination_configs = [aws_cloudwatch_log_group.waf.arn]
  resource_arn            = aws_wafv2_web_acl.main.arn

  redacted_fields {
    single_header {
      name = "authorization"
  logging_filter {
    default_behavior = "DROP"

    filter {
      behavior = "KEEP"

      condition {
        action_condition {
          action = "BLOCK"
        }
      }

      requirement = "MEETS_ANY"
    }
  }
}

output "waf_web_acl_arn" {
  value = aws_wafv2_web_acl.main.arn
}

output "waf_web_acl_id" {
  value = aws_wafv2_web_acl.main.id
  description = "WAFv2 WebACL ARN for CloudFront association"
  value       = aws_wafv2_web_acl.main.arn
}

output "waf_web_acl_id" {
  description = "WAFv2 WebACL ID"
  value       = aws_wafv2_web_acl.main.id
}
