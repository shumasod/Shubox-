import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Zap, Heart, Star, Trophy, RefreshCw, Pause, Play, MessageCircle, Search, Bot, Sparkles } from 'lucide-react';

// 質問してくる敵（倒すべきターゲット）- ggrks時代とchprks時代の両方
const enemies = [
  // ggrks世代の敵
  { id: 1, type: 'ggrks', name: 'ググらない君', icon: '🔍', points: 100, health: 1, question: 'このエラーってなに？', answer: 'ggrks！エラーメッセージでググれ', era: 'ggrks' },
  { id: 2, type: 'ggrks', name: 'Wiki見ない奴', icon: '📖', points: 120, health: 1, question: 'この用語の意味教えて', answer: 'ggrks！Wikipediaくらい見ろ', era: 'ggrks' },
  { id: 3, type: 'ggrks', name: '検索できない人', icon: '❓', points: 150, health: 2, question: '〇〇のやり方がわからない', answer: 'ggrks！検索ワード工夫しろ', era: 'ggrks' },
  
  // chprks世代の敵
  { id: 4, type: 'chprks', name: '初歩的質問マン', icon: '🙋', points: 100, health: 1, question: 'Pythonのインストール方法教えて', answer: 'chprks！ChatGPTに聞け', era: 'chprks' },
  { id: 5, type: 'chprks', name: 'AI使えない君', icon: '😴', points: 150, health: 1, question: 'エラーが出たんだけど...', answer: 'chprks！エラーをAIに貼れ', era: 'chprks' },
  { id: 6, type: 'chprks', name: '緊急質問野郎', icon: '😱', points: 200, health: 2, question: '【急募】明日までにReact覚えたい', answer: 'chprks！AIにロードマップ作らせろ', era: 'chprks' },
  { id: 7, type: 'chprks', name: 'ふわふわ質問者', icon: '🌀', points: 150, health: 1, question: 'なんかうまくいかない', answer: 'chprks！状況整理してAIに説明しろ', era: 'chprks' },
  { id: 8, type: 'chprks', name: '何度も聞くマン', icon: '🔄', points: 250, health: 2, question: '前も聞いたけどもう一回...', answer: 'chprks！AIの履歴見ろ', era: 'chprks' },
  { id: 9, type: 'chprks', name: 'コピペ願望者', icon: '📋', points: 100, health: 1, question: 'コード全部書いて', answer: 'chprks！AIに書かせて理解しろ', era: 'chprks' },
  { id: 10, type: 'chprks', name: '長文質問おじさん', icon: '📜', points: 200, health: 2, question: '（5000文字の質問）', answer: 'chprks！AIに要約させろ', era: 'chprks' },
  
  // ボスキャラ
  { id: 11, type: 'boss', name: '教えてクレクレ大王', icon: '👑', points: 500, health: 4, question: '全部教えて！！！', answer: 'ggrks → chprks の進化を学べ！', era: 'boss' },
  { id: 12, type: 'boss', name: '自助努力ゼロ魔王', icon: '👿', points: 800, health: 5, question: '調べるの面倒だから教えて', answer: 'まずググれ！それでもダメならAIに聞け！', era: 'boss' },
];

// 弾の種類（回答・誘導）- ggrks系とchprks系
const ammoTypes = [
  // ggrks系
  { id: 1, name: 'ggrks弾', icon: '🔍', damage: 1, color: 'from-green-400 to-emerald-500', phrase: 'ggrks!', era: 'ggrks' },
  { id: 2, name: 'RTFM弾', icon: '📚', damage: 1, color: 'from-orange-400 to-red-500', phrase: 'ドキュメント読め!', era: 'ggrks' },
  // chprks系
  { id: 3, name: 'chprks弾', icon: '🤖', damage: 1, color: 'from-cyan-400 to-blue-500', phrase: 'chprks!', era: 'chprks' },
  { id: 4, name: 'AI回答弾', icon: '✨', damage: 2, color: 'from-purple-400 to-pink-500', phrase: 'AIに聞いた?', era: 'chprks' },
  // 最強
  { id: 5, name: '自己解決砲', icon: '💡', damage: 3, color: 'from-yellow-400 to-amber-500', phrase: '自分で調べろ!', era: 'ultimate' },
];

