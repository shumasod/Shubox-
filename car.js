import React, { useState, useEffect } from 'react';
import { AlertCircle, Car, Clock, Star } from 'lucide-react';

const ParkingGame = () => {
  const [gameState, setGameState] = useState('start'); // start, playing, gameover
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [level, setLevel] = useState(1);
  const [parkingSpots, setParkingSpots] = useState([]);
  const [combo, setCombo] = useState(0);
  const [message, setMessage] = useState('');

  // 駐車スポット生成
  const generateParkingSpots = (levelNum) => {
    const spots = [];
    const numSpots = Math.min(12, 6 + levelNum * 2);
    const illegalRatio = Math.min(0.6, 0.3 + levelNum * 0.05);
    
    for (let i = 0; i < numSpots; i++) {
      const isIllegal = Math.random() < illegalRatio;
      spots.push({
        id: i,
        isIllegal,
        caught: false,
        violation: isIllegal ? getRandomViolation() : null,
        color: getRandomCarColor()
      });
    }
    return spots;
  };

  const getRandomViolation = () => {
    const violations = [
      '駐車禁止エリア',
      '時間オーバー',
      '二重駐車',
      '消火栓前',
      '車庫証明なし'
    ];
    return violations[Math.floor(Math.random() * violations.length)];
  };

  const getRandomCarColor = () => {
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // ゲーム開始
  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setTimeLeft(60);
    setLevel(1);
    setCombo(0);
    setParkingSpots(generateParkingSpots(1));
  };

  // 車をクリック
  const handleCarClick = (spot) => {
    if (spot.caught) return;

    const newSpots = parkingSpots.map(s => 
      s.id === spot.id ? { ...s, caught: true } : s
    );
    setParkingSpots(newSpots);

    if (spot.isIllegal) {
      // 正解！
      const points = 100 + (combo * 20);
      setScore(prev => prev + points);
      setCombo(prev => prev + 1);
      setMessage(`🎯 成敗成功！ +${points}点 (${spot.violation})`);
      
      // 全ての違法駐車を取り締まったら次のレベル
      const remainingIllegal = newSpots.filter(s => s.isIllegal && !s.caught).length;
      if (remainingIllegal === 0) {
        setTimeout(() => {
          setLevel(prev => prev + 1);
          setParkingSpots(generateParkingSpots(level + 1));
          setTimeLeft(prev => prev + 15);
          setMessage('🎊 レベルアップ！ +15秒ボーナス');
        }, 500);
      }
    } else {
      // 誤取締！
      setScore(prev => Math.max(0, prev - 50));
      setCombo(0);
      setMessage('❌ 合法駐車です！ -50点');
    }

    setTimeout(() => setMessage(''), 2000);
  };

  // タイマー
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameState('gameover');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState, timeLeft]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            🚓 無断駐車成敗ゲーム 🚗
          </h1>
          <p className="text-gray-300">違法駐車を見つけて取り締まろう！</p>
        </div>

        {gameState === 'start' && (
          <div className="bg-white rounded-lg shadow-2xl p-8 text-center">
            <Car className="w-24 h-24 mx-auto mb-4 text-blue-600" />
            <h2 className="text-3xl font-bold mb-4">ゲームルール</h2>
            <div className="text-left max-w-md mx-auto mb-6 space-y-2">
              <p>✅ 違法駐車の車をクリックして取り締まる</p>
              <p>✅ 連続で成功するとコンボボーナス</p>
              <p>❌ 合法駐車を取り締まるとペナルティ</p>
              <p>⏱️ 制限時間内に高得点を目指せ！</p>
            </div>
            <button
              onClick={startGame}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-colors"
            >
              ゲームスタート
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <>
            {/* スコアボード */}
            <div className="bg-white rounded-lg shadow-lg p-4 mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-gray-600 text-sm">スコア</div>
                <div className="text-3xl font-bold text-blue-600">{score}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-600 text-sm flex items-center justify-center gap-1">
                  <Clock className="w-4 h-4" />
                  残り時間
                </div>
                <div className={`text-3xl font-bold ${timeLeft <= 10 ? 'text-red-600 animate-pulse' : 'text-green-600'}`}>
                  {timeLeft}秒
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-600 text-sm">レベル</div>
                <div className="text-3xl font-bold text-purple-600">{level}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-600 text-sm flex items-center justify-center gap-1">
                  <Star className="w-4 h-4" />
                  コンボ
                </div>
                <div className="text-3xl font-bold text-orange-600">{combo}</div>
              </div>
            </div>

            {/* メッセージ */}
            {message && (
              <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4 rounded animate-pulse">
                <p className="text-yellow-800 font-bold text-center">{message}</p>
              </div>
            )}

            {/* 駐車場 */}
            <div className="bg-gray-700 rounded-lg shadow-2xl p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {parkingSpots.map(spot => (
                  <button
                    key={spot.id}
                    onClick={() => handleCarClick(spot)}
                    disabled={spot.caught}
                    className={`relative p-6 rounded-lg transition-all transform hover:scale-105 ${
                      spot.caught 
                        ? 'opacity-30 cursor-not-allowed' 
                        : 'hover:shadow-xl cursor-pointer'
                    }`}
                    style={{ 
                      backgroundColor: spot.caught ? '#444' : '#fff',
                      border: spot.isIllegal && !spot.caught ? '3px dashed red' : '3px solid #ddd'
                    }}
                  >
                    <div className="flex flex-col items-center">
                      <Car 
                        className="w-16 h-16 mb-2" 
                        style={{ color: spot.caught ? '#666' : spot.color }}
                      />
                      {spot.isIllegal && !spot.caught && (
                        <div className="flex items-center gap-1 text-red-600 text-xs font-bold">
                          <AlertCircle className="w-4 h-4" />
                          {spot.violation}
                        </div>
                      )}
                      {spot.caught && (
                        <div className="text-gray-600 font-bold">
                          {spot.isIllegal ? '✅ 成敗済み' : '❌ 誤取締'}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {gameState === 'gameover' && (
          <div className="bg-white rounded-lg shadow-2xl p-8 text-center">
            <h2 className="text-4xl font-bold mb-4">ゲーム終了！</h2>
            <div className="text-6xl font-bold text-blue-600 mb-4">{score}</div>
            <p className="text-xl text-gray-600 mb-2">最終スコア</p>
            <p className="text-lg text-gray-600 mb-6">到達レベル: {level}</p>
            
            <div className="mb-6">
              {score >= 1000 && <p className="text-2xl">🏆 駐車監視員マスター！</p>}
              {score >= 500 && score < 1000 && <p className="text-2xl">🥈 優秀な取締官！</p>}
              {score < 500 && <p className="text-2xl">📝 まだまだ修行が必要！</p>}
            </div>

            <button
              onClick={startGame}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-colors"
            >
              もう一度プレイ
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParkingGame;
