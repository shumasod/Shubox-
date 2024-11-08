import React, { useState, useEffect, useCallback } from 'react';
import { Moon, Star, Cloud } from 'lucide-react';

const NinjaScene = () => {
  const [showShuriken, setShowShuriken] = useState(false);
  const [moonGlow, setMoonGlow] = useState(false);
  const [ninjaPosition, setNinjaPosition] = useState({ x: 50, y: 100 });
  const [stars, setStars] = useState([]);
  const [clouds, setClouds] = useState([]);

  // 星を生成する関数
  const generateStars = useCallback(() => {
    return [...Array(30)].map(() => ({
      size: Math.random() * 3 + 4,
      top: Math.random() * 100,
      left: Math.random() * 100,
      animationDelay: Math.random() * 5,
      twinkleSpeed: Math.random() * 3 + 1
    }));
  }, []);

  // 雲を生成する関数
  const generateClouds = useCallback(() => {
    return [...Array(5)].map(() => ({
      size: Math.random() * 50 + 30,
      top: Math.random() * 50,
      left: -20,
      speed: Math.random() * 0.5 + 0.1
    }));
  }, []);

  useEffect(() => {
    setStars(generateStars());
    setClouds(generateClouds());

    const shurikenTimer = setInterval(() => {
      setShowShuriken((prev) => !prev);
    }, 2000);

    const moonTimer = setInterval(() => {
      setMoonGlow((prev) => !prev);
    }, 5000);

    const ninjaMovementTimer = setInterval(() => {
      setNinjaPosition(prev => ({
        x: Math.max(0, Math.min(100, prev.x + (Math.random() - 0.5) * 10)),
        y: Math.max(80, Math.min(100, prev.y + (Math.random() - 0.5) * 5))
      }));
    }, 2000);

    const cloudMovementTimer = setInterval(() => {
      setClouds(prevClouds => 
        prevClouds.map(cloud => ({
          ...cloud,
          left: cloud.left > 120 ? -20 : cloud.left + cloud.speed
        }))
      );
    }, 100);

    return () => {
      clearInterval(shurikenTimer);
      clearInterval(moonTimer);
      clearInterval(ninjaMovementTimer);
      clearInterval(cloudMovementTimer);
    };
  }, [generateStars, generateClouds]);

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-gray-900 overflow-hidden">
      {/* 満月 */}
      <div className={`absolute top-8 right-8 transition-all duration-1000 ${moonGlow ? 'scale-110' : 'scale-100'}`}>
        <Moon className="text-yellow-200" size={64} />
        <div className="absolute inset-0 bg-yellow-100 rounded-full blur-xl opacity-50"></div>
      </div>

      {/* 星空 */}
      {stars.map((star, i) => (
        <Star 
          key={i} 
          className="absolute text-white opacity-75" 
          size={star.size}
          style={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            animation: `twinkle ${star.twinkleSpeed}s ease-in-out infinite alternate`,
            animationDelay: `${star.animationDelay}s`
          }}
        />
      ))}

      {/* 雲 */}
      {clouds.map((cloud, i) => (
        <Cloud
          key={i}
          className="absolute text-gray-400 opacity-30"
          size={cloud.size}
          style={{
            top: `${cloud.top}%`,
            left: `${cloud.left}%`,
            transition: 'left 0.1s linear'
          }}
        />
      ))}

      {/* 忍者 */}
      <div 
        className="absolute transform -translate-x-1/2 transition-all duration-1000 ease-in-out"
        style={{ bottom: `${ninjaPosition.y - 100}%`, left: `${ninjaPosition.x}%` }}
      >
        <div className="w-40 h-80 bg-black rounded-t-full relative">
          {/* 目 */}
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-20 h-5 bg-white rounded-full overflow-hidden">
            <div className="w-5 h-5 bg-red-600 rounded-full absolute top-0 left-1/4 transform -translate-x-1/2 animate-pulse"></div>
            <div className="w-5 h-5 bg-white rounded-full absolute top-0 right-1/4 transform translate-x-1/2"></div>
          </div>
          {/* 腕 */}
          <div className="absolute -left-12 top-28 w-12 h-32 bg-black rounded-full transform rotate-45 origin-top-right animate-wave"></div>
          <div className="absolute -right-12 top-28 w-12 h-32 bg-black rounded-full transform -rotate-45 origin-top-left animate-wave animation-delay-1000"></div>
        </div>
      </div>

      {/* 手裏剣 */}
      {showShuriken && (
        <div 
          className="absolute w-12 h-12 bg-gray-400 animate-spin"
          style={{
            clipPath: 'polygon(50% 0%, 80% 30%, 100% 50%, 80% 70%, 50% 100%, 20% 70%, 0% 50%, 20% 30%)',
            top: `${Math.random() * 60 + 20}%`,
            left: `${Math.random() * 80 + 10}%`,
            animationDuration: '0.5s'
          }}
        />
      )}

      {/* 漢字 */}
      <div className="absolute top-8 left-8 text-8xl text-gray-700 opacity-20 writing-vertical animate-fade-in-out">
        忍者
      </div>

      {/* 霧 */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-800 to-transparent opacity-75 animate-pulse"></div>
    </div>
  );
};

export default NinjaScene;



1. clipPathのスタイルをCSSで定義

一部のスタイル（特にclipPath）は、直接JSXで定義するよりも、クラスとしてCSSで定義した方がパフォーマンスが向上する可能性があります。たとえば、手裏剣のスタイルをCSSに移動することで、コードの可読性も向上します。

/* NinjaScene.module.css に追加 */
.shuriken {
  width: 3rem;
  height: 3rem;
  background-color: gray;
  clip-path: polygon(50% 0%, 80% 30%, 100% 50%, 80% 70%, 50% 100%, 20% 70%, 0% 50%, 20% 30%);
  animation: spin 0.5s linear infinite;
}

<div 
  className="absolute shuriken"
  style={{
    top: `${Math.random() * 60 + 20}%`,
    left: `${Math.random() * 80 + 10}%`,
  }}
/>

2. setIntervalのクリーンアップの確認

setIntervalが複数使われていますが、特にcloudMovementTimerのように頻繁に更新されるものについては、他の処理の影響を受ける場合があります。重複実行を防ぐために、useEffectのクリーンアップで確実に削除しているか確認しましょう。

useEffect(() => {
  // 定義したタイマーの後に、返却するクリーンアップで削除確認
  return () => {
    clearInterval(shurikenTimer);
    clearInterval(moonTimer);
    clearInterval(ninjaMovementTimer);
    clearInterval(cloudMovementTimer);
  };
}, [generateStars, generateClouds]);

3. transitionに依存するアニメーションの調整

Reactのリレンダリングが原因で一部のアニメーションがスムーズに表示されない可能性があります。特に忍者の位置や雲の位置のアニメーションには、requestAnimationFrameを使用すると、スムーズさが向上することがあります。

