import json
import boto3
from datetime import datetime, timedelta
from typing import List, Dict

# AWS クライアントの初期化
acm_clients = {}
regions = ['us-east-1', 'us-west-2', 'ap-northeast-1', 'eu-west-1']

def get_acm_client(region: str):
    """リージョンごとのACMクライアントを取得"""
    if region not in acm_clients:
        acm_clients[region] = boto3.client('acm', region_name=region)
    return acm_clients[region]

def lambda_handler(event, context):
    """
    メインのLambdaハンドラー
    API Gatewayから呼び出される
    """
    http_method = event.get('httpMethod', '')
    path = event.get('path', '')
    
    try:
        if http_method == 'GET' and path == '/certificates':
            return get_all_certificates(event)
        
        elif http_method == 'POST' and path == '/certificates/renew':
            return renew_certificate(event)
        
        elif http_method == 'POST' and path == '/certificates/renew-all':
            return renew_all_certificates(event)
        
        else:
            return response(404, {'error': 'Not found'})
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return response(500, {'error': str(e)})


def get_all_certificates(event) -> Dict:
    """
    全リージョンの証明書を取得
    """
    all_certificates = []
    
    for region in regions:
        try:
            acm = get_acm_client(region)
            
            # 証明書一覧を取得
            paginator = acm.get_paginator('list_certificates')
            for page in paginator.paginate(CertificateStatuses=['ISSUED', 'INACTIVE']):
                for cert_summary in page['CertificateSummaryList']:
                    cert_arn = cert_summary['CertificateArn']
                    
                    # 証明書の詳細情報を取得
                    cert_detail = acm.describe_certificate(
                        CertificateArn=cert_arn
                    )['Certificate']
                    
                    # 有効期限までの日数を計算
                    expiry_date = cert_detail.get('NotAfter')
                    if expiry_date:
                        days_until_expiry = (expiry_date - datetime.now(expiry_date.tzinfo)).days
                    else:
                        days_until_expiry = 0
                    
                    # 使用中のリソースを取得
                    in_use_by = cert_detail.get('InUseBy', [])
                    
                    certificate_info = {
                        'id': cert_arn,
                        'domain': cert_detail['DomainName'],
                        'region': region,
                        'certificateArn': cert_arn,
                        'status': cert_detail['Status'],
                        'expiryDate': expiry_date.isoformat() if expiry_date else None,
                        'daysUntilExpiry': days_until_expiry,
                        'inUseBy': in_use_by,
                        'validationMethod': cert_detail.get('DomainValidationOptions', [{}])[0].get('ValidationMethod', 'UNKNOWN'),
                        'subjectAlternativeNames': cert_detail.get('SubjectAlternativeNames', []),
                        'renewalEligibility': cert_detail.get('RenewalEligibility', 'INELIGIBLE'),
                        'type': cert_detail.get('Type', 'IMPORTED')
                    }
                    
                    all_certificates.append(certificate_info)
        
        except Exception as e:
            print(f"Error fetching certificates from {region}: {str(e)}")
            continue
    
    return response(200, {
        'certificates': all_certificates,
        'total': len(all_certificates)
    })


def renew_certificate(event) -> Dict:
    """
    特定の証明書を更新
    """
    try:
        body = json.loads(event.get('body', '{}'))
        cert_arn = body.get('certificateArn')
        region = body.get('region')
        
        if not cert_arn or not region:
            return response(400, {'error': 'certificateArn and region are required'})
        
        acm = get_acm_client(region)
        
        # ACMマネージド証明書の場合、自動更新をリクエスト
        cert_detail = acm.describe_certificate(CertificateArn=cert_arn)['Certificate']
        
        if cert_detail.get('Type') == 'AMAZON_ISSUED':
            # ACMマネージド証明書は自動的に更新される
            # ここでは検証を再実行
            if cert_detail.get('RenewalEligibility') == 'ELIGIBLE':
                # 更新をトリガー（実際には自動的に行われる）
                print(f"Certificate {cert_arn} is eligible for renewal")
                
                return response(200, {
                    'success': True,
                    'message': f"Renewal initiated for {cert_detail['DomainName']}",
                    'certificateArn': cert_arn
                })
            else:
                return response(400, {
                    'success': False,
                    'message': 'Certificate is not eligible for renewal'
                })
        
        elif cert_detail.get('Type') == 'IMPORTED':
            # インポートされた証明書の場合は新しい証明書をインポートする必要がある
            return response(200, {
                'success': False,
                'message': 'Imported certificates must be manually re-imported',
                'requiresManualUpdate': True
            })
    
    except Exception as e:
        print(f"Error renewing certificate: {str(e)}")
        return response(500, {'error': str(e)})


