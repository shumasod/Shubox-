import React, { useState, useEffect, useCallback } from ‘react’;

const VegetableStirFryGame = () => {
const [gameState, setGameState] = useState(‘menu’); // menu, cutting, cooking, gameOver
const [score, setScore] = useState(0);
const [heat, setHeat] = useState(0); // 0-5 heat level (0 = off)
const [cookingTime, setCookingTime] = useState(0);
const [vegetables, setVegetables] = useState([]);
const [cuttingBoard, setCuttingBoard] = useState([]);
const [selectedVeggie, setSelectedVeggie] = useState(null);
const [availableVeggies] = useState([
{ id: 1, name: ‘キャベツ’, emoji: ‘🥬’, cutEmoji: ‘🟢’, cookTime: 3, cuts: 0, maxCuts: 4 },
{ id: 2, name: ‘にんじん’, emoji: ‘🥕’, cutEmoji: ‘🟠’, cookTime: 4, cuts: 0, maxCuts: 5 },
{ id: 3, name: ‘ピーマン’, emoji: ‘🫑’, cutEmoji: ‘🟩’, cookTime: 2, cuts: 0, maxCuts: 3 },
{ id: 4, name: ‘もやし’, emoji: ‘🌱’, cutEmoji: ‘🤍’, cookTime: 1, cuts: 0, maxCuts: 2 },
{ id: 5, name: ‘たまねぎ’, emoji: ‘🧅’, cutEmoji: ‘⚪’, cookTime: 3, cuts: 0, maxCuts: 4 },
{ id: 6, name: ‘なす’, emoji: ‘🍆’, cutEmoji: ‘🟣’, cookTime: 4, cuts: 0, maxCuts: 5 }
]);
const [gameTimer, setGameTimer] = useState(45);
const [message, setMessage] = useState(’’);
const [cutProgress, setCutProgress] = useState(0);
const [isGasOn, setIsGasOn] = useState(false);

// Game timer
useEffect(() => {
if (gameState === ‘cooking’ && gameTimer > 0) {
const timer = setTimeout(() => setGameTimer(gameTimer - 1), 1000);
return () => clearTimeout(timer);
} else if (gameTimer === 0 && gameState === ‘cooking’) {
endGame();
}
}, [gameState, gameTimer]);

// Cooking timer
useEffect(() => {
if (gameState === ‘cooking’ && isGasOn) {
const timer = setInterval(() => {
setCookingTime(prev => prev + 0.1);
updateVegetableStates();
}, 100);
return () => clearInterval(timer);
}
}, [gameState, vegetables, isGasOn]);

const updateVegetableStates = useCallback(() => {
if (vegetables.length === 0) return;

```
setVegetables(prev => prev.map(veg => {
  const cookProgress = (cookingTime - veg.addedTime) * heat / 10;
  let state = 'raw';
  if (cookProgress > veg.cookTime * 0.7) state = 'perfect';
  if (cookProgress > veg.cookTime * 1.3) state = 'overcooked';
  if (cookProgress > veg.cookTime * 2) state = 'burnt';
  
  return { ...veg, cookState: state, cookProgress };
}));
```

}, [cookingTime, heat, vegetables.length]);

const startGame = () => {
setGameState(‘cutting’);
setScore(0);
setHeat(0);
setIsGasOn(false);
setCookingTime(0);
setGameTimer(45);
setVegetables([]);
setCuttingBoard([]);
setSelectedVeggie(null);
setCutProgress(0);
setMessage(‘野菜を選んでカットしよう！’);
};

const selectVegetable = (veggie) => {
if (gameState !== ‘cutting’ || selectedVeggie?.id === veggie.id) return;
setSelectedVeggie({ …veggie, cuts: 0 });
setCutProgress(0);
setMessage(`${veggie.name}を選択しました。クリックしてカットしよう！`);
};

const cutVegetable = () => {
if (!selectedVeggie || selectedVeggie.cuts >= selectedVeggie.maxCuts) return;

```
const newCuts = selectedVeggie.cuts + 1;
setSelectedVeggie(prev => ({ ...prev, cuts: newCuts }));
setCutProgress((newCuts / selectedVeggie.maxCuts) * 100);

if (newCuts >= selectedVeggie.maxCuts) {
  // カット完了
  setCuttingBoard(prev => [...prev, { 
    ...selectedVeggie, 
    cuts: newCuts, 
    cutComplete: true,
    id: Date.now() + Math.random() // ユニークID
  }]);
  setScore(prev => prev + 10);
  setMessage(`${selectedVeggie.name}のカット完了！次の野菜を選ぼう！`);
  setSelectedVeggie(null);
  setCutProgress(0);
} else {
  setMessage(`${selectedVeggie.name} ${newCuts}/${selectedVeggie.maxCuts} カット`);
}
```

};

const addToPan = (cutVeggie) => {
if (gameState !== ‘cutting’) return;

```
setVegetables(prev => [...prev, {
  ...cutVeggie,
  addedTime: cookingTime,
  cookState: 'raw',
  cookProgress: 0
}]);

setCuttingBoard(prev => prev.filter(v => v.id !== cutVeggie.id));
setScore(prev => prev + 5);
setMessage(`${cutVeggie.name}をフライパンに追加しました！`);
```

};

const startCooking = () => {
if (vegetables.length === 0) {
setMessage(‘野菜をフライパンに入れてから料理を始めよう！’);
return;
}
setGameState(‘cooking’);
setMessage(‘料理開始！ガスを点けて炒めよう！’);
};

const toggleGas = () => {
if (gameState !== ‘cooking’) return;
setIsGasOn(!isGasOn);
if (!isGasOn) {
setMessage(‘ガスを点けました！火力を調整しよう’);
} else {
setMessage(‘ガスを消しました’);
setHeat(0);
}
};

const adjustHeat = (newHeat) => {
if (gameState !== ‘cooking’ || !isGasOn) return;
setHeat(newHeat);
setMessage(`火力: ${newHeat}/5`);
};

const stirFry = () => {
if (gameState !== ‘cooking’ || vegetables.length === 0) return;

```
let bonusScore = 0;
vegetables.forEach(veg => {
  if (veg.cookState === 'perfect') bonusScore += 15;
  else if (veg.cookState === 'overcooked') bonusScore += 3;
  else if (veg.cookState === 'burnt') bonusScore -= 8;
});

setScore(prev => prev + Math.max(0, bonusScore));
setMessage(`かき混ぜ！ +${Math.max(0, bonusScore)}点`);
```

};

const endGame = () => {
setGameState(‘gameOver’);
setIsGasOn(false);
setHeat(0);
let finalBonus = 0;
vegetables.forEach(veg => {
if (veg.cookState === ‘perfect’) finalBonus += 25;
else if (veg.cookState === ‘overcooked’) finalBonus += 8;
});
setScore(prev => prev + finalBonus);
};

const getGasFlameHeight = () => {
if (!isGasOn || heat === 0) return 0;
return Math.max(8, heat * 4);
};

const renderMixedVegetables = () => {
if (vegetables.length === 0) return null;

```
// 野菜を混ぜた状態で表示
const mixedVeggies = vegetables.reduce((acc, veg) => {
  const cutEmoji = veg.cutEmoji;
  const count = Math.floor(veg.maxCuts / 2) + 1;
  for (let i = 0; i < count; i++) {
    acc.push({
      emoji: cutEmoji,
      state: veg.cookState,
      key: `${veg.id}-${i}`
    });
  }
  return acc;
}, []);

// シャッフルして混ぜた感じに
const shuffled = mixedVeggies.sort(() => Math.random() - 0.5);

return (
  <div className="absolute inset-4 flex flex-wrap justify-center items-center gap-1">
    {shuffled.slice(0, 20).map((piece, index) => (
      <div 
        key={piece.key + index} 
        className={`text-lg transition-all duration-300 ${
          isGasOn && heat > 0 ? 'animate-bounce' : ''
        } ${piece.state === 'burnt' ? 'filter brightness-50' : ''} 
        ${piece.state === 'perfect' ? 'animate-pulse filter brightness-125' : ''}`}
        style={{ 
          animationDelay: `${index * 0.1}s`,
          transform: `rotate(${Math.random() * 20 - 10}deg)`
        }}
      >
        {piece.emoji}
      </div>
    ))}
  </div>
);
```

};

if (gameState === ‘menu’) {
return (
<div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-orange-100 to-yellow-100 p-8">
<div className="text-center">
<h1 className="text-6xl mb-4">🔪🥢</h1>
<h1 className="text-4xl font-bold text-brown-800 mb-6">野菜炒めマスター</h1>
<p className="text-lg text-gray-700 mb-8 max-w-md">
野菜をカットして、ガスコンロで炒めて高得点を目指そう！<br/>
カット技術と火力調整がポイントです。
</p>
<button
onClick={startGame}
className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-full text-xl transition-colors duration-300 transform hover:scale-105"
>
ゲームスタート！
</button>
</div>
</div>
);
}

if (gameState === ‘gameOver’) {
return (
<div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 p-8">
<div className="text-center bg-white rounded-lg p-8 shadow-2xl">
<h1 className="text-4xl mb-4">🏆</h1>
<h2 className="text-3xl font-bold mb-4">ゲーム終了！</h2>
<div className="text-6xl font-bold text-purple-600 mb-4">{score}点</div>
<div className="mb-6">
{score >= 150 && <p className="text-xl text-green-600">🌟 野菜炒めマスター！</p>}
{score >= 80 && score < 150 && <p className="text-xl text-blue-600">👍 なかなかの腕前！</p>}
{score < 80 && <p className="text-xl text-gray-600">🤔 もう一度挑戦してみよう！</p>}
</div>
<button
onClick={startGame}
className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full mr-4 transition-colors"
>
もう一度プレイ
</button>
<button
onClick={() => setGameState(‘menu’)}
className=“bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-full transition-colors”
>
メニューに戻る
</button>
</div>
</div>
);
}

return (
<div className="min-h-screen bg-gradient-to-b from-yellow-100 to-orange-100 p-4">
<div className="max-w-7xl mx-auto">
{/* Status Bar */}
<div className="bg-white rounded-lg p-4 mb-4 shadow-lg flex justify-between items-center">
<div className="text-xl font-bold">スコア: {score}点</div>
<div className="text-xl font-bold text-red-600">
残り時間: {gameTimer}秒
</div>
<div className="text-lg">
{gameState === ‘cutting’ ? ‘📋 カット中’ : ‘🍳 料理中’}
</div>
</div>

```
    {gameState === 'cutting' && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Cutting Board Area */}
        <div className="lg:col-span-2">
          <div className="bg-amber-100 rounded-lg p-6 shadow-lg mb-4 border-4 border-amber-200">
            <h3 className="text-xl font-bold mb-4 text-center">🔪 まな板</h3>
            
            {/* Selected Vegetable */}
            {selectedVeggie && (
              <div className="bg-white rounded-lg p-4 mb-4 text-center">
                <div className="text-4xl mb-2">{selectedVeggie.emoji}</div>
                <h4 className="text-lg font-bold">{selectedVeggie.name}</h4>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${cutProgress}%` }}
                  />
                </div>
                <p className="text-sm mt-1">{selectedVeggie.cuts}/{selectedVeggie.maxCuts} カット</p>
                <button
                  onClick={cutVegetable}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded mt-3 transition-colors"
                  disabled={selectedVeggie.cuts >= selectedVeggie.maxCuts}
                >
                  🔪 カットする
                </button>
              </div>
            )}
            
            {/* Cut Vegetables */}
            {cuttingBoard.length > 0 && (
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-bold mb-2">カット済み野菜:</h4>
                <div className="flex flex-wrap gap-2">
                  {cuttingBoard.map(veggie => (
                    <button
                      key={veggie.id}
                      onClick={() => addToPan(veggie)}
                      className="bg-green-100 hover:bg-green-200 p-2 rounded transition-colors flex items-center gap-2"
                    >
                      <span className="text-xs">{veggie.cutEmoji.repeat(veggie.maxCuts)}</span>
                      <span className="text-sm">{veggie.name}</span>
                      <span className="text-xs">→🍳</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {vegetables.length > 0 && (
              <button
                onClick={startCooking}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded mt-4 transition-colors"
              >
                🔥 料理を始める！
              </button>
            )}
          </div>
        </div>

        {/* Vegetable Selection */}
        <div className="bg-white rounded-lg p-4 shadow-lg">
          <h3 className="text-xl font-bold mb-4 text-center">🥗 野菜を選ぼう</h3>
          <div className="space-y-2">
            {availableVeggies.map((veggie) => (
              <button
                key={veggie.id}
                onClick={() => selectVegetable(veggie)}
                className={`w-full p-3 rounded-lg text-left transition-all ${
                  selectedVeggie?.id === veggie.id
                    ? 'bg-blue-200 border-2 border-blue-400' 
                    : 'bg-green-100 hover:bg-green-200 hover:scale-105'
                }`}
              >
                <span className="text-2xl mr-2">{veggie.emoji}</span>
                <span className="font-semibold">{veggie.name}</span>
                <div className="text-xs text-gray-600 mt-1">
                  {veggie.maxCuts}回カット必要
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    )}

    {gameState === 'cooking' && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Gas Stove and Pan */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 shadow-lg">
            <h3 className="text-white text-xl font-bold mb-4 text-center">🔥 ガスコンロ</h3>
            
            {/* Gas Stove */}
            <div className="bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg p-4 mb-4">
              {/* Burner */}
              <div className="relative w-64 h-64 mx-auto">
                {/* Burner ring */}
                <div className="absolute inset-0 border-8 border-gray-800 rounded-full bg-gradient-to-br from-gray-700 to-gray-600">
                  {/* Gas holes */}
                  <div className="absolute inset-4 border-4 border-gray-800 rounded-full flex items-center justify-center">
                    {Array.from({length: 8}).map((_, i) => (
                      <div key={i} className="absolute w-2 h-2 bg-gray-800 rounded-full" 
                           style={{
                             transform: `rotate(${i * 45}deg) translateY(-40px)`,
                             transformOrigin: 'center 40px'
                           }} />
                    ))}
                  </div>
                  
                  {/* Gas flames */}
                  {isGasOn && heat > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      {Array.from({length: 8}).map((_, i) => (
                        <div key={i} 
                             className="absolute animate-pulse"
                             style={{
                               transform: `rotate(${i * 45}deg) translateY(-30px)`,
                               transformOrigin: 'center 30px'
                             }}>
                          <div 
                            className="w-3 bg-gradient-to-t from-blue-500 via-blue-400 to-orange-400 rounded-full animate-flicker"
                            style={{ height: `${getGasFlameHeight()}px` }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pan on top of burner */}
                <div className="absolute inset-8 bg-gradient-to-br from-gray-700 to-gray-600 rounded-full border-8 border-gray-900 overflow-hidden">
                  {renderMixedVegetables()}
                  
                  {/* Heat shimmer effect */}
                  {isGasOn && heat > 2 && (
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-orange-200 to-transparent opacity-20 animate-pulse" />
                  )}
                </div>
              </div>
            </div>
            
            {/* Controls */}
            <div className="flex justify-center gap-4 mb-4">
              <button
                onClick={toggleGas}
                className={`font-bold py-2 px-4 rounded transition-colors ${
                  isGasOn 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-gray-500 hover:bg-gray-600 text-white'
                }`}
              >
                {isGasOn ? '🔥 ガス ON' : '⭕ ガス OFF'}
              </button>
              
              <button
                onClick={stirFry}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded transition-colors"
                disabled={!isGasOn || vegetables.length === 0}
              >
                🥄 かき混ぜる！
              </button>
            </div>

            {/* Heat Control */}
            {isGasOn && (
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-white font-bold mb-2 text-center">火力調整</h4>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map(level => (
                    <button
                      key={level}
                      onClick={() => adjustHeat(level)}
                      className={`w-12 h-12 rounded-full font-bold transition-colors ${
                        heat === level 
                          ? 'bg-orange-500 text-white' 
                          : 'bg-gray-500 hover:bg-gray-400 text-white'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cooking Status */}
        <div className="bg-white rounded-lg p-4 shadow-lg">
          <h3 className="text-xl font-bold mb-4 text-center">🍳 料理状況</h3>
          
          {vegetables.length > 0 ? (
            <div className="space-y-2">
              {vegetables.map((veg, index) => (
                <div key={index} className="p-2 border rounded">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{veg.name}</span>
                    <span className={`text-sm px-2 py-1 rounded ${
                      veg.cookState === 'raw' ? 'bg-gray-200' :
                      veg.cookState === 'perfect' ? 'bg-green-200' :
                      veg.cookState === 'overcooked' ? 'bg-yellow-200' :
                      'bg-red-200'
                    }`}>
                      {veg.cookState === 'raw' ? '生' :
                       veg.cookState === 'perfect' ? '完璧！' :
                       veg.cookState === 'overcooked' ? '少し焼きすぎ' :
                       '焦げてる！'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center">まだ野菜がありません</p>
          )}
        </div>
      </div>
    )}

    {/* Message Area */}
    <div className="bg-white rounded-lg p-4 mt-4 shadow-lg text-center">
      <p className="text-lg font-semibold">{message}</p>
    </div>

    {/* Instructions */}
    <div className="bg-blue-50 rounded-lg p-4 mt-4 shadow-lg">
      <h4 className="font-bold mb-2">🎯 遊び方:</h4>
      <ul className="text-sm space-y-1">
        <li>• 野菜を選んでカットボタンで細かく切る</li>
        <li>• カット完了した野菜をフライパンに追加</li>
        <li>• ガスを点けて火力を調整</li>
        <li>• 「かき混ぜる」でボーナスポイント獲得</li>
        <li>• 完璧な焼き加減で高得点を目指そう！</li>
      </ul>
    </div>
  </div>
  
  <style jsx>{`
    @keyframes flicker {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
    .animate-flicker {
      animation: flicker 0.5s ease-in-out infinite alternate;
    }
  `}</style>
</div>
```

);
};

export default VegetableStirFryGame;