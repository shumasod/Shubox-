# クレジットカード・キックバック管理システム

DynamoDB を基盤とした、クレジットカードのキックバック（ポイント/マイル/キャッシュバック）管理システム。

## 目標

- ユーザー別・期間別の高速照会（< 100ms）
- カテゴリ/カード別の効率分析
- AI駆動の最適カード推薦とレポート生成

## アーキテクチャ概要

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────┐
│   Client    │────▶│  API Gateway │────▶│ Lambda (FastAPI)│
└─────────────┘     └─────────────┘     └────────┬────────┘
                                                  │
                    ┌─────────────────────────────┼─────────────────────────────┐
                    │                             ▼                             │
                    │  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐ │
                    │  │  DynamoDB   │────▶│   Streams   │────▶│   Kinesis   │ │
                    │  └─────────────┘     └─────────────┘     └──────┬──────┘ │
                    │        │                                        │        │
                    │        ▼                                        ▼        │
                    │  ┌─────────────┐                         ┌─────────────┐ │
                    │  │     DAX     │                         │   Bedrock   │ │
                    │  └─────────────┘                         └─────────────┘ │
                    └──────────────────────────────────────────────────────────┘
```

## データモデル

### テーブル設計

| キー | パターン | 説明 |
|------|----------|------|
| PK | `USER#{userId}` | ユーザー識別子 |
| SK | `TRANSACTION#{date}#{transactionId}` | ISO日付 + UUID |
| TTL | `expirationTime` | Epoch秒（任意） |

### GSI

| インデックス | PK | SK | 用途 |
|-------------|----|----|------|
| CategoryIndex | `CATEGORY#{category}` | `{date}` | カテゴリ別集計 |
| CardIndex | `CARD#{cardId}` | `{date}` | カード別効率分析 |
| TimeIndex | `DATE#{date}` | `USER#{userId}#{txnId}` | 日次/月次集計 |

### アイテム例

```json
{
  "PK": "USER#user123",
  "SK": "TRANSACTION#2025-08-22#txn001",
  "GSI1PK": "CATEGORY#GROCERY",
  "GSI1SK": "2025-08-22",
  "GSI2PK": "CARD#card456",
  "GSI2SK": "2025-08-22",
  "GSI3PK": "DATE#2025-08-22",
  "GSI3SK": "USER#user123#txn001",
  "userId": "user123",
  "transactionId": "txn001",
  "transactionDate": "2025-08-22",
  "cardId": "card456",
  "cardName": "プラチナカード",
  "merchantName": "スーパーマーケットA",
  "category": "GROCERY",
  "transactionAmount": 5000,
  "kickbackAmount": 50,
  "kickbackType": "POINT",
  "kickbackRate": 0.01,
  "createdAt": "2025-08-22T12:34:56Z",
  "expirationTime": 1756675200
}
```

## アクセスパターン

### ユーザー履歴取得

```javascript
const params = {
  TableName: 'CreditCardKickbacks',
  KeyConditionExpression: 'PK = :userId',
  ExpressionAttributeValues: { ':userId': 'USER#user123' },
  ScanIndexForward: false,
  ProjectionExpression: 'transactionDate, kickbackAmount, category, cardName'
};
```

### 期間指定取得

```javascript
const params = {
  TableName: 'CreditCardKickbacks',
  KeyConditionExpression: 'PK = :userId AND SK BETWEEN :start AND :end',
  ExpressionAttributeValues: {
    ':userId': 'USER#user123',
    ':start': 'TRANSACTION#2025-08-01#',
    ':end': 'TRANSACTION#2025-08-31#~'
  }
};
```

### カテゴリ別集計

```javascript
const params = {
  TableName: 'CreditCardKickbacks',
  IndexName: 'CategoryIndex',
  KeyConditionExpression: 'GSI1PK = :category AND GSI1SK BETWEEN :start AND :end',
  ExpressionAttributeValues: {
    ':category': 'CATEGORY#GROCERY',
    ':start': '2025-08-01',
    ':end': '2025-08-31'
  }
};
```

## API

| メソッド | エンドポイント | 説明 |
|---------|---------------|------|
| POST | `/transactions` | トランザクション登録 |
| GET | `/users/{userId}/kickbacks` | ユーザー履歴取得 |
| GET | `/analytics/category/{category}` | カテゴリ別分析 |
| GET | `/analytics/card/{cardId}` | カード別効率分析 |
| GET | `/analytics/predictions/{userId}` | AI予測・推薦 |

## インフラストラクチャ

AWS CDK（TypeScript）でデプロイ。詳細は `infra/` ディレクトリ参照。

### 主要コンポーネント

- **DynamoDB**: メインデータストア（Standard-IAクラス）
- **DAX**: マイクロ秒レベルのキャッシュ
- **Lambda + FastAPI**: API実装
- **Kinesis**: ストリーム処理
- **Bedrock**: AI予測・推薦
- **Athena + Iceberg**: 分析クエリ

## セキュリティ

- KMSによるデータ暗号化（At-Rest / In-Transit）
- IAM最小権限 + Verified Permissions
- CloudTrail + Config によるコンプライアンス監視
- Macie によるPII検出

## パフォーマンス最適化

| 課題 | 対策 |
|------|------|
| ホットパーティション | Contributor Insightsで検出、必要に応じてシャーディング |
| 読み取りレイテンシ | DAX導入 |
| 集計クエリ | ElastiCacheでキャッシュ |
| 書き込みスループット | BatchWriter + 指数バックオフ + jitter |

## 分析クエリ例

### カテゴリ別ランキング

```sql
SELECT 
  category,
  SUM(kickbackAmount) AS total,
  COUNT(*) AS count,
  RANK() OVER (ORDER BY SUM(kickbackAmount) DESC) AS rank
FROM iceberg_kickbacks
WHERE year = 2025 AND month = 8
GROUP BY category;
```

### カード効率スコア

```sql
SELECT 
  cardId,
  cardName,
  SUM(kickbackAmount) AS total_kickback,
  AVG(kickbackRate) AS avg_rate,
  (SUM(kickbackAmount) * 0.4 + COUNT(*) * 0.3 + AVG(kickbackRate) * 1000 * 0.3) AS score
FROM iceberg_kickbacks
WHERE year = 2025 AND month = 8
GROUP BY cardId, cardName
ORDER BY score DESC
LIMIT 10;
```

## ディレクトリ構成

```
.
├── infra/          # CDKスタック
├── src/
│   ├── api/        # FastAPI実装
│   ├── models/     # Pydanticモデル
│   └── services/   # ビジネスロジック
├── tests/
└── docs/
```

## 開発

```bash
# 依存関係インストール
npm install
pip install -r requirements.txt

# ローカル実行
sam local start-api

# デプロイ
cdk deploy
```

## ライセンス

MIT