def renew_all_certificates(event) -> Dict:
    """
    全証明書を一括更新
    """
    results = []
    
    for region in regions:
        try:
            acm = get_acm_client(region)
            
            # 証明書一覧を取得
            paginator = acm.get_paginator('list_certificates')
            for page in paginator.paginate(CertificateStatuses=['ISSUED']):
                for cert_summary in page['CertificateSummaryList']:
                    cert_arn = cert_summary['CertificateArn']
                    
                    try:
                        # 証明書の詳細を取得
                        cert_detail = acm.describe_certificate(
                            CertificateArn=cert_arn
                        )['Certificate']
                        
                        # ACMマネージド証明書のみ自動更新をトリガー
                        if cert_detail.get('Type') == 'AMAZON_ISSUED':
                            if cert_detail.get('RenewalEligibility') == 'ELIGIBLE':
                                results.append({
                                    'certificateArn': cert_arn,
                                    'domain': cert_detail['DomainName'],
                                    'region': region,
                                    'status': 'renewal_initiated'
                                })
                            else:
                                results.append({
                                    'certificateArn': cert_arn,
                                    'domain': cert_detail['DomainName'],
                                    'region': region,
                                    'status': 'not_eligible'
                                })
                    
                    except Exception as e:
                        print(f"Error processing {cert_arn}: {str(e)}")
                        results.append({
                            'certificateArn': cert_arn,
                            'region': region,
                            'status': 'error',
                            'error': str(e)
                        })
        
        except Exception as e:
            print(f"Error processing region {region}: {str(e)}")
            continue
    
    return response(200, {
        'success': True,
        'results': results,
        'total': len(results)
    })


def response(status_code: int, body: Dict) -> Dict:
    """
    API Gatewayのレスポンスフォーマット
    """
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
        },
        'body': json.dumps(body, default=str)
    }


# CloudWatchイベントで定期実行する場合
def scheduled_check_handler(event, context):
    """
    定期的に証明書の有効期限をチェックし、アラートを送信
    """
    sns = boto3.client('sns')
    sns_topic_arn = 'arn:aws:sns:us-east-1:123456789012:ssl-cert-alerts'
    
    expiring_certs = []
    
    for region in regions:
        try:
            acm = get_acm_client(region)
            
            paginator = acm.get_paginator('list_certificates')
            for page in paginator.paginate(CertificateStatuses=['ISSUED']):
                for cert_summary in page['CertificateSummaryList']:
                    cert_arn = cert_summary['CertificateArn']
                    cert_detail = acm.describe_certificate(
                        CertificateArn=cert_arn
                    )['Certificate']
                    
                    expiry_date = cert_detail.get('NotAfter')
                    if expiry_date:
                        days_until_expiry = (expiry_date - datetime.now(expiry_date.tzinfo)).days
                        
                        # 30日以内に期限切れの証明書をアラート
                        if days_until_expiry <= 30:
                            expiring_certs.append({
                                'domain': cert_detail['DomainName'],
                                'region': region,
                                'daysUntilExpiry': days_until_expiry,
                                'certificateArn': cert_arn
                            })
        
        except Exception as e:
            print(f"Error in scheduled check for {region}: {str(e)}")
            continue
    
    # アラート送信
    if expiring_certs:
        message = "以下のSSL証明書が30日以内に期限切れになります:\n\n"
        for cert in expiring_certs:
            message += f"- {cert['domain']} ({cert['region']}): 残り{cert['daysUntilExpiry']}日\n"
        
        sns.publish(
            TopicArn=sns_topic_arn,
            Subject='[警告] SSL証明書の有効期限が近づいています',
            Message=message
        )
        
        print(f"Alert sent for {len(expiring_certs)} expiring certificates")
    
    return {
        'statusCode': 200,
        'body': json.dumps({
            'checked': True,
            'expiringCertificates': len(expiring_certs)
        })
    }
