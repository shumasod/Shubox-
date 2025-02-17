import React, { useState, useEffect, useCallback } from 'react';

const VirusIcon = ({ className, style }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className} 
    style={style}
    fill="currentColor"
  >
    <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
    <circle cx="12" cy="12" r="3"/>
    <circle cx="12" cy="6" r="1.5"/>
    <circle cx="12" cy="18" r="1.5"/>
    <circle cx="6" cy="12" r="1.5"/>
    <circle cx="18" cy="12" r="1.5"/>
  </svg>
);

const ShieldIcon = ({ className, style }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className} 
    style={style}
    fill="currentColor"
  >
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 18c-3.75-1-7-5.46-7-9V6.3l7-3.11 7 3.11V10c0 3.54-3.25 8-7 9z"/>
  </svg>
);

const VirusShooter = () => {
  const [gameState, setGameState] = useState('start');
  const [score, setScore] = useState(0);
  const [playerPosition, setPlayerPosition] = useState({ x: 50, y: 90 });
  const [viruses, setViruses] = useState([]);
  const [bullets, setBullets] = useState([]);
  const [highScore, setHighScore] = useState(0);

  // ゲーム初期化
  const initGame = useCallback(() => {
    const initialViruses = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: (i % 4) * 25 + 12,
      y: Math.floor(i / 4) * 15 + 10,
      color: ['text-red-500', 'text-green-500', 'text-purple-500'][Math.floor(i / 4)],
      size: Math.random() * 4 + 16,
    }));
    setViruses(initialViruses);
    setPlayerPosition({ x: 50, y: 90 });
    setBullets([]);
    setScore(0);
    setGameState('playing');
  }, []);

  // キー入力の処理
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameState !== 'playing') return;

      switch (e.key) {
        case 'ArrowLeft':
          setPlayerPosition(prev => ({
            ...prev,
            x: Math.max(0, prev.x - 4)
          }));
          break;
        case 'ArrowRight':
          setPlayerPosition(prev => ({
            ...prev,
            x: Math.min(95, prev.x + 4)
          }));
          break;
        case ' ':
          setBullets(prev => [
            ...prev,
            { id: Date.now(), x: playerPosition.x + 2, y: playerPosition.y }
          ]);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, playerPosition]);

  // ゲームループ
  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = setInterval(() => {
      // 弾の移動
      setBullets(prev => prev
        .map(bullet => ({ ...bullet, y: bullet.y - 1.5 }))
        .filter(bullet => bullet.y > 0)
      );

      // ウイルスの移動
      setViruses(prev => prev.map(virus => ({
        ...virus,
        x: virus.x + Math.sin(Date.now() / 1000 + virus.id) * 0.3,
        y: virus.y + 0.05,
      })));

      // 衝突判定
      setBullets(prev => {
        const newBullets = [...prev];
        setViruses(prevViruses => {
          const newViruses = prevViruses.filter(virus => {
            return !newBullets.some(bullet => {
              const hit = Math.abs(bullet.x - virus.x) < 4 &&
                         Math.abs(bullet.y - virus.y) < 4;
              if (hit) {
                newBullets.splice(newBullets.indexOf(bullet), 1);
                setScore(s => s + 150);
                return true;
              }
              return false;
            });
          });

          // ゲームオーバー判定
          if (newViruses.some(virus => virus.y > 85)) {
            setGameState('gameover');
            setHighScore(prev => Math.max(prev, score));
          }

          return newViruses;
        });
        return newBullets;
      });

      // ウイルスが全滅した場合、新しい波を生成
      if (viruses.length === 0) {
        const newViruses = Array.from({ length: 12 }, (_, i) => ({
          id: i + Date.now(),
          x: (i % 4) * 25 + 12,
          y: Math.floor(i / 4) * 15 + 10,
          color: ['text-red-500', 'text-green-500', 'text-purple-500'][Math.floor(i / 4)],
          size: Math.random() * 4 + 16,
        }));
        setViruses(newViruses);
      }
    }, 16);

    return () => clearInterval(gameLoop);
  }, [gameState, viruses.length, score]);

  return (
    <div className="relative w-full max-w-lg mx-auto h-96 bg-gray-900 text-white overflow-hidden rounded-lg shadow-lg">
      {/* ゲーム画面 */}
      <div className="relative w-full h-full">
        {/* プレイヤー (盾) */}
        <div 
          className="absolute transform -translate-x-1/2"
          style={{
            left: `${playerPosition.x}%`,
            top: `${playerPosition.y}%`,
          }}
        >
          <ShieldIcon className="w-8 h-8 text-blue-400" />
        </div>

        {/* ウイルス */}
        {viruses.map(virus => (
          <div
            key={virus.id}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${virus.color}`}
            style={{
              left: `${virus.x}%`,
              top: `${virus.y}%`,
            }}
          >
            <VirusIcon 
              className="animate-spin-slow" 
              style={{ width: virus.size, height: virus.size }} 
            />
          </div>
        ))}

        {/* 弾 */}
        {bullets.map(bullet => (
          <div
            key={bullet.id}
            className="absolute w-1 h-3 bg-blue-300 rounded-full shadow-glow"
            style={{
              left: `${bullet.x}%`,
              top: `${bullet.y}%`,
            }}
          />
        ))}

        {/* スコア表示 */}
        <div className="absolute top-4 left-4 text-xl font-semibold">
          Score: {score}
        </div>

        {/* ゲームオーバー画面 */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex flex-col items-center justify-center">
            <h2 className="text-4xl font-bold mb-6 text-red-500">GAME OVER</h2>
            <p className="text-xl mb-2">Score: {score}</p>
            <p className="text-xl mb-6">High Score: {highScore}</p>
            <button
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold 
                         transform transition hover:scale-105 active:scale-95"
              onClick={initGame}
            >
              Play Again
            </button>
          </div>
        )}

        {/* スタート画面 */}
        {gameState === 'start' && (
          <div className="absolute inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold mb-8 text-blue-400">Virus Shooter</h1>
            <div className="space-y-2 mb-8 text-center">
              <p className="text-lg">ウイルスの侵入を阻止せよ！</p>
              <p className="text-gray-400">← →キーで移動</p>
              <p className="text-gray-400">スペースキーで攻撃</p>
            </div>
            <button
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold 
                         transform transition hover:scale-105 active:scale-95"
              onClick={initGame}
            >
              Start Game
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VirusShooter;
