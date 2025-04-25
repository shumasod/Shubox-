import React, { useState, useEffect } from 'react';

const MountFujiDisplay = () => {
  const [timeOfDay, setTimeOfDay] = useState('day');
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    const updateTimeOfDay = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 8) setTimeOfDay('dawn');
      else if (hour >= 8 && hour < 18) setTimeOfDay('day');
      else if (hour >= 18 && hour < 20) setTimeOfDay('dusk');
      else setTimeOfDay('night');
    };

    // 初回実行
    updateTimeOfDay();
    
    // 1時間ごとに更新
    const intervalId = setInterval(updateTimeOfDay, 60 * 60 * 1000);
    
    // メッセージ表示
    const timer = setTimeout(() => setShowMessage(true), 1000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(intervalId);
    };
  }, []);

  // 空の色を時間帯ごとに設定
  const getSkyStyle = () => {
    switch(timeOfDay) {
      case 'dawn':
        return { background: 'linear-gradient(to bottom, #F9D7DA, #FCC7B1)' };
      case 'day':
        return { background: 'linear-gradient(to bottom, #87CEEB, #E0F6FF)' };
      case 'dusk':
        return { background: 'linear-gradient(to bottom, #FAD6A5, #FEC291)' };
      case 'night':
        return { background: 'linear-gradient(to bottom, #0B0E17, #3B4149)' };
      default:
        return { background: 'linear-gradient(to bottom, #87CEEB, #E0F6FF)' };
    }
  };

  // 富士山の色を時間帯ごとに設定
  const getMountainColors = () => {
    switch(timeOfDay) {
      case 'dawn':
        return { main: '#E6CCCC', shadow: '#D4AAAA', snow: '#FFF9F9' };
      case 'day':
        return { main: '#E6E6E6', shadow: '#CCCCCC', snow: '#FFFFFF' };
      case 'dusk':
        return { main: '#E6D8CC', shadow: '#D4BBA8', snow: '#FFF9F0' };
      case 'night':
        return { main: '#7A8899', shadow: '#5D6B7A', snow: '#C3CDDB' };
      default:
        return { main: '#E6E6E6', shadow: '#CCCCCC', snow: '#FFFFFF' };
    }
  };

  const messages = {
    dawn: '朝焼けに染まる霊峰',
    day: '清麗なる富士の姿',
    dusk: '夕映えに輝く聖山',
    night: '月光に浮かぶ影富士'
  };

  const mountainColors = getMountainColors();

  return (
    <div className="relative h-screen overflow-hidden transition-all duration-3000 ease-in-out" style={getSkyStyle()}>
      {/* 富士山 - より詳細なSVGで表現 */}
      <div className="absolute bottom-0 left-0 right-0 h-2/3 flex justify-center items-end">
        <svg width="100%" height="100%" viewBox="0 0 800 600" preserveAspectRatio="xMidYMax slice">
          {/* ベース */}
          <polygon points="400,50 650,600 150,600" fill={mountainColors.main} />
          
          {/* 陰影 */}
          <polygon points="400,150 600,600 200,600" fill={mountainColors.shadow} />
          
          {/* 雪冠 */}
          <polygon points="400,50 460,200 340,200" fill={mountainColors.snow} />
          
          {/* 特徴的な筋（雪解け跡） */}
          <path d="M370,120 L350,280 L370,290 L380,230 Z" fill={mountainColors.snow} opacity="0.7" />
          <path d="M430,120 L450,280 L430,290 L420,230 Z" fill={mountainColors.snow} opacity="0.7" />
          
          {/* 山麓の森 */}
          <path d="M250,500 C300,480 350,500 400,490 C450,500 500,480 550,500 L650,600 L150,600 Z" 
                fill={timeOfDay === 'night' ? '#1A2C1A' : '#2E502E'} opacity="0.5" />
        </svg>
      </div>

      {/* 雲 - 複数追加、サイズ変更 */}
      <div className="absolute bottom-1/4 left-1/4 w-32 h-16 bg-white rounded-full opacity-60" 
           style={{animation: 'float 10s ease-in-out infinite'}}></div>
      <div className="absolute bottom-1/3 right-1/4 w-48 h-20 bg-white rounded-full opacity-70" 
           style={{animation: 'float 13s ease-in-out infinite'}}></div>
      <div className="absolute bottom-2/5 left-1/3 w-24 h-14 bg-white rounded-full opacity-50" 
           style={{animation: 'float 15s ease-in-out infinite'}}></div>

      {/* 太陽または月 */}
      <div className={`absolute ${timeOfDay === 'night' ? 'top-10 right-10' : 'top-10 left-10'} 
                      w-20 h-20 rounded-full animate-pulse`}
           style={{
             backgroundColor: timeOfDay === 'night' ? '#E5E5E5' : 
                              timeOfDay === 'dawn' ? '#FFDB99' : 
                              timeOfDay === 'dusk' ? '#FFAA5E' : '#FFDB00',
             boxShadow: timeOfDay === 'night' ? '0 0 20px 5px rgba(229, 229, 229, 0.5)' : 
                        '0 0 30px 10px rgba(255, 219, 0, 0.7)',
             animation: 'pulse 4s ease-in-out infinite'
           }}>
      </div>

      {/* 鳥居 - より精細に */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2" style={{ zIndex: 10 }}>
        <div style={{
          width: '80px',
          height: '100px',
          position: 'relative',
          clipPath: 'polygon(10% 10%, 90% 10%, 90% 0%, 100% 0%, 100% 20%, 90% 20%, 90% 100%, 75% 100%, 75% 20%, 25% 20%, 25% 100%, 10% 100%, 10% 20%, 0% 20%, 0% 0%, 10% 0%)',
          backgroundColor: '#b22234'
        }}></div>
      </div>

      {/* 鳥 - 時間帯に応じて表示 */}
      {(timeOfDay === 'dawn' || timeOfDay === 'day') && (
        <div className="absolute top-1/4 right-1/4">
          <svg width="30" height="20" viewBox="0 0 30 20">
            <path d="M5,10 Q15,0 25,10 Q15,20 5,10 Z" fill="#333" />
          </svg>
        </div>
      )}
      {(timeOfDay === 'dawn' || timeOfDay === 'day') && (
        <div className="absolute top-1/3 right-1/3">
          <svg width="20" height="15" viewBox="0 0 30 20">
            <path d="M5,10 Q15,0 25,10 Q15,20 5,10 Z" fill="#333" />
          </svg>
        </div>
      )}

      {/* メッセージ */}
      <div className="relative z-10 flex justify-center items-center h-full">
        {showMessage && (
          <div className="bg-white/70 border-4 border-[#8b4513] shadow-lg p-6 text-center transform rotate-1"
               style={{animation: 'fadeIn 2s ease-out'}}>
            <h1 className="text-3xl text-[#8b4513] font-bold" 
                style={{
                  fontFamily: "'Noto Serif JP', serif",
                  writingMode: 'vertical-rl',
                  textOrientation: 'upright'
                }}>
              {messages[timeOfDay]}
            </h1>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(0.97); }
        }
      `}</style>
    </div>
  );
};

export default MountFujiDisplay;
