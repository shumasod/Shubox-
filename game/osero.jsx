import React, { useState, useEffect } from 'react';

const BOARD_SIZE = 8; // 8x8の盤面
const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1]
];

// ゲームの状態を表す定数
const GAME_STATE = {
  PLAYING: 'playing',
  GAME_OVER: 'game_over',
};

const OthelloGame = () => {
  const [board, setBoard] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState('black');
  const [gameState, setGameState] = useState(GAME_STATE.PLAYING);
  const [scores, setScores] = useState({ black: 2, white: 2 });
  const [validMoves, setValidMoves] = useState([]);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState([]);
  const [winner, setWinner] = useState(null);

  // ゲーム開始時に盤面を初期化
  useEffect(() => {
    initializeGame();
  }, []);

  // プレイヤーが変わるたびに、有効な手を計算
  useEffect(() => {
    if (gameState === GAME_STATE.PLAYING) {
      const moves = calculateValidMoves(board, currentPlayer);
      setValidMoves(moves);

      // 有効な手がない場合
      if (moves.length === 0) {
        const opponentMoves = calculateValidMoves(board, getOpponent(currentPlayer));
        
        // 相手も有効な手がない場合、ゲーム終了
        if (opponentMoves.length === 0) {
          endGame();
        } else {
          // 現在のプレイヤーをスキップ
          setMessage(`${currentPlayer === 'black' ? '黒' : '白'}の手番をスキップします`);
          setTimeout(() => {
            setCurrentPlayer(getOpponent(currentPlayer));
            setMessage('');
          }, 2000);
        }
      }
    }
  }, [currentPlayer, board, gameState]);

  // スコアの更新
  useEffect(() => {
    if (board.length > 0) {
      updateScores();
    }
  }, [board]);

  const initializeGame = () => {
    // 盤面の初期化
    const newBoard = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
    newBoard[3][3] = 'white';
    newBoard[3][4] = 'black';
    newBoard[4][3] = 'black';
    newBoard[4][4] = 'white';
    
    setBoard(newBoard);
    setCurrentPlayer('black');
    setGameState(GAME_STATE.PLAYING);
    setScores({ black: 2, white: 2 });
    setValidMoves([]);
    setMessage('黒の番です');
    setHistory([]);
    setWinner(null);
  };

  const updateScores = () => {
    let blackCount = 0;
    let whiteCount = 0;
    
    board.forEach(row => {
      row.forEach(cell => {
        if (cell === 'black') blackCount++;
        if (cell === 'white') whiteCount++;
      });
    });
    
    setScores({ black: blackCount, white: whiteCount });
  };

  const calculateValidMoves = (currentBoard, player) => {
    const moves = [];
    
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (currentBoard[row][col] === null && isValidMove(row, col, player, currentBoard)) {
          moves.push([row, col]);
        }
      }
    }
    
    return moves;
  };

  const handleCellClick = (row, col) => {
    // 既に終了している場合は何もしない
    if (gameState === GAME_STATE.GAME_OVER) return;
    
    // 既に置かれている場所や有効でない場所には置けない
    if (board[row][col] !== null) return;
    if (!isValidMoveFromArray(row, col)) return;

    // ゲーム状態を配列に保存（アンドゥ用）
    const gameSnapshot = {
      board: board.map(row => [...row]),
      currentPlayer,
      scores: { ...scores }
    };
    setHistory([...history, gameSnapshot]);
    
    // 新しい盤面を作成し、石を置く
    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = currentPlayer;
    
    // 石をひっくり返す
    flipDiscs(row, col, currentPlayer, newBoard);
    setBoard(newBoard);
    
    // 次のプレイヤーに交代
    const nextPlayer = getOpponent(currentPlayer);
    setCurrentPlayer(nextPlayer);
    setMessage(`${nextPlayer === 'black' ? '黒' : '白'}の番です`);
  };

  const isValidMoveFromArray = (row, col) => {
    return validMoves.some(([r, c]) => r === row && c === col);
  };

  const isValidMove = (row, col, player, currentBoard = board) => {
    return DIRECTIONS.some(([dx, dy]) => {
      let x = row + dx;
      let y = col + dy;
      
      // 隣接するマスが相手の石であるかチェック
      if (!isValidCoordinate(x, y) || currentBoard[x][y] !== getOpponent(player)) return false;
      
      // その方向に進んでいって、自分の石に到達するかチェック
      while (isValidCoordinate(x, y) && currentBoard[x][y] === getOpponent(player)) {
        x += dx;
        y += dy;
      }
      
      return isValidCoordinate(x, y) && currentBoard[x][y] === player;
    });
  };

  const flipDiscs = (row, col, player, newBoard) => {
    DIRECTIONS.forEach(([dx, dy]) => {
      let x = row + dx;
      let y = col + dy;
      const discsToFlip = [];
      
      // その方向に相手の石がある限り続ける
      while (isValidCoordinate(x, y) && newBoard[x][y] === getOpponent(player)) {
        discsToFlip.push([x, y]);
        x += dx;
        y += dy;
      }
      
      // 最終的に自分の石に到達した場合、間の石をすべてひっくり返す
      if (isValidCoordinate(x, y) && newBoard[x][y] === player) {
        discsToFlip.forEach(([flipX, flipY]) => {
          newBoard[flipX][flipY] = player;
        });
      }
    });
  };

  const isValidCoordinate = (x, y) => x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE;
  
  const getOpponent = (player) => player === 'black' ? 'white' : 'black';

  const endGame = () => {
    setGameState(GAME_STATE.GAME_OVER);
    
    const { black, white } = scores;
    let winnerMessage;
    
    if (black > white) {
      setWinner('black');
      winnerMessage = '黒の勝利です！';
    } else if (white > black) {
      setWinner('white');
      winnerMessage = '白の勝利です！';
    } else {
      setWinner('draw');
      winnerMessage = '引き分けです！';
    }
    
    setMessage(winnerMessage);
  };

  const undoMove = () => {
    if (history.length === 0) return;
    
    const lastState = history[history.length - 1];
    setBoard(lastState.board);
    setCurrentPlayer(lastState.currentPlayer);
    setScores(lastState.scores);
    setHistory(history.slice(0, -1));
    setMessage(`${lastState.currentPlayer === 'black' ? '黒' : '白'}の番です`);
  };

  const getCellClassName = (row, col) => {
    let className = "w-12 h-12 border border-black flex items-center justify-center cursor-pointer bg-green-600";
    
    // 有効な手の場合、ハイライト表示
    if (board[row][col] === null && isValidMoveFromArray(row, col)) {
      className += " bg-green-400";
    }
    
    return className;
  };

  return (
    <div className="flex flex-col items-center p-4 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">オセロゲーム</h1>
      
      <div className="flex justify-between w-full mb-4">
        <div className={`flex items-center ${currentPlayer === 'black' ? 'bg-yellow-100 p-2 rounded-md' : ''}`}>
          <div className="w-6 h-6 rounded-full bg-black mr-2"></div>
          <span className="font-medium">{scores.black}</span>
        </div>
        
        <div className="text-center">
          {message && <p className="text-lg font-medium text-blue-600">{message}</p>}
        </div>
        
        <div className={`flex items-center ${currentPlayer === 'white' ? 'bg-yellow-100 p-2 rounded-md' : ''}`}>
          <div className="w-6 h-6 rounded-full bg-white border border-gray-300 mr-2"></div>
          <span className="font-medium">{scores.white}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-8 gap-0 border-2 border-black shadow-md mb-4">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={getCellClassName(rowIndex, colIndex)}
              onClick={() => handleCellClick(rowIndex, colIndex)}
            >
              {cell && (
                <div
                  className={`w-9 h-9 rounded-full ${
                    cell === 'black' ? 'bg-black' : 'bg-white border border-gray-300'
                  } shadow-md`}
                />
              )}
            </div>
          ))
        )}
      </div>
      
      <div className="flex space-x-4 w-full">
        <button
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded shadow"
          onClick={initializeGame}
        >
          ゲームをリセット
        </button>
        
        <button
          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded shadow"
          onClick={undoMove}
          disabled={history.length === 0}
        >
          一手戻る
        </button>
      </div>
      
      {gameState === GAME_STATE.GAME_OVER && (
        <div className="mt-6 text-center">
          <h2 className="text-2xl font-bold mb-2">
            {winner === 'black' ? '黒の勝利！' : 
             winner === 'white' ? '白の勝利！' : 
             '引き分け！'}
          </h2>
          <p className="mb-4">
            最終スコア: 黒 {scores.black} - 白 {scores.white}
          </p>
        </div>
      )}
    </div>
  );
};

export default OthelloGame;
