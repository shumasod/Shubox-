<!DOCTYPE html>

<html>
<head>
    <meta charset="UTF-8">
    <title>mixi - みんなでつながるソーシャルネットワーク</title>
    <style>
        body {
            font-family: "MS UI Gothic", Arial, sans-serif;
            font-size: 12px;
            background: #ece9d8;
            margin: 0;
            padding: 0;
            color: #000;
        }

```
    .window {
        background: #f0f0f0;
        border: 2px outset #c0c0c0;
        margin: 10px auto;
        width: 780px;
        box-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
    
    .title-bar {
        background: linear-gradient(to bottom, #0054e3, #0041c7);
        color: white;
        height: 20px;
        padding: 3px 5px;
        font-size: 11px;
        font-weight: bold;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .title-text {
        display: flex;
        align-items: center;
    }
    
    .window-controls {
        display: flex;
        gap: 2px;
    }
    
    .control-btn {
        width: 16px;
        height: 14px;
        background: #c0c0c0;
        border: 1px outset #c0c0c0;
        font-size: 8px;
        text-align: center;
        line-height: 12px;
        cursor: pointer;
    }
    
    .menu-bar {
        background: #f0f0f0;
        border-bottom: 1px solid #808080;
        padding: 2px 5px;
        font-size: 11px;
    }
    
    .menu-item {
        display: inline-block;
        padding: 3px 8px;
        margin-right: 5px;
        cursor: pointer;
    }
    
    .menu-item:hover {
        background: #e0e0e0;
        border: 1px inset #c0c0c0;
    }
    
    .toolbar {
        background: #f0f0f0;
        border-bottom: 1px solid #808080;
        padding: 3px 5px;
        display: flex;
        align-items: center;
        gap: 5px;
    }
    
    .toolbar-btn {
        background: #e0e0e0;
        border: 1px outset #c0c0c0;
        padding: 2px 6px;
        font-size: 11px;
        cursor: pointer;
    }
    
    .toolbar-btn:hover {
        border: 1px inset #c0c0c0;
    }
    
    .content-area {
        background: white;
        padding: 10px;
        min-height: 500px;
    }
    
    .header {
        background: linear-gradient(to bottom, #ff6600, #ff8c00);
        color: white;
        padding: 15px;
        text-align: center;
        margin-bottom: 15px;
        border: 1px solid #cc5500;
    }
    
    .header h1 {
        margin: 0;
        font-size: 24px;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
    }
    
    .header p {
        margin: 5px 0 0 0;
        font-size: 12px;
    }
    
    .main-container {
        display: table;
        width: 100%;
    }
    
    .sidebar {
        display: table-cell;
        width: 180px;
        vertical-align: top;
        padding-right: 15px;
    }
    
    .main-content {
        display: table-cell;
        vertical-align: top;
    }
    
    .panel {
        background: #f8f8f8;
        border: 1px inset #c0c0c0;
        margin-bottom: 10px;
        padding: 8px;
    }
    
    .panel-title {
        background: linear-gradient(to bottom, #ddd, #bbb);
        margin: -8px -8px 8px -8px;
        padding: 5px 8px;
        font-weight: bold;
        font-size: 11px;
        border-bottom: 1px solid #999;
    }
    
    .user-info {
        text-align: center;
    }
    
    .avatar {
        width: 80px;
        height: 80px;
        background: linear-gradient(45deg, #ffb3ba, #bae1ff);
        border: 2px inset #c0c0c0;
        margin: 0 auto 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 30px;
    }
    
    .status-bar {
        background: #f0f0f0;
        border-top: 1px solid #808080;
        padding: 2px 5px;
        font-size: 10px;
        color: #666;
    }
    
    .nav-menu {
        list-style: none;
        padding: 0;
        margin: 0;
    }
    
    .nav-menu li {
        border-bottom: 1px solid #ddd;
        padding: 5px;
        cursor: pointer;
    }
    
    .nav-menu li:hover {
        background: #e8f4fd;
    }
    
    .nav-menu a {
        color: #0066cc;
        text-decoration: none;
        font-size: 11px;
    }
    
    .friend-list {
        max-height: 150px;
        overflow-y: auto;
        border: 1px inset #c0c0c0;
        background: white;
    }
    
    .friend-item {
        padding: 3px 5px;
        border-bottom: 1px solid #eee;
        font-size: 10px;
    }
    
    .friend-item:hover {
        background: #f0f8ff;
    }
    
    .diary-entry {
        background: white;
        border: 1px inset #c0c0c0;
        padding: 10px;
        margin-bottom: 10px;
    }
    
    .diary-header {
        background: #f0f8ff;
        margin: -10px -10px 10px -10px;
        padding: 5px 10px;
        border-bottom: 1px solid #ddd;
        font-size: 11px;
    }
    
    .diary-title {
        font-weight: bold;
        color: #0066cc;
        margin-bottom: 3px;
    }
    
    .diary-meta {
        color: #666;
        font-size: 10px;
    }
    
    .comment-box {
        background: #f8f8f8;
        border: 1px inset #c0c0c0;
        padding: 8px;
        margin-top: 10px;
    }
    
    .comment-form {
        margin-top: 10px;
    }
    
    .comment-form textarea {
        width: 300px;
        height: 60px;
        font-family: "MS UI Gothic", Arial, sans-serif;
        font-size: 11px;
        border: 1px inset #c0c0c0;
    }
    
    .btn {
        background: #e0e0e0;
        border: 1px outset #c0c0c0;
        padding: 3px 8px;
        font-size: 11px;
        font-family: "MS UI Gothic", Arial, sans-serif;
        cursor: pointer;
    }
    
    .btn:hover {
        background: #f0f0f0;
    }
    
    .btn:active {
        border: 1px inset #c0c0c0;
    }
    
    .activity-feed {
        background: white;
        border: 1px inset #c0c0c0;
        padding: 8px;
        margin-bottom: 10px;
    }
    
    .activity-item {
        padding: 5px 0;
        border-bottom: 1px dotted #ccc;
        font-size: 11px;
    }
    
    .activity-item:last-child {
        border-bottom: none;
    }
    
    .activity-time {
        color: #666;
        font-size: 10px;
    }
    
    .mixi-icon {
        width: 16px;
        height: 16px;
        background: #ff6600;
        display: inline-block;
        margin-right: 5px;
        border-radius: 2px;
    }
    
    /* 足あと機能のスタイル */
    .ashiato-entry {
        transition: background-color 0.2s ease;
    }
    
    .ashiato-entry:hover {
        background-color: #f8f9fa !important;
    }
    
    .update-time {
        font-size: 9px;
        color: #999;
        text-align: center;
        margin-top: 8px;
        padding-top: 5px;
        border-top: 1px solid #eee;
    }
    
    .refresh-btn {
        background: #e0e0e0;
        border: 1px outset #c0c0c0;
        padding: 2px 6px;
        font-size: 10px;
        cursor: pointer;
        margin-top: 5px;
    }
    
    .refresh-btn:hover {
        background: #f0f0f0;
    }
</style>
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
        "岡田大輔",
        "伊藤真人",
        "渡辺恵子"
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
            const selectedVisitors = getRandomVisitors(4);
            
            selectedVisitors.forEach((name, index) => {
                // より現実的な時間の分布
                const minutesAgo = Math.floor(Math.random() * 180) + 1; // 1-180分前
                
                const entry = document.createElement("div");
                entry.className = "ashiato-entry";
                entry.style.cssText = `
                    font-size: 11px;
                    border-bottom: 1px dotted #ddd;
                    padding: 6px 0;
                    line-height: 1.4;
                    color: #333;
                    transition: background-color 0.2s ease;
                `;
                
                entry.innerHTML = `
                    <strong style="color: #0066cc;">${name}</strong>さんがあなたのページを訪問しました 
                    <span style="color: #999; font-size: 10px;">${formatTimeAgo(minutesAgo)}</span>
                `;
                
                // ホバー効果
                entry.addEventListener('mouseenter', () => {
                    entry.style.backgroundColor = '#f8f9fa';
                });
                
                entry.addEventListener('mouseleave', () => {
                    entry.style.backgroundColor = 'transparent';
                });
                
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

    function showNotification(message) {
        alert(message);
    }
    
    function updateActivity() {
        const activities = document.querySelectorAll('.activity-item .activity-time');
        activities.forEach(timeElement => {
            const minutes = Math.floor(Math.random() * 120) + 1;
            timeElement.textContent = formatTimeAgo(minutes);
        });
    }
    
    // 手動更新用の関数をグローバルに公開
    window.refreshAshiato = generateAshiato;
    
    window.onload = function() {
        updateActivity();
        startAshiatoUpdater(3); // 3分間隔で更新
    };
</script>
```

