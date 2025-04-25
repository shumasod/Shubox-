import React, { useState } from 'react';

// ひげコンポーネント（呼び出されていたが定義されていなかった）
const Whiskers = () => (
  <>
    {/* 左側のひげ */}
    <div className="absolute left-2 top-12 w-6 h-px bg-black transform -rotate-15" />
    <div className="absolute left-2 top-13 w-6 h-px bg-black" />
    <div className="absolute left-2 top-14 w-6 h-px bg-black transform rotate-15" />
    
    {/* 右側のひげ */}
    <div className="absolute right-2 top-12 w-6 h-px bg-black transform rotate-15" />
    <div className="absolute right-2 top-13 w-6 h-px bg-black" />
    <div className="absolute right-2 top-14 w-6 h-px bg-black transform -rotate-15" />
  </>
);

// 頭部コンポーネント
const CatHead = ({ isHappy }) => (
  <div className="absolute w-24 h-24 bg-gray-400 rounded-full top-8 left-20">
    {/* 耳 */}
    <div className="absolute -top-4 -left-2 w-6 h-6 bg-gray-400 transform rotate-45" />
    <div className="absolute -top-4 -right-2 w-6 h-6 bg-gray-400 transform -rotate-45" />
    
    {/* 目 */}
    <div className={`absolute left-4 top-8 w-3 transition-all duration-300 bg-black rounded-full ${isHappy ? 'h-1' : 'h-4'}`} />
    <div className={`absolute right-4 top-8 w-3 transition-all duration-300 bg-black rounded-full ${isHappy ? 'h-1' : 'h-4'}`} />
    
    {/* 鼻 */}
    <div className="absolute left-10 top-10 w-4 h-3 bg-pink-300 rounded-full" />
    
    {/* 口 */}
    <div className={`absolute left-8 top-14 w-8 h-2 border-b-2 transition-all duration-300 border-black rounded-full ${isHappy ? 'border-b-4' : ''}`} />
    
    {/* ひげ */}
    <Whiskers />
  </div>
);

// 体部コンポーネント
const CatBody = () => (
  <div className="absolute bottom-0 w-32 h-24 bg-gray-400 rounded-full left-16" />
);

// 手コンポーネント
const Paws = ({ isWaving }) => (
  <>
    <div 
      className={`absolute bottom-8 left-12 w-8 h-4 bg-gray-400 rounded-full transform origin-right transition-transform duration-300 ${isWaving ? 'animate-paw-wave' : ''}`}
    />
    <div className="absolute bottom-8 right-12 w-8 h-4 bg-gray-400 rounded-full" />
  </>
);

// しっぽコンポーネント
const Tail = ({ isHappy }) => (
  <div 
    className={`absolute bottom-16 right-4 w-16 h-4 bg-gray-400 rounded-full transform -rotate-45 transition-transform duration-300 ${isHappy ? 'animate-tail-wag' : ''}`}
  />
);

// メインの猫コンポーネント
const Cat = () => {
  const [isWaving, setIsWaving] = useState(false);
  const [isHappy, setIsHappy] = useState(false);
  
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-100 rounded-lg">
      <style jsx>{`
        @keyframes paw-wave {
          0% { transform: rotate(0deg); }
          50% { transform: rotate(-20deg); }
          100% { transform: rotate(0deg); }
        }
        
        @keyframes tail-wag {
          0% { transform: rotate(-45deg); }
          50% { transform: rotate(-15deg); }
          100% { transform: rotate(-45deg); }
        }
        
        .animate-paw-wave {
          animation: paw-wave 1s ease-in-out infinite;
        }
        
        .animate-tail-wag {
          animation: tail-wag 0.5s ease-in-out infinite;
        }
      `}</style>
      
      <div 
        className="relative w-64 h-64 cursor-pointer"
        onClick={() => setIsHappy(!isHappy)}
        onMouseEnter={() => setIsWaving(true)}
        onMouseLeave={() => setIsWaving(false)}
        role="button"
        aria-label={`猫をクリックして${isHappy ? '通常' : '幸せ'}な表情に変更`}
        tabIndex={0}
        onKeyPress={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setIsHappy(!isHappy);
          }
        }}
      >
        <CatBody />
        <CatHead isHappy={isHappy} />
        <Paws isWaving={isWaving} />
        <Tail isHappy={isHappy} />
      </div>
      
      <p className="mt-4 text-lg text-gray-700" aria-live="polite">
        {isHappy ? 'にゃー！ 😺' : 'こんにちは！ 😺'}
      </p>
    </div>
  );
};

export default Cat;
