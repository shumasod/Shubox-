<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>住民税情報集約RSSサイト - 2025年度最新情報</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Hiragino Sans', 'Yu Gothic UI', 'Meiryo UI', sans-serif;
            line-height: 1.7;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            text-align: center;
        }

        .header h1 {
            color: #2c3e50;
            font-size: 2.5rem;
            margin-bottom: 10px;
            background: linear-gradient(45deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .header p {
            color: #666;
            font-size: 1.1rem;
        }

        .search-section {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 25px;
            margin-bottom: 30px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .search-box {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
        }

        .search-input {
            flex: 1;
            padding: 12px 16px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.3s;
        }

        .search-input:focus {
            outline: none;
            border-color: #667eea;
        }

        .search-btn {
            padding: 12px 24px;
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            transition: transform 0.2s;
        }

        .search-btn:hover {
            transform: translateY(-2px);
        }

        .prefecture-select {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 16px;
            background: white;
        }

        .main-content {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 30px;
            align-items: start;
        }

        .news-section {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .news-item {
            border-bottom: 1px solid #eee;
            padding: 20px 0;
            transition: transform 0.2s;
        }

        .news-item:hover {
            transform: translateX(5px);
        }

        .news-item:last-child {
            border-bottom: none;
        }

        .news-tag {
            display: inline-block;
            padding: 4px 12px;
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            border-radius: 15px;
            font-size: 0.8rem;
            margin-bottom: 8px;
        }

        .news-title {
            font-size: 1.2rem;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 8px;
            line-height: 1.5;
        }

        .news-date {
            color: #666;
            font-size: 0.9rem;
            margin-bottom: 8px;
        }

        .news-summary {
            color: #555;
            line-height: 1.6;
        }

        .sidebar {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        .widget {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 20px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .widget h3 {
            color: #2c3e50;
            margin-bottom: 15px;
            font-size: 1.3rem;
        }

        .important-news {
            list-style: none;
        }

        .important-news li {
            padding: 10px 0;
            border-bottom: 1px solid #f0f0f0;
        }

        .important-news li:last-child {
            border-bottom: none;
        }

        .important-news a {
            color: #667eea;
            text-decoration: none;
            font-size: 0.95rem;
            transition: color 0.3s;
        }

        .important-news a:hover {
            color: #764ba2;
            text-decoration: underline;
        }

        .calendar {
            text-align: center;
        }

        .calendar-date {
            font-size: 2rem;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 10px;
        }

        .rss-links {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .rss-link {
            display: flex;
            align-items: center;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 8px;
            text-decoration: none;
            color: #333;
            transition: background-color 0.3s;
        }

        .rss-link:hover {
            background: #e9ecef;
        }

        .rss-icon {
            width: 20px;
            height: 20px;
            margin-right: 10px;
            fill: #ff6b35;
        }

        .footer {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 20px;
            margin-top: 30px;
            text-align: center;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        @media (max-width: 768px) {
            .main-content {
                grid-template-columns: 1fr;
            }
            
            .header h1 {
                font-size: 2rem;
            }
            
            .search-box {
                flex-direction: column;
            }
        }

        .loading {
            text-align: center;
            padding: 40px;
            color: #666;
        }

        .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #667eea;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1>🏛️ 住民税情報集約サイト</h1>
            <p>2025年4月以降の最新住民税情報をRSSで一括管理</p>
        </header>

        <section class="search-section">
            <div class="search-box">
                <input type="text" class="search-input" id="searchInput" placeholder="キーワードを入力（例：税制改正、103万円の壁、定額減税）">
                <button class="search-btn" onclick="searchNews()">🔍 検索</button>
            </div>
            <select class="prefecture-select" id="prefectureSelect" onchange="filterByPrefecture()">
                <option value="">都道府県を選択</option>
                <option value="東京都">東京都</option>
                <option value="神奈川県">神奈川県</option>
                <option value="大阪府">大阪府</option>
                <option value="愛知県">愛知県</option>
                <option value="埼玉県">埼玉県</option>
                <option value="千葉県">千葉県</option>
                <option value="兵庫県">兵庫県</option>
                <option value="北海道">北海道</option>
                <option value="福岡県">福岡県</option>
                <option value="京都府">京都府</option>
            </select>
        </section>

        <main class="main-content">
            <section class="news-section">
                <h2>📰 最新住民税ニュース</h2>
                <div id="newsContainer">
                    <div class="loading">
                        <div class="spinner"></div>
                        最新情報を取得中...
                    </div>
                </div>
            </section>

            <aside class="sidebar">
                <div class="widget">
                    <h3>📅 今日の日付</h3>
                    <div class="calendar">
                        <div class="calendar-date" id="currentDate"></div>
                        <p>令和7年度住民税徴収期間中</p>
                    </div>
                </div>

                <div class="widget">
                    <h3>🚨 重要なお知らせ</h3>
                    <ul class="important-news">
                        <li><a href="#" onclick="showAlert('2025年度税制改正')">2025年度税制改正：103万円の壁が123万円に</a></li>
                        <li><a href="#" onclick="showAlert('定額減税終了')">定額減税終了による住民税増額について</a></li>
                        <li><a href="#" onclick="showAlert('特定親族特別控除')">特定親族特別控除の新設</a></li>
                        <li><a href="#" onclick="showAlert('住民税非課税限度額')">住民税非課税限度額の変更</a></li>
                    </ul>
                </div>

                <div class="widget">
                    <h3>📡 RSS配信</h3>
                    <div class="rss-links">
                        <a href="#" class="rss-link" onclick="showRSSInfo('国税庁')">
                            <svg class="rss-icon" viewBox="0 0 24 24">
                                <path d="M6.503 20.752c0 1.794-1.456 3.248-3.251 3.248S0 22.546 0 20.752s1.456-3.248 3.252-3.248 3.251 1.454 3.251 3.248zM1.677 6.482v4.896c6.685 0 12.106 5.421 12.106 12.106h4.896c0-9.357-7.645-17.002-17.002-17.002zM1.677.069v4.896c9.568 0 17.318 7.75 17.318 17.318H24C24 9.945 14.055 0 1.677 0z"/>
                            </svg>
                            国税庁RSS
                        </a>
                        <a href="#" class="rss-link" onclick="showRSSInfo('総務省')">
                            <svg class="rss-icon" viewBox="0 0 24 24">
                                <path d="M6.503 20.752c0 1.794-1.456 3.248-3.251 3.248S0 22.546 0 20.752s1.456-3.248 3.252-3.248 3.251 1.454 3.251 3.248zM1.677 6.482v4.896c6.685 0 12.106 5.421 12.106 12.106h4.896c0-9.357-7.645-17.002-17.002-17.002zM1.677.069v4.896c9.568 0 17.318 7.75 17.318 17.318H24C24 9.945 14.055 0 1.677 0z"/>
                            </svg>
                            総務省RSS
                        </a>
                        <a href="#" class="rss-link" onclick="showRSSInfo('地方自治体')">
                            <svg class="rss-icon" viewBox="0 0 24 24">
                                <path d="M6.503 20.752c0 1.794-1.456 3.248-3.251 3.248S0 22.546 0 20.752s1.456-3.248 3.252-3.248 3.251 1.454 3.251 3.248zM1.677 6.482v4.896c6.685 0 12.106 5.421 12.106 12.106h4.896c0-9.357-7.645-17.002-17.002-17.002zM1.677.069v4.896c9.568 0 17.318 7.75 17.318 17.318H24C24 9.945 14.055 0 1.677 0z"/>
                            </svg>
                            地方自治体RSS
                        </a>
                    </div>
                </div>
            </aside>
        </main>

        <footer class="footer">
            <p>&copy; 2025 住民税情報集約サイト - 正確な税務情報の提供を心がけています</p>
        </footer>
    </div>

    <script>
        // 現在日付の表示
        function updateCurrentDate() {
            const now = new Date();
            const options = { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                weekday: 'long'
            };
            document.getElementById('currentDate').textContent = 
                now.toLocaleDateString('ja-JP', options);
        }

        // サンプルニュースデータ（2025年4月以降の住民税関連情報）
        const newsData = [
            {
                tag: "税制改正",
                title: "2025年度税制改正：103万円の壁が123万円に引き上げ",
                date: "2025年4月1日",
                summary: "所得税の基礎控除額と給与所得控除額が引き上げられ、パート・アルバイトの課税最低限が大幅に緩和されました。住民税については2026年度から適用予定です。",
                prefecture: "全国"
            },
            {
                tag: "住民税",
                title: "定額減税終了により2025年6月から住民税が増額",
                date: "2025年6月1日",
                summary: "2024年度に実施されていた1人当たり1万円の定額減税が終了し、通常の税額に戻ります。昨年と比較して住民税が高く感じる理由はこの影響です。",
                prefecture: "全国"
            },
            {
                tag: "新制度",
                title: "特定親族特別控除の新設について",
                date: "2025年4月15日",
                summary: "19〜22歳の子どもがいる世帯向けの新しい控除制度が創設されました。子どもの年収が188万円以下の場合、親が最高63万円の控除を受けられます。",
                prefecture: "全国"
            },
            {
                tag: "東京都",
                title: "東京都：住民税非課税限度額を110万円に引き上げ",
                date: "2025年4月10日",
                summary: "東京都は住民税非課税の年収上限を従来の100万円から110万円に引き上げることを発表しました。給与所得控除の改正に伴う措置です。",
                prefecture: "東京都"
            },
            {
                tag: "大阪府",
                title: "大阪府：子育て支援税制の拡充を検討",
                date: "2025年5月20日",
                summary: "大阪府では、国の税制改正を受けて、独自の子育て支援税制の拡充を検討していることが明らかになりました。詳細は今後発表予定です。",
                prefecture: "大阪府"
            },
            {
                tag: "神奈川県",
                title: "横浜市：定額減税不足額給付金の申請受付開始",
                date: "2025年4月25日",
                summary: "横浜市では、2024年度の定額減税で控除しきれなかった不足額について、給付金の申請受付を開始しました。対象者には通知書を送付予定です。",
                prefecture: "神奈川県"
            }
        ];

        let currentNewsData = [...newsData];

        // ニュース表示
        function displayNews(data = currentNewsData) {
            const container = document.getElementById('newsContainer');
            
            if (data.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">該当するニュースが見つかりませんでした。</p>';
                return;
            }

            container.innerHTML = data.map(item => `
                <article class="news-item">
                    <div class="news-tag">${item.tag}</div>
                    <h3 class="news-title">${item.title}</h3>
                    <div class="news-date">📅 ${item.date} | 📍 ${item.prefecture}</div>
                    <p class="news-summary">${item.summary}</p>
                </article>
            `).join('');
        }

        // 検索機能
        function searchNews() {
            const keyword = document.getElementById('searchInput').value.toLowerCase();
            if (!keyword) {
                currentNewsData = [...newsData];
            } else {
                currentNewsData = newsData.filter(item => 
                    item.title.toLowerCase().includes(keyword) ||
                    item.summary.toLowerCase().includes(keyword) ||
                    item.tag.toLowerCase().includes(keyword)
                );
            }
            displayNews(currentNewsData);
        }

        // 都道府県フィルター
        function filterByPrefecture() {
            const prefecture = document.getElementById('prefectureSelect').value;
            if (!prefecture) {
                currentNewsData = [...newsData];
            } else {
                currentNewsData = newsData.filter(item => 
                    item.prefecture === prefecture || item.prefecture === "全国"
                );
            }
            displayNews(currentNewsData);
        }

        // RSS情報表示
        function showRSSInfo(source) {
            const rssUrls = {
                '国税庁': 'https://www.nta.go.jp/rss/index.xml',
                '総務省': 'https://www.soumu.go.jp/rss/index.xml',
                '地方自治体': 'お住まいの自治体のホームページでRSS配信をご確認ください'
            };
            
            alert(`${source}のRSS配信について：\n\n${rssUrls[source] || 'RSS情報が見つかりません'}\n\n※実際のRSS URLは各機関のホームページでご確認ください。`);
        }

        // アラート表示
        function showAlert(topic) {
            const alerts = {
                '2025年度税制改正': '2025年度税制改正により、所得税の基礎控除額が48万円から63万円に、給与所得控除の最低保障額が55万円から65万円に引き上げられました。これにより、いわゆる「103万円の壁」が「123万円の壁」に変更されます。',
                '定額減税終了': '2024年度に実施されていた定額減税（1人当たり住民税1万円、所得税3万円）が終了しました。そのため、2025年6月からの住民税は前年より高く感じられる場合があります。',
                '特定親族特別控除': '19〜22歳の子どもがいる世帯向けの新しい控除制度です。子どもの年収が123万円超188万円以下の場合、親が所得税で最高63万円、住民税で最高45万円の控除を受けられます。',
                '住民税非課税限度額': '給与所得控除の改正に伴い、住民税非課税の年収上限が100万円から110万円に引き上げられます。詳細はお住まいの自治体にご確認ください。'
            };
            
            alert(alerts[topic] || '詳細情報が見つかりません。');
        }

        // Enter キーでの検索
        document.getElementById('searchInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchNews();
            }
        });

        // 初期化
        document.addEventListener('DOMContentLoaded', function() {
            updateCurrentDate();
            // 少し遅延してからニュースを表示（ローディング効果）
            setTimeout(() => {
                displayNews();
            }, 1000);
        });

        // 日付を毎分更新
        setInterval(updateCurrentDate, 60000);
    </script>
</body>
</html>
