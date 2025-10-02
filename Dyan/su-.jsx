import React, { useState } from ‘react’;

const SuePresentApp = () => {
const [isPresenting, setIsPresenting] = useState(false);
const [presentCount, setPresentCount] = useState(0);
const [showAnimation, setShowAnimation] = useState(false);
const [sparkles, setSparkles] = useState([]);

const phrases = [
“スーを差し上げます！”,
“はい、スーをどうぞ！”,
“こちら、スーでございます！”,
“スー、お受け取りください！”,
“特別なスーを差し上げます！”,
“本日のスーです！”,
“厳選されたスーをどうぞ！”
];

const [currentPhrase, setCurrentPhrase] = useState(phrases[0]);

const createSparkles = () => {
const newSparkles = [];
for (let i = 0; i < 12; i++) {
newSparkles.push({
id: Date.now() + i,
x: Math.random() * 100 - 50,
y: Math.random() * 100 - 50,
delay: Math.random() * 0.5,
emoji: [‘✨’, ‘⭐’, ‘💫’, ‘🌟’][Math.floor(Math.random() * 4)]
});
}
setSparkles(newSparkles);
};

const handlePresentSue = () => {
if (isPresenting) return;

```
setIsPresenting(true);
setShowAnimation(true);
setPresentCount(prev => prev + 1);
createSparkles();

const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
setCurrentPhrase(randomPhrase);

setTimeout(() => {
  setIsPresenting(false);
}, 2000);

setTimeout(() => {
  setShowAnimation(false);
  setSparkles([]);
}, 3000);
```

};

const getStatusMessage = () => {
if (presentCount === 0) return “スーをもらってみましょう！”;
if (presentCount >= 20) return “スー配布の達人！🏆✨”;
if (presentCount >= 10) return “スー配布マスター！🏆”;
if (presentCount >= 5) return “スー愛好家ですね！👏”;
return “ありがとうございます！😊”;
};

return (
<div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-red-400 flex flex-col items-center justify-center p-4 overflow-hidden">
{/* 背景の装飾 */}
<div className="absolute inset-0 overflow-hidden pointer-events-none">
{[…Array(20)].map((_, i) => (
<div
key={i}
className=“absolute text-4xl opacity-20 animate-float”
style={{
left: `${Math.random() * 100}%`,
top: `${Math.random() * 100}%`,
animationDelay: `${Math.random() * 5}s`,
animationDuration: `${10 + Math.random() * 10}s`
}}
>
🎁
</div>
))}
</div>

```
  <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center relative z-10 transform transition-all duration-300 hover:shadow-3xl">
    <div className="mb-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-1">
        津田の
      </h1>
      <h2 className="text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
        スーを差し上げます
      </h2>
      <div className="h-1 w-32 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto rounded-full"></div>
    </div>
    
    <div className="mb-8 relative h-32 flex items-center justify-center">
      {/* メインアイコン */}
      <div className={`text-8xl transition-all duration-500 ${isPresenting ? 'scale-125 rotate-12' : 'scale-100'}`}>
        {isPresenting ? "🎁" : "🎭"}
      </div>
      
      {/* スパークルアニメーション */}
      {showAnimation && sparkles.map((sparkle) => (
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

      {/* 中央のギフトアニメーション */}
      {showAnimation && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute animate-ping text-6xl opacity-75">💝</div>
          <div className="absolute animate-bounce text-4xl">✨</div>
        </div>
      )}
    </div>

    {/* フレーズ表示 */}
    <div className="mb-8 h-16 flex items-center justify-center">
      <p className={`text-2xl font-bold transition-all duration-300 ${
        isPresenting 
          ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 scale-110' 
          : 'text-gray-700'
      }`}>
        {currentPhrase}
      </p>
    </div>

    {/* メインボタン */}
    <button
      onClick={handlePresentSue}
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
        "スーをもらう"
      )}
    </button>

    {/* カウンター */}
    <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
      <p className="text-sm text-gray-600 mb-1">
        今までに
      </p>
      <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
        {presentCount}
      </p>
      <p className="text-sm text-gray-600 mt-1">
        個のスーを差し上げました
      </p>
    </div>

    {/* ステータスメッセージ */}
    {presentCount > 0 && (
      <div className="mt-4 p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border-2 border-purple-200 transform transition-all duration-300 hover:scale-105">
        <p className="text-base font-semibold text-purple-700">
          {getStatusMessage()}
        </p>
      </div>
    )}

    {/* プログレスバー */}
    {presentCount > 0 && (
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>次の称号まで</span>
          <span>{Math.min(presentCount, 20)}/20</span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 rounded-full"
            style={{ width: `${Math.min((presentCount / 20) * 100, 100)}%` }}
          ></div>
        </div>
      </div>
    )}
  </div>

  {/* フッター */}
  <div className="mt-8 text-white text-center opacity-90 max-w-md">
    <p className="text-sm backdrop-blur-sm bg-white/20 p-3 rounded-lg">
      ※このアプリはダイアン津田さんの「スーを差し上げます」ギャグをオマージュしたファンメイドアプリです
    </p>
  </div>

  <style jsx>{`
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
</div>
```

);
};

export default SuePresentApp;