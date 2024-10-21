# Laravel Sail 開発環境構築ガイド（Windows 11, WSL2, Ubuntu, Docker Desktop）

このガイドでは、Windows 11上でWSL、Ubuntu、Docker Desktopを使用してLaravel Sailの開発環境をセットアップする手順を詳細に説明します。

## 目次
1. [前提条件](#前提条件)
2. [WSL2とUbuntuの設定](#1-wsl2とubuntuの設定)
3. [Docker Desktopのインストール](#2-docker-desktopのインストール)
4. [PHPとComposerのインストール](#3-phpとcomposerのインストール)
5. [Laravel Sailのインストールとプロジェクト作成](#4-laravel-sailのインストールとプロジェクト作成)
6. [開発環境の起動と確認](#5-開発環境の起動と確認)
7. [プロジェクトへのアクセス](#6-プロジェクトへのアクセス)
8. [追加情報とトラブルシューティング](#7-追加情報とトラブルシューティング)

## 前提条件

- **Windows 11**: 最新のアップデートが適用されていること
- **WSL2**: Windows Subsystem for Linux 2が有効化されていること
- **Ubuntu**: WSL2上にUbuntu (推奨バージョン: 22.04 LTS以降) がインストールされていること
- **Docker Desktop**: Windows用の最新版がインストールされていること
- **テキストエディタ**: Visual Studio Code (推奨) または任意のコードエディタ

## 1. WSL2とUbuntuの設定

### 1.1 WSL2の有効化

1. **管理者権限**でPowerShellを開き、以下のコマンドを実行:
   ```powershell
   wsl --install
   ```
2. コンピュータを**再起動**します。

### 1.2 Ubuntuのインストールと設定

1. **Microsoft Store**で「Ubuntu」を検索し、最新版をインストール。
2. インストール完了後、Ubuntuを起動。
3. 新しいUNIXユーザー名とパスワードを設定。
4. 以下のコマンドでシステムを更新:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

## 2. Docker Desktopのインストール

1. [Docker公式サイト](https://www.docker.com/products/docker-desktop/)からDocker Desktop for Windowsをダウンロード。
2. インストーラーを実行し、指示に従ってインストール。
3. インストール完了後、Docker Desktopを起動。
4. 設定で「Use the WSL 2 based engine」にチェックが入っていることを確認。
5. 「Resources」>「WSL Integration」で使用するUbuntuディストリビューションを有効化。

## 3. PHPとComposerのインストール

1. UbuntuターミナルでPHPとその依存関係をインストール:
   ```bash
   sudo apt install php-cli php-xml php-curl php-zip unzip -y
   ```
2. Composerのインストール:
   ```bash
   curl -sS https://getcomposer.org/installer | sudo php -- --install-dir=/usr/local/bin --filename=composer
   ```

## 4. Laravel Sailのインストールとプロジェクト作成

1. プロジェクトを作成するディレクトリに移動:
   ```bash
   cd /mnt/c/Users/YourUsername/Projects
   ```
2. Laravelプロジェクトを作成:
   ```bash
   composer create-project laravel/laravel my-project
   ```
3. プロジェクトディレクトリに移動:
   ```bash
   cd my-project
   ```
4. Laravel Sailをインストール:
   ```bash
   composer require laravel/sail --dev
   ```
5. Sailの設定ファイルを公開:
   ```bash
   php artisan sail:install
   ```

## 5. 開発環境の起動と確認

1. Sailを使用してDockerコンテナを起動:
   ```bash
   ./vendor/bin/sail up -d
   ```
2. ブラウザで `http://localhost` を開き、Laravelのウェルカムページが表示されることを確認。

## 6. プロジェクトへのアクセス

### 6.1 WSL2からのアクセス

- WSL2のUbuntuターミナルから直接プロジェクトディレクトリにアクセス可能。

### 6.2 Visual Studio Codeからのアクセス

1. VS Codeを起動し、「File」>「Open Folder」を選択。
2. `/mnt/c/Users/YourUsername/Projects/my-project` を開く。
3. 必要に応じて、WSL拡張機能をインストールして、WSL2内のファイルに直接アクセス。

## 7. 追加情報とトラブルシューティング

- **コンテナの停止**: 作業終了時は `./vendor/bin/sail down` を実行。
- **データベース接続**: デフォルトでMySQLが設定されています。接続情報は `.env` ファイルを確認。
- **Xdebugの設定**: デバッグが必要な場合、Sailの設定ファイルでXdebugを有効化できます。
- **パフォーマンスの最適化**: 大規模プロジェクトの場合、WSL2のメモリ使用量を `.wslconfig` ファイルで調整することを検討。

詳細な情報やトラブルシューティングについては、[Laravel Sail公式ドキュメント](https://laravel.com/docs/sail)を参照してください。

