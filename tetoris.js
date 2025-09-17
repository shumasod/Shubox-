import React, { useState, useEffect, useCallback, useRef } from ‘react’;

const VegetableTetris = () => {
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const INITIAL_SPEED = 1000;

const [gameState, setGameState] = useState(‘menu’); // menu, playing, paused, gameOver
const [board, setBoard] = useState([]);
const [currentPiece, setCurrentPiece] = useState(null);
const [nextPiece, setNextPiece] = useState(null);
const [score, setScore] = useState(0);
const [lines, setLines] = useState(0);
const [level, setLevel] = useState(1);
const [speed, setSpeed] = useState(INITIAL_SPEED);
const [gameTimer, setGameTimer] = useState(0);

const gameLoopRef = useRef();

// 野菜の種類とテトリスピース
const vegetables = {
cabbage: { emoji: ‘🥬’, color: ‘bg-green-200’, name: ‘キャベツ’ },
carrot: { emoji: ‘🥕’, color: ‘bg-orange-200’, name: ‘にんじん’ },
pepper: { emoji: ‘🫑’, color: ‘bg-green-300’, name: ‘ピーマン’ },
onion: { emoji: ‘🧅’, color: ‘bg-yellow-200’, name: ‘たまねぎ’ },
eggplant: { emoji: ‘🍆’, color: ‘bg-purple-200’, name: ‘なす’ },
mushroom: { emoji: ‘🍄’, color: ‘bg-amber-200’, name: ‘きのこ’ }
};

const vegetableTypes = Object.keys(vegetables);

// テトリスピースの形状
const pieceShapes = {
I: [
[1, 1, 1, 1]
],
O: [
[1, 1],
[1, 1]
],
T: [
[0, 1, 0],
[1, 1, 1]
],
S: [
[0, 1, 1],
[1, 1, 0]
],
Z: [
[1, 1, 0],
[0, 1, 1]
],
J: [
[1, 0, 0],
[1, 1, 1]
],
L: [
[0, 0, 1],
[1, 1, 1]
]
};

const shapeTypes = Object.keys(pieceShapes);

// 空のボードを作成
const createEmptyBoard = () => {
return Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(null));
};

// ランダムピースを生成
const createRandomPiece = () => {
const shapeType = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
const vegetableType = vegetableTypes[Math.floor(Math.random() * vegetableTypes.length)];
return {
shape: pieceShapes[shapeType],
vegetable: vegetableType,
x: Math.floor(BOARD_WIDTH / 2) - 1,
y: 0,
rotation: 0
};
};

// ピースを回転
const rotatePiece = (piece) => {
const rotated = piece.shape[0].map((_, i) =>
piece.shape.map(row => row[i]).reverse()
);
return { …piece, shape: rotated };
};

