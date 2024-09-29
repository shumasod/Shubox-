const axios = require('axios');
const AWS = require('aws-sdk');

// Initialize AWS Systems Manager Parameter Store
const ssm = new AWS.SSM();

// Backlog API settings
const BACKLOG_SPACE = process.env.BACKLOG_SPACE;
const BACKLOG_BASE_URL = `https://${BACKLOG_SPACE}.backlog.com/api/v2`;

// Function to get API key from Parameter Store
async function getApiKey() {
  const params = {
    Name: '/backlog/api-key',
    WithDecryption: true
  };
  const response = await ssm.getParameter(params).promise();
  return response.Parameter.Value;
}

// Function to create a new issue in Backlog
async function createBacklogIssue(projectId, summary, description) {
  const apiKey = await getApiKey();
  
  const url = `${BACKLOG_BASE_URL}/issues?apiKey=${apiKey}`;
  const data = {
    projectId: projectId,
    summary: summary,
    description: description,
    issueTypeId: 1  // Assuming 1 is a valid issue type ID
  };

  try {
    const response = await axios.post(url, data);
    return response.data;
  } catch (error) {
    console.error('Error creating Backlog issue:', error);
    throw error;
  }
}

// Lambda function handler
exports.handler = async (event, context) => {
  try {
    // Extract information from the event, assuming it's coming from API Gateway
    const { projectId, summary, description } = JSON.parse(event.body);

    // Create a new issue in Backlog
    const newIssue = await createBacklogIssue(projectId, summary, description);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Issue created successfully',
        issueId: newIssue.id
      })
    };
  } catch (error) {
    console.error('Lambda function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error creating issue',
        error: error.message
      })
    };
  }
};
