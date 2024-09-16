import React, { useState, useEffect } from 'react';
import { Moon, Star } from 'lucide-react';

const NinjaScene = () => {
  const [showShuriken, setShowShuriken] = useState(false);
  const [moonGlow, setMoonGlow] = useState(false);

  useEffect(() => {
    // 手裏剣の表示/非表示を2秒ごとに切り替え
    const shurikenTimer = setInterval(() => {
      setShowShuriken((prev) => !prev);
    }, 2000);

    // 月の光の明滅を5秒ごとに切り替え
    const moonTimer = setInterval(() => {
      setMoonGlow((prev) => !prev);
    }, 5000);

    return () => {
      clearInterval(shurikenTimer);
      clearInterval(moonTimer);
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-gray-900 overflow-hidden">
      {/* 満月 */}
      <div className={`absolute top-8 right-8 transition-all duration-1000 ${moonGlow ? 'scale-110' : 'scale-100'}`}>
        <Moon className="text-yellow-200" size={64} />
        <div className="absolute inset-0 bg-yellow-100 rounded-full blur-xl opacity-50"></div>
      </div>

      {/* 星空 */}
      {[...Array(20)].map((_, i) => (
        <Star 
          key={i} 
          className="absolute text-white opacity-75" 
          size={Math.random() * 3 + 1}
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`
          }}
        />
      ))}

      {/* 忍者 */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
        <div className="w-40 h-80 bg-black rounded-t-full relative">
          {/* 目 */}
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-20 h-5 bg-white rounded-full overflow-hidden">
            <div className="w-5 h-5 bg-red-600 rounded-full absolute top-0 left-1/4 transform -translate-x-1/2"></div>
            <div className="w-5 h-5 bg-white rounded-full absolute top-0 right-1/4 transform translate-x-1/2"></div>
          </div>
          {/* 腕 */}
          <div className="absolute -left-12 top-28 w-12 h-32 bg-black rounded-full transform rotate-45"></div>
          <div className="absolute -right-12 top-28 w-12 h-32 bg-black rounded-full transform -rotate-45"></div>
        </div>
      </div>

      {/* 手裏剣 */}
      {showShuriken && (
        <div className="absolute top-1/3 left-1/3 w-12 h-12 bg-gray-400 animate-spin" 
             style={{clipPath: 'polygon(50% 0%, 80% 30%, 100% 50%, 80% 70%, 50% 100%, 20% 70%, 0% 50%, 20% 30%)'}}>
        </div>
      )}

      {/* 漢字 */}
      <div className="absolute top-8 left-8 text-8xl text-gray-700 opacity-20 writing-vertical">
        忍者
      </div>

      {/* 霧 */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-800 to-transparent opacity-75 animate-pulse"></div>
    </div>
  );
};

export default NinjaScene;
