import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Heart, Star, RefreshCw, Pause, Play, Sparkles, Shield, Zap } from 'lucide-react';

// 敵キャラクター - ggrks世代とchprks世代
const enemyTypes = [
  // ggrks世代（緑系）
  { id: 'g1', era: 'ggrks', name: 'ググらない君', icon: '🔍', color: '#22c55e', points: 100, health: 1, speed: 2, size: 36, question: 'このエラーってなに？', answer: 'ggrks！エラーメッセージでググれ' },
  { id: 'g2', era: 'ggrks', name: 'Wiki見ない奴', icon: '📖', color: '#16a34a', points: 120, health: 1, speed: 2.5, size: 36, question: 'この用語の意味教えて', answer: 'ggrks！Wikipediaくらい見ろ' },
  { id: 'g3', era: 'ggrks', name: '検索できない人', icon: '❓', color: '#15803d', points: 150, health: 2, speed: 1.5, size: 42, question: '〇〇のやり方がわからない', answer: 'ggrks！検索ワード工夫しろ' },
  
  // chprks世代（シアン系）
  { id: 'c1', era: 'chprks', name: '初歩的質問マン', icon: '🙋', color: '#06b6d4', points: 100, health: 1, speed: 2, size: 36, question: 'Pythonのインストール方法教えて', answer: 'chprks！ChatGPTに聞け' },
  { id: 'c2', era: 'chprks', name: 'AI使えない君', icon: '😴', color: '#0891b2', points: 150, health: 1, speed: 2.5, size: 36, question: 'エラーが出たんだけど...', answer: 'chprks！エラーをAIに貼れ' },
  { id: 'c3', era: 'chprks', name: '緊急質問野郎', icon: '😱', color: '#0e7490', points: 200, health: 2, speed: 3, size: 38, question: '【急募】明日までに覚えたい', answer: 'chprks！AIにロードマップ作らせろ' },
  { id: 'c4', era: 'chprks', name: 'コピペ願望者', icon: '📋', color: '#155e75', points: 120, health: 1, speed: 2, size: 36, question: 'コード全部書いて', answer: 'chprks！AIに書かせて理解しろ' },
  { id: 'c5', era: 'chprks', name: '何度も聞くマン', icon: '🔄', color: '#164e63', points: 180, health: 2, speed: 1.8, size: 40, question: '前も聞いたけどもう一回...', answer: 'chprks！AIの履歴見ろ' },
  
  // ボス
  { id: 'b1', era: 'boss', name: '教えてクレクレ大王', icon: '👑', color: '#eab308', points: 1000, health: 20, speed: 1, size: 64, question: '全部教えて！！！', answer: 'ggrks → chprks の進化を学べ！', isBoss: true },
  { id: 'b2', era: 'boss', name: '自助努力ゼロ魔王', icon: '👿', color: '#dc2626', points: 1500, health: 30, speed: 0.8, size: 72, question: '調べるの面倒だから教えて', answer: 'まずググれ！ダメならAIに聞け！', isBoss: true },
];

// パワーアップアイテム
const powerUpTypes = [
  { id: 'p1', name: 'Google先生', icon: '🔎', effect: 'power', duration: 10000, color: '#22c55e' },
  { id: 'p2', name: 'ChatGPT Plus', icon: '⚡', effect: 'rapid', duration: 8000, color: '#06b6d4' },
  { id: 'p3', name: 'Copilot', icon: '🤝', effect: 'spread', duration: 10000, color: '#8b5cf6' },
  { id: 'p4', name: 'Claude', icon: '🧡', effect: 'shield', duration: 12000, color: '#f97316' },
  { id: 'p5', name: 'Perplexity', icon: '🔮', effect: 'homing', duration: 8000, color: '#ec4899' },
];

const GAME_WIDTH = 380;
const GAME_HEIGHT = 600;
const PLAYER_SIZE = 44;

