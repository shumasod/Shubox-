import React, { useState, useCallback, useMemo } from 'react';

// =============================================================================
// 定数定義
// =============================================================================
const PHRASES = [
  "スーを差し上げます！",
  "はい、スーをどうぞ！",
  "こちら、スーでございます！",
  "スー、お受け取りください！",
  "特別なスーを差し上げます！",
  "本日のスーです！",
  "厳選されたスーをどうぞ！"
];

const SPARKLE_EMOJIS = ['✨', '⭐', '💫', '🌟'];
const SPARKLE_COUNT = 12;
const BACKGROUND_GIFT_COUNT = 20;

const PRESENTING_DURATION = 2000;
const ANIMATION_DURATION = 3000;

const STATUS_THRESHOLDS = [
  { min: 20, message: "スー配布の達人！🏆✨" },
  { min: 10, message: "スー配布マスター！🏆" },
  { min: 5, message: "スー愛好家ですね！👏" },
  { min: 1, message: "ありがとうございます！😊" },
  { min: 0, message: "スーをもらってみましょう！" }
];

const MAX_COUNT_FOR_PROGRESS = 20;

// =============================================================================
// ユーティリティ関数
// =============================================================================
const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];

const createSparkleData = () => 
  Array.from({ length: SPARKLE_COUNT }, (_, i) => ({
    id: Date.now() + i,
    x: Math.random() * 100 - 50,
    y: Math.random() * 100 - 50,
    delay: Math.random() * 0.5,
    emoji: getRandomItem(SPARKLE_EMOJIS)
  }));

const getStatusMessage = (count) => {
  const status = STATUS_THRESHOLDS.find(({ min }) => count >= min);
  return status?.message || STATUS_THRESHOLDS[STATUS_THRESHOLDS.length - 1].message;
};

const calculateProgress = (count) => Math.min((count / MAX_COUNT_FOR_PROGRESS) * 100, 100);

// =============================================================================
// カスタムフック
// =============================================================================
const useSuePresenter = () => {
  const [isPresenting, setIsPresenting] = useState(false);
  const [presentCount, setPresentCount] = useState(0);
  const [showAnimation, setShowAnimation] = useState(false);
  const [sparkles, setSparkles] = useState([]);
  const [currentPhrase, setCurrentPhrase] = useState(PHRASES[0]);

  const presentSue = useCallback(() => {
    if (isPresenting) return;

    setIsPresenting(true);
    setShowAnimation(true);
    setPresentCount((prev) => prev + 1);
    setSparkles(createSparkleData());
    setCurrentPhrase(getRandomItem(PHRASES));

    setTimeout(() => setIsPresenting(false), PRESENTING_DURATION);
    setTimeout(() => {
      setShowAnimation(false);
      setSparkles([]);
    }, ANIMATION_DURATION);
  }, [isPresenting]);

  return {
    isPresenting,
    presentCount,
    showAnimation,
    sparkles,
    currentPhrase,
    presentSue
  };
};

// =============================================================================
// サブコンポーネント
// =============================================================================

