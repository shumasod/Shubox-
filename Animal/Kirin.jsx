import React, { useState, useEffect, useCallback } from 'react';
import { Star, RotateCcw, Play, Pause } from 'lucide-react';

const GiraffeGame = () => {
  // ゲーム状態の管理
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [giraffePosition, setGiraffePosition] = useState({ x: 50, y: 50 });
  const [leafPosition, setLeafPosition] = useState({ x: 200, y: 200 });
  const [isGameOver, setIsGameOver] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [showScoreAnimation, setShowScoreAnimation] = useState(false);
  const [leafCollectedAnimation, setLeafCollectedAnimation] = useState(false);
  
  // ゲーム設定定数
  const GAME_CONFIG = {
    AREA: { width: 400, height: 384 },
    GIRAFFE_SIZE: 48,
    LEAF_SIZE: 32,
    COLLISION_DISTANCE: 35,
    MOVEMENT_SPEED: 15,
    GAME_DURATION: 30
  };

  // スコアアニメーション効果
  const triggerScoreAnimation = useCallback(() => {
    setShowScoreAnimation(true);
    setLeafCollectedAnimation(true);
    setTimeout(() => setShowScoreAnimation(false), 600);
    setTimeout(() => setLeafCollectedAnimation(false), 400);
  }, []);

  // 新しい葉っぱの位置を生成
  const generateNewLeaf = useCallback(() => {
    const margin = 20;
    setLeafPosition({
      x: Math.floor(Math.random() * (GAME_CONFIG.AREA.width - GAME_CONFIG.LEAF_SIZE - margin * 2) + margin),
      y: Math.floor(Math.random() * (GAME_CONFIG.AREA.height - GAME_CONFIG.LEAF_SIZE - margin * 2) + margin)
    });
  }, []);

  // 衝突判定
  const checkCollision = useCallback((giraffePos) => {
    const distance = Math.sqrt(
      Math.pow(giraffePos.x + GAME_CONFIG.GIRAFFE_SIZE / 2 - leafPosition.x - GAME_CONFIG.LEAF_SIZE / 2, 2) + 
      Math.pow(giraffePos.y + GAME_CONFIG.GIRAFFE_SIZE / 2 - leafPosition.y - GAME_CONFIG.LEAF_SIZE / 2, 2)
    );

    if (distance < GAME_CONFIG.COLLISION_DISTANCE) {
      setScore(prev => {
        const newScore = prev + 1;
        if (newScore > bestScore) {
          setBestScore(newScore);
        }
        return newScore;
      });
      triggerScoreAnimation();
      generateNewLeaf();
    }
  }, [leafPosition, bestScore, triggerScoreAnimation, generateNewLeaf]);

  // キー入力処理
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isGameStarted || isGameOver || isPaused) return;

      const newPosition = { ...giraffePosition };
      const { MOVEMENT_SPEED, AREA, GIRAFFE_SIZE } = GAME_CONFIG;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          newPosition.y = Math.max(0, giraffePosition.y - MOVEMENT_SPEED);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          newPosition.y = Math.min(AREA.height - GIRAFFE_SIZE, giraffePosition.y + MOVEMENT_SPEED);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          newPosition.x = Math.max(0, giraffePosition.x - MOVEMENT_SPEED);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          newPosition.x = Math.min(AREA.width - GIRAFFE_SIZE, giraffePosition.x + MOVEMENT_SPEED);
          break;
        case ' ':
          e.preventDefault();
          setIsPaused(!isPaused);
          return;
        default:
          return;
      }

      setGiraffePosition(newPosition);
      checkCollision(newPosition);
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [giraffePosition, isGameStarted, isGameOver, isPaused, checkCollision]);

  // タイマー処理
  useEffect(() => {
    if (timeLeft > 0 && isGameStarted && !isGameOver && !isPaused) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !isGameOver) {
      setIsGameOver(true);
    }
  }, [timeLeft, isGameStarted, isGameOver, isPaused]);

  // ゲーム開始
  const startGame = () => {
    setIsGameStarted(true);
    setIsGameOver(false);
    setIsPaused(false);
    setScore(0);
    setTimeLeft(GAME_CONFIG.GAME_DURATION);
    setGiraffePosition({ x: 50, y: 50 });
    generateNewLeaf();
  };

  // ゲーム一時停止/再開
  const togglePause = () => {
    if (isGameStarted && !isGameOver) {
      setIsPaused(!isPaused);
    }
  };

  // 初期化
  useEffect(() => {
    generateNewLeaf();
  }, [generateNewLeaf]);

  return (
    <div className="flex flex-col items-center p-6 max-w-2xl mx-auto bg-gradient-to-br from-green-50 to-yellow-50 rounded-2xl shadow-lg">
      {/* ヘッダー */}
      <div className="text-center mb-6 w-full">
        <h1 className="text-4xl font-bold text-green-800 mb-2 flex items-center justify-center gap-2">
          🦒 キリンの葉っぱ集め 🌿
        </h1>
        <p className="text-green-600 text-sm">矢印キーまたはWASDでキリンを操作して葉っぱを集めよう！</p>
      </div>

      {/* スコアボード */}
      <div className="flex justify-between items-center w-full max-w-md mb-6 bg-white rounded-xl p-4 shadow-md">
        <div className="text-center">
          <p className="text-sm text-gray-600">現在のスコア</p>
          <p className={`text-2xl font-bold text-green-700 transition-all duration-300 ${
            showScoreAnimation ? 'scale-125 text-yellow-500' : ''
          }`}>
            {score}
          </p>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-600">残り時間</p>
          <p className={`text-2xl font-bold ${
            timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-blue-700'
          }`}>
            {timeLeft}秒
          </p>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-600 flex items-center gap-1">
            <Star size={14} className="text-yellow-500" />
            ベストスコア
          </p>
          <p className="text-2xl font-bold text-yellow-600">{bestScore}</p>
        </div>
      </div>

      {/* コントロールボタン */}
      <div className="flex gap-3 mb-6">
        {!isGameStarted || isGameOver ? (
          <button
            onClick={startGame}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <Play size={20} />
            {isGameOver ? 'もう一度プレイ' : 'ゲーム開始'}
          </button>
        ) : (
          <button
            onClick={togglePause}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            {isPaused ? <Play size={20} /> : <Pause size={20} />}
            {isPaused ? '再開' : '一時停止'}
          </button>
        )}
        
        <button
          onClick={startGame}
          className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          <RotateCcw size={20} />
          リスタート
        </button>
      </div>

      {/* ゲームエリア */}
      <div className="relative">
        <div 
          className={`relative bg-gradient-to-br from-green-200 to-green-300 rounded-2xl border-4 border-green-400 overflow-hidden shadow-inner ${
            !isGameStarted ? 'opacity-70' : ''
          } ${isPaused ? 'opacity-50' : ''}`}
          style={{
            width: `${GAME_CONFIG.AREA.width}px`,
            height: `${GAME_CONFIG.AREA.height}px`
          }}
          aria-label="ゲームエリア"
        >
          {/* 背景パターン */}
          <div className="absolute inset-0 opacity-20">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-6 h-6 text-green-600"
                style={{
                  left: `${(i % 4) * 100 + 50}px`,
                  top: `${Math.floor(i / 4) * 150 + 75}px`
                }}
              >
                🌱
              </div>
            ))}
          </div>

          {/* キリン */}
          <div
            className={`absolute rounded-full bg-gradient-to-br from-yellow-200 to-yellow-300 border-2 border-yellow-400 flex items-center justify-center shadow-lg transition-all duration-150 transform ${
              isGameStarted && !isPaused ? 'hover:scale-110' : ''
            }`}
            style={{
              width: `${GAME_CONFIG.GIRAFFE_SIZE}px`,
              height: `${GAME_CONFIG.GIRAFFE_SIZE}px`,
              left: `${giraffePosition.x}px`,
              top: `${giraffePosition.y}px`,
            }}
            aria-label="キリン"
          >
            <span className="text-2xl">🦒</span>
          </div>

          {/* 葉っぱ */}
          <div
            className={`absolute rounded-full bg-gradient-to-br from-green-300 to-green-400 border-2 border-green-500 flex items-center justify-center shadow-lg transition-all duration-300 ${
              leafCollectedAnimation ? 'scale-150 opacity-0' : 'animate-pulse'
            }`}
            style={{
              width: `${GAME_CONFIG.LEAF_SIZE}px`,
              height: `${GAME_CONFIG.LEAF_SIZE}px`,
              left: `${leafPosition.x}px`,
              top: `${leafPosition.y}px`,
            }}
            aria-label="葉っぱ"
          >
            <span className="text-xl">🌿</span>
          </div>

          {/* 一時停止オーバーレイ */}
          {isPaused && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-2xl">
              <div className="text-white text-center">
                <Pause size={48} className="mx-auto mb-2" />
                <p className="text-xl font-bold">一時停止中</p>
                <p className="text-sm">スペースキーまたはボタンで再開</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ゲームオーバー画面 */}
      {isGameOver && (
        <div className="mt-6 text-center bg-white rounded-2xl p-6 shadow-lg border-2 border-red-200">
          <h2 className="text-3xl font-bold mb-4 text-red-600">🎮 ゲームオーバー！</h2>
          <div className="space-y-2 mb-4">
            <p className="text-xl">最終スコア: <span className="font-bold text-green-600">{score}</span></p>
            {score === bestScore && score > 0 && (
              <p className="text-yellow-600 font-semibold animate-bounce">🎉 新記録達成！</p>
            )}
            <p className="text-gray-600">
              {score >= 15 ? '素晴らしい！キリンマスター🦒' : 
               score >= 10 ? 'とても上手です！🌟' : 
               score >= 5 ? 'いい調子です！🌿' : 
               'がんばりましょう！💪'}
            </p>
          </div>
        </div>
      )}

      {/* 操作説明 */}
      <div className="mt-6 bg-white rounded-xl p-4 shadow-md w-full max-w-md">
        <h3 className="font-semibold text-gray-700 mb-2">🎮 操作方法</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p>• <kbd className="px-2 py-1 bg-gray-200 rounded">矢印キー</kbd> または <kbd className="px-2 py-1 bg-gray-200 rounded">WASD</kbd>: キリンを移動</p>
          <p>• <kbd className="px-2 py-1 bg-gray-200 rounded">スペース</kbd>: 一時停止/再開</p>
          <p>• 葉っぱを集めてスコアアップ！</p>
          <p>• 制限時間: {GAME_CONFIG.GAME_DURATION}秒</p>
        </div>
      </div>
    </div>
  );
};

export default GiraffeGame;