export default function ChprksShooter() {
  const [gameState, setGameState] = useState('title'); // title, playing, paused, boss, gameover, victory
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [wave, setWave] = useState(1);
  const [player, setPlayer] = useState({ x: GAME_WIDTH / 2, y: GAME_HEIGHT - 80 });
  const [bullets, setBullets] = useState([]);
  const [enemies, setEnemies] = useState([]);
  const [enemyBullets, setEnemyBullets] = useState([]);
  const [explosions, setExplosions] = useState([]);
  const [powerUps, setPowerUps] = useState([]);
  const [activePowerUp, setActivePowerUp] = useState(null);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [destroyedInfo, setDestroyedInfo] = useState(null);
  const [ggrksCount, setGgrksCount] = useState(0);
  const [chprksCount, setChprksCount] = useState(0);
  const [bossHealth, setBossHealth] = useState(0);
  const [bossMaxHealth, setBossMaxHealth] = useState(0);
  const [isInvincible, setIsInvincible] = useState(false);
  const [scrollOffset, setScrollOffset] = useState(0);
  
  const gameRef = useRef(null);
  const keysRef = useRef({});
  const lastShotRef = useRef(0);
  const frameRef = useRef(0);

  // スポーン敵
  const spawnEnemy = useCallback(() => {
    const isBossWave = wave % 5 === 0;
    
    if (isBossWave && enemies.length === 0 && !enemies.some(e => e.isBoss)) {
      const bossType = enemyTypes.find(e => e.id === (wave % 10 === 0 ? 'b2' : 'b1'));
      const boss = {
        ...bossType,
        uid: Date.now(),
        x: GAME_WIDTH / 2,
        y: -bossType.size,
        targetY: 80,
        currentHealth: bossType.health + wave * 2,
        phase: 0,
      };
      setBossHealth(boss.currentHealth);
      setBossMaxHealth(boss.currentHealth);
      setEnemies([boss]);
      setGameState('boss');
      return;
    }
    
    if (isBossWave) return;
    
    // 通常敵
    const ggrksTypes = enemyTypes.filter(e => e.era === 'ggrks');
    const chprksTypes = enemyTypes.filter(e => e.era === 'chprks');
    
    // waveが進むとchprks率が上がる
    const chprksRate = Math.min(0.3 + wave * 0.1, 0.8);
    const pool = Math.random() < chprksRate ? chprksTypes : ggrksTypes;
    const type = pool[Math.floor(Math.random() * pool.length)];
    
    const enemy = {
      ...type,
      uid: Date.now() + Math.random(),
      x: Math.random() * (GAME_WIDTH - type.size * 2) + type.size,
      y: -type.size,
      currentHealth: type.health,
      movePattern: Math.floor(Math.random() * 3), // 0: straight, 1: sine, 2: zigzag
      moveOffset: Math.random() * Math.PI * 2,
    };
    
    setEnemies(prev => [...prev, enemy]);
  }, [wave, enemies]);

  // ゲーム開始
  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLives(3);
    setWave(1);
    setPlayer({ x: GAME_WIDTH / 2, y: GAME_HEIGHT - 80 });
    setBullets([]);
    setEnemies([]);
    setEnemyBullets([]);
    setExplosions([]);
    setPowerUps([]);
    setActivePowerUp(null);
    setCombo(0);
    setMaxCombo(0);
    setGgrksCount(0);
    setChprksCount(0);
    setIsInvincible(false);
  };

  // 弾発射
  const shoot = useCallback(() => {
    const now = Date.now();
    const cooldown = activePowerUp?.effect === 'rapid' ? 80 : 150;
    if (now - lastShotRef.current < cooldown) return;
    lastShotRef.current = now;

    const newBullets = [];
    const bulletBase = { 
      x: player.x, 
      y: player.y - PLAYER_SIZE / 2,
      damage: activePowerUp?.effect === 'power' ? 2 : 1,
      isHoming: activePowerUp?.effect === 'homing',
    };

    if (activePowerUp?.effect === 'spread') {
      // 5方向弾
      for (let i = -2; i <= 2; i++) {
        newBullets.push({
          ...bulletBase,
          id: Date.now() + i,
          angle: -90 + i * 15,
          speed: 12,
        });
      }
    } else {
      // 通常弾（または強化弾）
      newBullets.push({
        ...bulletBase,
        id: Date.now(),
        angle: -90,
        speed: 14,
      });
      if (activePowerUp?.effect === 'power') {
        newBullets.push(
          { ...bulletBase, id: Date.now() + 1, x: player.x - 15, angle: -90, speed: 14 },
          { ...bulletBase, id: Date.now() + 2, x: player.x + 15, angle: -90, speed: 14 }
        );
      }
    }

    setBullets(prev => [...prev, ...newBullets]);
  }, [player, activePowerUp]);

  // キーボード入力
  useEffect(() => {
    const handleKeyDown = (e) => {
      keysRef.current[e.key] = true;
      if (e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault();
      }
      if (e.key === 'Escape' && gameState === 'playing') {
        setGameState('paused');
      }
      if (e.key === 'Escape' && gameState === 'paused') {
        setGameState('playing');
      }
    };
    const handleKeyUp = (e) => {
      keysRef.current[e.key] = false;
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  // タッチ操作
  const handleTouchMove = (e) => {
    if (gameState !== 'playing' && gameState !== 'boss') return;
    const touch = e.touches[0];
    const rect = gameRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    setPlayer({
      x: Math.max(PLAYER_SIZE / 2, Math.min(GAME_WIDTH - PLAYER_SIZE / 2, x)),
      y: Math.max(PLAYER_SIZE / 2, Math.min(GAME_HEIGHT - PLAYER_SIZE / 2, y)),
    });
  };

  // メインゲームループ
  useEffect(() => {
    if (gameState !== 'playing' && gameState !== 'boss') return;

    const gameLoop = setInterval(() => {
      frameRef.current++;
      setScrollOffset(prev => (prev + 2) % 40);
      
      // プレイヤー移動
      const speed = 6;
      setPlayer(prev => {
        let newX = prev.x;
        let newY = prev.y;
        if (keysRef.current['ArrowLeft'] || keysRef.current['a']) newX -= speed;
        if (keysRef.current['ArrowRight'] || keysRef.current['d']) newX += speed;
        if (keysRef.current['ArrowUp'] || keysRef.current['w']) newY -= speed;
        if (keysRef.current['ArrowDown'] || keysRef.current['s']) newY += speed;
        return {
          x: Math.max(PLAYER_SIZE / 2, Math.min(GAME_WIDTH - PLAYER_SIZE / 2, newX)),
          y: Math.max(PLAYER_SIZE / 2, Math.min(GAME_HEIGHT - PLAYER_SIZE / 2, newY)),
        };
      });

      // 自動発射
      if (keysRef.current[' '] || keysRef.current['z']) {
        shoot();
      }

      // 弾移動
      setBullets(prev => prev.map(b => {
        let angle = b.angle;
        
        // ホーミング処理
        if (b.isHoming && enemies.length > 0) {
          const nearestEnemy = enemies.reduce((nearest, enemy) => {
            const dist = Math.hypot(enemy.x - b.x, enemy.y - b.y);
            return dist < nearest.dist ? { enemy, dist } : nearest;
          }, { enemy: null, dist: Infinity });
          
          if (nearestEnemy.enemy) {
            const targetAngle = Math.atan2(nearestEnemy.enemy.y - b.y, nearestEnemy.enemy.x - b.x) * 180 / Math.PI;
            const diff = targetAngle - angle;
            angle += Math.sign(diff) * Math.min(Math.abs(diff), 5);
          }
        }
        
        const rad = angle * Math.PI / 180;
        return {
          ...b,
          x: b.x + Math.cos(rad) * b.speed,
          y: b.y + Math.sin(rad) * b.speed,
          angle,
        };
      }).filter(b => b.y > -20 && b.y < GAME_HEIGHT + 20 && b.x > -20 && b.x < GAME_WIDTH + 20));

      // 敵移動
      setEnemies(prev => prev.map(e => {
        if (e.isBoss) {
          // ボス移動
          let newY = e.y;
          if (e.y < e.targetY) {
            newY = Math.min(e.y + 1, e.targetY);
          }
          
          // ボス左右移動
          const bossX = GAME_WIDTH / 2 + Math.sin(frameRef.current * 0.02) * (GAME_WIDTH / 3);
          
          return { ...e, x: bossX, y: newY };
        }
        
        // 通常敵移動パターン
        let newX = e.x;
        const newY = e.y + e.speed;
        
        if (e.movePattern === 1) {
          // サイン波
          newX = e.x + Math.sin(frameRef.current * 0.05 + e.moveOffset) * 2;
        } else if (e.movePattern === 2) {
          // ジグザグ
          newX = e.x + (Math.floor(frameRef.current / 30) % 2 === 0 ? 1.5 : -1.5);
        }
        
        newX = Math.max(e.size / 2, Math.min(GAME_WIDTH - e.size / 2, newX));
        
        return { ...e, x: newX, y: newY };
      }).filter(e => e.y < GAME_HEIGHT + 50));

      // 敵弾移動
      setEnemyBullets(prev => prev.map(b => ({
        ...b,
        x: b.x + Math.cos(b.angle * Math.PI / 180) * b.speed,
        y: b.y + Math.sin(b.angle * Math.PI / 180) * b.speed,
      })).filter(b => b.y < GAME_HEIGHT + 20 && b.y > -20 && b.x > -20 && b.x < GAME_WIDTH + 20));

      // パワーアップ移動
      setPowerUps(prev => prev.map(p => ({
        ...p,
        y: p.y + 1.5,
      })).filter(p => p.y < GAME_HEIGHT + 30));

      // 敵弾発射
      setEnemies(prev => {
        prev.forEach(e => {
          if (e.isBoss && e.y >= e.targetY) {
            // ボス弾幕
            if (frameRef.current % 20 === 0) {
              const angleToPlayer = Math.atan2(player.y - e.y, player.x - e.x) * 180 / Math.PI;
              setEnemyBullets(eb => [...eb, 
                { id: Date.now(), x: e.x, y: e.y + e.size / 2, angle: angleToPlayer, speed: 4 },
                { id: Date.now() + 1, x: e.x, y: e.y + e.size / 2, angle: angleToPlayer - 15, speed: 4 },
                { id: Date.now() + 2, x: e.x, y: e.y + e.size / 2, angle: angleToPlayer + 15, speed: 4 },
              ]);
            }
            if (frameRef.current % 60 === 0) {
              // 円形弾幕
              for (let i = 0; i < 12; i++) {
                setEnemyBullets(eb => [...eb, {
                  id: Date.now() + i,
                  x: e.x,
                  y: e.y + e.size / 2,
                  angle: i * 30 + frameRef.current,
                  speed: 3,
                }]);
              }
            }
          } else if (Math.random() < 0.005) {
            const angleToPlayer = Math.atan2(player.y - e.y, player.x - e.x) * 180 / Math.PI;
            setEnemyBullets(eb => [...eb, {
              id: Date.now() + Math.random(),
              x: e.x,
              y: e.y + e.size / 2,
              angle: angleToPlayer,
              speed: 3,
            }]);
          }
        });
        return prev;
      });

      // 敵スポーン
      if (gameState === 'playing' && frameRef.current % 60 === 0) {
        spawnEnemy();
      }

      // エフェクト消去
      setExplosions(prev => prev.filter(e => Date.now() - e.time < 300));
      
    }, 1000 / 60);

    return () => clearInterval(gameLoop);
  }, [gameState, shoot, spawnEnemy, player]);

  // 当たり判定
  useEffect(() => {
    if (gameState !== 'playing' && gameState !== 'boss') return;

    // 弾 vs 敵
    bullets.forEach(bullet => {
      enemies.forEach(enemy => {
        const dist = Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y);
        if (dist < enemy.size / 2 + 8) {
          // ヒット
          setBullets(prev => prev.filter(b => b.id !== bullet.id));
          
          setEnemies(prev => {
            const updated = prev.map(e => {
              if (e.uid === enemy.uid) {
                const newHealth = e.currentHealth - bullet.damage;
                if (newHealth <= 0) {
                  // 撃破
                  setScore(s => s + e.points * (1 + combo * 0.05));
                  setCombo(c => {
                    const newCombo = c + 1;
                    setMaxCombo(m => Math.max(m, newCombo));
                    return newCombo;
                  });
                  
                  if (e.era === 'ggrks') setGgrksCount(c => c + 1);
                  else if (e.era === 'chprks') setChprksCount(c => c + 1);
                  
                  setExplosions(exp => [...exp, { x: e.x, y: e.y, time: Date.now(), size: e.size }]);
                  setDestroyedInfo({ enemy: e });
                  setTimeout(() => setDestroyedInfo(null), 2000);
                  
                  // パワーアップドロップ
                  if (Math.random() < 0.15 || e.isBoss) {
                    const powerUp = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
                    setPowerUps(p => [...p, { ...powerUp, uid: Date.now(), x: e.x, y: e.y }]);
                  }
                  
                  // ボス撃破
                  if (e.isBoss) {
                    setWave(w => w + 1);
                    setGameState('playing');
                  }
                  
                  return null;
                }
                
                if (e.isBoss) {
                  setBossHealth(newHealth);
                }
                
                return { ...e, currentHealth: newHealth };
              }
              return e;
            });
            return updated.filter(e => e !== null);
          });
        }
      });
    });

    // 敵弾 vs プレイヤー
    if (!isInvincible && activePowerUp?.effect !== 'shield') {
      enemyBullets.forEach(bullet => {
        const dist = Math.hypot(bullet.x - player.x, bullet.y - player.y);
        if (dist < PLAYER_SIZE / 3 + 6) {
          setEnemyBullets(prev => prev.filter(b => b.id !== bullet.id));
          setLives(prev => {
            const newLives = prev - 1;
            if (newLives <= 0) {
              setGameState('gameover');
              setHighScore(h => Math.max(h, score));
            }
            return newLives;
          });
          setCombo(0);
          setIsInvincible(true);
          setTimeout(() => setIsInvincible(false), 2000);
        }
      });
    }

    // 敵 vs プレイヤー
    if (!isInvincible && activePowerUp?.effect !== 'shield') {
      enemies.forEach(enemy => {
        const dist = Math.hypot(enemy.x - player.x, enemy.y - player.y);
        if (dist < PLAYER_SIZE / 2 + enemy.size / 2 - 10) {
          setLives(prev => {
            const newLives = prev - 1;
            if (newLives <= 0) {
              setGameState('gameover');
              setHighScore(h => Math.max(h, score));
            }
            return newLives;
          });
          setCombo(0);
          setIsInvincible(true);
          setTimeout(() => setIsInvincible(false), 2000);
        }
      });
    }

    // パワーアップ取得
    powerUps.forEach(powerUp => {
      const dist = Math.hypot(powerUp.x - player.x, powerUp.y - player.y);
      if (dist < PLAYER_SIZE / 2 + 20) {
        setPowerUps(prev => prev.filter(p => p.uid !== powerUp.uid));
        setActivePowerUp(powerUp);
        setTimeout(() => setActivePowerUp(null), powerUp.duration);
      }
    });

    // Wave進行
    if (gameState === 'playing' && enemies.length === 0 && frameRef.current > 120) {
      if (wave % 5 !== 0) {
        // 次のWaveへ
        setTimeout(() => {
          setWave(w => w + 1);
        }, 1000);
      }
    }
  }, [bullets, enemies, enemyBullets, powerUps, player, isInvincible, activePowerUp, gameState, score, combo, wave]);

  const getRank = () => {
    if (score >= 30000) return { name: '自己解決の神', icon: '🌟', color: 'text-yellow-400' };
    if (score >= 20000) return { name: 'ggrks & chprks マスター', icon: '👑', color: 'text-purple-400' };
    if (score >= 10000) return { name: 'AI時代の賢者', icon: '🤖', color: 'text-cyan-400' };
    if (score >= 5000) return { name: '検索の達人', icon: '🔍', color: 'text-green-400' };
    if (score >= 2000) return { name: '自己解決見習い', icon: '📚', color: 'text-blue-400' };
    return { name: '質問初心者', icon: '🐣', color: 'text-gray-400' };
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-2">
      <div className="relative">
        {/* ゲーム画面 */}
        <div
          ref={gameRef}
          className="relative overflow-hidden rounded-lg border-2 border-cyan-500 shadow-2xl shadow-cyan-500/30"
          style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
          onTouchMove={handleTouchMove}
          onTouchStart={(e) => {
            handleTouchMove(e);
            if (gameState === 'playing' || gameState === 'boss') shoot();
          }}
        >
          {/* 背景 */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, #0a0a1a 0%, #1a0a2e 50%, #0a1a2a 100%)',
            }}
          >
            {/* スクロールするグリッド */}
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: 'linear-gradient(rgba(6,182,212,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.3) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
                transform: `translateY(${scrollOffset}px)`,
              }}
            />
            {/* 星 */}
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute bg-white rounded-full"
                style={{
                  width: Math.random() * 2 + 1,
                  height: Math.random() * 2 + 1,
                  left: `${(i * 37) % 100}%`,
                  top: `${((i * 73 + scrollOffset * 2) % 120) - 10}%`,
                  opacity: 0.5 + Math.random() * 0.5,
                }}
              />
            ))}
          </div>

          {/* タイトル画面 */}
          {gameState === 'title' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-50 p-4">
              <img 
                src="/api/files/1764398801494_image.png" 
                alt="chprks" 
                className="w-64 mb-2 rounded-lg"
                style={{ filter: 'drop-shadow(0 0 30px rgba(6,182,212,0.6))' }}
              />
              <h2 className="text-2xl font-black text-cyan-400 tracking-widest mb-4 animate-pulse">SHOOTING</h2>
              
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-green-500/20 border border-green-500 rounded text-green-400 font-mono text-sm">ggrks</span>
                <span className="text-gray-500">→</span>
                <span className="px-3 py-1 bg-cyan-500/20 border border-cyan-500 rounded text-cyan-400 font-mono text-sm">chprks</span>
              </div>
              
              <p className="text-gray-400 text-sm mb-6 text-center">
                質問してくる敵を撃退せよ！<br/>
                ggrks世代からchprks世代へ...
              </p>
              
              <button
                onClick={startGame}
                className="px-12 py-4 bg-gradient-to-r from-green-500 via-cyan-500 to-purple-600 text-white font-bold rounded-xl text-xl shadow-lg hover:scale-105 transition-transform"
              >
                START
              </button>
              
              <div className="mt-6 text-xs text-gray-600 text-center space-y-1">
                <p>移動: ← → ↑ ↓ / WASD</p>
                <p>発射: SPACE / Z (長押し)</p>
                <p>タッチ操作対応</p>
              </div>
              
              {highScore > 0 && (
                <p className="mt-4 text-yellow-500 font-mono">HIGH SCORE: {highScore.toLocaleString()}</p>
              )}
            </div>
          )}

          {/* HUD */}
          {(gameState === 'playing' || gameState === 'boss' || gameState === 'paused') && (
            <>
              <div className="absolute top-2 left-2 right-2 flex justify-between items-start z-40">
                <div>
                  <div className="flex gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Heart key={i} size={18} className={i < lives ? 'text-red-500 fill-red-500' : 'text-gray-700'} />
                    ))}
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className="text-green-400 font-mono">G:{ggrksCount}</span>
                    <span className="text-cyan-400 font-mono">C:{chprksCount}</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-cyan-400 font-mono text-2xl font-bold">{score.toLocaleString()}</p>
                  {combo > 1 && (
                    <p className="text-yellow-400 text-sm font-bold animate-pulse">{combo} COMBO!</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-purple-400 font-bold">WAVE {wave}</p>
                  {activePowerUp && (
                    <div className="flex items-center gap-1 text-xs mt-1 bg-black/50 px-2 py-1 rounded">
                      <span>{activePowerUp.icon}</span>
                      <span style={{ color: activePowerUp.color }}>{activePowerUp.name}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* ボスHP */}
              {gameState === 'boss' && bossMaxHealth > 0 && (
                <div className="absolute top-14 left-4 right-4 z-40">
                  <div className="h-3 bg-gray-800 rounded-full overflow-hidden border border-red-500/50">
                    <div 
                      className="h-full bg-gradient-to-r from-red-600 to-orange-500 transition-all duration-200"
                      style={{ width: `${(bossHealth / bossMaxHealth) * 100}%` }}
                    />
                  </div>
                  <p className="text-center text-red-400 text-xs mt-1 font-bold">BOSS</p>
                </div>
              )}
            </>
          )}

          {/* 敵 */}
          {enemies.map(enemy => (
            <div
              key={enemy.uid}
              className="absolute flex items-center justify-center transition-all duration-75"
              style={{
                left: enemy.x - enemy.size / 2,
                top: enemy.y - enemy.size / 2,
                width: enemy.size,
                height: enemy.size,
              }}
            >
              <div 
                className={`w-full h-full rounded-lg flex items-center justify-center border-2 ${enemy.isBoss ? 'animate-pulse' : ''}`}
                style={{ 
                  borderColor: enemy.color,
                  backgroundColor: `${enemy.color}33`,
                  fontSize: enemy.size * 0.6,
                }}
              >
                {enemy.icon}
              </div>
            </div>
          ))}

          {/* プレイヤー弾 */}
          {bullets.map(bullet => (
            <div
              key={bullet.id}
              className="absolute w-3 h-5 rounded-full"
              style={{
                left: bullet.x - 6,
                top: bullet.y - 10,
                background: bullet.isHoming 
                  ? 'linear-gradient(to top, #ec4899, #f472b6)' 
                  : 'linear-gradient(to top, #06b6d4, #22d3ee)',
                boxShadow: bullet.isHoming 
                  ? '0 0 10px #ec4899' 
                  : '0 0 10px #06b6d4',
                transform: `rotate(${bullet.angle + 90}deg)`,
              }}
            />
          ))}

          {/* 敵弾 */}
          {enemyBullets.map(bullet => (
            <div
              key={bullet.id}
              className="absolute w-3 h-3 rounded-full bg-red-500"
              style={{
                left: bullet.x - 6,
                top: bullet.y - 6,
                boxShadow: '0 0 8px #ef4444',
              }}
            />
          ))}

          {/* パワーアップ */}
          {powerUps.map(p => (
            <div
              key={p.uid}
              className="absolute w-10 h-10 flex items-center justify-center text-2xl animate-bounce"
              style={{ left: p.x - 20, top: p.y - 20 }}
            >
              <div 
                className="absolute inset-0 rounded-full opacity-50"
                style={{ backgroundColor: p.color, filter: 'blur(8px)' }}
              />
              <span className="relative z-10">{p.icon}</span>
            </div>
          ))}

          {/* 爆発 */}
          {explosions.map((exp, i) => (
            <div
              key={i}
              className="absolute pointer-events-none animate-ping"
              style={{ 
                left: exp.x - exp.size / 2, 
                top: exp.y - exp.size / 2,
                fontSize: exp.size,
              }}
            >
              💥
            </div>
          ))}

          {/* プレイヤー */}
          {(gameState === 'playing' || gameState === 'boss') && (
            <div
              className={`absolute transition-all duration-50 ${isInvincible ? 'animate-pulse opacity-50' : ''}`}
              style={{
                left: player.x - PLAYER_SIZE / 2,
                top: player.y - PLAYER_SIZE / 2,
                width: PLAYER_SIZE,
                height: PLAYER_SIZE,
              }}
            >
              <div className="relative w-full h-full">
                {/* シールドエフェクト */}
                {activePowerUp?.effect === 'shield' && (
                  <div className="absolute inset-0 -m-2 rounded-full border-2 border-orange-400 animate-pulse" 
                       style={{ boxShadow: '0 0 20px #f97316' }} />
                )}
                {/* 機体 */}
                <div className="w-full h-full flex items-center justify-center text-4xl">
                  🚀
                </div>
                {/* エンジン炎 */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-6 bg-gradient-to-t from-cyan-400 via-blue-500 to-transparent rounded-full animate-pulse opacity-80" />
              </div>
            </div>
          )}

          {/* 撃破情報 */}
          {destroyedInfo && (
            <div className="absolute bottom-20 left-4 right-4 bg-black/80 border border-cyan-500/50 rounded-lg p-3 z-40 animate-pulse">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{destroyedInfo.enemy.icon}</span>
                <div className="flex-1">
                  <p className={`text-sm font-bold ${destroyedInfo.enemy.era === 'ggrks' ? 'text-green-400' : 'text-cyan-400'}`}>
                    {destroyedInfo.enemy.name} 撃破！
                  </p>
                  <p className="text-gray-400 text-xs truncate">「{destroyedInfo.enemy.question}」</p>
                  <p className="text-yellow-400 text-xs">{destroyedInfo.enemy.answer}</p>
                </div>
              </div>
            </div>
          )}

          {/* ポーズ画面 */}
          {gameState === 'paused' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-50">
              <Pause size={64} className="text-cyan-400 mb-4" />
              <p className="text-white text-3xl font-bold mb-6">PAUSED</p>
              <button
                onClick={() => setGameState('playing')}
                className="px-8 py-3 bg-cyan-500 text-white rounded-xl flex items-center gap-2 font-bold text-lg"
              >
                <Play size={24} /> RESUME
              </button>
            </div>
          )}

          {/* ゲームオーバー */}
          {gameState === 'gameover' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-50 p-4">
              <img 
                src="/api/files/1764398801494_image.png" 
                alt="chprks" 
                className="w-32 mb-4 opacity-50 grayscale"
              />
              <p className="text-red-500 text-4xl font-black mb-2 animate-pulse">GAME OVER</p>
              
              <div className="bg-gray-900/80 border border-cyan-500/50 rounded-xl p-5 mb-4 w-full max-w-xs">
                <p className="text-gray-500 text-sm text-center">SCORE</p>
                <p className="text-4xl font-black text-center bg-gradient-to-r from-green-400 via-cyan-400 to-purple-500 bg-clip-text text-transparent font-mono">
                  {score.toLocaleString()}
                </p>
                <div className={`flex items-center justify-center gap-2 mt-2 ${getRank().color}`}>
                  <span className="text-2xl">{getRank().icon}</span>
                  <span className="font-bold">{getRank().name}</span>
                </div>
                
                <div className="flex justify-around mt-4 pt-4 border-t border-gray-700">
                  <div className="text-center">
                    <p className="text-green-400 font-mono text-xl font-bold">{ggrksCount}</p>
                    <p className="text-gray-500 text-xs">ggrks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-cyan-400 font-mono text-xl font-bold">{chprksCount}</p>
                    <p className="text-gray-500 text-xs">chprks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-yellow-400 font-mono text-xl font-bold">{maxCombo}</p>
                    <p className="text-gray-500 text-xs">MAX COMBO</p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={startGame}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 via-cyan-500 to-purple-600 text-white font-bold rounded-xl flex items-center gap-2"
                >
                  <RefreshCw size={20} /> RETRY
                </button>
                <button
                  onClick={() => setGameState('title')}
                  className="px-6 py-3 bg-gray-800 text-gray-300 rounded-xl"
                >
                  TITLE
                </button>
              </div>
            </div>
          )}
        </div>

        {/* モバイル用発射ボタン */}
        {(gameState === 'playing' || gameState === 'boss') && (
          <div className="mt-3 flex justify-center">
            <button
              onTouchStart={shoot}
              onClick={shoot}
              className="px-12 py-4 bg-gradient-to-r from-green-500 via-cyan-500 to-purple-600 rounded-2xl active:scale-95 transition-all shadow-lg"
            >
              <Zap size={32} className="text-white" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
