import React, { useState, useCallback } from 'react';

const ShogiGame = () => {
  // 駒の定義
  const pieces = {
    'K': '王', 'G': '金', 'S': '銀', 'N': '桂', 'L': '香',
    'B': '角', 'R': '飛', 'P': '歩',
    '+S': '成銀', '+N': '成桂', '+L': '成香', '+B': '馬', '+R': '龍', '+P': 'と'
  };

  // 初期盤面の設定
  const createInitialBoard = () => {
    const board = Array(9).fill(null).map(() => Array(9).fill(null));
    
    // 後手（上側）の駒配置
    board[0] = ['gote_L', 'gote_N', 'gote_S', 'gote_G', 'gote_K', 'gote_G', 'gote_S', 'gote_N', 'gote_L'];
    board[1] = [null, 'gote_B', null, null, null, null, null, 'gote_R', null];
    board[2] = Array(9).fill('gote_P');
    
    // 先手（下側）の駒配置
    board[6] = Array(9).fill('sente_P');
    board[7] = [null, 'sente_R', null, null, null, null, null, 'sente_B', null];
    board[8] = ['sente_L', 'sente_N', 'sente_S', 'sente_G', 'sente_K', 'sente_G', 'sente_S', 'sente_N', 'sente_L'];
    
    return board;
  };

  // ゲーム状態
  const [board, setBoard] = useState(createInitialBoard);
  const [currentPlayer, setCurrentPlayer] = useState('sente');
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [capturedPieces, setCapturedPieces] = useState({
    sente: {},
    gote: {}
  });
  const [gameHistory, setGameHistory] = useState([]);
  const [message, setMessage] = useState('ゲーム開始！先手番です。');

  // 駒が有効な移動先かチェック
  const isValidMove = useCallback((fromRow, fromCol, toRow, toCol) => {
    // 範囲チェック
    if (toRow < 0 || toRow >= 9 || toCol < 0 || toCol >= 9) return false;
    
    const piece = board[fromRow][fromCol];
    if (!piece) return false;
    
    const [player] = piece.split('_');
    if (player !== currentPlayer) return false;
    
    const targetPiece = board[toRow][toCol];
    if (targetPiece) {
      const [targetPlayer] = targetPiece.split('_');
      if (targetPlayer === currentPlayer) return false;
    }
    
    return true;
  }, [board, currentPlayer]);

  // 駒を移動する
  const movePiece = useCallback((fromRow, fromCol, toRow, toCol) => {
    if (!isValidMove(fromRow, fromCol, toRow, toCol)) {
      setMessage('無効な移動です！');
      return false;
    }

    const newBoard = board.map(row => [...row]);
    const piece = newBoard[fromRow][fromCol];
    const targetPiece = newBoard[toRow][toCol];
    
    // 駒取りの処理
    if (targetPiece) {
      let [, pieceType] = targetPiece.split('_');
      // 成駒は元の駒に戻す
      if (pieceType.startsWith('+')) {
        pieceType = pieceType.substring(1);
      }
      
      setCapturedPieces(prev => ({
        ...prev,
        [currentPlayer]: {
          ...prev[currentPlayer],
          [pieceType]: (prev[currentPlayer][pieceType] || 0) + 1
        }
      }));
    }

    // 駒を移動
    newBoard[toRow][toCol] = piece;
    newBoard[fromRow][fromCol] = null;
    
    setBoard(newBoard);
    
    // 履歴に追加
    const moveNotation = `${9-fromCol}${fromRow+1}${9-toCol}${toRow+1}`;
    setGameHistory(prev => [...prev, {
      player: currentPlayer,
      move: moveNotation,
      piece: piece.split('_')[1],
      captured: targetPiece ? targetPiece.split('_')[1] : null
    }]);
    
    // 手番交代
    const nextPlayer = currentPlayer === 'sente' ? 'gote' : 'sente';
    setCurrentPlayer(nextPlayer);
    setMessage(`${nextPlayer === 'sente' ? '先手' : '後手'}番です。`);
    
    return true;
  }, [board, currentPlayer, isValidMove]);

  // マス目クリック処理
  const handleSquareClick = (row, col) => {
    if (selectedSquare) {
      const [fromRow, fromCol] = selectedSquare;
      if (fromRow === row && fromCol === col) {
        // 同じマス目をクリック（選択解除）
        setSelectedSquare(null);
        setMessage(`${currentPlayer === 'sente' ? '先手' : '後手'}番です。`);
      } else {
        // 移動実行
        if (movePiece(fromRow, fromCol, row, col)) {
          setSelectedSquare(null);
        }
      }
    } else {
      // 駒を選択
      const piece = board[row][col];
      if (piece && piece.startsWith(currentPlayer)) {
        setSelectedSquare([row, col]);
        setMessage(`${pieces[piece.split('_')[1]]}を選択しました。移動先をクリックしてください。`);
      } else if (piece) {
        setMessage('自分の駒を選択してください。');
      } else {
        setMessage('駒がありません。');
      }
    }
  };

  // ゲームリセット
  const resetGame = () => {
    setBoard(createInitialBoard());
    setCurrentPlayer('sente');
    setSelectedSquare(null);
    setCapturedPieces({ sente: {}, gote: {} });
    setGameHistory([]);
    setMessage('ゲーム開始！先手番です。');
  };

  // 持ち駒表示
  const renderCapturedPieces = (player) => {
    const captured = capturedPieces[player];
    const pieceOrder = ['K', 'G', 'S', 'N', 'L', 'B', 'R', 'P'];
    
    return (
      <div className="captured-pieces">
        <h3 className="text-sm font-bold mb-2">
          {player === 'sente' ? '先手持ち駒' : '後手持ち駒'}
        </h3>
        <div className="flex flex-wrap gap-1">
          {pieceOrder.map(pieceType => {
            const count = captured[pieceType] || 0;
            if (count === 0) return null;
            return (
              <div key={pieceType} className="bg-gray-100 px-2 py-1 rounded text-xs">
                {pieces[pieceType]} × {count}
              </div>
            );
          })}
          {Object.keys(captured).length === 0 && (
            <div className="text-gray-500 text-xs">なし</div>
          )}
        </div>
      </div>
    );
  };

  // 履歴表示
  const renderHistory = () => (
    <div className="game-history mt-4">
      <h3 className="text-sm font-bold mb-2">対局履歴</h3>
      <div className="max-h-40 overflow-y-auto bg-gray-50 p-2 rounded">
        {gameHistory.length === 0 ? (
          <div className="text-gray-500 text-xs">まだ指し手がありません</div>
        ) : (
          gameHistory.map((move, index) => (
            <div key={index} className="text-xs mb-1">
              {index + 1}. {move.player === 'sente' ? '先手' : '後手'}: 
              {pieces[move.piece]} {move.move}
              {move.captured && ` (${pieces[move.captured]}取り)`}
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">将棋</h1>
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <div className="text-lg font-semibold text-gray-700">{message}</div>
            <div className="text-sm text-gray-500 mt-1">
              現在の手番: {currentPlayer === 'sente' ? '先手' : '後手'}
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 justify-center">
          {/* 左サイドバー */}
          <div className="lg:w-64">
            {renderCapturedPieces('gote')}
            <div className="mt-6">
              <button
                onClick={resetGame}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                新しいゲーム
              </button>
            </div>
            {renderHistory()}
          </div>

          {/* 将棋盤 */}
          <div className="flex-1 flex justify-center">
            <div className="inline-block bg-yellow-800 p-4 rounded-lg shadow-2xl">
              {/* 列番号（上） */}
              <div className="flex justify-center mb-2">
                <div className="w-8"></div>
                {Array.from({length: 9}, (_, i) => (
                  <div key={i} className="w-12 h-6 flex items-center justify-center text-sm font-bold text-yellow-100">
                    {9 - i}
                  </div>
                ))}
              </div>

              {/* 盤面 */}
              {board.map((row, rowIndex) => (
                <div key={rowIndex} className="flex">
                  {/* 行番号（左） */}
                  <div className="w-8 h-12 flex items-center justify-center text-sm font-bold text-yellow-100">
                    {rowIndex + 1}
                  </div>
                  
                  {row.map((square, colIndex) => {
                    const isSelected = selectedSquare && 
                                     selectedSquare[0] === rowIndex && 
                                     selectedSquare[1] === colIndex;
                    
                    return (
                      <div
                        key={colIndex}
                        className={`
                          w-12 h-12 border border-yellow-900 cursor-pointer 
                          flex items-center justify-center text-lg font-bold
                          transition-all duration-200 hover:bg-yellow-200
                          ${isSelected ? 'bg-blue-300 shadow-lg' : 'bg-yellow-100'}
                          ${square ? 'hover:bg-yellow-300' : ''}
                        `}
                        onClick={() => handleSquareClick(rowIndex, colIndex)}
                      >
                        {square && (
                          <span 
                            className={`
                              select-none transition-transform hover:scale-110
                              ${square.startsWith('sente') ? 'text-blue-700' : 'text-red-700'}
                              ${isSelected ? 'scale-110' : ''}
                            `}
                          >
                            {pieces[square.split('_')[1]]}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* 右サイドバー */}
          <div className="lg:w-64">
            {renderCapturedPieces('sente')}
            
            <div className="mt-6 bg-white rounded-lg shadow-md p-4">
              <h3 className="text-sm font-bold mb-2">操作方法</h3>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• 自分の駒をクリックして選択</li>
                <li>• 移動先をクリックして移動</li>
                <li>• 選択した駒をもう一度クリックで選択解除</li>
                <li>• 青色：先手の駒</li>
                <li>• 赤色：後手の駒</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShogiGame;
