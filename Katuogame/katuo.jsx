import React, { useState, useEffect, useCallback, useRef } from 'react';

// じゃらしコンポーネント
const JaraashiComponent = ({ position, color }) => {
  const [smoothPosition, setSmoothPosition] = useState(position);
  const animationRef = useRef(null);

  useEffect(() => {
    const smoothUpdate = () => {
      setSmoothPosition(prev => ({
        x: prev.x + (position.x - prev.x) * 0.3,
        y: prev.y + (position.y - prev.y) * 0.3
      }));
      animationRef.current = requestAnimationFrame(smoothUpdate);
    };

    animationRef.current = requestAnimationFrame(smoothUpdate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [position]);

  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 30 30"
      style={{
        position: 'absolute',
        left: `${smoothPosition.x}%`,
        top: `${smoothPosition.y}%`,
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
        transition: 'filter 0.3s ease'
      }}
      aria-hidden="true"
    >
      <circle cx="15" cy="15" r="8" fill={color} />
      <line x1="15" y1="23" x2="15" y2="30" stroke={color} strokeWidth="2" />
    </svg>
  );
};

// 猫コンポーネント
const CatComponent = ({ id, position: initialPosition, isRare, jaraashiPosition, onCatch, gameState }) => {
  const [catPosition, setCatPosition] = useState(initialPosition);
  const [rotation, setRotation] = useState(0);
  const speedRef = useRef({ x: 0, y: 0 });
  const moveRef = useRef(null);

  useEffect(() => {
    if (gameState !== 'playing') {
      if (moveRef.current) {
        cancelAnimationFrame(moveRef.current);
        moveRef.current = null;
      }
      return;
    }

    const updatePosition = () => {
      if (!jaraashiPosition) return;

      const dx = jaraashiPosition.x - catPosition.x;
      const dy = jaraashiPosition.y - catPosition.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // レア猫はじゃらしから逃げる
      if (isRare && distance < 40) {
        speedRef.current.x -= (dx / distance) * 1.0;
        speedRef.current.y -= (dy / distance) * 1.0;
      } else if (distance < 30) {
        // 通常の猫はじゃらしに近づく
        speedRef.current.x += (dx / distance) * 0.8;
        speedRef.current.y += (dy / distance) * 0.8;
      } else {
        // ランダムな動き
        speedRef.current.x += (Math.random() - 0.5) * 0.4;
        speedRef.current.y += (Math.random() - 0.5) * 0.4;
      }

      // 速度の減衰
      speedRef.current.x *= 0.95;
      speedRef.current.y *= 0.95;

      // 速度制限
      const maxSpeed = 2;
      const currentSpeed = Math.sqrt(speedRef.current.x ** 2 + speedRef.current.y ** 2);
      if (currentSpeed > maxSpeed) {
        speedRef.current.x = (speedRef.current.x / currentSpeed) * maxSpeed;
        speedRef.current.y = (speedRef.current.y / currentSpeed) * maxSpeed;
      }

      // 位置更新（画面内に制限）
      setCatPosition(prev => ({
        x: Math.max(5, Math.min(95, prev.x + speedRef.current.x)),
        y: Math.max(5, Math.min(95, prev.y + speedRef.current.y))
      }));

      // 回転角度の更新
      setRotation(prev => {
        const targetRotation = Math.atan2(speedRef.current.y, speedRef.current.x) * 180 / Math.PI;
        const diff = targetRotation - prev;
        const normalizedDiff = diff > 180 ? diff - 360 : diff < -180 ? diff + 360 : diff;
        return prev + normalizedDiff * 0.1;
      });

      moveRef.current = requestAnimationFrame(updatePosition);
    };

    moveRef.current = requestAnimationFrame(updatePosition);
    
    return () => {
      if (moveRef.current) {
        cancelAnimationFrame(moveRef.current);
      }
    };
  }, [jaraashiPosition, catPosition, isRare, gameState]);

  const handleCatch = useCallback(() => {
    if (gameState === 'playing') {
      onCatch(id);
    }
  }, [gameState, onCatch, id]);

  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      style={{
        position: 'absolute',
        left: `${catPosition.x}%`,
        top: `${catPosition.y}%`,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        cursor: gameState === 'playing' ? 'pointer' : 'default',
        filter: isRare ? 'drop-shadow(0 0 8px gold)' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
        transition: 'filter 0.3s ease'
      }}
      onClick={handleCatch}
      role="button"
      aria-label={isRare ? "レア猫" : "猫"}
      tabIndex={gameState === 'playing' ? 0 : -1}
    >
      <ellipse 
        cx="20" 
        cy="25" 
        rx="15" 
        ry="12" 
        fill={isRare ? 'gold' : '#808080'}
      />
      <circle cx="15" cy="22" r="2" fill="black" />
      <circle cx="25" cy="22" r="2" fill="black" />
      <path 
        d="M10,18 L5,10 M30,18 L35,10" 
        stroke="black" 
        strokeWidth="2"
        strokeLinecap="round"
      />
      {isRare && (
        <circle cx="20" cy="10" r="3" fill="#FFD700" opacity="0.8" />
      )}
    </svg>
  );
};

