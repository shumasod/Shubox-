

# Laravel Sail 開発環境構築ガイド （Windows 11, WSL2, Ubuntu, Docker Desktop）

## 前提条件
- **Windows 11**: 最新のアップデート適用済み（バージョン 22H2以降推奨）
- **WSL2**: Windows Subsystem for Linux 2
- **Ubuntu**: 22.04 LTS または 23.10
- **Docker Desktop**: 2024年最新版
- **PHP**: 8.2以上（Laravel 11対応）
- **テキストエディタ**: Visual Studio Code推奨

## 1. WSL2とUbuntuの設定
### 1.1 WSL2のインストール
PowerShellを管理者権限で実行:
```powershell
wsl --install
```

### 1.2 Ubuntuのセットアップ
1. Microsoft Storeから「Ubuntu 22.04.3 LTS」をインストール
2. Ubuntuを起動しユーザー設定
3. システムアップデート:
```bash
sudo apt update && sudo apt upgrade -y
```

## 2. Docker Desktopのインストール
1. [Docker Desktop 4.27以降](https://www.docker.com/products/docker-desktop/)をインストール
2. 設定で以下を確認:
   - WSL 2ベースエンジンの使用
   - WSL Integrationでのubuntu-22.04の有効化
   - Resource設定での適切なメモリ割り当て（推奨: 8GB以上）

## 3. PHPとComposerのインストール
```bash
# PHPとモジュールのインストール
sudo apt install php8.2-cli php8.2-xml php8.2-curl php8.2-zip unzip -y

# Composerインストール
curl -sS https://getcomposer.org/installer | sudo php -- --install-dir=/usr/local/bin --filename=composer
```

## 4. Laravel Sailプロジェクトの作成
```bash
cd /mnt/c/Users/YourUsername/Projects

# Laravel 11プロジェクト作成
composer create-project laravel/laravel:^11.0 my-project

cd my-project

# Sailインストール
composer require laravel/sail --dev

# Sail設定
php artisan sail:install
```

## 5. 開発環境の構築と起動
```bash
# エイリアス設定
echo "alias sail='[ -f sail ] && sh sail || sh vendor/bin/sail'" >> ~/.bashrc
source ~/.bashrc

# コンテナ起動
sail up -d

# 依存関係インストール
sail composer install
sail npm install

# アプリケーションキー生成
sail artisan key:generate
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

### 6.2 Viteの設定
```bash
# 開発サーバー起動
sail npm run dev
```

## 7. 開発環境へのアクセス
- アプリケーション: http://localhost
- PHPMyAdmin: http://localhost:8080
- Mailpit: http://localhost:8025

## 8. 便利な開発ツール
```bash
# テスト実行
sail artisan test

# コード整形
sail pint

# 静的解析
sail composer require --dev phpstan/phpstan
sail vendor/bin/phpstan analyze
```

## 9. トラブルシューティング
### パフォーマンス最適化
`.wslconfig`ファイルを作成 (`C:\Users\YourUsername\.wslconfig`):
```ini
[wsl2]
memory=8GB
processors=4
swap=2GB
```

### 一般的な問題解決
- コンテナ再起動: `sail down && sail up -d`
- キャッシュクリア: `sail artisan optimize:clear`
- 権限問題: `sail root-shell`で権限修正

詳細は[Laravel 11公式ドキュメント](https://laravel.com/docs/11.x/installation)を参照してください。
