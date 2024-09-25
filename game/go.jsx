import React, { useState } from 'react';

const BOARD_SIZE = 9; // 9x9の盤面

const GoGame = () => {
  const [board, setBoard] = useState(Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)));
  const [currentPlayer, setCurrentPlayer] = useState('black');

  const handleCellClick = (row, col) => {
    if (board[row][col] !== null) return;

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = currentPlayer;
    setBoard(newBoard);
    setCurrentPlayer(currentPlayer === 'black' ? 'white' : 'black');
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">Go Game</h1>
      <div className="grid grid-cols-9 gap-0">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className="w-8 h-8 border border-black flex items-center justify-center cursor-pointer"
              onClick={() => handleCellClick(rowIndex, colIndex)}
            >
              {cell && (
                <div
                  className={`w-6 h-6 rounded-full ${
                    cell === 'black' ? 'bg-black' : 'bg-white border border-black'
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

export default GoGame;