</head>
<body>
    <div class="window">
        <div class="title-bar">
            <div class="title-text">
                <span class="mixi-icon"></span>
                mixi - みんなでつながるソーシャルネットワーク - Internet Explorer
            </div>
            <div class="window-controls">
                <div class="control-btn">_</div>
                <div class="control-btn">□</div>
                <div class="control-btn">×</div>
            </div>
        </div>

```
    <div class="menu-bar">
        <span class="menu-item">ファイル(F)</span>
        <span class="menu-item">編集(E)</span>
        <span class="menu-item">表示(V)</span>
        <span class="menu-item">お気に入り(A)</span>
        <span class="menu-item">ツール(T)</span>
        <span class="menu-item">ヘルプ(H)</span>
    </div>
    
    <div class="toolbar">
        <button class="toolbar-btn">戻る</button>
        <button class="toolbar-btn">進む</button>
        <button class="toolbar-btn">停止</button>
        <button class="toolbar-btn">更新</button>
        <button class="toolbar-btn">ホーム</button>
        <input type="text" value="http://mixi.jp/" style="flex: 1; margin: 0 5px; padding: 2px; border: 1px inset #c0c0c0;">
        <button class="toolbar-btn">移動</button>
    </div>
    
    <div class="content-area">
        <div class="header">
            <h1>mixi</h1>
            <p>みんなでつながるソーシャルネットワーク</p>
        </div>
        
        <div class="main-container">
            <div class="sidebar">
                <div class="panel">
                    <div class="panel-title">プロフィール</div>
                    <div class="user-info">
                        <div class="avatar">😊</div>
                        <strong>田中太郎</strong><br>
                        <small>24歳 / 東京都</small>
                    </div>
                </div>
                
                <div class="panel">
                    <div class="panel-title">メニュー</div>
                    <ul class="nav-menu">
                        <li><a href="#">ホーム</a></li>
                        <li><a href="#">プロフィール編集</a></li>
                        <li><a href="#">日記を書く</a></li>
                        <li><a href="#">マイフォト</a></li>
                        <li><a href="#">友人一覧</a></li>
                        <li><a href="#">コミュニティ</a></li>
                        <li><a href="#">メッセージ</a></li>
                        <li><a href="#">設定</a></li>
                    </ul>
                </div>
                
                <div class="panel">
                    <div class="panel-title">足あと</div>
                    <div id="ashiato-log">
                        <!-- 足あとデータはJavaScriptで動的生成 -->
                    </div>
                    <button class="refresh-btn" onclick="refreshAshiato()">更新</button>
                </div>
                
                <div class="panel">
                    <div class="panel-title">友人（12人）</div>
                    <div class="friend-list">
                        <div class="friend-item">佐藤花子さん</div>
                        <div class="friend-item">山田次郎さん</div>
                        <div class="friend-item">鈴木美香さん</div>
                        <div class="friend-item">高橋健一さん</div>
                        <div class="friend-item">田村雅子さん</div>
                        <div class="friend-item">中村和也さん</div>
                    </div>
                </div>
                
                <div class="panel">
                    <div class="panel-title">お知らせ</div>
                    <div style="font-size: 10px; line-height: 1.4;">
                        ・新機能「足あと」を追加<br>
                        ・コミュニティ機能改善<br>
                        ・写真アップロード対応
                    </div>
                </div>
            </div>
            
            <div class="main-content">
                <div class="panel">
                    <div class="panel-title">友人の最新日記</div>
                    
                    <div class="diary-entry">
                        <div class="diary-header">
                            <div class="diary-title">今日のランチは美味しかった♪</div>
                            <div class="diary-meta">佐藤花子さん | 2004年3月15日 14:30</div>
                        </div>
                        <div>
                            今日は会社の同僚と新しくできたイタリアンレストランに行ってきました。<br>
                            パスタがとても美味しくて、また行きたいです！<br>
                            今度は友達も誘ってみようかな(^o^)
                        </div>
                        <div class="comment-box">
                            <strong>コメント (3件)</strong><br>
                            <div style="margin: 5px 0; padding-left: 10px; font-size: 11px;">
                                <strong>山田次郎:</strong> 美味しそう！今度一緒に行きましょう♪<br>
                                <strong>鈴木美香:</strong> そのお店、気になってました！<br>
                                <strong>田中太郎:</strong> 写真も見せてください〜
                            </div>
                            <div class="comment-form">
                                <textarea placeholder="コメントを書く..."></textarea><br>
                                <button class="btn" onclick="showNotification('コメントを投稿しました')">投稿</button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="diary-entry">
                        <div class="diary-header">
                            <div class="diary-title">桜が咲き始めました</div>
                            <div class="diary-meta">山田次郎さん | 2004年3月14日 20:15</div>
                        </div>
                        <div>
                            会社の近くの公園で桜が咲き始めているのを発見！<br>
                            まだ3分咲きくらいですが、春の訪れを感じます。<br>
                            来週あたりお花見の計画を立てようかな〜
                        </div>
                        <div class="comment-box">
                            <strong>コメント (1件)</strong><br>
                            <div style="margin: 5px 0; padding-left: 10px; font-size: 11px;">
                                <strong>佐藤花子:</strong> お花見いいですね！声かけてください♪
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="panel">
                    <div class="panel-title">最近の活動</div>
                    <div class="activity-feed">
                        <div class="activity-item">
                            <strong>鈴木美香さん</strong>がプロフィールを更新しました
                            <div class="activity-time">15分前</div>
                        </div>
                        <div class="activity-item">
                            <strong>高橋健一さん</strong>が日記「週末の映画鑑賞」を投稿しました
                            <div class="activity-time">32分前</div>
                        </div>
                        <div class="activity-item">
                            <strong>田村雅子さん</strong>があなたの日記にコメントしました
                            <div class="activity-time">1時間前</div>
                        </div>
                        <div class="activity-item">
                            <strong>中村和也さん</strong>があなたのページを訪問しました
                            <div class="activity-time">2時間前</div>
                        </div>
                    </div>
                </div>
                
                <div class="panel">
                    <div class="panel-title">参加コミュニティ</div>
                    <div style="font-size: 11px; line-height: 1.5;">
                        • 東京グルメ情報（1,234人）<br>
                        • 映画好き集まれ！（892人）<br>
                        • 写真撮影が趣味（567人）<br>
                        • ○○大学卒業生（234人）<br>
                        <a href="#" style="color: #0066cc;">もっと見る...</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <div class="status-bar">
        インターネット | 保護モード: 有効 | 100%
    </div>
</div>
```

</body>
</html>