# 経費精算システム アーキテクチャ設計書

## システム概要

中小〜中規模企業（従業員50〜300人）向けの経費精算システム。
マルチテナント対応、Clean Architecture、DDD設計原則に基づく実装。

---

## ① 要件定義

### 機能要件

#### 経費申請
- 交通費・交際費・出張費・消耗品費・その他の申請
- 領収書アップロード（JPEG/PNG/PDF、最大10MB）
- 申請コメント入力
- 一時保存（下書き）機能
- 申請の編集・取り消し（未承認時）

#### 承認フロー
- 多段階承認（最大5段階）
- テナントごとのカスタム承認フロー設定
- 代理承認機能
- 承認期限設定・リマインダー
- 一括承認機能

#### ステータス管理
- DRAFT（下書き）
- PENDING（申請中）
- PARTIALLY_APPROVED（一部承認）
- APPROVED（承認済み）
- REJECTED（却下）
- CANCELLED（取り消し）
- PAID（支払済み）

#### コメント機能
- 申請・承認・却下時のコメント
- 返信スレッド形式
- メンション機能

#### 検索・フィルタ
- 日付範囲・カテゴリ・ステータス・申請者・金額範囲
- 全文検索
- ページネーション

#### CSV/エクスポート
- 検索結果のCSVエクスポート
- 会計ソフト連携用フォーマット
- 月次・四半期レポート

#### 管理者機能
- ユーザー管理（CRUD）
- 役割・権限管理（RBAC）
- 承認フロー設定
- カテゴリ設定
- テナント設定

### 非機能要件

#### 可用性
- SLO: 99.9%（月次ダウンタイム上限: 43.8分）
- RTO: 1時間以内
- RPO: 1時間以内
- マルチAZ構成による冗長化

#### パフォーマンス
- APIレスポンス: p95 < 500ms、p99 < 1000ms
- 画面描画: LCP < 2.5秒
- 同時接続: 500セッション対応
- スループット: 100 req/s

#### セキュリティ
- 認証: JWT（アクセストークン15分、リフレッシュトークン30日）
- 将来: SAML/OIDC SSO対応
- 認可: RBAC（Role-Based Access Control）
- マルチテナント: テナント間データ完全分離
- 通信: HTTPS（TLS 1.3）強制
- ストレージ: 領収書S3暗号化（SSE-KMS）
- セキュリティヘッダー実装（HSTS, CSP, X-Frame-Options）
- SQLインジェクション・XSS対策
- レートリミット（API: 1000 req/min/user）

#### 監査ログ
- 全CRUD操作のログ記録
- ログ保存期間: 7年（税務・会計法令準拠）
- 変更前後の差分記録
- 操作者・IPアドレス・タイムスタンプ記録

#### スケーラビリティ
- 水平スケール対応（ECS Auto Scaling）
- テナント数: 最大1000社
- ユーザー数: テナントあたり最大1000人

---

## ② ドメイン設計（DDD）

### 境界付きコンテキスト（Bounded Context）

```
┌─────────────────────────────────────────────────────────────┐
│                     経費精算システム                           │
│                                                               │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │   経費申請Context  │  │   承認管理Context  │                 │
│  │                  │  │                  │                 │
│  │ - Expense        │  │ - ApprovalFlow   │                 │
│  │ - Receipt        │  │ - ApprovalStep   │                 │
│  │ - ExpenseItem    │  │ - Approver       │                 │
│  └──────────────────┘  └──────────────────┘                 │
│                                                               │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │  ユーザー管理Context│  │  テナント管理Context│                 │
│  │                  │  │                  │                 │
│  │ - User           │  │ - Tenant         │                 │
│  │ - Role           │  │ - TenantSettings │                 │
│  │ - Permission     │  │ - Subscription   │                 │
│  └──────────────────┘  └──────────────────┘                 │
│                                                               │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │  通知Context      │  │  レポートContext   │                 │
│  │                  │  │                  │                 │
│  │ - Notification   │  │ - Report         │                 │
│  │ - EmailTemplate  │  │ - ExportJob      │                 │
│  └──────────────────┘  └──────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

### エンティティ一覧と責務

| エンティティ | 責務 |
|------------|------|
| Tenant | テナント管理。マルチテナントの基底単位 |
| User | ユーザー認証・プロフィール・役割割当 |
| Role | 権限グループ。RBAC の役割定義 |
| Permission | 個別権限定義 |
| Expense | 経費申請の集約ルート。ライフサイクル管理 |
| ExpenseItem | 経費申請の明細行 |
| Receipt | 領収書ファイル管理 |
| ApprovalFlow | 承認フローのテンプレート定義 |
| ApprovalStep | 承認フローの各ステップ |
| ApprovalRecord | 実際の承認・却下記録 |
| Comment | 申請へのコメント |
| AuditLog | 操作監査ログ |
| Notification | 通知管理 |
| Category | 経費カテゴリ（交通費・交際費など） |

### ER図

```
tenants
  id (PK)
  name
  slug (UNIQUE)
  settings (JSON)
  plan
  created_at
  updated_at

