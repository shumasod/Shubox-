import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Star, RotateCcw, Play, Pause } from 'lucide-react';

interface Position {
  x: number;
  y: number;
}

const GAME_CONFIG = {
  AREA: { width: 400, height: 384 },
  GIRAFFE_SIZE: 48,
  LEAF_SIZE: 32,
  COLLISION_DISTANCE: 40,
  MOVEMENT_SPEED: 18,
  GAME_DURATION: 30,
} as const;

const GiraffeGame = () => {
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    const saved = localStorage.getItem('giraffeBestScore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [giraffePos, setGiraffePos] = useState<Position>({ x: 50, y: 50 });
  const [leafPos, setLeafPos] = useState<Position | null>(null);
  const [leafId, setLeafId] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(GAME_CONFIG.GAME_DURATION);
  const [showScoreAnim, setShowScoreAnim] = useState(false);
  const startTimeRef = useRef<number>(0);

  // ベストスコア保存
  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem('giraffeBestScore', score.toString());
    }
  }, [score, bestScore]);

  // 正確なタイマー（ドリフトなし）
  useEffect(() => {
    if (!isStarted || isPaused || isGameOver) return;

    startTimeRef.current = Date.now() - (GAME_CONFIG.GAME_DURATION - timeLeft) * 1000;

    const tick = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const remaining = Math.max(0, GAME_CONFIG.GAME_DURATION - elapsed);
      setTimeLeft(Math.ceil(remaining));

      if (remaining > 0) {
        requestAnimationFrame(tick);
      } else {
        setIsGameOver(true);
      }
    };

    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [isStarted, isPaused, isGameOver]);

  // 葉っぱ生成
  const generateLeaf = useCallback(() => {
    const margin = 40;
    const x = Math.random() * (GAME_CONFIG.AREA.width - GAME_CONFIG.LEAF_SIZE - margin * 2) + margin;
    const y = Math.random() * (GAME_CONFIG.AREA.height - GAME_CONFIG.LEAF_SIZE - margin * 2) + margin;
    setLeafPos({ x, y });
    setLeafId(prev => prev + 1);
  }, []);

  // 衝突判定（安定化したuseCallback）
  const checkCollision = useCallback((pos: Position) => {
    if (!leafPos) return;

    const dx = pos.x + GAME_CONFIG.GIRAFFE_SIZE / 2 - (leafPos.x + GAME_CONFIG.LEAF_SIZE / 2);
    const dy = pos.y + GAME_CONFIG.GIRAFFE_SIZE / 2 - (leafPos.y + GAME_CONFIG.LEAF_SIZE / 2);
    const distance = Math.hypot(dx, dy);

    if (distance < GAME_CONFIG.COLLISION_DISTANCE) {
      setScore(s => s + 1);
      setShowScoreAnim(true);
      setTimeout(() => setShowScoreAnim(false), 600);
      generateLeaf();
    }
  }, [leafPos, generateLeaf]);

  // キーボード操作（依存配列完全安定化）
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isStarted || isGameOver || isPaused) return;
      if (e.key === ' ') {
        e.preventDefault();
        setIsPaused(p => !p);
        return;
      }

      const move = { ...giraffePos };
      const speed = GAME_CONFIG.MOVEMENT_SPEED;

      switch (e.key) {
        case 'ArrowUp': case 'w': case 'W':
          move.y = Math.max(0, move.y - speed); break;
        case 'ArrowDown': case 's': case 'S':
          move.y = Math.min(GAME_CONFIG.AREA.height - GAME_CONFIG.GIRAFFE_SIZE, move.y + speed); break;
        case 'ArrowLeft': case 'a': case 'A':
          move.x = Math.max(0, move.x - speed); break;
        case 'ArrowRight': case 'd': case 'D':
          move.x = Math.min(GAME_CONFIG.AREA.width - GAME_CONFIG.GIRAFFE_SIZE, move.x + speed); break;
        default: return;
      }

      setGiraffePos(move);
      checkCollision(move);
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [giraffePos, isStarted, isGameOver, isPaused, checkCollision]);

  const startGame = () => {
    setIsStarted(true);
    setIsGameOver(false);
    setIsPaused(false);
    setScore(0);
    setTimeLeft(GAME_CONFIG.GAME_DURATION);
    setGiraffePos({ x: 100, y: 160 });
    generateLeaf();
  };

  return (
    <div className="flex flex-col items-center p-8 max-w-2xl mx-auto bg-gradient-to-br from-green-50 via-yellow-50 to-orange-50 rounded-3xl shadow-2xl">
      <header className="text-center mb-8">
        <h1 className="text-5xl font-bold text-green-800 mb-3 flex items-center justify-center gap-3">
          キリンの葉っぱ大冒険
        </h1>
        <p className="text-green-700 text-lg">矢印キー or WASD でキリンを動かして、葉っぱをたくさん集めよう！</p>
      </header>

      {/* スコアボード */}
      <div className="grid grid-cols-3 gap-6 w-full mb-8 bg-white/80 backdrop-blur rounded-2xl p-6 shadow-xl">
        <div className="text-center">
          <p className="text-gray-600 text-sm">現在のスコア</p>
          <p className={`text-4xl font-bold transition-all duration-300 ${showScoreAnim ? 'scale-150 text-yellow-500' : 'text-green-700'}`}>
            {score}
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-600 text-sm">残り時間</p>
          <p className={`text-4xl font-bold ${timeLeft <= 10 ? 'text-red-600 animate-pulse' : 'text-blue-700'}`}>
            {timeLeft}s
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-600 text-sm flex items-center justify-center gap-1">
            <Star className="text-yellow-500" /> ベスト
          </p>
          <p className="text-4xl font-bold text-purple-700">{bestScore}</p>
        </div>
      </div>

      {/* コントロール */}
      <div className="flex gap-4 mb-8">
        {!isStarted || isGameOver ? (
          <button onClick={startGame} className="btn-primary">
            <Play size={24} /> ゲームスタート
          </button>
        ) : (
          <button onClick={() => setIsPaused(p => !p)} className="btn-blue">
            {isPaused ? <Play size={24} /> : <Pause size={24} />}
            {isPaused ? '再開' : '一時停止'}
          </button>
        )}
        <button onClick={startGame} className="btn-gray">
          <RotateCcw size={24} /> リスタート
        </button>
      </div>

      {/* ゲームエリア */}
      <div className="relative">
        <div
          className={`relative bg-gradient-to-br from-sky-200 to-green-300 rounded-3xl border-8 border-green-600 shadow-2xl overflow-hidden transition-opacity ${
            !isStarted ? 'opacity-60' : isPaused ? 'opacity-50' : ''
          }`}
          style={{ width: GAME_CONFIG.AREA.width, height: GAME_CONFIG.AREA.height }}
        >
          {/* 背景草 */}
          <div className="absolute inset-0 opacity-30">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="absolute text-3xl" style={{
                left: `${(i % 5) * 80 + 30}px`,
                top: `${Math.floor(i / 5) * 120 + 60}px`,
              }}>🌱</div>
            ))}
          </div>

          {/* キリン */}
          <div
            className="absolute transition-all duration-150 ease-out"
            style={{
              left: giraffePos.x,
              top: giraffePos.y,
              width: GAME_CONFIG.GIRAFFE_SIZE,
              height: GAME_CONFIG.GIRAFFE_SIZE,
            }}
          >
            <div className="text-6xl drop-shadow-lg">Giraffe</div>
          </div>

          {/* 葉っぱ */}
          {leafPos && (
            <div
              key={leafId}
              className="absolute animate-spin-slow"
              style={{
                left: leafPos.x,
                top: leafPos.y,
                width: GAME_CONFIG.LEAF_SIZE,
                height: GAME_CONFIG.LEAF_SIZE,
              }}
            >
              <div className="text-4xl drop-shadow-md">Leaf</div>
            </div>
          )}

          {/* 一時停止オーバーレイ */}
          {isPaused && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-3xl">
              <div className="text-white text-center">
                <Pause size={80} className="mx-auto mb-4" />
                <p className="text-3xl font-bold">一時停止中</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ゲームオーバー */}
      {isGameOver && (
        <div className="mt-8 text-center bg-white rounded-3xl p-10 shadow-2xl border-4 border-red-300">
          <h2 className="text-5xl font-bold text-red-600 mb-6">ゲームオーバー！</h2>
          <p className="text-3xl mb-4">最終スコア: <span className="text-green-600 font-bold">{score}</span></p>
          {score > bestScore && <p className="text-4xl text-yellow-500 font-bold animate-bounce">新記録達成！</p>}
          <p className="text-2xl mt-4">
            {score >= 20 ? 'キリン神！' : score >= 15 ? 'すごすぎ！' : score >= 10 ? '上手！' : '次はもっと！'}
          </p>
        </div>
      )}

      {/* 操作説明 */}
      <div className="mt-8 bg-white/90 backdrop-blur rounded-2xl p-6 shadow-xl w-full">
        <h3 className="font-bold text-xl text-gray-800 mb-3">操作方法</h3>
        <ul className="space-y-2 text-gray-700">
          <li>• 矢印キー or WASD : 移動</li>
          <li>• スペース : 一時停止 / 再開</li>
          <li>• 葉っぱをたくさん集めてハイスコアを狙おう！</li>
        </ul>
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow { animation: spin-slow 4s linear infinite; }
        .btn-primary { @apply bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-2xl shadow-lg transform hover:scale-110 transition-all; }
        .btn-blue { @apply bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-2xl shadow-lg transform hover:scale-110 transition-all; }
        .btn-gray { @apply bg-gray-600 hover:bg-gray-700 text-white font-bold py-4 px-8 rounded-2xl shadow-lg transform hover:scale-110 transition-all; }
      `}</style>
    </div>
  );
};

export default GiraffeGame;
