import boto3
import requests
import json
from datetime import datetime

# ACMクライアントを作成する
acm = boto3.client('acm', region_name='your-region')

# TeamsのWebhook URLを設定する
webhook_url = 'https://example.com/webhook'

# 証明書のARNを指定する
certificate_arn = 'arn:aws:acm:region:account-id:certificate/certificate-id'

try:
    # 証明書の情報を取得する
    response = acm.describe_certificate(CertificateArn=certificate_arn)

    # 証明書の有効期限を取得する
    expiry_date = response['Certificate']['NotAfter']

    # 有効期限が近いかどうか判定する
    # ここでは30日以内になったら通知するとします
    days_left = (expiry_date - datetime.utcnow()).days
    if days_left <= 30:
        # Teamsに通知するメッセージを作成する
        message = {
            '@type': 'MessageCard',
            '@context': 'https://schema.org/extensions',
            'summary': 'ACM証明書の有効期限が近づいています',
            'themeColor': 'FF0000',
            'title': 'ACM証明書の有効期限が近づいています',
            'text': f'ACM証明書 {certificate_arn} の有効期限は {expiry_date} です。残り {days_left} 日です。更新をお忘れなく。'
        }

        # Teamsにメッセージを送信する
        headers = {
            'Content-Type': 'application/json'
        }
        response = requests.post(webhook_url, headers=headers, data=json.dumps(message))
        response.raise_for_status()
except Exception as e:
    print(f'Error: {e}')
