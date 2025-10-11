# SSL証明書管理システム - デプロイガイド

## システム概要

このシステムは、AWS Certificate Manager (ACM) で管理されている30以上のSSL証明書を一括で更新・管理できるWebアプリケーションです。

### アーキテクチャ

```
[React Frontend] → [CloudFront] → [S3]
       ↓
[API Gateway] → [Lambda] → [ACM (複数リージョン)]
       ↓
[CloudWatch Events] → [Lambda] → [SNS] (アラート通知)
```

## 必要な環境

- AWS CLI（設定済み）
- Terraform >= 1.0
- Node.js >= 16
- Python 3.11

## デプロイ手順

### 1. バックエンドのデプロイ

#### Lambda関数のパッケージング

```bash
# Lambda関数ディレクトリを作成
mkdir lambda-package
cd lambda-package

# Pythonコードをコピー
cp ../lambda_function.py .

# 依存関係をインストール
pip install boto3 -t .

# ZIPファイルを作成
zip -r ../lambda_function.zip .
cd ..
```

#### Terraformでインフラをデプロイ

```bash
# Terraformを初期化
terraform init

# アラート用のメールアドレスを設定
export TF_VAR_alert_email="your-email@example.com"

# デプロイ計画を確認
terraform plan

# デプロイを実行
terraform apply
```

デプロイが完了すると、以下の情報が出力されます：

- `api_endpoint`: API GatewayのエンドポイントURL
- `cloudfront_url`: CloudFrontのURL
- `s3_website_url`: S3ウェブサイトのURL

### 2. フロントエンドのデプロイ

#### React アプリのビルド

```bash
# プロジェクトディレクトリで
npm install

# 環境変数を設定（Terraformの出力から取得）
export REACT_APP_API_ENDPOINT="https://xxxxx.execute-api.us-east-1.amazonaws.com/prod"

# ビルド
npm run build
```

#### S3にアップロード

```bash
# Terraformの出力からS3バケット名を取得
BUCKET_NAME=$(terraform output -raw s3_bucket_name)

# ビルドしたファイルをアップロード
aws s3 sync build/ s3://${BUCKET_NAME}/ --delete

# CloudFrontのキャッシュをクリア（オプション）
DISTRIBUTION_ID=$(terraform output -raw cloudfront_distribution_id)
aws cloudfront create-invalidation --distribution-id ${DISTRIBUTION_ID} --paths "/*"
```

### 3. アクセス確認

```bash
# CloudFrontのURLを取得
terraform output cloudfront_url
```

ブラウザで上記URLにアクセスして、ダッシュボードが表示されることを確認します。

## 設定

### 複数リージョンの追加

`main.tf` の `REGIONS` 環境変数を編集：

```hcl
environment {
  variables = {
    REGIONS = "us-east-1,us-west-2,ap-northeast-1,eu-west-1,ap-southeast-1"
  }
}
```

### アラート通知の設定

1. SNSトピックに追加のサブスクリプションを作成：

```bash
aws sns subscribe \
  --topic-arn arn:aws:sns:us-east-1:123456789012:ssl-cert-manager-alerts \
  --protocol email \
  --notification-endpoint additional-email@example.com
```

2. 確認メールのリンクをクリックして、サブスクリプションを確認

### CloudWatch Events の実行頻度変更

`main.tf` の `schedule_expression` を編集：

```hcl
# 毎日9:00 UTC
schedule_expression = "cron(0 9 * * ? *)"

# 毎週月曜日9:00 UTC
schedule_expression = "cron(0 9 ? * MON *)"

# 毎時実行
schedule_expression = "rate(1 hour)"
```

## IAM権限の設定

### Lambda実行ロールに必要な権限

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "acm:ListCertificates",
        "acm:DescribeCertificate",
        "acm:GetCertificate",
        "acm:RequestCertificate",
        "acm:ImportCertificate"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    },
    {
      "Effect": "Allow",
      "Action": "sns:Publish",
      "Resource": "arn:aws:sns:*:*:ssl-cert-manager-alerts"
    }
  ]
}
```

## トラブルシューティング

### Lambda関数がタイムアウトする

多数の証明書がある場合、Lambda関数のタイムアウトを延長：

```bash
aws lambda update-function-configuration \
  --function-name ssl-cert-manager \
  --timeout 300