users
  id (PK)
  tenant_id (FK -> tenants.id)
  name
  email (UNIQUE per tenant)
  password_hash
  employee_code
  department
  role_id (FK -> roles.id)
  manager_id (FK -> users.id, nullable)
  is_active
  last_login_at
  created_at
  updated_at

roles
  id (PK)
  tenant_id (FK -> tenants.id)
  name
  description
  is_system_role
  created_at

role_permissions
  role_id (FK -> roles.id)
  permission_id (FK -> permissions.id)
  PRIMARY KEY (role_id, permission_id)

permissions
  id (PK)
  name (UNIQUE)
  resource
  action
  description

categories
  id (PK)
  tenant_id (FK -> tenants.id)
  name
  code
  parent_id (FK -> categories.id, nullable)
  max_amount
  requires_receipt
  is_active
  sort_order

expenses
  id (PK)
  tenant_id (FK -> tenants.id)
  applicant_id (FK -> users.id)
  expense_number (UNIQUE per tenant)
  title
  description
  total_amount (DECIMAL 12,2)
  currency (DEFAULT 'JPY')
  status (ENUM: draft/pending/partially_approved/approved/rejected/cancelled/paid)
  applied_at
  approved_at (nullable)
  paid_at (nullable)
  due_date (nullable)
  approval_flow_id (FK -> approval_flows.id)
  current_step
  created_at
  updated_at
  deleted_at

expense_items
  id (PK)
  expense_id (FK -> expenses.id)
  category_id (FK -> categories.id)
  description
  amount (DECIMAL 12,2)
  quantity (DEFAULT 1)
  unit_price (DECIMAL 12,2)
  expense_date
  vendor
  purpose
  sort_order
  created_at
  updated_at

receipts
  id (PK)
  tenant_id (FK -> tenants.id)
  expense_item_id (FK -> expense_items.id)
  original_filename
  storage_path
  file_type
  file_size
  mime_type
  ocr_text (nullable)
  ocr_amount (nullable)
  ocr_date (nullable)
  ocr_vendor (nullable)
  uploaded_by (FK -> users.id)
  created_at

approval_flows
  id (PK)
  tenant_id (FK -> tenants.id)
  name
  description
  is_default
  min_amount (nullable)
  max_amount (nullable)
  category_ids (JSON, nullable)
  is_active
  created_at
  updated_at

approval_steps
  id (PK)
  approval_flow_id (FK -> approval_flows.id)
  step_number
  step_name
  approver_type (ENUM: specific_user/role/manager/department_head)
  approver_id (nullable)
  approver_role_id (nullable)
  required_count (DEFAULT 1)
  allow_delegation
  deadline_days (nullable)
  created_at

approval_records
  id (PK)
  expense_id (FK -> expenses.id)
  approval_step_id (FK -> approval_steps.id)
  approver_id (FK -> users.id)
  action (ENUM: approved/rejected/delegated)
  comment
  delegated_to (FK -> users.id, nullable)
  acted_at
  created_at

comments
  id (PK)
  tenant_id (FK -> tenants.id)
  expense_id (FK -> expenses.id)
  user_id (FK -> users.id)
  parent_id (FK -> comments.id, nullable)
  body
  is_edited
  created_at
  updated_at
  deleted_at

audit_logs
  id (PK)
  tenant_id (FK -> tenants.id)
  user_id (FK -> users.id, nullable)
  event_type
  resource_type
  resource_id
  old_values (JSON, nullable)
  new_values (JSON, nullable)
  ip_address
  user_agent
  created_at

