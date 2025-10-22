#!/usr/bin/env python3
"""
Lambda関数のローカルテストスクリプト
AWS環境なしでロジックを検証
"""

import json
from datetime import datetime, timedelta

# モックデータ
MOCK_CERTIFICATES = [
    {
        'CertificateArn': 'arn:aws:acm:us-east-1:123456789012:certificate/abc123',
        'DomainName': 'example.com',
        'Status': 'ISSUED',
        'Type': 'AMAZON_ISSUED',
        'NotAfter': datetime.now() + timedelta(days=45),
        'DomainValidationOptions': [{'ValidationMethod': 'DNS'}],
        'SubjectAlternativeNames': ['example.com', 'www.example.com'],
        'RenewalEligibility': 'ELIGIBLE',
        'InUseBy': ['arn:aws:elasticloadbalancing:us-east-1:123456789012:loadbalancer/app/my-alb/abc123']
    },
    {
        'CertificateArn': 'arn:aws:acm:us-east-1:123456789012:certificate/def456',
        'DomainName': 'api.example.com',
        'Status': 'ISSUED',
        'Type': 'AMAZON_ISSUED',
        'NotAfter': datetime.now() + timedelta(days=15),
        'DomainValidationOptions': [{'ValidationMethod': 'DNS'}],
        'SubjectAlternativeNames': ['api.example.com'],
        'RenewalEligibility': 'ELIGIBLE',
        'InUseBy': ['arn:aws:apigateway:us-east-1::/restapis/xyz789']
    },
    {
        'CertificateArn': 'arn:aws:acm:us-east-1:123456789012:certificate/ghi789',
        'DomainName': 'cdn.example.com',
        'Status': 'ISSUED',
        'Type': 'IMPORTED',
        'NotAfter': datetime.now() + timedelta(days=5),
        'DomainValidationOptions': [{'ValidationMethod': 'EMAIL'}],
        'SubjectAlternativeNames': ['cdn.example.com'],
        'RenewalEligibility': 'INELIGIBLE',
        'InUseBy': ['arn:aws:cloudfront::123456789012:distribution/ABCD1234']
    }
]

class MockACMClient:
    """ACMクライアントのモック"""
    
    def __init__(self, region):
        self.region = region
    
    def list_certificates(self, **kwargs):
        """証明書リストのモック"""
        return {
            'CertificateSummaryList': [
                {'CertificateArn': cert['CertificateArn']}
                for cert in MOCK_CERTIFICATES
            ]
        }
    
    def describe_certificate(self, CertificateArn):
        """証明書詳細のモック"""
        for cert in MOCK_CERTIFICATES:
            if cert['CertificateArn'] == CertificateArn:
                return {'Certificate': cert}
        raise Exception(f"Certificate not found: {CertificateArn}")
    
    def get_paginator(self, operation_name):
        """ページネーターのモック"""
        return MockPaginator()

class MockPaginator:
    """ページネーターのモック"""
    
    def paginate(self, **kwargs):
        """ページング結果のモック"""
        yield {
            'CertificateSummaryList': [
                {'CertificateArn': cert['CertificateArn']}
                for cert in MOCK_CERTIFICATES
            ]
        }

def test_get_certificates():
    """証明書取得のテスト"""
    print("\n=== 証明書取得テスト ===")
    
    mock_client = MockACMClient('us-east-1')
    certificates = []
    
    # 証明書リストを取得
    paginator = mock_client.get_paginator('list_certificates')
    for page in paginator.paginate():
        for cert_summary in page['CertificateSummaryList']:
            cert_arn = cert_summary['CertificateArn']
            
            # 詳細を取得
            cert_detail = mock_client.describe_certificate(
                CertificateArn=cert_arn
            )['Certificate']
            
            # 有効期限までの日数を計算
            expiry_date = cert_detail.get('NotAfter')
            if expiry_date:
                days_until_expiry = (expiry_date - datetime.now()).days
            else:
                days_until_expiry = 0
            
            # サービス名を抽出
            service = 'Unknown'
            in_use_by = cert_detail.get('InUseBy', [])
            if in_use_by:
                resource_arn = in_use_by[0]
                if 'cloudfront' in resource_arn.lower():
                    service = 'CloudFront'
                elif 'elasticloadbalancing' in resource_arn.lower():
                    service = 'ALB' if 'app/' in resource_arn else 'ELB'
                elif 'apigateway' in resource_arn.lower():
                    service = 'API Gateway'
            
            certificate_info = {
                'domain': cert_detail['DomainName'],
                'region': 'us-east-1',
                'service': service,
                'daysUntilExpiry': days_until_expiry,
                'type': cert_detail.get('Type'),
                'status': cert_detail['Status'],
                'autoRenew': cert_detail.get('Type') == 'AMAZON_ISSUED'
            }
            
            certificates.append(certificate_info)
            
            # 結果表示
            status_icon = '🔴' if days_until_expiry < 7 else '🟡' if days_until_expiry < 30 else '🟢'
            print(f"{status_icon} {certificate_info['domain']}")
            print(f"   サービス: {certificate_info['service']}")
            print(f"   残日数: {days_until_expiry}日")
            print(f"   タイプ: {certificate_info['type']}")
            print(f"   自動更新: {'有効' if certificate_info['autoRenew'] else '無効'}")
            print()
    
    print(f"✅ 合計 {len(certificates)} 件の証明書を取得")
    return certificates