// 衝突判定
const isCollision = (piece, board, dx = 0, dy = 0) => {
for (let y = 0; y < piece.shape.length; y++) {
for (let x = 0; x < piece.shape[y].length; x++) {
if (piece.shape[y][x]) {
const newX = piece.x + x + dx;
const newY = piece.y + y + dy;

```
      if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
        return true;
      }
      if (newY >= 0 && board[newY][newX]) {
        return true;
      }
    }
  }
}
return false;
```

};

// ピースをボードに固定
const placePiece = (piece, board) => {
const newBoard = board.map(row => […row]);
for (let y = 0; y < piece.shape.length; y++) {
for (let x = 0; x < piece.shape[y].length; x++) {
if (piece.shape[y][x]) {
const boardY = piece.y + y;
const boardX = piece.x + x;
if (boardY >= 0) {
newBoard[boardY][boardX] = piece.vegetable;
}
}
}
}
return newBoard;
};

// 完成した行をクリア
const clearLines = (board) => {
const newBoard = board.filter(row => row.some(cell => cell === null));
const clearedLines = BOARD_HEIGHT - newBoard.length;
const emptyRows = Array(clearedLines).fill().map(() => Array(BOARD_WIDTH).fill(null));
return {
board: […emptyRows, …newBoard],
clearedLines
};
};

// 野菜の組み合わせボーナスを計算
const calculateComboBonus = (board, clearedRows) => {
let comboBonus = 0;
clearedRows.forEach(row => {
const vegetables = {};
row.forEach(cell => {
if (cell && vegetables[cell]) {
vegetables[cell]++;
} else if (cell) {
vegetables[cell] = 1;
}
});

```
  // 同じ野菜が多いほどボーナス
  Object.values(vegetables).forEach(count => {
    if (count >= 3) comboBonus += count * 10;
    else if (count === 2) comboBonus += 5;
  });
});
return comboBonus;
```

};

// ゲーム開始
const startGame = () => {
setBoard(createEmptyBoard());
setCurrentPiece(createRandomPiece());
setNextPiece(createRandomPiece());
setScore(0);
setLines(0);
setLevel(1);
setSpeed(INITIAL_SPEED);
setGameTimer(0);
setGameState(‘playing’);
};

// ゲームループ
useEffect(() => {
if (gameState === ‘playing’) {
gameLoopRef.current = setInterval(() => {
setGameTimer(prev => prev + 1);
movePieceDown();
}, speed);
} else {
if (gameLoopRef.current) {
clearInterval(gameLoopRef.current);
}
}

```
return () => {
  if (gameLoopRef.current) {
    clearInterval(gameLoopRef.current);
  }
};
```

}, [gameState, speed]);

const movePieceDown = () => {
setBoard(currentBoard => {
setCurrentPiece(currentPiece => {
if (!currentPiece) return currentPiece;

```
    if (!isCollision(currentPiece, currentBoard, 0, 1)) {
      return { ...currentPiece, y: currentPiece.y + 1 };
    } else {
      // ピースを固定
      const newBoard = placePiece(currentPiece, currentBoard);
      const { board: clearedBoard, clearedLines } = clearLines(newBoard);
      
      // スコア計算
      if (clearedLines > 0) {
        const baseScore = clearedLines * 100 * level;
        const comboBonus = calculateComboBonus(newBoard, newBoard.slice(-clearedLines));
        setScore(prev => prev + baseScore + comboBonus);
        setLines(prev => {
          const newLines = prev + clearedLines;
          setLevel(Math.floor(newLines / 10) + 1);
          setSpeed(Math.max(100, INITIAL_SPEED - (Math.floor(newLines / 10) * 100)));
          return newLines;
        });
      }
      
      setBoard(clearedBoard);
      
      // 次のピース
      setNextPiece(nextPiece => {
        setCurrentPiece(nextPiece);
        return createRandomPiece();
      });
      
      // ゲームオーバー判定
      if (currentPiece.y <= 1) {
        setGameState('gameOver');
      }
      
      return null;
    }
  });
  return currentBoard;
});
```

};

// キーボード操作
const handleKeyPress = useCallback((e) => {
if (gameState !== ‘playing’ || !currentPiece) return;

```
switch (e.key) {
  case 'ArrowLeft':
    if (!isCollision(currentPiece, board, -1, 0)) {
      setCurrentPiece(prev => ({ ...prev, x: prev.x - 1 }));
    }
    break;
  case 'ArrowRight':
    if (!isCollision(currentPiece, board, 1, 0)) {
      setCurrentPiece(prev => ({ ...prev, x: prev.x + 1 }));
    }
    break;
  case 'ArrowDown':
    movePieceDown();
    break;
  case 'ArrowUp':
  case ' ':
    const rotated = rotatePiece(currentPiece);
    if (!isCollision(rotated, board)) {
      setCurrentPiece(rotated);
    }
    break;
  case 'p':
  case 'P':
    setGameState(gameState === 'playing' ? 'paused' : 'playing');
    break;
}
```

}, [gameState, currentPiece, board]);

useEffect(() => {
window.addEventListener(‘keydown’, handleKeyPress);
return () => window.removeEventListener(‘keydown’, handleKeyPress);
}, [handleKeyPress]);

// ボードとピースを描画
const renderBoard = () => {
const displayBoard = board.map(row => […row]);

```
// 現在のピースを描画
if (currentPiece) {
  for (let y = 0; y < currentPiece.shape.length; y++) {
    for (let x = 0; x < currentPiece.shape[y].length; x++) {
      if (currentPiece.shape[y][x]) {
        const boardY = currentPiece.y + y;
        const boardX = currentPiece.x + x;
        if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
          displayBoard[boardY][boardX] = currentPiece.vegetable;
        }
      }
    }
  }
}

return displayBoard.map((row, y) => (
  <div key={y} className="flex">
    {row.map((cell, x) => (
      <div
        key={x}
        className={`w-8 h-8 border border-gray-300 flex items-center justify-center text-sm ${
          cell ? vegetables[cell].color : 'bg-gray-50'
        }`}
      >
        {cell && vegetables[cell].emoji}
      </div>
    ))}
  </div>
));
```

};

// 次のピースを描画
const renderNextPiece = () => {
if (!nextPiece) return null;

```
return (
  <div className="bg-white p-4 rounded-lg">
    <h3 className="font-bold mb-2">次の野菜:</h3>
    <div className="flex flex-col">
      {nextPiece.shape.map((row, y) => (
        <div key={y} className="flex">
          {row.map((cell, x) => (
            <div
              key={x}
              className={`w-6 h-6 border border-gray-200 flex items-center justify-center text-xs ${
                cell ? vegetables[nextPiece.vegetable].color : 'bg-transparent'
              }`}
            >
              {cell && vegetables[nextPiece.vegetable].emoji}
            </div>
          ))}
        </div>
      ))}
    </div>
    <p className="text-sm mt-1">{vegetables[nextPiece.vegetable].name}</p>
  </div>
);
```

};

if (gameState === ‘menu’) {
return (
<div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-green-100 to-yellow-100 p-8">
<div className="text-center bg-white rounded-lg p-8 shadow-2xl">
<h1 className="text-6xl mb-4">🍳🧩</h1>
<h1 className="text-4xl font-bold text-green-800 mb-6">野菜炒めテトリス</h1>
<p className="text-lg text-gray-700 mb-8 max-w-md">
落下する野菜ブロックを組み合わせて<br/>
美味しい野菜炒めを完成させよう！<br/>
同じ野菜を揃えるとコンボボーナス！
</p>
<button
onClick={startGame}
className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-full text-xl transition-colors duration-300 transform hover:scale-105"
>
ゲームスタート！
</button>
<div className="mt-6 text-sm text-gray-600">
<p>操作: ← → ↓ (移動) ↑/スペース (回転) P (一時停止)</p>
</div>
</div>
</div>
);
}

if (gameState === ‘gameOver’) {
return (
<div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-red-100 to-orange-100 p-8">
<div className="text-center bg-white rounded-lg p-8 shadow-2xl">
<h1 className="text-4xl mb-4">🍳💥</h1>
<h2 className="text-3xl font-bold mb-4">野菜炒め完成！</h2>
<div className="text-6xl font-bold text-green-600 mb-2">{score}点</div>
<div className="text-xl mb-4">レベル {level} | {lines} 皿完成</div>
<div className="mb-6">
{score >= 5000 && <p className="text-xl text-green-600">🌟 野菜炒めマスターシェフ！</p>}
{score >= 2000 && score < 5000 && <p className="text-xl text-blue-600">👨‍🍳 料理上手！</p>}
{score >= 500 && score < 2000 && <p className="text-xl text-yellow-600">🥗 なかなか美味しい！</p>}
{score < 500 && <p className="text-xl text-gray-600">🤔 もう一度挑戦！</p>}
</div>
<div className="flex gap-4">
<button
onClick={startGame}
className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full transition-colors"
>
もう一度プレイ
</button>
<button
onClick={() => setGameState(‘menu’)}
className=“bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-full transition-colors”
>
メニューに戻る
</button>
</div>
</div>
</div>
);
}

if (gameState === ‘paused’) {
return (
<div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 p-8">
<div className="text-center bg-white rounded-lg p-8 shadow-2xl">
<h2 className="text-3xl font-bold mb-4">⏸️ 一時停止</h2>
<p className="text-lg mb-6">Pキーまたはボタンで再開</p>
<button
onClick={() => setGameState(‘playing’)}
className=“bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full transition-colors”
>
ゲーム再開
</button>
</div>
</div>
);
}

return (
<div className="min-h-screen bg-gradient-to-b from-yellow-100 to-green-100 p-4">
<div className="max-w-6xl mx-auto flex gap-4">
{/* Game Board */}
<div className="flex-1">
<div className="bg-gradient-to-br from-amber-800 to-amber-900 p-6 rounded-lg shadow-2xl">
<h2 className="text-white text-xl font-bold mb-4 text-center">🍳 野菜炒めフライパン</h2>
<div className="bg-gradient-to-br from-gray-700 to-gray-800 p-4 rounded-lg border-4 border-gray-900">
<div className="bg-gradient-to-br from-gray-600 to-gray-700 p-2 rounded">
{renderBoard()}
</div>
</div>
</div>
</div>

```
    {/* Side Panel */}
    <div className="w-64 space-y-4">
      {/* Score */}
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <h3 className="font-bold text-lg mb-2">📊 スコア</h3>
        <div className="text-2xl font-bold text-green-600">{score.toLocaleString()}</div>
        <div className="text-sm text-gray-600 mt-2">
          <div>レベル: {level}</div>
          <div>完成: {lines} 皿</div>
          <div>時間: {Math.floor(gameTimer / 10)}秒</div>
        </div>
      </div>

      {/* Next Piece */}
      {renderNextPiece()}

      {/* Vegetable Legend */}
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <h3 className="font-bold mb-2">🥗 野菜の種類</h3>
        <div className="space-y-1 text-sm">
          {Object.entries(vegetables).map(([key, veg]) => (
            <div key={key} className="flex items-center gap-2">
              <span className="text-lg">{veg.emoji}</span>
              <span>{veg.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <h3 className="font-bold mb-2">🎮 操作方法</h3>
        <div className="text-sm space-y-1">
          <div>← → : 移動</div>
          <div>↓ : 高速落下</div>
          <div>↑/Space : 回転</div>
          <div>P : 一時停止</div>
        </div>
      </div>

      {/* Game Controls */}
      <div className="space-y-2">
        <button
          onClick={() => setGameState('paused')}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          ⏸️ 一時停止
        </button>
        <button
          onClick={() => setGameState('menu')}
          className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          🏠 メニュー
        </button>
      </div>
    </div>
  </div>

  {/* Mobile Controls */}
  <div className="lg:hidden fixed bottom-4 left-4 right-4">
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => handleKeyPress({ key: 'ArrowLeft' })}
          className="bg-blue-500 text-white p-3 rounded font-bold"
        >
          ←
        </button>
        <button
          onClick={() => handleKeyPress({ key: ' ' })}
          className="bg-green-500 text-white p-3 rounded font-bold"
        >
          ↻
        </button>
        <button
          onClick={() => handleKeyPress({ key: 'ArrowRight' })}
          className="bg-blue-500 text-white p-3 rounded font-bold"
        >
          →
        </button>
        <button
          onClick={() => handleKeyPress({ key: 'ArrowDown' })}
          className="col-span-3 bg-red-500 text-white p-3 rounded font-bold"
        >
          ↓ 高速落下
        </button>
      </div>
    </div>
  </div>
</div>
```

);
};

export default VegetableTetris;