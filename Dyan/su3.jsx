import React, { useState, useEffect, useRef } from 'react';

const TypingGame = () => {
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
  const [comboCount, setComboCount] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');
  const inputRef = useRef(null);

  // お祝いメッセージのバリエーション
  const celebrationPhrases = [
    "素晴らしい！🎉",
    "完璧です！✨",
    "すごい！👏",
    "お見事！🎊",
    "ナイスタイピング！🔥",
    "最高です！⭐",
    "天才！🌟",
    "プロ級！👑"
  ];

  // リアクションメッセージ
  const getReaction = (combo, completed) => {
    if (combo >= 20) return "タイピングの神様降臨！🎭👑";
    if (combo >= 15) return "超人的なスピード！🚀";
    if (combo >= 10) return "コンボマスター！🔥";
    if (combo >= 5) return "いい調子です！⚡";
    if (completed >= 10) return "タイピング上級者！🌟";
    if (completed >= 5) return "頑張ってますね！💪";
    return "さあ、始めましょう！😊";
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentSentence]);

  useEffect(() => {
    if (startTime && userInput.length > 0) {
      const elapsedMinutes = (Date.now() - startTime) / 60000;
      const calculatedWpm = Math.round(correctChars / elapsedMinutes) || 0;
      setWpm(calculatedWpm);
    }
  }, [userInput, startTime, correctChars]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    
    if (!startTime) {
      setStartTime(Date.now());
    }

    const prevLength = userInput.length;
    setUserInput(value);

    // Count correct characters and check combo
    let correct = 0;
    let currentCombo = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] === currentSentence[i]) {
        correct++;
        currentCombo++;
      } else {
        currentCombo = 0;
      }
    }
    
    setCorrectChars(correct);
    setComboCount(currentCombo);
    
    // Update max combo
    if (currentCombo > maxCombo) {
      setMaxCombo(currentCombo);
    }

    // Check if completed
    if (value === currentSentence) {
      setIsComplete(true);
      setTotalCompleted(prev => prev + 1);
      
      // Show celebration
      const randomPhrase = celebrationPhrases[Math.floor(Math.random() * celebrationPhrases.length)];
      setCelebrationMessage(randomPhrase);
      setShowCelebration(true);
      
      setTimeout(() => {
        setShowCelebration(false);
      }, 2000);
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
    setComboCount(0);
  };

  const restart = () => {
    setUserInput('');
    setStartTime(null);
    setWpm(0);
    setIsComplete(false);
    setCorrectChars(0);
    setComboCount(0);
    inputRef.current?.focus();
  };

  const renderText = () => {
    return currentSentence.split('').map((char, index) => {
      let color = '#94a3b8';
      let scale = 1;
      let glow = false;
      
      if (index < userInput.length) {
        if (userInput[index] === char) {
          color = '#10b981';
          if (index === userInput.length - 1 && comboCount >= 5) {
            scale = 1.2;
            glow = true;
          }
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
            transform: `scale(${scale})`,
            display: 'inline-block',
            transition: 'all 0.1s',
            textShadow: glow ? '0 0 10px rgba(16, 185, 129, 0.8)' : 'none'
          }}
        >
          {char}
        </span>
      );
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Celebration Overlay */}
      {showCelebration && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.3s'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '24px',
            padding: '60px',
            textAlign: 'center',
            border: '4px solid #fbbf24',
            animation: 'bounceIn 0.5s'
          }}>
            <div style={{ fontSize: '5rem', marginBottom: '20px' }}>
              🎉
            </div>
            <h2 style={{
              fontSize: '3rem',
              fontWeight: '800',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '20px'
            }}>
              {celebrationMessage}
            </h2>
            <div style={{ fontSize: '1.5rem', color: '#64748b' }}>
              {wpm} WPM達成！
            </div>
          </div>
        </div>
      )}

      <div style={{
        maxWidth: '900px',
        width: '100%',
        backgroundColor: 'white',
        borderRadius: '24px',
        padding: '48px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        border: maxCombo >= 10 ? '4px solid #fbbf24' : '4px solid transparent',
        transition: 'border 0.3s'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          textAlign: 'center',
          marginBottom: '8px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          日本語タイピング
        </h1>

        <div style={{
          textAlign: 'center',
          fontSize: '0.875rem',
          color: '#64748b',
          marginBottom: '24px'
        }}>
          💡 連続正解でコンボボーナス！
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <div style={{
            textAlign: 'center',
            padding: '16px',
            backgroundColor: '#dbeafe',
            borderRadius: '12px',
            border: '2px solid #3b82f6'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#1e40af', marginBottom: '4px' }}>
              WPM
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e40af' }}>
              {wpm}
            </div>
          </div>
          
          <div style={{
            textAlign: 'center',
            padding: '16px',
            backgroundColor: comboCount >= 5 ? '#fef3c7' : '#f1f5f9',
            borderRadius: '12px',
            border: comboCount >= 5 ? '2px solid #f59e0b' : '2px solid #e2e8f0',
            animation: comboCount >= 5 ? 'pulse 1s infinite' : 'none'
          }}>
            <div style={{ fontSize: '0.75rem', color: comboCount >= 5 ? '#92400e' : '#64748b', marginBottom: '4px' }}>
              コンボ
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: comboCount >= 5 ? '#92400e' : '#1e293b' }}>
              {comboCount}🔥
            </div>
          </div>

          <div style={{
            textAlign: 'center',
            padding: '16px',
            backgroundColor: '#fce7f3',
            borderRadius: '12px',
            border: '2px solid #ec4899'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#9f1239', marginBottom: '4px' }}>
              最大コンボ
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#9f1239' }}>
              {maxCombo}
            </div>
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
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#6b21a8' }}>
              {totalCompleted}
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#f8fafc',
          padding: '32px',
          borderRadius: '16px',
          marginBottom: '32px',
          minHeight: '100px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: '1.8',
          letterSpacing: '0.05em',
          border: comboCount >= 10 ? '3px solid #fbbf24' : '3px solid transparent',
          transition: 'border 0.3s'
        }}>
          {renderText()}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={handleInputChange}
          disabled={isComplete}
          placeholder="ここに入力してください..."
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
          onFocus={(e) => e.target.style.borderColor = '#667eea'}
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
            ✨ 完璧です！次の文章に挑戦しましょう！✨
          </div>
        )}

        {comboCount >= 10 && !isComplete && (
          <div style={{
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '24px',
            textAlign: 'center',
            fontSize: '1rem',
            fontWeight: '700',
            color: '#92400e',
            border: '2px solid #f59e0b',
            animation: 'pulse 1s infinite'
          }}>
            🔥 {comboCount}連続正解！調子いいですね！ 🔥
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
            やり直す
          </button>
          <button
            onClick={getNextSentence}
            style={{
              padding: '14px 32px',
              fontSize: '1rem',
              fontWeight: '600',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
            }}
          >
            次の文章 →
          </button>
        </div>

        <div style={{
          marginTop: '32px',
          padding: '20px',
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          borderRadius: '12px',
          textAlign: 'center',
          border: '2px solid #fbbf24'
        }}>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#92400e',
            marginBottom: '8px'
          }}>
            {getReaction(maxCombo, totalCompleted)}
          </div>
          <div style={{
            fontSize: '0.875rem',
            color: '#78350f'
          }}>
            <strong>ヒント：</strong> 連続で正しく入力するとコンボが増えます！
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default TypingGame;