notifications
  id (PK)
  tenant_id (FK -> tenants.id)
  user_id (FK -> users.id)
  type
  title
  body
  data (JSON)
  read_at (nullable)
  created_at
```

### バリューオブジェクト

| VO | 説明 |
|----|------|
| Money | 金額 + 通貨コード（不変） |
| ExpenseStatus | ステータス遷移ルールを持つ値オブジェクト |
| ExpenseNumber | テナント固有の採番規則 |
| EmailAddress | バリデーション済みメールアドレス |
| TenantSlug | URLスラグのバリデーション |
| ApproverType | 承認者種別の列挙値 |

### ドメインサービス

| サービス | 責務 |
|---------|------|
| ExpenseApprovalService | 承認フロー進行、次ステップ決定 |
| ExpenseNumberingService | テナント固有の経費番号採番 |
| ApprovalFlowMatchingService | 申請金額・カテゴリに基づくフロー選択 |
| NotificationDispatchService | 通知先決定・送信 |
| AmountLimitCheckService | 承認権限の金額上限チェック |

---

## ③ 技術選定

### バックエンド（Laravel 11）

```
app/
├── Http/
│   ├── Controllers/Api/V1/   # APIコントローラ（薄い層）
│   ├── Middleware/           # 認証・テナント解決・レートリミット
│   ├── Requests/             # FormRequest バリデーション
│   └── Resources/            # APIリソース変換
├── Domain/
│   ├── Expense/
│   │   ├── Entities/
│   │   ├── ValueObjects/
│   │   ├── Services/
│   │   └── Repositories/     # インターフェース
│   ├── Approval/
│   ├── User/
│   └── Tenant/
├── Application/
│   ├── UseCases/             # ユースケース（Application Service）
│   └── DTOs/
├── Infrastructure/
│   ├── Persistence/          # Repository実装
│   ├── Storage/              # S3アダプタ
│   ├── Mail/                 # メール送信
│   └── Queue/                # ジョブ
└── Providers/                # DIコンテナ登録
```

### フロントエンド（React + TypeScript）

- **状態管理**: Zustand（軽量、型安全）
- **データフェッチ**: TanStack Query（キャッシュ・楽観的更新）
- **UIライブラリ**: shadcn/ui + Tailwind CSS
- **フォーム**: React Hook Form + Zod
- **ルーティング**: React Router v6
- **ビルド**: Vite

### インフラ（AWS）

```
Internet
    │
    ▼
Route53 ─── ACM (TLS)
    │
    ▼
CloudFront (CDN + WAF)
    │
    ├── S3 (静的ファイル)
    │
    └── ALB
         │
         ├── ECS (API: Laravel) ─── ElastiCache (Redis)
         │        │
         │        └── S3 (領収書ストレージ)
         │
         └── ECS (Worker: Queue)
              │
              └── SQS

RDS Aurora MySQL 8.0 (Multi-AZ)
    └── Read Replica

CloudWatch ─── SNS ─── PagerDuty/Slack
```

### CI/CD（GitHub Actions）

```
push → lint/test → build → ECR push → ECS deploy (staging) → E2E → ECS deploy (prod)
```

---

## ④ API設計（REST）

ベースURL: `https://api.expense.example.com/api/v1`

### 認証
- JWT Bearer Token
- `/auth/login` でトークン取得
- `/auth/refresh` でリフレッシュ

### エンドポイント一覧

