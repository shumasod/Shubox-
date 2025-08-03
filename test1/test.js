const { TwitterApi } = require('twitter-api-v2');
const Parser = require('rss-parser');
const fs = require('fs');
const axios = require('axios');
require('dotenv').config();

// 設定
const config = {
  noteUsername: process.env.NOTE_USERNAME || 'your_note_username',
  get noteRssUrl() { return `https://note.com/${this.noteUsername}/rss`; },
  
  // Twitter API設定
  twitter: {
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_SECRET
  },
  
  // Discord Webhook URL
  discordWebhook: process.env.DISCORD_WEBHOOK_URL,
  
  // チェック間隔（ミリ秒）
  checkInterval: (process.env.CHECK_INTERVAL || 5) * 60 * 1000,
  
  // 投稿済み記事のIDを保存するファイル
  postedFile: 'posted.json'
};

const parser = new Parser();

// Twitter API初期化（キーがある場合のみ）
let rwClient;
if (config.twitter.accessToken) {
  const twitterClient = new TwitterApi(config.twitter);
  rwClient = twitterClient.readWrite;
}

const loadPostedIds = () => {
  if (fs.existsSync(config.postedFile)) {
    return JSON.parse(fs.readFileSync(config.postedFile, 'utf8'));
  }
  return [];
};

const savePostedIds = (ids) => {
  fs.writeFileSync(config.postedFile, JSON.stringify(ids));
};

const checkNewPosts = async () => {
  const feed = await parser.parseURL(config.noteRssUrl);
  const postedIds = loadPostedIds();
  
  for (const item of feed.items) {
    const postId = item.guid || item.link;
    
    if (!postedIds.includes(postId)) {
      await postToSocialMedia(item);
      postedIds.push(postId);
      console.log(`✅ 投稿完了: ${item.title}`);
    }
  }
  
  savePostedIds(postedIds);
};

const postToSocialMedia = async (article) => {
  const text = `📝 新しい記事を投稿しました！\n\n${article.title}\n${article.link}`;
  
  // Twitter投稿
  if (rwClient) {
    await rwClient.v2.tweet(text);
    console.log('🐦 Twitter投稿完了');
  }
  
  // Discord投稿
  if (config.discordWebhook) {
    await axios.post(config.discordWebhook, {
      embeds: [{
        title: article.title,
        url: article.link,
        description: article.contentSnippet || '',
        color: 0x41b883,
        footer: { text: 'note auto-post' },
        timestamp: new Date().toISOString()
      }]
    });
    console.log('💬 Discord投稿完了');
  }
};

const main = async () => {
  console.log('🚀 note自動投稿システム開始');
  console.log(`📖 対象: ${config.noteRssUrl}`);
  console.log(`⏰ チェック間隔: ${config.checkInterval / 60000}分`);
  
  await checkNewPosts();
  setInterval(checkNewPosts, config.checkInterval);
};

main().catch(console.error);

/*
==========================================
📋 セットアップ手順

1. npm install
2. .envファイルを作成して以下を設定:

NOTE_USERNAME=your_note_username
CHECK_INTERVAL=5
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret  
TWITTER_ACCESS_TOKEN=your_twitter_access_token
TWITTER_ACCESS_SECRET=your_twitter_access_secret
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_URL

3. node index.js で実行

⚠️ Twitter APIは現在有料プランが必要です
💡 Discord WebhookはDiscordサーバー設定から無料で取得可能
==========================================
*/
