import React, { useState, useEffect } from 'react';

const SuePresentApp = () => {
  const [isPresenting, setIsPresenting] = useState(false);
  const [presentCount, setPresentCount] = useState(0);
  const [showAnimation, setShowAnimation] = useState(false);

  // 津田さん風のセリフバリエーション
  const phrases = [
    "スーを差し上げます！",
    "はい、スーをどうぞ！",
    "こちら、スーでございます！",
    "スー、お受け取りください！",
    "特別なスーを差し上げます！"
  ];

  const [currentPhrase, setCurrentPhrase] = useState(phrases[0]);

  const handlePresentSue = () => {
    setIsPresenting(true);
    setShowAnimation(true);
    setPresentCount(prev => prev + 1);
    
    // ランダムにフレーズを選択
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    setCurrentPhrase(randomPhrase);

    // アニメーション終了後にリセット
    setTimeout(() => {
      setIsPresenting(false);
    }, 2000);

    setTimeout(() => {
      setShowAnimation(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-red-400 flex flex-col items-center justify-center p-8">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          津田の
        </h1>
        <h2 className="text-4xl font-extrabold text-purple-600 mb-6">
          スーを差し上げます
        </h2>
        
        <div className="mb-8 relative">
          <div className="text-6xl mb-4">
            {isPresenting ? "🎁" : "🎭"}
          </div>
          
          {showAnimation && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-bounce text-4xl">✨</div>
              <div className="animate-pulse text-6xl mx-2">🎁</div>
              <div className="animate-bounce text-4xl">✨</div>
            </div>
          )}
        </div>

        <div className="mb-6">
          <p className={`text-xl font-semibold ${isPresenting ? 'text-purple-600 animate-pulse' : 'text-gray-600'}`}>
            {currentPhrase}
          </p>
        </div>

        <button
          onClick={handlePresentSue}
          disabled={isPresenting}
          className={`w-full py-4 px-8 rounded-full font-bold text-xl transition-all duration-300 transform ${
            isPresenting 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 hover:scale-105 active:scale-95'
          }`}
        >
          {isPresenting ? "スー配布中..." : "スーをもらう"}
        </button>

        <div className="mt-6 text-sm text-gray-500">
          今までに <span className="font-bold text-purple-600">{presentCount}</span> 個のスーを差し上げました
        </div>

        {presentCount > 0 && (
          <div className="mt-4 p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-purple-700">
              {presentCount >= 10 ? "スー配布マスターです！🏆" :
               presentCount >= 5 ? "スー愛好家ですね！👏" :
               "ありがとうございます！😊"}
            </p>
          </div>
        )}
      </div>

      <div className="mt-8 text-white text-center opacity-80">
        <p className="text-sm">
          ※このアプリはダイアン津田さんの「スーを差し上げます」ギャグをオマージュしたファンメイドアプリです
        </p>
      </div>
    </div>
  );
};

export default SuePresentApp;