// 羽根コンポーネント
const FeatherComponent = ({ id, position, color, onCatch, gameState }) => {
  const [featherPosition, setFeatherPosition] = useState(position);
  const [rotation, setRotation] = useState(0);
  const animationRef = useRef(null);

  useEffect(() => {
    if (gameState !== 'playing') {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const animate = () => {
      const time = Date.now() / 1000;
      setFeatherPosition({
        x: position.x + Math.sin(time * 2) * 3,
        y: position.y + Math.cos(time * 1.5) * 2
      });
      setRotation(Math.sin(time * 3) * 30);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [position, gameState]);

  const handleCatch = useCallback(() => {
    if (gameState === 'playing') {
      onCatch(id);
    }
  }, [gameState, onCatch, id]);

  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      style={{
        position: 'absolute',
        left: `${featherPosition.x}%`,
        top: `${featherPosition.y}%`,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        cursor: gameState === 'playing' ? 'pointer' : 'default',
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
      }}
      onClick={handleCatch}
      role="button"
      aria-label="羽根"
      tabIndex={gameState === 'playing' ? 0 : -1}
    >
      <path 
        d="M10,0 Q15,10 10,20 Q5,10 10,0" 
        fill={color}
        opacity="0.8"
      />
    </svg>
  );
};

// スコアボード
const ScoreBoard = ({ score, time }) => (
  <div
    role="region"
    aria-label="スコアボード"
    style={{ 
      position: 'absolute', 
      top: '10px', 
      left: '10px', 
      padding: '15px',
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      zIndex: 1000
    }}
  >
    <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '5px' }}>
      スコア: <span style={{ color: '#4CAF50' }}>{score}</span>
    </div>
    <div style={{ fontSize: '18px' }}>
      残り時間: <span style={{ color: time <= 10 ? '#FF5252' : '#333' }}>{time}</span>秒
    </div>
  </div>
);

