import boto3
import requests
import json
from datetime import datetime, timezone

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
    
    # 現在のUTC時間を取得
    current_time = datetime.now(timezone.utc)
    
    # 有効期限までの日数を計算（datetimeオブジェクト同士の引き算）
    days_left = (expiry_date - current_time).days
    
    # 有効期限が近いかどうか判定する（30日以内になったら通知する）
    if days_left <= 30:
        # Teamsに通知するメッセージを作成する
        message = {
            '@type': 'MessageCard',
            '@context': 'http://schema.org/extensions',
            'summary': 'ACM証明書の有効期限が近づいています',
            'themeColor': 'FF0000',
            'title': 'ACM証明書の有効期限が近づいています',
            'text': f'ACM証明書 {certificate_arn} の有効期限は {expiry_date.strftime("%Y-%m-%d %H:%M:%S")} です。残り {days_left} 日です。更新をお忘れなく。'
        }
        
        # Teamsにメッセージを送信する
        headers = {
            'Content-Type': 'application/json'
        }
        response = requests.post(webhook_url, headers=headers, data=json.dumps(message))
        response.raise_for_status()
        print(f'通知を送信しました: 残り {days_left} 日')
    else:
        print(f'証明書の有効期限は十分あります: 残り {days_left} 日')

except Exception as e:
    print(f'Error: {e}')
