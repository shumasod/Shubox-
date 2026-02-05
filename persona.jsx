<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Persona Non Grata - 競馬外交官</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', 'ヒラギノ角ゴ Pro', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1000px;
            margin: 0 auto;
        }
        
        .header {
            text-align: center;
            color: white;
            margin-bottom: 30px;
            animation: slideDown 0.6s ease;
        }
        
        @keyframes slideDown {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .header h1 {
            font-size: 2.8em;
            margin-bottom: 10px;
            text-shadow: 3px 3px 6px rgba(0,0,0,0.3);
            letter-spacing: 2px;
        }
        
        .header p {
            font-size: 1.2em;
            opacity: 0.95;
        }
        
        .screen {
            display: none;
            animation: fadeIn 0.5s ease;
        }
        
        .screen.active {
            display: block;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        /* タイトル画面 */
        .title-screen {
            background: white;
            border-radius: 15px;
            padding: 50px 40px;
            box-shadow: 0 15px 40px rgba(0,0,0,0.2);
            text-align: center;
        }
        
        .title-screen h2 {
            font-size: 2.5em;
            color: #667eea;
            margin-bottom: 20px;
        }
        
        .title-screen p {
            font-size: 1.1em;
            color: #666;
            margin-bottom: 15px;
            line-height: 1.8;
        }
        
        .game-intro {
            background: #f0f4ff;
            padding: 25px;
            border-radius: 10px;
            margin: 30px 0;
            border-left: 5px solid #667eea;
        }
        
        .game-intro h3 {
            color: #667eea;
            margin-bottom: 10px;
        }
        
        .game-intro li {
            margin-left: 20px;
            color: #555;
            margin-bottom: 8px;
        }
        
        /* ゲーム画面 */
        .game-screen {
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 15px 40px rgba(0,0,0,0.2);
        }
        
        .stats-panel {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
        }
        
        .stat-label {
            font-size: 0.9em;
            opacity: 0.9;
            margin-bottom: 8px;
        }
        
        .stat-value {
            font-size: 2em;
            font-weight: bold;
        }
        
        .progress-bar {
            background: #ddd;
            height: 25px;
            border-radius: 12px;
            overflow: hidden;
            margin: 15px 0;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            transition: width 0.5s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 0.9em;
            font-weight: bold;
        }
        
        .country-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
        }
        
        .country-name {
            font-size: 1.8em;
            margin-bottom: 10px;
        }
        
        .country-status {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 10px;
        }
        
        .reputation-info {
            font-size: 1.1em;
        }
        
        .country-progress {
            font-size: 0.9em;
            opacity: 0.9;
        }
        
        .race-results {
            background: #f9f9f9;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            border-left: 4px solid #667eea;
        }
        
        .race-title {
            font-size: 1.3em;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 15px;
        }
        
        .race-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        
        .race-table th {
            background: #667eea;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: bold;
        }
        
        .race-table td {
            padding: 10px 12px;
            border-bottom: 1px solid #eee;
        }
        
        .race-table tr:nth-child(even) {
            background: #f5f5f5;
        }
        
        .strategy-box {
            background: #e8f4ff;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
            border-left: 4px solid #667eea;
        }
        
        .strategy-title {
            font-weight: bold;
            color: #667eea;
            margin-bottom: 10px;
            font-size: 1.1em;
        }
        
        .strategy-text {
            color: #555;
            line-height: 1.6;
        }
        
        .score-breakdown {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        
        .score-item {
            background: white;
            border: 2px solid #667eea;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
        }
        
        .score-item-label {
            color: #666;
            font-size: 0.95em;
            margin-bottom: 8px;
        }
        
        .score-item-value {
            font-size: 1.8em;
            font-weight: bold;
            color: #667eea;
        }
        
        /* ボタン */
        .button-group {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-top: 30px;
        }
        
        .btn {
            padding: 14px 25px;
            border: none;
            border-radius: 8px;
            font-size: 1.05em;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }
        
        .btn-secondary {
            background: #f0f0f0;
            color: #333;
            border: 2px solid #ddd;
        }
        
        .btn-secondary:hover {
            background: #e0e0e0;
        }
        
        .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        
        /* リザルト画面 */
        .result-screen {
            background: white;
            border-radius: 15px;
            padding: 50px 40px;
            box-shadow: 0 15px 40px rgba(0,0,0,0.2);
            text-align: center;
        }
        
        .result-title {
            font-size: 2.5em;
            margin-bottom: 20px;
            animation: scaleIn 0.6s ease;
        }
        
        @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.8); }
            to { opacity: 1; transform: scale(1); }
        }
        
        .result-screen.victory .result-title {
            color: #2ecc71;
        }
        
        .result-screen.defeat .result-title {
            color: #e74c3c;
        }
        
        .final-score-box {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            border-radius: 10px;
            margin: 30px 0;
        }
        
        .final-score-label {
            font-size: 1.2em;
            opacity: 0.9;
            margin-bottom: 10px;
        }
        
        .final-score {
            font-size: 3.5em;
            font-weight: bold;
        }
        
        .strategies-summary {
            text-align: left;
            background: #f9f9f9;
            padding: 25px;
            border-radius: 10px;
            margin: 25px 0;
            max-height: 400px;
            overflow-y: auto;
        }
        
        .strategy-summary-item {
            padding: 12px 0;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .strategy-summary-item:last-child {
            border-bottom: none;
        }
        
        .strategy-country {
            font-weight: bold;
            color: #667eea;
            flex: 1;
        }
        
        .strategy-score {
            background: #667eea;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.9em;
        }
        
        .loading {
            text-align: center;
            padding: 40px;
        }
        
        .spinner {
            display: inline-block;
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .loading-text {
            margin-top: 15px;
            color: #667eea;
            font-weight: bold;
        }
        
        .warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 20px;
            color: #333;
        }
        
        .warning.danger {
            background: #ffebee;
            border-left-color: #e74c3c;
            color: #c0392b;
        }
        
        /* レスポンシブ */
        @media (max-width: 768px) {
            .header h1 {
                font-size: 1.8em;
            }
            
            .title-screen {
                padding: 30px 20px;
            }
            
            .game-screen {
                padding: 20px;
            }
            
            .result-screen {
                padding: 30px 20px;
            }
            
            .stats-panel {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌍 Persona Non Grata 🏇</h1>
            <p>競馬外交官シミュレーションゲーム</p>
        </div>
        
        <!-- タイトル画面 -->
        <div class="screen active" id="titleScreen">
            <div class="title-screen">
                <h2>🌍 Persona Non Grata</h2>
                <p>あなたは各国の競馬場を訪問する外交官です。</p>
                
                <div class="game-intro">
                    <h3>📋 ゲームの流れ</h3>
                    <ul>
                        <li>🇯🇵 🇺🇸 🇫🇷 🇩🇪 🇨🇳 5カ国を訪問</li>
                        <li>各国での競馬レース結果を分析</li>
                        <li>レース結果から外交戦略を学ぶ</li>
                        <li>外交精度とスコアを競う</li>
                    </ul>
                </div>
                
                <p style="color: #666; font-size: 0.95em;">
                    競馬場での戦績から各国の文化と外交アプローチを理解しましょう。<br>
                    すべての国での外交ミッション完了を目指します！
                </p>
                
                <div class="button-group" style="margin-top: 40px;">
                    <button class="btn btn-primary" onclick="startGame()">
                        ゲーム開始
                    </button>
                </div>
            </div>
        </div>
        
        <!-- ゲーム画面 -->
        <div class="screen" id="gameScreen">
            <div class="game-screen">
                <div class="stats-panel">
                    <div class="stat-card">
                        <div class="stat-label">訪問国</div>
                        <div class="stat-value" id="countryNumber">1/5</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">スコア</div>
                        <div class="stat-value" id="currentScore">0</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">外交精度</div>
                        <div class="stat-value" id="accuracy">0%</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">進捗</div>
                        <div class="stat-value" id="progress">0%</div>
                    </div>
                </div>
                
                <div id="warningBox"></div>
                
                <div class="country-header">
                    <div class="country-name" id="countryDisplay">日本 🇯🇵</div>
                    <div class="country-status">
                        <div class="reputation-info">
                            評判: <span id="reputationValue">100</span>/100
                        </div>
                        <div class="country-progress">
                            <span id="countryProgress">国1/5</span>
                        </div>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" id="reputationBar" style="width: 100%;"></div>
                    </div>
                </div>
                
                <div class="race-results">
                    <div class="race-title">🏇 レース結果</div>
                    <table class="race-table">
                        <thead>
                            <tr>
                                <th>着順</th>
                                <th>馬名</th>
                                <th>騎手</th>
                                <th>オッズ</th>
                                <th>馬体重</th>
                            </tr>
                        </thead>
                        <tbody id="raceTableBody">
                        </tbody>
                    </table>
                </div>
                
                <div class="strategy-box">
                    <div class="strategy-title">💡 外交戦略</div>
                    <div class="strategy-text" id="strategyText">
                        戦略を読み込み中...
                    </div>
                </div>
                
                <div class="score-breakdown">
                    <div class="score-item">
                        <div class="score-item-label">平均オッズ</div>
                        <div class="score-item-value" id="avgOdds">-</div>
                    </div>
                    <div class="score-item">
                        <div class="score-item-label">外交精度</div>
                        <div class="score-item-value" id="diplomacyAccuracy">-</div>
                    </div>
                    <div class="score-item">
                        <div class="score-item-label">獲得ポイント</div>
                        <div class="score-item-value" id="earnedPoints">-</div>
                    </div>
                </div>
                
                <div class="button-group">
                    <button class="btn btn-primary" onclick="nextCountry()" id="nextBtn">
                        次の国へ →
                    </button>
                </div>
            </div>
        </div>
        
        <!-- ローディング画面 -->
        <div class="screen" id="loadingScreen">
            <div class="game-screen" style="text-align: center;">
                <div class="loading">
                    <div class="spinner"></div>
                    <div class="loading-text" id="loadingText">
                        外交ミッションを準備中...
                    </div>
                </div>
            </div>
        </div>
        
        <!-- リザルト画面 -->
        <div class="screen" id="resultScreen">
            <div class="result-screen">
                <h2 class="result-title" id="resultTitle">
                    🎉 ゲーム終了
                </h2>
                
                <p id="resultMessage" style="font-size: 1.2em; color: #666; margin-bottom: 20px;">
                    結果メッセージ
                </p>
                
                <div class="final-score-box">
                    <div class="final-score-label">最終スコア</div>
                    <div class="final-score" id="finalScore">0</div>
                </div>
                
                <div class="strategies-summary">
                    <h3 style="margin-bottom: 15px; color: #667eea;">📚 習得した外交戦略</h3>
                    <div id="strategiesList"></div>
                </div>
                
                <p id="resultStats" style="color: #666; margin: 20px 0;">
                    結果統計
                </p>
                
                <div class="button-group">
                    <button class="btn btn-primary" onclick="location.reload()">
                        もう一度プレイ
                    </button>
                    <button class="btn btn-secondary" onclick="goToTitle()">
                        タイトルに戻る
                    </button>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        // ======================== ゲームデータ ========================
        
        const countries = [
            {
                name: "日本",
                flag: "🇯🇵",
                desc: "和の精神を大切にする国",
                horses: ["ディープインパクト", "キタサンブラック", "ステイゴールド"],
                jockeys: ["北村友一", "岩田康誠", "ルメール"],
                strategies: {
                    low: "🇯🇵 強い優勢馬がいる → 伝統と秩序を重視し、段階的な交渉を進める",
                    mid: "🇯🇵 中程度の混戦 → チームワークと相互尊重で信頼を構築",
                    high: "🇯🇵 混戦模様 → 謙虚な姿勢で相手を尊重し、じっくり関係を深める"
                }
            },
            {
                name: "アメリカ",
                flag: "🇺🇸",
                desc: "個性と直接性を重んじる国",
                horses: ["シービスケット", "マンオウォー", "アメリカン"],
                jockeys: ["ジェリー", "トッド", "マカロー"],
                strategies: {
                    low: "🇺🇸 優勢馬がいる → 明確な目標と自信を持って交渉を推し進める",
                    mid: "🇺🇸 混戦模様 → 競争的だが公正な交渉姿勢を保つ",
                    high: "🇺🇸 予測困難 → 予測不可能な状況では柔軟性と創意を発揮"
                }
            },
            {
                name: "フランス",
                flag: "🇫🇷",
                desc: "美学と知的議論を重んじる国",
                horses: ["トランスワイヨン", "モンジュー", "フランカー"],
                jockeys: ["ドットン", "ヴァデルトン", "ルヴェック"],
                strategies: {
                    low: "🇫🇷 明確な優勝馬 → エレガントで洗練された交渉方針を貫く",
                    mid: "🇫🇷 接戦模様 → 知的で創造的なアプローチで局面を打開",
                    high: "🇫🇷 乱戦 → 芸術的な交渉スタイルで相手を魅了する"
                }
            },
            {
                name: "ドイツ",
                flag: "🇩🇪",
                desc: "秩序と効率を重んじる国",
                horses: ["プリューシューッセ", "ドイツライター", "ベルリンシュタルク"],
                jockeys: ["シュミット", "ミューラー", "フェルディナント"],
                strategies: {
                    low: "🇩🇪 強い優位性あり → 厳密なプロセスと効率で目標達成",
                    mid: "🇩🇪 予測可能な展開 → 論理的で秩序立てた交渉を展開",
                    high: "🇩🇪 不確実性が高い → リスク分析と綿密な計画で対応"
                }
            },
            {
                name: "中国",
                flag: "🇨🇳",
                desc: "調和と長期視野を重んじる国",
                horses: ["チャイナゴールド", "龍翔", "中華ドリーム"],
                jockeys: ["李明", "王志", "張浩"],
                strategies: {
                    low: "🇨🇳 予測通りの展開 → 関係構築を重視し、長期的な提携を模索",
                    mid: "🇨🇳 適度な競争 → 相手の立場を理解し、協調路線を探る",
                    high: "🇨🇳 複雑な状況 → グループ全体の利益を考慮した提案をする"
                }
            }
        ];
        
        // ======================== ゲーム状態 ========================
        
        let gameState = {
            currentCountry: 0,
            totalScore: 0,
            countryScores: [],
            strategies: [],
            currentRaceData: null
        };
        
        // ======================== ユーティリティ関数 ========================
        
        function generateRaceData(countryIndex) {
            const country = countries[countryIndex];
            const data = [];
            
            for (let i = 0; i < 3; i++) {
                data.push({
                    rank: String(i + 1),
                    horse: country.horses[i],
                    jockey: country.jockeys[i],
                    odds: (Math.random() * 15 + 1.5).toFixed(1),
                    weight: (400 + Math.floor(Math.random() * 100)) + "kg"
                });
            }
            
            return data;
        }
        
        function calculateStats(raceData) {
            const odds = raceData.map(r => parseFloat(r.odds));
            const avgOdds = (odds.reduce((a, b) => a + b, 0) / odds.length).toFixed(2);
            const accuracy = Math.min(100, (1.0 / parseFloat(avgOdds) * 100).toFixed(1));
            const points = Math.floor(accuracy + Math.random() * 20 + 15);
            
            return { avgOdds, accuracy, points };
        }
        
        function getStrategy(avgOdds, country) {
            const strategies = country.strategies;
            if (parseFloat(avgOdds) < 5) return strategies.low;
            if (parseFloat(avgOdds) < 10) return strategies.mid;
            return strategies.high;
        }
        
        function updateDisplay() {
            const country = countries[gameState.currentCountry];
            const stats = gameState.currentStats;
            
            // 国情報更新
            document.getElementById('countryDisplay').textContent = 
                `${country.name} ${country.flag}`;
            document.getElementById('countryProgress').textContent = 
                `国${gameState.currentCountry + 1}/5`;
            
            // レーステーブル更新
            const tableBody = document.getElementById('raceTableBody');
            tableBody.innerHTML = '';
            gameState.currentRaceData.forEach(horse => {
                const row = `
                    <tr>
                        <td>${horse.rank}</td>
                        <td>${horse.horse}</td>
                        <td>${horse.jockey}</td>
                        <td>${horse.odds}</td>
                        <td>${horse.weight}</td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
            
            // 戦略更新
            const strategy = getStrategy(stats.avgOdds, country);
            document.getElementById('strategyText').textContent = strategy;
            
            // スコア情報更新
            document.getElementById('avgOdds').textContent = stats.avgOdds;
            document.getElementById('diplomacyAccuracy').textContent = stats.accuracy + '%';
            document.getElementById('earnedPoints').textContent = '+' + stats.points;
            
            // 統計更新
            document.getElementById('countryNumber').textContent = 
                `${gameState.currentCountry + 1}/5`;
            document.getElementById('currentScore').textContent = gameState.totalScore;
            document.getElementById('accuracy').textContent = stats.accuracy + '%';
            
            const progress = Math.round((gameState.currentCountry / 5) * 100);
            document.getElementById('progress').textContent = progress + '%';
            document.getElementById('reputationValue').textContent = '100';
            document.getElementById('reputationBar').style.width = '100%';
        }
        
        // ======================== 画面遷移 ========================
        
        function showScreen(screenId) {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            document.getElementById(screenId).classList.add('active');
        }
        
        function startGame() {
            gameState = {
                currentCountry: 0,
                totalScore: 0,
                countryScores: [],
                strategies: []
            };
            
            loadCountry();
        }
        
        function loadCountry() {
            showScreen('loadingScreen');
            document.getElementById('loadingText').textContent = 
                `${countries[gameState.currentCountry].name}を準備中...`;
            
            setTimeout(() => {
                gameState.currentRaceData = generateRaceData(gameState.currentCountry);
                gameState.currentStats = calculateStats(gameState.currentRaceData);
                
                gameState.totalScore += gameState.currentStats.points;
                gameState.countryScores.push({
                    country: countries[gameState.currentCountry].name,
                    score: gameState.currentStats.points
                });
                gameState.strategies.push({
                    country: countries[gameState.currentCountry].name,
                    strategy: getStrategy(gameState.currentStats.avgOdds, countries[gameState.currentCountry])
                });
                
                updateDisplay();
                showScreen('gameScreen');
            }, 1500);
        }
        
        function nextCountry() {
            gameState.currentCountry++;
            
            if (gameState.currentCountry < 5) {
                loadCountry();
            } else {
                showResult();
            }
        }
        
        function showResult() {
            showScreen('resultScreen');
            
            const resultTitle = document.getElementById('resultTitle');
            const resultMessage = document.getElementById('resultMessage');
            const finalScore = document.getElementById('finalScore');
            const strategiesList = document.getElementById('strategiesList');
            const resultStats = document.getElementById('resultStats');
            const resultScreen = document.getElementById('resultScreen').querySelector('.result-screen');
            
            resultTitle.textContent = '🎉 ミッション完了！';
            resultMessage.textContent = 'すべての国での外交ミッションを完了しました！';
            finalScore.textContent = gameState.totalScore;
            
            resultStats.innerHTML = `
                <strong>訪問国数:</strong> ${gameState.countryScores.length}<br>
                <strong>平均スコア:</strong> ${Math.round(gameState.totalScore / gameState.countryScores.length)}
            `;
            
            strategiesList.innerHTML = gameState.strategies.map((s, i) => `
                <div class="strategy-summary-item">
                    <span class="strategy-country">${i + 1}. ${s.country}</span>
                    <span class="strategy-score">${gameState.countryScores[i].score}pt</span>
                </div>
            `).join('');
            
            resultScreen.classList.add('victory');
        }
        
        function goToTitle() {
            showScreen('titleScreen');
        }
    </script>
</body>
</html>
