import React, { useState, useEffect } from 'react';

const BOARD_SIZE = 9;
const PIECES = {
  ou: '玉', gyoku: '玉', kin: '金', gin: '銀', kei: '桂', kyo: '香', kaku: '角', hisha: '飛', fu: '歩'
};

const initialBoard = [
  ['香', '桂', '銀', '金', '玉', '金', '銀', '桂', '香'],
  [null, '飛', null, null, null, null, null, '角', null],
  ['歩', '歩', '歩', '歩', '歩', '歩', '歩', '歩', '歩'],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  ['歩', '歩', '歩', '歩', '歩', '歩', '歩', '歩', '歩'],
  [null, '角', null, null, null, null, null, '飛', null],
  ['香', '桂', '銀', '金', '玉', '金', '銀', '桂', '香']
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
    if (piece && isCurrentPlayerPiece(piece, row)) {
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

  const isCurrentPlayerPiece = (piece, row) => {
    return currentPlayer === 'lower' ? row >= BOARD_SIZE / 2 : row < BOARD_SIZE / 2;
  };

  const isValidMove = (row, col) => {
    // This is a simplified check. In a real game, you'd need to implement the specific movement rules for each piece.
    return board[row][col] === null || !isCurrentPlayerPiece(board[row][col], row);
  };

  const renderPiece = (piece, row) => {
    if (!piece) return null;
    const isLowerPlayer = row >= BOARD_SIZE / 2;
    return (
      <div className={`w-full h-full flex items-center justify-center 
                      ${isLowerPlayer ? '' : 'rotate-180'}`}>
        <span className="text-2xl font-bold" style={{color: '#5D4037'}}>{piece}</span>
      </div>
    );
  };

  const renderCoordinate = (index, isVertical) => {
    const coords = isVertical ? '一二三四五六七八九' : '９８７６５４３２１';
    return (
      <div className={`absolute ${isVertical ? '-left-6' : '-top-6'} w-6 h-6 flex items-center justify-center`}>
        <span className="text-sm" style={{color: '#5D4037'}}>{coords[index]}</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center p-8" style={{backgroundColor: '#FFF3E0'}}>
      <h1 className="text-3xl font-bold mb-8" style={{color: '#5D4037'}}>将棋</h1>
      <div className="relative">
        <div className="grid grid-cols-9 gap-0" style={{width: '540px', height: '540px'}}>
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`w-16 h-16 border border-gray-700 flex items-center justify-center cursor-pointer relative
                           ${selectedPiece && selectedPiece.row === rowIndex && selectedPiece.col === colIndex
                             ? 'bg-yellow-200'
                             : 'bg-amber-100'}`}
                style={{backgroundColor: '#FFE0B2', boxShadow: 'inset 0 0 3px rgba(0,0,0,0.2)'}}
                onClick={() => handleCellClick(rowIndex, colIndex)}
              >
                {renderPiece(cell, rowIndex)}
                {colIndex === 0 && renderCoordinate(rowIndex, true)}
                {rowIndex === 0 && renderCoordinate(colIndex, false)}
              </div>
            ))
          )}
        </div>
      </div>
      <p className="mt-4 text-lg" style={{color: '#5D4037'}}>手番: {currentPlayer === 'lower' ? '先手' : '後手'}</p>
    </div>
  );
};

export default ShogiGame;
