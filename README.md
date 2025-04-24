# Laravel Sail 開発環境構築ガイド （Windows 11, WSL, Ubuntu, Docker Desktop）

## 前提条件
- **WSL**: Windows Subsystem for Linux 2
- **Ubuntu**: 22.04 LTS または 24.04 LTS
- **Docker Desktop**: 最新バージョン (4.27以降)
- **PHP**: 8.2以上（Laravel 11対応）
- **テキストエディタ**: Visual Studio Code推奨

## 1. WSL2とUbuntuの設定

### 1.1 WSL2のインストール
PowerShellを管理者権限で実行:
```powershell
wsl --install
```

インストール完了後、コンピュータの再起動が必要です。

### 1.2 Ubuntuのセットアップ
1. Microsoft Storeから「Ubuntu 22.04.3 LTS」または「Ubuntu 24.04 LTS」をインストール
2. Ubuntuを起動し、ユーザー名とパスワードを設定
3. システムアップデート:
```bash
sudo apt update && sudo apt upgrade -y
```

## 2. Docker Desktopのインストール

1. [Docker Desktop公式サイト](https://www.docker.com/products/docker-desktop/)から最新版をダウンロードしてインストール
2. インストール後、Docker Desktopを起動し、以下の設定を確認:
   - 「Settings」→「General」→「Use the WSL 2 based engine」にチェック
   - 「Settings」→「Resources」→「WSL Integration」で「ubuntu-22.04」（または使用中のUbuntuバージョン）が有効になっていることを確認
   - 「Settings」→「Resources」→「Advanced」でメモリを適切に割り当て（推奨: 8GB以上）

## 3. PHPとComposerのインストール

WSL2のUbuntuターミナルで実行:
```bash
# 必要なパッケージインストール
sudo apt install software-properties-common -y

# PHP 8.2レポジトリ追加
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update

# PHPとモジュールのインストール
sudo apt install php8.2-cli php8.2-xml php8.2-curl php8.2-mbstring php8.2-zip php8.2-bcmath php8.2-gd php8.2-intl unzip -y

# Composerインストール
curl -sS https://getcomposer.org/installer | sudo php -- --install-dir=/usr/local/bin --filename=composer

# バージョン確認
php -v
composer -V
```

## 4. Laravel Sailプロジェクトの作成

```bash
# プロジェクトディレクトリへ移動（Windowsユーザーフォルダにアクセス）
cd /mnt/c/Users/YourUsername/Projects
# ※「YourUsername」は実際のWindowsユーザー名に変更してください
# ※プロジェクトフォルダがない場合は作成: mkdir -p /mnt/c/Users/YourUsername/Projects

# Laravel 11プロジェクト作成
composer create-project laravel/laravel:^11.0 my-project

# プロジェクトディレクトリに移動
cd my-project

# Sailインストール
composer require laravel/sail --dev

# Sail設定（インタラクティブなメニューが表示されます）
php artisan sail:install
# 推奨：mysql,redis,mailpitを選択
```

## 5. 開発環境の構築と起動

```bash
# Sailコマンドのエイリアス設定
echo "alias sail='[ -f sail ] && sh sail || sh vendor/bin/sail'" >> ~/.bashrc
source ~/.bashrc

# Dockerコンテナをバックグラウンドで起動
sail up -d

# 依存関係のインストール
sail composer install
sail npm install

# アプリケーションキー生成
sail artisan key:generate

# マイグレーション実行
sail artisan migrate
```

## 6. プロジェクト設定

### 6.1 データベース設定
`.env`ファイルを編集:
```env
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=laravel
DB_USERNAME=sail
DB_PASSWORD=password
```

### 6.2 Viteの設定と起動
```bash
# 開発サーバー起動
sail npm run dev

# または本番用ビルド
sail npm run build
```

## 7. 開発環境へのアクセス

- アプリケーション: http://localhost
- PHPMyAdmin (データベース管理): http://localhost:8080
- Mailpit (メール確認): http://localhost:8025

## 8. 便利な開発ツール

```bash
# テスト実行
sail artisan test

# コード整形（Laravel Pint）
sail pint

# 静的解析（PHPStan）
sail composer require --dev phpstan/phpstan
sail vendor/bin/phpstan analyze

# アセットのコンパイル監視
sail npm run watch

# Laravelインスペクション
sail artisan about

# ルート一覧
sail artisan route:list
```

## 9. Visual Studio Codeとの連携

1. VS Codeのインストール
2. 拡張機能のインストール:
   - Remote - WSL
   - PHP Intelephense
   - Laravel Blade Snippets
   - Tailwind CSS IntelliSense（Tailwind CSSを使用する場合）

3. WSLから直接VS Codeを開く:
```bash
cd /mnt/c/Users/YourUsername/Projects/my-project
code .
```

## 10. トラブルシューティング

### WSL2のパフォーマンス最適化
`.wslconfig`ファイルを作成 (`C:\Users\YourUsername\.wslconfig`):
```ini
[wsl2]
memory=8GB
processors=4
swap=2GB
localhostForwarding=true
```

### Docker連携の問題
```bash
# Dockerコンテナを完全に再起動
sail down
docker system prune -a
sail up -d
```

### パーミッションの問題
```bash
# ストレージディレクトリの権限修正
sail root-shell
chown -R sail:sail /var/www/html/storage
chmod -R 775 /var/www/html/storage
exit
```

### npmのエラー
```bash
# node_modulesを削除して再インストール
sail down
rm -rf node_modules
sail up -d
sail npm install
```

## 11. 便利なSailコマンド

```bash
# コンテナ起動
sail up -d

# コンテナ停止
sail down

# コンテナ再起動
sail restart

# コンテナログ表示
sail logs

# コンポーザー関連
sail composer require パッケージ名
sail composer update

# npm関連
sail npm install パッケージ名
sail npm update

# Artisanコマンド
sail artisan make:controller TestController
sail artisan make:model Test
sail artisan make:migration create_tests_table

# コンテナシェルアクセス
sail shell
sail root-shell
```

## 12. Git連携のセットアップ

```bash
# Gitの初期設定
git init
git add .
git commit -m "Initial commit"

# GitHub連携
git remote add origin https://github.com/yourusername/my-project.git
git branch -M main
git push -u origin main
```

詳細は[Laravel 11公式ドキュメント](https://laravel.com/docs/11.x/installation)と[Laravel Sail公式ドキュメント](https://laravel.com/docs/11.x/sail)を参照してください。
