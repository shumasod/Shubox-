import React, { useState, useEffect } from 'react';

const spells = {
  'ルーモス': { damage: 10, effect: 'light' },
  'エクスペクト・パトローナム': { damage: 20, effect: 'patronus' },
  'エクスペリアームス': { damage: 15, effect: 'disarm' },
  'ウィンガーディアム・レビオサ': { damage: 5, effect: 'levitate' },
  'プロテゴ': { damage: 0, effect: 'shield' },
};

const HarryPotterGame = () => {
  const [gameState, setGameState] = useState({
    playerName: '',
    playerHealth: 100,
    dumbledoreHealth: 100,
    playerLevel: 1,
    playerExp: 0,
    round: 0,
    playerEffects: [],
    dumbledoreEffects: [],
    score: 0,
  });

  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [lastRound, setLastRound] = useState(null);

  useEffect(() => {
    if (gameState.playerHealth <= 0 || gameState.dumbledoreHealth <= 0) {
      setGameOver(true);
    }
  }, [gameState.playerHealth, gameState.dumbledoreHealth]);

  const startGame = (name) => {
    setGameState(prev => ({ ...prev, playerName: name }));
    setGameStarted(true);
  };

  const chooseDumbledoreSpell = () => {
    if (gameState.dumbledoreHealth < 30) {
      return 'エクスペクト・パトローナム';
    } else if (gameState.playerHealth > 70) {
      return 'エクスペリアームス';
    } else if (gameState.dumbledoreEffects.length === 0) {
      return 'プロテゴ';
    } else {
      return Object.keys(spells)[Math.floor(Math.random() * Object.keys(spells).length)];
    }
  };

  const calculateDamage = (spellInfo, casterLevel, targetEffects) => {
    let damage = spellInfo.damage * (1 + (casterLevel - 1) * 0.1);
    if (targetEffects.includes('shield')) damage *= 0.5;
    if (targetEffects.includes('disarm')) damage *= 0.75;
    return Math.round(damage);
  };

  const castSpell = (playerSpell) => {
    const dumbledoreSpell = chooseDumbledoreSpell();
    
    const playerDamage = calculateDamage(spells[playerSpell], gameState.playerLevel, gameState.dumbledoreEffects);
    const dumbledoreDamage = calculateDamage(spells[dumbledoreSpell], 10, gameState.playerEffects);

    setGameState(prev => ({
      ...prev,
      playerHealth: Math.max(0, Math.min(100, prev.playerHealth - dumbledoreDamage)),
      dumbledoreHealth: Math.max(0, Math.min(100, prev.dumbledoreHealth - playerDamage)),
      round: prev.round + 1,
      score: prev.score + playerDamage,
      playerExp: prev.playerExp + 10,
      playerLevel: prev.playerExp >= 90 ? prev.playerLevel + 1 : prev.playerLevel,
      playerEffects: [spells[playerSpell].effect],
      dumbledoreEffects: [spells[dumbledoreSpell].effect],
    }));

    setLastRound({ playerSpell, dumbledoreSpell, playerDamage, dumbledoreDamage });
  };

  if (!gameStarted) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">ダンブルドアゲーム</h2>
        <p className="mb-4">ダンブルドア教授との魔法の決闘に挑戦しましょう！</p>
        <input
          type="text"
          placeholder="プレイヤー名を入力"
          onChange={(e) => setGameState(prev => ({ ...prev, playerName: e.target.value }))}
          className="w-full p-2 mb-4 border rounded"
        />
        <button 
          onClick={() => startGame(gameState.playerName)}
          className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          ゲームを開始
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">ダンブルドアとの決闘</h2>
      
      <div className="mb-4">
        <h3 className="text-xl font-semibold">{gameState.playerName} (レベル {gameState.playerLevel})</h3>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div className="bg-blue-600 h-2.5 rounded-full" style={{width: `${gameState.playerHealth}%`}}></div>
        </div>
        <p>体力: {gameState.playerHealth}/100</p>
        <p>経験値: {gameState.playerExp}/100</p>
        <p>効果: {gameState.playerEffects.join(', ')}</p>
      </div>

      <div className="mb-4">
        <h3 className="text-xl font-semibold">ダンブルドア</h3>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div className="bg-red-600 h-2.5 rounded-full" style={{width: `${gameState.dumbledoreHealth}%`}}></div>
        </div>
        <p>体力: {gameState.dumbledoreHealth}/100</p>
        <p>効果: {gameState.dumbledoreEffects.join(', ')}</p>
      </div>

      <p className="text-lg font-semibold mb-4">ラウンド: {gameState.round} | スコア: {gameState.score}</p>

      {lastRound && (
        <div className="mb-4">
          <p>あなたの呪文: {lastRound.playerSpell} (ダメージ: {lastRound.playerDamage})</p>
          <p>ダンブルドアの呪文: {lastRound.dumbledoreSpell} (ダメージ: {lastRound.dumbledoreDamage})</p>
        </div>
      )}

      {gameOver ? (
        <h2 className="text-2xl font-bold mb-4">
          {gameState.playerHealth <= 0 ? 'ゲームオーバー！ダンブルドアの勝利です。' : 'おめでとうございます！あなたの勝利です。'}
        </h2>
      ) : (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {Object.entries(spells).map(([spell, info]) => (
            <button 
              key={spell} 
              onClick={() => castSpell(spell)}
              className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              {spell} (ダメージ: {info.damage}, 効果: {info.effect})
            </button>
          ))}
        </div>
      )}

      <button 
        onClick={() => window.location.reload()}
        className="w-full p-2 bg-gray-500 text-white rounded hover:bg-gray-600"
      >
        ゲームをリセット
      </button>
    </div>
  );
};

export default HarryPotterGame;