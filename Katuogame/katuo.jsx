import React, { useState, useEffect, useCallback, useRef } from 'react';

const JaraashiComponent = ({ position, color }) => {
  const prevPosition = useRef(position);
  const [smoothPosition, setSmoothPosition] = useState(position);

  useEffect(() => {
    const animate = () => {
      setSmoothPosition(current => ({
        x: current.x + (position.x - current.x) * 0.2,
        y: current.y + (position.y - current.y) * 0.2
      }));
    };
    requestAnimationFrame(animate);
    prevPosition.current = position;
  }, [position]);

  return (
    <svg
      width="50"
      height="50"
      viewBox="0 0 50 50"
      style={{
        position: 'absolute',
        left: `${smoothPosition.x}%`,
        top: `${smoothPosition.y}%`,
        transform: 'translate(-50%, -50%)',
        transition: 'color 0.3s ease'
      }}
    >
      <line 
        x1="25" 
        y1="0" 
        x2="25" 
        y2="50" 
        stroke={color} 
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path 
        d="M15,10 Q25,0 35,10 Q25,20 15,10" 
        fill={color}
      />
    </svg>
  );
};

const CatComponent = ({ id, position, isRare, onCatch, jaraashiPosition }) => {
  const [catPosition, setCatPosition] = useState(position);
  const [rotation, setRotation] = useState(0);
  const moveRef = useRef(null);
  const speedRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const updatePosition = () => {
      const dx = jaraashiPosition.x - catPosition.x;
      const dy = jaraashiPosition.y - catPosition.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 30) {
        speedRef.current.x += (dx / distance) * 0.8;
        speedRef.current.y += (dy / distance) * 0.8;
      } else {
        speedRef.current.x += (Math.random() - 0.5) * 0.4;
        speedRef.current.y += (Math.random() - 0.5) * 0.4;
      }

      speedRef.current.x *= 0.95;
      speedRef.current.y *= 0.95;

      setCatPosition(prev => ({
        x: Math.max(0, Math.min(100, prev.x + speedRef.current.x)),
        y: Math.max(0, Math.min(100, prev.y + speedRef.current.y))
      }));

      setRotation(prev => {
        const targetRotation = Math.atan2(speedRef.current.y, speedRef.current.x) * 180 / Math.PI;
        const diff = targetRotation - prev;
        return prev + (diff > 180 ? diff - 360 : diff < -180 ? diff + 360 : diff) * 0.1;
      });

      moveRef.current = requestAnimationFrame(updatePosition);
    };

    moveRef.current = requestAnimationFrame(updatePosition);
    return () => cancelAnimationFrame(moveRef.current);
  }, [jaraashiPosition, catPosition]);

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
        filter: isRare ? 'drop-shadow(0 0 5px gold)' : 'none',
        transition: 'filter 0.3s ease'
      }}
      onClick={onCatch}
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
    </svg>
  );
};

const FeatherComponent = ({ position, color, onCatch }) => {
  const [featherPosition, setFeatherPosition] = useState(position);
  const [rotation, setRotation] = useState(0);
  const animationRef = useRef(null);

  useEffect(() => {
    const animate = () => {
      const time = Date.now() / 1000;
      setFeatherPosition(prev => ({
        x: position.x + Math.sin(time * 2) * 3,
        y: position.y + Math.cos(time * 1.5) * 2
      }));
      setRotation(Math.sin(time * 3) * 30);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [position]);

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
        cursor: 'pointer'
      }}
      onClick={onCatch}
    >
      <path 
        d="M10,0 Q15,10 10,20 Q5,10 10,0" 
        fill={color}
        opacity="0.8"
      />
    </svg>
  );
};

const ScoreBoard = ({ score, time }) => (
  <div style={{ 
    position: 'absolute', 
    top: '10px', 
    left: '10px', 
    padding: '10px',
    background: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '5px'
  }}>
    <div style={{ fontSize: '18px' }}>スコア: {score}</div>
    <div style={{ fontSize: '18px' }}>残り時間: {time}秒</div>
  </div>
);

const CatJaraashiGame = () => {
  const [gameState, setGameState] = useState('title');
  const [score, setScore] = useState(0);
  const [cats, setCats] = useState([]);
  const [feathers, setFeathers] = useState([]);
  const [jaraashiPosition, setJaraashiPosition] = useState({ x: 50, y: 80 });
  const [jaraashiColor, setJaraashiColor] = useState('black');
  const [gameTime, setGameTime] = useState(60);
  const gameAreaRef = useRef(null);

  const generateCats = useCallback((count) => (
    Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      position: { x: Math.random() * 90 + 5, y: Math.random() * 70 + 5 },
      isRare: Math.random() < 0.1
    }))
  ), []);

  const generateFeathers = useCallback((count) => (
    Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      position: { x: Math.random() * 90 + 5, y: Math.random() * 70 + 5 },
      color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'][Math.floor(Math.random() * 5)]
    }))
  ), []);

  const startGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    setGameTime(60);
    setCats(generateCats(5));
    setFeathers(generateFeathers(3));
  }, [generateCats, generateFeathers]);

  const updateJaraashiPosition = useCallback((e) => {
    if (gameState !== 'playing' || !gameAreaRef.current) return;
    const gameArea = gameAreaRef.current.getBoundingClientRect();
    const x = ((e.clientX - gameArea.left) / gameArea.width) * 100;
    const y = ((e.clientY - gameArea.top) / gameArea.height) * 100;
    setJaraashiPosition({ x, y });
  }, [gameState]);

  const catchCat = useCallback((catId) => {
    setCats(prevCats => {
      const caughtCat = prevCats.find(cat => cat.id === catId);
      if (caughtCat) {
        setScore(prev => prev + (caughtCat.isRare ? 5 : 1));
      }
      return prevCats.filter(cat => cat.id !== catId);
    });
  }, []);

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

  useEffect(() => {
    if (gameState === 'playing') {
      const timer = setInterval(() => {
        setGameTime(prevTime => {
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
      setCats(prevCats => [...prevCats, ...generateCats(3)]);
    }
    if (feathers.length < 2 && gameState === 'playing') {
      setFeathers(prevFeathers => [...prevFeathers, ...generateFeathers(2)]);
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
        touchAction: 'none'
      }}
    >
      {gameState === 'title' && (
        <div style={{ textAlign: 'center', paddingTop: '20vh' }}>
          <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>
            カツオじゃらし大作戦！
          </h1>
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
            e.preventDefault();
            const touch = e.touches[0];
            updateJaraashiPosition({
              clientX: touch.clientX,
              clientY: touch.clientY,
              currentTarget: gameAreaRef.current
            });
          }}
        >
          <ScoreBoard score={score} time={gameTime} />
          <JaraashiComponent position={jaraashiPosition} color={jaraashiColor} />
          {cats.map((cat) => (
            <CatComponent
              key={cat.id}
              {...cat}
              jaraashiPosition={jaraashiPosition}
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
