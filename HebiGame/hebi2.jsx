import React, { useState, useEffect, useCallback, useRef } from 'react';

const RPGDragonGame = () => {
  const GRID_SIZE = 15;
  const DIFFICULTY_SETTINGS = {
    apprentice: { speed: 250, name: '見習い冒険者', multiplier: 1 },
    knight: { speed: 180, name: '騎士', multiplier: 1.5 },
    master: { speed: 120, name: '伝説の勇者', multiplier: 2 }
  };

  // ゲーム状態
  const [grid, setGrid] = useState(Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0)));
  const [dragon, setDragon] = useState([[7, 7]]);
  const [direction, setDirection] = useState('RIGHT');
  const [treasure, setTreasure] = useState([3, 3]);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gold, setGold] = useState(0);
  const [experience, setExperience] = useState(0);
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(() => {
    try {
      const saved = localStorage.getItem('rpgDragonHighScore');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState('knight');
  const [showInstructions, setShowInstructions] = useState(false);
  const [treasureType, setTreasureType] = useState('gem');
  const [achievements, setAchievements] = useState([]);

  // 参照
  const directionRef = useRef(direction);
  const gameOverRef = useRef(gameOver);
  const isPausedRef = useRef(isPaused);
  const gameStartedRef = useRef(gameStarted);

  useEffect(() => {
    directionRef.current = direction;
    gameOverRef.current = gameOver;
    isPausedRef.current = isPaused;
    gameStartedRef.current = gameStarted;
  }, [direction, gameOver, isPaused, gameStarted]);

  // 宝物の種類とポイント
  const treasureTypes = {
    gem: { symbol: '💎', name: '魔法の宝石', points: 50, color: 'bg-gradient-to-r from-blue-400 to-purple-600' },
    gold: { symbol: '👑', name: '黄金の王冠', points: 100, color: 'bg-gradient-to-r from-yellow-400 to-orange-500' },
    potion: { symbol: '🧪', name: '秘薬', points: 75, color: 'bg-gradient-to-r from-green-400 to-teal-500' },
    scroll: { symbol: '📜', name: '古代の巻物', points: 125, color: 'bg-gradient-to-r from-amber-300 to-orange-400' }
  };

  // レベル計算
  const calculateLevel = useCallback((exp) => {
    return Math.floor(exp / 200) + 1;
  }, []);

  // グリッドの更新
  const updateGrid = useCallback(() => {
    const newGrid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
    
    // ドラゴンの描画
    dragon.forEach((pos, index) => {
      if (pos[0] >= 0 && pos[0] < GRID_SIZE && pos[1] >= 0 && pos[1] < GRID_SIZE) {
        newGrid[pos[1]][pos[0]] = index === 0 ? 2 : 1; // 頭は2、体は1
      }
    });
    
    // 宝物の描画
    if (treasure[0] >= 0 && treasure[0] < GRID_SIZE && treasure[1] >= 0 && treasure[1] < GRID_SIZE) {
      newGrid[treasure[1]][treasure[0]] = 3;
    }
    
    setGrid(newGrid);
  }, [dragon, treasure]);

  // 新しい宝物の生成
  const generateTreasure = useCallback(() => {
    let newTreasure;
    do {
      newTreasure = [
        Math.floor(Math.random() * GRID_SIZE),
        Math.floor(Math.random() * GRID_SIZE)
      ];
    } while (dragon.some(segment => segment[0] === newTreasure[0] && segment[1] === newTreasure[1]));
    
    // ランダムな宝物タイプを選択
    const types = Object.keys(treasureTypes);
    const randomType = types[Math.floor(Math.random() * types.length)];
    
    setTreasure(newTreasure);
    setTreasureType(randomType);
  }, [dragon]);

  // 衝突判定
  const checkCollision = useCallback((head) => {
    return (
      head[0] < 0 ||
      head[0] >= GRID_SIZE ||
      head[1] < 0 ||
      head[1] >= GRID_SIZE ||
      dragon.slice(1).some(segment => segment[0] === head[0] && segment[1] === head[1])
    );
  }, [dragon]);

  // 実績チェック
  const checkAchievements = useCallback((newGold, newLevel, dragonLength) => {
    const newAchievements = [];
    
    if (newGold >= 1000 && !achievements.includes('goldCollector')) {
      newAchievements.push('goldCollector');
    }
    if (newLevel >= 5 && !achievements.includes('levelMaster')) {
      newAchievements.push('levelMaster');
    }
    if (dragonLength >= 20 && !achievements.includes('longDragon')) {
      newAchievements.push('longDragon');
    }
    
    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements]);
    }
  }, [achievements]);

  // ゲームオーバー処理
  const handleGameOver = useCallback(() => {
    setGameOver(true);
    setGameStarted(false);
    if (gold > highScore) {
      setHighScore(gold);
      try {
        localStorage.setItem('rpgDragonHighScore', gold.toString());
      } catch (e) {
        console.warn('ハイスコアの保存に失敗しました');
      }
    }
  }, [gold, highScore]);

  // 方向変更
  const changeDirection = useCallback((newDirection) => {
    if (gameOverRef.current || !gameStartedRef.current) return;

    const opposites = {
      UP: 'DOWN',
      DOWN: 'UP',
      LEFT: 'RIGHT',
      RIGHT: 'LEFT'
    };

    if (opposites[directionRef.current] !== newDirection) {
      setDirection(newDirection);
    }
  }, []);

  // ゲーム更新ロジック
  useEffect(() => {
    if (!gameStarted || gameOver || isPaused) return;

    const moveDragon = () => {
      const newDragon = [...dragon];
      const head = [...newDragon[0]];

      switch (direction) {
        case 'UP':    head[1] -= 1; break;
        case 'DOWN':  head[1] += 1; break;
        case 'LEFT':  head[0] -= 1; break;
        case 'RIGHT': head[0] += 1; break;
        default: break;
      }

      if (checkCollision(head)) {
        handleGameOver();
        return;
      }

      newDragon.unshift(head);

      if (head[0] === treasure[0] && head[1] === treasure[1]) {
        const treasureInfo = treasureTypes[treasureType];
        const points = Math.floor(treasureInfo.points * DIFFICULTY_SETTINGS[difficulty].multiplier);
        
        setGold(prevGold => {
          const newGold = prevGold + points;
          checkAchievements(newGold, level, newDragon.length);
          return newGold;
        });
        
        setExperience(prevExp => {
          const newExp = prevExp + points;
          const newLevel = calculateLevel(newExp);
          setLevel(newLevel);
          return newExp;
        });
        
        generateTreasure();
      } else {
        newDragon.pop();
      }

      setDragon(newDragon);
    };

    const speed = DIFFICULTY_SETTINGS[difficulty].speed - Math.min(level * 10, 100);
    const gameInterval = setInterval(moveDragon, Math.max(speed, 80));
    return () => clearInterval(gameInterval);
  }, [dragon, direction, treasure, treasureType, gameOver, isPaused, gameStarted, difficulty, level, checkCollision, generateTreasure, handleGameOver, calculateLevel, checkAchievements]);

  // グリッドの更新
  useEffect(() => {
    updateGrid();
  }, [dragon, treasure, updateGrid]);

  // キーボード操作
  const handleKeyPress = useCallback((e) => {
    e.preventDefault();
    
    if (e.key === ' ') {
      if (!gameStartedRef.current && !gameOverRef.current) {
        startGame();
      } else if (gameStartedRef.current) {
        togglePause();
      }
      return;
    }

    if (e.key === 'Escape') {
      setShowInstructions(!showInstructions);
      return;
    }

    const keyMap = {
      ArrowUp: 'UP',
      ArrowDown: 'DOWN',
      ArrowLeft: 'LEFT',
      ArrowRight: 'RIGHT',
      w: 'UP',
      s: 'DOWN',
      a: 'LEFT',
      d: 'RIGHT',
      W: 'UP',
      S: 'DOWN',
      A: 'LEFT',
      D: 'RIGHT'
    };

    if (keyMap[e.key]) {
      changeDirection(keyMap[e.key]);
    }
  }, [changeDirection, showInstructions]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // ゲーム開始
  const startGame = () => {
    setDragon([[7, 7]]);
    setDirection('RIGHT');
    setTreasure([3, 3]);
    setTreasureType('gem');
    setGameOver(false);
    setGameStarted(true);
    setGold(0);
    setExperience(0);
    setLevel(1);
    setIsPaused(false);
    setAchievements([]);
  };

  // ゲームリセット
  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setIsPaused(false);
    setGold(0);
    setExperience(0);
    setLevel(1);
    setDragon([[7, 7]]);
    setDirection('RIGHT');
    setTreasure([3, 3]);
    setTreasureType('gem');
    setAchievements([]);
  };

  // ポーズ切り替え
  const togglePause = () => {
    if (gameStarted && !gameOver) {
      setIsPaused(!isPaused);
    }
  };

  const getCellStyle = (value) => {
    switch (value) {
      case 0: return 'bg-gradient-to-br from-slate-800 via-slate-900 to-black border border-slate-700'; // 洞窟の床
      case 1: return 'bg-gradient-to-r from-emerald-500 to-green-600 border border-green-400 shadow-lg'; // ドラゴンの体
      case 2: return 'bg-gradient-to-r from-emerald-300 to-green-500 border border-green-300 shadow-xl'; // ドラゴンの頭
      case 3: return `${treasureTypes[treasureType].color} border border-yellow-300 shadow-xl animate-pulse`; // 宝物
      default: return 'bg-slate-900';
    }
  };

  // タッチコントロール
  const TouchControls = () => (
    <div className="grid grid-cols-3 gap-3 w-56 mx-auto mt-6">
      <div></div>
      <button
        onClick={() => changeDirection('UP')}
        className="bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 text-white p-4 rounded-xl text-2xl font-bold transition-all duration-200 shadow-lg border border-blue-400"
        aria-label="北へ移動"
      >
        ⬆️
      </button>
      <div></div>
      <button
        onClick={() => changeDirection('LEFT')}
        className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 text-white p-4 rounded-xl text-2xl font-bold transition-all duration-200 shadow-lg border border-blue-400"
        aria-label="西へ移動"
      >
        ⬅️
      </button>
      <button
        onClick={gameStarted ? togglePause : startGame}
        className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white p-4 rounded-xl text-lg font-bold transition-all duration-200 shadow-lg border border-amber-400"
        aria-label={gameStarted ? (isPaused ? "冒険再開" : "冒険一時停止") : "冒険開始"}
      >
        {gameStarted ? (isPaused ? "▶️" : "⏸️") : "🐉"}
      </button>
      <button
        onClick={() => changeDirection('RIGHT')}
        className="bg-gradient-to-l from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 text-white p-4 rounded-xl text-2xl font-bold transition-all duration-200 shadow-lg border border-blue-400"
        aria-label="東へ移動"
      >
        ➡️
      </button>
      <div></div>
      <button
        onClick={() => changeDirection('DOWN')}
        className="bg-gradient-to-t from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 text-white p-4 rounded-xl text-2xl font-bold transition-all duration-200 shadow-lg border border-blue-400"
        aria-label="南へ移動"
      >
        ⬇️
      </button>
      <div></div>
    </div>
  );

  // 説明モーダル
  const InstructionsModal = () => (
    showInstructions && (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-amber-100 to-orange-200 rounded-xl p-6 max-w-md w-full border-4 border-amber-500 shadow-2xl">
          <h2 className="text-3xl font-bold mb-4 text-amber-800 text-center">🐉 冒険者の手引き 🐉</h2>
          <div className="space-y-3 text-amber-900">
            <p><strong>🎯 使命：</strong> あなたのドラゴンを操り、洞窟の宝物を集めよう！</p>
            <p><strong>🎮 操作方法：</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>矢印キー または WASD でドラゴンを操作</li>
              <li>スペースキーで冒険開始/一時停止</li>
              <li>Escキーでこの手引きを表示</li>
            </ul>
            <p><strong>⚔️ 冒険のルール：</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>洞窟の壁や自分の体にぶつかると冒険終了</li>
              <li>宝物を集めるとドラゴンが成長し、経験値獲得</li>
              <li>レベルが上がると移動速度が向上</li>
            </ul>
            <p><strong>💎 宝物の種類：</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>💎 魔法の宝石 (50G) | 👑 黄金の王冠 (100G)</li>
              <li>🧪 秘薬 (75G) | 📜 古代の巻物 (125G)</li>
            </ul>
          </div>
          <button
            onClick={() => setShowInstructions(false)}
            className="mt-6 w-full bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-500 hover:to-orange-600 text-white py-3 px-4 rounded-lg font-bold transition-all duration-200 shadow-lg"
          >
            冒険に戻る
          </button>
        </div>
      </div>
    )
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-300 to-orange-500 bg-clip-text text-transparent mb-2">
            🐉 ドラゴンアドベンチャー 🏰
          </h1>
          <p className="text-amber-200">伝説のドラゴンとなり、古の宝物を集めよ</p>
        </div>

        {/* ステータスパネル */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-r from-amber-600 to-yellow-700 p-4 rounded-xl border border-amber-400 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-amber-100">💰 ゴールド</span>
              <span className="text-2xl font-bold text-white">{gold}</span>
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 rounded-xl border border-blue-400 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-blue-100">⭐ レベル</span>
              <span className="text-2xl font-bold text-white">{level}</span>
            </div>
            <div className="mt-2 bg-blue-800 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-300 to-cyan-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((experience % 200) / 200) * 100}%` }}
              />
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-600 to-pink-700 p-4 rounded-xl border border-purple-400 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-purple-100">🏆 最高記録</span>
              <span className="text-2xl font-bold text-white">{highScore}</span>
            </div>
          </div>
        </div>

        {/* 現在の宝物情報 */}
        {gameStarted && (
          <div className="text-center mb-4">
            <div className="inline-block bg-gradient-to-r from-amber-700 to-orange-800 px-6 py-2 rounded-full border border-amber-500 shadow-lg">
              <span className="text-amber-100">次の宝物: </span>
              <span className="text-xl">{treasureTypes[treasureType].symbol}</span>
              <span className="text-amber-200 ml-2">{treasureTypes[treasureType].name}</span>
              <span className="text-yellow-300 ml-2 font-bold">
                {Math.floor(treasureTypes[treasureType].points * DIFFICULTY_SETTINGS[difficulty].multiplier)}G
              </span>
            </div>
          </div>
        )}

        {/* 難易度設定 */}
        {!gameStarted && (
          <div className="mb-6 text-center">
            <label className="block text-amber-200 font-bold mb-3 text-lg">⚔️ 冒険者ランク選択:</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="bg-gradient-to-r from-slate-700 to-slate-800 text-white p-3 rounded-lg border border-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-lg font-medium"
              aria-label="冒険者ランク選択"
            >
              {Object.entries(DIFFICULTY_SETTINGS).map(([key, settings]) => (
                <option key={key} value={key} className="bg-slate-800">
                  {settings.name} (経験値 x{settings.multiplier})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* ゲームボード */}
        <div className="relative mb-6">
          <div
            className="grid gap-1 p-4 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border-4 border-amber-600 shadow-2xl mx-auto"
            style={{
              gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
              width: 'min(90vw, 500px)',
              height: 'min(90vw, 500px)'
            }}
            role="grid"
            aria-label="冒険の洞窟"
          >
            {grid.map((row, y) =>
              row.map((cell, x) => (
                <div
                  key={`${x}-${y}`}
                  className={`aspect-square rounded-sm ${getCellStyle(cell)} transition-all duration-200`}
                  role="gridcell"
                  aria-label={
                    cell === 2 ? 'ドラゴンの頭' :
                    cell === 1 ? 'ドラゴンの体' :
                    cell === 3 ? `宝物: ${treasureTypes[treasureType].name}` :
                    '洞窟の床'
                  }
                />
              ))
            )}
          </div>

          {/* ゲーム状態オーバーレイ */}
          {!gameStarted && !gameOver && (
            <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center rounded-xl">
              <div className="text-center text-white">
                <div className="text-6xl mb-4">🐉</div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-300 to-orange-500 bg-clip-text text-transparent mb-4">
                  ドラゴンアドベンチャー
                </h2>
                <p className="text-amber-200 mb-4">スペースキーまたは下のボタンで冒険開始</p>
              </div>
            </div>
          )}

          {isPaused && gameStarted && (
            <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center rounded-xl">
              <div className="text-center text-white">
                <div className="text-6xl mb-4">⏸️</div>
                <h2 className="text-3xl font-bold text-amber-300 mb-4">冒険一時停止</h2>
                <p className="text-amber-200">スペースキーで冒険再開</p>
              </div>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center rounded-xl">
              <div className="text-center text-white">
                <div className="text-6xl mb-4">💀</div>
                <h2 className="text-3xl font-bold text-red-400 mb-4">冒険終了！</h2>
                <p className="text-xl mb-2">獲得ゴールド: <span className="text-yellow-400 font-bold">{gold}</span></p>
                <p className="text-xl mb-4">到達レベル: <span className="text-blue-400 font-bold">{level}</span></p>
                {gold === highScore && gold > 0 && (
                  <p className="text-yellow-300 font-bold mb-4">🎉 新記録達成！ 🎉</p>
                )}
                {achievements.length > 0 && (
                  <div className="mb-4">
                    <p className="text-amber-300 font-bold">🏆 獲得実績:</p>
                    <div className="flex flex-wrap justify-center gap-2 mt-2">
                      {achievements.map(achievement => (
                        <span key={achievement} className="bg-amber-600 px-2 py-1 rounded text-sm">
                          {achievement === 'goldCollector' && '💰 黄金収集家'}
                          {achievement === 'levelMaster' && '⭐ レベルマスター'}
                          {achievement === 'longDragon' && '🐉 巨大ドラゴン'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* コントロールボタン */}
        <div className="flex flex-wrap gap-3 justify-center mb-6">
          <button
            onClick={gameStarted ? togglePause : startGame}
            className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 text-white py-3 px-8 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg border border-green-400"
          >
            {gameStarted ? (isPaused ? '⚔️ 冒険再開' : '🛡️ 一時停止') : '🐉 冒険開始'}
          </button>
          <button
            onClick={resetGame}
            className="bg-gradient-to-r from-red-600 to-pink-700 hover:from-red-500 hover:to-pink-600 text-white py-3 px-8 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg border border-red-400"
          >
            🔄 新たな冒険
          </button>
          <button
            onClick={() => setShowInstructions(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white py-3 px-8 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg border border-blue-400"
          >
            📜 冒険者の手引き
          </button>
        </div>

        {/* タッチコントロール */}
        <div className="md:hidden">
          <h3 className="text-center text-amber-200 font-bold mb-3 text-lg">🎮 ドラゴン操作</h3>
          <TouchControls />
        </div>

        {/* キーボードヒント */}
        <div className="hidden md:block text-center text-slate-400 text-sm mt-6">
          <p>⌨️ 矢印キー or WASD: ドラゴン操作 | スペース: 開始/一時停止 | Esc: 手引き表示</p>
        </div>

        <InstructionsModal />
      </div>
    </div>
  );
};

export default RPGDragonGame;
