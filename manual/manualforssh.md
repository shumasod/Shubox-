# SSH接続障害の診断・復旧マニュアル

## 🔍 状況分析

**現在の状況:**
- ✅ Webサービスは正常に動作（アプリケーションレイヤーは正常）
- ❌ 外部からのSSH接続が不可能
- ✅ 同セグメント内からのSSH接続は可能
- ⚠️ auth.logに不審なIPからの大量アクセス記録

**推測される原因:**
1. **fail2ban による自動ブロック（最有力）**
2. iptables/firewall の設定変更
3. SSH デーモンの設定変更
4. ネットワーク機器での制限
5. プロバイダー側でのブロック

---

## 📋 STEP 1: 緊急診断フェーズ

### 1.1 同セグメントサーバーからの初期診断

```bash
# 対象サーバーに同セグメントから接続
ssh admin@target-server-ip

# SSH サービス状態確認
sudo systemctl status sshd
sudo systemctl status ssh  # Ubuntu/Debian の場合

# プロセス確認
sudo ps aux | grep sshd
sudo netstat -tlnp | grep :22
```

### 1.2 fail2ban 状態確認

```bash
# fail2ban サービス状態
sudo systemctl status fail2ban

# 現在のブロック状況確認
sudo fail2ban-client status

# SSH jail の詳細確認
sudo fail2ban-client status sshd
# または
sudo fail2ban-client status ssh

# ブロックされているIPアドレス一覧
sudo fail2ban-client get sshd banned
```

### 1.3 iptables/firewall 確認

```bash
# iptables ルール確認
sudo iptables -L -n --line-numbers
sudo iptables -L INPUT -n --line-numbers

# ufw 使用の場合
sudo ufw status numbered

# firewalld 使用の場合
sudo firewall-cmd --list-all
```

### 1.4 ログ分析

```bash
# 最近のSSH関連ログ
sudo tail -100 /var/log/auth.log
sudo grep "Failed password" /var/log/auth.log | tail -20
sudo grep "authentication failure" /var/log/auth.log | tail -20

# fail2ban ログ
sudo tail -50 /var/log/fail2ban.log
sudo grep "Ban" /var/log/fail2ban.log | tail -10

# オフィスIPの確認
echo "現在のオフィスIP: $(curl -s ifconfig.me)"
```

---

## 🔧 STEP 2: 安全な復旧手順

### 2.1 fail2ban によるブロックの場合

#### A. オフィスIPのアンブロック

```bash
# 現在のオフィスIPを確認
OFFICE_IP=$(curl -s ifconfig.me)
echo "Office IP: $OFFICE_IP"

# fail2ban から IP をアンブロック
sudo fail2ban-client set sshd unbanip $OFFICE_IP

# 確認
sudo fail2ban-client get sshd banned
```

#### B. 緊急用ホワイトリスト設定

```bash
# fail2ban 設定ファイルのバックアップ
sudo cp /etc/fail2ban/jail.local /etc/fail2ban/jail.local.backup.$(date +%Y%m%d_%H%M%S)

# ホワイトリスト追加
sudo vim /etc/fail2ban/jail.local
```

**jail.local に追加:**
```ini
[DEFAULT]
# 既存の ignoreip に追加（例）
ignoreip = 127.0.0.1/8 ::1 YOUR_OFFICE_IP/32 YOUR_VPN_RANGE/24

[sshd]
enabled = true
# より厳しい設定に変更
maxretry = 3
bantime = 3600
findtime = 300
```

#### C. 設定反映

```bash
# fail2ban 再起動
sudo systemctl restart fail2ban

# 状態確認
sudo fail2ban-client status sshd
```

### 2.2 iptables 直接ブロックの場合

```bash
# 特定IPのブロックルール削除
sudo iptables -D INPUT -s YOUR_OFFICE_IP -j DROP

# または行番号で削除
sudo iptables -L INPUT --line-numbers
sudo iptables -D INPUT [行番号]

# 設定保存
sudo iptables-save > /etc/iptables/rules.v4  # Debian/Ubuntu
sudo service iptables save  # CentOS/RHEL
```

### 2.3 SSH 設定問題の場合

```bash
# SSH 設定確認
sudo sshd -t

# 設定ファイル確認
sudo vim /etc/ssh/sshd_config

# 主要設定項目チェック
grep -E "^(Port|PermitRootLogin|PasswordAuthentication|AllowUsers|DenyUsers)" /etc/ssh/sshd_config

# SSH サービス再起動
sudo systemctl restart sshd
```

---

## 🛡️ STEP 3: 接続テストと検証

### 3.1 段階的接続テスト

```bash
# 1. 同セグメントから接続テスト
ssh -v admin@target-server-ip

# 2. 外部から接続テスト（別の場所/回線から）
ssh -v admin@target-server-ip

# 3. 詳細デバッグ（必要に応じて）
ssh -vvv admin@target-server-ip
```

### 3.2 セキュリティ状態確認

```bash
# アクティブな接続確認
sudo netstat -an | grep :22
sudo ss -tlnp | grep :22

# 最近のログイン記録
sudo last | head -20
sudo lastb | head -10  # 失敗したログイン試行

# fail2ban 統計
sudo fail2ban-client status sshd
```

---

## 🔒 STEP 4: セキュリティ強化と再発防止

### 4.1 fail2ban 設定最適化

