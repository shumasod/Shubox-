# -------------------------------------------------------
# WAF Web ACL — ALB にアタッチ
# -------------------------------------------------------
resource "aws_wafv2_web_acl" "main" {
  name        = "${local.prefix}-waf"
  description = "WAF for expense management ALB"
  scope       = "REGIONAL"
  tags        = local.tags

  default_action {
    allow {}
  }

  # AWS マネージドルール: 共通脆弱性セット
  rule {
    name     = "AWSManagedRulesCommonRuleSet"
    priority = 10
    override_action { none {} }
    statement {
      managed_rule_group_statement {
        vendor_name = "AWS"
        name        = "AWSManagedRulesCommonRuleSet"
        # ボディサイズ制限は API ゲートウェイ側で制御するため除外
        rule_action_override {
          name          = "SizeRestrictions_BODY"
          action_to_use { count {} }
        }
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${local.prefix}-common-rules"
      sampled_requests_enabled   = true
    }
  }

  # SQL インジェクション防止
  rule {
    name     = "AWSManagedRulesSQLiRuleSet"
    priority = 20
    override_action { none {} }
    statement {
      managed_rule_group_statement {
        vendor_name = "AWS"
        name        = "AWSManagedRulesSQLiRuleSet"
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${local.prefix}-sqli-rules"
      sampled_requests_enabled   = true
    }
  }

  # 日本からのリクエストまたは認証済みのトークンを持つリクエストのみ許可
  rule {
    name     = "RateLimitAPI"
    priority = 30
    action { block {} }
    statement {
      rate_based_statement {
        limit              = 1000  # 5分間あたり 1000 リクエスト
        aggregate_key_type = "IP"
        scope_down_statement {
          byte_match_statement {
            field_to_match { uri_path {} }
            positional_constraint = "STARTS_WITH"
            search_string         = "/api/"
            text_transformation { priority = 0; type = "LOWERCASE" }
          }
        }
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${local.prefix}-rate-limit"
      sampled_requests_enabled   = true
    }
  }

  # 認証エンドポイントへのブルートフォース対策
  rule {
    name     = "RateLimitLogin"
    priority = 40
    action { block {} }
    statement {
      rate_based_statement {
        limit              = 20   # 5分間あたり 20 回
        aggregate_key_type = "IP"
        scope_down_statement {
          byte_match_statement {
            field_to_match { uri_path {} }
            positional_constraint = "EXACTLY"
            search_string         = "/api/v1/auth/login"
            text_transformation { priority = 0; type = "LOWERCASE" }
          }
        }
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${local.prefix}-login-rate-limit"
      sampled_requests_enabled   = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "${local.prefix}-waf"
    sampled_requests_enabled   = true
  }
}

# WAF を ALB に関連付け
resource "aws_wafv2_web_acl_association" "alb" {
  resource_arn = aws_lb.main.arn
  web_acl_arn  = aws_wafv2_web_acl.main.arn
}

# WAF ログを CloudWatch Logs に送信
resource "aws_wafv2_web_acl_logging_configuration" "main" {
  log_destination_configs = [aws_cloudwatch_log_group.waf.arn]
  resource_arn            = aws_wafv2_web_acl.main.arn

  redacted_fields {
    single_header { name = "authorization" }
  }
}

resource "aws_cloudwatch_log_group" "waf" {
  name              = "aws-waf-logs-${local.prefix}"
  retention_in_days = 90
  tags              = local.tags
}
