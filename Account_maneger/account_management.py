
import csv
import os
import hashlib
import json
import secrets
from datetime import datetime

# アカウント情報を保存するファイル
ACCOUNTS_FILE = "accounts.json"
CSV_EXPORT_FILE = "accounts_export.csv"

MIN_PASSWORD_LENGTH = 8
MIN_USER_ID_LENGTH = 3

def initialize_accounts_file():
    """アカウントファイルが存在しない場合は作成する"""
    if not os.path.exists(ACCOUNTS_FILE):
        with open(ACCOUNTS_FILE, 'w') as f:
            json.dump([], f)

def hash_password(password: str) -> str:
    """パスワードをsalt付きでハッシュ化する (PBKDF2-HMAC-SHA256)"""
    salt = secrets.token_hex(32)
    key = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 260000)
    return f"{salt}:{key.hex()}"

def verify_password(password: str, stored_hash: str) -> bool:
    """パスワードを検証する"""
    if ':' not in stored_hash:
        # 旧形式のハッシュ (sha256のみ) との後方互換
        return stored_hash == hashlib.sha256(password.encode()).hexdigest()
    salt, key_hex = stored_hash.split(':', 1)
    key = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 260000)
    return secrets.compare_digest(key.hex(), key_hex)

def validate_input(user_id: str, username: str, password: str) -> tuple[bool, str]:
    """入力値を検証する"""
    if len(user_id) < MIN_USER_ID_LENGTH:
        return False, f"ユーザーIDは{MIN_USER_ID_LENGTH}文字以上で入力してください"
    if len(username.strip()) == 0:
        return False, "ユーザー名を入力してください"
    if len(password) < MIN_PASSWORD_LENGTH:
        return False, f"パスワードは{MIN_PASSWORD_LENGTH}文字以上で入力してください"
    return True, ""

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

def create_account(user_id: str, username: str, password: str) -> tuple[bool, str]:
    """新しいアカウントを作成する"""
    valid, error = validate_input(user_id, username, password)
    if not valid:
        return False, error

    accounts = load_accounts()

    # 既存のユーザーIDやユーザー名をチェック
    for account in accounts:
        if account['user_id'] == user_id:
            return False, f"ユーザーID「{user_id}」は既に使用されています"
        if account['username'] == username:
            return False, f"ユーザー名「{username}」は既に使用されています"

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

def delete_account(user_id: str) -> tuple[bool, str]:
    """指定されたユーザーIDのアカウントを削除する"""
    accounts = load_accounts()

    for i, account in enumerate(accounts):
        if account['user_id'] == user_id:
            del accounts[i]
            save_accounts(accounts)
            return True, f"ユーザーID「{user_id}」のアカウントが削除されました"

    return False, f"ユーザーID「{user_id}」が見つかりません"

def export_account_list_to_csv() -> tuple[bool, str]:
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
                writer.writerow({
                    'user_id': account['user_id'],
                    'username': account['username'],
                    'created_at': account['created_at'],
                    'last_login': account['last_login'] or 'なし'
                })
        return True, f"{len(accounts)}件のアカウント情報を{CSV_EXPORT_FILE}にエクスポートしました"
    except Exception as e:
        return False, f"エクスポート中にエラーが発生しました: {e}"

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

def login(user_id: str, password: str) -> tuple[bool, str]:
    """ユーザーログイン処理"""
    accounts = load_accounts()

    for i, account in enumerate(accounts):
        if account['user_id'] == user_id and verify_password(password, account['password']):
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
        
        input("\nEnterキーを押して続行...