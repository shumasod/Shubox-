<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>キングダム 〜天下統一への道〜</title>
    <style>
        body {
            font-family: 'MS Gothic', 'Hiragino Sans GB', monospace;
            font-size: 14px;
            background: linear-gradient(to bottom, #2c1810, #1a0f08);
            margin: 0;
            padding: 10px;
            max-width: 400px;
            margin: 0 auto;
            color: #f4e6d0;
            user-select: none;
            position: relative;
        }
        
        body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1" fill="%23ffffff" opacity="0.1"/><circle cx="50" cy="40" r="0.5" fill="%23ffffff" opacity="0.08"/><circle cx="80" cy="70" r="1.5" fill="%23ffffff" opacity="0.06"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>') repeat;
            pointer-events: none;
            z-index: -1;
        }
        
        .header {
            background: linear-gradient(45deg, #8b0000, #dc143c, #b8860b);
            color: #fff;
            text-align: center;
            padding: 20px;
            margin-bottom: 15px;
            font-size: 18px;
            font-weight: bold;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.2);
            border: 2px solid #b8860b;
            animation: headerGlow 4s ease-in-out infinite;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
        }
        
        @keyframes headerGlow {
            0%, 100% { box-shadow: 0 5px 15px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.2); }
            50% { box-shadow: 0 5px 25px rgba(220,20,60,0.6), inset 0 1px 0 rgba(255,255,255,0.3); }
        }
        
        .status-bar {
            background: linear-gradient(to bottom, #3a2317, #2c1810);
            border: 2px solid #8b4513;
            padding: 12px;
            margin-bottom: 10px;
            font-size: 12px;
            border-radius: 8px;
            box-shadow: inset 0 2px 5px rgba(0,0,0,0.5);
        }
        
        .status-item {
            display: inline-block;
            margin-right: 15px;
            color: #d4af37;
            font-weight: bold;
        }
        
        .hp-bar, .ap-bar, .exp-bar {
            width: 120px;
            height: 14px;
            background: linear-gradient(to bottom, #1a1a1a, #000);
            border: 2px solid #8b4513;
            position: relative;
            display: inline-block;
            vertical-align: middle;
            border-radius: 7px;
            overflow: hidden;
            box-shadow: inset 0 2px 5px rgba(0,0,0,0.8);
        }
        
        .hp-fill {
            height: 100%;
            background: linear-gradient(to right, #dc143c, #ff4500);
            width: 75%;
            transition: width 0.8s ease;
            box-shadow: 0 0 10px rgba(220,20,60,0.5);
        }
        
        .ap-fill {
            height: 100%;
            background: linear-gradient(to right, #32cd32, #228b22);
            width: 60%;
            transition: width 0.8s ease;
            box-shadow: 0 0 10px rgba(50,205,50,0.5);
        }
        
        .exp-fill {
            height: 100%;
            background: linear-gradient(to right, #daa520, #ffd700);
            width: 82%;
            transition: width 0.8s ease;
            box-shadow: 0 0 10px rgba(218,165,32,0.5);
        }
        
        .section {
            background: linear-gradient(to bottom, #3a2317, #2c1810);
            border: 2px solid #8b4513;
            margin-bottom: 15px;
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 3px 8px rgba(0,0,0,0.6);
        }
        
        .section-title {
            background: linear-gradient(45deg, #8b0000, #dc143c);
            color: #fff;
            margin: -15px -15px 12px -15px;
            padding: 12px;
            font-size: 15px;
            font-weight: bold;
            text-align: center;
            border-radius: 10px 10px 0 0;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
            border-bottom: 2px solid #b8860b;
        }
        
        .card {
            background: linear-gradient(to bottom, #4a3528, #3a2317);
            border: 2px solid #8b4513;
            padding: 15px;
            margin: 10px 0;
            border-radius: 10px;
            position: relative;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .card:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 15px rgba(0,0,0,0.6);
        }
        
        .card-rare {
            border: 3px solid #ffd700;
            box-shadow: 0 0 15px rgba(255,215,0,0.6);
        }
        
        .card-super-rare {
            border: 3px solid #ff69b4;
            box-shadow: 0 0 15px rgba(255,105,180,0.6);
        }
        
        .card-ultra-rare {
            border: 3px solid #00ffff;
            box-shadow: 0 0 20px rgba(0,255,255,0.8);
            animation: ultraGlow 3s ease-in-out infinite;
        }
        
        @keyframes ultraGlow {
            0%, 100% { box-shadow: 0 0 20px rgba(0,255,255,0.8); }
            50% { box-shadow: 0 0 30px rgba(0,255,255,1), 0 0 40px rgba(0,255,255,0.6); }
        }
        
        .card-name {
            font-weight: bold;
            font-size: 15px;
            color: #d4af37;
            text-shadow: 1px 1px 3px rgba(0,0,0,0.7);
        }
        
        .card-stats {
            font-size: 12px;
            color: #ddd;
            margin-top: 6px;
        }
        
        .card-image {
            width: 55px;
            height: 55px;
            background: linear-gradient(45deg, #8b0000, #dc143c);
            border: 2px solid #b8860b;
            float: left;
            margin-right: 18px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 26px;
            box-shadow: inset 0 2px 5px rgba(255,255,255,0.2);
        }
        
        .btn {
            background: linear-gradient(to bottom, #8b0000, #dc143c);
            color: #fff;
            border: 2px solid #b8860b;
            padding: 10px 18px;
            font-size: 12px;
            margin: 6px 10px;
            border-radius: 8px;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            transition: all 0.3s ease;
            font-family: inherit;
            font-weight: bold;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
        }
        
        .btn:hover {
            background: linear-gradient(to bottom, #dc143c, #8b0000);
            transform: translateY(-2px);
            box-shadow: 0 4px 10px rgba(0,0,0,0.5);
        }
        
        .btn:active {
            transform: translateY(0);
            box-shadow: 0 2px 5px rgba(0,0,0,0.5);
        }
        
        .btn:disabled {
            background: #555;
            cursor: not-allowed;
            opacity: 0.5;
            border-color: #666;
        }
        
        .btn-gold {
            background: linear-gradient(to bottom, #daa520, #ffd700);
            color: #000;
            border: 2px solid #b8860b;
        }
        
        .btn-gold:hover {
            background: linear-gradient(to bottom, #ffd700, #daa520);
        }
        
        .btn-silver {
            background: linear-gradient(to bottom, #708090, #c0c0c0);
            color: #000;
            border: 2px solid #8b4513;
        }
        
        .btn-silver:hover {
            background: linear-gradient(to bottom, #c0c0c0, #708090);
        }
        
        .nav {
            background: linear-gradient(to bottom, #4a3528, #3a2317);
            text-align: center;
            padding: 10px;
            margin: 10px 0;
            border-radius: 8px;
            border: 2px solid #8b4513;
            box-shadow: inset 0 2px 5px rgba(0,0,0,0.5);
        }
        
        .nav a {
            color: #d4af37;
            text-decoration: none;
            font-size: 12px;
            margin: 0 10px;
            transition: color 0.3s ease;
            font-weight: bold;
        }
        
        .nav a:hover {
            color: #fff;
        }
        
        .mission-item {
            background: linear-gradient(to bottom, #2c1810, #1a0f08);
            border: 2px solid #8b4513;
            padding: 12px;
            margin: 10px 0;
            font-size: 12px;
            border-radius: 8px;
            transition: background 0.3s ease;
        }
        
        .mission-item:hover {
            background: linear-gradient(to bottom, #3a2317, #2c1810);
        }
        
        .mission-title {
            color: #dc143c;
            font-weight: bold;
            margin-bottom: 6px;
            font-size: 14px;
        }
        
        .mission-reward {
            color: #daa520;
            font-size: 11px;
        }
        
        .battle-result {
            background: linear-gradient(45deg, #1a0f08, #2c1810);
            border: 3px solid #8b4513;
            padding: 20px;
            margin: 15px 0;
            text-align: center;
            border-radius: 10px;
            font-size: 15px;
            animation: slideIn 0.6s ease;
            box-shadow: 0 5px 15px rgba(0,0,0,0.7);
        }
        
        @keyframes slideIn {
            from { transform: translateY(-30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        
        .victory {
            border-color: #32cd32;
            background: linear-gradient(45deg, #0a3f0a, #1a5f1a);
            color: #90ee90;
        }
        
        .defeat {
            border-color: #dc143c;
            background: linear-gradient(45deg, #3f0a0a, #5f1a1a);
            color: #ffb3b3;
        }
        
        .gacha-result {
            background: linear-gradient(45deg, #daa520, #ffd700);
            color: #000;
            padding: 20px;
            margin: 15px 0;
            text-align: center;
            border-radius: 10px;
            font-weight: bold;
            animation: sparkle 3s infinite;
            border: 3px solid #b8860b;
        }
        
        @keyframes sparkle {
            0%, 100% { box-shadow: 0 0 15px #ffd700; }
            50% { box-shadow: 0 0 30px #ffd700, 0 0 45px #ffd700; }
        }
        
        .notification {
            background: linear-gradient(45deg, #dc143c, #8b0000);
            color: #fff;
            padding: 12px 20px;
            margin: 10px 0;
            border-radius: 8px;
            font-size: 13px;
            text-align: center;
            animation: notification 0.6s ease;
            position: fixed;
            top: 30px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 1000;
            max-width: 320px;
            border: 2px solid #b8860b;
            box-shadow: 0 5px 15px rgba(0,0,0,0.8);
        }
        
        @keyframes notification {
            from { transform: translateX(-50%) translateY(-30px); opacity: 0; }
            to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
        
        .friend-item {
            background: linear-gradient(to bottom, #3a2317, #2c1810);
            border: 2px solid #8b4513;
            padding: 10px;
            margin: 8px 0;
            font-size: 12px;
            border-radius: 8px;
            transition: background 0.3s ease;
        }
        
        .friend-item:hover {
            background: linear-gradient(to bottom, #4a3528, #3a2317);
        }
        
        .online {
            color: #32cd32;
        }
        
        .offline {
            color: #888;
        }
        
        .footer {
            background: linear-gradient(to bottom, #2c1810, #1a0f08);
            color: #8b4513;
            text-align: center;
            padding: 12px;
            font-size: 10px;
            margin-top: 20px;
            border-top: 2px solid #8b4513;
        }
        
        .energy-timer {
            color: #daa520;
            font-size: 11px;
            font-weight: bold;
        }
        
        .level-up {
            background: linear-gradient(45deg, #daa520, #ffd700);
            color: #000;
            text-align: center;
            padding: 20px;
            margin: 15px 0;
            border-radius: 10px;
            animation: levelup 4s ease-in-out;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 1000;
            box-shadow: 0 0 30px rgba(255,215,0,0.8);
            border: 3px solid #b8860b;
        }
        
        @keyframes levelup {
            0% { transform: translate(-50%, -50%) scale(0.7); opacity: 0; }
            30% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
            70% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
        
        .rank-badge {
            display: inline-block;
            background: linear-gradient(45deg, #8b0000, #dc143c);
            color: #fff;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 10px;
            margin-left: 5px;
            border: 1px solid #b8860b;
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
            gold: 8520,
            generals: [
                {name: '信', rarity: 'rare', attack: 300, defense: 250, emoji: '⚔️'},
                {name: '王騎', rarity: 'ultra_rare', attack: 800, defense: 700, emoji: '👑'},
                {name: '蒙恬', rarity: 'super_rare', attack: 500, defense: 450, emoji: '🛡️'}
            ],
            lastActionTime: Date.now()
        };
        
        // 表示更新
        function updateDisplay() {
            document.getElementById('level').textContent = gameState.level;
            document.getElementById('exp').textContent = gameState.exp;
            document.getElementById('expToNext').textContent = gameState.expToNext;
            document.getElementById('gold').textContent = gameState.gold.toLocaleString();
            
            // HPバー更新
            const hpPercent = (gameState.hp / gameState.maxHp) * 100;
            document.querySelector('.hp-fill').style.width = hpPercent + '%';
            document.getElementById('hp').textContent = `${gameState.hp}/${gameState.maxHp}`;
            
            // APバー更新
            const apPercent = (gameState.ap / gameState.maxAp) * 100;
            document.querySelector('.ap-fill').style.width = apPercent + '%';
            document.getElementById('ap').textContent = `${gameState.ap}/${gameState.maxAp}`;
            
            // EXPバー更新
            const expPercent = (gameState.exp / gameState.expToNext) * 100;
            document.querySelector('.exp-fill').style.width = expPercent + '%';
            
            // ボタンの状態更新
            updateButtonStates();
        }
        
        // ボタンの状態更新
        function updateButtonStates() {
            const battleButtons = document.querySelectorAll('.battle-btn');
            battleButtons.forEach(btn => {
                const apCost = parseInt(btn.dataset.apCost);
                btn.disabled = gameState.ap < apCost;
            });
            
            // 召集ボタンの状態
            document.getElementById('normal-summon').disabled = gameState.gold < 500;
            document.getElementById('premium-summon').disabled = gameState.gold < 2000;
        }
        
        // 戦闘実行
        function doBattle(battleName, apCost) {
            if (gameState.ap < apCost) {
                showNotification('兵力が不足しています！');
                return;
            }
            
            gameState.ap -= apCost;
            const expGain = Math.floor(Math.random() * 80) + 40;
            const goldGain = Math.floor(Math.random() * 500) + 200;
            
            gameState.exp += expGain;
            gameState.gold += goldGain;
            
            // レベルアップチェック
            if (gameState.exp >= gameState.expToNext) {
                levelUp();
            }
            
            // 武将入手チャンス
            if (Math.random() < 0.25) {
                const newGeneral = generateRandomGeneral();
                gameState.generals.push(newGeneral);
                showGeneralGet(newGeneral);
            }
            
            showBattleResult(`${battleName}勝利！`, `経験値+${expGain} 金+${goldGain}`);
            updateDisplay();
        }
        
        // レベルアップ
        function levelUp() {
            gameState.level++;
            gameState.exp = gameState.exp - gameState.expToNext;
            gameState.expToNext = gameState.level * 300;
            gameState.maxHp += 15;
            gameState.maxAp += 8;
            gameState.hp = gameState.maxHp; // 全回復
            gameState.ap = gameState.maxAp;
            
            showLevelUp();
        }
        
        // 武将召集実行
        function summonGeneral(type) {
            let cost = 0;
            let rareChance = 0;
            
            switch(type) {
                case 'normal':
                    cost = 500;
                    rareChance = 0.15;
                    break;
                case 'premium':
                    cost = 2000;
                    rareChance = 0.4;
                    break;
            }
            
            if (gameState.gold < cost) {
                showNotification('金が不足しています！');
                return;
            }
            
            gameState.gold -= cost;
            const newGeneral = generateRandomGeneral(rareChance);
            gameState.generals.push(newGeneral);
            showSummonResult(newGeneral);
            
            updateDisplay();
        }
        
        // ランダム武将生成
        function generateRandomGeneral(rareChance = 0.15) {
            const generalTemplates = [
                {name: '歩兵隊長', rarity: 'normal', attack: 120, defense: 100, emoji: '🗡️'},
                {name: '騎兵隊長', rarity: 'normal', attack: 180, defense: 140, emoji: '🐎'},
                {name: '信', rarity: 'rare', attack: 350, defense: 280, emoji: '⚔️'},
                {name: '羌瘣', rarity: 'rare', attack: 320, defense: 350, emoji: '🗡️'},
                {name: '蒙恬', rarity: 'super_rare', attack: 520, defense: 480, emoji: '🛡️'},
                {name: '楊端和', rarity: 'super_rare', attack: 550, defense: 450, emoji: '👸'},
                {name: '王騎', rarity: 'ultra_rare', attack: 850, defense: 750, emoji: '👑'},
                {name: '廉頗', rarity: 'ultra_rare', attack: 900, defense: 800, emoji: '⚡'}
            ];
            
            let availableGenerals = generalTemplates.filter(general => general.rarity === 'normal');
            
            const roll = Math.random();
            if (roll < rareChance * 0.08) {
                availableGenerals = generalTemplates.filter(general => general.rarity === 'ultra_rare');
            } else if (roll < rareChance * 0.25) {
                availableGenerals = generalTemplates.filter(general => general.rarity === 'super_rare');
            } else if (roll < rareChance) {
                availableGenerals = generalTemplates.filter(general => general.rarity === 'rare');
            }
            
            const selected = availableGenerals[Math.floor(Math.random() * availableGenerals.length)];
            return {...selected, id: Date.now() + Math.random()};
        }
        
        // 通知表示
        function showNotification(message) {
            const notification = document.createElement('div');
            notification.className = 'notification';
            notification.textContent = message;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 3500);
        }
        
        // 戦闘結果表示
        function showBattleResult(title, description) {
            const result = document.getElementById('battle-result');
            result.innerHTML = `<strong>${title}</strong><br>${description}`;
            result.className = 'battle-result victory';
            result.style.display = 'block';
            
            setTimeout(() => {
                result.style.display = 'none';
            }, 4000);
        }
        
        // 召集結果表示
        function showSummonResult(general) {
            const result = document.getElementById('summon-result');
            result.innerHTML = `<strong>新武将登場！</strong><br>${general.emoji} ${general.name}<br>攻撃力:${general.attack} 防御力:${general.defense}`;
            result.style.display = 'block';
            
            setTimeout(() => {
                result.style.display = 'none';
            }, 5000);
        }
        
        // 武将獲得表示
        function showGeneralGet(general) {
            showNotification(`${general.emoji} ${general.name}が仲間になりました！`);
        }
        
        // レベルアップ表示
        function showLevelUp() {
            const levelupDiv = document.createElement('div');
            levelupDiv.className = 'level-up';
            levelupDiv.innerHTML = `<strong>★ 階級昇格 ★</strong><br>Lv.${gameState.level}になりました！<br>体力・兵力全回復！`;
            document.body.appendChild(levelupDiv);
            
            setTimeout(() => {
                if (document.body.contains(levelupDiv)) {
                    document.body.removeChild(levelupDiv);
                }
            }, 4000);
        }
        
        // AP自動回復
        function recoverAP() {
            const now = Date.now();
            const timeDiff = now - gameState.lastActionTime;
            const minutesPassed = Math.floor(timeDiff / 60000);
            
            if (minutesPassed > 0 && gameState.ap < gameState.maxAp) {
                const recovery = Math.min(minutesPassed * 2, gameState.maxAp - gameState.ap);
                gameState.ap += recovery;
                gameState.lastActionTime = now;
                updateDisplay();
                if (recovery > 0) {
                    showNotification(`兵力+${recovery}回復しました`);
                }
            }
        }
        
        // エナジータイマー更新
        function updateEnergyTimer() {
            if (gameState.ap >= gameState.maxAp) {
                document.getElementById('energy-timer').textContent = '満タン';
                return;
            }
            
            const nextRecovery = 30 - (Math.floor(Date.now() / 1000) % 30);
            document.getElementById('energy-timer').textContent = `次回復: ${nextRecovery}秒`;
        }
        
        // 初期化
        window.onload = function() {
            updateDisplay();
            
            // 30秒ごとにAP回復チェック
            setInterval(recoverAP, 30000);
            
            // エナジータイマー更新
            setInterval(updateEnergyTimer, 1000);
        };
    </script>
</head>
<body>
    <div class="header">
        ★ キングダム ★
        <div style="font-size:13px;margin-top:6px;">
            〜天下統一への道〜
        </div>
    </div>
    
    <div class="status-bar">
        <div class="status-item">
            階級Lv.<span id="level">12</span> 
            <span class="rank-badge">将軍</span>
        </div>
        <div class="status-item">
            💰<span id="gold">8,520</span>
        </div>
    </div>
    
    <div class="status-bar">
        <div class="status-item">
            経験値: <div class="exp-bar"><div class="exp-fill"></div></div> <span id="exp">2450</span>/<span id="expToNext">3000</span>
        </div>
    </div>
    
    <div class="status-bar">
        <div class="status-item">
            体力: <div class="hp-bar"><div class="hp-fill"></div></div> <span id="hp">75/100</span>
        </div>
    </div>
    
    <div class="status-bar">
        <div class="status-item">
            兵力: <div class="ap-bar"><div class="ap-fill"></div></div> <span id="ap">60/100</span>
        </div>
        <div class="energy-timer" id="energy-timer">次回復: 25秒</div>
    </div>
    
    <div class="nav">
        <a href="#home">本陣</a>|<a href="#battle">戦場</a>|<a href="#summon">武将召集</a>|<a href="#generals">武将</a>|<a href="#strategy">戦略</a>
    </div>
    
    <div class="section">
        <div class="section-title">⚔️ 戦場</div>
        
        <div class="mission-item">
            <div class="mission-title">国境の小競り合い</div>
            <div>難易度: ★★☆☆☆ 消費兵力: 12</div>
            <div class="mission-reward">報酬: 経験値+45, 金+300</div>
            <button class="btn battle-btn" data-ap-cost="12" onclick="doBattle('国境の小競り合い', 12)">出陣</button>
        </div>
        
        <div class="mission-item">
            <div class="mission-title">城塞攻略戦</div>
            <div>難易度: ★★★☆☆ 消費兵力: 18</div>
            <div class="mission-reward">報酬: 経験値+70, 金+500</div>
            <button class="btn battle-btn" data-ap-cost="18" onclick="doBattle('城塞攻略戦', 18)">出陣</button>
        </div>
        
        <div class="mission-item">
            <div class="mission-title">大軍団決戦</div>
            <div>難易度: ★★★★☆ 消費兵力: 25</div>
            <div class="mission-reward">報酬: 経験値+100, 金+750</div>
            <button class="btn battle-btn" data-ap-cost="25" onclick="doBattle('大軍団決戦', 25)">出陣</button>
        </div>
        
        <div class="mission-item">
            <div class="mission-title">王都攻城戦</div>
            <div>難易度: ★★★★★ 消費兵力: 35</div>
            <div class="mission-reward">報酬: 経験値+150, 金+1200</div>
            <button class="btn battle-btn" data-ap-cost="35" onclick="doBattle('王都攻城戦', 35)">出陣</button>
        </div>
    </div>
    
    <div class="section">
        <div class="section-title">🏛️ 武将召集</div>
        
        <div style="text-align: center; margin: 15px 0;">
            <button class="btn-silver" id="normal-summon" onclick="summonGeneral('normal')">
                一般召集<br>500金
            </button>
            <button class="btn-gold" id="premium-summon" onclick="summonGeneral('premium')">
                特別召集<br>2,000金
            </button>
        </div>
        
        <div style="font-size: 11px; text-align: center; color: #daa520;">
            ※伝説武将排出率UP開催中！
        </div>
    </div>
    
    <div class="section">
        <div class="section-title">👥 同盟軍</div>
        
        <div class="friend-item">
            <strong>李牧</strong> <span class="online">●出陣中</span><br>
            <div style="font-size: 11px;">階級Lv.18 | 最新戦果: 王都攻城戦</div>
        </div>
        
        <div class="friend-item">
            <strong>昌平君</strong> <span class="offline">●待機中</span><br>
            <div style="font-size: 11px;">階級Lv.22 | 3時間前にアクセス</div>
        </div>
        
        <div class="friend-item">
            <strong>桓騎</strong> <span class="online">●出陣中</span><br>
            <div style="font-size: 11px;">階級Lv.25 | 大軍団決戦中...</div>
        </div>
    </div>
    
    <div class="section">
        <div class="section-title">🏆 配下武将</div>
        
        <div class="card card-rare">
            <div class="card-image">⚔️</div>
            <div class="card-name">信</div>
            <div class="card-stats">攻撃力:350 防御力:280 [レア]</div>
        </div>
        
        <div class="card card-ultra-rare">
            <div class="card-image">👑</div>
            <div class="card-name">王騎</div>
            <div class="card-stats">攻撃力:850 防御力:750 [伝説]</div>
        </div>
        
        <div class="card card-super-rare">
            <div class="card-image">🛡️</div>
            <div class="card-name">蒙恬</div>
            <div class="card-stats">攻撃力:520 防御力:480 [超レア]</div>
        </div>
        
        <div style="text-align: center; margin: 15px 0;">
            <button class="btn">武将強化</button>
            <button class="btn">編成変更</button>
        </div>
    </div>
    
    <div class="section">
        <div class="section-title">📜 軍報</div>
        <div style="font-size: 12px; line-height: 1.5;">
            ・新イベント「合従軍襲来」開催中！<br>
            ・伝説武将「白起」期間限定登場<br>
            ・メンテナンス: 明日04:00-06:00<br>
            ・新戦場「函谷関の戦い」追加！
        </div>
    </div>
    
    <!-- 隠し要素（結果表示用） -->
    <div id="battle-result" class="battle-result" style="display: none;"></div>
    <div id="summon-result" class="gacha-result" style="display: none;"></div>
    
    <div class="nav">
        <a href="#ranking">戦績</a>|<a href="#event">イベント</a>|<a href="#shop">軍需品</a>|<a href="#help">戦術指南</a>
    </div>
    
    <div class="footer">
        (C)2019 キングダム 〜天下統一への道〜<br>
        戦略シミュレーションゲーム
    </div>
</body>
</html>
