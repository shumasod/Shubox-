import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// =============================================================================
// 定数定義
// =============================================================================
const SENTENCES = [
  "今日はとても良い天気です。",
  "プログラミングは楽しいですね。",
  "毎日少しずつ練習することが大切です。",
  "タイピングの速度を上げましょう。",
  "美しい桜の花が咲いています。",
  "新しいことに挑戦するのは素晴らしい。",
  "継続は力なりという言葉があります。",
  "日本語のタイピングは難しいですか。"
];

const BODY_TYPES = [
  { maxFat: 20, type: 'マッチョ', emoji: '💪', color: '#10b981', message: '完璧な筋肉美！' },
  { maxFat: 40, type: 'スリム', emoji: '🏃', color: '#3b82f6', message: '理想的な体型！' },
  { maxFat: 60, type: '標準', emoji: '🚶', color: '#f59e0b', message: '健康的な体型！' },
  { maxFat: 80, type: 'ぽっちゃり', emoji: '🍔', color: '#f97316', message: 'もう少し運動しよう！' },
  { maxFat: 100, type: '太め', emoji: '🍕', color: '#ef4444', message: '脂肪燃焼開始！' }
];

const MOTIVATION_MESSAGES = [
  { minWpm: 200, message: '🔥 超高速タイピング！脂肪が溶けていく！' },
  { minWpm: 150, message: '💨 素晴らしいスピード！カロリー大量消費中！' },
  { minWpm: 100, message: '⚡ 良いペース！脂肪がどんどん燃えてる！' },
  { minWpm: 50, message: '🏃 タイピングで有酸素運動！' },
  { minWpm: 0, message: '💪 タイピングでダイエット開始！' }
];

const INITIAL_FAT_PERCENTAGE = 100;
const BURN_EFFECT_DURATION = 1500;
const BURN_RATE_DIVISOR = 1000;
const COMPLETION_BONUS_MAX = 5;

// =============================================================================
// ユーティリティ関数
// =============================================================================
const getBodyTypeInfo = (fatPercentage) => {
  return BODY_TYPES.find(({ maxFat }) => fatPercentage <= maxFat) || BODY_TYPES[BODY_TYPES.length - 1];
};

const getMotivationMessage = (wpm, fatPercentage) => {
  if (fatPercentage <= 30) return '🎉 素晴らしい体型をキープ！';
  return MOTIVATION_MESSAGES.find(({ minWpm }) => wpm >= minWpm)?.message || MOTIVATION_MESSAGES[MOTIVATION_MESSAGES.length - 1].message;
};

const calculateCorrectChars = (input, target) => {
  let correct = 0;
  for (let i = 0; i < input.length; i++) {
    if (input[i] === target[i]) correct++;
  }
  return correct;
};

const calculateWpm = (startTime, correctChars) => {
  if (!startTime || correctChars === 0) return 0;
  const elapsedMinutes = (Date.now() - startTime) / 60000;
  return Math.round(correctChars / elapsedMinutes) || 0;
};

// =============================================================================
// スタイル定義
// =============================================================================
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  },
  card: {
    maxWidth: '1100px',
    width: '100%',
    backgroundColor: 'white',
    borderRadius: '24px',
    padding: '48px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: '8px',
    background: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  subtitle: {
    textAlign: 'center',
    fontSize: '1rem',
    color: '#64748b',
    marginBottom: '24px',
    fontWeight: '600'
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '300px 1fr',
    gap: '32px',
    marginBottom: '32px'
  },
  typingArea: {
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
  },
  buttonGroup: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center'
  }
};

// =============================================================================
// サブコンポーネント
// =============================================================================

/** 統計カード */
const StatCard = ({ label, value, unit, bgColor, borderColor, textColor }) => (
  <div style={{
    textAlign: 'center',
    padding: '16px',
    backgroundColor: bgColor,
    borderRadius: '12px',
    border: `2px solid ${borderColor}`
  }}>
    <div style={{ fontSize: '0.75rem', color: textColor, marginBottom: '4px' }}>{label}</div>
    <div style={{ fontSize: '2rem', fontWeight: '700', color: textColor }}>{value}</div>
    <div style={{ fontSize: '0.7rem', color: borderColor }}>{unit}</div>
  </div>
);