```

### API Gatewayから502エラーが返される

1. CloudWatch Logsでエラーを確認：

```bash
aws logs tail /aws/lambda/ssl-cert-manager --follow
```

2. Lambda関数のIAM権限を確認

### 証明書が表示されない

1. 正しいリージョンを確認
2. ACMにアクセスする権限があることを確認
3. Lambda関数のログを確認

```bash
aws logs tail /aws/lambda/ssl-cert-manager --since 1h
```

## セキュリティのベストプラクティス

### 1. API Gatewayに認証を追加

```hcl
resource "aws_api_gateway_method" "get_certificates" {
  authorization = "AWS_IAM"
  # または
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}
```

### 2. VPC内にLambdaを配置

```hcl
resource "aws_lambda_function" "cert_manager" {
  vpc_config {
    subnet_ids         = var.private_subnet_ids
    security_group_ids = [aws_security_group.lambda_sg.id]
  }
}
```

### 3. 最小権限の原則

特定のACM証明書のみにアクセスを制限：

```json
{
  "Effect": "Allow",
  "Action": "acm:DescribeCertificate",
  "Resource": [
    "arn:aws:acm:us-east-1:123456789012:certificate/abc123",
    "arn:aws:acm:us-west-2:123456789012:certificate/def456"
  ]
}
```

## コスト見積もり

月間の推定コスト（東京リージョン）：

- **Lambda**: 無料枠内（100万リクエスト/月まで無料）
- **API Gateway**: $3.50/100万リクエスト
- **S3**: $0.025/GB + $0.0047/1,000リクエスト
- **CloudFront**: $0.114/GB（最初の10TB）
- **SNS**: $0.50/100万通知
- **CloudWatch Logs**: $0.76/GB

**月間推定コスト**: 約 $5-15（使用量により変動）

## 監視とアラート

### CloudWatchダッシュボードの作成

```bash
aws cloudwatch put-dashboard \
  --dashboard-name ssl-cert-manager \
  --dashboard-body file://dashboard.json
```

### アラームの設定

```bash
# Lambda関数のエラー率監視
aws cloudwatch put-metric-alarm \
  --alarm-name ssl-manager-errors \
  --alarm-description "Alert on Lambda errors" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=FunctionName,Value=ssl-cert-manager
```

## バックアップとリカバリ

### 証明書のバックアップ

定期的にACM証明書の情報をエクスポート：

```bash
aws acm list-certificates --region us-east-1 > backup/certs-us-east-1.json
aws acm list-certificates --region us-west-2 > backup/certs-us-west-2.json
```

### Terraformステートのバックアップ

```bash
terraform state pull > backup/terraform-state-$(date +%Y%m%d).json
```

## 更新と保守

### システムの更新

1. Lambda関数の更新：

```bash
# コードを修正後
zip -r lambda_function.zip lambda_function.py
aws lambda update-function-code \
  --function-name ssl-cert-manager \
  --zip-file fileb://lambda_function.zip
```

2. フロントエンドの更新：

```bash
npm run build
aws s3 sync build/ s3://${BUCKET_NAME}/ --delete
```

3. Terraformリソースの更新：

```bash
terraform plan
terraform apply
```

## サポート

問題が発生した場合：

1. CloudWatch Logsを確認
2. IAM権限を確認
3. AWSサポートに連絡

---

## よくある質問 (FAQ)

### Q: ACM証明書は自動的に更新されないのですか？

A: ACMが管理する証明書（AWS発行）は通常自動更新されますが、インポートされた証明書は手動で再インポートする必要があります。このシステムは更新状況を一元管理し、必要に応じて手動操作を促します。

### Q: 複数のAWSアカウントの証明書を管理できますか？

A: はい、クロスアカウントIAMロールを設定することで可能です。

### Q: オンプレミスの証明書も管理できますか？

A: Lambda関数を拡張して、Let's EncryptやSSH経由でオンプレミスサーバーの証明書を管理することも可能です。
