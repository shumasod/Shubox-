import React, { useState, useEffect } from 'react';
import { Moon } from 'lucide-react';

const NinjaScene = () => {
  const [showShuriken, setShowShuriken] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setShowShuriken((prev) => !prev);
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-screen bg-gray-900 overflow-hidden">
      {/* 月 */}
      <Moon className="absolute top-8 right-8 text-yellow-200" size={48} />

      {/* 忍者 */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
        <div className="w-32 h-64 bg-black rounded-t-full relative">
          {/* 目 */}
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-16 h-4 bg-white rounded-full overflow-hidden">
            <div className="w-4 h-4 bg-red-600 rounded-full absolute top-0 left-1/2 transform -translate-x-1/2"></div>
          </div>
          {/* 手 */}
          <div className="absolute -left-8 top-24 w-8 h-24 bg-black rounded-full transform rotate-45"></div>
          <div className="absolute -right-8 top-24 w-8 h-24 bg-black rounded-full transform -rotate-45"></div>
        </div>
      </div>

      {/* 手裏剣 */}
      {showShuriken && (
        <div className="absolute top-1/4 left-1/4 w-8 h-8 bg-gray-400 animate-spin" style={{clipPath: 'polygon(50% 0%, 80% 30%, 100% 50%, 80% 70%, 50% 100%, 20% 70%, 0% 50%, 20% 30%)'}}>
        </div>
      )}

      {/* 漢字 */}
      <div className="absolute top-8 left-8 text-6xl text-gray-700 opacity-20 writing-vertical">
        忍者
      </div>

      {/* 煙 */}
      <div className="absolute bottom-0 left-1/3 w-1/3 h-16 bg-gradient-to-t from-gray-500 to-transparent opacity-50 animate-pulse"></div>
    </div>
  );
};

export default NinjaScene;
