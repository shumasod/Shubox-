import React, { useState, useEffect, useCallback } from 'react';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const CELL_SIZE = 30;

// テトリスのピース定義
const TETROMINOS = {
  I: {
    shape: [[1, 1, 1, 1]],
    color: 'from-cyan-400 to-blue-500',
    shadowColor: 'shadow-cyan-400/50'
  },
  O: {
    shape: [[1, 1], [1, 1]],
    color: 'from-yellow-400 to-orange-500',
    shadowColor: 'shadow-yellow-400/50'
  },
  T: {
    shape: [[0, 1, 0], [1, 1, 1]],
    color: 'from-purple-400 to-pink-500',
    shadowColor: 'shadow-purple-400/50'
  },
  S: {
    shape: [[0, 1, 1], [1, 1, 0]],
    color: 'from-green-400 to-emerald-500',
    shadowColor: 'shadow-green-400/50'
  },
  Z: {
    shape: [[1, 1, 0], [0, 1, 1]],
    color: 'from-red-400 to-rose-500',
    shadowColor: 'shadow-red-400/50'
  },
  J: {
    shape: [[1, 0, 0], [1, 1, 1]],
    color: 'from-indigo-400 to-blue-600',
    shadowColor: 'shadow-indigo-400/50'
  },
  L: {
    shape: [[0, 0, 1], [1, 1, 1]],
    color: 'from-orange-400 to-red-500',
    shadowColor: 'shadow-orange-400/50'
  }
};

const TETROMINO_KEYS = Object.keys(TETROMINOS);