```bash
# カスタム jail 設定
sudo vim /etc/fail2ban/jail.d/custom-ssh.conf
```

**custom-ssh.conf:**
```ini
[sshd]
enabled = true
port = 22
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 7200
findtime = 300
# 信頼できるIPの永続ホワイトリスト
ignoreip = 127.0.0.1/8 ::1 YOUR_OFFICE_IP/32 YOUR_BACKUP_IP/32

# より厳しいルール
[sshd-aggressive]
enabled = true
port = 22
filter = sshd
logpath = /var/log/auth.log
maxretry = 1
bantime = 86400
findtime = 86400
# 不正なユーザー名での試行を即座にブロック
action = iptables-multiport[name=SSH-aggressive, port="22", protocol=tcp]
```

### 4.2 SSH セキュリティ強化

```bash
# SSH 設定の強化
sudo vim /etc/ssh/sshd_config
```

**推奨設定:**
```bash
# 基本セキュリティ設定
Port 2222  # デフォルトポート変更を検討
PermitRootLogin no
PasswordAuthentication no  # 鍵認証のみ
PubkeyAuthentication yes
AuthenticationMethods publickey

# 接続制限
MaxAuthTries 3
MaxSessions 3
MaxStartups 5:30:10

# タイムアウト設定
ClientAliveInterval 300
ClientAliveCountMax 2

# 特定ユーザー/IPの制限
AllowUsers admin@YOUR_OFFICE_IP backup-user@YOUR_BACKUP_IP
DenyUsers root

# ログ強化
LogLevel VERBOSE
```

### 4.3 監視とアラート設定

```bash
# ログ監視スクリプト作成
sudo vim /usr/local/bin/ssh-monitor.sh
```

**監視スクリプト例:**
```bash
#!/bin/bash
# SSH攻撃監視スクリプト

THRESHOLD=10
LOGFILE="/var/log/auth.log"
ALERT_EMAIL="admin@yourdomain.com"

# 過去1時間の失敗ログイン数をチェック
FAILED_ATTEMPTS=$(grep "$(date '+%b %d %H')" $LOGFILE | grep "Failed password" | wc -l)

if [ $FAILED_ATTEMPTS -gt $THRESHOLD ]; then
    echo "高頻度のSSH攻撃を検出: $FAILED_ATTEMPTS 回の失敗" | \
    mail -s "SSH Alert: $(hostname)" $ALERT_EMAIL
fi

# fail2ban統計をログ
fail2ban-client status sshd >> /var/log/ssh-security.log
```

### 4.4 緊急アクセス手順の確立

```bash
# 緊急用アクセス手順書作成
sudo vim /root/emergency-access-procedures.md
```

**緊急手順:**
```markdown
## 緊急SSH復旧手順

### コンソールアクセス経由
1. クラウドコンソール/IPMI経由でサーバーアクセス
2. fail2ban-client set sshd unbanip [OFFICE_IP]
3. systemctl restart fail2ban

### 代替接続方法
1. VPN経由接続: vpn.company.com
2. 踏み台サーバー経由: bastion.company.com
3. 緊急用ポート: tcp/2223 (fail2ban対象外)

### 連絡先
- システム管理者: +XX-XXXX-XXXX
- クラウドサポート: support@provider.com
```

---

## 📊 STEP 5: 事後分析と改善

### 5.1 インシデント分析

```bash
# 攻撃パターン分析
sudo grep "Failed password" /var/log/auth.log | \
awk '{print $11}' | sort | uniq -c | sort -nr | head -10

# 攻撃元IP分析
sudo grep "Failed password" /var/log/auth.log | \
awk '{print $11}' | sort | uniq | head -20

# 時系列分析
sudo grep "Failed password" /var/log/auth.log | \
awk '{print $1, $2, $3}' | sort | uniq -c
```

### 5.2 定期メンテナンス計画

```bash
# 定期実行タスク設定
sudo crontab -e
```

**cron設定例:**
```bash
# 毎日午前2時にfail2banログローテーション
0 2 * * * /usr/sbin/logrotate /etc/logrotate.d/fail2ban

# 毎週月曜日にセキュリティレポート生成
0 9 * * 1 /usr/local/bin/weekly-security-report.sh

# 毎月1日にIPホワイトリスト確認
0 10 1 * * /usr/local/bin/check-ip-whitelist.sh
```

---

## 🚨 緊急時チェックリスト

### 即座に確認すべき項目

- [ ] Webサービスの稼働状況
- [ ] 同セグメントからのSSH接続可否
- [ ] fail2ban-client status の出力
- [ ] 現在のオフィスIP確認
- [ ] auth.log の最新エントリ
- [ ] iptables -L の出力

### 復旧作業の優先順位

1. **最優先**: オフィスIPのアンブロック
2. **高優先**: セキュリティ設定の確認
3. **中優先**: 監視体制の強化
4. **低優先**: 長期的なセキュリティ改善

---

## 📝 ドキュメント更新

この対応後、以下のドキュメントを更新してください：

1. **運用手順書**: SSH接続障害時の対応手順
2. **セキュリティポリシー**: fail2ban設定基準
3. **緊急連絡先**: 最新の連絡先情報
4. **ネットワーク図**: 信頼できるIPアドレス一覧

---

*最終更新: $(date '+%Y-%m-%d %H:%M:%S')*
