<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>住民税クエスト - 税金冒険RPG</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Courier New', monospace;
            background: linear-gradient(45deg, #1a1a2e, #16213e);
            color: #fff;
            min-height: 100vh;
            overflow-x: hidden;
        }

        .game-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }

        .game-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 20px;
            text-align: center;
            box-shadow: 0 0 30px rgba(102, 126, 234, 0.5);
            border: 2px solid #ffd700;
        }

        .game-title {
            font-size: 2.5rem;
            color: #ffd700;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            margin-bottom: 10px;
            animation: glow 2s ease-in-out infinite alternate;
        }

        @keyframes glow {
            from { text-shadow: 2px 2px 4px rgba(0,0,0,0.5), 0 0 10px #ffd700; }
            to { text-shadow: 2px 2px 4px rgba(0,0,0,0.5), 0 0 20px #ffd700, 0 0 30px #ffd700; }
        }

        .subtitle {
            color: #e0e0e0;
            font-size: 1.2rem;
        }

        .status-bar {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }

        .status-item {
            background: rgba(0, 0, 0, 0.7);
            border: 2px solid #00ff00;
            border-radius: 10px;
            padding: 15px;
            text-align: center;
            box-shadow: 0 0 15px rgba(0, 255, 0, 0.3);
        }

        .status-label {
            color: #00ff00;
            font-size: 0.9rem;
            margin-bottom: 5px;
        }

        .status-value {
            font-size: 1.5rem;
            font-weight: bold;
            color: #ffd700;
        }

        .game-area {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 20px;
        }

        .main-quest {
            background: rgba(0, 0, 0, 0.8);
            border: 2px solid #ff6b35;
            border-radius: 15px;
            padding: 20px;
            box-shadow: 0 0 20px rgba(255, 107, 53, 0.3);
        }

        .quest-title {
            color: #ff6b35;
            font-size: 1.5rem;
            margin-bottom: 15px;
            text-align: center;
        }

        .quest-item {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid #666;
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 15px;
            cursor: pointer;
            transition: all 0.3s;
        }

        .quest-item:hover {
            background: rgba(255, 255, 255, 0.2);
            border-color: #ffd700;
            transform: translateX(5px);
        }

        .quest-difficulty {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 0.8rem;
            margin-bottom: 8px;
        }

        .difficulty-easy { background: #00ff00; color: #000; }
        .difficulty-normal { background: #ffd700; color: #000; }
        .difficulty-hard { background: #ff4444; color: #fff; }
        .difficulty-legend { background: #9d4edd; color: #fff; }

        .quest-name {
            font-size: 1.2rem;
            color: #ffd700;
            margin-bottom: 8px;
        }

        .quest-reward {
            color: #00ff00;
            font-size: 0.9rem;
            margin-bottom: 5px;
        }

        .quest-desc {
            color: #ccc;
            font-size: 0.9rem;
            line-height: 1.4;
        }

        .side-panel {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        .panel {
            background: rgba(0, 0, 0, 0.8);
            border: 2px solid #00bfff;
            border-radius: 15px;
            padding: 15px;
            box-shadow: 0 0 15px rgba(0, 191, 255, 0.3);
        }

        .panel-title {
            color: #00bfff;
            font-size: 1.2rem;
            margin-bottom: 10px;
            text-align: center;
        }

        .inventory-item {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid #666;
            border-radius: 8px;
            padding: 10px;
            margin-bottom: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .item-name {
            color: #ffd700;
            font-weight: bold;
        }

        .item-count {
            color: #00ff00;
            background: rgba(0, 0, 0, 0.5);
            padding: 2px 6px;
            border-radius: 10px;
            font-size: 0.8rem;
        }

        .action-buttons {
            display: flex;
            gap: 10px;
            margin-top: 15px;
        }

        .btn {
            padding: 12px 20px;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s;
            font-family: 'Courier New', monospace;
            flex: 1;
        }

        .btn-primary {
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            border: 2px solid #ffd700;
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }

        .btn-secondary {
            background: linear-gradient(45deg, #ff6b35, #f7931e);
            color: white;
            border: 2px solid #ffd700;
        }

        .btn-secondary:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(255, 107, 53, 0.4);
        }

        .message-log {
            background: rgba(0, 0, 0, 0.9);
            border: 2px solid #ffd700;
            border-radius: 10px;
            padding: 15px;
            height: 200px;
            overflow-y: auto;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
            line-height: 1.4;
        }

        .message {
            margin-bottom: 8px;
            padding: 5px;
            border-radius: 5px;
        }

        .message-system {
            color: #00ff00;
            background: rgba(0, 255, 0, 0.1);
        }

        .message-info {
            color: #00bfff;
            background: rgba(0, 191, 255, 0.1);
        }

        .message-success {
            color: #ffd700;
            background: rgba(255, 215, 0, 0.1);
        }

        .message-error {
            color: #ff4444;
            background: rgba(255, 68, 68, 0.1);
        }

        .battle-scene {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            z-index: 1000;
            align-items: center;
            justify-content: center;
        }

        .battle-content {
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            border: 3px solid #ffd700;
            border-radius: 20px;
            padding: 30px;
            max-width: 600px;
            width: 90%;
            text-align: center;
        }

        .enemy-sprite {
            font-size: 4rem;
            margin: 20px 0;
            animation: bounce 1s ease-in-out infinite;
        }

        @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            60% { transform: translateY(-5px); }
        }

        .progress-bar {
            width: 100%;
            height: 20px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 10px;
            overflow: hidden;
            margin: 10px 0;
        }

        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #00ff00, #ffd700);
            transition: width 0.3s ease;
        }

        @media (max-width: 768px) {
            .game-area {
                grid-template-columns: 1fr;
            }
            
            .game-title {
                font-size: 2rem;
            }
            
            .action-buttons {
                flex-direction: column;
            }
        }
    </style>
</head>
<body>
    <div class="game-container">
        <header class="game-header">
            <h1 class="game-title">⚔️ 住民税クエスト ⚔️</h1>
            <p class="subtitle">税金の知識で王国を救え！2025年度税制改正の冒険</p>
        </header>

        <div class="status-bar">
            <div class="status-item">
                <div class="status-label">👤 勇者レベル</div>
                <div class="status-value" id="playerLevel">1</div>
            </div>
            <div class="status-item">
                <div class="status-label">💰 ゴールド</div>
                <div class="status-value" id="playerGold">500</div>
            </div>
            <div class="status-item">
                <div class="status-label">⭐ 経験値</div>
                <div class="status-value" id="playerExp">0</div>
            </div>
            <div class="status-item">
                <div class="status-label">🏆 クリア数</div>
                <div class="status-value" id="clearedQuests">0</div>
            </div>
        </div>

        <div class="game-area">
            <main class="main-quest">
                <h2 class="quest-title">🗡️ メインクエスト</h2>
                <div id="questList">
                    <!-- クエストはJavaScriptで動的生成 -->
                </div>
                <div class="action-buttons">
                    <button class="btn btn-primary" onclick="refreshQuests()">🔄 クエスト更新</button>
                    <button class="btn btn-secondary" onclick="showShop()">🏪 アイテムショップ</button>
                </div>
            </main>

            <aside class="side-panel">
                <div class="panel">
                    <h3 class="panel-title">🎒 所持アイテム</h3>
                    <div id="inventory">
                        <div class="inventory-item">
                            <span class="item-name">📚 税法の書</span>
                            <span class="item-count">x1</span>
                        </div>
                        <div class="inventory-item">
                            <span class="item-name">🧪 知識ポーション</span>
                            <span class="item-count">x3</span>
                        </div>
                        <div class="inventory-item">
                            <span class="item-name">🛡️ 節税の盾</span>
                            <span class="item-count">x1</span>
                        </div>
                    </div>
                </div>

                <div class="panel">
                    <h3 class="panel-title">📜 冒険ログ</h3>
                    <div class="message-log" id="messageLog">
                        <div class="message message-system">🎮 住民税クエストへようこそ！</div>
                        <div class="message message-info">📖 税制改正の知識を集めて王国を救いましょう</div>
                        <div class="message message-success">✨ 初回ログインボーナスで500ゴールドを獲得！</div>
                    </div>
                </div>
            </aside>
        </div>
    </div>

    <!-- バトル画面 -->
    <div class="battle-scene" id="battleScene">
        <div class="battle-content">
            <h2 style="color: #ff6b35; margin-bottom: 20px;">⚔️ 税務バトル ⚔️</h2>
            <div class="enemy-sprite" id="enemySprite">👹</div>
            <div id="enemyName" style="color: #ffd700; font-size: 1.5rem; margin-bottom: 15px;"></div>
            <div class="progress-bar">
                <div class="progress-fill" id="enemyHp" style="width: 100%;"></div>
            </div>
            <div id="battleQuestion" style="color: #fff; font-size: 1.2rem; margin: 20px 0; line-height: 1.6;"></div>
            <div id="battleOptions" style="display: flex; flex-direction: column; gap: 10px;"></div>
        </div>
    </div>

    <script>
        // ゲーム状態
        let gameState = {
            playerLevel: 1,
            playerGold: 500,
            playerExp: 0,
            clearedQuests: 0,
            currentBattle: null,
            inventory: {
                '📚 税法の書': 1,
                '🧪 知識ポーション': 3,
                '🛡️ 節税の盾': 1
            }
        };

        // クエストデータ（2025年度住民税情報ベース）
        const quests = [
            {
                id: 1,
                name: "103万円の壁の謎",
                difficulty: "easy",
                reward: "100ゴールド + 50経験値",
                description: "2025年度から103万円の壁が123万円に変更された理由を解明せよ！",
                enemy: "👺 税制改正の鬼",
                question: "2025年度税制改正により、パート・アルバイトの所得税課税最低限はいくらになった？",
                options: ["103万円のまま", "123万円に変更", "150万円に変更", "100万円に変更"],
                correct: 1,
                explanation: "基礎控除額が48万円→63万円、給与所得控除最低保障額が55万円→65万円に引き上げられたため、103万円の壁が123万円に変更されました。"
            },
            {
                id: 2,
                name: "定額減税消失事件",
                difficulty: "normal",
                reward: "200ゴールド + 100経験値",
                description: "2025年6月から住民税が高くなった原因を究明せよ！",
                enemy: "🧙‍♂️ 減税終了の魔法使い",
                question: "2024年度の定額減税で、住民税はいくら減額されていた？",
                options: ["5,000円", "10,000円", "15,000円", "20,000円"],
                correct: 1,
                explanation: "2024年度の定額減税では、住民税が1人当たり1万円減額されていました。この減税終了により、2025年6月から住民税が高く感じられます。"
            },
            {
                id: 3,
                name: "特定親族特別控除の秘密",
                difficulty: "hard",
                reward: "300ゴールド + 200経験値",
                description: "新設された特定親族特別控除の詳細を解明せよ！",
                enemy: "🐉 控除制度の竜",
                question: "特定親族特別控除で、所得税の控除額は最大いくら？",
                options: ["38万円", "58万円", "63万円", "85万円"],
                correct: 2,
                explanation: "特定親族特別控除では、19〜22歳の子どもがいる場合、所得税で最大63万円の控除を受けることができます。"
            },
            {
                id: 4,
                name: "住民税非課税限度額の変更",
                difficulty: "normal",
                reward: "150ゴールド + 80経験値",
                description: "住民税非課税の年収上限変更について調査せよ！",
                enemy: "👻 非課税限度額の亡霊",
                question: "2025年度から住民税非課税の年収上限はいくらになった？",
                options: ["100万円のまま", "105万円", "110万円", "115万円"],
                correct: 2,
                explanation: "給与所得控除の改正に伴い、住民税非課税の年収上限が100万円から110万円に引き上げられました。"
            },
            {
                id: 5,
                name: "伝説の税制改正マスター",
                difficulty: "legend",
                reward: "500ゴールド + 300経験値 + 🏆特別称号",
                description: "すべての税制改正知識を駆使して最強の敵を倒せ！",
                enemy: "🦹‍♂️ 税制改正の魔王",
                question: "2025年度税制改正で、子育て支援として拡充された制度は？",
                options: ["住宅ローン控除のみ", "生命保険料控除のみ", "両方とも拡充", "どちらも変更なし"],
                correct: 2,
                explanation: "2025年度は子育て支援として、住宅ローン控除の拡充延長と生命保険料控除の拡充が実施されました。"
            }
        ];

        // 初期化
        function initGame() {
            updateStatus();
            displayQuests();
            addMessage("🎮 ゲームを開始しました！税金の知識を身につけて王国を救いましょう！", "system");
        }

        // ステータス更新
        function updateStatus() {
            document.getElementById('playerLevel').textContent = gameState.playerLevel;
            document.getElementById('playerGold').textContent = gameState.playerGold;
            document.getElementById('playerExp').textContent = gameState.playerExp;
            document.getElementById('clearedQuests').textContent = gameState.clearedQuests;
        }

        // クエスト表示
        function displayQuests() {
            const questList = document.getElementById('questList');
            questList.innerHTML = '';

            quests.forEach(quest => {
                const difficultyClass = `difficulty-${quest.difficulty}`;
                const questElement = document.createElement('div');
                questElement.className = 'quest-item';
                questElement.onclick = () => startQuest(quest.id);
                
                questElement.innerHTML = `
                    <div class="quest-difficulty ${difficultyClass}">${quest.difficulty.toUpperCase()}</div>
                    <div class="quest-name">${quest.name}</div>
                    <div class="quest-reward">🎁 ${quest.reward}</div>
                    <div class="quest-desc">${quest.description}</div>
                `;
                
                questList.appendChild(questElement);
            });
        }

        // クエスト開始
        function startQuest(questId) {
            const quest = quests.find(q => q.id === questId);
            if (!quest) return;

            gameState.currentBattle = quest;
            showBattle(quest);
            addMessage(`⚔️ ${quest.name}を開始しました！`, "info");
        }

        // バトル画面表示
        function showBattle(quest) {
            const battleScene = document.getElementById('battleScene');
            const enemySprite = document.getElementById('enemySprite');
            const enemyName = document.getElementById('enemyName');
            const battleQuestion = document.getElementById('battleQuestion');
            const battleOptions = document.getElementById('battleOptions');

            enemySprite.textContent = quest.enemy.split(' ')[0];
            enemyName.textContent = quest.enemy;
            battleQuestion.textContent = quest.question;

            battleOptions.innerHTML = '';
            quest.options.forEach((option, index) => {
                const button = document.createElement('button');
                button.className = 'btn btn-primary';
                button.textContent = `${index + 1}. ${option}`;
                button.onclick = () => selectAnswer(index);
                battleOptions.appendChild(button);
            });

            battleScene.style.display = 'flex';
        }

        // 回答選択
        function selectAnswer(selectedIndex) {
            const quest = gameState.currentBattle;
            const isCorrect = selectedIndex === quest.correct;

            if (isCorrect) {
                // 正解の場合
                const rewards = quest.reward.match(/(\d+)ゴールド.*?(\d+)経験値/);
                const goldReward = parseInt(rewards[1]);
                const expReward = parseInt(rewards[2]);

                gameState.playerGold += goldReward;
                gameState.playerExp += expReward;
                gameState.clearedQuests++;

                // レベルアップ判定
                if (gameState.playerExp >= gameState.playerLevel * 100) {
                    gameState.playerLevel++;
                    gameState.playerExp = 0;
                    addMessage(`🎉 レベルアップ！レベル${gameState.playerLevel}になりました！`, "success");
                }

                addMessage(`✅ 正解！${quest.explanation}`, "success");
                addMessage(`💰 ${goldReward}ゴールド、⭐${expReward}経験値を獲得！`, "success");
                
                // 特別報酬
                if (quest.difficulty === "legend") {
                    addMessage("🏆 伝説の称号「税制改正マスター」を獲得！", "success");
                }
            } else {
                addMessage(`❌ 不正解... 正解は「${quest.options[quest.correct]}」でした。`, "error");
                addMessage(`📖 ${quest.explanation}`, "info");
            }

            updateStatus();
            hideBattle();
        }

        // バトル画面非表示
        function hideBattle() {
            document.getElementById('battleScene').style.display = 'none';
            gameState.currentBattle = null;
        }

        // クエスト更新
        function refreshQuests() {
            displayQuests();
            addMessage("🔄 クエストリストを更新しました！", "system");
        }

        // ショップ表示
        function showShop() {
            const shopItems = [
                "🧪 知識ポーション (50ゴールド)",
                "📚 上級税法の書 (200ゴールド)",
                "🗡️ 計算の剣 (300ゴールド)",
                "🛡️ 節税の盾 (250ゴールド)"
            ];
            
            let shopMessage = "🏪 アイテムショップ\n\n";
            shopItems.forEach((item, index) => {
                shopMessage += `${index + 1}. ${item}\n`;
            });
            shopMessage += "\n※実装準備中です";
            
            alert(shopMessage);
            addMessage("🏪 ショップを訪れました（実装準備中）", "info");
        }

        // メッセージ追加
        function addMessage(text, type = "system") {
            const messageLog = document.getElementById('messageLog');
            const message = document.createElement('div');
            message.className = `message message-${type}`;
            message.textContent = text;
            messageLog.appendChild(message);
            messageLog.scrollTop = messageLog.scrollHeight;
        }

        // ESCキーでバトル終了
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && gameState.currentBattle) {
                hideBattle();
                addMessage("🚪 バトルから逃走しました...", "error");
            }
        });

        // ゲーム初期化
        document.addEventListener('DOMContentLoaded', initGame);
    </script>
</body>
</html>