// パワーアップ
const powerUps = [
  { id: 1, name: 'Google先生', icon: '🔎', effect: 'powerShot', description: '検索力UP！攻撃力+1' },
  { id: 2, name: 'ChatGPT Plus', icon: '⚡', effect: 'powerShot', description: 'GPT-4の力！攻撃力+1' },
  { id: 3, name: 'Copilot', icon: '🤝', effect: 'multiShot', description: '3方向同時回答' },
  { id: 4, name: 'Perplexity', icon: '🔮', effect: 'speedUp', description: '高速検索！移動速度UP' },
  { id: 5, name: 'Claude', icon: '🧡', effect: 'extraLife', description: 'ライフ+1' },
  { id: 6, name: 'Stack Overflow', icon: '📚', effect: 'multiShot', description: '先人の知恵！3方向弾' },
];

const GAME_WIDTH = 360;
const GAME_HEIGHT = 560;
const PLAYER_WIDTH = 48;
const PLAYER_HEIGHT = 36;
const ENEMY_SIZE = 40;
const BULLET_SIZE = 10;

export default function ChprksInvaders() {
  const [gameState, setGameState] = useState('title');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [playerX, setPlayerX] = useState(GAME_WIDTH / 2 - PLAYER_WIDTH / 2);
  const [bullets, setBullets] = useState([]);
  const [enemyBullets, setEnemyBullets] = useState([]);
  const [currentEnemies, setCurrentEnemies] = useState([]);
  const [enemyDirection, setEnemyDirection] = useState(1);
  const [currentAmmo, setCurrentAmmo] = useState(ammoTypes[0]);
  const [powerUpActive, setPowerUpActive] = useState(null);
  const [floatingPowerUp, setFloatingPowerUp] = useState(null);
  const [currentAnswer, setCurrentAnswer] = useState(null);
  const [combo, setCombo] = useState(0);
  const [showExplosion, setShowExplosion] = useState([]);
  const [floatingText, setFloatingText] = useState([]);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [ggrksCount, setGgrksCount] = useState(0);
  const [chprksCount, setChprksCount] = useState(0);
  const lastShotRef = useRef(0);

  // Initialize enemies
  const initializeEnemies = useCallback((lvl) => {
    const rows = Math.min(2 + Math.floor(lvl / 2), 4);
    const cols = Math.min(4 + Math.floor(lvl / 2), 7);
    const newEnemies = [];
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const isBoss = lvl >= 3 && row === 0 && col === Math.floor(cols / 2);
        let enemyType;
        
        if (isBoss) {
          const bosses = enemies.filter(e => e.type === 'boss');
          enemyType = bosses[Math.floor(Math.random() * bosses.length)];
        } else {
          // レベルに応じてggrks/chprksの比率を変える
          const normalEnemies = enemies.filter(e => e.type !== 'boss');
          const ggrksEnemies = normalEnemies.filter(e => e.era === 'ggrks');
          const chprksEnemies = normalEnemies.filter(e => e.era === 'chprks');
          
          // 序盤はggrks多め、後半はchprks多め
          if (lvl <= 2) {
            enemyType = Math.random() < 0.7 
              ? ggrksEnemies[Math.floor(Math.random() * ggrksEnemies.length)]
              : chprksEnemies[Math.floor(Math.random() * chprksEnemies.length)];
          } else {
            enemyType = Math.random() < 0.3 
              ? ggrksEnemies[Math.floor(Math.random() * ggrksEnemies.length)]
              : chprksEnemies[Math.floor(Math.random() * chprksEnemies.length)];
          }
        }
        
        newEnemies.push({
          ...enemyType,
          uid: `${row}-${col}-${Date.now()}`,
          x: col * (ENEMY_SIZE + 10) + 20,
          y: row * (ENEMY_SIZE + 12) + 80,
          currentHealth: enemyType.health,
        });
      }
    }
    setCurrentEnemies(newEnemies);
  }, []);

  // Start game
  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLives(3);
    setLevel(1);
    setPlayerX(GAME_WIDTH / 2 - PLAYER_WIDTH / 2);
    setBullets([]);
    setEnemyBullets([]);
    setCombo(0);
    setPowerUpActive(null);
    setFloatingPowerUp(null);
    setQuestionsAnswered(0);
    setGgrksCount(0);
    setChprksCount(0);
    initializeEnemies(1);
  };

  // Shoot
  const shoot = useCallback(() => {
    const now = Date.now();
    if (now - lastShotRef.current < 200) return;
    lastShotRef.current = now;

    const newBullets = [];
    const bulletX = playerX + PLAYER_WIDTH / 2 - BULLET_SIZE / 2;
    const bulletY = GAME_HEIGHT - PLAYER_HEIGHT - 30;

    if (powerUpActive === 'multiShot') {
      newBullets.push(
        { x: bulletX - 20, y: bulletY, dx: -1.5, ammo: currentAmmo, id: Date.now() },
        { x: bulletX, y: bulletY, dx: 0, ammo: currentAmmo, id: Date.now() + 1 },
        { x: bulletX + 20, y: bulletY, dx: 1.5, ammo: currentAmmo, id: Date.now() + 2 }
      );
    } else {
      newBullets.push({ x: bulletX, y: bulletY, dx: 0, ammo: currentAmmo, id: Date.now() });
    }

    setBullets(prev => [...prev, ...newBullets]);
    
    setFloatingText(prev => [...prev, {
      id: Date.now(),
      x: bulletX,
      y: bulletY,
      text: currentAmmo.phrase,
      color: currentAmmo.era === 'ggrks' ? 'text-green-400' : 'text-cyan-400',
    }]);
    setTimeout(() => {
      setFloatingText(prev => prev.slice(1));
    }, 500);
  }, [playerX, currentAmmo, powerUpActive]);

  // Keyboard input
  useEffect(() => {
    if (gameState !== 'playing') return;

    const handleKeyDown = (e) => {
      const speed = powerUpActive === 'speedUp' ? 25 : 15;
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
          setPlayerX(prev => Math.max(0, prev - speed));
          break;
        case 'ArrowRight':
        case 'd':
          setPlayerX(prev => Math.min(GAME_WIDTH - PLAYER_WIDTH, prev + speed));
          break;
        case ' ':
        case 'ArrowUp':
          e.preventDefault();
          shoot();
          break;
        case 'Escape':
          setGameState('paused');
          break;
        case '1': case '2': case '3': case '4': case '5':
          const ammoIndex = parseInt(e.key) - 1;
          if (ammoTypes[ammoIndex]) setCurrentAmmo(ammoTypes[ammoIndex]);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, shoot, powerUpActive]);

  // Touch controls
  const handleTouchMove = (e) => {
    if (gameState !== 'playing') return;
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const x = touch.clientX - rect.left - PLAYER_WIDTH / 2;
    setPlayerX(Math.max(0, Math.min(GAME_WIDTH - PLAYER_WIDTH, x)));
  };

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = setInterval(() => {
      setBullets(prev => prev
        .map(b => ({ ...b, y: b.y - 10, x: b.x + (b.dx || 0) }))
        .filter(b => b.y > 0 && b.x > 0 && b.x < GAME_WIDTH)
      );

      setEnemyBullets(prev => prev
        .map(b => ({ ...b, y: b.y + 5 }))
        .filter(b => b.y < GAME_HEIGHT)
      );

      setCurrentEnemies(prev => {
        if (prev.length === 0) return prev;
        
        const rightMost = Math.max(...prev.map(e => e.x));
        const leftMost = Math.min(...prev.map(e => e.x));
        
        let newDirection = enemyDirection;
        let moveDown = false;
        
        if (rightMost > GAME_WIDTH - ENEMY_SIZE - 10 && enemyDirection > 0) {
          newDirection = -1;
          moveDown = true;
        } else if (leftMost < 10 && enemyDirection < 0) {
          newDirection = 1;
          moveDown = true;
        }
        
        if (newDirection !== enemyDirection) {
          setEnemyDirection(newDirection);
        }
        
        return prev.map(e => ({
          ...e,
          x: e.x + newDirection * 2,
          y: moveDown ? e.y + 20 : e.y,
        }));
      });

      if (Math.random() < 0.025 && currentEnemies.length > 0) {
        const shooter = currentEnemies[Math.floor(Math.random() * currentEnemies.length)];
        setEnemyBullets(prev => [...prev, {
          x: shooter.x + ENEMY_SIZE / 2,
          y: shooter.y + ENEMY_SIZE,
          question: shooter.question,
          id: Date.now(),
        }]);
      }

      if (!floatingPowerUp && Math.random() < 0.003) {
        const powerUp = powerUps[Math.floor(Math.random() * powerUps.length)];
        setFloatingPowerUp({
          ...powerUp,
          x: Math.random() * (GAME_WIDTH - 40),
          y: 0,
        });
      }

      if (floatingPowerUp) {
        setFloatingPowerUp(prev => {
          if (!prev) return null;
          const newY = prev.y + 2;
          if (newY > GAME_HEIGHT) return null;
          return { ...prev, y: newY };
        });
      }
    }, 1000 / 60);

    return () => clearInterval(gameLoop);
  }, [gameState, enemyDirection, currentEnemies.length, floatingPowerUp]);

  // Collision detection
  useEffect(() => {
    if (gameState !== 'playing') return;

    bullets.forEach(bullet => {
      currentEnemies.forEach(enemy => {
        if (
          bullet.x < enemy.x + ENEMY_SIZE &&
          bullet.x + BULLET_SIZE > enemy.x &&
          bullet.y < enemy.y + ENEMY_SIZE &&
          bullet.y + BULLET_SIZE > enemy.y
        ) {
          const damage = powerUpActive === 'powerShot' ? bullet.ammo.damage + 1 : bullet.ammo.damage;
          
          setCurrentEnemies(prev => {
            const updated = prev.map(e => {
              if (e.uid === enemy.uid) {
                const newHealth = e.currentHealth - damage;
                if (newHealth <= 0) {
                  setScore(s => s + e.points * (1 + combo * 0.1));
                  setCombo(c => c + 1);
                  setQuestionsAnswered(q => q + 1);
                  
                  // ggrks/chprksカウント
                  if (e.era === 'ggrks') {
                    setGgrksCount(c => c + 1);
                  } else if (e.era === 'chprks') {
                    setChprksCount(c => c + 1);
                  }
                  
                  setShowExplosion(exp => [...exp, { x: e.x, y: e.y, id: Date.now() }]);
                  setCurrentAnswer({ enemy: e, question: e.question, answer: e.answer });
                  setGameState('answer');
                  return null;
                }
                return { ...e, currentHealth: newHealth };
              }
              return e;
            });
            return updated.filter(e => e !== null);
          });
          
          setBullets(prev => prev.filter(b => b.id !== bullet.id));
        }
      });
    });

    enemyBullets.forEach(bullet => {
      if (
        bullet.x < playerX + PLAYER_WIDTH &&
        bullet.x + BULLET_SIZE > playerX &&
        bullet.y < GAME_HEIGHT - 20 &&
        bullet.y + BULLET_SIZE > GAME_HEIGHT - PLAYER_HEIGHT - 20
      ) {
        setEnemyBullets(prev => prev.filter(b => b.id !== bullet.id));
        setLives(prev => {
          const newLives = prev - 1;
          if (newLives <= 0) {
            setGameState('gameover');
            if (score > highScore) setHighScore(score);
          }
          return newLives;
        });
        setCombo(0);
      }
    });

    if (floatingPowerUp) {
      if (
        floatingPowerUp.x < playerX + PLAYER_WIDTH &&
        floatingPowerUp.x + 40 > playerX &&
        floatingPowerUp.y < GAME_HEIGHT - 20 &&
        floatingPowerUp.y + 40 > GAME_HEIGHT - PLAYER_HEIGHT - 20
      ) {
        if (floatingPowerUp.effect === 'extraLife') {
          setLives(prev => Math.min(prev + 1, 5));
        } else {
          setPowerUpActive(floatingPowerUp.effect);
          setTimeout(() => setPowerUpActive(null), 12000);
        }
        setFloatingPowerUp(null);
      }
    }

    if (currentEnemies.some(e => e.y > GAME_HEIGHT - 120)) {
      setGameState('gameover');
      if (score > highScore) setHighScore(score);
    }

    setTimeout(() => setShowExplosion([]), 300);
  }, [bullets, enemyBullets, currentEnemies, playerX, floatingPowerUp, gameState, combo, score, highScore, powerUpActive]);

  // Level complete
  useEffect(() => {
    if (gameState === 'playing' && currentEnemies.length === 0) {
      setLevel(prev => prev + 1);
      initializeEnemies(level + 1);
    }
  }, [currentEnemies.length, gameState, level, initializeEnemies]);

  const continueGame = () => {
    setCurrentAnswer(null);
    setGameState('playing');
  };

  const getRank = () => {
    if (score >= 10000) return { name: '自己解決の神', icon: '🌟', color: 'text-yellow-400' };
    if (score >= 7000) return { name: 'ggrks & chprks マスター', icon: '👑', color: 'text-purple-400' };
    if (score >= 4000) return { name: 'AI時代の賢者', icon: '🤖', color: 'text-cyan-400' };
    if (score >= 2000) return { name: '検索の達人', icon: '🔍', color: 'text-green-400' };
    if (score >= 800) return { name: '自己解決見習い', icon: '📚', color: 'text-blue-400' };
    return { name: '質問初心者', icon: '🐣', color: 'text-gray-400' };
  };

  const getEraColor = (era) => {
    if (era === 'ggrks') return 'border-green-500 bg-green-500/20';
    if (era === 'chprks') return 'border-cyan-500 bg-cyan-500/20';
    return 'border-yellow-500 bg-yellow-500/20';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-indigo-950 to-black flex items-center justify-center p-4">
      <div className="relative">
        {/* Game Container */}
        <div 
          className="relative border-4 border-cyan-500 rounded-xl overflow-hidden shadow-2xl shadow-cyan-500/30"
          style={{ width: GAME_WIDTH, height: GAME_HEIGHT, background: 'linear-gradient(180deg, #0a0a1a 0%, #1a0a2e 50%, #0a1a2a 100%)' }}
          onTouchMove={handleTouchMove}
          onTouchStart={() => gameState === 'playing' && shoot()}
        >
          {/* Animated grid background */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
              backgroundImage: 'linear-gradient(cyan 1px, transparent 1px), linear-gradient(90deg, cyan 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }} />
          </div>

          {/* Title Screen */}
          {gameState === 'title' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-50 p-4">
              <div className="text-center">
                {/* Logo Image */}
                <div className="mb-2">
                  <img 
                    src="/api/files/1764398801494_image.png" 
                    alt="chprks チャピレカス" 
                    className="w-56 mx-auto rounded-lg shadow-lg shadow-cyan-500/30"
                    style={{ filter: 'drop-shadow(0 0 20px rgba(34, 211, 238, 0.5))' }}
                  />
                </div>
                <div className="mb-3">
                  <p className="text-cyan-400 text-2xl font-black tracking-widest animate-pulse">INVADERS</p>
                </div>

                {/* ggrks → chprks 進化表示 */}
                <div className="flex items-center justify-center gap-2 mb-4 text-sm">
                  <span className="px-2 py-1 bg-green-500/20 border border-green-500 rounded text-green-400 font-mono font-bold">ggrks</span>
                  <span className="text-gray-500">→</span>
                  <span className="px-2 py-1 bg-cyan-500/20 border border-cyan-500 rounded text-cyan-400 font-mono font-bold">chprks</span>
                </div>

                {/* Enemy preview */}
                <div className="flex justify-center gap-2 mb-4">
                  <div className="text-center">
                    <div className="flex gap-1 text-xl mb-1">
                      <span>🔍</span><span>📖</span><span>❓</span>
                    </div>
                    <p className="text-green-400 text-xs">ggrks世代</p>
                  </div>
                  <div className="text-gray-600 flex items-center">|</div>
                  <div className="text-center">
                    <div className="flex gap-1 text-xl mb-1">
                      <span>🙋</span><span>😴</span><span>😱</span>
                    </div>
                    <p className="text-cyan-400 text-xs">chprks世代</p>
                  </div>
                </div>

                <p className="text-gray-400 text-xs mb-6 px-4">
                  「教えて」と聞いてくる質問者たちを<br/>
                  「ggrks!」「chprks!」で撃退せよ！
                </p>

                <button
                  onClick={startGame}
                  className="px-10 py-4 bg-gradient-to-r from-green-500 via-cyan-500 to-purple-600 text-white font-bold rounded-xl text-lg shadow-lg shadow-cyan-500/50 hover:shadow-cyan-400/70 transition-all hover:scale-105"
                >
                  🎮 GAME START
                </button>
                
                <div className="mt-6 text-xs text-gray-600 space-y-1">
                  <p>← → : 移動 | SPACE : 発射</p>
                  <p>1-5 : 弾切り替え</p>
                </div>
                
                {highScore > 0 && (
                  <div className="mt-4 text-yellow-500">
                    <p className="text-xs text-gray-500">HIGH SCORE</p>
                    <p className="text-xl font-bold font-mono">{highScore}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* HUD */}
          {gameState !== 'title' && (
            <div className="absolute top-0 left-0 right-0 p-2 bg-gradient-to-b from-black/80 to-transparent z-40">
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Heart
                      key={i}
                      size={16}
                      className={i < lives ? 'text-red-500 fill-red-500' : 'text-gray-700'}
                    />
                  ))}
                </div>
                <div className="text-center">
                  <p className="text-cyan-400 font-mono text-xl font-bold">{score.toLocaleString()}</p>
                  {combo > 1 && (
                    <p className="text-yellow-400 text-xs animate-pulse font-bold">🔥 x{combo}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-purple-400 text-sm font-bold">WAVE {level}</p>
                </div>
              </div>
              {/* ggrks / chprks カウンター */}
              <div className="flex justify-center gap-3 text-xs">
                <span className="text-green-400 font-mono">ggrks: {ggrksCount}</span>
                <span className="text-gray-600">|</span>
                <span className="text-cyan-400 font-mono">chprks: {chprksCount}</span>
              </div>
            </div>
          )}

          {/* Ammo selector */}
          {gameState === 'playing' && (
            <div className="absolute top-16 left-2 right-2 flex justify-center gap-1 z-30">
              {ammoTypes.map((ammo) => (
                <button
                  key={ammo.id}
                  onClick={() => setCurrentAmmo(ammo)}
                  className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center text-base transition-all ${
                    currentAmmo.id === ammo.id 
                      ? `bg-gradient-to-br ${ammo.color} scale-110 shadow-lg ring-2 ring-white/50` 
                      : 'bg-gray-800/80 opacity-50 hover:opacity-80'
                  }`}
                  title={ammo.name}
                >
                  <span>{ammo.icon}</span>
                  <span className={`text-[8px] ${ammo.era === 'ggrks' ? 'text-green-300' : ammo.era === 'chprks' ? 'text-cyan-300' : 'text-yellow-300'}`}>
                    {ammo.era === 'ggrks' ? 'G' : ammo.era === 'chprks' ? 'C' : '★'}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Power-up indicator */}
          {powerUpActive && (
            <div className="absolute top-[104px] left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1 rounded-full text-xs text-white font-bold animate-pulse z-30 flex items-center gap-1">
              <Sparkles size={12} />
              {powerUpActive === 'speedUp' && '高速移動'}
              {powerUpActive === 'powerShot' && 'パワーUP'}
              {powerUpActive === 'multiShot' && '3方向弾'}
            </div>
          )}

          {/* Enemies */}
          {currentEnemies.map(enemy => (
            <div
              key={enemy.uid}
              className="absolute transition-all duration-75"
              style={{ left: enemy.x, top: enemy.y, width: ENEMY_SIZE, height: ENEMY_SIZE }}
            >
              <div className="relative w-full h-full">
                <div 
                  className={`w-full h-full flex items-center justify-center text-3xl rounded-lg border ${getEraColor(enemy.era)} ${enemy.type === 'boss' ? 'animate-pulse' : ''}`}
                  style={{ animation: 'enemyFloat 1s ease-in-out infinite' }}
                >
                  {enemy.icon}
                </div>
                {enemy.currentHealth > 1 && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all"
                      style={{ width: `${(enemy.currentHealth / enemy.health) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Player bullets */}
          {bullets.map((bullet) => (
            <div
              key={bullet.id}
              className={`absolute rounded-full bg-gradient-to-t ${bullet.ammo.color} shadow-lg`}
              style={{ 
                left: bullet.x, 
                top: bullet.y,
                width: BULLET_SIZE,
                height: BULLET_SIZE * 1.5,
              }}
            />
          ))}

          {/* Floating text */}
          {floatingText.map(ft => (
            <div
              key={ft.id}
              className={`absolute text-xs font-bold pointer-events-none animate-ping ${ft.color}`}
              style={{ left: ft.x - 20, top: ft.y - 20 }}
            >
              {ft.text}
            </div>
          ))}

          {/* Enemy bullets */}
          {enemyBullets.map((bullet) => (
            <div
              key={bullet.id}
              className="absolute"
              style={{ left: bullet.x - 15, top: bullet.y }}
            >
              <div className="bg-red-500/90 text-white text-[8px] px-1.5 py-0.5 rounded shadow-lg shadow-red-500/50">
                ❓
              </div>
            </div>
          ))}

          {/* Floating power-up */}
          {floatingPowerUp && (
            <div
              className="absolute text-3xl"
              style={{ 
                left: floatingPowerUp.x, 
                top: floatingPowerUp.y,
              }}
            >
              <div className="relative animate-bounce">
                <span>{floatingPowerUp.icon}</span>
                <div className="absolute inset-0 bg-white/30 rounded-full blur-md -z-10" />
              </div>
            </div>
          )}

          {/* Explosions */}
          {showExplosion.map(exp => (
            <div
              key={exp.id}
              className="absolute text-4xl animate-ping pointer-events-none"
              style={{ left: exp.x, top: exp.y }}
            >
              💥
            </div>
          ))}

          {/* Player */}
          {gameState === 'playing' && (
            <div
              className="absolute transition-all duration-50"
              style={{ 
                left: playerX, 
                bottom: 20,
                width: PLAYER_WIDTH,
                height: PLAYER_HEIGHT,
              }}
            >
              <div className="relative w-full h-full flex items-center justify-center">
                <Bot size={40} className="text-cyan-400" />
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-4 h-5 bg-gradient-to-t from-cyan-500 via-purple-400 to-transparent rounded-full animate-pulse opacity-80" />
              </div>
            </div>
          )}

          {/* Paused Screen */}
          {gameState === 'paused' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-50">
              <Pause size={56} className="text-cyan-400 mb-4" />
              <p className="text-white text-2xl font-bold mb-6">PAUSED</p>
              <button
                onClick={() => setGameState('playing')}
                className="px-8 py-3 bg-cyan-500 text-white rounded-xl flex items-center gap-2 font-bold"
              >
                <Play size={24} /> RESUME
              </button>
            </div>
          )}

          {/* Answer Screen */}
          {gameState === 'answer' && currentAnswer && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 z-50 p-4">
              <div className="text-center max-w-xs">
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${
                  currentAnswer.enemy.era === 'ggrks' ? 'bg-green-500/30 text-green-400' :
                  currentAnswer.enemy.era === 'chprks' ? 'bg-cyan-500/30 text-cyan-400' :
                  'bg-yellow-500/30 text-yellow-400'
                }`}>
                  {currentAnswer.enemy.era === 'ggrks' ? '🔍 ggrks世代' : 
                   currentAnswer.enemy.era === 'chprks' ? '🤖 chprks世代' : '👑 BOSS'}
                </div>
                
                <div className="text-5xl mb-3 animate-bounce">{currentAnswer.enemy.icon}</div>
                <p className="text-red-400 text-sm mb-1">💥 撃破！</p>
                <h2 className="text-lg font-bold text-white mb-4">{currentAnswer.enemy.name}</h2>
                
                <div className="bg-gray-800/80 border border-gray-700 rounded-xl p-4 mb-4 text-left">
                  <p className="text-gray-400 text-xs mb-1 flex items-center gap-1">
                    <MessageCircle size={12} /> 質問
                  </p>
                  <p className="text-white text-sm mb-3">「{currentAnswer.question}」</p>
                  
                  <div className="flex items-center gap-2 mb-1">
                    <img 
                      src="/api/files/1764398801494_image.png" 
                      alt="chprks" 
                      className="w-5 h-5 object-contain rounded"
                    />
                    <p className={`text-xs ${currentAnswer.enemy.era === 'ggrks' ? 'text-green-400' : 'text-cyan-400'}`}>
                      正しい対応
                    </p>
                  </div>
                  <p className={`text-sm font-bold ${currentAnswer.enemy.era === 'ggrks' ? 'text-green-300' : 'text-cyan-300'}`}>
                    {currentAnswer.answer}
                  </p>
                </div>
                
                <div className="flex items-center justify-center gap-2 text-yellow-400 mb-6">
                  <Star size={20} className="fill-yellow-400" />
                  <span className="font-bold text-xl">+{currentAnswer.enemy.points}</span>
                </div>
                
                <button
                  onClick={continueGame}
                  className="w-full px-6 py-3 bg-gradient-to-r from-green-500 via-cyan-500 to-purple-600 text-white font-bold rounded-xl"
                >
                  CONTINUE →
                </button>
              </div>
            </div>
          )}

          {/* Game Over Screen */}
          {gameState === 'gameover' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 z-50 p-4">
              <div className="text-center">
                <img 
                  src="/api/files/1764398801494_image.png" 
                  alt="chprks" 
                  className="w-28 mx-auto mb-3 opacity-50 grayscale"
                />
                <p className="text-red-500 text-3xl font-black mb-2 animate-pulse">GAME OVER</p>
                <p className="text-gray-500 text-sm mb-4">質問攻撃に負けてしまった...</p>
                
                <div className="bg-gray-900 border border-cyan-500/50 rounded-xl p-4 mb-4">
                  <p className="text-gray-500 text-xs mb-1">FINAL SCORE</p>
                  <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-cyan-400 to-purple-500 font-mono">
                    {score.toLocaleString()}
                  </p>
                  <div className={`flex items-center justify-center gap-2 mt-2 ${getRank().color}`}>
                    <span className="text-xl">{getRank().icon}</span>
                    <span className="font-bold">{getRank().name}</span>
                  </div>
                </div>
                
                {/* 統計 */}
                <div className="flex justify-center gap-4 mb-4 text-sm">
                  <div className="text-center">
                    <p className="text-green-400 font-mono text-xl font-bold">{ggrksCount}</p>
                    <p className="text-gray-500 text-xs">ggrks撃破</p>
                  </div>
                  <div className="text-center">
                    <p className="text-cyan-400 font-mono text-xl font-bold">{chprksCount}</p>
                    <p className="text-gray-500 text-xs">chprks撃破</p>
                  </div>
                  <div className="text-center">
                    <p className="text-purple-400 font-mono text-xl font-bold">{questionsAnswered}</p>
                    <p className="text-gray-500 text-xs">総撃破数</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <button
                    onClick={startGame}
                    className="w-full px-6 py-3 bg-gradient-to-r from-green-500 via-cyan-500 to-purple-600 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={20} /> RETRY
                  </button>
                  <button
                    onClick={() => setGameState('title')}
                    className="w-full px-6 py-2 bg-gray-800 text-gray-300 rounded-xl"
                  >
                    TITLE
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Touch Controls */}
        {gameState === 'playing' && (
          <div className="mt-4 flex justify-center gap-4">
            <button
              onTouchStart={() => setPlayerX(prev => Math.max(0, prev - 25))}
              onClick={() => setPlayerX(prev => Math.max(0, prev - 25))}
              className="w-16 h-16 bg-gray-800 border-2 border-cyan-500/50 rounded-2xl flex items-center justify-center text-cyan-400 text-2xl active:bg-cyan-900/50 active:scale-95 transition-all"
            >
              ◀
            </button>
            <button
              onTouchStart={shoot}
              onClick={shoot}
              className="w-24 h-16 bg-gradient-to-r from-green-500 via-cyan-500 to-purple-600 rounded-2xl flex flex-col items-center justify-center active:scale-95 transition-all shadow-lg shadow-cyan-500/30"
            >
              <span className="text-white font-bold text-xs">ggrks!</span>
              <span className="text-white font-bold text-xs">chprks!</span>
            </button>
            <button
              onTouchStart={() => setPlayerX(prev => Math.min(GAME_WIDTH - PLAYER_WIDTH, prev + 25))}
              onClick={() => setPlayerX(prev => Math.min(GAME_WIDTH - PLAYER_WIDTH, prev + 25))}
              className="w-16 h-16 bg-gray-800 border-2 border-cyan-500/50 rounded-2xl flex items-center justify-center text-cyan-400 text-2xl active:bg-cyan-900/50 active:scale-95 transition-all"
            >
              ▶
            </button>
          </div>
        )}

        {/* Tips */}
        {gameState === 'playing' && (
          <p className="mt-3 text-center text-gray-600 text-xs">
            🔍 ggrks世代 → 🤖 chprks世代 の進化を体験せよ！
          </p>
        )}
      </div>

      <style jsx>{`
        @keyframes enemyFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
      `}</style>
    </div>
  );
}
