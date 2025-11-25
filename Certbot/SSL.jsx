#!/usr/bin/env python3
"""
ACM証明書管理Lambda関数

機能:
- 複数リージョンのACM証明書を取得
- 有効期限チェックとアラート
- 証明書更新ステータスの確認
- Slack通知（オプション）
"""

import json
import logging
import os
from datetime import datetime, timezone
from typing import Any

import boto3
from botocore.exceptions import ClientError

# ロギング設定
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# 環境変数
ALERT_THRESHOLD_CRITICAL = int(os.environ.get('ALERT_THRESHOLD_CRITICAL', '7'))
ALERT_THRESHOLD_WARNING = int(os.environ.get('ALERT_THRESHOLD_WARNING', '30'))
SLACK_WEBHOOK_URL = os.environ.get('SLACK_WEBHOOK_URL', '')
TARGET_REGIONS = os.environ.get('TARGET_REGIONS', 'us-east-1,ap-northeast-1').split(',')


def create_response(status_code: int, body: dict) -> dict:
    """API Gatewayレスポンスを生成"""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
        },
        'body': json.dumps(body, default=str, ensure_ascii=False)
    }


def get_service_from_arn(resource_arn: str) -> str:
    """ARNからサービス名を抽出"""
    arn_lower = resource_arn.lower()
    
    if 'cloudfront' in arn_lower:
        return 'CloudFront'
    elif 'elasticloadbalancing' in arn_lower:
        if '/app/' in resource_arn:
            return 'ALB'
        elif '/net/' in resource_arn:
            return 'NLB'
        else:
            return 'ELB'
    elif 'apigateway' in arn_lower:
        return 'API Gateway'
    elif 'appsync' in arn_lower:
        return 'AppSync'
    elif 'elastic-beanstalk' in arn_lower:
        return 'Elastic Beanstalk'
    else:
        return 'Other'


def get_certificates_for_region(region: str) -> list[dict]:
    """指定リージョンの証明書を取得"""
    certificates = []
    
    try:
        acm_client = boto3.client('acm', region_name=region)
        paginator = acm_client.get_paginator('list_certificates')
        
        for page in paginator.paginate(
            Includes={
                'keyTypes': [
                    'RSA_1024', 'RSA_2048', 'RSA_3072', 'RSA_4096',
                    'EC_prime256v1', 'EC_secp384r1', 'EC_secp521r1'
                ]
            }
        ):
            for cert_summary in page.get('CertificateSummaryList', []):
                cert_arn = cert_summary['CertificateArn']
                
                try:
                    cert_response = acm_client.describe_certificate(
                        CertificateArn=cert_arn
                    )
                    cert_detail = cert_response['Certificate']
                    
                    # 有効期限の計算
                    expiry_date = cert_detail.get('NotAfter')
                    if expiry_date:
                        if expiry_date.tzinfo is None:
                            expiry_date = expiry_date.replace(tzinfo=timezone.utc)
                        now = datetime.now(timezone.utc)
                        days_until_expiry = (expiry_date - now).days
                    else:
                        days_until_expiry = -1
                    
                    # 使用中のサービスを取得
                    in_use_by = cert_detail.get('InUseBy', [])
                    services = [get_service_from_arn(arn) for arn in in_use_by]
                    
                    # 証明書タイプと自動更新の判定
                    cert_type = cert_detail.get('Type', 'UNKNOWN')
                    auto_renew = cert_type == 'AMAZON_ISSUED'
                    
                    certificate_info = {
                        'certificateArn': cert_arn,
                        'domain': cert_detail.get('DomainName', 'N/A'),
                        'subjectAlternativeNames': cert_detail.get('SubjectAlternativeNames', []),
                        'region': region,
                        'status': cert_detail.get('Status', 'UNKNOWN'),
                        'type': cert_type,
                        'issuer': cert_detail.get('Issuer', 'N/A'),
                        'notBefore': cert_detail.get('NotBefore'),
                        'notAfter': expiry_date,
                        'daysUntilExpiry': days_until_expiry,
                        'autoRenew': auto_renew,
                        'renewalEligibility': cert_detail.get('RenewalEligibility', 'N/A'),
                        'inUseBy': in_use_by,
                        'services': services,
                        'validationMethod': _get_validation_method(cert_detail),
                        'keyAlgorithm': cert_detail.get('KeyAlgorithm', 'N/A')
                    }
                    
                    certificates.append(certificate_info)
                    
                except ClientError as e:
                    logger.error(f"証明書詳細の取得に失敗: {cert_arn}, エラー: {e}")
                    continue
                    
    except ClientError as e:
        logger.error(f"リージョン {region} の証明書取得に失敗: {e}")
        raise
    
    return certificates


def _get_validation_method(cert_detail: dict) -> str:
    """検証方法を取得"""
    options = cert_detail.get('DomainValidationOptions', [])
    if options:
        return options[0].get('ValidationMethod', 'N/A')
    return 'N/A'


