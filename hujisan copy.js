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

  const skyColors = {
    dawn: ['bg-[#F9D7DA]', 'bg-[#FCC7B1]'],
    day: ['bg-[#87CEEB]', 'bg-[#E0F6FF]'],
    dusk: ['bg-[#FAd6A5]', 'bg-[#FEC291]'],
    night: ['bg-[#0B0E17]', 'bg-[#3B4149]']
  };

  const messages = {
    dawn: '朝焼けに染まる霊峰',
    day: '清麗なる富士の姿',
    dusk: '夕映えに輝く聖山',
    night: '月光に浮かぶ影富士'
  };

  return (
    <div className={`relative h-screen overflow-hidden transition-all duration-3000 ease-in-out bg-gradient-to-b ${skyColors[timeOfDay][0]} ${skyColors[timeOfDay][1]}`}>
      {/* 富士山 */}
      <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-[#F9F9F9] clip-fuji"></div>
      <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-[#E6E6E6] clip-fuji-shadow"></div>
      
      {/* 雲 */}
      <div className="absolute bottom-1/4 left-1/4 w-32 h-16 bg-white rounded-full opacity-60 animate-float"></div>
      <div className="absolute bottom-1/3 right-1/4 w-48 h-20 bg-white rounded-full opacity-70 animate-float-delay"></div>
      
      {/* 太陽または月 */}
      <div className={`absolute ${timeOfDay === 'night' ? 'top-10 right-10' : 'top-10 left-10'} w-20 h-20 rounded-full ${timeOfDay === 'night' ? 'bg-gray-200' : 'bg-yellow-400'} animate-pulse`}></div>
      
      {/* 鳥居 */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 w-32 h-40 bg-[#b22234] clip-torii"></div>
      
      {/* メッセージ */}
      <div className="relative z-10 flex justify-center items-center h-full">
        {showMessage && (
          <div className="bg-white/70 border-4 border-[#8b4513] shadow-lg p-6 text-center transform rotate-1 animate-fadeIn">
            <h1 className="text-3xl text-[#8b4513] writing-vertical-rl text-orientation-upright inline-block font-bold" style={{fontFamily: "'Noto Serif JP', serif"}}>
              {messages[timeOfDay]}
            </h1>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .clip-fuji {
          clip-path: polygon(50% 0%, 100% 100%, 0% 100%);
        }
        .clip-fuji-shadow {
          clip-path: polygon(40% 20%, 60% 20%, 100% 100%, 0% 100%);
        }
        .clip-torii {
          clip-path: polygon(10% 10%, 90% 10%, 90% 0%, 100% 0%, 100% 20%, 90% 20%, 90% 100%, 75% 100%, 75% 20%, 25% 20%, 25% 100%, 10% 100%, 10% 20%, 0% 20%, 0% 0%, 10% 0%);
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-float {
          animation: float 10s ease-in-out 
        .animate-float-delay {
          animation: float 13s ease-in-out infinite;
        }
        .animate-fadeIn {
          animation: fadeIn 2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default MountFujiDisplay;