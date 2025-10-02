import React, { useState, useEffect } from 'react';

const SuePresentApp = () => {
  const [currentScreen, setCurrentScreen] = useState('main'); // 'main' or 'presenting'
  const [presentCount, setPresentCount] = useState(0);
  const [showSueAnimation, setShowSueAnimation] = useState(false);
  const [comboCount, setComboCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);

  // 津田さん風のセリフバリエーション
  const phrases = [
    "スーを差し上げます！",
    "はい、スーをどうぞ！",
    "こちら、スーでございます！",
    "スー、お受け取りください！",
    "特別なスーを差し上げます！",
    "今日も良いスーが入りました！",
    "最高級のスーです！",
    "心を込めてスーを！"
  ];

  const [currentPhrase, setCurrentPhrase] = useState(phrases[0]);

  // お笑い風のリアクション
  const getReaction = (count) => {
    if (count >= 50) return "スー配布の神様！🎭👑";
    if (count >= 30) return "完全にスー中毒ですね！😂";
    if (count >= 20) return "津田さんもびっくり！🤣";
    if (count >= 10) return "お笑い通ですね！👏";
    if (count >= 5) return "ダイアンファンですか？😄";
    return "スー、いかがですか？😊";
  };

  const handlePresentSue = () => {
    const now = Date.now();
    
    // コンボ判定（2秒以内の連続クリック）
    if (now - lastClickTime < 2000) {
      setComboCount(prev => prev + 1);
    } else {
      setComboCount(1);
    }
    setLastClickTime(now);

    setPresentCount(prev => prev + 1);
    
    // ランダムにフレーズを選択
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    setCurrentPhrase(randomPhrase);

    // 画面遷移演出
    setCurrentScreen('presenting');
    setShowSueAnimation(true);

    // 1.5秒後にメイン画面に戻る
    setTimeout(() => {
      setCurrentScreen('main');
      setShowSueAnimation(false);
    }, 1500);
  };

  // メイン画面
  if (currentScreen === 'main') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border-4 border-yellow-400">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-700">漫才コンビ</h1>
            <h2 className="text-4xl font-extrabold text-blue-600 mb-2">ダイアン</h2>
            <h3 className="text-3xl font-bold text-indigo-700">津田篤宏の</h3>
          </div>
          
          <div className="mb-6">
            <div className="text-6xl mb-4 animate-bounce">🎭</div>
            <h2 className="text-4xl font-extrabold text-red-500 mb-4">
              スーを差し上げます
            </h2>
          </div>

          <button
            onClick={handlePresentSue}
            className="w-full py-6 px-8 rounded-full font-bold text-2xl transition-all duration-200 transform bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600 hover:scale-105 active:scale-95 shadow-lg border-4 border-yellow-300"
          >
            <div className="animate-pulse">
              🎁 スーをもらう 🎁
            </div>
          </button>

          <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-blue-600 font-bold">総スー数</div>
              <div className="text-2xl font-bold text-blue-700">{presentCount}</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-purple-600 font-bold">コンボ</div>
              <div className="text-2xl font-bold text-purple-700">{comboCount}</div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-200">
            <p className="text-lg font-semibold text-orange-700">
              {getReaction(presentCount)}
            </p>
          </div>

          {comboCount >= 5 && (
            <div className="mt-4 p-3 bg-red-100 rounded-lg animate-pulse">
              <p className="text-red-600 font-bold">🔥 連打ボーナス！ {comboCount}連打！ 🔥</p>
            </div>
          )}
        </div>

        <div className="mt-6 text-white text-center opacity-80">
          <p className="text-sm">
            💡 連打して津田さん気分を味わおう！
          </p>
          <p className="text-xs mt-2">
            ※ダイアン津田さんの名ギャグをオマージュ
          </p>
        </div>
      </div>
    );
  }

  // スー配布画面
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 via-orange-400 to-red-500 flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <div className="mb-8">
          <div className="text-8xl mb-4 animate-bounce">🎁</div>
          <div className="flex justify-center space-x-2 mb-6">
            <div className="animate-spin text-4xl">✨</div>
            <div className="animate-pulse text-4xl">🎭</div>
            <div className="animate-spin text-4xl">✨</div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-2xl border-4 border-yellow-400 max-w-lg">
          <h1 className="text-7xl font-extrabold text-blue-600 mb-4 animate-pulse leading-tight">
            {currentPhrase}
          </h1>
          
          <div className="text-6xl mb-4">
            <span className="animate-bounce inline-block">🎉</span>
            <span className="animate-bounce inline-block" style={{animationDelay: '0.1s'}}>🎊</span>
            <span className="animate-bounce inline-block" style={{animationDelay: '0.2s'}}>🎉</span>
          </div>

          {comboCount > 1 && (
            <div className="mt-4 p-3 bg-gradient-to-r from-pink-200 to-purple-200 rounded-lg">
              <p className="text-xl font-bold text-purple-700">
                {comboCount}連打！ナイス！👏
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 text-white text-lg font-bold animate-pulse">
          クリックして戻る or 自動で戻ります...
        </div>
      </div>
    </div>
  );
};

export default SuePresentApp;