/** 統計グリッド */
const StatsGrid = ({ wpm, caloriesBurned, fatPercentage, totalCompleted }) => {
  const stats = [
    { label: 'タイピング速度', value: wpm, unit: 'WPM', bgColor: '#dbeafe', borderColor: '#3b82f6', textColor: '#1e40af' },
    { label: '消費カロリー', value: caloriesBurned, unit: 'kcal', bgColor: '#fee2e2', borderColor: '#ef4444', textColor: '#991b1b' },
    { label: '体脂肪率', value: `${Math.round(fatPercentage)}%`, unit: '残り脂肪', bgColor: '#fef3c7', borderColor: '#f59e0b', textColor: '#92400e' },
    { label: '完了数', value: totalCompleted, unit: '文章', bgColor: '#e9d5ff', borderColor: '#a855f7', textColor: '#6b21a8' }
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};

/** 脂肪燃焼プログレスバー */
const FatBurnProgressBar = ({ fatPercentage }) => {
  const burnedPercentage = 100 - fatPercentage;

  return (
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
        <span style={{ color: '#ef4444' }}>{Math.round(burnedPercentage)}%</span>
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
          width: `${burnedPercentage}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #ef4444 0%, #f97316 100%)',
          transition: 'width 0.5s ease',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: '8px'
        }}>
          {burnedPercentage > 10 && (
            <span style={{ color: 'white', fontSize: '0.75rem', fontWeight: '700' }}>
              🔥 燃焼中
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

/** モチベーションメッセージ */
const MotivationBanner = ({ wpm, fatPercentage }) => (
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
);

/** キャラクター表示 */
const CharacterDisplay = ({ fatPercentage, showBurnEffect }) => {
  const bodyInfo = getBodyTypeInfo(fatPercentage);
  const bellySize = 80 + (fatPercentage * 1.2);
  const shoulderWidth = 120 + (fatPercentage * 0.5);

  const burnEffectEmojis = ['🔥', '💨', '⚡', '✨'];
  const positions = [
    { top: '-20px' },
    { bottom: '-20px' },
    { left: '-20px' },
    { right: '-20px' }
  ];

  return (
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

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
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
            {showBurnEffect && burnEffectEmojis.map((emoji, index) => (
              <span
                key={index}
                style={{
                  position: 'absolute',
                  ...positions[index],
                  fontSize: '1.5rem',
                  animation: 'float 1s ease'
                }}
              >
                {emoji}
              </span>
            ))}
            {bodyInfo.emoji}
          </div>
        </div>

        {/* 脚 */}
        <div style={{ display: 'flex', gap: '20px', marginTop: `${bellySize - 30}px` }}>
          {[0, 1].map((i) => (
            <div
              key={i}
              style={{
                width: '30px',
                height: '80px',
                backgroundColor: '#1e40af',
                borderRadius: '0 0 10px 10px',
                transition: 'all 0.5s ease'
              }}
            />
          ))}
        </div>
      </div>

      <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.875rem', color: '#64748b' }}>
        {bodyInfo.message}
      </div>
    </div>
  );
};

/** タイピングテキスト表示 */
const TypingText = ({ sentence, userInput }) => (
  <div>
    {sentence.split('').map((char, index) => {
      let color = '#94a3b8';
      if (index < userInput.length) {
        color = userInput[index] === char ? '#10b981' : '#ef4444';
      }
      return (
        <span
          key={index}
          style={{
            color,
            fontSize: '2rem',
            fontWeight: '500',
            transition: 'color 0.1s'
          }}
        >
          {char}
        </span>
      );
    })}
  </div>
);

/** 入力フィールド */
const TypingInput = React.forwardRef(({ value, onChange, disabled, isComplete }, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  const getBorderColor = () => {
    if (isComplete) return '#10b981';
    if (isFocused) return '#f97316';
    return '#e2e8f0';
  };

  return (
    <input
      ref={ref}
      type="text"
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder="ここに入力して脂肪を燃やそう！"
      style={{
        width: '100%',
        fontSize: '1.5rem',
        padding: '20px 24px',
        borderRadius: '12px',
        border: `2px solid ${getBorderColor()}`,
        marginBottom: '24px',
        fontFamily: 'inherit',
        outline: 'none',
        transition: 'all 0.2s',
        backgroundColor: isComplete ? '#f0fdf4' : 'white',
        boxSizing: 'border-box'
      }}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    />
  );
});

TypingInput.displayName = 'TypingInput';

/** 完了メッセージ */
const CompletionMessage = () => (
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
);

/** アクションボタン */
const ActionButton = ({ onClick, label, isPrimary = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  const baseStyle = isPrimary
    ? {
        background: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
        boxShadow: isHovered
          ? '0 6px 16px rgba(239, 68, 68, 0.5)'
          : '0 4px 12px rgba(239, 68, 68, 0.4)'
      }
    : {
        backgroundColor: isHovered ? '#475569' : '#64748b',
        boxShadow: '0 4px 12px rgba(100, 116, 139, 0.3)'
      };

  return (
    <button
      onClick={onClick}
      style={{
        padding: '14px 32px',
        fontSize: '1rem',
        fontWeight: '600',
        borderRadius: '10px',
        border: 'none',
        color: 'white',
        cursor: 'pointer',
        transition: 'all 0.2s',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        ...baseStyle
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {label}
    </button>
  );
};

// =============================================================================
// カスタムフック
// =============================================================================

/** ゲーム状態管理フック */
const useGameState = () => {
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [fatPercentage, setFatPercentage] = useState(INITIAL_FAT_PERCENTAGE);
  const [showBurnEffect, setShowBurnEffect] = useState(false);
  const [caloriesBurned, setCaloriesBurned] = useState(0);

  const currentSentence = SENTENCES[sentenceIndex];

  const correctChars = useMemo(
    () => calculateCorrectChars(userInput, currentSentence),
    [userInput, currentSentence]
  );

  const wpm = useMemo(
    () => calculateWpm(startTime, correctChars),
    [startTime, correctChars]
  );

  // WPMに基づいて脂肪を減らす
  useEffect(() => {
    if (startTime && userInput.length > 0 && wpm > 0) {
      const burnRate = wpm / BURN_RATE_DIVISOR;
      setFatPercentage((prev) => Math.max(0, prev - burnRate));
    }
  }, [userInput, startTime, wpm]);

  const handleInputChange = useCallback((e) => {
    const value = e.target.value;

    if (!startTime) {
      setStartTime(Date.now());
    }

    setUserInput(value);

    if (value === currentSentence) {
      setIsComplete(true);
      setTotalCompleted((prev) => prev + 1);

      const bonus = Math.min(COMPLETION_BONUS_MAX, 100 - fatPercentage);
      setFatPercentage((prev) => Math.max(0, prev - bonus));
      setCaloriesBurned((prev) => prev + Math.round(wpm / 2));

      setShowBurnEffect(true);
      setTimeout(() => setShowBurnEffect(false), BURN_EFFECT_DURATION);
    } else {
      setIsComplete(false);
    }
  }, [startTime, currentSentence, fatPercentage, wpm]);

  const goToNextSentence = useCallback(() => {
    setSentenceIndex((prev) => (prev + 1) % SENTENCES.length);
    setUserInput('');
    setStartTime(null);
    setIsComplete(false);
  }, []);

  const restart = useCallback(() => {
    setUserInput('');
    setStartTime(null);
    setIsComplete(false);
  }, []);

  return {
    currentSentence,
    userInput,
    wpm,
    isComplete,
    correctChars,
    totalCompleted,
    fatPercentage,
    showBurnEffect,
    caloriesBurned,
    handleInputChange,
    goToNextSentence,
    restart
  };
};

// =============================================================================
// メインコンポーネント
// =============================================================================

const FatBurningTypingGame = () => {
  const inputRef = useRef(null);
  const {
    currentSentence,
    userInput,
    wpm,
    isComplete,
    totalCompleted,
    fatPercentage,
    showBurnEffect,
    caloriesBurned,
    handleInputChange,
    goToNextSentence,
    restart
  } = useGameState();

  // 文章変更時にフォーカス
  useEffect(() => {
    inputRef.current?.focus();
  }, [currentSentence]);

  const handleRestart = useCallback(() => {
    restart();
    inputRef.current?.focus();
  }, [restart]);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🔥 脂肪燃焼タイピング 🔥</h1>
        <div style={styles.subtitle}>
          タイピングで脂肪を燃やせ！速く打つほど痩せていく！
        </div>

        <div style={styles.mainGrid}>
          <CharacterDisplay fatPercentage={fatPercentage} showBurnEffect={showBurnEffect} />

          <div>
            <StatsGrid
              wpm={wpm}
              caloriesBurned={caloriesBurned}
              fatPercentage={fatPercentage}
              totalCompleted={totalCompleted}
            />
            <FatBurnProgressBar fatPercentage={fatPercentage} />
            <MotivationBanner wpm={wpm} fatPercentage={fatPercentage} />
          </div>
        </div>

        <div style={styles.typingArea}>
          <TypingText sentence={currentSentence} userInput={userInput} />
        </div>

        <TypingInput
          ref={inputRef}
          value={userInput}
          onChange={handleInputChange}
          disabled={isComplete}
          isComplete={isComplete}
        />

        {isComplete && <CompletionMessage />}

        <div style={styles.buttonGroup}>
          <ActionButton onClick={handleRestart} label="🔄 やり直す" />
          <ActionButton onClick={goToNextSentence} label="次の運動 🔥" isPrimary />
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
