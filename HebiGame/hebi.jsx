import React, { useState, useEffect, useCallback } from 'react';

const SnakeGame = () => {
  const gridSize = 20;
  const [snake, setSnake] = useState([[0, 0]]);
  const [food, setFood] = useState([10, 10]);
  const [direction, setDirection] = useState('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [speed] = useState(150);
  const [isPaused, setIsPaused] = useState(false);

  // ランダムな食べ物の位置を生成（蛇の体と重ならない位置）
  const generateFood = useCallback(() => {
    let newFood;
    let isOnSnake;
    
    do {
      isOnSnake = false;
      newFood = [
        Math.floor(Math.random() * gridSize),
        Math.floor(Math.random() * gridSize),
      ];
      
      // 蛇の体と食べ物が重ならないようにチェック
      for (const segment of snake) {
        if (segment[0] === newFood[0] && segment[1] === newFood[1]) {
          isOnSnake = true;
          break;
        }
      }
    } while (isOnSnake);
    
    setFood(newFood);
  }, [snake]);

  // 衝突の確認
  const checkCollision = useCallback((head) => {
    // 壁との衝突
    if (
      head[0] >= gridSize ||
      head[0] < 0 ||
      head[1] >= gridSize ||
      head[1] < 0
    ) {
      return true;
    }
    
    // 自分自身との衝突（頭以外の体の部分とチェック）
    for (let i = 1; i < snake.length; i++) {
      if (head[0] === snake[i][0] && head[1] === snake[i][1]) {
        return true;
      }
    }
    
    return false;
  }, [snake]);

  // ゲームの更新ロジック
  useEffect(() => {
    if (gameOver || isPaused) return;

    const moveSnake = () => {
      const newSnake = [...snake];
      let newHead = [...newSnake[0]];

      switch (direction) {
        case 'UP':
          newHead[1] -= 1;
          break;
        case 'DOWN':
          newHead[1] += 1;
          break;
        case 'LEFT':
          newHead[0] -= 1;
          break;
        case 'RIGHT':
          newHead[0] += 1;
          break;
        default:
          break;
      }

      if (checkCollision(newHead)) {
        setGameOver(true);
        return;
      }

      newSnake.unshift(newHead);

      if (newHead[0] === food[0] && newHead[1] === food[1]) {
        setScore(score + 1);
        generateFood();
      } else {
        newSnake.pop();
      }

      setSnake(newSnake);
    };

    const gameInterval = setInterval(moveSnake, speed);
    return () => clearInterval(gameInterval);
  }, [snake, direction, food, gameOver, isPaused, score, speed, checkCollision, generateFood]);

  // キーボード操作
  useEffect(() => {
    const handleKeyPress = (e) => {
      e.preventDefault(); // ページのスクロールを防止
      
      // ゲームオーバー時は操作を受け付けない
      if (gameOver) return;
      
      // ポーズ状態の切り替え
      if (e.key === ' ' || e.key === 'Escape') {
        setIsPaused(prev => !prev);
        return;
      }
      
      // ポーズ中は方向変更を受け付けない
      if (isPaused) return;
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (direction !== 'DOWN') setDirection('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (direction !== 'UP') setDirection('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (direction !== 'RIGHT') setDirection('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (direction !== 'LEFT') setDirection('RIGHT');
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [direction, gameOver, isPaused]);

  // ゲームリセット
  const resetGame = () => {
    setSnake([[0, 0]]);
    generateFood(); // 新しい食べ物の位置をランダムに設定
    setDirection('RIGHT');
    setGameOver(false);
    setIsPaused(false);
    setScore(0);
  };

  // タッチ操作用のコントロールボタン
  const handleButtonControl = (newDirection) => {
    if (gameOver || isPaused) return;
    
    switch (newDirection) {
      case 'UP':
        if (direction !== 'DOWN') setDirection('UP');
        break;
      case 'DOWN':
        if (direction !== 'UP') setDirection('DOWN');
        break;
      case 'LEFT':
        if (direction !== 'RIGHT') setDirection('LEFT');
        break;
      case 'RIGHT':
        if (direction !== 'LEFT') setDirection('RIGHT');
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto p-4">
      <div className="flex justify-between w-full mb-4">
        <div className="text-2xl font-bold">スコア: {score}</div>
        <button
          onClick={() => setIsPaused(prev => !prev)}
          className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          {isPaused ? '再開' : '一時停止'}
        </button>
      </div>
      
      <div className="relative w-full h-96 bg-gray-100 border-2 border-gray-300">
        {/* 蛇の体 */}
        {snake.map((segment, i) => (
          <div
            key={i}
            className={`absolute w-4 h-4 ${i === 0 ? 'bg-green-600' : 'bg-green-500'}`}
            style={{
              left: `${(segment[0] * 100) / gridSize}%`,
              top: `${(segment[1] * 100) / gridSize}%`,
              transition: 'left 0.1s, top 0.1s', // 滑らかな移動のためのトランジション
            }}
          />
        ))}
        
        {/* 食べ物 */}
        <div
          className="absolute w-4 h-4 bg-red-500 rounded-full"
          style={{
            left: `${(food[0] * 100) / gridSize}%`,
            top: `${(food[1] * 100) / gridSize}%`,
          }}
        />
        
        {/* ポーズ時のオーバーレイ */}
        {isPaused && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-2xl font-bold">
            ポーズ中
          </div>
        )}
        
        {/* ゲームオーバー時のオーバーレイ */}
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 text-white">
            <div className="text-2xl font-bold text-red-400 mb-4">ゲームオーバー!</div>
            <button
              onClick={resetGame}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              もう一度プレイ
            </button>
          </div>
        )}
      </div>
      
      {/* モバイル用コントロール */}
      <div className="mt-6 grid grid-cols-3 gap-2 w-48">
        <div></div>
        <button
          onClick={() => handleButtonControl('UP')}
          className="p-3 bg-gray-200 text-center rounded-t-lg"
          disabled={gameOver || isPaused}
        >
          ↑
        </button>
        <div></div>
        
        <button
          onClick={() => handleButtonControl('LEFT')}
          className="p-3 bg-gray-200 text-center rounded-l-lg"
          disabled={gameOver || isPaused}
        >
          ←
        </button>
        <button
          onClick={() => handleButtonControl('DOWN')}
          className="p-3 bg-gray-200 text-center rounded-b-lg"
          disabled={gameOver || isPaused}
        >
          ↓
        </button>
        <button
          onClick={() => handleButtonControl('RIGHT')}
          className="p-3 bg-gray-200 text-center rounded-r-lg"
          disabled={gameOver || isPaused}
        >
          →
        </button>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>矢印キー、またはWASDで蛇を操作</p>
        <p>スペースキーまたはESCで一時停止</p>
      </div>
    </div>
  );
};

export default SnakeGame;
