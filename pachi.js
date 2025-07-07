<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🌟 Future Pachinko Machine 🌟</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
        
        * {
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Orbitron', monospace;
            margin: 0;
            min-height: 100vh;
            background: linear-gradient(45deg, #1a1a2e, #16213e, #0f3460);
            background-size: 400% 400%;
            animation: backgroundShift 10s ease infinite;
            color: #fff;
            overflow-x: hidden;
        }
        
        @keyframes backgroundShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        
        .container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
        }
        
        .machine {
            width: 420px;
            max-width: 90vw;
            background: linear-gradient(145deg, #2a2a3e, #1a1a2e);
            border-radius: 30px;
            padding: 25px;
            box-shadow: 
                0 20px 60px rgba(0,0,0,0.5),
                inset 0 1px 0 rgba(255,255,255,0.1);
            border: 2px solid;
            border-image: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57) 1;
            animation: borderGlow 3s ease-in-out infinite;
            position: relative;
        }
        
        @keyframes borderGlow {
            0%, 100% { filter: drop-shadow(0 0 10px rgba(255, 107, 107, 0.5)); }
            33% { filter: drop-shadow(0 0 10px rgba(78, 205, 196, 0.5)); }
            66% { filter: drop-shadow(0 0 10px rgba(69, 183, 209, 0.5)); }
        }
        
        .title {
            text-align: center;
            font-size: 24px;
            font-weight: 900;
            margin-bottom: 20px;
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57);
            background-size: 300% 300%;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: gradientShift 2s ease infinite;
            text-shadow: 0 0 30px rgba(255,255,255,0.5);
        }
        
        @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        
        .stats-panel {
            background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
            border-radius: 20px;
            padding: 20px;
            margin-bottom: 20px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-bottom: 15px;
        }
        
        .stat-item {
            text-align: center;
            padding: 10px;
            background: linear-gradient(135deg, rgba(0,0,0,0.3), rgba(0,0,0,0.1));
            border-radius: 12px;
            border: 1px solid rgba(255,255,255,0.1);
        }
        
        .stat-label {
            font-size: 10px;
            color: #a0a0a0;
            margin-bottom: 5px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .stat-value {
            font-size: 18px;
            font-weight: 700;
        }
        
        .credits { color: #4ecdc4; text-shadow: 0 0 10px #4ecdc4; }
        .score { color: #feca57; text-shadow: 0 0 10px #feca57; }
        .balls { color: #ff6b6b; text-shadow: 0 0 10px #ff6b6b; }
        .multiplier { color: #96ceb4; text-shadow: 0 0 10px #96ceb4; }
        
        .game-board {
            width: 100%;
            height: 450px;
            background: radial-gradient(ellipse at center, #1a1a2e, #0f0f1e);
            border-radius: 25px;
            position: relative;
            overflow: hidden;
            margin: 20px 0;
            border: 3px solid rgba(255,255,255,0.2);
            box-shadow: 
                inset 0 0 50px rgba(0,0,0,0.5),
                0 0 30px rgba(255,255,255,0.1);
        }
        
        .pin {
            position: absolute;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: radial-gradient(circle at 30% 30%, #fff, #c0c0c0);
            box-shadow: 
                0 0 10px rgba(255,255,255,0.5),
                inset 0 1px 2px rgba(255,255,255,0.3);
            z-index: 1;
            animation: pinGlow 2s ease-in-out infinite alternate;
        }
        
        @keyframes pinGlow {
            from { box-shadow: 0 0 5px rgba(255,255,255,0.3); }
            to { box-shadow: 0 0 15px rgba(255,255,255,0.7); }
        }
        
        .ball {
            position: absolute;
            width: 14px;
            height: 14px;
            border-radius: 50%;
            z-index: 3;
            box-shadow: 
                0 0 15px rgba(255,255,255,0.6),
                inset 0 1px 0 rgba(255,255,255,0.8);
            animation: ballShine 1s ease-in-out infinite alternate;
        }
        
        @keyframes ballShine {
            from { 
                transform: scale(1);
                box-shadow: 0 0 15px rgba(255,255,255,0.6);
            }
            to { 
                transform: scale(1.1);
                box-shadow: 0 0 25px rgba(255,255,255,0.9);
            }
        }
        
        .ball-trail {
            position: absolute;
            width: 6px;
            height: 6px;
            border-radius: 50%;
            z-index: 2;
            animation: fadeOut 0.5s ease-out forwards;
        }
        
        @keyframes fadeOut {
            from { opacity: 0.7; }
            to { opacity: 0; }
        }
        
        .pocket {
            position: absolute;
            bottom: 0;
            width: 70px;
            height: 40px;
            border-radius: 15px 15px 0 0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 12px;
            color: #fff;
            text-shadow: 0 0 10px rgba(0,0,0,0.8);
            box-shadow: 
                0 -5px 20px rgba(0,0,0,0.5),
                inset 0 2px 10px rgba(255,255,255,0.2);
            z-index: 1;
        }
        
        .pocket-1 { left: 10px; background: linear-gradient(to bottom, #ff9a9e, #fecfef); }
        .pocket-2 { left: 85px; background: linear-gradient(to bottom, #a18cd1, #fbc2eb); }
        .pocket-3 { left: 160px; background: linear-gradient(to bottom, #fad0c4, #ffd1ff); animation: jackpotPulse 1.5s ease-in-out infinite; }
        .pocket-4 { left: 235px; background: linear-gradient(to bottom, #a18cd1, #fbc2eb); }
        .pocket-5 { left: 310px; background: linear-gradient(to bottom, #ff9a9e, #fecfef); }
        
        @keyframes jackpotPulse {
            0%, 100% { 
                transform: scale(1);
                box-shadow: 0 -5px 20px rgba(255,215,0,0.3);
            }
            50% { 
                transform: scale(1.05);
                box-shadow: 0 -5px 30px rgba(255,215,0,0.8);
            }
        }
        
        .controls {
            margin: 20px 0;
        }
        
        .power-control {
            margin-bottom: 20px;
        }
        
        .power-label {
            display: block;
            text-align: center;
            margin-bottom: 10px;
            font-weight: 700;
            color: #4ecdc4;
            text-shadow: 0 0 10px #4ecdc4;
        }
        
        .power-slider {
            width: 100%;
            height: 8px;
            border-radius: 5px;
            background: linear-gradient(to right, #ff6b6b, #feca57, #4ecdc4);
            outline: none;
            appearance: none;
            position: relative;
        }
        
        .power-slider::-webkit-slider-thumb {
            appearance: none;
            width: 25px;
            height: 25px;
            border-radius: 50%;
            background: radial-gradient(circle, #fff, #4ecdc4);
            cursor: pointer;
            box-shadow: 0 0 15px rgba(78, 205, 196, 0.8);
            border: 2px solid #fff;
        }
        
        .launch-button {
            width: 100%;
            padding: 18px;
            font-family: 'Orbitron', monospace;
            font-size: 16px;
            font-weight: 700;
            border: none;
            border-radius: 25px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: #fff;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 2px;
            box-shadow: 
                0 10px 30px rgba(102, 126, 234, 0.3),
                inset 0 1px 0 rgba(255,255,255,0.2);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        
        .launch-button:hover:not(:disabled) {
            transform: translateY(-3px);
            box-shadow: 
                0 15px 40px rgba(102, 126, 234, 0.5),
                inset 0 1px 0 rgba(255,255,255,0.2);
        }
        
        .launch-button:active:not(:disabled) {
            transform: translateY(-1px);
        }
        
        .launch-button:disabled {
            background: linear-gradient(135deg, #555, #777);
            cursor: not-allowed;
            transform: none;
        }
        
        .launch-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            transition: left 0.5s ease;
        }
        
        .launch-button:hover:not(:disabled)::before {
            left: 100%;
        }
        
        .message {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            padding: 20px 30px;
            border-radius: 15px;
            font-weight: 700;
            text-align: center;
            z-index: 1000;
            backdrop-filter: blur(10px);
            border: 2px solid rgba(255,255,255,0.3);
            animation: messageSlide 0.5s ease-out;
        }
        
        @keyframes messageSlide {
            from { 
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.8);
            }
            to { 
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
            }
        }
        
        .message.success {
            background: linear-gradient(135deg, rgba(76, 175, 80, 0.9), rgba(139, 195, 74, 0.9));
            color: #fff;
            text-shadow: 0 0 10px rgba(0,0,0,0.5);
        }
        
        .message.jackpot {
            background: linear-gradient(135deg, rgba(255, 193, 7, 0.95), rgba(255, 152, 0, 0.95));
            color: #fff;
            font-size: 24px;
            animation: jackpotMessage 1s ease-in-out;
            box-shadow: 0 0 50px rgba(255, 193, 7, 0.8);
        }
        
        @keyframes jackpotMessage {
            0%, 100% { transform: translate(-50%, -50%) scale(1); }
            50% { transform: translate(-50%, -50%) scale(1.1); }
        }
        
        .message.error {
            background: linear-gradient(135deg, rgba(244, 67, 54, 0.9), rgba(233, 30, 99, 0.9));
            color: #fff;
        }
        
        .combo-display {
            text-align: center;
            padding: 10px;
            background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
            border-radius: 15px;
            border: 1px solid rgba(255,255,255,0.2);
        }
        
        .particle {
            position: absolute;
            width: 4px;
            height: 4px;
            border-radius: 50%;
            z-index: 4;
            animation: particleFloat 2s ease-out forwards;
        }
        
        @keyframes particleFloat {
            0% {
                opacity: 1;
                transform: scale(1);
            }
            100% {
                opacity: 0;
                transform: scale(0) translateY(-50px);
            }
        }
        
        @media (max-width: 500px) {
            .machine {
                width: 100%;
                padding: 15px;
            }
            
            .title {
                font-size: 20px;
            }
            
            .game-board {
                height: 350px;
            }
            
            .stats-grid {
                grid-template-columns: 1fr;
                gap: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="machine">
            <h1 class="title">🌟 FUTURE PACHINKO 🌟</h1>
            
            <div class="stats-panel">
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-label">Credits</div>
                        <div class="stat-value credits" id="credits">10000</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Score</div>
                        <div class="stat-value score" id="score">0</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Balls</div>
                        <div class="stat-value balls" id="balls">0</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Combo</div>
                        <div class="stat-value multiplier" id="combo">×1</div>
                    </div>
                </div>
                
                <div class="combo-display">
                    <div style="font-size: 12px; color: #a0a0a0;">NEXT JACKPOT</div>
                    <div style="font-size: 16px; font-weight: 700; color: #feca57;" id="jackpot">50000</div>
                </div>
            </div>
            
            <div class="game-board" id="gameBoard">
                <!-- ピンと玉はJavaScriptで動的生成 -->
                <div class="pocket pocket-1" data-value="100">100</div>
                <div class="pocket pocket-2" data-value="300">300</div>
                <div class="pocket pocket-3" data-value="1000">MEGA</div>
                <div class="pocket pocket-4" data-value="300">300</div>
                <div class="pocket pocket-5" data-value="100">100</div>
            </div>
            
            <div class="controls">
                <div class="power-control">
                    <label class="power-label">
                        LAUNCH POWER: <span id="powerValue">50</span>%
                    </label>
                    <input type="range" class="power-slider" id="powerSlider" 
                           min="20" max="100" value="50" step="5">
                </div>
                
                <button class="launch-button" id="launchBtn">
                    🚀 LAUNCH BALL (100 CREDITS)
                </button>
            </div>
        </div>
    </div>

    <script>
        class FuturePachinko {
            constructor() {
                this.credits = 10000;
                this.score = 0;
                this.ballsInPlay = 0;
                this.launchPower = 50;
                this.combo = 1;
                this.jackpot = 50000;
                this.isLaunching = false;
                this.balls = [];
                this.pins = [];
                this.ballColors = [
                    'linear-gradient(45deg, #ff6b6b, #ee5a6f)',
                    'linear-gradient(45deg, #4ecdc4, #44a08d)',
                    'linear-gradient(45deg, #45b7d1, #96c93d)',
                    'linear-gradient(45deg, #feca57, #ff9ff3)',
                    'linear-gradient(45deg, #ff9a9e, #fecfef)',
                    'linear-gradient(45deg, #a18cd1, #fbc2eb)'
                ];
                
                this.init();
            }
            
            init() {
                this.setupEventListeners();
                this.generatePins();
                this.updateDisplay();
                this.startGameLoop();
            }
            
            setupEventListeners() {
                const launchBtn = document.getElementById('launchBtn');
                const powerSlider = document.getElementById('powerSlider');
                const powerValue = document.getElementById('powerValue');
                
                launchBtn.addEventListener('click', () => this.launchBall());
                
                powerSlider.addEventListener('input', (e) => {
                    this.launchPower = parseInt(e.target.value);
                    powerValue.textContent = this.launchPower;
                });
                
                document.addEventListener('keydown', (e) => {
                    if (e.code === 'Space') {
                        e.preventDefault();
                        this.launchBall();
                    }
                });
                
                // Auto-launch for demo (remove in production)
                setInterval(() => {
                    if (this.ballsInPlay < 3 && this.credits >= 100) {
                        this.launchBall();
                    }
                }, 2000);
            }
            
            generatePins() {
                const board = document.getElementById('gameBoard');
                const boardWidth = 370;
                const boardHeight = 450;
                
                for (let row = 0; row < 15; row++) {
                    for (let col = 0; col < 9; col++) {
                        const x = 30 + col * 40 + (row % 2 === 0 ? 0 : 20);
                        const y = 50 + row * 25;
                        
                        if (x < boardWidth - 30 && y < boardHeight - 80) {
                            const pin = document.createElement('div');
                            pin.className = 'pin';
                            pin.style.left = x + 'px';
                            pin.style.top = y + 'px';
                            board.appendChild(pin);
                            
                            this.pins.push({ x: x + 4, y: y + 4, radius: 4 });
                        }
                    }
                }
            }
            
            launchBall() {
                if (this.credits < 100 || this.isLaunching) {
                    if (this.credits < 100) {
                        this.showMessage('💸 Insufficient Credits!', 'error');
                    }
                    return;
                }
                
                this.credits -= 100;
                this.isLaunching = true;
                this.ballsInPlay++;
                
                const board = document.getElementById('gameBoard');
                const ball = document.createElement('div');
                ball.className = 'ball';
                
                const startX = 185 + (Math.random() - 0.5) * 60;
                const startY = 15;
                const ballColor = this.ballColors[Math.floor(Math.random() * this.ballColors.length)];
                
                ball.style.left = startX + 'px';
                ball.style.top = startY + 'px';
                ball.style.background = ballColor;
                board.appendChild(ball);
                
                const ballData = {
                    element: ball,
                    x: startX,
                    y: startY,
                    dx: (Math.random() - 0.5) * (this.launchPower / 40),
                    dy: 1.5 + this.launchPower / 60,
                    radius: 7,
                    color: ballColor,
                    trail: []
                };
                
                this.balls.push(ballData);
                this.updateDisplay();
                this.createParticles(startX, startY, ballColor);
                
                setTimeout(() => {
                    this.isLaunching = false;
                }, 300);
            }
            
            updateBall(ball) {
                // 軌跡の記録
                ball.trail.push({ x: ball.x, y: ball.y });
                if (ball.trail.length > 6) {
                    ball.trail.shift();
                }
                
                // 物理演算
                ball.x += ball.dx;
                ball.y += ball.dy;
                ball.dy += 0.12; // 重力
                
                // 壁との衝突
                if (ball.x <= ball.radius) {
                    ball.x = ball.radius;
                    ball.dx = Math.abs(ball.dx) * 0.85;
                } else if (ball.x >= 370 - ball.radius) {
                    ball.x = 370 - ball.radius;
                    ball.dx = -Math.abs(ball.dx) * 0.85;
                }
                
                // ピンとの衝突
                this.pins.forEach(pin => {
                    const dx = ball.x - pin.x;
                    const dy = ball.y - pin.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const minDistance = ball.radius + pin.radius;
                    
                    if (distance < minDistance && distance > 0) {
                        const normalX = dx / distance;
                        const normalY = dy / distance;
                        
                        ball.x = pin.x + normalX * minDistance;
                        ball.y = pin.y + normalY * minDistance;
                        
                        const dotProduct = ball.dx * normalX + ball.dy * normalY;
                        ball.dx = ball.dx - 1.6 * dotProduct * normalX;
                        ball.dy = ball.dy - 1.6 * dotProduct * normalY;
                        
                        ball.dx *= 0.9;
                        ball.dy *= 0.9;
                        
                        this.createParticles(ball.x, ball.y, ball.color);
                    }
                });
                
                // 速度制限
                const maxSpeed = 15;
                if (Math.abs(ball.dx) > maxSpeed) ball.dx = Math.sign(ball.dx) * maxSpeed;
                if (Math.abs(ball.dy) > maxSpeed) ball.dy = Math.sign(ball.dy) * maxSpeed;
                
                // 位置更新
                ball.element.style.left = ball.x + 'px';
                ball.element.style.top = ball.y + 'px';
                
                // 軌跡エフェクト
                this.createTrailEffect(ball);
                
                // 底に到達チェック
                if (ball.y >= 420) {
                    this.handleBallLanding(ball);
                    return false;
                }
                
                return true;
            }
            
            createTrailEffect(ball) {
                if (Math.random() < 0.3) { // 30%の確率で軌跡作成
                    const trail = document.createElement('div');
                    trail.className = 'ball-trail';
                    trail.style.left = ball.x + 'px';
                    trail.style.top = ball.y + 'px';
                    trail.style.background = ball.color;
                    document.getElementById('gameBoard').appendChild(trail);
                    
                    setTimeout(() => trail.remove(), 500);
                }
            }
            
            createParticles(x, y, color) {
                for (let i = 0; i < 5; i++) {
                    const particle = document.createElement('div');
                    particle.className = 'particle';
                    particle.style.left = (x + (Math.random() - 0.5) * 20) + 'px';
                    particle.style.top = (y + (Math.random() - 0.5) * 20) + 'px';
                    particle.style.background = color;
                    document.getElementById('gameBoard').appendChild(particle);
                    
                    setTimeout(() => particle.remove(), 2000);
                }
            }
            
            handleBallLanding(ball) {
                const pocketIndex = Math.floor(ball.x / 74);
                const pocketValues = [100, 300, 1000, 300, 100];
                let earnedPoints = pocketValues[pocketIndex] || 0;
                
                // コンボシステム
                if (earnedPoints > 0) {
                    earnedPoints *= this.combo;
                    this.combo = Math.min(this.combo + 0.5, 10);
                } else {
                    this.combo = 1;
                }
                
                this.credits += earnedPoints;
                this.score += earnedPoints;
                this.ballsInPlay--;
                
                // ジャックポット判定
                if (pocketIndex === 2 && Math.random() < 0.08) {
                    const jackpotWin = Math.min(this.jackpot, 25000);
                    this.credits += jackpotWin;
                    this.score += jackpotWin;
                    this.jackpot = Math.max(10000, this.jackpot - jackpotWin + 5000);
                    this.showMessage(`🎉 MEGA JACKPOT! +${(earnedPoints + jackpotWin).toLocaleString()}!`, 'jackpot');
                    this.createExplosion(ball.x, ball.y);
                } else if (earnedPoints > 0) {
                    this.showMessage(`💫 +${earnedPoints.toLocaleString()} Points! 
                        ${this.combo > 1 ? `Combo ×${this.combo}!` : ''}`, 'success');
                }
                
                // ジャックポット増加
                this.jackpot += 50;
                
                this.createParticles(ball.x, ball.y, ball.color);
                ball.element.remove();
                this.balls = this.balls.filter(b => b !== ball);
                this.updateDisplay();
            }
            
            createExplosion(x, y) {
                for (let i = 0; i < 20; i++) {
                    const particle = document.createElement('div');
                    particle.className = 'particle';
                    particle.style.left = x + 'px';
                    particle.style.top = y + 'px';
                    particle.style.background = this.ballColors[Math.floor(Math.random() * this.ballColors.length)];
                    particle.style.width = '8px';
                    particle.style.height = '8px';
                    document.getElementById('gameBoard').appendChild(particle);
                    
                    setTimeout(() => particle.remove(), 2000);
                }
            }
            
            startGameLoop() {
                const gameLoop = () => {
                    this.balls = this.balls.filter(ball => this.updateBall(ball));
                    requestAnimationFrame(gameLoop);
                };
                gameLoop();
            }
            
            updateDisplay() {
                document.getElementById('credits').textContent = this.credits.toLocaleString();
                document.getElementById('score').textContent = this.score.toLocaleString();
                document.getElementById('balls').textContent = this.ballsInPlay;
                document.getElementById('combo').textContent = '×' + this.combo.toFixed(1);
                document.getElementById('jackpot').textContent = this.jackpot.toLocaleString();
                
                const launchBtn = document.getElementById('launchBtn');
                launchBtn.disabled = this.credits < 100 || this.isLaunching;
            }
            
            showMessage(text, type = 'success') {
                const message = document.createElement('div');
                message.className = `message ${type}`;
                message.textContent = text;
                document.body.appendChild(message);
                
                setTimeout(() => message.remove(), 3000);
            }
        }
        
        // ゲーム開始
        document.addEventListener('DOMContentLoaded', () => {
            new FuturePachinko();
        });
    </script>
</body>
</html>
