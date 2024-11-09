<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="カツオを追いかけてたたくゲーム">
    <title>カツオたたきゲーム DX</title>
    <style>
        /* 既存のスタイルはそのまま */
        
        .difficulty-select {
            display: flex;
            justify-content: center;
            gap: 1rem;
            margin: 1rem 0;
        }

        .difficulty-btn {
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 1rem;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .difficulty-btn.easy { background: #4CAF50; color: white; }
        .difficulty-btn.normal { background: #2196F3; color: white; }
        .difficulty-btn.hard { background: #F44336; color: white; }
        .difficulty-btn.selected { transform: scale(1.1); box-shadow: 0 0 10px rgba(0,0,0,0.3); }

        .particle {
            position: absolute;
            pointer-events: none;
            border-radius: 50%;
            animation: particle 0.8s ease-out forwards;
        }

        @keyframes particle {
            0% {
                transform: scale(1) rotate(0deg);
                opacity: 1;
            }
            100% {
                transform: scale(0) rotate(360deg);
                opacity: 0;
            }
        }

        .settings {
            position: fixed;
            top: 1rem;
            right: 1rem;
            padding: 0.5rem;
            background: white;
            border-radius: 0.5rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>
    <!-- 既存のHTML構造に追加 -->
    <div class="settings">
        <label>
            <input type="checkbox" id="sound-toggle" checked>
            音声ON/OFF
        </label>
    </div>

    <div class="difficulty-select">
        <button class="difficulty-btn easy" data-difficulty="easy">かんたん</button>
        <button class="difficulty-btn normal selected" data-difficulty="normal">ふつう</button>
        <button class="difficulty-btn hard" data-difficulty="hard">むずかしい</button>
    </div>

    <script>
        class SoundManager {
            constructor() {
                this.sounds = {
                    hit: new Audio('data:audio/mpeg;base64,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
                        // base64エンコードされた音声データ（省略）'),
                    miss: new Audio('data:audio/mpeg;base64,...') // 実際の音声データを設定
                };
                this.enabled = true;
                this.loadSettings();
            }

            loadSettings() {
                const soundEnabled = localStorage.getItem('soundEnabled');
                this.enabled = soundEnabled === null ? true : JSON.parse(soundEnabled);
                document.getElementById('sound-toggle').checked = this.enabled;
            }

            toggleSound(enabled) {
                this.enabled = enabled;
                localStorage.setItem('soundEnabled', enabled);
            }

            play(soundName) {
                if (this.enabled && this.sounds[soundName]) {
                    this.sounds[soundName].currentTime = 0;
                    this.sounds[soundName].play().catch(() => {});
                }
            }
        }

        class ParticleSystem {
            constructor() {
                this.particles = [];
            }

            createHitEffect(x, y) {
                const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'];
                const particleCount = 12;

                for (let i = 0; i < particleCount; i++) {
                    const particle = document.createElement('div');
                    particle.className = 'particle';
                    
                    const size = Math.random() * 10 + 5;
                    const angle = (Math.PI * 2 * i) / particleCount;
                    const speed = Math.random() * 50 + 50;
                    
                    particle.style.width = `${size}px`;
                    particle.style.height = `${size}px`;
                    particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                    particle.style.left = `${x}px`;
                    particle.style.top = `${y}px`;
                    
                    const velocityX = Math.cos(angle) * speed;
                    const velocityY = Math.sin(angle) * speed;
                    
                    particle.style.transform = `translate(${velocityX}px, ${velocityY}px)`;
                    
                    document.body.appendChild(particle);
                    
                    setTimeout(() => {
                        document.body.removeChild(particle);
                    }, 800);
                }
            }
        }

        class KatsuoGame {
            constructor() {
                this.difficulties = {
                    easy: { time: 40, speed: 0.7, scale: 1.2 },
                    normal: { time: 30, speed: 1, scale: 1 },
                    hard: { time: 20, speed: 1.5, scale: 0.8 }
                };
                
                this.currentDifficulty = 'normal';
                this.score = 0;
                this.timeLeft = this.difficulties[this.currentDifficulty].time;
                this.isPlaying = false;
                this.highScores = this.loadHighScores();

                this.soundManager = new SoundManager();
                this.particleSystem = new ParticleSystem();

                this.setupElements();
                this.setupEventListeners();
                this.setupGame();
            }

            loadHighScores() {
                const scores = localStorage.getItem('katsuoHighScores');
                return scores ? JSON.parse(scores) : {
                    easy: 0,
                    normal: 0,
                    hard: 0
                };
            }

            saveHighScore() {
                if (this.score > this.highScores[this.currentDifficulty]) {
                    this.highScores[this.currentDifficulty] = this.score;
                    localStorage.setItem('katsuoHighScores', JSON.stringify(this.highScores));
                }
            }

            setupElements() {
                // 既存のエレメント設定に加えて
                this.difficultyButtons = document.querySelectorAll('.difficulty-btn');
                this.setupDifficultySelection();
            }

            setupDifficultySelection() {
                this.difficultyButtons.forEach(button => {
                    button.addEventListener('click', () => {
                        if (this.isPlaying) return;
                        
                        this.difficultyButtons.forEach(btn => btn.classList.remove('selected'));
                        button.classList.add('selected');
                        
                        this.currentDifficulty = button.dataset.difficulty;
                        this.timeLeft = this.difficulties[this.currentDifficulty].time;
                        this.updateTimer();
                    });
                });
            }

            updateScore() {
                if (!this.isPlaying) return;
                
                this.score++;
                this.elements.scoreDisplay.textContent = `スコア: ${this.score}`;
                
                const rect = this.elements.katsuo.getBoundingClientRect();
                const x = rect.left + rect.width / 2;
                const y = rect.top + rect.height / 2;
                
                this.particleSystem.createHitEffect(x, y);
                this.soundManager.play('hit');
                
                this.moveKatsuo();
            }

            moveKatsuo() {
                // 既存の移動ロジックに速度係数を適用
                const speed = this.difficulties[this.currentDifficulty].speed;
                const scale = this.difficulties[this.currentDifficulty].scale;
                
                // 移動と大きさの調整
                this.elements.katsuo.style.transition = `all ${0.5 / speed}s ease-out`;
                this.elements.katsuo.style.transform = 
                    `scaleX(${Math.random() < 0.5 ? -1 : 1}) scale(${scale})`;
                
                // 位置の計算と設定は既存のコードを使用
            }

            endGame() {
                this.isPlaying = false;
                this.saveHighScore();
                
                const difficulty = this.difficulties[this.currentDifficulty];
                const message = `
                    難易度: ${this.currentDifficulty}
                    スコア: ${this.score}点
                    ハイスコア: ${this.highScores[this.currentDifficulty]}点
                `;
                
                this.elements.finalScore.textContent = message;
                this.elements.gameOver.classList.add('active');
            }
        }

        // サウンド設定のイベントリスナー
        document.getElementById('sound-toggle').addEventListener('change', (e) => {
            game.soundManager.toggleSound(e.target.checked);
        });

        // ゲーム開始
        let game = new KatsuoGame();
    </script>
</body>
</html>