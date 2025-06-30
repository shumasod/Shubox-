<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=120, initial-scale=1.0">
    <title>怪盗キングダム</title>
    <style>
        body {
            font-family: monospace;
            font-size: 9px;
            background: linear-gradient(to bottom, #1a1a2e, #16213e);
            margin: 0;
            padding: 2px;
            width: 116px;
            color: white;
        }
        
        .header {
            background: linear-gradient(to bottom, #d4af37, #b8860b);
            color: #000;
            text-align: center;
            padding: 4px;
            margin-bottom: 2px;
            font-size: 9px;
            font-weight: bold;
            border-radius: 3px;
            box-shadow: 1px 1px 3px rgba(0,0,0,0.5);
        }
        
        .status-bar {
            background: #2c2c54;
            border: 1px solid #40407a;
            padding: 3px;
            margin-bottom: 2px;
            font-size: 7px;
            border-radius: 2px;
        }
        
        .status-item {
            display: inline-block;
            margin-right: 8px;
        }
        
        .hp-bar, .ap-bar {
            width: 50px;
            height: 6px;
            background: #333;
            border: 1px solid #666;
            position: relative;
            display: inline-block;
            vertical-align: middle;
        }
        
        .hp-fill {
            height: 100%;
            background: linear-gradient(to right, #ff4757, #ff3742);
            width: 75%;
        }
        
        .ap-fill {
            height: 100%;
            background: linear-gradient(to right, #2ed573, #20bf6b);
            width: 60%;
        }
        
        .section {
            background: #2c2c54;
            border: 1px solid #40407a;
            margin-bottom: 3px;
            padding: 3px;
            border-radius: 3px;
        }
        
        .section-title {
            background: linear-gradient(to bottom, #5f27cd, #341f97);
            color: white;
            margin: -3px -3px 2px -3px;
            padding: 2px;
            font-size: 8px;
            font-weight: bold;
            text-align: center;
            border-radius: 2px 2px 0 0;
        }
        
        .card {
            background: linear-gradient(to bottom, #3c3c3c, #2c2c2c);
            border: 1px solid #666;
            padding: 3px;
            margin: 2px 0;
            border-radius: 2px;
            position: relative;
        }
        
        .card-rare {
            border: 2px solid #ffd700;
            box-shadow: 0 0 5px #ffd700;
        }
        
        .card-super-rare {
            border: 2px solid #ff69b4;
            box-shadow: 0 0 5px #ff69b4;
        }
        
        .card-ultra-rare {
            border: 2px solid #00ffff;
            box-shadow: 0 0 5px #00ffff;
        }
        
        .card-name {
            font-weight: bold;
            font-size: 8px;
            color: #ffd700;
        }
        
        .card-stats {
            font-size: 7px;
            color: #ccc;
            margin-top: 1px;
        }
        
        .card-image {
            width: 20px;
            height: 20px;
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
            border: 1px solid #333;
            float: left;
            margin-right: 5px;
            border-radius: 2px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
        }
        
        .btn {
            background: linear-gradient(to bottom, #ff6b6b, #ee5a52);
            color: white;
            border: 1px solid #c44569;
            padding: 2px 6px;
            font-size: 7px;
            margin: 1px 2px;
            border-radius: 2px;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
        }
        
        .btn:hover {
            background: linear-gradient(to bottom, #ee5a52, #ff6b6b);
        }
        
        .btn-gold {
            background: linear-gradient(to bottom, #ffd700, #daa520);
            color: #000;
            border: 1px solid #b8860b;
        }
        
        .btn-silver {
            background: linear-gradient(to bottom, #c0c0c0, #a0a0a0);
            color: #000;
            border: 1px solid #808080;
        }
        
        .nav {
            background: #40407a;
            text-align: center;
            padding: 2px;
            margin: 2px 0;
            border-radius: 2px;
        }
        
        .nav a {
            color: #ddd;
            text-decoration: none;
            font-size: 7px;
            margin: 0 2px;
        }
        
        .mission-item {
            background: #1a1a2e;
            border: 1px solid #0f3460;
            padding: 3px;
            margin: 1px 0;
            font-size: 7px;
            border-radius: 2px;
        }
        
        .mission-title {
            color: #70a1ff;
            font-weight: bold;
        }
        
        .mission-reward {
            color: #ffa502;
            font-size: 6px;
        }
        
        .enemy-card {
            background: linear-gradient(to bottom, #4c4c4c, #3c3c3c);
            border: 1px solid #ff4757;
            padding: 3px;
            margin: 2px 0;
            border-radius: 2px;
        }
        
        .battle-result {
            background: #0c2461;
            border: 2px solid #40407a;
            padding: 5px;
            margin: 3px 0;
            text-align: center;
            border-radius: 3px;
            font-size: 8px;
        }
        
        .win {
            border-color: #2ed573;
            background: #0e4429;
        }
        
        .lose {
            border-color: #ff4757;
            background: #4a0e0e;
        }
        
        .gacha-result {
            background: linear-gradient(45deg, #ffd700, #ffed4e);
            color: #000;
            padding: 5px;
            margin: 3px 0;
            text-align: center;
            border-radius: 3px;
            font-weight: bold;
            animation: sparkle 2s infinite;
        }
        
        @keyframes sparkle {
            0%, 100% { box-shadow: 0 0 5px #ffd700; }
            50% { box-shadow: 0 0 15px #ffd700, 0 0 25px #ffd700; }
        }
        
        .notification {
            background: #ff4757;
            color: white;
            padding: 2px 5px;
            margin: 2px 0;
            border-radius: 2px;
            font-size: 7px;
            text-align: center;
            animation: blink 1s infinite;
        }
        
        @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0.7; }
        }
        
        .friend-item {
            background: #2c2c54;
            border: 1px solid #40407a;
            padding: 2px;
            margin: 1px 0;
            font-size: 7px;
            border-radius: 2px;
        }
        
        .online {
            color: #2ed573;
        }
        
        .offline {
            color: #747d8c;
        }
        
        .footer {
            background: #1a1a2e;
            color: #666;
            text-align: center;
            padding: 2px;
            font-size: 6px;
            margin-top: 3px;
            border-top: 1px solid #40407a;
        }
        
        .energy-timer {
            color: #ffa502;
            font-size: 6px;
        }
        
        .level-up {
            background: linear-gradient(45deg, #ff9ff3, #f368e0);
            color: white;
            text-align: center;
            padding: 3px;
            margin: 2px 0;
            border-radius: 3px;
            animation: levelup 3s ease-in-out;
        }
        
        @keyframes levelup {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
    </style>
    <script>
        // ゲーム状態管理
        let gameState = {
            level: 12,
            exp: 2450,
            expToNext: 3000,
            hp: 75,
            maxHp: 100,
            ap: 60,
            maxAp: 100,
            coins: 8520,
            cards: [],
            lastActionTime: Date.now()
        };
        
        // ゲームデータ読み込み（メモリ内管理）
        function loadGameData() {
            // artifact環境では初期データのまま使用
            updateDisplay();
        }
        
        // ゲームデータ保存（メモリ内のみ）
        function saveGameData() {
            // artifact環境ではセッション中のみデータ保持
            console.log('ゲーム状態更新:', gameState);
        }
        
        // 表示更新
        function updateDisplay() {
            document.getElementById('level').textContent = gameState.level;
            document.getElementById('exp').textContent = gameState.exp;
            document.getElementById('expToNext').textContent = gameState.expToNext;
            document.getElementById('coins').textContent = gameState.coins.toLocaleString();
            
            // HPバー更新
            const hpPercent = (gameState.hp / gameState.maxHp) * 100;
            document.querySelector('.hp-fill').style.width = hpPercent + '%';
            document.getElementById('hp').textContent = `${gameState.hp}/${gameState.maxHp}`;
            
            // APバー更新
            const apPercent = (gameState.ap / gameState.maxAp) * 100;
            document.querySelector('.ap-fill').style.width = apPercent + '%';
            document.getElementById('ap').textContent = `${gameState.ap}/${gameState.maxAp}`;
        }
        
        // ミッション実行
        function doMission(missionName, apCost) {
            if (gameState.ap < apCost) {
                showNotification('APが不足しています！');
                return;
            }
            
            gameState.ap -= apCost;
            const expGain = Math.floor(Math.random() * 50) + 20;
            const coinGain = Math.floor(Math.random() * 300) + 100;
            
            gameState.exp += expGain;
            gameState.coins += coinGain;
            
            // レベルアップチェック
            if (gameState.exp >= gameState.expToNext) {
                levelUp();
            }
            
            // カード入手チャンス
            if (Math.random() < 0.3) {
                const newCard = generateRandomCard();
                showCardGet(newCard);
            }
            
            showBattleResult(`${missionName}クリア！`, `EXP+${expGain} コイン+${coinGain}`);
            updateDisplay();
            saveGameData();
        }
        
        // レベルアップ
        function levelUp() {
            gameState.level++;
            gameState.exp = 0;
            gameState.expToNext = gameState.level * 250;
            gameState.maxHp += 10;
            gameState.maxAp += 5;
            gameState.hp = gameState.maxHp; // 全回復
            gameState.ap = gameState.maxAp;
            
            showLevelUp();
        }
        
        // ガチャ実行
        function drawGacha(type) {
            let cost = 0;
            let rareChance = 0;
            
            switch(type) {
                case 'normal':
                    cost = 300;
                    rareChance = 0.1;
                    break;
                case 'premium':
                    cost = 1000;
                    rareChance = 0.3;
                    break;
            }
            
            if (gameState.coins < cost) {
                showNotification('コインが不足しています！');
                return;
            }
            
            gameState.coins -= cost;
            const newCard = generateRandomCard(rareChance);
            showGachaResult(newCard);
            
            updateDisplay();
            saveGameData();
        }
        
        // ランダムカード生成
        function generateRandomCard(rareChance = 0.1) {
            const cards = [
                {name: '見習い怪盗', rarity: 'normal', attack: 100, defense: 80, emoji: '🎭'},
                {name: '熟練泥棒', rarity: 'normal', attack: 150, defense: 120, emoji: '🕴'},
                {name: '怪盗紳士', rarity: 'rare', attack: 300, defense: 250, emoji: '🎩'},
                {name: '影の暗殺者', rarity: 'rare', attack: 280, defense: 300, emoji: '🗡'},
                {name: '黄金仮面', rarity: 'super_rare', attack: 500, defense: 450, emoji: '👑'},
                {name: '伝説の怪盗王', rarity: 'ultra_rare', attack: 800, defense: 700, emoji: '💎'}
            ];
            
            let availableCards = cards.filter(card => card.rarity === 'normal');
            
            if (Math.random() < rareChance) {
                availableCards = cards.filter(card => card.rarity === 'rare');
            }
            if (Math.random() < rareChance * 0.3) {
                availableCards = cards.filter(card => card.rarity === 'super_rare');
            }
            if (Math.random() < rareChance * 0.1) {
                availableCards = cards.filter(card => card.rarity === 'ultra_rare');
            }
            
            return availableCards[Math.floor(Math.random() * availableCards.length)];
        }
        
        // 通知表示
        function showNotification(message) {
            const notification = document.createElement('div');
            notification.className = 'notification';
            notification.textContent = message;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 3000);
        }
        
        // バトル結果表示
        function showBattleResult(title, description) {
            const result = document.getElementById('battle-result');
            result.innerHTML = `<strong>${title}</strong><br>${description}`;
            result.className = 'battle-result win';
            result.style.display = 'block';
            
            setTimeout(() => {
                result.style.display = 'none';
            }, 3000);
        }
        
        // ガチャ結果表示
        function showGachaResult(card) {
            const result = document.getElementById('gacha-result');
            result.innerHTML = `<strong>新カード獲得！</strong><br>${card.emoji} ${card.name}<br>攻撃:${card.attack} 防御:${card.defense}`;
            result.style.display = 'block';
            
            setTimeout(() => {
                result.style.display = 'none';
            }, 4000);
        }
        
        // カード獲得表示
        function showCardGet(card) {
            showNotification(`${card.emoji} ${card.name}を獲得！`);
        }
        
        // レベルアップ表示
        function showLevelUp() {
            const levelupDiv = document.createElement('div');
            levelupDiv.className = 'level-up';
            levelupDiv.innerHTML = `<strong>★LEVEL UP★</strong><br>Lv.${gameState.level}になりました！`;
            document.body.appendChild(levelupDiv);
            
            setTimeout(() => {
                document.body.removeChild(levelupDiv);
            }, 3000);
        }
        
        // AP自動回復
        function recoverAP() {
            const now = Date.now();
            const timeDiff = now - gameState.lastActionTime;
            const minutesPassed = Math.floor(timeDiff / 60000);
            
            if (minutesPassed > 0 && gameState.ap < gameState.maxAp) {
                const recovery = Math.min(minutesPassed, gameState.maxAp - gameState.ap);
                gameState.ap += recovery;
                gameState.lastActionTime = now;
                updateDisplay();
                saveGameData();
            }
        }
        
        // 初期化
        window.onload = function() {
            loadGameData();
            
            // 1分ごとにAP回復チェック
            setInterval(recoverAP, 60000);
            
            // エナジータイマー更新
            setInterval(updateEnergyTimer, 1000);
        };
        
        // エナジータイマー更新
        function updateEnergyTimer() {
            if (gameState.ap >= gameState.maxAp) {
                document.getElementById('energy-timer').textContent = '満タン';
                return;
            }
            
            const nextRecovery = 60 - (Math.floor(Date.now() / 1000) % 60);
            document.getElementById('energy-timer').textContent = `次回復: ${nextRecovery}秒`;
        }
    </script>
</head>
<body>
    <div class="header">
        ★怪盗キングダム★
        <div style="font-size:7px;margin-top:1px;">
            〜伝説の宝を盗み出せ〜
        </div>
    </div>
    
    <div class="status-bar">
        <div class="status-item">
            Lv.<span id="level">12</span> 
        </div>
        <div class="status-item">
            EXP: <span id="exp">2450</span>/<span id="expToNext">3000</span>
        </div>
        <div class="status-item">
            💰<span id="coins">8,520</span>
        </div>
    </div>
    
    <div class="status-bar">
        <div class="status-item">
            HP: <div class="hp-bar"><div class="hp-fill"></div></div> <span id="hp">75/100</span>
        </div>
    </div>
    
    <div class="status-bar">
        <div class="status-item">
            AP: <div class="ap-bar"><div class="ap-fill"></div></div> <span id="ap">60/100</span>
        </div>
        <div class="energy-timer" id="energy-timer">次回復: 45秒</div>
    </div>
    
    <div class="nav">
        <a href="#home">ホーム</a>|<a href="#mission">ミッション</a>|<a href="#battle">バトル</a>|<a href="#gacha">ガチャ</a>|<a href="#cards">カード</a>
    </div>
    
    <div class="section">
        <div class="section-title">🎯 ミッション</div>
        
        <div class="mission-item">
            <div class="mission-title">銀行強盗</div>
            <div>難易度: ★★☆☆☆ 消費AP: 10</div>
            <div class="mission-reward">報酬: EXP+30, コイン+200</div>
            <button class="btn" onclick="doMission('銀行強盗', 10)">実行</button>
        </div>
        
        <div class="mission-item">
            <div class="mission-title">美術館侵入</div>
            <div>難易度: ★★★☆☆ 消費AP: 15</div>
            <div class="mission-reward">報酬: EXP+50, コイン+350</div>
            <button class="btn" onclick="doMission('美術館侵入', 15)">実行</button>
        </div>
        
        <div class="mission-item">
            <div class="mission-title">宝石店襲撃</div>
            <div>難易度: ★★★★☆ 消費AP: 20</div>
            <div class="mission-reward">報酬: EXP+80, コイン+500</div>
            <button class="btn" onclick="doMission('宝石店襲撃', 20)">実行</button>
        </div>
        
        <div class="mission-item">
            <div class="mission-title">王宮の秘宝</div>
            <div>難易度: ★★★★★ 消費AP: 30</div>
            <div class="mission-reward">報酬: EXP+120, コイン+800</div>
            <button class="btn" onclick="doMission('王宮の秘宝', 30)">実行</button>
        </div>
    </div>
    
    <div class="section">
        <div class="section-title">🎰 ガチャ</div>
        
        <div style="text-align: center; margin: 5px 0;">
            <button class="btn-silver" onclick="drawGacha('normal')">
                ノーマルガチャ<br>300コイン
            </button>
            <button class="btn-gold" onclick="drawGacha('premium')">
                プレミアムガチャ<br>1,000コイン
            </button>
        </div>
        
        <div style="font-size: 6px; text-align: center; color: #ccc;">
            ※レアカード排出率UP中！
        </div>
    </div>
    
    <div class="section">
        <div class="section-title">👥 仲間の怪盗</div>
        
        <div class="friend-item">
            <strong>怪盗シャドウ</strong> <span class="online">●オンライン</span><br>
            <div style="font-size: 6px;">Lv.15 | 最後のミッション: 王宮の秘宝</div>
        </div>
        
        <div class="friend-item">
            <strong>マスク・ド・ルージュ</strong> <span class="offline">●オフライン</span><br>
            <div style="font-size: 6px;">Lv.18 | 2時間前にアクセス</div>
        </div>
        
        <div class="friend-item">
            <strong>ナイトスティーラー</strong> <span class="online">●オンライン</span><br>
            <div style="font-size: 6px;">Lv.22 | バトル中...</div>
        </div>
    </div>
    
    <div class="section">
        <div class="section-title">🏆 所持カード</div>
        
        <div class="card card-rare">
            <div class="card-image">🎩</div>
            <div class="card-name">怪盗紳士</div>
            <div class="card-stats">攻撃:300 防御:250 [レア]</div>
        </div>
        
        <div class="card card-super-rare">
            <div class="card-image">👑</div>
            <div class="card-name">黄金仮面</div>
            <div class="card-stats">攻撃:500 防御:450 [SR]</div>
        </div>
        
        <div class="card">
            <div class="card-image">🕴</div>
            <div class="card-name">熟練泥棒</div>
            <div class="card-stats">攻撃:150 防御:120 [ノーマル]</div>
        </div>
        
        <div style="text-align: center; margin: 3px 0;">
            <button class="btn">カード強化</button>
            <button class="btn">デッキ編成</button>
        </div>
    </div>
    
    <div class="section">
        <div class="section-title">📰 お知らせ</div>
        <div style="font-size: 7px; line-height: 1.3;">
            ・新イベント「伝説の怪盗王選手権」開催中！<br>
            ・レアカード排出率2倍キャンペーン実施中<br>
            ・メンテナンス: 明日03:00-05:00<br>
            ・新カード「究極の怪盗皇帝」追加！
        </div>
    </div>
    
    <!-- 隠し要素（結果表示用） -->
    <div id="battle-result" class="battle-result" style="display: none;"></div>
    <div id="gacha-result" class="gacha-result" style="display: none;"></div>
    
    <div class="nav">
        <a href="#ranking">ランキング</a>|<a href="#event">イベント</a>|<a href="#shop">ショップ</a>|<a href="#help">ヘルプ</a>
    </div>
    
    <div class="footer">
        (C)2008 怪盗キングダム<br>
        ソーシャルカードバトルゲーム
    </div>
</body>
</html>
