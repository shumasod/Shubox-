import React, { useState, useEffect, useCallback } from 'react';

// カツオじゃらしコンポーネント
const JaraashiComponent = ({ position, color }) => (
  <svg
    width="50"
    height="50"
    viewBox="0 0 50 50"
    style={{
      position: 'absolute',
      left: `${position.x}%`,
      top: `${position.y}%`,
      transform: 'translate(-50%, -50%)',
    }}
  >
    <line x1="25" y1="0" x2="25" y2="50" stroke={color} strokeWidth="5" />
    <path d="M15,10 Q25,0 35,10 Q25,20 15,10" fill={color} />
  </svg>
);

// 猫コンポーネント
const CatComponent = ({ id, position, isRare, onCatch }) => {
  const [catPosition, setCatPosition] = useState(position);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 5) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setCatPosition(position);
  }, [position]);

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
        cursor: 'pointer',
      }}
      onClick={onCatch}
    >
      <ellipse cx="20" cy="25" rx="15" ry="12" fill={isRare ? 'gold' : 'gray'} />
      <circle cx="15" cy="22" r="2" fill="black" />
      <circle cx="25" cy="22" r="2" fill="black" />
      <path d="M10,18 L5,10 M30,18 L35,10" stroke="black" strokeWidth="2" />
    </svg>
  );
};

// 羽根アイテムコンポーネント
const FeatherComponent = ({ position, color, onCatch }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    style={{
      position: 'absolute',
      left: `${position.x}%`,
      top: `${position.y}%`,
      cursor: 'pointer',
    }}
    onClick={onCatch}
  >
    <path d="M10,0 Q15,10 10,20 Q5,10 10,0" fill={color} />
  </svg>
);

// スコアボードコンポーネント
const ScoreBoard = ({ score, time }) => (
  <div style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '18px' }}>
    <div>スコア: {score}</div>
    <div>残り時間: {time}秒</div>
  </div>
);

// メインゲームコンポーネント
const CatJaraashiGame = () => {
  const [gameState, setGameState] = useState('title');
  const [score, setScore] = useState(0);
  const [cats, setCats] = useState([]);
  const [feathers, setFeathers] = useState([]);
  const [jaraashiPosition, setJaraashiPosition] = useState({ x: 50, y: 80 });
  const [jaraashiColor, setJaraashiColor] = useState('black');
  const [gameTime, setGameTime] = useState(60);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setGameTime(60);
    setCats(generateCats(5));
    setFeathers(generateFeathers(3));
  };

  const generateCats = useCallback((count) => (
    Array.from({ length: count }, (_, i) => ({
      id: i,
      position: { x: Math.random() * 90 + 5, y: Math.random() * 70 + 5 },
      isRare: Math.random() < 0.1,
    }))
  ), []);

  const generateFeathers = useCallback((count) => (
    Array.from({ length: count }, (_, i) => ({
      id: i,
      position: { x: Math.random() * 90 + 5, y: Math.random() * 70 + 5 },
      color: ['red', 'blue', 'green', 'purple', 'orange'][Math.floor(Math.random() * 5)],
    }))
  ), []);

  const updateJaraashiPosition = useCallback((e) => {
    if (gameState !== 'playing') return;
    const gameArea = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - gameArea.left) / gameArea.width) * 100;
    const y = ((e.clientY - gameArea.top) / gameArea.height) * 100;
    setJaraashiPosition({ x, y });
  }, [gameState]);

  const catchCat = useCallback((catId) => {
    setCats((prevCats) => {
      const caughtCat = prevCats.find(cat => cat.id === catId);
      if (caughtCat) {
        setScore((prevScore) => prevScore + (caughtCat.isRare ? 5 : 1));
      }
      return prevCats.filter(cat => cat.id !== catId);
    });
  }, []);

  const catchFeather = useCallback((featherId) => {
    setFeathers((prevFeathers) => {
      const caughtFeather = prevFeathers.find(feather => feather.id === featherId);
      if (caughtFeather) {
        setJaraashiColor(caughtFeather.color);
        setScore((prevScore) => prevScore + 3);
      }
      return prevFeathers.filter(feather => feather.id !== featherId);
    });
  }, []);

  useEffect(() => {
    if (gameState === 'playing') {
      const timer = setInterval(() => {
        setGameTime((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            setGameState('gameOver');
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameState]);

  useEffect(() => {
    if (cats.length < 3 && gameState === 'playing') {
      setCats((prevCats) => [...prevCats, ...generateCats(3)]);
    }
    if (feathers.length < 2 && gameState === 'playing') {
      setFeathers((prevFeathers) => [...prevFeathers, ...generateFeathers(2)]);
    }
  }, [cats, feathers, gameState, generateCats, generateFeathers]);

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', overflow: 'hidden', background: '#e6f3ff' }}>
      {gameState === 'title' && (
        <div style={{ textAlign: 'center', paddingTop: '20vh' }}>
          <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>カツオじゃらし大作戦！</h1>
          <button
            onClick={startGame}
            style={{
              fontSize: '18px',
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
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
          onTouchMove={(e) => {
            const touch = e.touches[0];
            updateJaraashiPosition({ clientX: touch.clientX, clientY: touch.clientY });
          }}
        >
          <ScoreBoard score={score} time={gameTime} />
          <JaraashiComponent position={jaraashiPosition} color={jaraashiColor} />
          {cats.map((cat) => (
            <CatComponent
              key={cat.id}
              {...cat}
              onCatch={() => catchCat(cat.id)}
            />
          ))}
          {feathers.map((feather) => (
            <FeatherComponent
              key={feather.id}
              {...feather}
              onCatch={() => catchFeather(feather.id)}
            />
          ))}
        </div>
      )}
      {gameState === 'gameOver' && (
        <div style={{ textAlign: 'center', paddingTop: '20vh' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>ゲームオーバー</h2>
          <p style={{ fontSize: '18px', marginBottom: '20px' }}>最終スコア: {score}</p>
          <button
            onClick={startGame}
            style={{
              fontSize: '18px',
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
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
