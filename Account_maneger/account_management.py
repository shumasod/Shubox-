
import csv
import os
import hashlib
import json
from datetime import datetime

# アカウント情報を保存するファイル
ACCOUNTS_FILE = "accounts.json"
CSV_EXPORT_FILE = "accounts_export.csv"

def initialize_accounts_file():
    """アカウントファイルが存在しない場合は作成する"""
    if not os.path.exists(ACCOUNTS_FILE):
        with open(ACCOUNTS_FILE, 'w') as f:
            json.dump([], f)

def hash_password(password):
    """パスワードをハッシュ化する"""
    return hashlib.sha256(password.encode()).hexdigest()

def load_accounts():
    """アカウント情報を読み込む"""
    initialize_accounts_file()
    with open(ACCOUNTS_FILE, 'r') as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []

def save_accounts(accounts):
    """アカウント情報を保存する"""
    with open(ACCOUNTS_FILE, 'w') as f:
        json.dump(accounts, f, indent=2)

def create_account(user_id, username, password):
    """新しいアカウントを作成する"""
    accounts = load_accounts()
    
    # 既存のユーザーIDやユーザー名をチェック
    for account in accounts:
        if account['user_id'] == user_id:
            return False, "ユーザーID「{}」は既に使用されています".format(user_id)
        if account['username'] == username:
            return False, "ユーザー名「{}」は既に使用されています".format(username)
    
    # 新しいアカウントを追加
    new_account = {
        'user_id': user_id,
        'username': username,
        'password': hash_password(password),
        'created_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'last_login': None
    }
    
    accounts.append(new_account)
    save_accounts(accounts)
    return True, "アカウントが正常に作成されました"

def delete_account(user_id):
    """指定されたユーザーIDのアカウントを削除する"""
    accounts = load_accounts()
    
    # 削除対象のアカウントを探す
    for i, account in enumerate(accounts):
        if account['user_id'] == user_id:
            del accounts[i]
            save_accounts(accounts)
            return True, "ユーザーID「{}」のアカウントが削除されました".format(user_id)
    
    return False, "ユーザーID「{}」が見つかりません".format(user_id)

def export_account_list_to_csv():
    """アカウント情報をCSVファイルにエクスポートする"""
    accounts = load_accounts()
    
    if not accounts:
        return False, "エクスポートするアカウントがありません"
    
    try:
        with open(CSV_EXPORT_FILE, 'w', newline='') as csvfile:
            fieldnames = ['user_id', 'username', 'created_at', 'last_login']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            writer.writeheader()
            for account in accounts:
                # パスワードは含めない
                writer.writerow({
                    'user_id': account['user_id'],
                    'username': account['username'],
                    'created_at': account['created_at'],
                    'last_login': account['last_login'] or 'なし'
                })
        
        return True, "{}件のアカウント情報を{}にエクスポートしました".format(len(accounts), CSV_EXPORT_FILE)
    except Exception as e:
        return False, "エクスポート中にエラーが発生しました: {}".format(str(e))

def list_accounts():
    """登録されているアカウント一覧を表示する"""
    accounts = load_accounts()
    
    if not accounts:
        return "登録されているアカウントはありません"
    
    result = "アカウント一覧 (合計: {}件)\n".format(len(accounts))
    result += "-" * 60 + "\n"
    result += "{:<15} {:<20} {:<25}\n".format("ユーザーID", "ユーザー名", "作成日時")
    result += "-" * 60 + "\n"
    
    for account in accounts:
        result += "{:<15} {:<20} {:<25}\n".format(
            account['user_id'],
            account['username'],
            account['created_at']
        )
    
    return result

def login(user_id, password):
    """ユーザーログイン処理"""
    accounts = load_accounts()
    
    for i, account in enumerate(accounts):
        if account['user_id'] == user_id and account['password'] == hash_password(password):
            # 最終ログイン日時を更新
            accounts[i]['last_login'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            save_accounts(accounts)
            return True, "ログインに成功しました"
    
    return False, "ユーザーIDまたはパスワードが正しくありません"

def display_menu():
    """メニューを表示する"""
    print("\n===== アカウント管理システム =====")
    print("1. アカウント作成")
    print("2. アカウント削除")
    print("3. アカウント一覧表示")
    print("4. CSVにエクスポート")
    print("5. ログイン")
    print("0. 終了")
    print("===============================")

if __name__ == "__main__":
    initialize_accounts_file()
    
    while True:
        display_menu()
        choice = input("選択してください (0-5): ")
        
        if choice == '0':
            print("システムを終了します。")
            break
        
        elif choice == '1':
            user_id = input("ユーザーID: ")
            username = input("ユーザー名: ")
            password = input("パスワード: ")
            
            success, message = create_account(user_id, username, password)
            print(message)
            
        elif choice == '2':
            user_id = input("削除するユーザーID: ")
            success, message = delete_account(user_id)
            print(message)
            
        elif choice == '3':
            print(list_accounts())
            
        elif choice == '4':
            success, message = export_account_list_to_csv()
            print(message)
            
        elif choice == '5':
            user_id = input("ユーザーID: ")
            password = input("パスワード: ")
            success, message = login(user_id, password)
            print(message)
            
        else:
            print("無効な選択です。もう一度お試しください。")
        
        input("\nEnterキーを押して続行...")
```

### 実装した機能と特徴

1. **アカウント作成機能**
   - ユーザーIDとユーザー名の重複チェック
   - パスワードのハッシュ化（SHA-256）
   - アカウント作成日時の記録

2. **アカウント削除機能**
   - 指定されたユーザーIDのアカウントを削除

3. **CSVエクスポート機能**
   - セキュリティのためパスワードを除外
   - 必要な情報だけをCSVに書き出し

4. **追加機能**
   - アカウント一覧表示機能
   - ログイン機能（最終ログイン日時の記録）
   - 対話型のコマンドラインインターフェース

5. **データ管理**
   - JSONファイルを使用したアカウント情報の永続化
   - エラーハンドリングとユーザーフィードバック

6. **セキュリティ対策**
   - パスワードをハッシュ化して保存
   - CSVエクスポート時にパスワード管理の各機能を利用できます。アカウント情報はJSONファイルに保存され、ファイルがない場合は自動的に作成されます。​​​​​​​​​​​​​​​​