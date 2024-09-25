import React, { useState, useEffect } from 'react';

const BOARD_SIZE = 8; // 8x8の盤面
const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1]
];

const OthelloGame = () => {
  const [board, setBoard] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState('black');

  useEffect(() => {
    initializeBoard();
  }, []);

  const initializeBoard = () => {
    const newBoard = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
    newBoard[3][3] = 'white';
    newBoard[3][4] = 'black';
    newBoard[4][3] = 'black';
    newBoard[4][4] = 'white';
    setBoard(newBoard);
  };

  const handleCellClick = (row, col) => {
    if (board[row][col] !== null) return;
    if (!isValidMove(row, col, currentPlayer)) return;

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = currentPlayer;
    flipDiscs(row, col, currentPlayer, newBoard);
    setBoard(newBoard);
    setCurrentPlayer(currentPlayer === 'black' ? 'white' : 'black');
  };

  const isValidMove = (row, col, player) => {
    return DIRECTIONS.some(([dx, dy]) => {
      let x = row + dx;
      let y = col + dy;
      if (!isValidCoordinate(x, y) || board[x][y] !== getOpponent(player)) return false;
      
      while (isValidCoordinate(x, y) && board[x][y] === getOpponent(player)) {
        x += dx;
        y += dy;
      }
      
      return isValidCoordinate(x, y) && board[x][y] === player;
    });
  };

  const flipDiscs = (row, col, player, newBoard) => {
    DIRECTIONS.forEach(([dx, dy]) => {
      let x = row + dx;
      let y = col + dy;
      const discsToFlip = [];

      while (isValidCoordinate(x, y) && newBoard[x][y] === getOpponent(player)) {
        discsToFlip.push([x, y]);
        x += dx;
        y += dy;
      }

      if (isValidCoordinate(x, y) && newBoard[x][y] === player) {
        discsToFlip.forEach(([flipX, flipY]) => {
          newBoard[flipX][flipY] = player;
        });
      }
    });
  };

  const isValidCoordinate = (x, y) => x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE;
  const getOpponent = (player) => player === 'black' ? 'white' : 'black';

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">Othello Game</h1>
      <div className="grid grid-cols-8 gap-0">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className="w-10 h-10 border border-black flex items-center justify-center cursor-pointer bg-green-600"
              onClick={() => handleCellClick(rowIndex, colIndex)}
            >
              {cell && (
                <div
                  className={`w-8 h-8 rounded-full ${
                    cell === 'black' ? 'bg-black' : 'bg-white'
                  }`}
                />
              )}
            </div>
          ))
        )}
      </div>
      <p className="mt-4">Current player: {currentPlayer}</p>
    </div>
  );
};

export default OthelloGame;
