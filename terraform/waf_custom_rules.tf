# ---------------------------------------------------------------------------
# WAFv2 — custom rules to supplement AWS managed rule groups
# This file extends the existing WAF WebACL defined in cloudfront_waf.tf
# ---------------------------------------------------------------------------

# Custom IP block list (populated via automation / incident response)
resource "aws_wafv2_ip_set" "blocked_ips" {
  name               = "${var.project}-${var.environment}-blocked-ips"
  description        = "Manually blocked IP addresses"
  scope              = "CLOUDFRONT"
  provider           = aws.us_east_1
  ip_address_version = "IPV4"
  addresses          = var.waf_blocked_ips

  tags = { Project = var.project, Environment = var.environment }
}

# Regex pattern set for path traversal detection
resource "aws_wafv2_regex_pattern_set" "path_traversal" {
  name        = "${var.project}-${var.environment}-path-traversal"
  description = "Detect directory traversal attempts"
  scope       = "CLOUDFRONT"
  provider    = aws.us_east_1

  regular_expression {
    regex_string = "(\\.\\./|%2e%2e%2f|%252e%252e%252f|\\.\\.%5c)"
  }

  tags = { Project = var.project, Environment = var.environment }
}

# Custom WAF rule group
resource "aws_wafv2_rule_group" "custom" {
  name        = "${var.project}-${var.environment}-custom-rules"
  description = "Custom security rules for the expense management application"
  scope       = "CLOUDFRONT"
  provider    = aws.us_east_1
  capacity    = 100

  # Rule 1: Block manually blocked IPs
  rule {
    name     = "BlockManualIPList"
    priority = 1

    action { block {} }

    statement {
      ip_set_reference_statement {
        arn = aws_wafv2_ip_set.blocked_ips.arn
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "BlockedIPs"
      sampled_requests_enabled   = true
    }
  }

  # Rule 2: Block path traversal in URI
  rule {
    name     = "BlockPathTraversal"
    priority = 2

    action { block {} }

    statement {
      regex_pattern_set_reference_statement {
        arn = aws_wafv2_regex_pattern_set.path_traversal.arn
        field_to_match { uri_path {} }
        text_transformation {
          priority = 0
          type     = "URL_DECODE"
        }
        text_transformation {
          priority = 1
          type     = "LOWERCASE"
        }
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "PathTraversalBlocked"
      sampled_requests_enabled   = true
    }
  }

  # Rule 3: Block oversized request bodies (> 64 KB)
  rule {
    name     = "BlockOversizedBody"
    priority = 3

    action { block {} }

    statement {
      size_constraint_statement {
        comparison_operator = "GT"
        size                = 65536
        field_to_match { body { oversize_handling = "MATCH" } }
        text_transformation {
          priority = 0
          type     = "NONE"
        }
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "OversizedBodyBlocked"
      sampled_requests_enabled   = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "${var.project}-custom-rules"
    sampled_requests_enabled   = true
  }

  tags = { Project = var.project, Environment = var.environment }
}
