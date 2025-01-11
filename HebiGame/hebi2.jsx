import React, { useState, useEffect, useCallback } from 'react';

const RetroSnakeGame = () => {
  const GRID_SIZE = 15;
  const INITIAL_SPEED = 200;
  
  const [grid, setGrid] = useState(Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0)));
  const [snake, setSnake] = useState([[7, 7]]);
  const [direction, setDirection] = useState('RIGHT');
  const [food, setFood] = useState([3, 3]);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  // グリッドの更新
  const updateGrid = useCallback(() => {
    const newGrid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
    
    // スネークの描画
    snake.forEach((pos, index) => {
      if (pos[0] >= 0 && pos[0] < GRID_SIZE && pos[1] >= 0 && pos[1] < GRID_SIZE) {
        newGrid[pos[1]][pos[0]] = index === 0 ? 2 : 1; // 頭は2、体は1
      }
    });
    
    // 食べ物の描画
    if (food[0] >= 0 && food[0] < GRID_SIZE && food[1] >= 0 && food[1] < GRID_SIZE) {
      newGrid[food[1]][food[0]] = 3;
    }
    
    setGrid(newGrid);
  }, [snake, food]);

  // 新しい食べ物の位置を生成
  const generateFood = useCallback(() => {
    let newFood;
    do {
      newFood = [
        Math.floor(Math.random() * GRID_SIZE),
        Math.floor(Math.random() * GRID_SIZE)
      ];
    } while (snake.some(segment => segment[0] === newFood[0] && segment[1] === newFood[1]));
    setFood(newFood);
  }, [snake]);

  // 衝突判定
  const checkCollision = useCallback((head) => {
    return (
      head[0] < 0 ||
      head[0] >= GRID_SIZE ||
      head[1] < 0 ||
      head[1] >= GRID_SIZE ||
      snake.slice(1).some(segment => segment[0] === head[0] && segment[1] === head[1])
    );
  }, [snake]);

  // ゲームオーバー処理
  const handleGameOver = useCallback(() => {
    setGameOver(true);
    setGameStarted(false);
    if (score > highScore) {
      setHighScore(score);
    }
  }, [score, highScore]);

  // ゲーム更新ロジック
  useEffect(() => {
    if (!gameStarted || gameOver || isPaused) return;

    const moveSnake = () => {
      const newSnake = [...snake];
      const head = [...newSnake[0]];

      switch (direction) {
        case 'UP':    head[1] -= 1; break;
        case 'DOWN':  head[1] += 1; break;
        case 'LEFT':  head[0] -= 1; break;
        case 'RIGHT': head[0] += 1; break;
        default: break;
      }

      if (checkCollision(head)) {
        handleGameOver();
        return;
      }

      newSnake.unshift(head);

      if (head[0] === food[0] && head[1] === food[1]) {
        setScore(s => s + 10);
        generateFood();
      } else {
        newSnake.pop();
      }

      setSnake(newSnake);
    };

    const gameInterval = setInterval(moveSnake, INITIAL_SPEED - Math.min(score * 2, 100));
    return () => clearInterval(gameInterval);
  }, [snake, direction, food, gameOver, isPaused, gameStarted, score, checkCollision, generateFood, handleGameOver]);

  // グリッドの更新
  useEffect(() => {
    updateGrid();
  }, [snake, food, updateGrid]);

  // キーボード操作
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!gameStarted && !gameOver && e.key === ' ') {
        setGameStarted(true);
        return;
      }

      if (e.key === 'p') {
        setIsPaused(!isPaused);
        return;
      }

      if (isPaused) return;

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

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, gameStarted, gameOver, isPaused]);

  // ゲームリセット
  const resetGame = () => {
    setSnake([[7, 7]]);
    setDirection('RIGHT');
    setFood([3, 3]);
    setGameOver(false);
    setScore(0);
    setIsPaused(false);
    setGameStarted(false);
  };

  const getCellColor = (value) => {
    switch (value) {
      case 0: return 'bg-gray-800';        // 空白
      case 1: return 'bg-green-500';       // スネークの体
      case 2: return 'bg-green-300';       // スネークの頭
      case 3: return 'bg-red-500';         // 食べ物
      default: return 'bg-gray-800';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto p-4 bg-gray-900 text-white">
      <div className="mb-4 flex justify-between w-full">
        <div className="text-xl">スコア: {score}</div>
        <div className="text-xl">ハイスコア: {highScore}</div>
      </div>
      
      <div className="grid gap-1 p-4 bg-gray-700 rounded-lg" 
           style={{ 
             gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
             width: 'min(90vw, 500px)',
             height: 'min(90vw, 500px)'
           }}>
        {grid.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              className={`aspect-square ${getCellColor(cell)}`}
            />
          ))
        )}
      </div>

      {!gameStarted && !gameOver && (
        <div className="mt-4 text-xl text-center">
          スペースキーを押してスタート
        </div>
      )}

      {isPaused && (
        <div className="mt-4 text-xl text-center">
          一時停止中
        </div>
      )}

      {gameOver && (
        <div className="mt-4 text-center">
          <div className="text-xl text-red-500 mb-2">ゲームオーバー!</div>
          <button
            onClick={resetGame}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            もう一度プレイ
          </button>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-400">
        <div>操作方法:</div>
        <div>矢印キー: 移動</div>
        <div>P: 一時停止</div>
        <div>スペース: スタート</div>
      </div>
    </div>
  );
};

export default RetroSnakeGame;
