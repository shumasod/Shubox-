# WAFv2 Web ACL — must be deployed in us-east-1 for CloudFront
resource "aws_wafv2_web_acl" "main" {
  provider    = aws.us_east_1
  name        = "${var.project}-${var.environment}-web-acl"
  description = "WAF for ${var.project} CloudFront distribution"
  scope       = "CLOUDFRONT"

  default_action {
    allow {}
  }

  # AWS Managed Rules — Common Rule Set
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
      sampled_requests_enabled   = true
    }
  }

  # AWS Managed Rules — Known Bad Inputs
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
      sampled_requests_enabled   = true
    }
  }

  # AWS Managed Rules — SQL Injection
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
      sampled_requests_enabled   = true
    }
  }

  # Custom rate limiting — 1000 req/5min per IP on /api/*
  rule {
    name     = "ApiRateLimit"
    priority = 40

    action {
      block {}
    }

    statement {
      rate_based_statement {
        limit              = 1000
        aggregate_key_type = "IP"

        scope_down_statement {
          byte_match_statement {
            field_to_match {
              uri_path {}
            }
            positional_constraint = "STARTS_WITH"
            search_string         = "/api/"
            text_transformation {
              priority = 0
              type     = "LOWERCASE"
            }
          }
        }
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "ApiRateLimit"
      sampled_requests_enabled   = true
    }
  }

  # Stricter rate limit on auth endpoints — 20 req/5min per IP
  rule {
    name     = "AuthRateLimit"
    priority = 50

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
            }
          }
        }
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "AuthRateLimit"
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
}

resource "aws_wafv2_web_acl_logging_configuration" "main" {
  provider                = aws.us_east_1
  log_destination_configs = [aws_cloudwatch_log_group.waf.arn]
  resource_arn            = aws_wafv2_web_acl.main.arn

  redacted_fields {
    single_header {
      name = "authorization"
    }
  }
}

output "waf_web_acl_arn" {
  value = aws_wafv2_web_acl.main.arn
}

output "waf_web_acl_id" {
  value = aws_wafv2_web_acl.main.id
}
