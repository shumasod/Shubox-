const axios = require('axios');
const AWS = require('aws-sdk');

// Initialize AWS Systems Manager Parameter Store
const ssm = new AWS.SSM();

// Function to get parameters from Parameter Store
async function getParameter(paramName) {
  const params = {
    Name: paramName,
    WithDecryption: true
  };
  
  try {
    const response = await ssm.getParameter(params).promise();
    return response.Parameter.Value;
  } catch (error) {
    console.error(`Error retrieving parameter ${paramName}:`, error);
    throw new Error('Error retrieving configuration');
  }
}

// Function to create a new issue in Backlog
async function createBacklogIssue(projectId, summary, description, issueTypeId) {
  try {
    const apiKey = await getParameter('/backlog/api-key');
    const backlogBaseUrl = await getParameter('/backlog/base-url');
    
    // Backlog APIではAPIキーはクエリパラメータとして渡す
    const url = `${backlogBaseUrl}/api/v2/issues?apiKey=${apiKey}`;
    
    const data = {
      projectId,
      summary,
      description,
      issueTypeId
    };

    const response = await axios.post(url, data);
    return response.data;
  } catch (error) {
    console.error('Error creating Backlog issue:', error);
    throw error; // 元のエラーを伝播させて、詳細なエラー情報をログに残す
  }
}

// Lambda function handler
exports.handler = async (event, context) => {
  try {
    // リクエストボディがない場合のエラーハンドリング
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Missing request body'
        })
      };
    }

    // Extract information from the event
    let payload;
    try {
      payload = JSON.parse(event.body);
    } catch (error) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Invalid JSON in request body'
        })
      };
    }

    const { projectId, summary, description, issueTypeId = 1 } = payload;
    
    // 必須パラメータのバリデーション
    if (!projectId || !summary) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Missing required parameters: projectId and summary are required'
        })
      };
    }

    // Create a new issue in Backlog
    const newIssue = await createBacklogIssue(projectId, summary, description, issueTypeId);

    return {
      statusCode: 201, // 新規リソース作成には201を使用
      body: JSON.stringify({
        message: 'Issue created successfully',
        issueId: newIssue.id,
        issue: newIssue
      })
    };
  } catch (error) {
    console.error('Lambda function error:', error);
    
    // エラーの種類によってステータスコードを分岐
    const statusCode = error.response?.status || 500;
    
    // クライアントには詳細なエラー情報を返さない
    return {
      statusCode,
      body: JSON.stringify({
        message: 'An error occurred while processing your request'
      })
    };
  }
};




# Backlog自動課題作成システムの設定手順

## 1. AWS Systems Manager Parameter Storeの設定

以下のパラメータを作成します：

- パラメータ名: `/backlog/api-key`
  - タイプ: SecureString
  - 値: BacklogのAPIキー

- パラメータ名: `/backlog/base-url`
  - タイプ: String
  - 値: `https://あなたのスペース名.backlog.com`

## 2. Lambda関数の作成

1. AWS Management Consoleにログイン
2. Lambda サービスを開く
3. 「関数の作成」をクリック
4. 関数名を入力（例：`backlog-auto-issue-creator`）
5. ランタイムは「Node.js 18.x」を選択
6. 「関数の作成」をクリック
7. コードエディタに先ほどのコードをコピー＆ペースト
8. 「依存関係」セクションで、「レイヤーの追加」をクリック
9. 新しいレイヤーを作成し、`axios`を含むnpmパッケージをアップロード
   ```bash
   mkdir nodejs
   cd nodejs
   npm init -y
   npm install axios
   cd ..
   zip -r layer.zip nodejs
   ```
10. 作成したレイヤーをLambda関数に追加

## 3. IAMロールの設定

Lambda関数に以下の権限を持つIAMロールを割り当てます：

1. SSMパラメータを読み取る権限
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "ssm:GetParameter"
         ],
         "Resource": [
           "arn:aws:ssm:リージョン:アカウントID:parameter/backlog/*"
         ]
       }
     ]
   }
   ```

2. CloudWatchログを書き込む権限
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "logs:CreateLogGroup",
           "logs:CreateLogStream",
           "logs:PutLogEvents"
         ],
         "Resource": "arn:aws:logs:*:*:*"
       }
     ]
   }
   ```

## 4. EventBridge (CloudWatch Events) の設定

定期的に実行するためのルールを作成します：

1. EventBridge (CloudWatch Events) サービスを開く
2. 「ルールの作成」をクリック
3. ルール名を入力（例：`daily-backlog-issue-creation`）
4. 「ルールタイプ」で「スケジュール」を選択
5. スケジュール式を入力（例：毎日午前9時に実行）
   ```
   cron(0 9 * * ? *)
   ```
6. ターゲットとして先ほど作成したLambda関数を選択
7. 「ルールの作成」をクリック

## 5. テスト実行

1. Lambda関数のテスト機能を使用して、空のイベントでテスト実行
2. CloudWatchログを確認してエラーがないか確認
3. Backlogにアクセスして課題が作成されたか確認

## 6. カスタマイズ

必要に応じて、以下をカスタマイズしてください：

1. 課題テンプレートの内容
2. 実行スケジュール（日次、週次、月次など）
3. 条件付き課題作成のロジック
4. 課題の他のパラメータ（担当者、優先度、期限など）

## 注意事項

- Backlog APIの呼び出し頻度が多すぎると、API制限に達する可能性があります
- テンプレートの変更は直接Lambda関数のコードを変更するか、Parameter Storeに保存してコード内で参照するようにしてください