def get_all_certificates() -> list[dict]:
    """全リージョンの証明書を取得"""
    all_certificates = []
    
    for region in TARGET_REGIONS:
        region = region.strip()
        if region:
            logger.info(f"リージョン {region} の証明書を取得中...")
            try:
                certs = get_certificates_for_region(region)
                all_certificates.extend(certs)
                logger.info(f"リージョン {region}: {len(certs)}件の証明書を取得")
            except Exception as e:
                logger.error(f"リージョン {region} でエラー: {e}")
    
    return all_certificates


def classify_certificates(certificates: list[dict]) -> dict:
    """証明書を期限切れ状態で分類"""
    critical = []  # 7日以内
    warning = []   # 30日以内
    healthy = []   # 30日以上
    expired = []   # 期限切れ
    
    for cert in certificates:
        days = cert['daysUntilExpiry']
        
        if days < 0:
            expired.append(cert)
        elif days <= ALERT_THRESHOLD_CRITICAL:
            critical.append(cert)
        elif days <= ALERT_THRESHOLD_WARNING:
            warning.append(cert)
        else:
            healthy.append(cert)
    
    return {
        'expired': expired,
        'critical': critical,
        'warning': warning,
        'healthy': healthy
    }


def send_slack_notification(classified: dict) -> bool:
    """Slack通知を送信"""
    if not SLACK_WEBHOOK_URL:
        logger.info("Slack Webhook URLが設定されていないため、通知をスキップ")
        return False
    
    # 通知が必要かチェック
    if not classified['expired'] and not classified['critical'] and not classified['warning']:
        logger.info("通知対象の証明書がありません")
        return False
    
    try:
        import urllib.request
        
        blocks = [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": "🔐 SSL証明書有効期限アラート",
                    "emoji": True
                }
            }
        ]
        
        # 期限切れ
        if classified['expired']:
            blocks.append({
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"*🔴 期限切れ ({len(classified['expired'])}件)*"
                }
            })
            for cert in classified['expired']:
                blocks.append({
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"• `{cert['domain']}` ({cert['region']}) - *期限切れ*"
                    }
                })
        
        # 緊急
        if classified['critical']:
            blocks.append({
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"*🟠 緊急 - {ALERT_THRESHOLD_CRITICAL}日以内 ({len(classified['critical'])}件)*"
                }
            })
            for cert in classified['critical']:
                auto_renew_text = "自動更新" if cert['autoRenew'] else "手動更新"
                blocks.append({
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"• `{cert['domain']}` ({cert['region']}) - 残り*{cert['daysUntilExpiry']}日* [{auto_renew_text}]"
                    }
                })
        
        # 警告
        if classified['warning']:
            blocks.append({
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"*🟡 警告 - {ALERT_THRESHOLD_WARNING}日以内 ({len(classified['warning'])}件)*"
                }
            })
            for cert in classified['warning']:
                auto_renew_text = "自動更新" if cert['autoRenew'] else "手動更新"
                blocks.append({
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"• `{cert['domain']}` ({cert['region']}) - 残り*{cert['daysUntilExpiry']}日* [{auto_renew_text}]"
                    }
                })
        
        # タイムスタンプ
        blocks.append({
            "type": "context",
            "elements": [
                {
                    "type": "mrkdwn",
                    "text": f"チェック日時: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}"
                }
            ]
        })
        
        payload = json.dumps({"blocks": blocks}).encode('utf-8')
        
        req = urllib.request.Request(
            SLACK_WEBHOOK_URL,
            data=payload,
            headers={'Content-Type': 'application/json'},
            method='POST'
        )
        
        with urllib.request.urlopen(req, timeout=10) as response:
            if response.status == 200:
                logger.info("Slack通知を送信しました")
                return True
            else:
                logger.error(f"Slack通知に失敗: ステータス {response.status}")
                return False
                
    except Exception as e:
        logger.error(f"Slack通知の送信に失敗: {e}")
        return False


def handler_get_certificates(event: dict, context: Any) -> dict:
    """証明書一覧取得ハンドラー"""
    try:
        certificates = get_all_certificates()
        
        # ソート（期限が近い順）
        certificates.sort(key=lambda x: x['daysUntilExpiry'])
        
        return create_response(200, {
            'success': True,
            'count': len(certificates),
            'certificates': certificates
        })
        
    except Exception as e:
        logger.exception("証明書取得でエラーが発生")
        return create_response(500, {
            'success': False,
            'error': str(e)
        })


def handler_check_expiry(event: dict, context: Any) -> dict:
    """有効期限チェックハンドラー"""
    try:
        certificates = get_all_certificates()
        classified = classify_certificates(certificates)
        
        # Slack通知
        notification_sent = send_slack_notification(classified)
        
        summary = {
            'total': len(certificates),
            'expired': len(classified['expired']),
            'critical': len(classified['critical']),
            'warning': len(classified['warning']),
            'healthy': len(classified['healthy']),
            'notificationSent': notification_sent
        }
        
        return create_response(200, {
            'success': True,
            'summary': summary,
            'expired': classified['expired'],
            'critical': classified['critical'],
            'warning': classified['warning']
        })
        
    except Exception as e:
        logger.exception("有効期限チェックでエラーが発生")
        return create_response(500, {
            'success': False,
            'error': str(e)
        })


