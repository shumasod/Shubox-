import React, { useState, useEffect, useRef } from 'react';

const BacklogTypingGame = () => {
  const issues = [
    { text: "ログイン機能の実装を完了する", type: "タスク", priority: "高" },
    { text: "ユーザー登録フォームのバリデーション追加", type: "バグ", priority: "高" },
    { text: "パスワードリセット機能を実装する", type: "タスク", priority: "中" },
    { text: "レスポンシブデザインの調整が必要です", type: "改善", priority: "中" },
    { text: "データベース接続エラーを修正する", type: "バグ", priority: "高" },
    { text: "管理画面のUIを改善してください", type: "改善", priority: "低" },
    { text: "検索機能のパフォーマンスを最適化", type: "改善", priority: "中" },
    { text: "メール通知機能を追加実装する", type: "タスク", priority: "中" }
  ];

  const [currentIssue, setCurrentIssue] = useState(issues[0]);
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [processingSpeed, setProcessingSpeed] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [correctChars, setCorrectChars] = useState(0);
  const [consecutiveClears, setConsecutiveClears] = useState(0);
  const [totalCleared, setTotalCleared] = useState(0);
  const [showClearAnimation, setShowClearAnimation] = useState(false);
  const [projectProgress, setProjectProgress] = useState(0);
  const inputRef = useRef(null);

  const getTypeColor = (type) => {
    switch(type) {
      case "バグ": return { bg: "#fee", border: "#f88", text: "#c00" };
      case "タスク": return { bg: "#e6f3ff", border: "#4da6ff", text: "#0066cc" };
      case "改善": return { bg: "#e8f5e9", border: "#66bb6a", text: "#2e7d32" };
      default: return { bg: "#f5f5f5", border: "#999", text: "#666" };
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case "高": return { bg: "#ffebee", color: "#c62828", icon: "🔴" };
      case "中": return { bg: "#fff3e0", color: "#ef6c00", icon: "🟡" };
      case "低": return { bg: "#e8f5e9", color: "#2e7d32", icon: "🟢" };
      default: return { bg: "#f5f5f5", color: "#666", icon: "⚪" };
    }
  };

  const getEncouragementMessage = (cleared, consecutive) => {
    if (consecutive >= 5) return "🎉 連続処理ボーナス！素晴らしい集中力です！";
    if (consecutive >= 3) return "⚡ 3連続処理達成！この調子で進めましょう！";
    if (cleared >= 10) return "🏆 10件以上の課題を処理！プロジェクトリーダーですね！";
    if (cleared >= 5) return "💪 順調に進んでいます！";
    return "📋 次の課題に取り組みましょう！";
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentIssue]);

  useEffect(() => {
    if (startTime && userInput.length > 0) {
      const elapsedMinutes = (Date.now() - startTime) / 60000;
      const speed = Math.round(correctChars / elapsedMinutes) || 0;
      setProcessingSpeed(speed);
    }
  }, [userInput, startTime, correctChars]);

  useEffect(() => {
    const progress = Math.min((totalCleared / issues.length) * 100, 100);
    setProjectProgress(progress);
  }, [totalCleared]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    
    if (!startTime) {
      setStartTime(Date.now());
    }

    setUserInput(value);

    let correct = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] === currentIssue.text[i]) {
        correct++;
      }
    }
    setCorrectChars(correct);

    if (value === currentIssue.text) {
      setIsComplete(true);
      setTotalCleared(prev => prev + 1);
      setConsecutiveClears(prev => prev + 1);
      setShowClearAnimation(true);
      
      setTimeout(() => {
        setShowClearAnimation(false);
      }, 2000);
    } else {
      setIsComplete(false);
    }
  };

  const getNextIssue = () => {
    const currentIndex = issues.indexOf(currentIssue);
    const nextIndex = (currentIndex + 1) % issues.length;
    setCurrentIssue(issues[nextIndex]);
    setUserInput('');
    setStartTime(null);
    setProcessingSpeed(0);
    setIsComplete(false);
    setCorrectChars(0);
  };

  const restart = () => {
    setUserInput('');
    setStartTime(null);
    setProcessingSpeed(0);
    setIsComplete(false);
    setCorrectChars(0);
    setConsecutiveClears(0);
    inputRef.current?.focus();
  };

  const renderText = () => {
    return currentIssue.text.split('').map((char, index) => {
      let color = '#9e9e9e';
      
      if (index < userInput.length) {
        if (userInput[index] === char) {
          color = '#2e7d32';
        } else {
          color = '#c62828';
        }
      }

      return (
        <span
          key={index}
          style={{
            color: color,
            fontSize: '1.8rem',
            fontWeight: '500',
            transition: 'color 0.1s'
          }}
        >
          {char}
        </span>
      );
    });
  };

  const typeColors = getTypeColor(currentIssue.type);
  const priorityColors = getPriorityColor(currentIssue.priority);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#2c6fb5',
        color: 'white',
        padding: '16px 24px',
        borderRadius: '8px 8px 0 0',
        maxWidth: '1000px',
        margin: '0 auto',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          📋 プロジェクト管理 - タイピング課題処理システム
        </h1>
      </div>

      {/* Clear Animation Overlay */}
      {showClearAnimation && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(46, 125, 50, 0.95)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.3s'
        }}>
          <div style={{
            textAlign: 'center',
            color: 'white'
          }}>
            <div style={{ fontSize: '6rem', marginBottom: '20px' }}>✅</div>
            <h2 style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '16px' }}>
              課題を完了しました！
            </h2>
            <div style={{ fontSize: '1.5rem', opacity: 0.9 }}>
              お疲れ様でした 🎉
            </div>
          </div>
        </div>
      )}

      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '0 0 8px 8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        {/* Stats Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '16px',
          padding: '24px',
          borderBottom: '1px solid #e0e0e0',
          backgroundColor: '#fafafa'
        }}>
          <div style={{
            textAlign: 'center',
            padding: '12px',
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #e0e0e0'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '4px' }}>
              処理速度
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#2c6fb5' }}>
              {processingSpeed}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#999' }}>文字/分</div>
          </div>
          
          <div style={{
            textAlign: 'center',
            padding: '12px',
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #e0e0e0'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '4px' }}>
              連続処理
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#ef6c00' }}>
              {consecutiveClears}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#999' }}>件</div>
          </div>

          <div style={{
            textAlign: 'center',
            padding: '12px',
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #e0e0e0'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '4px' }}>
              処理済み
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#2e7d32' }}>
              {totalCleared}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#999' }}>/ {issues.length}件</div>
          </div>

          <div style={{
            textAlign: 'center',
            padding: '12px',
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #e0e0e0'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '4px' }}>
              進捗率
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#7b1fa2' }}>
              {Math.round(projectProgress)}%
            </div>
            <div style={{ fontSize: '0.7rem', color: '#999' }}>完了</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{
          padding: '16px 24px',
          backgroundColor: '#f5f5f5',
          borderBottom: '1px solid #e0e0e0'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '8px'
          }}>
            <span style={{ fontSize: '0.875rem', color: '#666', fontWeight: '600' }}>
              プロジェクト進捗
            </span>
            <span style={{ fontSize: '0.875rem', color: '#2c6fb5', fontWeight: '700' }}>
              {Math.round(projectProgress)}%
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '24px',
            backgroundColor: '#e0e0e0',
            borderRadius: '12px',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <div style={{
              width: `${projectProgress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #2c6fb5 0%, #4da6ff 100%)',
              transition: 'width 0.5s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingRight: '8px'
            }}>
              {projectProgress > 10 && (
                <span style={{ color: 'white', fontSize: '0.75rem', fontWeight: '600' }}>
                  {Math.round(projectProgress)}%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Issue Card */}
        <div style={{
          padding: '32px',
          borderBottom: '1px solid #e0e0e0'
        }}>
          <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '16px',
            flexWrap: 'wrap'
          }}>
            <span style={{
              padding: '6px 16px',
              borderRadius: '4px',
              fontSize: '0.875rem',
              fontWeight: '600',
              backgroundColor: typeColors.bg,
              color: typeColors.text,
              border: `2px solid ${typeColors.border}`
            }}>
              {currentIssue.type}
            </span>
            <span style={{
              padding: '6px 16px',
              borderRadius: '4px',
              fontSize: '0.875rem',
              fontWeight: '600',
              backgroundColor: priorityColors.bg,
              color: priorityColors.color
            }}>
              {priorityColors.icon} 優先度: {currentIssue.priority}
            </span>
            <span style={{
              padding: '6px 16px',
              borderRadius: '4px',
              fontSize: '0.875rem',
              fontWeight: '600',
              backgroundColor: '#fff3e0',
              color: '#e65100',
              border: '1px solid #ffb74d'
            }}>
              👤 担当: あなた
            </span>
          </div>

          <div style={{
            backgroundColor: '#fafafa',
            padding: '24px',
            borderRadius: '8px',
            border: '2px solid #e0e0e0',
            marginBottom: '24px',
            minHeight: '100px',
            display: 'flex',
            alignItems: 'center',
            lineHeight: '1.8'
          }}>
            {renderText()}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={handleInputChange}
            disabled={isComplete}
            placeholder="課題の内容を入力してください..."
            style={{
              width: '100%',
              fontSize: '1.25rem',
              padding: '16px 20px',
              borderRadius: '6px',
              border: isComplete ? '2px solid #2e7d32' : '2px solid #ccc',
              fontFamily: 'inherit',
              outline: 'none',
              transition: 'all 0.2s',
              backgroundColor: isComplete ? '#f1f8e9' : 'white'
            }}
            onFocus={(e) => e.target.style.borderColor = '#2c6fb5'}
            onBlur={(e) => e.target.style.borderColor = isComplete ? '#2e7d32' : '#ccc'}
          />
        </div>

        {/* Status Messages */}
        {isComplete && (
          <div style={{
            padding: '20px 32px',
            backgroundColor: '#e8f5e9',
            borderBottom: '1px solid #c8e6c9'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#2e7d32'
            }}>
              <span style={{ fontSize: '1.5rem' }}>✅</span>
              <span>課題を完了しました！お疲れ様でした。</span>
            </div>
          </div>
        )}

        {consecutiveClears >= 3 && !isComplete && (
          <div style={{
            padding: '16px 32px',
            backgroundColor: '#fff3e0',
            borderBottom: '1px solid #ffe0b2'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '1rem',
              fontWeight: '600',
              color: '#e65100'
            }}>
              <span style={{ fontSize: '1.25rem' }}>⚡</span>
              <span>{consecutiveClears}件連続処理中！素晴らしい集中力です！</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{
          padding: '24px 32px',
          display: 'flex',
          gap: '12px',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#fafafa'
        }}>
          <div style={{
            fontSize: '0.875rem',
            color: '#666',
            fontWeight: '500'
          }}>
            💡 {getEncouragementMessage(totalCleared, consecutiveClears)}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={restart}
              style={{
                padding: '12px 24px',
                fontSize: '0.95rem',
                fontWeight: '600',
                borderRadius: '6px',
                border: '1px solid #bbb',
                backgroundColor: 'white',
                color: '#666',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f5f5f5';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'white';
              }}
            >
              🔄 やり直す
            </button>
            <button
              onClick={getNextIssue}
              style={{
                padding: '12px 24px',
                fontSize: '0.95rem',
                fontWeight: '600',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#2c6fb5',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 2px 4px rgba(44, 111, 181, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#245a94';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#2c6fb5';
              }}
            >
              次の課題 →
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default BacklogTypingGame;
