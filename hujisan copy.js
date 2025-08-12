import React, { useState, useEffect } from 'react';

const MountFujiDisplay = () => {
  const [timeOfDay, setTimeOfDay] = useState('day');
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 8) setTimeOfDay('dawn');
    else if (hour >= 8 && hour < 18) setTimeOfDay('day');
    else if (hour >= 18 && hour < 20) setTimeOfDay('dusk');
    else setTimeOfDay('night');

    const timer = setTimeout(() => setShowMessage(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const skyStyles = {
    dawn: 'from-pink-200 via-orange-200 to-yellow-100',
    day: 'from-blue-400 via-blue-200 to-blue-50',
    dusk: 'from-orange-300 via-orange-200 to-yellow-100',
    night: 'from-gray-900 via-gray-700 to-gray-800'
  };

  const messages = {
    dawn: '朝焼けに染まる霊峰',
    day: '清麗なる富士の姿',
    dusk: '夕映えに輝く聖山',
    night: '月光に浮かぶ影富士'
  };

  // 富士山のSVGパス
  const FujiMountain = () => (
    <svg 
      className="absolute bottom-0 left-0 right-0 w-full h-2/3" 
      viewBox="0 0 800 400" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="mountainGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f0f0f0" />
          <stop offset="50%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e0e0e0" />
        </linearGradient>
        <linearGradient id="shadowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#d0d0d0" />
          <stop offset="50%" stopColor="#e8e8e8" />
          <stop offset="100%" stopColor="#c8c8c8" />
        </linearGradient>
      </defs>
      
      {/* 富士山本体 */}
      <polygon 
        points="400,50 200,400 600,400" 
        fill="url(#mountainGradient)"
        stroke="#d0d0d0"
        strokeWidth="1"
      />
      
      {/* 影の部分 */}
      <polygon 
        points="400,50 350,150 450,150 600,400 500,400" 
        fill="url(#shadowGradient)"
        opacity="0.7"
      />
      
      {/* 雪化粧 */}
      <polygon 
        points="400,50 360,120 440,120" 
        fill="white"
        opacity="0.9"
      />
    </svg>
  );

  // 雲のコンポーネント
  const Cloud = ({ className, delay = 0 }) => (
    <div 
      className={`absolute bg-white rounded-full opacity-60 ${className}`}
      style={{
        animation: `float 12s ease-in-out infinite`,
        animationDelay: `${delay}s`
      }}
    />
  );

  // 鳥居のSVGコンポーネント
  const Torii = () => (
    <svg 
      className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
      width="120" 
      height="150" 
      viewBox="0 0 120 150" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="toriiGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#a0332a" />
          <stop offset="50%" stopColor="#cc4125" />
          <stop offset="100%" stopColor="#8b2020" />
        </linearGradient>
      </defs>
      
      {/* 上部の横梁 */}
      <rect x="0" y="15" width="120" height="12" fill="url(#toriiGradient)" rx="6" />
      
      {/* 中部の横梁 */}
      <rect x="15" y="35" width="90" height="8" fill="url(#toriiGradient)" rx="4" />
      
      {/* 左の柱 */}
      <rect x="20" y="27" width="12" height="123" fill="url(#toriiGradient)" rx="6" />
      
      {/* 右の柱 */}
      <rect x="88" y="27" width="12" height="123" fill="url(#toriiGradient)" rx="6" />
    </svg>
  );

  // 太陽・月のコンポーネント
  const CelestialBody = () => {
    const isNight = timeOfDay === 'night';
    return (
      <div 
        className={`absolute top-10 ${isNight ? 'right-10' : 'left-10'} w-16 h-16 rounded-full transition-all duration-1000`}
        style={{
          backgroundColor: isNight ? '#f0f0f0' : '#ffd700',
          boxShadow: isNight 
            ? '0 0 20px rgba(240, 240, 240, 0.5)' 
            : '0 0 30px rgba(255, 215, 0, 0.6)',
          animation: 'pulse 3s ease-in-out infinite'
        }}
      >
        {isNight && (
          <div className="absolute top-2 left-3 w-3 h-3 rounded-full bg-gray-400 opacity-50" />
        )}
        {isNight && (
          <div className="absolute top-6 left-8 w-2 h-2 rounded-full bg-gray-400 opacity-30" />
        )}
      </div>
    );
  };

  return (
    <div className={`relative h-screen overflow-hidden transition-all duration-[3000ms] ease-in-out bg-gradient-to-b ${skyStyles[timeOfDay]}`}>
      {/* 富士山 */}
      <FujiMountain />
      
      {/* 雲 */}
      <Cloud className="bottom-1/4 left-1/4 w-28 h-12" delay={0} />
      <Cloud className="bottom-1/3 right-1/4 w-40 h-16" delay={2} />
      <Cloud className="bottom-2/5 left-3/4 w-24 h-10" delay={4} />
      
      {/* 太陽または月 */}
      <CelestialBody />
      
      {/* 鳥居 */}
      <Torii />
      
      {/* 桜の花びら（春の効果） */}
      {timeOfDay === 'dawn' && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-pink-300 rounded-full opacity-70"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `fall ${5 + Math.random() * 5}s linear infinite`,
                animationDelay: `${Math.random() * 3}s`
              }}
            />
          ))}
        </div>
      )}
      
      {/* 星（夜の効果） */}
      {timeOfDay === 'night' && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 50}%`,
                animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}
      
      {/* メッセージ */}
      <div className="relative z-10 flex justify-center items-center h-full">
        {showMessage && (
          <div 
            className="bg-white bg-opacity-80 border-4 border-amber-800 shadow-2xl p-6 text-center transform rotate-1 backdrop-blur-sm"
            style={{
              animation: 'fadeIn 2s ease-out'
            }}
          >
            <h1 
              className="text-2xl md:text-3xl text-amber-800 font-bold leading-tight"
              style={{
                fontFamily: "'Noto Serif JP', serif",
                writingMode: 'vertical-rl',
                textOrientation: 'upright',
                letterSpacing: '0.1em'
              }}
            >
              {messages[timeOfDay]}
            </h1>
          </div>
        )}
      </div>
      
      {/* インラインスタイルでアニメーションを定義 */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;700&display=swap');
          
          @keyframes float {
            0%, 100% { 
              transform: translateY(0) translateX(0); 
            }
            25% { 
              transform: translateY(-8px) translateX(3px); 
            }
            50% { 
              transform: translateY(-15px) translateX(0); 
            }
            75% { 
              transform: translateY(-8px) translateX(-3px); 
            }
          }
          
          @keyframes fadeIn {
            from { 
              opacity: 0; 
              transform: translateY(20px) rotate(1deg); 
            }
            to { 
              opacity: 1; 
              transform: translateY(0) rotate(1deg); 
            }
          }
          
          @keyframes pulse {
            0%, 100% { 
              transform: scale(1); 
              opacity: 1; 
            }
            50% { 
              transform: scale(1.05); 
              opacity: 0.8; 
            }
          }
          
          @keyframes fall {
            0% { 
              transform: translateY(-10px) rotate(0deg); 
              opacity: 1; 
            }
            100% { 
              transform: translateY(100vh) rotate(360deg); 
              opacity: 0; 
            }
          }
          
          @keyframes twinkle {
            0%, 100% { 
              opacity: 0.3; 
              transform: scale(1); 
            }
            50% { 
              opacity: 1; 
              transform: scale(1.2); 
            }
          }
        `
      }} />
    </div>
  );
};

export default MountFujiDisplay;
