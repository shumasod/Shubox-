```markdown
# Laravel Sail 環境構築手順（WSL2、Ubuntu 23.04、Docker Desktop、Windows 11）

このReadmeは、WSL2、Ubuntu、Docker、Windows環境でLaravel Sailを使用した開発環境を構築するための手順を説明します。

## 前提条件

- Windows WSL2が有効になっていること
- Ubuntuがインストールされていること
- Docker Desktopがインストールされていること
- Visual Studio Codeまたはその他のテキストエディタ

## 手順

### 1. WSL2とUbuntuのインストール

#### 1.1. WSL2の有効化

1. スタートメニューを開き、「設定」を選択します。
2. 「アプリ」 > 「オプション機能」 > 「関連設定」 > 「Wsl」を選択します。
3. 「Windows Subsystem for Linuxの有効化」をクリックします。
4. コンピュータを再起動します。

#### 1.2. Ubuntuのインストール

1. Microsoft Storeを開き、「Ubuntu」を検索します。
2. 「Ubuntu」を選択し、「インストール」をクリックします。
3. インストールが完了したら、Ubuntuを起動します。
4. ユーザー名とパスワードを設定します。

### 2. Docker Desktopのインストール

1. Docker Desktopの公式サイト（<https://www.docker.com/get-started>）からインストーラーをダウンロードします。
2. ダウンロードしたインストーラーを実行します。
3. インストーラーの指示に従って、Docker Desktopをインストールします。

### 3. Laravel Sailのインストール

#### 3.1. プロジェクトの作成

1. 任意のディレクトリに移動します。
2. 以下のコマンドを実行して、Laravelプロジェクトを作成します。

    ```sh
    composer create-project laravel/laravel my-project
    ```

3. 作成されたプロジェクトディレクトリに移動します。

    ```sh
    cd my-project
    ```

#### 3.2. Laravel Sailのインストール

以下のコマンドを実行して、Laravel Sailをインストールします。

```sh
composer global require laravel/sail
```

### 4. コンテナの起動

以下のコマンドを実行して、開発環境用のコンテナを起動します。

```sh
./vendor/bin/sail up
```

### 5. ブラウザでの確認

ブラウザで `http://localhost:8080` を開き、Laravelアプリケーションが表示されることを確認します。

### 6. プロジェクトへのアクセス

#### 6.1. WSL2からのアクセス

以下のコマンドを実行して、WSL2上でプロジェクトフォルダにアクセスします。

```sh
cd /mnt/c/Users/<ユーザー名>/my-project
```

#### 6.2. Visual Studio Codeからのアクセス

1. Visual Studio Codeを開きます。
2. 「ファイル」 > 「開くフォルダー」を選択します。
3. 「WSL: Ubuntu」を選択します。
4. `/mnt/c/Users/<ユーザー名>/my-project` を選択して、「開く」をクリックします。

### 7. 終了

以下のコマンドを実行して、コンテナを停止します。

```sh
./vendor/bin/sail down
```

### 8. その他

詳細については、Laravel Sailの公式ドキュメント（<https://laravel.com/docs/9.x/sail>）を参照してください。

## 注意事項

- 上記の手順は、Windows 11 Pro またはEnterpriseを使用していることを前提としています。
- WSL2とUbuntuのバージョンによっては、上記の手順が異なる場合があります。
- Docker Desktopのバージョンによっては、上記の手順が異なる場合があります。
- Laravel Sailのバージョンによっては、上記の手順が異なる場合があります。
```