| Method | Path | 説明 |
|--------|------|------|
| POST | /auth/login | ログイン |
| POST | /auth/logout | ログアウト |
| POST | /auth/refresh | トークンリフレッシュ |
| GET | /me | ログインユーザー情報 |
| GET | /expenses | 経費一覧 |
| POST | /expenses | 経費申請作成 |
| GET | /expenses/{id} | 経費詳細 |
| PUT | /expenses/{id} | 経費更新 |
| DELETE | /expenses/{id} | 経費削除（下書きのみ） |
| POST | /expenses/{id}/submit | 申請提出 |
| POST | /expenses/{id}/cancel | 申請取り消し |
| POST | /expenses/{id}/approve | 承認 |
| POST | /expenses/{id}/reject | 却下 |
| GET | /expenses/{id}/history | 承認履歴 |
| POST | /expenses/{id}/comments | コメント追加 |
| GET | /expenses/{id}/comments | コメント一覧 |
| POST | /expenses/{id}/items | 明細追加 |
| POST | /expenses/{id}/items/{itemId}/receipts | 領収書アップロード |
| GET | /expenses/export | CSV/Excel エクスポート |
| GET | /approval-flows | 承認フロー一覧 |
| POST | /approval-flows | 承認フロー作成 |
| GET | /categories | カテゴリ一覧 |
| GET | /users | ユーザー一覧（管理者） |
| POST | /users | ユーザー作成（管理者） |
| GET | /reports/monthly | 月次レポート |
| GET | /notifications | 通知一覧 |
| PUT | /notifications/{id}/read | 通知既読 |
| GET | /admin/audit-logs | 監査ログ（管理者） |

---

## ⑦ 運用設計（SRE）

### SLO定義

| SLI | SLO | 計測方法 |
|-----|-----|---------|
| 可用性 | 99.9%/月 | ALB HealthCheck成功率 |
| レイテンシ | p95 < 500ms | CloudWatch p95 |
| エラーレート | < 0.1% | 5xx / total req |
| データ耐久性 | 99.999% | S3 + RDS バックアップ確認 |

### エラーバジェット
- 月次: 43.8分のダウンタイム許容
- バジェット消費率が50%超でアラート
- 80%超でリリースフリーズ

### アラート設計

| アラート | 閾値 | アクション |
|---------|------|-----------|
| API エラーレート | > 1% 5分継続 | PagerDuty P2 |
| API p99 レイテンシ | > 2000ms | Slack通知 |
| ECS CPU | > 80% 10分 | Auto Scaling + Slack |
| RDS CPU | > 70% | Slack + 調査 |
| RDS 接続数 | > 80% max | PagerDuty P1 |
| S3 エラー率 | > 0.1% | Slack通知 |
| SLO バジェット消費 | > 50% | PagerDuty P1 |
| ディスク使用率 | > 80% | Slack通知 |

### 障害対応フロー

```
検知（CloudWatch Alarm）
    │
    ▼
PagerDuty アラート → オンコール担当者通知（5分）
    │
    ▼
初動確認（15分以内）
    ├── ログ確認: CloudWatch Logs Insights
    ├── メトリクス確認: CloudWatch Dashboard
    └── 影響範囲確認
    │
    ▼
対応判断
    ├── 切り戻し（デプロイ起因）
    ├── スケールアウト（負荷起因）
    ├── DB接続プール調整
    └── インシデント起票（Jira/GitHub Issues）
    │
    ▼
復旧確認 → ポストモーテム作成（24時間以内）
```

### ログ設計

```
構造化ログ（JSON）
{
  "timestamp": "2024-01-01T00:00:00Z",
  "level": "info|warning|error",
  "trace_id": "uuid",
  "tenant_id": "uuid",
  "user_id": "uuid",
  "request_id": "uuid",
  "method": "POST",
  "path": "/api/v1/expenses",
  "status": 201,
  "duration_ms": 125,
  "message": "Expense created",
  "context": {}
}

保存先:
- アプリログ: CloudWatch Logs → S3 (90日 → Glacier 7年)
- 監査ログ: RDS audit_logs テーブル + CloudWatch Logs
- アクセスログ: ALB → S3
- スローログ: RDS → CloudWatch Logs
```

---

## ⑧ 拡張性

### モバイル対応
- React Native（コードシェア率70%想定）
- PWA対応（オフライン下書き保存）
- プッシュ通知（FCM/APNs via SNS）

### OCR連携（領収書読み取り）
- AWS Textract による自動読み取り
- 領収書アップロード時に非同期処理（SQS + Lambda）
- 金額・日付・店舗名の自動入力
- 信頼度スコアによる手動確認フラグ

### 会計ソフト連携
- freee API 連携
- マネーフォワード API 連携
- 勘定科目マッピング設定
- 自動仕訳データ生成
- Webhook によるリアルタイム同期

### SSO連携
- SAML 2.0（Azure AD, Google Workspace）
- OIDC（Okta, Auth0）
- 既存JWTとの共存（段階的移行）
