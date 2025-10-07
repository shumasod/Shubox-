<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>mixi - ホーム</title>
  <style>
    body {
      background-color: #ece9d8;
      font-family: "MS UI Gothic", sans-serif;
      font-size: 12px;
      color: #000;
      margin: 0;
      padding: 0;
    }
    
    /* ヘッダー */
    .header {
      background: linear-gradient(to bottom, #ff6600, #cc5500);
      color: white;
      padding: 8px 0;
      border-bottom: 2px solid #aa4400;
    }
    
    .header-content {
      max-width: 800px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 10px;
    }
    
    .logo {
      font-size: 20px;
      font-weight: bold;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
    }
    
    .nav-menu {
      display: flex;
      gap: 15px;
    }
    
    .nav-menu a {
      color: white;
      text-decoration: none;
      font-size: 11px;
      padding: 4px 8px;
      border-radius: 2px;
      transition: background-color 0.2s;
    }
    
    .nav-menu a:hover {
      background-color: rgba(255,255,255,0.2);
    }
    
    /* メインコンテナ */
    .container {
      max-width: 800px;
      margin: 0 auto;
      display: flex;
      gap: 10px;
      padding: 10px;
    }
    
    /* サイドバー */
    .sidebar {
      width: 180px;
    }
    
    .widget {
      background: #f0f0f0;
      border: 2px outset #c0c0c0;
      margin-bottom: 10px;
      box-shadow: 1px 1px 3px rgba(0,0,0,0.1);
    }
    
    .widget-header {
      background: linear-gradient(to bottom, #e0e0e0, #d0d0d0);
      padding: 5px 8px;
      font-weight: bold;
      font-size: 11px;
      border-bottom: 1px solid #c0c0c0;
    }
    
    .widget-content {
      padding: 8px;
      font-size: 11px;
    }
    
    /* プロフィールウィジェット */
    .profile-avatar {
      width: 60px;
      height: 60px;
      background: #ddd;
      border: 2px inset #c0c0c0;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #666;
      font-size: 10px;
    }
    
    .profile-name {
      font-weight: bold;
      color: #0066cc;
      margin-bottom: 4px;
    }
    
    .profile-stats {
      font-size: 10px;
      color: #666;
    }
    
    /* 足あとウィジェット */
    .ashiato-entry {
      font-size: 11px;
      border-bottom: 1px dotted #ddd;
      padding: 6px 0;
      line-height: 1.4;
      color: #333;
      transition: background-color 0.2s ease;
    }
    
    .ashiato-entry:hover {
      background-color: #f8f9fa;
    }
    
    /* メインコンテンツ */
    .main-content {
      flex: 1;
    }
    
    /* つぶやき投稿フォーム */
    .post-form {
      background: #f8f8f8;
      border: 2px inset #c0c0c0;
      padding: 10px;
      margin-bottom: 10px;
    }
    
    .post-textarea {
      width: 100%;
      height: 60px;
      border: 1px inset #c0c0c0;
      padding: 4px;
      font-size: 11px;
      font-family: "MS UI Gothic", sans-serif;
      resize: vertical;
      box-sizing: border-box;
    }
    
    .post-buttons {
      margin-top: 8px;
      text-align: right;
    }
    
    .btn {
      padding: 4px 8px;
      font-size: 11px;
      background: #e0e0e0;
      border: 1px outset #c0c0c0;
      cursor: pointer;
      margin-left: 5px;
    }
    
    .btn:hover {
      background: #f8f8f8;
    }
    
    .btn:active {
      border: 1px inset #c0c0c0;
    }
    
    /* タイムライン */
    .timeline-item {
      background: white;
      border: 1px solid #ddd;
      margin-bottom: 10px;
      box-shadow: 1px 1px 3px rgba(0,0,0,0.1);
    }
    
    .timeline-header {
      background: #f0f0f0;
      padding: 6px 10px;
      border-bottom: 1px solid #ddd;
      font-size: 11px;
    }
    
    .timeline-content {
      padding: 10px;
    }
    
    .timeline-author {
      font-weight: bold;
      color: #0066cc;
    }
    
    .timeline-time {
      color: #999;
      font-size: 10px;
      margin-left: 10px;
    }
    
    .timeline-actions {
      padding: 6px 10px;
      background: #f8f8f8;
      border-top: 1px solid #eee;
      font-size: 10px;
    }
    
    .timeline-actions a {
      color: #0066cc;
      text-decoration: none;
      margin-right: 10px;
    }
    
    /* スクロールバー（IE風） */
    ::-webkit-scrollbar {
      width: 16px;
    }
    
    ::-webkit-scrollbar-track {
      background: #f0f0f0;
      border: 1px inset #c0c0c0;
    }
    
    ::-webkit-scrollbar-thumb {
      background: #e0e0e0;
      border: 1px outset #c0c0c0;
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: #d0d0d0;
    }
    
    /* リンクスタイル */
    a {
      color: #0066cc;
      text-decoration: none;
    }
    
    a:hover {
      text-decoration: underline;
    }
    
    .update-time {
      font-size: 9px;
      color: #999;
      text-align: center;
      margin-top: 8px;
      padding-top: 5px;
      border-top: 1px solid #eee;
    }
  </style>
</head>
<body>
  <!-- ヘッダー -->
  <div class="header">
    <div class="header-content">
      <div class="logo">mixi</div>
      <nav class="nav-menu">
        <a href="#" onclick="showPage('home')">ホーム</a>
        <a href="#" onclick="showPage('profile')">プロフィール</a>
        <a href="#" onclick="showPage('diary')">日記</a>
        <a href="#" onclick="showPage('community')">コミュニティ</a>
        <a href="#" onclick="showPage('message')">メッセージ</a>
        <a href="#" onclick="logout()">ログアウト</a>
      </nav>
    </div>
  </div>

  <!-- メインコンテナ -->
  <div class="container">
    <!-- サイドバー -->
    <div class="sidebar">
      <!-- プロフィールウィジェット -->
      <div class="widget">
        <div class="widget-header">あなたのプロフィール</div>
        <div class="widget-content">
          <div class="profile-avatar">写真</div>
          <div class="profile-name">田中太郎</div>
          <div class="profile-stats">
            マイミク: 42人<br>
            日記: 128件<br>
            コミュニティ: 15個
          </div>
        </div>
      </div>

      <!-- 足あとウィジェット -->
      <div class="widget">
        <div class="widget-header">足あと</div>
        <div class="widget-content">
          <div id="ashiato-log">
            <!-- 足あとはJavaScriptで動的に生成 -->
          </div>
          <div style="text-align: center; margin-top: 8px;">
            <a href="#" onclick="refreshAshiato()">更新</a>
          </div>
        </div>
      </div>

      <!-- お知らせウィジェット -->
      <div class="widget">
        <div class="widget-header">お知らせ</div>
        <div class="widget-content">
          <div style="font-size: 10px; color: #666;">
            • システムメンテナンスのお知らせ<br>
            • 新機能「あしあと+」リリース<br>
            • 利用規約の更新について
          </div>
        </div>
      </div>
    </div>

    <!-- メインコンテンツ -->
    <div class="main-content">
      <!-- つぶやき投稿フォーム -->
      <div class="post-form">
        <textarea class="post-textarea" id="postContent" placeholder="今何してる？"></textarea>
        <div class="post-buttons">
          <button class="btn" onclick="clearPost()">クリア</button>
          <button class="btn" onclick="submitPost()">つぶやく</button>
        </div>
      </div>

      <!-- タイムライン -->
      <div id="timeline">
        <div class="timeline-item">
          <div class="timeline-header">
            <span class="timeline-author">佐藤花子</span>
            <span class="timeline-time">15分前</span>
          </div>
          <div class="timeline-content">
            今日は久しぶりに友達とカラオケに行きました♪懐かしい曲ばかり歌って楽しかったです(´∀｀)
          </div>
          <div class="timeline-actions">
            <a href="#" onclick="likePost(1)">いいね!</a>
            <a href="#" onclick="commentPost(1)">コメント</a>
            <a href="#" onclick="sharePost(1)">シェア</a>
          </div>
        </div>

        <div class="timeline-item">
          <div class="timeline-header">
            <span class="timeline-author">山田次郎</span>
            <span class="timeline-time">1時間前</span>
          </div>
          <div class="timeline-content">
            新しいゲーム買いました！FFシリーズは何度やっても飽きないなぁ。今夜は徹夜確定です（笑）
          </div>
          <div class="timeline-actions">
            <a href="#" onclick="likePost(2)">いいね!</a>
            <a href="#" onclick="commentPost(2)">コメント</a>
            <a href="#" onclick="sharePost(2)">シェア</a>
          </div>
        </div>

        <div class="timeline-item">
          <div class="timeline-header">
            <span class="timeline-author">鈴木美香</span>
            <span class="timeline-time">3時間前</span>
          </div>
          <div class="timeline-content">
            今日のお弁当♪ 卵焼きがうまく焼けました〜！明日は何作ろうかな？
          </div>
          <div class="timeline-actions">
            <a href="#" onclick="likePost(3)">いいね!</a>
            <a href="#" onclick="commentPost(3)">コメント</a>
            <a href="#" onclick="sharePost(3)">シェア</a>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    // 擬似「足あと」データ
    const visitors = [
      "佐藤花子",
      "山田次郎", 
      "鈴木美香",
      "高橋健一",
      "田村雅子",
      "中村和也",
      "森田智子",
      "小林浩二",
      "松本由美",
      "岡田大輔"
    ];

    function getRandomVisitors(count = 3) {
      // 重複を避けるために配列をシャッフルして選択
      const shuffled = [...visitors].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, Math.min(count, visitors.length));
    }

    function formatTimeAgo(minutes) {
      if (minutes < 60) {
        return `${minutes}分前`;
      } else if (minutes < 1440) { // 24時間未満
        const hours = Math.floor(minutes / 60);
        return `${hours}時間前`;
      } else {
        const days = Math.floor(minutes / 1440);
        return `${days}日前`;
      }
    }

    function generateAshiato() {
      const container = document.getElementById("ashiato-log");
      if (!container) {
        console.warn("ashiato-log要素が見つかりません");
        return;
      }

      // コンテナをクリア
      container.innerHTML = "";
      
      try {
        const selectedVisitors = getRandomVisitors(3);
        
        selectedVisitors.forEach((name, index) => {
          // より現実的な時間の分布
          const minutesAgo = Math.floor(Math.random() * 180) + 1; // 1-180分前
          
          const entry = document.createElement("div");
          entry.className = "ashiato-entry";
          
          entry.innerHTML = `
            <strong style="color: #0066cc;">${name}</strong>さんがあなたのページを訪問しました 
            <span style="color: #999; font-size: 10px;">${formatTimeAgo(minutesAgo)}</span>
          `;
          
          container.appendChild(entry);
        });
        
        // 更新時刻を表示
        const updateTime = document.createElement("div");
        updateTime.className = "update-time";
        updateTime.textContent = `最終更新: ${new Date().toLocaleTimeString('ja-JP')}`;
        container.appendChild(updateTime);
        
      } catch (error) {
        console.error("足あと生成中にエラーが発生しました:", error);
        container.innerHTML = '<div style="color: #999; font-size: 10px;">データの読み込みに失敗しました</div>';
      }
    }

    // 定期的に更新する機能
    function startAshiatoUpdater(intervalMinutes = 5) {
      generateAshiato(); // 初回実行
      
      // 指定した間隔で更新
      setInterval(() => {
        generateAshiato();
      }, intervalMinutes * 60 * 1000);
    }

    // つぶやき機能
    function submitPost() {
      const content = document.getElementById('postContent').value.trim();
      if (content === '') {
        alert('つぶやき内容を入力してください');
        return;
      }

      // 新しいつぶやきをタイムラインに追加
      const timeline = document.getElementById('timeline');
      const newPost = document.createElement('div');
      newPost.className = 'timeline-item';
      newPost.innerHTML = `
        <div class="timeline-header">
          <span class="timeline-author">田中太郎</span>
          <span class="timeline-time">たった今</span>
        </div>
        <div class="timeline-content">
          ${content}
        </div>
        <div class="timeline-actions">
          <a href="#" onclick="likePost('new')">いいね!</a>
          <a href="#" onclick="commentPost('new')">コメント</a>
          <a href="#" onclick="sharePost('new')">シェア</a>
        </div>
      `;
      
      timeline.insertBefore(newPost, timeline.firstChild);
      
      // フォームをクリア
      document.getElementById('postContent').value = '';
      
      // アニメーション効果
      newPost.style.backgroundColor = '#fff3cd';
      setTimeout(() => {
        newPost.style.backgroundColor = 'white';
        newPost.style.transition = 'background-color 0.5s ease';
      }, 100);
    }

    function clearPost() {
      document.getElementById('postContent').value = '';
    }

    // インタラクション機能
    function likePost(id) {
      alert('いいね！しました♪');
    }

    function commentPost(id) {
      const comment = prompt('コメントを入力してください:');
      if (comment && comment.trim() !== '') {
        alert('コメントを投稿しました');
      }
    }

    function sharePost(id) {
      alert('この投稿をシェアしました');
    }

    // ナビゲーション機能
    function showPage(page) {
      alert(`${page}ページに移動します（デモ版のため実装されていません）`);
    }

    function logout() {
      if (confirm('ログアウトしますか？')) {
        alert('ログアウトしました');
        // 実際のアプリではログイン画面にリダイレクト
      }
    }

    // ページ読み込み時に開始
    window.addEventListener('load', () => {
      startAshiatoUpdater(5); // 5分間隔で更新
    });

    // 手動更新用の関数をグローバルに公開
    window.refreshAshiato = generateAshiato;

    // Enterキーでつぶやき投稿
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        submitPost();
      }
    });
  </script>
</body>
</html>