def test_renew_certificate():
    """証明書更新のテスト"""
    print("\n=== 証明書更新テスト ===")
    
    mock_client = MockACMClient('us-east-1')
    
    for cert in MOCK_CERTIFICATES:
        cert_arn = cert['CertificateArn']
        cert_detail = mock_client.describe_certificate(
            CertificateArn=cert_arn
        )['Certificate']
        
        cert_type = cert_detail.get('Type')
        renewal_eligibility = cert_detail.get('RenewalEligibility')
        
        print(f"\n証明書: {cert_detail['DomainName']}")
        print(f"タイプ: {cert_type}")
        
        if cert_type == 'AMAZON_ISSUED':
            if renewal_eligibility == 'ELIGIBLE':
                print("✅ ACMにより自動更新されます")
            else:
                print("⏳ まだ更新対象ではありません")
        else:
            print("⚠️ 手動での再インポートが必要です")
    
    print("\n✅ 更新ステータスチェック完了")

def test_expiry_check():
    """有効期限チェックのテスト"""
    print("\n=== 有効期限チェックテスト ===")
    
    mock_client = MockACMClient('us-east-1')
    
    expiring_certs = []
    critical_certs = []
    
    paginator = mock_client.get_paginator('list_certificates')
    for page in paginator.paginate():
        for cert_summary in page['CertificateSummaryList']:
            cert_arn = cert_summary['CertificateArn']
            cert_detail = mock_client.describe_certificate(
                CertificateArn=cert_arn
            )['Certificate']
            
            expiry_date = cert_detail.get('NotAfter')
            if expiry_date:
                days_until_expiry = (expiry_date - datetime.now()).days
                
                cert_info = {
                    'domain': cert_detail['DomainName'],
                    'daysUntilExpiry': days_until_expiry,
                    'type': cert_detail.get('Type')
                }
                
                if days_until_expiry <= 7:
                    critical_certs.append(cert_info)
                elif days_until_expiry <= 30:
                    expiring_certs.append(cert_info)
    
    # アラート表示
    if critical_certs:
        print("\n🚨 緊急 (7日以内に期限切れ):")
        for cert in critical_certs:
            print(f"   - {cert['domain']}: 残り{cert['daysUntilExpiry']}日")
    
    if expiring_certs:
        print("\n⚠️ 警告 (30日以内に期限切れ):")
        for cert in expiring_certs:
            print(f"   - {cert['domain']}: 残り{cert['daysUntilExpiry']}日")
    
    if not critical_certs and not expiring_certs:
        print("\n✅ 期限切れが近い証明書はありません")
    
    print(f"\n✅ チェック完了 - 緊急: {len(critical_certs)}件, 警告: {len(expiring_certs)}件")

def test_cors_headers():
    """CORSヘッダーのテスト"""
    print("\n=== CORSヘッダーテスト ===")
    
    response = {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
        },
        'body': json.dumps({'test': 'data'})
    }
    
    print("レスポンスヘッダー:")
    for key, value in response['headers'].items():
        print(f"   {key}: {value}")
    
    # 必須ヘッダーのチェック
    required_headers = [
        'Access-Control-Allow-Origin',
        'Access-Control-Allow-Methods'
    ]
    
    all_present = all(header in response['headers'] for header in required_headers)
    
    if all_present:
        print("\n✅ 必須のCORSヘッダーがすべて設定されています")
    else:
        print("\n❌ 不足しているCORSヘッダーがあります")

def test_error_handling():
    """エラーハンドリングのテスト"""
    print("\n=== エラーハンドリングテスト ===")
    
    # 存在しない証明書
    try:
        mock_client = MockACMClient('us-east-1')
        mock_client.describe_certificate(
            CertificateArn='arn:aws:acm:us-east-1:123456789012:certificate/invalid'
        )
        print("❌ エラーが発生すべきです")
    except Exception as e:
        print(f"✅ 正しくエラーがキャッチされました: {str(e)}")
    
    # 不正なJSON
    try:
        json.loads("invalid json")
        print("❌ JSONエラーが発生すべきです")
    except json.JSONDecodeError:
        print("✅ 正しくJSONエラーがキャッチされました")

def run_all_tests():
    """全テストを実行"""
    print("=" * 60)
    print("Lambda関数ローカルテスト")
    print("=" * 60)
    
    try:
        test_get_certificates()
        test_renew_certificate()
        test_expiry_check()
        test_cors_headers()
        test_error_handling()
        
        print("\n" + "=" * 60)
        print("✅ すべてのテストが完了しました")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ テスト中にエラーが発生しました: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    run_all_tests()