def handler_certificate_detail(event: dict, context: Any) -> dict:
    """証明書詳細取得ハンドラー"""
    try:
        # パスパラメータまたはクエリパラメータから取得
        cert_arn = None
        
        if event.get('pathParameters'):
            cert_arn = event['pathParameters'].get('certificateArn')
        
        if not cert_arn and event.get('queryStringParameters'):
            cert_arn = event['queryStringParameters'].get('certificateArn')
        
        if not cert_arn:
            return create_response(400, {
                'success': False,
                'error': 'certificateArn is required'
            })
        
        # ARNからリージョンを抽出
        try:
            arn_parts = cert_arn.split(':')
            region = arn_parts[3]
        except (IndexError, ValueError):
            return create_response(400, {
                'success': False,
                'error': 'Invalid certificate ARN format'
            })
        
        acm_client = boto3.client('acm', region_name=region)
        
        response = acm_client.describe_certificate(CertificateArn=cert_arn)
        cert_detail = response['Certificate']
        
        # 有効期限の計算
        expiry_date = cert_detail.get('NotAfter')
        if expiry_date:
            if expiry_date.tzinfo is None:
                expiry_date = expiry_date.replace(tzinfo=timezone.utc)
            now = datetime.now(timezone.utc)
            days_until_expiry = (expiry_date - now).days
        else:
            days_until_expiry = -1
        
        # タグを取得
        try:
            tags_response = acm_client.list_tags_for_certificate(CertificateArn=cert_arn)
            tags = {tag['Key']: tag['Value'] for tag in tags_response.get('Tags', [])}
        except ClientError:
            tags = {}
        
        certificate_info = {
            'certificateArn': cert_arn,
            'domain': cert_detail.get('DomainName'),
            'subjectAlternativeNames': cert_detail.get('SubjectAlternativeNames', []),
            'region': region,
            'status': cert_detail.get('Status'),
            'type': cert_detail.get('Type'),
            'issuer': cert_detail.get('Issuer'),
            'serial': cert_detail.get('Serial'),
            'subject': cert_detail.get('Subject'),
            'notBefore': cert_detail.get('NotBefore'),
            'notAfter': expiry_date,
            'daysUntilExpiry': days_until_expiry,
            'keyAlgorithm': cert_detail.get('KeyAlgorithm'),
            'signatureAlgorithm': cert_detail.get('SignatureAlgorithm'),
            'inUseBy': cert_detail.get('InUseBy', []),
            'renewalEligibility': cert_detail.get('RenewalEligibility'),
            'renewalSummary': cert_detail.get('RenewalSummary'),
            'domainValidationOptions': cert_detail.get('DomainValidationOptions', []),
            'tags': tags
        }
        
        return create_response(200, {
            'success': True,
            'certificate': certificate_info
        })
        
    except ClientError as e:
        error_code = e.response['Error']['Code']
        if error_code == 'ResourceNotFoundException':
            return create_response(404, {
                'success': False,
                'error': 'Certificate not found'
            })
        raise
        
    except Exception as e:
        logger.exception("証明書詳細取得でエラーが発生")
        return create_response(500, {
            'success': False,
            'error': str(e)
        })


def lambda_handler(event: dict, context: Any) -> dict:
    """メインハンドラー - ルーティング"""
    logger.info(f"受信イベント: {json.dumps(event, default=str)}")
    
    # OPTIONSリクエスト（CORS preflight）
    http_method = event.get('httpMethod', event.get('requestContext', {}).get('http', {}).get('method', ''))
    if http_method == 'OPTIONS':
        return create_response(200, {'message': 'OK'})
    
    # パスに基づくルーティング
    path = event.get('path', event.get('rawPath', ''))
    resource = event.get('resource', '')
    
    # EventBridgeからの呼び出し（定期実行）
    if event.get('source') == 'aws.events' or event.get('detail-type'):
        return handler_check_expiry(event, context)
    
    # API Gatewayからの呼び出し
    if '/certificates' in path or '/certificates' in resource:
        if '/detail' in path or '{certificateArn}' in resource:
            return handler_certificate_detail(event, context)
        return handler_get_certificates(event, context)
    
    if '/check-expiry' in path or '/check' in path:
        return handler_check_expiry(event, context)
    
    # デフォルト: 証明書一覧
    return handler_get_certificates(event, context)


# ローカルテスト用
if __name__ == "__main__":
    # テスト実行
    print("=== ローカルテスト ===")
    
    # 環境変数設定（テスト用）
    os.environ['TARGET_REGIONS'] = 'us-east-1,ap-northeast-1'
    os.environ['ALERT_THRESHOLD_CRITICAL'] = '7'
    os.environ['ALERT_THRESHOLD_WARNING'] = '30'
    
    # テストイベント
    test_event = {
        'httpMethod': 'GET',
        'path': '/certificates'
    }
    
    try:
        result = lambda_handler(test_event, None)
        print(json.dumps(json.loads(result['body']), indent=2, ensure_ascii=False, default=str))
    except Exception as e:
        print(f"エラー: {e}")
        import traceback
        traceback.print_exc()
