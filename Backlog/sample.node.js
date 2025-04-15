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