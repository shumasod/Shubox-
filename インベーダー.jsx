import React, { useState, useEffect, useCallback } from 'react';

const SpaceInvaders = () => {
  const [gameState, setGameState] = useState('start'); // 'start', 'playing', 'gameover'
  const [score, setScore] = useState(0);
  const [playerPosition, setPlayerPosition] = useState({ x: 50, y: 90 });
  const [enemies, setEnemies] = useState([]);
  const [bullets, setBullets] = useState([]);
  const [highScore, setHighScore] = useState(0);

  // ゲーム初期化
  const initGame = useCallback(() => {
    const initialEnemies = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: (i % 5) * 20 + 10,
      y: Math.floor(i / 5) * 10 + 10,
    }));
    setEnemies(initialEnemies);
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
            x: Math.max(0, prev.x - 3)
          }));
          break;
        case 'ArrowRight':
          setPlayerPosition(prev => ({
            ...prev,
            x: Math.min(95, prev.x + 3)
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
        .map(bullet => ({ ...bullet, y: bullet.y - 1 }))
        .filter(bullet => bullet.y > 0)
      );

      // 敵の移動
      setEnemies(prev => prev.map(enemy => ({
        ...enemy,
        y: enemy.y + 0.05,
      })));

      // 衝突判定
      setBullets(prev => {
        const newBullets = [...prev];
        setEnemies(prevEnemies => {
          const newEnemies = prevEnemies.filter(enemy => {
            return !newBullets.some(bullet => {
              const hit = Math.abs(bullet.x - enemy.x) < 3 &&
                         Math.abs(bullet.y - enemy.y) < 3;
              if (hit) {
                newBullets.splice(newBullets.indexOf(bullet), 1);
                setScore(s => s + 100);
                return true;
              }
              return false;
            });
          });

          // ゲームオーバー判定
          if (newEnemies.some(enemy => enemy.y > 85)) {
            setGameState('gameover');
            setHighScore(prev => Math.max(prev, score));
          }

          return newEnemies;
        });
        return newBullets;
      });

      // 敵が全滅した場合、新しい波を生成
      if (enemies.length === 0) {
        const newEnemies = Array.from({ length: 15 }, (_, i) => ({
          id: i + Date.now(),
          x: (i % 5) * 20 + 10,
          y: Math.floor(i / 5) * 10 + 10,
        }));
        setEnemies(newEnemies);
      }
    }, 16);

    return () => clearInterval(gameLoop);
  }, [gameState, enemies.length, score]);

  return (
    <div className="relative w-full max-w-lg mx-auto h-96 bg-black text-white overflow-hidden">
      {/* ゲーム画面 */}
      <div className="relative w-full h-full">
        {/* プレイヤー */}
        <div 
          className="absolute w-5 h-5 bg-blue-500"
          style={{
            left: `${playerPosition.x}%`,
            top: `${playerPosition.y}%`,
          }}
        />

        {/* 敵 */}
        {enemies.map(enemy => (
          <div
            key={enemy.id}
            className="absolute w-4 h-4 bg-red-500"
            style={{
              left: `${enemy.x}%`,
              top: `${enemy.y}%`,
            }}
          />
        ))}

        {/* 弾 */}
        {bullets.map(bullet => (
          <div
            key={bullet.id}
            className="absolute w-1 h-2 bg-yellow-400"
            style={{
              left: `${bullet.x}%`,
              top: `${bullet.y}%`,
            }}
          />
        ))}

        {/* スコア表示 */}
        <div className="absolute top-2 left-2 text-lg">
          Score: {score}
        </div>

        {/* ゲームオーバー画面 */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center">
            <h2 className="text-3xl mb-4">GAME OVER</h2>
            <p className="mb-2">Score: {score}</p>
            <p className="mb-4">High Score: {highScore}</p>
            <button
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded"
              onClick={initGame}
            >
              Play Again
            </button>
          </div>
        )}

        {/* スタート画面 */}
        {gameState === 'start' && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center">
            <h1 className="text-4xl mb-6">Space Invaders</h1>
            <p className="mb-4">← →キーで移動、スペースキーで射撃</p>
            <button
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded"
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

export default SpaceInvaders;
