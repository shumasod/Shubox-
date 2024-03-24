

### My Memo

#### 自己学習やコレクション用のリポジトリ


Laravel Sail 環境構築手順（WSL、Ubuntu23.04 Docker、hyper-v Windows 11）
このReadmeは、WSL2、Ubuntu、Docker、Windows 11環境で Laravel Sail を使用した開発環境を構築するための手順をより具体的に説明します。

### 前提条件
Windows 11 
WSL2 が有効になっていること
Ubuntuがインストールされていること
Docker Desktop がインストールされていること
Visual Studio Code またはその他のテキストエディタ
手順
## 1. WSL2 と Ubuntu のインストール

## 1.1. WSL2 の有効化

スタートメニュー を開き、設定 を選択します。
アプリ > オプション機能 > 関連設定 > Windows Subsystem for Linux を選択します。
Windows Subsystem for Linux の 有効化 をクリックします。
コンピュータを再起動します。
## 1.2. Ubuntu のインストール

Microsoft Store を開き、Ubuntu を検索します。
Ubuntu を選択し、インストール をクリックします。
インストールが完了したら、Ubuntu を起動します。
ユーザー名とパスワードを設定します。
## 2. Docker Desktop のインストール

Docker Desktop の公式サイト (https://www.docker.com/get-started) からインストーラーをダウンロードします。
ダウンロードしたインストーラーを実行します。
インストーラーの指示に従って、Docker Desktop をインストールします。
## 3. Laravel Sail のインストール

## 3.1. プロジェクトの作成

任意のディレクトリに移動します。
以下のコマンドを実行して、Laravel プロジェクトを作成します。
composer create-project laravel/laravel my-project
作成されたプロジェクトディレクトリに移動します。
cd my-project
3.2. Laravel Sail のインストール

以下のコマンドを実行して、Laravel Sail をインストールします。

composer global require laravel/sail
## 4. コンテナの起動

以下のコマンドを実行して、開発環境用のコンテナを起動します。

sail up
5. ログイン

ブラウザで http://localhost:8080 を開き、Laravel アプリケーションが表示されることを確認します。

## 6. プロジェクトへのアクセス

## 6.1. WSL2 からのアクセス

以下のコマンドを実行して、WSL2 上でプロジェクトフォルダにアクセスします。

cd /mnt/c/Users/<ユーザー名>/my-project
## 6.2. Visual Studio Code からのアクセス

Visual Studio Code を開き、ファイル > 開くフォルダー を選択します。
WSL: Ubuntu を選択します。
/mnt/c/Users/<ユーザー名>/my-project を選択して、開く をクリックします。
## 7. 終了

以下のコマンドを実行して、コンテナを停止します。

sail down
## 8. その他

詳細については、Laravel Sail の公式ドキュメント (https://laravel.com/docs/9.x/sail) を参照してください。

注意事項
上記の手順は、Windows 11 Pro または Enterprise を使用していることを前提としています。
WSL2 と Ubuntu のバージョンによっては、上記の手順が異なる場合があります。
Docker Desktop のバージョンによっては、上記の手順が異なる場合があります。
Laravel Sail のバージョンによっては、上記の手順が異なる場合があります。