const SpaceTetris = () => {
  const [board, setBoard] = useState(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null)));
  const [currentPiece, setCurrentPiece] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameStarted, setGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // 星の背景用の状態
  const [stars, setStars] = useState([]);

  // 星を生成
  useEffect(() => {
    const generateStars = () => {
      const newStars = [];
      for (let i = 0; i < 100; i++) {
        newStars.push({
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 3 + 1,
          opacity: Math.random() * 0.8 + 0.2
        });
      }
      setStars(newStars);
    };
    generateStars();
  }, []);

  // 新しいピースを生成
  const createNewPiece = () => {
    const type = TETROMINO_KEYS[Math.floor(Math.random() * TETROMINO_KEYS.length)];
    return {
      type,
      shape: TETROMINOS[type].shape,
      color: TETROMINOS[type].color,
      shadowColor: TETROMINOS[type].shadowColor,
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(TETROMINOS[type].shape[0].length / 2),
      y: 0
    };
  };

  // ピースを回転
  const rotatePiece = (piece) => {
    const rotated = piece.shape[0].map((_, index) =>
      piece.shape.map(row => row[index]).reverse()
    );
    return { ...piece, shape: rotated };
  };

  // 衝突判定
  const checkCollision = (piece, newX, newY, newShape = null) => {
    const shape = newShape || piece.shape;
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const boardX = newX + x;
          const boardY = newY + y;
          if (
            boardX < 0 ||
            boardX >= BOARD_WIDTH ||
            boardY >= BOARD_HEIGHT ||
            (boardY >= 0 && board[boardY][boardX])
          ) {
            return true;
          }
        }
      }
    }
    return false;
  };

  // ピースをボードに配置
  const placePiece = (piece, newBoard) => {
    const boardCopy = newBoard.map(row => [...row]);
    piece.shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          const boardY = piece.y + y;
          const boardX = piece.x + x;
          if (boardY >= 0) {
            boardCopy[boardY][boardX] = {
              color: piece.color,
              shadowColor: piece.shadowColor
            };
          }
        }
      });
    });
    return boardCopy;
  };

  // ライン消去
  const clearLines = (boardToClear) => {
    const newBoard = boardToClear.filter(row => row.some(cell => cell === null));
    const clearedLines = BOARD_HEIGHT - newBoard.length;
    
    if (clearedLines > 0) {
      const emptyRows = Array(clearedLines).fill(null).map(() => Array(BOARD_WIDTH).fill(null));
      const finalBoard = [...emptyRows, ...newBoard];
      
      // スコア計算
      const points = [0, 40, 100, 300, 1200][clearedLines] * level;
      setScore(prev => prev + points);
      setLines(prev => prev + clearedLines);
      setLevel(prev => Math.floor((prev * 10 + clearedLines) / 10) + 1);
      
      return finalBoard;
    }
    return boardToClear;
  };

  // ゲームオーバー判定
  const checkGameOver = (piece) => {
    return checkCollision(piece, piece.x, piece.y);
  };

  // ゲームロジック
  const gameLoop = useCallback(() => {
    if (!gameStarted || isPaused || gameOver || !currentPiece) return;

    if (!checkCollision(currentPiece, currentPiece.x, currentPiece.y + 1)) {
      setCurrentPiece(prev => ({ ...prev, y: prev.y + 1 }));
    } else {
      // ピースを配置
      const newBoard = placePiece(currentPiece, board);
      const clearedBoard = clearLines(newBoard);
      setBoard(clearedBoard);
      
      // 新しいピースを生成
      const newPiece = createNewPiece();
      if (checkGameOver(newPiece)) {
        setGameOver(true);
      } else {
        setCurrentPiece(newPiece);
      }
    }
  }, [board, currentPiece, gameStarted, isPaused, gameOver]);

  // ゲームループのタイマー
  useEffect(() => {
    const interval = setInterval(gameLoop, Math.max(50, 1000 - level * 50));
    return () => clearInterval(interval);
  }, [gameLoop, level]);

  // キーボード操作
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!gameStarted || isPaused || gameOver || !currentPiece) return;

      switch (e.key) {
        case 'ArrowLeft':
          if (!checkCollision(currentPiece, currentPiece.x - 1, currentPiece.y)) {
            setCurrentPiece(prev => ({ ...prev, x: prev.x - 1 }));
          }
          break;
        case 'ArrowRight':
          if (!checkCollision(currentPiece, currentPiece.x + 1, currentPiece.y)) {
            setCurrentPiece(prev => ({ ...prev, x: prev.x + 1 }));
          }
          break;
        case 'ArrowDown':
          if (!checkCollision(currentPiece, currentPiece.x, currentPiece.y + 1)) {
            setCurrentPiece(prev => ({ ...prev, y: prev.y + 1 }));
          }
          break;
        case 'ArrowUp':
        case ' ':
          const rotated = rotatePiece(currentPiece);
          if (!checkCollision(currentPiece, currentPiece.x, currentPiece.y, rotated.shape)) {
            setCurrentPiece(rotated);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPiece, gameStarted, isPaused, gameOver]);

  // ゲーム開始
  const startGame = () => {
    setBoard(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null)));
    setCurrentPiece(createNewPiece());
    setGameOver(false);
    setScore(0);
    setLines(0);
    setLevel(1);
    setGameStarted(true);
    setIsPaused(false);
  };

  // ゲーム一時停止
  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  // ボードを描画
  const renderBoard = () => {
    const displayBoard = board.map(row => [...row]);
    
    // 現在のピースを表示
    if (currentPiece) {
      currentPiece.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell) {
            const boardY = currentPiece.y + y;
            const boardX = currentPiece.x + x;
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              displayBoard[boardY][boardX] = {
                color: currentPiece.color,
                shadowColor: currentPiece.shadowColor
              };
            }
          }
        });
      });
    }

    return displayBoard.map((row, y) => (
      <div key={y} className="flex">
        {row.map((cell, x) => (
          <div
            key={`${y}-${x}`}
            className={`w-7 h-7 border border-gray-600/30 ${
              cell
                ? `bg-gradient-to-br ${cell.color} ${cell.shadowColor} shadow-lg`
                : 'bg-gray-900/20'
            }`}
            style={{
              boxShadow: cell ? '0 0 10px rgba(147, 197, 253, 0.3)' : 'none'
            }}
          />
        ))}
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-black relative overflow-hidden">
      {/* 星空背景 */}
      <div className="absolute inset-0">
        {stars.map((star, index) => (
          <div
            key={index}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center min-h-screen py-8">
        <h1 className="text-4xl font-bold text-white mb-8 text-center bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          🚀 宇宙版テトリス 🌟
        </h1>

        <div className="flex flex-col lg:flex-row items-start gap-8">
          {/* ゲームボード */}
          <div className="relative">
            <div className="bg-black/40 backdrop-blur-sm p-4 rounded-lg border border-cyan-400/30 shadow-2xl">
              <div className="flex flex-col border-2 border-cyan-400/50 rounded">
                {renderBoard()}
              </div>
            </div>
            
            {/* ゲームオーバー表示 */}
            {gameOver && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-red-400 mb-4">GAME OVER</h2>
                  <p className="text-white mb-4">スコア: {score}</p>
                  <button
                    onClick={startGame}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg font-bold hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 shadow-lg"
                  >
                    もう一度プレイ
                  </button>
                </div>
              </div>
            )}

            {/* 一時停止表示 */}
            {isPaused && gameStarted && !gameOver && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-yellow-400 mb-4">一時停止</h2>
                  <button
                    onClick={togglePause}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg font-bold hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg"
                  >
                    再開
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* サイドパネル */}
          <div className="space-y-6">
            {/* スコア表示 */}
            <div className="bg-black/40 backdrop-blur-sm p-6 rounded-lg border border-cyan-400/30 shadow-xl">
              <div className="space-y-4 text-white">
                <div className="flex justify-between items-center">
                  <span className="text-cyan-400">スコア:</span>
                  <span className="font-bold text-xl">{score}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-cyan-400">ライン:</span>
                  <span className="font-bold">{lines}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-cyan-400">レベル:</span>
                  <span className="font-bold">{level}</span>
                </div>
              </div>
            </div>

            {/* 操作説明 */}
            <div className="bg-black/40 backdrop-blur-sm p-6 rounded-lg border border-cyan-400/30 shadow-xl">
              <h3 className="text-cyan-400 font-bold mb-4">操作方法</h3>
              <div className="space-y-2 text-white text-sm">
                <div>← → : 左右移動</div>
                <div>↓ : 早く落とす</div>
                <div>↑ / スペース : 回転</div>
              </div>
            </div>

            {/* ゲームコントロール */}
            <div className="space-y-3">
              {!gameStarted ? (
                <button
                  onClick={startGame}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg font-bold hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg"
                >
                  ゲーム開始
                </button>
              ) : (
                <>
                  <button
                    onClick={togglePause}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-lg font-bold hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 shadow-lg"
                  >
                    {isPaused ? '再開' : '一時停止'}
                  </button>
                  <button
                    onClick={startGame}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-bold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg"
                  >
                    リスタート
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpaceTetris;
