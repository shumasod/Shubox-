import React, { useState, useEffect, useCallback } from 'react';

const GiraffeGame = () => {
  const [score, setScore] = useState(0);
  const [giraffePosition, setGiraffePosition] = useState({ x: 50, y: 50 });
  const [leafPosition, setLeafPosition] = useState({ x: 200, y: 200 });
  const [isGameOver, setIsGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  
  // ゲームエリアの制限を定数として定義
  const GAME_AREA = {
    width: 400,
    height: 384, // h-96 = 24rem = 384px
  };
  
  const GIRAFFE_SIZE = 48; // w-12 = 3rem = 48px
  const COLLISION_DISTANCE = 40; // より正確な衝突判定の距離

  // 新しい葉っぱの位置を生成する関数
  const generateNewLeaf = useCallback(() => {
    // 画面の端に葉っぱが生成されないように調整
    setLeafPosition({
      x: Math.floor(Math.random() * (GAME_AREA.width - 40) + 20),
      y: Math.floor(Math.random() * (GAME_AREA.height - 40) + 20)
    });
  }, []);

  // 衝突判定をチェックする関数
  const checkCollision = useCallback((giraffePos) => {
    const distance = Math.sqrt(
      Math.pow(giraffePos.x - leafPosition.x, 2) + 
      Math.pow(giraffePos.y - leafPosition.y, 2)
    );

    if (distance < COLLISION_DISTANCE) {
      setScore(prev => prev + 1);
      generateNewLeaf();
    }
  }, [leafPosition, generateNewLeaf]);

  // キー入力でキリンを動かす
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (isGameOver) return;

      const speed = 20;
      const newPosition = { ...giraffePosition };

      switch (e.key) {
        case 'ArrowUp':
          newPosition.y = Math.max(0, giraffePosition.y - speed);
          break;
        case 'ArrowDown':
          newPosition.y = Math.min(GAME_AREA.height - GIRAFFE_SIZE, giraffePosition.y + speed);
          break;
        case 'ArrowLeft':
          newPosition.x = Math.max(0, giraffePosition.x - speed);
          break;
        case 'ArrowRight':
          newPosition.x = Math.min(GAME_AREA.width - GIRAFFE_SIZE, giraffePosition.x + speed);
          break;
        default:
          return;
      }

      setGiraffePosition(newPosition);
      checkCollision(newPosition);
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [giraffePosition, isGameOver, checkCollision]);

  // タイマー
  useEffect(() => {
    if (timeLeft > 0 && !isGameOver) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !isGameOver) {
      setIsGameOver(true);
    }
  }, [timeLeft, isGameOver]);

  // ゲームのリスタート
  const restartGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGiraffePosition({ x: 50, y: 50 });
    generateNewLeaf();
    setIsGameOver(false);
  };

  // ゲーム開始時に最初の葉っぱを生成
  useEffect(() => {
    generateNewLeaf();
  }, [generateNewLeaf]);

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold mb-2">キリンの葉っぱ集め</h1>
        <div className="flex justify-between mb-4">
          <p className="text-lg">スコア: {score}</p>
          <p className="text-lg">残り時間: {timeLeft}秒</p>
        </div>
      </div>

      <div 
        className="relative w-full h-96 bg-green-100 rounded-lg border-2 border-green-500 overflow-hidden"
        aria-label="ゲームエリア"
      >
        {/* キリン */}
        <div
          className="absolute w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center"
          style={{
            left: `${giraffePosition.x}px`,
            top: `${giraffePosition.y}px`,
            transition: 'all 0.1s'
          }}
          aria-label="キリン"
        >
          🦒
        </div>

        {/* 葉っぱ */}
        <div
          className="absolute w-8 h-8 flex items-center justify-center"
          style={{
            left: `${leafPosition.x}px`,
            top: `${leafPosition.y}px`
          }}
          aria-label="葉っぱ"
        >
          🌿
        </div>
      </div>

      {isGameOver && (
        <div className="text-center mt-4">
          <h2 className="text-xl font-bold mb-2">ゲームオーバー!</h2>
          <p className="mb-4">最終スコア: {score}</p>
          <button
            onClick={restartGame}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
            aria-label="もう一度遊ぶ"
          >
            もう一度遊ぶ
          </button>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        <p>使い方:</p>
        <ul className="list-disc pl-5">
          <li>矢印キーでキリンを動かします</li>
          <li>葉っぱを集めてスコアを獲得します</li>
          <li>制限時間は30秒です</li>
        </ul>
      </div>
    </div>
  );
};

export default GiraffeGame;
