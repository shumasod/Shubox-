import React, { useState, useEffect } from 'react';

const BOARD_SIZE = 9;
const PIECES = {
  ou: '王', gyoku: '玉', kin: '金', gin: '銀', kei: '桂', kyo: '香', kaku: '角', hisha: '飛', fu: '歩'
};

const initialBoard = [
  ['L', 'N', 'S', 'G', 'K', 'G', 'S', 'N', 'L'],
  [null, 'R', null, null, null, null, null, 'B', null],
  ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
  [null, 'b', null, null, null, null, null, 'r', null],
  ['l', 'n', 's', 'g', 'k', 'g', 's', 'n', 'l']
];

const ShogiGame = () => {
  const [board, setBoard] = useState([]);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState('lower');

  useEffect(() => {
    setBoard(initialBoard);
  }, []);

  const handleCellClick = (row, col) => {
    if (selectedPiece) {
      movePiece(row, col);
    } else {
      selectPiece(row, col);
    }
  };

  const selectPiece = (row, col) => {
    const piece = board[row][col];
    if (piece && isCurrentPlayerPiece(piece)) {
      setSelectedPiece({ row, col, piece });
    }
  };

  const movePiece = (row, col) => {
    if (isValidMove(row, col)) {
      const newBoard = board.map(r => [...r]);
      newBoard[row][col] = selectedPiece.piece;
      newBoard[selectedPiece.row][selectedPiece.col] = null;
      setBoard(newBoard);
      setSelectedPiece(null);
      setCurrentPlayer(currentPlayer === 'lower' ? 'upper' : 'lower');
    } else {
      setSelectedPiece(null);
    }
  };

  const isCurrentPlayerPiece = (piece) => {
    return currentPlayer === 'lower' ? piece.toLowerCase() === piece : piece.toUpperCase() === piece;
  };

  const isValidMove = (row, col) => {
    // This is a simplified check. In a real game, you'd need to implement the specific movement rules for each piece.
    return board[row][col] === null || !isCurrentPlayerPiece(board[row][col]);
  };

  const renderPiece = (piece) => {
    if (!piece) return null;
    const pieceName = PIECES[piece.toLowerCase()] || piece;
    return <span className={`text-2xl ${piece.toLowerCase() === piece ? 'text-black' : 'text-red-500'}`}>{pieceName}</span>;
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">Shogi Game</h1>
      <div className="grid grid-cols-9 gap-0">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`w-16 h-16 border border-black flex items-center justify-center cursor-pointer ${
                selectedPiece && selectedPiece.row === rowIndex && selectedPiece.col === colIndex
                  ? 'bg-yellow-200'
                  : 'bg-yellow-100'
              }`}
              onClick={() => handleCellClick(rowIndex, colIndex)}
            >
              {renderPiece(cell)}
            </div>
          ))
        )}
      </div>
      <p className="mt-4">Current player: {currentPlayer}</p>
    </div>
  );
};

export default ShogiGame;
