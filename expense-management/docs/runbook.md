# SRE Runbook — 経費管理システム

## SLO

| SLI | 目標値 | アラート閾値 |
|-----|--------|------------|
| 可用性 | 99.9% / 月 | < 99.5% |
| p95 レスポンスタイム | < 500ms | > 800ms |
| p99 レスポンスタイム | < 1000ms | > 2000ms |
| 5xx エラー率 | < 0.1% | > 1% |

---

## アラート対応手順

### 1. ECS タスク停止アラート

**第1ステップ — 状況確認**
```bash
# タスク実行数確認
aws ecs describe-services \
  --cluster expense-prod \
  --services expense-prod-service \
  --query 'services[0].{running:runningCount,desired:desiredCount}'

# デプロイ中のタスク構成確認
aws ecs list-tasks --cluster expense-prod --service-name expense-prod-service
```

**第2ステップ — ログ確認**
```bash
# 最新のエラーログを取得 (past 30 min)
aws logs filter-log-events \
  --log-group-name /ecs/expense-prod \
  --start-time $(date -d '30 minutes ago' +%s000) \
  --filter-pattern 'ERROR'
```

**第3ステップ — 復旧**
```bash
# サービスを強制再デプロイ
aws ecs update-service \
  --cluster expense-prod \
  --service expense-prod-service \
  --force-new-deployment
```

---

### 2. RDS 接続数満杯アラート

**第1ステップ — 接続状況**
```bash
# 現在のアクティブ接続数
aws cloudwatch get-metric-statistics \
  --namespace AWS/RDS \
  --metric-name DatabaseConnections \
  --dimensions Name=DBClusterIdentifier,Value=expense-prod \
  --start-time $(date -u -d '10 minutes ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 60 --statistics Average
```

**第2ステップ — スロークエリ特定**
```bash
# Aurora スロークエリログを確認
aws rds describe-db-log-files \
  --db-instance-identifier expense-prod-instance-1
```

**第3ステップ — 对応**
- ECS タスク数を一時的に削減: `aws ecs update-service --desired-count 1`
- コネクションプールの上限をレビュー (DB_MAX_CONNECTIONS env var)
- Aurora Serverless v2 の ACU 上限を拡張

---

### 3. エラー率アラート (5xx > 1%)

```bash
# ALB アクセスログを S3 から取得しエラーを集計
aws s3 cp s3://expense-prod-alb-logs/$(date +%Y/%m/%d)/ ./alb-logs/ --recursive
grep ' 5[0-9][0-9] ' alb-logs/*.log | awk '{print $12}' | sort | uniq -c | sort -rn | head -20

# アプリケーションログで詳細エラーを確認
aws logs filter-log-events \
  --log-group-name /ecs/expense-prod \
  --start-time $(date -d '15 minutes ago' +%s000) \
  --filter-pattern '{ $.level = "ERROR" }'
```

---

## デプロイ手順

### ロールバック
```bash
# 前リビジョンのイメージタグを確認
git log --oneline -5

# ECS サービスのタスク定義を前リビジョンに更新
aws ecs update-service \
  --cluster expense-prod \
  --service expense-prod-service \
  --task-definition expense-prod:<PREVIOUS_REVISION>
```

### ステータス確認
```bash
# ヘルスチェック
curl -sf https://api.example.com/health | jq .

# ロードバランサー ターゲットグループヘルス
aws elbv2 describe-target-health \
  --target-group-arn <TG_ARN> \
  --query 'TargetHealthDescriptions[*].{id:Target.Id,port:Target.Port,state:TargetHealth.State}'
```

---

## 定期メンテナンス

| 項目 | 頻度 | 担当 |
|------|------|------|
| コンテナイメージの脆弱性スキャン (Trivy) | 毎日 (CI) | デプロイパイプライン |
| RDS スナップショット有効確認 | 毎週 | SRE |
| ログ保持期間確認 (S3 Glacier 移行) | 毎月 | SRE |
| SLO レポートレビュー | 毎月 | チームリード |