// メインゲームコンポーネント
const CatJaraashiGame = () => {
  const [gameState, setGameState] = useState('title');
  const [score, setScore] = useState(0);
  const [cats, setCats] = useState([]);
  const [feathers, setFeathers] = useState([]);
  const [jaraashiPosition, setJaraashiPosition] = useState({ x: 50, y: 80 });
  const [jaraashiColor, setJaraashiColor] = useState('#FF6B6B');
  const [gameTime, setGameTime] = useState(60);
  const gameAreaRef = useRef(null);
  const timerRef = useRef(null);
  const nextCatIdRef = useRef(0);
  const nextFeatherIdRef = useRef(0);

  // ユニークIDを生成
  const getNextCatId = useCallback(() => {
    nextCatIdRef.current += 1;
    return `cat-${nextCatIdRef.current}`;
  }, []);

  const getNextFeatherId = useCallback(() => {
    nextFeatherIdRef.current += 1;
    return `feather-${nextFeatherIdRef.current}`;
  }, []);

  // 猫の生成
  const generateCats = useCallback((count) => 
    Array.from({ length: count }, () => ({
      id: getNextCatId(),
      position: { 
        x: Math.random() * 80 + 10, 
        y: Math.random() * 60 + 10 
      },
      isRare: Math.random() < 0.15
    }))
  , [getNextCatId]);

  // 羽根の生成
  const generateFeathers = useCallback((count) => 
    Array.from({ length: count }, () => ({
      id: getNextFeatherId(),
      position: { 
        x: Math.random() * 80 + 10, 
        y: Math.random() * 60 + 10 
      },
      color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'][Math.floor(Math.random() * 5)]
    }))
  , [getNextFeatherId]);

  // ゲーム開始
  const startGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    setGameTime(60);
    setJaraashiColor('#FF6B6B');
    nextCatIdRef.current = 0;
    nextFeatherIdRef.current = 0;
    setCats(generateCats(5));
    setFeathers(generateFeathers(3));
  }, [generateCats, generateFeathers]);

  // じゃらしの位置更新
  const updateJaraashiPosition = useCallback((e) => {
    if (gameState !== 'playing' || !gameAreaRef.current) return;
    
    const gameArea = gameAreaRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - gameArea.left) / gameArea.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - gameArea.top) / gameArea.height) * 100));
    
    setJaraashiPosition({ x, y });
  }, [gameState]);

  // タッチイベント処理
  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      updateJaraashiPosition({
        clientX: touch.clientX,
        clientY: touch.clientY
      });
    }
  }, [updateJaraashiPosition]);

  // 猫をキャッチ
  const catchCat = useCallback((catId) => {
    setCats(prevCats => {
      const caughtCat = prevCats.find(cat => cat.id === catId);
      if (caughtCat) {
        const points = caughtCat.isRare ? 5 : 1;
        setScore(prev => prev + points);
      }
      return prevCats.filter(cat => cat.id !== catId);
    });
  }, []);

  // 羽根をキャッチ
  const catchFeather = useCallback((featherId) => {
    setFeathers(prevFeathers => {
      const caughtFeather = prevFeathers.find(feather => feather.id === featherId);
      if (caughtFeather) {
        setJaraashiColor(caughtFeather.color);
        setScore(prev => prev + 3);
      }
      return prevFeathers.filter(feather => feather.id !== featherId);
    });
  }, []);

  // タイマー処理
  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setGameTime(prevTime => {
          if (prevTime <= 1) {
            setGameState('gameOver');
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [gameState]);

  // 猫と羽根の自動補充
  useEffect(() => {
    if (gameState !== 'playing') return;

    if (cats.length < 3) {
      setCats(prevCats => [...prevCats, ...generateCats(3 - cats.length)]);
    }
    if (feathers.length < 2) {
      setFeathers(prevFeathers => [...prevFeathers, ...generateFeathers(2 - feathers.length)]);
    }
  }, [cats.length, feathers.length, gameState, generateCats, generateFeathers]);

  return (
    <div 
      ref={gameAreaRef}
      style={{ 
        width: '100%', 
        height: '100vh', 
        position: 'relative', 
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #e6f3ff 0%, #f0f9ff 100%)',
        userSelect: 'none',
        touchAction: 'none',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
      role="main"
    >
      {gameState === 'title' && (
        <div style={{ 
          textAlign: 'center', 
          paddingTop: '20vh',
          animation: 'fadeIn 0.5s ease-in'
        }}>
          <h1 style={{ 
            fontSize: '48px', 
            marginBottom: '30px',
            color: '#333',
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
          }}>
            🐱 カツオじゃらし大作戦！
          </h1>
          <p style={{ 
            fontSize: '18px', 
            marginBottom: '30px',
            color: '#666'
          }}>
            じゃらしを動かして猫をキャッチしよう！<br/>
            ✨ 金色の猫は5点、羽根は3点！
          </p>
          <button
            onClick={startGame}
            style={{
              fontSize: '20px',
              padding: '15px 40px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              fontWeight: 'bold'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#45a049';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#4CAF50';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            ゲームスタート
          </button>
        </div>
      )}
      
      {gameState === 'playing' && (
        <div 
          style={{ width: '100%', height: '100%' }}
          onMouseMove={updateJaraashiPosition}
          onTouchMove={handleTouchMove}
        >
          <ScoreBoard score={score} time={gameTime} />
          <JaraashiComponent position={jaraashiPosition} color={jaraashiColor} />
          {cats.map((cat) => (
            <CatComponent
              key={cat.id}
              {...cat}
              jaraashiPosition={jaraashiPosition}
              onCatch={catchCat}
              gameState={gameState}
            />
          ))}
          {feathers.map((feather) => (
            <FeatherComponent
              key={feather.id}
              {...feather}
              onCatch={catchFeather}
              gameState={gameState}
            />
          ))}
        </div>
      )}
      
      {gameState === 'gameOver' && (
        <div style={{ 
          textAlign: 'center', 
          paddingTop: '20vh',
          animation: 'fadeIn 0.5s ease-in'
        }}>
          <h2 style={{ 
            fontSize: '36px', 
            marginBottom: '30px',
            color: '#333'
          }}>
            🎮 ゲームオーバー
          </h2>
          <p style={{ 
            fontSize: '28px', 
            marginBottom: '30px',
            color: '#4CAF50',
            fontWeight: 'bold'
          }}>
            最終スコア: {score}点
          </p>
          <button
            onClick={startGame}
            style={{
              fontSize: '20px',
              padding: '15px 40px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              fontWeight: 'bold'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#45a049';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#4CAF50';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            もう一度プレイ
          </button>
        </div>
      )}
    </div>
  );
};

export default CatJaraashiGame;
