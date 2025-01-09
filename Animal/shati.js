import sqlite3
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# データベース初期化
def init_db():
    conn = sqlite3.connect('ninja_orca_bank.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS accounts
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  account_number TEXT UNIQUE,
                  owner_name TEXT,
                  balance REAL)''')
    conn.commit()
    conn.close()

init_db()

# 新規口座開設
@app.route('/create_account', methods=['POST'])
def create_account():
    data = request.json
    conn = sqlite3.connect('ninja_orca_bank.db')
    c = conn.cursor()
    try:
        c.execute("INSERT INTO accounts (account_number, owner_name, balance) VALUES (?, ?, ?)",
                  (data['accountNumber'], data['ownerName'], data['balance']))
        conn.commit()
        return jsonify({"message": "新規忍者シャチ口座が開設されました。"}), 201
    except sqlite3.IntegrityError:
        return jsonify({"error": "この忍者シャチコードは既に使用されています。"}), 400
    finally:
        conn.close()

# 取引（入金/出金）
@app.route('/transaction', methods=['POST'])
def transaction():
    data = request.json
    conn = sqlite3.connect('ninja_orca_bank.db')
    c = conn.cursor()
    try:
        c.execute("SELECT balance FROM accounts WHERE account_number = ?", (data['accountNumber'],))
        result = c.fetchone()
        if result is None:
            return jsonify({"error": "忍者シャチが見つかりません。深海に潜んでいるかもしれません。"}), 404
        
        current_balance = result[0]
        new_balance = current_balance + data['amount'] if data['type'] == 'deposit' else current_balance - data['amount']
        
        if new_balance < 0:
            return jsonify({"error": "魚ポイントが不足しています。もっと魚を捕まえてください！"}), 400
        
        c.execute("UPDATE accounts SET balance = ? WHERE account_number = ?", (new_balance, data['accountNumber']))
        conn.commit()
        return jsonify({"message": f"{abs(data['amount'])}魚ポイントが{'獲得' if data['type'] == 'deposit' else '使用'}されました。新しい魚ポイント: {new_balance}"}), 200
    finally:
        conn.close()

# 残高照会
@app.route('/balance/<account_number>', methods=['GET'])
def get_balance(account_number):
    conn = sqlite3.connect('ninja_orca_bank.db')
    c = conn.cursor()
    try:
        c.execute("SELECT balance FROM accounts WHERE account_number = ?", (account_number,))
        result = c.fetchone()
        if result is None:
            return jsonify({"error": "忍者シャチが見つかりません。海中忍術で姿を隠しているかもしれません。"}), 404
        return jsonify({"balance": result[0]}), 200
    finally:
        conn.close()

# 全口座一覧
@app.route('/accounts', methods=['GET'])
def list_accounts():
    conn = sqlite3.connect('ninja_orca_bank.db')
    c = conn.cursor()
    try:
        c.execute("SELECT account_number, owner_name, balance FROM accounts")
        accounts = [{"accountNumber": row[0], "ownerName": row[1], "balance": row[2]} for row in c.fetchall()]
        return jsonify(accounts), 200
    finally:
        conn.close()

if __name__ == '__main__':
    app.run(debug=True)
