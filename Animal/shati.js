# 忍者シャチ銀行システム 🥷🐋

改善された忍者シャチ銀行システムのFlask APIです。

## 🚀 セットアップ

### 1. 依存関係のインストール

```bash
pip install -r requirements.txt
```

### 2. 環境設定

`.env.example`を`.env`にコピーして設定を調整：

```bash
cp .env.example .env
```

### 3. アプリケーション起動

```bash
python app.py
```

## 📚 API エンドポイント

### ヘルスチェック
```
GET /health
```

### 新規口座開設
```
POST /create_account
Content-Type: application/json

{
  "accountNumber": "NINJA001",
  "ownerName": "忍者シャチ太郎",
  "balance": 1000.0
}
```

### 取引（入金/出金）
```
POST /transaction
Content-Type: application/json

// 入金
{
  "accountNumber": "NINJA001",
  "type": "deposit",
  "amount": 500.0
}

// 出金
{
  "accountNumber": "NINJA001",
  "type": "withdraw",
  "amount": 200.0
}
```

### 残高照会
```
GET /balance/{account_number}
```

### 全口座一覧
```
GET /accounts
```

### 口座削除
```
DELETE /account/{account_number}
```

## 🧪 テスト用cURLコマンド

### 口座開設
```bash
curl -X POST http://localhost:5000/create_account \
  -H "Content-Type: application/json" \
  -d '{
    "accountNumber": "NINJA001",
    "ownerName": "忍者シャチ太郎",
    "balance": 1000.0
  }'
```

### 入金
```bash
curl -X POST http://localhost:5000/transaction \
  -H "Content-Type: application/json" \
  -d '{
    "accountNumber": "NINJA001",
    "type": "deposit",
    "amount": 500.0
  }'
```

### 出金
```bash
curl -X POST http://localhost:5000/transaction \
  -H "Content-Type: application/json" \
  -d '{
    "accountNumber": "NINJA001",
    "type": "withdraw",
    "amount": 200.0
  }'
```

### 残高照会
```bash
curl http://localhost:5000/balance/NINJA001
```

### 全口座一覧
```bash
curl http://localhost:5000/accounts
```

## 🔧 主な改善点

### セキュリティ強化
- 入力値検証の実装
- エラーハンドリングの改善
- ログ機能の追加

### コード品質向上
- コンテキストマネージャでDB接続管理
- 設定の外部化
- 適切な例外処理

### 機能拡張
- ヘルスチェックエンドポイント
- 口座削除機能
- より詳細なレスポンス情報

### データベース改善
- タイムスタンプフィールド追加
- インデックス作成
- トランザクション管理強化

## 🛡️ セキュリティ注意事項

本番環境では以下を必ず実施してください：

1. **SECRET_KEY**を安全な値に変更
2. **FLASK_DEBUG**をFalseに設定
3. HTTPS通信の使用
4. 認証・認可機能の実装
5. レート制限の設定

## 📊 ログ

アプリケーションの動作ログが標準出力に出力されます：
- 口座作成・削除
- 取引処理
- エラー情報

## 🐛 トラブルシューティング

### データベースエラー
- データベースファイルの権限を確認
- ディスク容量を確認

### 接続エラー
- ポートが使用中でないか確認
- ファイアウォール設定を確認

### 入力エラー
- JSON形式が正しいか確認
- 必須フィールドが含まれているか確認
