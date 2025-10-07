import React, { useState, useEffect, useRef } from 'react';

const FatBurningTypingGame = () => {
  const sentences = [
    "今日はとても良い天気です。",
    "プログラミングは楽しいですね。",
    "毎日少しずつ練習することが大切です。",
    "タイピングの速度を上げましょう。",
    "美しい桜の花が咲いています。",
    "新しいことに挑戦するのは素晴らしい。",
    "継続は力なりという言葉があります。",
    "日本語のタイピングは難しいですか。"
  ];

  const [currentSentence, setCurrentSentence] = useState(sentences[0]);
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [wpm, setWpm] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [correctChars, setCorrectChars] = useState(0);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [fatPercentage, setFatPercentage] = useState(100); // 100% = 太っている状態
  const [showBurnEffect, setShowBurnEffect] = useState(false);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [bodyType, setBodyType] = useState('太め');
  const inputRef = useRef(null);

  const getBodyTypeInfo = (fat) => {
    if (fat <= 20) return { type: 'マッチョ', emoji: '💪', color: '#10b981', message: '完璧な筋肉美！' };
    if (fat <= 40) return { type: 'スリム', emoji: '🏃', color: '#3b82f6', message: '理想的な体型！' };
    if (fat <= 60) return { type: '標準', emoji: '🚶', color: '#f59e0b', message: '健康的な体型！' };
    if (fat <= 80) return { type: 'ぽっちゃり', emoji: '🍔', color: '#f97316', message: 'もう少し運動しよう！' };
    return { type: '太め', emoji: '🍕', color: '#ef4444', message: '脂肪燃焼開始！' };
  };

  const getMotivationMessage = (wpm, fat) => {
    if (wpm >= 200) return '🔥 超高速タイピング！脂肪が溶けていく！';
    if (wpm >= 150) return '💨 素晴らしいスピード！カロリー大量消費中！';
    if (wpm >= 100) return '⚡ 良いペース！脂肪がどんどん燃えてる！';
    if (wpm >= 50) return '🏃 タイピングで有酸素運動！';
    if (fat <= 30) return '🎉 素晴らしい体型をキープ！';
    return '💪 タイピングでダイエット開始！';
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentSentence]);

  useEffect(() => {
    if (startTime && userInput.length > 0) {
      const elapsedMinutes = (Date.now() - startTime) / 60000;
      const calculatedWpm = Math.round(correctChars / elapsedMinutes) || 0;
      setWpm(calculatedWpm);
      
      // WPMに基づいて脂肪を減らす（速ければ速いほど燃焼）
      if (calculatedWpm > 0) {
        const burnRate = calculatedWpm / 1000; // WPMが高いほど多く燃焼
        setFatPercentage(prev => Math.max(0, prev - burnRate));
      }
    }
  }, [userInput, startTime, correctChars]);

  useEffect(() => {
    const bodyInfo = getBodyTypeInfo(fatPercentage);
    setBodyType(bodyInfo.type);
  }, [fatPercentage]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    
    if (!startTime) {
      setStartTime(Date.now());
    }

    setUserInput(value);

    let correct = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] === currentSentence[i]) {
        correct++;
      }
    }
    setCorrectChars(correct);

    if (value === currentSentence) {
      setIsComplete(true);
      setTotalCompleted(prev => prev + 1);
      
      // 完了時に大きく脂肪燃焼
      const bonus = Math.min(5, 100 - fatPercentage); // 残りの脂肪に応じてボーナス
      setFatPercentage(prev => Math.max(0, prev - bonus));
      setCaloriesBurned(prev => prev + Math.round(wpm / 2));
      
      setShowBurnEffect(true);
      setTimeout(() => setShowBurnEffect(false), 1500);
    } else {
      setIsComplete(false);
    }
  };

  const getNextSentence = () => {
    const currentIndex = sentences.indexOf(currentSentence);
    const nextIndex = (currentIndex + 1) % sentences.length;
    setCurrentSentence(sentences[nextIndex]);
    setUserInput('');
    setStartTime(null);
    setWpm(0);
    setIsComplete(false);
    setCorrectChars(0);
  };

  const restart = () => {
    setUserInput('');
    setStartTime(null);
    setWpm(0);
    setIsComplete(false);
    setCorrectChars(0);
    inputRef.current?.focus();
  };

  const renderText = () => {
    return currentSentence.split('').map((char, index) => {
      let color = '#94a3b8';
      
      if (index < userInput.length) {
        if (userInput[index] === char) {
          color = '#10b981';
        } else {
          color = '#ef4444';
        }
      }

      return (
        <span
          key={index}
          style={{
            color: color,
            fontSize: '2rem',
            fontWeight: '500',
            transition: 'color 0.1s'
          }}
        >
          {char}
        </span>
      );
    });
  };

  const renderBody = () => {
    const bodyInfo = getBodyTypeInfo(fatPercentage);
    const bellySize = 80 + (fatPercentage * 1.2); // 80-200px
    const shoulderWidth = 120 + (fatPercentage * 0.5); // 120-170px
    
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative'
      }}>
        {/* 頭 */}
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#fbbf24',
          marginBottom: '5px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem'
        }}>
          😊
        </div>
        
        {/* 体 */}
        <div style={{
          width: `${shoulderWidth}px`,
          height: '100px',
          backgroundColor: '#3b82f6',
          borderRadius: '15px 15px 0 0',
          position: 'relative',
          transition: 'all 0.5s ease'
        }}>
          {/* お腹 */}
          <div style={{
            position: 'absolute',
            bottom: '-50px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: `${bellySize}px`,
            height: `${bellySize}px`,
            backgroundColor: '#fbbf24',
            borderRadius: '50%',
            transition: 'all 0.5s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            boxShadow: showBurnEffect ? '0 0 30px rgba(239, 68, 68, 0.8)' : 'none'
          }}>
            {showBurnEffect && (
              <>
                <span style={{ position: 'absolute', top: '-20px', fontSize: '1.5rem', animation: 'float 1s ease' }}>🔥</span>
                <span style={{ position: 'absolute', bottom: '-20px', fontSize: '1.5rem', animation: 'float 1s ease' }}>💨</span>
                <span style={{ position: 'absolute', left: '-20px', fontSize: '1.5rem', animation: 'float 1s ease' }}>⚡</span>
                <span style={{ position: 'absolute', right: '-20px', fontSize: '1.5rem', animation: 'float 1s ease' }}>✨</span>
              </>
            )}
            {bodyInfo.emoji}
          </div>
        </div>
        
        {/* 脚 */}
        <div style={{
          display: 'flex',
          gap: '20px',
          marginTop: `${bellySize - 30}px`
        }}>
          <div style={{
            width: '30px',
            height: '80px',
            backgroundColor: '#1e40af',
            borderRadius: '0 0 10px 10px',
            transition: 'all 0.5s ease'
          }}></div>
          <div style={{
            width: '30px',
            height: '80px',
            backgroundColor: '#1e40af',
            borderRadius: '0 0 10px 10px',
            transition: 'all 0.5s ease'
          }}></div>
        </div>
      </div>
    );
  };

  const bodyInfo = getBodyTypeInfo(fatPercentage);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1100px',
        width: '100%',
        backgroundColor: 'white',
        borderRadius: '24px',
        padding: '48px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          textAlign: 'center',
          marginBottom: '8px',
          background: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          🔥 脂肪燃焼タイピング 🔥
        </h1>

        <div style={{
          textAlign: 'center',
          fontSize: '1rem',
          color: '#64748b',
          marginBottom: '24px',
          fontWeight: '600'
        }}>
          タイピングで脂肪を燃やせ！速く打つほど痩せていく！
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '300px 1fr',
          gap: '32px',
          marginBottom: '32px'
        }}>
          {/* 左側：キャラクター表示 */}
          <div style={{
            backgroundColor: '#f8fafc',
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            border: `3px solid ${bodyInfo.color}`
          }}>
            <div style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              color: bodyInfo.color,
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              体型: {bodyInfo.type}
            </div>
            
            {renderBody()}
            
            <div style={{
              marginTop: '24px',
              textAlign: 'center',
              fontSize: '0.875rem',
              color: '#64748b'
            }}>
              {bodyInfo.message}
            </div>
          </div>

          {/* 右側：統計情報 */}
          <div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div style={{
                textAlign: 'center',
                padding: '16px',
                backgroundColor: '#dbeafe',
                borderRadius: '12px',
                border: '2px solid #3b82f6'
              }}>
                <div style={{ fontSize: '0.75rem', color: '#1e40af', marginBottom: '4px' }}>
                  タイピング速度
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1e40af' }}>
                  {wpm}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#3b82f6' }}>WPM</div>
              </div>
              
              <div style={{
                textAlign: 'center',
                padding: '16px',
                backgroundColor: '#fee2e2',
                borderRadius: '12px',
                border: '2px solid #ef4444'
              }}>
                <div style={{ fontSize: '0.75rem', color: '#991b1b', marginBottom: '4px' }}>
                  消費カロリー
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#991b1b' }}>
                  {caloriesBurned}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#ef4444' }}>kcal</div>
              </div>

              <div style={{
                textAlign: 'center',
                padding: '16px',
                backgroundColor: '#fef3c7',
                borderRadius: '12px',
                border: '2px solid #f59e0b'
              }}>
                <div style={{ fontSize: '0.75rem', color: '#92400e', marginBottom: '4px' }}>
                  体脂肪率
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#92400e' }}>
                  {Math.round(fatPercentage)}%
                </div>
                <div style={{ fontSize: '0.7rem', color: '#f59e0b' }}>残り脂肪</div>
              </div>

              <div style={{
                textAlign: 'center',
                padding: '16px',
                backgroundColor: '#e9d5ff',
                borderRadius: '12px',
                border: '2px solid #a855f7'
              }}>
                <div style={{ fontSize: '0.75rem', color: '#6b21a8', marginBottom: '4px' }}>
                  完了数
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#6b21a8' }}>
                  {totalCompleted}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#a855f7' }}>文章</div>
              </div>
            </div>

            {/* 脂肪燃焼バー */}
            <div style={{
              backgroundColor: '#f8fafc',
              padding: '16px',
              borderRadius: '12px',
              marginBottom: '16px',
              border: '2px solid #e2e8f0'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}>
                <span style={{ color: '#64748b' }}>🔥 脂肪燃焼進捗</span>
                <span style={{ color: '#ef4444' }}>{Math.round(100 - fatPercentage)}%</span>
              </div>
              <div style={{
                width: '100%',
                height: '24px',
                backgroundColor: '#fee2e2',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '2px solid #ef4444'
              }}>
                <div style={{
                  width: `${100 - fatPercentage}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #ef4444 0%, #f97316 100%)',
                  transition: 'width 0.5s ease',
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: '8px'
                }}>
                  {(100 - fatPercentage) > 10 && (
                    <span style={{ color: 'white', fontSize: '0.75rem', fontWeight: '700' }}>
                      🔥 燃焼中
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* モチベーションメッセージ */}
            <div style={{
              padding: '16px',
              background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
              borderRadius: '12px',
              textAlign: 'center',
              fontSize: '1rem',
              fontWeight: '700',
              color: '#92400e',
              border: '2px solid #f59e0b'
            }}>
              {getMotivationMessage(wpm, fatPercentage)}
            </div>
          </div>
        </div>

        {/* タイピングエリア */}
        <div style={{
          backgroundColor: '#f8fafc',
          padding: '32px',
          borderRadius: '16px',
          marginBottom: '24px',
          minHeight: '100px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: '1.8',
          letterSpacing: '0.05em',
          border: '3px solid #e2e8f0'
        }}>
          {renderText()}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={handleInputChange}
          disabled={isComplete}
          placeholder="ここに入力して脂肪を燃やそう！"
          style={{
            width: '100%',
            fontSize: '1.5rem',
            padding: '20px 24px',
            borderRadius: '12px',
            border: isComplete ? '2px solid #10b981' : '2px solid #e2e8f0',
            marginBottom: '24px',
            fontFamily: 'inherit',
            outline: 'none',
            transition: 'all 0.2s',
            backgroundColor: isComplete ? '#f0fdf4' : 'white'
          }}
          onFocus={(e) => e.target.style.borderColor = '#f97316'}
          onBlur={(e) => e.target.style.borderColor = isComplete ? '#10b981' : '#e2e8f0'}
        />

        {isComplete && (
          <div style={{
            background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '24px',
            textAlign: 'center',
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#065f46',
            border: '2px solid #10b981'
          }}>
            ✨ 完璧！脂肪が燃焼しました！次の文章で更に燃やそう！ 🔥
          </div>
        )}

        <div style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'center'
        }}>
          <button
            onClick={restart}
            style={{
              padding: '14px 32px',
              fontSize: '1rem',
              fontWeight: '600',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: '#64748b',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(100, 116, 139, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#475569';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#64748b';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            🔄 やり直す
          </button>
          <button
            onClick={getNextSentence}
            style={{
              padding: '14px 32px',
              fontSize: '1rem',
              fontWeight: '600',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
            }}
          >
            次の運動 🔥
          </button>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(-20px); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default FatBurningTypingGame;
