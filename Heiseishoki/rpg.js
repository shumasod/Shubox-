<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>クロニクル・オブ・レジェンド</title>
    <style>
        body {
            font-family: 'Courier New', monospace;
            font-size: 14px;
            background: linear-gradient(to bottom, #0f0f23, #1a1a3a);
            margin: 0;
            padding: 10px;
            max-width: 420px;
            margin: 0 auto;
            color: #e6e6fa;
            user-select: none;
        }
        
        .game-screen {
            background: linear-gradient(to bottom, #2a2a4a, #1a1a3a);
            border: 3px solid #4a4a6a;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.6);
        }
        
        .title-screen {
            text-align: center;
            padding: 30px;
            background: linear-gradient(45deg, #4a148c, #7b1fa2, #ad1457);
            border-radius: 10px;
            margin-bottom: 15px;
        }
        
        .title-text {
            font-size: 20px;
            font-weight: bold;
            color: #fff;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
            margin-bottom: 10px;
        }
        
        .subtitle {
            font-size: 12px;
            color: #e1bee7;
            margin-bottom: 20px;
        }
        
        .character-panel {
            background: linear-gradient(to bottom, #3a3a5a, #2a2a4a);
            border: 2px solid #5a5a7a;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 10px;
        }
        
        .character-name {
            font-size: 16px;
            font-weight: bold;
            color: #ffd700;
            margin-bottom: 8px;
        }
        
        .character-job {
            font-size: 12px;
            color: #98fb98;
            margin-bottom: 8px;
        }
        
        .stat-bar {
            width: 100%;
            height: 16px;
            background: #1a1a1a;
            border: 1px solid #4a4a4a;
            border-radius: 8px;
            overflow: hidden;
            margin: 4px 0;
            position: relative;
        }
        
        .hp-bar {
            height: 100%;
            background: linear-gradient(to right, #ff4444, #ff6666);
            transition: width 0.5s ease;
        }
        
        .mp-bar {
            height: 100%;
            background: linear-gradient(to right, #4444ff, #6666ff);
            transition: width 0.5s ease;
        }
        
        .exp-bar {
            height: 100%;
            background: linear-gradient(to right, #44ff44, #66ff66);
            transition: width 0.5s ease;
        }
        
        .stat-text {
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            line-height: 16px;
            font-size: 11px;
            color: #fff;
            text-shadow: 1px 1px 1px rgba(0,0,0,0.8);
        }
        
        .menu-screen {
            display: none;
        }
        
        .menu-button {
            background: linear-gradient(to bottom, #5a5a7a, #4a4a6a);
            color: #fff;
            border: 2px solid #7a7a9a;
            padding: 12px 20px;
            margin: 5px;
            border-radius: 6px;
            cursor: pointer;
            font-family: inherit;
            font-size: 13px;
            text-align: center;
            transition: all 0.2s ease;
            display: block;
            width: calc(100% - 10px);
        }
        
        .menu-button:hover {
            background: linear-gradient(to bottom, #6a6a8a, #5a5a7a);
            transform: translateY(-1px);
        }
        
        .battle-screen {
            display: none;
            min-height: 400px;
        }
        
        .enemy-area {
            background: linear-gradient(to bottom, #4a2a2a, #3a1a1a);
            border: 2px solid #6a4a4a;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin-bottom: 15px;
        }
        
        .enemy-sprite {
            font-size: 48px;
            margin-bottom: 10px;
        }
        
        .enemy-name {
            font-size: 16px;
            color: #ff6666;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .battle-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin-top: 15px;
        }
        
        .action-button {
            background: linear-gradient(to bottom, #2a4a2a, #1a3a1a);
            color: #fff;
            border: 2px solid #4a6a4a;
            padding: 15px;
            border-radius: 6px;
            cursor: pointer;
            font-family: inherit;
            font-size: 13px;
            transition: all 0.2s ease;
        }
        
        .action-button:hover {
            background: linear-gradient(to bottom, #3a5a3a, #2a4a2a);
        }
        
        .action-button:disabled {
            background: #333;
            color: #666;
            cursor: not-allowed;
            border-color: #555;
        }
        
        .dungeon-screen {
            display: none;
        }
        
        .dungeon-map {
            background: linear-gradient(to bottom, #2a2a2a, #1a1a1a);
            border: 2px solid #4a4a4a;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin-bottom: 15px;
            min-height: 200px;
        }
        
        .current-location {
            font-size: 18px;
            color: #ffd700;
            margin-bottom: 15px;
        }
        
        .location-description {
            font-size: 12px;
            color: #ccc;
            margin-bottom: 20px;
            line-height: 1.4;
        }
        
        .direction-buttons {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 5px;
            margin: 10px 0;
        }
        
        .direction-button {
            background: linear-gradient(to bottom, #4a4a2a, #3a3a1a);
            color: #fff;
            border: 2px solid #6a6a4a;
            padding: 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
        }
        
        .direction-button:hover {
            background: linear-gradient(to bottom, #5a5a3a, #4a4a2a);
        }
        
        .log-area {
            background: #1a1a1a;
            border: 2px solid #3a3a3a;
            border-radius: 6px;
            padding: 10px;
            height: 100px;
            overflow-y: auto;
            font-size: 11px;
            line-height: 1.3;
            margin-top: 10px;
        }
        
        .log-entry {
            margin-bottom: 3px;
            padding: 2px 0;
        }
        
        .log-battle {
            color: #ff6666;
        }
        
        .log-exp {
            color: #66ff66;
        }
        
        .log-item {
            color: #66aaff;
        }
        
        .inventory-screen {
            display: none;
        }
        
        .inventory-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin: 15px 0;
        }
        
        .item-slot {
            background: linear-gradient(to bottom, #3a3a3a, #2a2a2a);
            border: 2px solid #5a5a5a;
            border-radius: 6px;
            padding: 10px;
            text-align: center;
            font-size: 12px;
        }
        
        .item-name {
            color: #ffd700;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .item-effect {
            color: #ccc;
            font-size: 10px;
        }
        
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            z-index: 1000;
        }
        
        .modal-content {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(to bottom, #2a2a4a, #1a1a3a);
            border: 3px solid #4a4a6a;
            border-radius: 8px;
            padding: 20px;
            max-width: 300px;
            text-align: center;
        }
        
        .close-button {
            background: linear-gradient(to bottom, #6a2a2a, #5a1a1a);
            color: #fff;
            border: 2px solid #8a4a4a;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 15px;
        }
        
        .job-selection {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin: 15px 0;
        }
        
        .job-card {
            background: linear-gradient(to bottom, #3a3a5a, #2a2a4a);
            border: 2px solid #5a5a7a;
            border-radius: 8px;
            padding: 15px;
            cursor: pointer;
            text-align: center;
            transition: all 0.2s ease;
        }
        
        .job-card:hover {
            transform: translateY(-2px);
            border-color: #7a7a9a;
        }
        
        .job-card.selected {
            border-color: #ffd700;
            box-shadow: 0 0 10px rgba(255,215,0,0.5);
        }
        
        .job-name {
            font-weight: bold;
            color: #ffd700;
            margin-bottom: 8px;
        }
        
        .job-description {
            font-size: 11px;
            color: #ccc;
            line-height: 1.3;
        }
        
        .level-up-animation {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(45deg, #ffd700, #ffed4e);
            color: #000;
            padding: 20px;
            border-radius: 10px;
            font-weight: bold;
            z-index: 1001;
            animation: levelUp 2s ease-in-out;
        }
        
        @keyframes levelUp {
            0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
            50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
    </style>
    <script>
        // ゲーム状態
        let gameState = {
            currentScreen: 'title',
            player: {
                name: 'アルト',
                job: null,
                level: 1,
                hp: 100,
                maxHp: 100,
                mp: 50,
                maxMp: 50,
                exp: 0,
                expToNext: 100,
                attack: 15,
                defense: 10,
                magic: 8,
                speed: 12
            },
            currentDungeon: 'forest',
            dungeonLevel: 1,
            inventory: [
                {name: 'ポーション', effect: 'HP+50', count: 3},
                {name: 'マナポーション', effect: 'MP+30', count: 2}
            ],
            battleLog: [],
            currentEnemy: null,
            inBattle: false
        };
        
        // ジョブ定義
        const jobs = {
            warrior: {
                name: '戦士',
                description: '高い攻撃力と防御力を持つ前衛職',
                hpMod: 1.3,
                mpMod: 0.7,
                attackMod: 1.4,
                defenseMod: 1.3,
                magicMod: 0.6,
                speedMod: 0.9,
                skills: ['パワーアタック', 'ガード']
            },
            mage: {
                name: '魔法使い',
                description: '強力な魔法を使う後衛職',
                hpMod: 0.8,
                mpMod: 1.5,
                attackMod: 0.7,
                defenseMod: 0.8,
                magicMod: 1.6,
                speedMod: 1.1,
                skills: ['ファイアボール', 'ヒール']
            },
            rogue: {
                name: '盗賊',
                description: '素早さに特化した技巧職',
                hpMod: 0.9,
                mpMod: 1.0,
                attackMod: 1.2,
                defenseMod: 0.9,
                magicMod: 1.0,
                speedMod: 1.5,
                skills: ['クイックアタック', '毒塗り']
            },
            paladin: {
                name: 'パラディン',
                description: 'バランスの取れた聖騎士',
                hpMod: 1.2,
                mpMod: 1.1,
                attackMod: 1.1,
                defenseMod: 1.2,
                magicMod: 1.2,
                speedMod: 1.0,
                skills: ['ホーリーストライク', 'プロテクション']
            }
        };
        
        // ダンジョン定義
        const dungeons = {
            forest: {
                name: '迷いの森',
                description: '古い森の奥深く。魔物たちが潜んでいる。',
                enemies: ['ゴブリン', '森オオカミ', 'スライム'],
                encounterRate: 0.3
            },
            cave: {
                name: '暗闇の洞窟',
                description: '湿った洞窟。より強い敵が待ち受けている。',
                enemies: ['スケルトン', 'バット', 'ストーンゴーレム'],
                encounterRate: 0.4
            },
            tower: {
                name: '古の塔',
                description: '謎に満ちた塔。最強の敵が頂上で待っている。',
                enemies: ['リッチ', 'ドラゴン', 'デーモン'],
                encounterRate: 0.5
            }
        };
        
        // 敵定義
        const enemies = {
            'ゴブリン': {sprite: '👹', hp: 60, attack: 18, defense: 8, exp: 25, gold: 15},
            '森オオカミ': {sprite: '🐺', hp: 80, attack: 22, defense: 12, exp: 35, gold: 20},
            'スライム': {sprite: '💧', hp: 40, attack: 15, defense: 5, exp: 20, gold: 10},
            'スケルトン': {sprite: '💀', hp: 120, attack: 35, defense: 20, exp: 60, gold: 40},
            'バット': {sprite: '🦇', hp: 70, attack: 28, defense: 10, exp: 45, gold: 25},
            'ストーンゴーレム': {sprite: '🗿', hp: 200, attack: 45, defense: 35, exp: 100, gold: 80},
            'リッチ': {sprite: '☠️', hp: 300, attack: 60, defense: 40, exp: 200, gold: 150},
            'ドラゴン': {sprite: '🐲', hp: 500, attack: 80, defense: 60, exp: 350, gold: 300},
            'デーモン': {sprite: '😈', hp: 400, attack: 75, defense: 50, exp: 280, gold: 200}
        };
        
        // 画面切り替え
        function showScreen(screenName) {
            const screens = ['title', 'menu', 'battle', 'dungeon', 'inventory'];
            screens.forEach(screen => {
                const element = document.querySelector(`.${screen}-screen`);
                if (element) {
                    element.style.display = screen === screenName ? 'block' : 'none';
                }
            });
            gameState.currentScreen = screenName;
            
            if (screenName === 'menu') {
                updateCharacterDisplay();
            } else if (screenName === 'dungeon') {
                updateDungeonDisplay();
            } else if (screenName === 'inventory') {
                updateInventoryDisplay();
            }
        }
        
        // ゲーム開始
        function startGame() {
            showJobSelection();
        }
        
        // ジョブ選択
        function showJobSelection() {
            const modal = document.getElementById('jobModal');
            modal.style.display = 'block';
        }
        
        function selectJob(jobKey) {
            // 選択状態をクリア
            document.querySelectorAll('.job-card').forEach(card => {
                card.classList.remove('selected');
            });
            
            // 選択したジョブをハイライト
            event.target.closest('.job-card').classList.add('selected');
            
            // ジョブを設定
            gameState.player.job = jobKey;
            applyJobStats();
        }
        
        function confirmJobSelection() {
            if (!gameState.player.job) {
                alert('ジョブを選択してください');
                return;
            }
            
            document.getElementById('jobModal').style.display = 'none';
            showScreen('menu');
        }
        
        // ジョブ能力値適用
        function applyJobStats() {
            const job = jobs[gameState.player.job];
            const player = gameState.player;
            
            player.maxHp = Math.floor(100 * job.hpMod);
            player.hp = player.maxHp;
            player.maxMp = Math.floor(50 * job.mpMod);
            player.mp = player.maxMp;
            player.attack = Math.floor(15 * job.attackMod);
            player.defense = Math.floor(10 * job.defenseMod);
            player.magic = Math.floor(8 * job.magicMod);
            player.speed = Math.floor(12 * job.speedMod);
        }
        
        // キャラクター表示更新
        function updateCharacterDisplay() {
            const player = gameState.player;
            const job = jobs[player.job];
            
            document.getElementById('characterName').textContent = player.name;
            document.getElementById('characterJob').textContent = `Lv.${player.level} ${job.name}`;
            
            // HPバー
            const hpPercent = (player.hp / player.maxHp) * 100;
            document.querySelector('.hp-bar').style.width = hpPercent + '%';
            document.getElementById('hpText').textContent = `${player.hp}/${player.maxHp}`;
            
            // MPバー
            const mpPercent = (player.mp / player.maxMp) * 100;
            document.querySelector('.mp-bar').style.width = mpPercent + '%';
            document.getElementById('mpText').textContent = `${player.mp}/${player.maxMp}`;
            
            // EXPバー
            const expPercent = (player.exp / player.expToNext) * 100;
            document.querySelector('.exp-bar').style.width = expPercent + '%';
            document.getElementById('expText').textContent = `${player.exp}/${player.expToNext}`;
        }
        
        // ダンジョン探索
        function exploreDungeon() {
            showScreen('dungeon');
        }
        
        function updateDungeonDisplay() {
            const dungeon = dungeons[gameState.currentDungeon];
            document.getElementById('currentLocation').textContent = dungeon.name;
            document.getElementById('locationDescription').textContent = dungeon.description;
        }
        
        function moveInDungeon(direction) {
            addToLog(`${direction}へ向かった。`);
            
            // ランダムエンカウント
            const dungeon = dungeons[gameState.currentDungeon];
            if (Math.random() < dungeon.encounterRate) {
                startRandomBattle();
            } else {
                addToLog('何も起こらなかった。');
            }
        }
        
        // バトル開始
        function startRandomBattle() {
            const dungeon = dungeons[gameState.currentDungeon];
            const enemyName = dungeon.enemies[Math.floor(Math.random() * dungeon.enemies.length)];
            startBattle(enemyName);
        }
        
        function startBattle(enemyName) {
            gameState.currentEnemy = {
                name: enemyName,
                ...enemies[enemyName],
                currentHp: enemies[enemyName].hp
            };
            
            gameState.inBattle = true;
            showScreen('battle');
            updateBattleDisplay();
            addToLog(`${enemyName}と遭遇した！`, 'log-battle');
        }
        
        function updateBattleDisplay() {
            const enemy = gameState.currentEnemy;
            document.getElementById('enemySprite').textContent = enemy.sprite;
            document.getElementById('enemyName').textContent = enemy.name;
            document.getElementById('enemyHp').textContent = `HP: ${enemy.currentHp}/${enemy.hp}`;
        }
        
        // バトルアクション
        function battleAction(action) {
            if (!gameState.inBattle) return;
            
            const player = gameState.player;
            const enemy = gameState.currentEnemy;
            
            // プレイヤーのターン
            let playerDamage = 0;
            let playerAction = '';
            
            switch(action) {
                case 'attack':
                    playerDamage = Math.max(1, player.attack - enemy.defense + Math.floor(Math.random() * 10) - 5);
                    playerAction = `${player.name}の攻撃！ ${enemy.name}に${playerDamage}のダメージ！`;
                    break;
                case 'magic':
                    if (player.mp >= 10) {
                        playerDamage = Math.max(1, player.magic * 2 - enemy.defense + Math.floor(Math.random() * 15) - 7);
                        player.mp -= 10;
                        playerAction = `${player.name}は魔法を使った！ ${enemy.name}に${playerDamage}のダメージ！`;
                    } else {
                        playerAction = 'MPが足りない！';
                    }
                    break;
                case 'defend':
                    playerAction = `${player.name}は身を守った！`;
                    break;
                case 'escape':
                    if (Math.random() < 0.7) {
                        addToLog('逃げ出した！');
                        gameState.inBattle = false;
                        showScreen('dungeon');
                        return;
                    } else {
                        playerAction = '逃げられなかった！';
                    }
                    break;
            }
            
            enemy.currentHp -= playerDamage;
            addToLog(playerAction);
            
            // 敵が倒された場合
            if (enemy.currentHp <= 0) {
                addToLog(`${enemy.name}を倒した！`, 'log-battle');
                gainExp(enemy.exp);
                addToLog(`経験値${enemy.exp}を獲得！`, 'log-exp');
                addToLog(`${enemy.gold}ゴールドを獲得！`, 'log-item');
                
                gameState.inBattle = false;
                setTimeout(() => showScreen('dungeon'), 2000);
                return;
            }
            
            // 敵のターン
            setTimeout(() => {
                const enemyDamage = Math.max(1, enemy.attack - (action === 'defend' ? player.defense * 2 : player.defense) + Math.floor(Math.random() * 8) - 4);
                player.hp -= enemyDamage;
                addToLog(`${enemy.name}の攻撃！ ${player.name}に${enemyDamage}のダメージ！`);
                
                // プレイヤーが倒された場合
                if (player.hp <= 0) {
                    player.hp = 0;
                    addToLog('倒れてしまった...', 'log-battle');
                    gameState.inBattle = false;
                    setTimeout(() => {
                        player.hp = Math.floor(player.maxHp / 2);
                        showScreen('menu');
                        addToLog('なんとか意識を取り戻した。');
                    }, 2000);
                }
                
                updateBattleDisplay();
                updateCharacterDisplay();
            }, 1000);
        }
        
        // 経験値獲得
        function gainExp(exp) {
            gameState.player.exp += exp;
            
            while (gameState.player.exp >= gameState.player.expToNext) {
                levelUp();
            }
        }
        
        // レベルアップ
        function levelUp() {
            const player = gameState.player;
            player.level++;
            player.exp -= player.expToNext;
            player.expToNext = player.level * 100;
            
            // ステータス上昇
            const job = jobs[player.job];
            player.maxHp += Math.floor(15 * job.hpMod);
            player.maxMp += Math.floor(8 * job.mpMod);
            player.attack += Math.floor(3 * job.attackMod);
            player.defense += Math.floor(2 * job.defenseMod);
            player.magic += Math.floor(2 * job.magicMod);
            player.speed += Math.floor(2 * job.speedMod);
            
            // HP・MP全回復
            player.hp = player.maxHp;
            player.mp = player.maxMp;
            
            showLevelUpAnimation();
            addToLog(`レベルアップ！ Lv.${player.level}になった！`, 'log-exp');
        }
        
        function showLevelUpAnimation() {
            const animation = document.createElement('div');
            animation.className = 'level-up-animation';
            animation.innerHTML = `<strong>LEVEL UP!</strong><br>Lv.${gameState.player.level}`;
            document.body.appendChild(animation);
            
            setTimeout(() => {
                if (document.body.contains(animation)) {
                    document.body.removeChild(animation);
                }
            }, 2000);
        }
        
        // インベントリ
        function openInventory() {
            showScreen('inventory');
        }
        
        function updateInventoryDisplay() {
            const grid = document.getElementById('inventoryGrid');
            grid.innerHTML = '';
            
            gameState.inventory.forEach((item, index) => {
                const slot = document.createElement('div');
                slot.className = 'item-slot';
                slot.innerHTML = `
                    <div class="item-name">${item.name}</div>
                    <div class="item-effect">${item.effect}</div>
                    <div style="margin-top: 5px;">x${item.count}</div>
                    <button onclick="useItem(${index})" style="margin-top: 5px; padding: 3px 8px; font-size: 10px;">使用</button>
                `;
                grid.appendChild(slot);
            });
        }
        
        function useItem(index) {
            const item = gameState.inventory[index];
            const player = gameState.player;
            
            if (item.count <= 0) return;
            
            if (item.name === 'ポーション') {
                const heal = Math.min(50, player.maxHp - player.hp);
                player.hp += heal;
                addToLog(`ポーションを使用！ HP${heal}回復！`);
            } else if (item.name === 'マナポーション') {
                const recover = Math.min(30, player.maxMp - player.mp);
                player.mp += recover;
                addToLog(`マナポーションを使用！ MP${recover}回復！`);
            }
            
            item.count--;
            if (item.count <= 0) {
                gameState.inventory.splice(index, 1);
            }
            
            updateInventoryDisplay();
            updateCharacterDisplay();
        }
        
        // ログ機能
        function addToLog(message, className = '') {
            const log = document.getElementById('gameLog');
            const entry = document.createElement('div');
            entry.className = `log-entry ${className}`;
            entry.textContent = message;
            log.appendChild(entry);
            log.scrollTop = log.scrollHeight;
            
            // ログが多すぎる場合は古いものを削除
            if (log.children.length > 50) {
                log.removeChild(log.firstChild);
            }
        }
        
        // 初期化
        window.onload = function() {
            showScreen('title');
        };
    </script>
</head>
<body>
    <!-- タイトル画面 -->
    <div class="title-screen">
        <div class="title-text">クロニクル・オブ・レジェンド</div>
        <div class="subtitle">~ Classic RPG Adventure ~</div>
        <button class="menu-button" onclick="startGame()">ゲームスタート</button>
    </div>
    
    <!-- メイン画面 -->
    <div class="game-screen menu-screen">
        <div class="character-panel">
            <div class="character-name" id="characterName">アルト</div>
            <div class="character-job" id="characterJob">Lv.1 戦士</div>
            
            <div style="margin: 8px 0;">
                <div style="font-size: 11px; margin-bottom: 2px;">HP</div>
                <div class="stat-bar">
                    <div class="hp-bar" style="width: 100%;"></div>
                    <div class="stat-text" id="hpText">100/100</div>
                </div>
            </div>
            
            <div style="margin: 8px 0;">
                <div style="font-size: 11px; margin-bottom: 2px;">MP</div>
                <div class="stat-bar">
                    <div class="mp-bar" style="width: 100%;"></div>
                    <div class="stat-text" id="mpText">50/50</div>
                </div>
            </div>
            
            <div style="margin: 8px 0;">
                <div style="font-size: 11px; margin-bottom: 2px;">EXP</div>
                <div class="stat-bar">
                    <div class="exp-bar" style="width: 0%;"></div>
                    <div class="stat-text" id="expText">0/100</div>
                </div>
            </div>
        </div>
        
        <button class="menu-button" onclick="exploreDungeon()">ダンジョン探索</button>
        <button class="menu-button" onclick="openInventory()">アイテム</button>
        <button class="menu-button" onclick="showScreen('title')">タイトルに戻る</button>
    </div>
    
    <!-- バトル画面 -->
    <div class="game-screen battle-screen">
        <div class="enemy-area">
            <div class="enemy-sprite" id="enemySprite">👹</div>
            <div class="enemy-name" id="enemyName">ゴブリン</div>
            <div id="enemyHp">HP: 60/60</div>
        </div>
        
        <div class="character-panel">
            <div style="display: flex; justify-content: space-between; font-size: 12px;">
                <span id="battlePlayerName">アルト</span>
                <span id="battlePlayerHp">HP: 100/100</span>
            </div>
        </div>
        
        <div class="battle-actions">
            <button class="action-button" onclick="battleAction('attack')">攻撃</button>
            <button class="action-button" onclick="battleAction('magic')">魔法</button>
            <button class="action-button" onclick="battleAction('defend')">防御</button>
            <button class="action-button" onclick="battleAction('escape')">逃げる</button>
        </div>
        
        <div class="log-area" id="battleLog"></div>
    </div>
    
    <!-- ダンジョン画面 -->
    <div class="game-screen dungeon-screen">
        <div class="dungeon-map">
            <div class="current-location" id="currentLocation">迷いの森</div>
            <div class="location-description" id="locationDescription">
                古い森の奥深く。魔物たちが潜んでいる。
            </div>
            
            <div class="direction-buttons">
                <button class="direction-button" onclick="moveInDungeon('北')">北</button>
                <button class="direction-button" onclick="moveInDungeon('東')">東</button>
                <button class="direction-button" onclick="moveInDungeon('西')">西</button>
                <button class="direction-button" onclick="moveInDungeon('南')">南</button>
                <button class="direction-button" onclick="showScreen('menu')">戻る</button>
            </div>
        </div>
        
        <div class="log-area" id="gameLog"></div>
    </div>
    
    <!-- インベントリ画面 -->
    <div class="game-screen inventory-screen">
        <h3 style="text-align: center; color: #ffd700; margin-bottom: 15px;">アイテム</h3>
        
        <div class="inventory-grid" id="inventoryGrid">
            <!-- アイテムはJavaScriptで動的生成 -->
        </div>
        
        <button class="menu-button" onclick="showScreen('menu')">戻る</button>
    </div>
    
    <!-- ジョブ選択モーダル -->
    <div class="modal" id="jobModal">
        <div class="modal-content">
            <h3 style="color: #ffd700; text-align: center; margin-bottom: 15px;">ジョブを選択してください</h3>
            
            <div class="job-selection">
                <div class="job-card" onclick="selectJob('warrior')">
                    <div class="job-name">戦士</div>
                    <div class="job-description">高い攻撃力と防御力を持つ前衛職</div>
                </div>
                
                <div class="job-card" onclick="selectJob('mage')">
                    <div class="job-name">魔法使い</div>
                    <div class="job-description">強力な魔法を使う後衛職</div>
                </div>
                
                <div class="job-card" onclick="selectJob('rogue')">
                    <div class="job-name">盗賊</div>
                    <div class="job-description">素早さに特化した技巧職</div>
                </div>
                
                <div class="job-card" onclick="selectJob('paladin')">
                    <div class="job-name">パラディン</div>
                    <div class="job-description">バランスの取れた聖騎士</div>
                </div>
            </div>
            
            <button class="close-button" onclick="confirmJobSelection()">決定</button>
        </div>
    </div>
</body>
</html>
