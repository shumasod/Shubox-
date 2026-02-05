import React, { useState, useEffect, useCallback, useRef } from 'react';

const SnakeGame = () => {
  // ゲーム設定
  const GRID_SIZE = 20;
  const DIFFICULTY_SETTINGS = {
    easy: { speed: 200, name: '初級' },
    medium: { speed: 150, name: '中級' },
    hard: { speed: 100, name: '上級' }
  };

  // ゲーム状態
  const [snake, setSnake] = useState([[10, 10]]);
  const [food, setFood] = useState([15, 15]);
  const [direction, setDirection] = useState('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [difficulty, setDifficulty] = useState('medium');
  const [isPaused, setIsPaused] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    try {
      const saved = localStorage.getItem('snakeHighScore');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  // 参照（イベントハンドラーでのクロージャ問題を回避）
  const directionRef = useRef(direction);
  const gameOverRef = useRef(gameOver);
  const isPausedRef = useRef(isPaused);
  const gameStartedRef = useRef(gameStarted);

  // 参照を更新
  useEffect(() => {
    directionRef.current = direction;
    gameOverRef.current = gameOver;
    isPausedRef.current = isPaused;
    gameStartedRef.current = gameStarted;
  }, [direction, gameOver, isPaused, gameStarted]);

  // 食べ物の位置をランダム生成（蛇と重ならない位置）
  const generateFood = useCallback(() => {
    const snakePositions = new Set(snake.map(segment => `${segment[0]},${segment[1]}`));
    let newFood;
    
    do {
      newFood = [
        Math.floor(Math.random() * GRID_SIZE),
        Math.floor(Math.random() * GRID_SIZE)
      ];
    } while (snakePositions.has(`${newFood[0]},${newFood[1]}`));

    return newFood;
  }, [snake]);

  // 方向変更
  const changeDirection = useCallback((newDirection) => {
    if (gameOverRef.current || !gameStartedRef.current) return;

    const opposites = {
      UP: 'DOWN',
      DOWN: 'UP',
      LEFT: 'RIGHT',
      RIGHT: 'LEFT'
    };

    if (opposites[directionRef.current] !== newDirection) {
      setDirection(newDirection);
    }
  }, []);

  // キーボードイベントハンドラー
  const handleKeyPress = useCallback((e) => {
    e.preventDefault();
    
    if (e.key === ' ') {
      if (!gameStartedRef.current) {
        startGame();
      } else {
        togglePause();
      }
      return;
    }

    if (e.key === 'Escape') {
      setShowInstructions(!showInstructions);
      return;
    }

    const keyMap = {
      ArrowUp: 'UP',
      ArrowDown: 'DOWN',
      ArrowLeft: 'LEFT',
      ArrowRight: 'RIGHT',
      w: 'UP',
      s: 'DOWN',
      a: 'LEFT',
      d: 'RIGHT',
      W: 'UP',
      S: 'DOWN',
      A: 'LEFT',
      D: 'RIGHT'
    };

    if (keyMap[e.key]) {
      changeDirection(keyMap[e.key]);
    }
  }, [changeDirection, showInstructions]);

  // キーボードイベントリスナー
  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // ゲームメインループ
  useEffect(() => {
    if (!gameStarted || gameOver || isPaused) return;

    const gameInterval = setInterval(() => {
      setSnake(currentSnake => {
        if (gameOverRef.current || isPausedRef.current) return currentSnake;

        const newSnake = [...currentSnake];
        const head = [...newSnake[0]];

        // 方向に基づいて頭を移動
        switch (directionRef.current) {
          case 'UP':
            head[1] -= 1;
            break;
          case 'DOWN':
            head[1] += 1;
            break;
          case 'LEFT':
            head[0] -= 1;
            break;
          case 'RIGHT':
            head[0] += 1;
            break;
        }

        // 壁や自分の体との衝突判定
        if (
          head[0] < 0 || head[0] >= GRID_SIZE ||
          head[1] < 0 || head[1] >= GRID_SIZE ||
          newSnake.some(segment => segment[0] === head[0] && segment[1] === head[1])
        ) {
          setGameOver(true);
          return currentSnake;
        }

        newSnake.unshift(head);

        // 食べ物を食べたか判定
        if (head[0] === food[0] && head[1] === food[1]) {
          setScore(prevScore => {
            const newScore = prevScore + 10;
            if (newScore > highScore) {
              setHighScore(newScore);
              try {
                localStorage.setItem('snakeHighScore', newScore.toString());
              } catch (e) {
                console.warn('ハイスコアの保存に失敗しました');
              }
            }
            return newScore;
          });
          setFood(generateFood());
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, DIFFICULTY_SETTINGS[difficulty].speed);

    return () => clearInterval(gameInterval);
  }, [gameStarted, gameOver, isPaused, difficulty, food, generateFood, highScore]);

  // ゲーム開始
  const startGame = () => {
    setSnake([[10, 10]]);
    setFood([15, 15]);
    setDirection('RIGHT');
    setGameOver(false);
    setGameStarted(true);
    setScore(0);
    setIsPaused(false);
  };

  // ゲームリセット
  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setIsPaused(false);
    setScore(0);
    setSnake([[10, 10]]);
    setFood([15, 15]);
    setDirection('RIGHT');
  };

  // ポーズ切り替え
  const togglePause = () => {
    if (gameStarted && !gameOver) {
      setIsPaused(!isPaused);
    }
  };

  // タッチコントロール
  const TouchControls = () => (
    <div className="grid grid-cols-3 gap-2 w-48 mx-auto mt-4">
      <div></div>
      <button
        onClick={() => changeDirection('UP')}
        className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg text-xl font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
        aria-label="上に移動"
      >
        ↑
      </button>
      <div></div>
      <button
        onClick={() => changeDirection('LEFT')}
        className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg text-xl font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
        aria-label="左に移動"
      >
        ←
      </button>
      <button
        onClick={gameStarted ? togglePause : startGame}
        className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-lg text-sm font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-green-300"
        aria-label={gameStarted ? (isPaused ? "再開" : "一時停止") : "ゲーム開始"}
      >
        {gameStarted ? (isPaused ? "再開" : "⏸️") : "▶️"}
      </button>
      <button
        onClick={() => changeDirection('RIGHT')}
        className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg text-xl font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
        aria-label="右に移動"
      >
        →
      </button>
      <div></div>
      <button
        onClick={() => changeDirection('DOWN')}
        className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg text-xl font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
        aria-label="下に移動"
      >
        ↓
      </button>
      <div></div>
    </div>
  );

  // ゲーム説明モーダル
  const InstructionsModal = () => (
    showInstructions && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">ゲームの遊び方</h2>
          <div className="space-y-3 text-gray-700">
            <p><strong>目的：</strong> 蛇を操作して食べ物を食べ、スコアを稼ごう！</p>
            <p><strong>操作方法：</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>矢印キー または WASD で蛇を操作</li>
              <li>スペースキーで開始/一時停止</li>
              <li>Escキーでこのヘルプを表示</li>
            </ul>
            <p><strong>ルール：</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>壁や自分の体にぶつかるとゲームオーバー</li>
              <li>食べ物を食べると蛇が長くなり、スコアが増加</li>
            </ul>
          </div>
          <button
            onClick={() => setShowInstructions(false)}
            className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            閉じる
          </button>
        </div>
      </div>
    )
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          スネークゲーム
        </h1>

        {/* ゲーム情報 */}
        <div className="flex justify-between items-center mb-4 text-lg">
          <div className="text-gray-700">
            スコア: <span className="font-bold text-blue-600">{score}</span>
          </div>
          <div className="text-gray-700">
            ハイスコア: <span className="font-bold text-green-600">{highScore}</span>
          </div>
        </div>

        {/* 難易度設定 */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">難易度:</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            disabled={gameStarted}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            aria-label="難易度選択"
          >
            {Object.entries(DIFFICULTY_SETTINGS).map(([key, settings]) => (
              <option key={key} value={key}>
                {settings.name}
              </option>
            ))}
          </select>
        </div>

        {/* ゲームボード */}
        <div className="relative mb-4">
          <div
            className="grid bg-gray-800 border-4 border-gray-700 rounded-lg mx-auto"
            style={{
              gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
              width: '400px',
              height: '400px'
            }}
            role="grid"
            aria-label="ゲームボード"
          >
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
              const x = index % GRID_SIZE;
              const y = Math.floor(index / GRID_SIZE);
              const isSnake = snake.some(segment => segment[0] === x && segment[1] === y);
              const isFood = food[0] === x && food[1] === y;
              const isHead = snake[0] && snake[0][0] === x && snake[0][1] === y;

              return (
                <div
                  key={index}
                  className={`border border-gray-700 ${
                    isSnake
                      ? isHead
                        ? 'bg-green-400'
                        : 'bg-green-600'
                      : isFood
                      ? 'bg-red-500'
                      : 'bg-gray-900'
                  }`}
                  role="gridcell"
                  aria-label={
                    isSnake
                      ? isHead
                        ? '蛇の頭'
                        : '蛇の体'
                      : isFood
                      ? '食べ物'
                      : '空のマス'
                  }
                />
              );
            })}
          </div>

          {/* ゲーム状態オーバーレイ */}
          {!gameStarted && (
            <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center rounded-lg">
              <div className="text-center text-white">
                <h2 className="text-2xl font-bold mb-4">スネークゲーム</h2>
                <p className="mb-4">スペースキーまたは下のボタンでゲーム開始</p>
              </div>
            </div>
          )}

          {isPaused && gameStarted && (
            <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center rounded-lg">
              <div className="text-center text-white">
                <h2 className="text-2xl font-bold mb-4">一時停止中</h2>
                <p className="mb-4">スペースキーで再開</p>
              </div>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center rounded-lg">
              <div className="text-center text-white">
                <h2 className="text-2xl font-bold mb-4">ゲームオーバー</h2>
                <p className="mb-4">最終スコア: {score}</p>
                {score === highScore && score > 0 && (
                  <p className="mb-4 text-yellow-400 font-bold">🎉 新記録！</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* コントロールボタン */}
        <div className="flex flex-wrap gap-2 justify-center mb-4">
          <button
            onClick={gameStarted ? togglePause : startGame}
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-6 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-300"
          >
            {gameStarted ? (isPaused ? '再開' : '一時停止') : 'ゲーム開始'}
          </button>
          <button
            onClick={resetGame}
            className="bg-red-500 hover:bg-red-600 text-white py-2 px-6 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
          >
            リセット
          </button>
          <button
            onClick={() => setShowInstructions(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            遊び方
          </button>
        </div>

        {/* タッチコントロール */}
        <div className="md:hidden">
          <h3 className="text-center text-gray-700 font-medium mb-2">タッチコントロール</h3>
          <TouchControls />
        </div>

        {/* キーボードヒント */}
        <div className="hidden md:block text-center text-gray-600 text-sm mt-4">
          <p>矢印キー or WASD: 移動 | スペース: 開始/一時停止 | Esc: ヘルプ</p>
        </div>
      </div>

      <InstructionsModal />
    </div>
  );
};

export default SnakeGame;
