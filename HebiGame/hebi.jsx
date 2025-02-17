import React, { useState, useEffect, useCallback } from 'react';

const SnakeGame = () => {
  const [snake, setSnake] = useState([[0, 0]]);
  const [food, setFood] = useState([10, 10]);
  const [direction, setDirection] = useState('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [speed] = useState(150);
  const gridSize = 20;

  // ランダムな食べ物の位置を生成
  const generateFood = useCallback(() => {
    const newFood = [
      Math.floor(Math.random() * gridSize),
      Math.floor(Math.random() * gridSize),
    ];
    setFood(newFood);
  }, []);

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
    // 自分自身との衝突
    for (const segment of snake.slice(1)) {
      if (head[0] === segment[0] && head[1] === segment[1]) {
        return true;
      }
    }
    return false;
  }, [snake]);

  // ゲームの更新ロジック
  useEffect(() => {
    if (gameOver) return;

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
  }, [snake, direction, food, gameOver, score, speed, checkCollision, generateFood]);

  // キーボード操作
  useEffect(() => {
    const handleKeyPress = (e) => {
      switch (e.key) {
        case 'ArrowUp':
          if (direction !== 'DOWN') setDirection('UP');
          break;
        case 'ArrowDown':
          if (direction !== 'UP') setDirection('DOWN');
          break;
        case 'ArrowLeft':
          if (direction !== 'RIGHT') setDirection('LEFT');
          break;
        case 'ArrowRight':
          if (direction !== 'LEFT') setDirection('RIGHT');
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [direction]);

  // ゲームリセット
  const resetGame = () => {
    setSnake([[0, 0]]);
    setFood([10, 10]);
    setDirection('RIGHT');
    setGameOver(false);
    setScore(0);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto p-4">
      <div className="mb-4 text-2xl font-bold">スコア: {score}</div>
      <div className="relative w-full h-96 bg-gray-100 border-2 border-gray-300">
        {snake.map((segment, i) => (
          <div
            key={i}
            className="absolute w-4 h-4 bg-green-500"
            style={{
              left: `${(segment[0] * 100) / gridSize}%`,
              top: `${(segment[1] * 100) / gridSize}%`,
            }}
          />
        ))}
        <div
          className="absolute w-4 h-4 bg-red-500"
          style={{
            left: `${(food[0] * 100) / gridSize}%`,
            top: `${(food[1] * 100) / gridSize}%`,
          }}
        />
      </div>
      {gameOver && (
        <div className="mt-4 text-center">
          <div className="text-xl font-bold text-red-500 mb-2">ゲームオーバー!</div>
          <button
            onClick={resetGame}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            もう一度プレイ
          </button>
        </div>
      )}
      <div className="mt-4 text-sm text-gray-600">
        矢印キーで蛇を操作してください
      </div>
    </div>
    
  );
};

export default SnakeGame;