/** 背景の装飾ギフト */
const BackgroundGifts = () => {
  const gifts = useMemo(() => 
    Array.from({ length: BACKGROUND_GIFT_COUNT }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 5}s`,
      animationDuration: `${10 + Math.random() * 10}s`
    })),
  []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {gifts.map((gift) => (
        <div
          key={gift.id}
          className="absolute text-4xl opacity-20 animate-float"
          style={{
            left: gift.left,
            top: gift.top,
            animationDelay: gift.animationDelay,
            animationDuration: gift.animationDuration
          }}
        >
          🎁
        </div>
      ))}
    </div>
  );
};

/** ヘッダータイトル */
const Header = () => (
  <div className="mb-6">
    <h1 className="text-3xl font-bold text-gray-800 mb-1">津田の</h1>
    <h2 className="text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
      スーを差し上げます
    </h2>
    <div className="h-1 w-32 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto rounded-full" />
  </div>
);

/** スパークルエフェクト */
const SparkleEffect = ({ sparkles }) => (
  <>
    {sparkles.map((sparkle) => (
      <div
        key={sparkle.id}
        className="absolute text-3xl animate-sparkle pointer-events-none"
        style={{
          left: '50%',
          top: '50%',
          transform: `translate(${sparkle.x}px, ${sparkle.y}px)`,
          animationDelay: `${sparkle.delay}s`
        }}
      >
        {sparkle.emoji}
      </div>
    ))}
  </>
);

/** 中央のギフトアニメーション */
const CenterGiftAnimation = () => (
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="absolute animate-ping text-6xl opacity-75">💝</div>
    <div className="absolute animate-bounce text-4xl">✨</div>
  </div>
);

/** メインアイコン表示エリア */
const IconDisplay = ({ isPresenting, showAnimation, sparkles }) => (
  <div className="mb-8 relative h-32 flex items-center justify-center">
    <div
      className={`text-8xl transition-all duration-500 ${
        isPresenting ? 'scale-125 rotate-12' : 'scale-100'
      }`}
    >
      {isPresenting ? '🎁' : '🎭'}
    </div>

    {showAnimation && (
      <>
        <SparkleEffect sparkles={sparkles} />
        <CenterGiftAnimation />
      </>
    )}
  </div>
);

/** フレーズ表示 */
const PhraseDisplay = ({ phrase, isPresenting }) => (
  <div className="mb-8 h-16 flex items-center justify-center">
    <p
      className={`text-2xl font-bold transition-all duration-300 ${
        isPresenting
          ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 scale-110'
          : 'text-gray-700'
      }`}
    >
      {phrase}
    </p>
  </div>
);

/** メインボタン */
const PresentButton = ({ onClick, isPresenting }) => (
  <button
    onClick={onClick}
    disabled={isPresenting}
    className={`w-full py-4 px-8 rounded-full font-bold text-xl transition-all duration-300 transform shadow-lg ${
      isPresenting
        ? 'bg-gray-300 text-gray-500 cursor-not-allowed scale-95'
        : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 hover:scale-105 hover:shadow-2xl active:scale-95'
    }`}
  >
    {isPresenting ? (
      <span className="flex items-center justify-center">
        <span className="animate-spin mr-2">🎁</span>
        スー配布中...
      </span>
    ) : (
      'スーをもらう'
    )}
  </button>
);

/** カウンター表示 */
const Counter = ({ count }) => (
  <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
    <p className="text-sm text-gray-600 mb-1">今までに</p>
    <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
      {count}
    </p>
    <p className="text-sm text-gray-600 mt-1">個のスーを差し上げました</p>
  </div>
);

/** ステータスメッセージ */
const StatusMessage = ({ count }) => {
  if (count === 0) return null;

  return (
    <div className="mt-4 p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border-2 border-purple-200 transform transition-all duration-300 hover:scale-105">
      <p className="text-base font-semibold text-purple-700">
        {getStatusMessage(count)}
      </p>
    </div>
  );
};

/** プログレスバー */
const ProgressBar = ({ count }) => {
  if (count === 0) return null;

  const progress = calculateProgress(count);

  return (
    <div className="mt-4">
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span>次の称号まで</span>
        <span>{Math.min(count, MAX_COUNT_FOR_PROGRESS)}/{MAX_COUNT_FOR_PROGRESS}</span>
      </div>
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

/** フッター */
const Footer = () => (
  <div className="mt-8 text-white text-center opacity-90 max-w-md">
    <p className="text-sm backdrop-blur-sm bg-white/20 p-3 rounded-lg">
      ※このアプリはダイアン津田さんの「スーを差し上げます」ギャグをオマージュしたファンメイドアプリです
    </p>
  </div>
);

/** CSSアニメーション定義 */
const AnimationStyles = () => (
  <style>{`
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
    }

    @keyframes sparkle {
      0% {
        opacity: 0;
        transform: translate(0, 0) scale(0);
      }
      50% {
        opacity: 1;
      }
      100% {
        opacity: 0;
        transform: translate(var(--x), var(--y)) scale(1.5);
      }
    }

    .animate-float {
      animation: float ease-in-out infinite;
    }

    .animate-sparkle {
      animation: sparkle 1s ease-out forwards;
    }
  `}</style>
);

// =============================================================================
// メインコンポーネント
// =============================================================================
const SuePresentApp = () => {
  const {
    isPresenting,
    presentCount,
    showAnimation,
    sparkles,
    currentPhrase,
    presentSue
  } = useSuePresenter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-red-400 flex flex-col items-center justify-center p-4 overflow-hidden">
      <BackgroundGifts />

      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center relative z-10 transform transition-all duration-300 hover:shadow-3xl">
        <Header />

        <IconDisplay
          isPresenting={isPresenting}
          showAnimation={showAnimation}
          sparkles={sparkles}
        />

        <PhraseDisplay phrase={currentPhrase} isPresenting={isPresenting} />

        <PresentButton onClick={presentSue} isPresenting={isPresenting} />

        <Counter count={presentCount} />

        <StatusMessage count={presentCount} />

        <ProgressBar count={presentCount} />
      </div>

      <Footer />

      <AnimationStyles />
    </div>
  );
};

export default SuePresentApp;
