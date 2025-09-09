<!DOCTYPE html>

<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>怪盗キングダム</title>
    <style>
        body {
            font-family: 'Courier New', monospace;
            font-size: 14px;
            background: linear-gradient(to bottom, #1a1a2e, #16213e);
            margin: 0;
            padding: 10px;
            max-width: 400px;
            margin: 0 auto;
            color: white;
            user-select: none;
        }

```
    .header {
        background: linear-gradient(to bottom, #d4af37, #b8860b);
        color: #000;
        text-align: center;
        padding: 15px;
        margin-bottom: 10px;
        font-size: 16px;
        font-weight: bold;
        border-radius: 8px;
        box-shadow: 2px 2px 8px rgba(0,0,0,0.5);
        animation: headerGlow 3s ease-in-out infinite;
    }
    
    @keyframes headerGlow {
        0%, 100% { box-shadow: 2px 2px 8px rgba(0,0,0,0.5); }
        50% { box-shadow: 2px 2px 15px rgba(212,175,55,0.6); }
    }
    
    .status-bar {
        background: #2c2c54;
        border: 1px solid #40407a;
        padding: 10px;
        margin-bottom: 8px;
        font-size: 12px;
        border-radius: 5px;
        box-shadow: inset 0 1px 3px rgba(0,0,0,0.3);
    }
    
    .status-item {
        display: inline-block;
        margin-right: 15px;
    }
    
    .hp-bar, .ap-bar, .exp-bar {
        width: 120px;
        height: 12px;
        background: #333;
        border: 1px solid #666;
        position: relative;
        display: inline-block;
        vertical-align: middle;
        border-radius: 6px;
        overflow: hidden;
    }
    
    .hp-fill {
        height: 100%;
        background: linear-gradient(to right, #ff4757, #ff3742);
        width: 75%;
        transition: width 0.5s ease;
    }
    
    .ap-fill {
        height: 100%;
        background: linear-gradient(to right, #2ed573, #20bf6b);
        width: 60%;
        transition: width 0.5s ease;
    }
    
    .exp-fill {
        height: 100%;
        background: linear-gradient(to right, #ffa502, #ff6348);
        width: 82%;
        transition: width 0.5s ease;
    }
    
    .section {
        background: #2c2c54;
        border: 1px solid #40407a;
        margin-bottom: 12px;
        padding: 12px;
        border-radius: 8px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    }
    
    .section-title {
        background: linear-gradient(to bottom, #5f27cd, #341f97);
        color: white;
        margin: -12px -12px 8px -12px;
        padding: 8px;
        font-size: 14px;
        font-weight: bold;
        text-align: center;
        border-radius: 8px 8px 0 0;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
    }
    
    .card {
        background: linear-gradient(to bottom, #3c3c3c, #2c2c2c);
        border: 1px solid #666;
        padding: 12px;
        margin: 8px 0;
        border-radius: 8px;
        position: relative;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    
    .card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.4);
    }
    
    .card-rare {
        border: 2px solid #ffd700;
        box-shadow: 0 0 10px rgba(255,215,0,0.5);
    }
    
    .card-super-rare {
        border: 2px solid #ff69b4;
        box-shadow: 0 0 10px rgba(255,105,180,0.5);
    }
    
    .card-ultra-rare {
        border: 2px solid #00ffff;
        box-shadow: 0 0 10px rgba(0,255,255,0.5);
        animation: ultraGlow 2s ease-in-out infinite;
    }
    
    @keyframes ultraGlow {
        0%, 100% { box-shadow: 0 0 10px rgba(0,255,255,0.5); }
        50% { box-shadow: 0 0 20px rgba(0,255,255,0.8); }
    }
    
    .card-name {
        font-weight: bold;
        font-size: 14px;
        color: #ffd700;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
    }
    
    .card-stats {
        font-size: 12px;
        color: #ccc;
        margin-top: 4px;
    }
    
    .card-image {
        width: 50px;
        height: 50px;
        background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
        border: 1px solid #333;
        float: left;
        margin-right: 15px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        box-shadow: inset 0 1px 3px rgba(255,255,255,0.2);
    }
    
    .btn {
        background: linear-gradient(to bottom, #ff6b6b, #ee5a52);
        color: white;
        border: 1px solid #c44569;
        padding: 8px 15px;
        font-size: 12px;
        margin: 4px 8px;
        border-radius: 5px;
        cursor: pointer;
        text-decoration: none;
        display: inline-block;
        transition: all 0.2s ease;
        font-family: inherit;
    }
    
    .btn:hover {
        background: linear-gradient(to bottom, #ee5a52, #ff6b6b);
        transform: translateY(-1px);
        box-shadow: 0 3px 6px rgba(0,0,0,0.3);
    }
    
    .btn:active {
        transform: translateY(0);
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
    }
    
    .btn:disabled {
        background: #666;
        cursor: not-allowed;
        opacity: 0.6;
    }
    
    .btn-gold {
        background: linear-gradient(to bottom, #ffd700, #daa520);
        color: #000;
        border: 1px solid #b8860b;
    }
    
    .btn-gold:hover {
        background: linear-gradient(to bottom, #daa520, #ffd700);
    }
    
    .btn-silver {
        background: linear-gradient(to bottom, #c0c0c0, #a0a0a0);
        color: #000;
        border: 1px solid #808080;
    }
    
    .btn-silver:hover {
        background: linear-gradient(to bottom, #a0a0a0, #c0c0c0);
    }
    
    .nav {
        background: #40407a;
        text-align: center;
        padding: 8px;
        margin: 8px 0;
        border-radius: 5px;
        box-shadow: inset 0 1px 3px rgba(0,0,0,0.3);
    }
    
    .nav a {
        color: #ddd;
        text-decoration: none;
        font-size: 12px;
        margin: 0 8px;
        transition: color 0.2s ease;
    }
    
    .nav a:hover {
        color: #fff;
    }
    
    .mission-item {
        background: #1a1a2e;
        border: 1px solid #0f3460;
        padding: 10px;
        margin: 8px 0;
        font-size: 12px;
        border-radius: 5px;
        transition: background 0.2s ease;
    }
    
    .mission-item:hover {
        background: #252547;
    }
    
    .mission-title {
        color: #70a1ff;
        font-weight: bold;
        margin-bottom: 4px;
    }
    
    .mission-reward {
        color: #ffa502;
        font-size: 10px;
    }
    
    .enemy-card {
        background: linear-gradient(to bottom, #4c4c4c, #3c3c3c);
        border: 1px solid #ff4757;
        padding: 10px;
        margin: 8px 0;
        border-radius: 5px;
    }
    
    .battle-result {
        background: #0c2461;
        border: 2px solid #40407a;
        padding: 15px;
        margin: 10px 0;
        text-align: center;
        border-radius: 8px;
        font-size: 14px;
        animation: slideIn 0.5s ease;
    }
    
    @keyframes slideIn {
        from { transform: translateY(-20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
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
        padding: 15px;
        margin: 10px 0;
        text-align: center;
        border-radius: 8px;
        font-weight: bold;
        animation: sparkle 2s infinite;
    }
    
    @keyframes sparkle {
        0%, 100% { box-shadow: 0 0 10px #ffd700; }
        50% { box-shadow: 0 0 25px #ffd700, 0 0 35px #ffd700; }
    }
    
    .notification {
        background: #ff4757;
        color: white;
        padding: 8px 15px;
        margin: 8px 0;
        border-radius: 5px;
        font-size: 12px;
        text-align: center;
        animation: notification 0.5s ease;
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 1000;
        max-width: 300px;
    }
    
    @keyframes notification {
        from { transform: translateX(-50%) translateY(-20px); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
    }
    
    .friend-item {
        background: #2c2c54;
        border: 1px solid #40407a;
        padding: 8px;
        margin: 6px 0;
        font-size: 12px;
        border-radius: 5px;
        transition: background 0.2s ease;
    }
    
    .friend-item:hover {
        background: #353570;
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
        padding: 10px;
        font-size: 10px;
        margin-top: 15px;
        border-top: 1px solid #40407a;
    }
    
    .energy-timer {
        color: #ffa502;
        font-size: 10px;
        font-weight: bold;
    }
    
    .level-up {
        background: linear-gradient(45deg, #ff9ff3, #f368e0);
        color: white;
        text-align: center;
        padding: 15px;
        margin: 10px 0;
        border-radius: 8px;
        animation: levelup 3s ease-in-out;
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 1000;
        box-shadow: 0 0 20px rgba(255,159,243,0.6);
    }
    
    @keyframes levelup {
        0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
        50% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
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
        cards: [
            {name: '怪盗紳士', rarity: 'rare', attack: 300, defense: 250, emoji: '🎩'},
            {name: '黄金仮面', rarity: 'super_rare', attack: 500, defense: 450, emoji: '👑'},
            {name: '熟練泥棒', rarity: 'normal', attack: 150, defense: 120, emoji: '🕴'}
        ],
        lastActionTime: Date.now()
    };
    
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
        
        // EXPバー更新
        const expPercent = (gameState.exp / gameState.expToNext) * 100;
        document.querySelector('.exp-fill').style.width = expPercent + '%';
        
        // ボタンの状態更新
        updateButtonStates();
    }
    
    // ボタンの状態更新
    function updateButtonStates() {
        const missionButtons = document.querySelectorAll('.mission-btn');
        missionButtons.forEach(btn => {
            const apCost = parseInt(btn.dataset.apCost);
            btn.disabled = gameState.ap < apCost;
        });
        
        // ガチャボタンの状態
        document.getElementById('normal-gacha').disabled = gameState.coins < 300;
        document.getElementById('premium-gacha').disabled = gameState.coins < 1000;
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
            gameState.cards.push(newCard);
            showCardGet(newCard);
        }
        
        showBattleResult(`${missionName}クリア！`, `EXP+${expGain} コイン+${coinGain}`);
        updateDisplay();
    }
    
    // レベルアップ
    function levelUp() {
        gameState.level++;
        gameState.exp = gameState.exp - gameState.expToNext;
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
        gameState.cards.push(newCard);
        showGachaResult(newCard);
        
        updateDisplay();
    }
    
    // ランダムカード生成
    function generateRandomCard(rareChance = 0.1) {
        const cardTemplates = [
            {name: '見習い怪盗', rarity: 'normal', attack: 100, defense: 80, emoji: '🎭'},
            {name: '熟練泥棒', rarity: 'normal', attack: 150, defense: 120, emoji: '🕴'},
            {name: '怪盗紳士', rarity: 'rare', attack: 300, defense: 250, emoji: '🎩'},
            {name: '影の暗殺者', rarity: 'rare', attack: 280, defense: 300, emoji: '🗡'},
            {name: '黄金仮面', rarity: 'super_rare', attack: 500, defense: 450, emoji: '👑'},
            {name: '伝説の怪盗王', rarity: 'ultra_rare', attack: 800, defense: 700, emoji: '💎'}
        ];
        
        let availableCards = cardTemplates.filter(card => card.rarity === 'normal');
        
        const roll = Math.random();
        if (roll < rareChance * 0.05) {
            availableCards = cardTemplates.filter(card => card.rarity === 'ultra_rare');
        } else if (roll < rareChance * 0.2) {
            availableCards = cardTemplates.filter(card => card.rarity === 'super_rare');
        } else if (roll < rareChance) {
            availableCards = cardTemplates.filter(card => card.rarity === 'rare');
        }
        
        const selected = availableCards[Math.floor(Math.random() * availableCards.length)];
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
        levelupDiv.innerHTML = `<strong>★LEVEL UP★</strong><br>Lv.${gameState.level}になりました！<br>HP・AP全回復！`;
        document.body.appendChild(levelupDiv);
        
        setTimeout(() => {
            if (document.body.contains(levelupDiv)) {
                document.body.removeChild(levelupDiv);
            }
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
            if (recovery > 0) {
                showNotification(`AP+${recovery}回復しました`);
            }
        }
    }
    
    // エナジータイマー更新
    function updateEnergyTimer() {
        if (gameState.ap >= gameState.maxAp) {
            document.getElementById('energy-timer').textContent = '満タン';
            return;
        }
        
        const nextRecovery = 60 - (Math.floor(Date.now() / 1000) % 60);
        document.getElementById('energy-timer').textContent = `次回復: ${nextRecovery}秒`;
    }
    
    // 初期化
    window.onload = function() {
        updateDisplay();
        
        // 1分ごとにAP回復チェック
        setInterval(recoverAP, 60000);
        
        // エナジータイマー更新
        setInterval(updateEnergyTimer, 1000);
    };
</script>
```

</head>
<body>
    <div class="header">
        ★怪盗キングダム★
        <div style="font-size:12px;margin-top:4px;">
            〜伝説の宝を盗み出せ〜
        </div>
    </div>

```
<div class="status-bar">
    <div class="status-item">
        Lv.<span id="level">12</span> 
    </div>
    <div class="status-item">
        💰<span id="coins">8,520</span>
    </div>
</div>

<div class="status-bar">
    <div class="status-item">
        EXP: <div class="exp-bar"><div class="exp-fill"></div></div> <span id="exp">2450</span>/<span id="expToNext">3000</span>
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
        <button class="btn mission-btn" data-ap-cost="10" onclick="doMission('銀行強盗', 10)">実行</button>
    </div>
    
    <div class="mission-item">
        <div class="mission-title">美術館侵入</div>
        <div>難易度: ★★★☆☆ 消費AP: 15</div>
        <div class="mission-reward">報酬: EXP+50, コイン+350</div>
        <button class="btn mission-btn" data-ap-cost="15" onclick="doMission('美術館侵入', 15)">実行</button>
    </div>
    
    <div class="mission-item">
        <div class="mission-title">宝石店襲撃</div>
        <div>難易度: ★★★★☆ 消費AP: 20</div>
        <div class="mission-reward">報酬: EXP+80, コイン+500</div>
        <button class="btn mission-btn" data-ap-cost="20" onclick="doMission('宝石店襲撃', 20)">実行</button>
    </div>
    
    <div class="mission-item">
        <div class="mission-title">王宮の秘宝</div>
        <div>難易度: ★★★★★ 消費AP: 30</div>
        <div class="mission-reward">報酬: EXP+120, コイン+800</div>
        <button class="btn mission-btn" data-ap-cost="30" onclick="doMission('王宮の秘宝', 30)">実行</button>
    </div>
</div>

<div class="section">
    <div class="section-title">🎰 ガチャ</div>
    
    <div style="text-align: center; margin: 10px 0;">
        <button class="btn-silver" id="normal-gacha" onclick="drawGacha('normal')">
            ノーマルガチャ<br>300コイン
        </button>
        <button class="btn-gold" id="premium-gacha" onclick="drawGacha('premium')">
            プレミアムガチャ<br>1,000コイン
        </button>
    </div>
    
    <div style="font-size: 10px; text-align: center; color: #ccc;">
        ※レアカード排出率UP中！
    </div>
</div>

<div class="section">
    <div class="section-title">👥 仲間の怪盗</div>
    
    <div class="friend-item">
        <strong>怪盗シャドウ</strong> <span class="online">●オンライン</span><br>
        <div style="font-size: 10px;">Lv.15 | 最後のミッション: 王宮の秘宝</div>
    </div>
    
    <div class="friend-item">
        <strong>マスク・ド・ルージュ</strong> <span class="offline">●オフライン</span><br>
        <div style="font-size: 10px;">Lv.18 | 2時間前にアクセス</div>
    </div>
    
    <div class="friend-item">
        <strong>ナイトスティーラー</strong> <span class="online">●オンライン</span><br>
        <div style="font-size: 10px;">Lv.22 | バトル中...</div>
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
    
    <div style="text-align: center; margin: 10px 0;">
        <button class="btn">カード強化</button>
        <button class="btn">デッキ編成</button>
    </div>
</div>

<div class="section">
    <div class="section-title">📰 お知らせ</div>
    <div style="font-size: 11px; line-height: 1.4;">
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
```

</body>
</html>