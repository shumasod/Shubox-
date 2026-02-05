import React, { useState } from ‘react’;
import { Zap, Brain, Dumbbell, Code, Star, ChevronRight } from ‘lucide-react’;

const MusclCodeApp = () => {
const [activeFeature, setActiveFeature] = useState(0);

const features = [
{
icon: <Code className="w-12 h-12" />,
title: “スマートコーディング講座”,
description: “科学的根拠に基づいた学習メソッドで、プログラミングスキルを効率的に向上させます。”
},
{
icon: <Dumbbell className="w-12 h-12" />,
title: “健康的フィットネスプラン”,
description: “デスクワークの合間にできる、専門家監修の運動プログラムで心身をリフレッシュ。”
},
{
icon: <Brain className="w-12 h-12" />,
title: “マインドフルネス＆集中力向上”,
description: “瞑想とストレッチで集中力を高め、コーディング効率を最大化します。”
}
];

const testimonials = [
{
name: “田中 健一”,
text: “適度な運動と効率的な学習のバランスで、コーディング力と体力が同時に向上しました！”,
rating: 5
},
{
name: “佐藤 美咲”,
text: “健康的な習慣を身につけながらスキルアップできる素晴らしいプログラムです。”,
rating: 5
}
];

return (
<div className=“min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 text-white” style={{ fontFamily: “‘Orbitron’, ‘Segoe UI’, sans-serif” }}>
{/* ヘッダー */}
<header className="bg-black/50 backdrop-blur-md py-6 sticky top-0 z-50">
<div className="container mx-auto px-4">
<h1 className="text-4xl md:text-5xl font-bold text-center">
<span className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
MUSCLE CODE
</span>
</h1>
<p className="text-lg md:text-xl mt-2 text-center text-gray-300">
健康的なエンジニアライフを実現
</p>
</div>
</header>

```
  {/* ヒーローセクション */}
  <section className="relative py-20 md:py-32 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 animate-pulse" />
    
    <div className="container mx-auto px-4 relative z-10 text-center">
      <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
        心と体を整えて<br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-400">
          最高のパフォーマンスを
        </span>
      </h2>
      <p className="text-lg md:text-xl mb-8 text-gray-300 max-w-2xl mx-auto">
        科学的根拠に基づいた健康的なアプローチで、<br />
        プログラミングスキルとフィットネスを両立
      </p>
      <button className="group bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-2xl flex items-center gap-2 mx-auto">
        無料体験を始める
        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>

    {/* 装飾的な要素 */}
    <div className="absolute top-10 left-10 w-20 h-20 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
    <div className="absolute bottom-10 right-10 w-32 h-32 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
  </section>

  {/* 特徴セクション */}
  <section className="py-16 container mx-auto px-4">
    <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-400">
        プログラムの特徴
      </span>
    </h2>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {features.map((feature, index) => (
        <div
          key={index}
          className={`bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border-2 transition-all cursor-pointer transform hover:scale-105 ${
            activeFeature === index
              ? 'border-cyan-400 shadow-lg shadow-cyan-500/50'
              : 'border-gray-700 hover:border-purple-500'
          }`}
          onClick={() => setActiveFeature(index)}
        >
          <div className="text-cyan-400 mb-4 flex justify-center">
            {feature.icon}
          </div>
          <h3 className="text-xl font-semibold mb-4 text-center">{feature.title}</h3>
          <p className="text-gray-300 text-center">{feature.description}</p>
        </div>
      ))}
    </div>
  </section>

  {/* メリットセクション */}
  <section className="py-16 bg-black/30">
    <div className="container mx-auto px-4">
      <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400">
          期待できる効果
        </span>
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {[
          '集中力とコーディング効率の向上',
          '肩こり・腰痛の予防と改善',
          'ストレス管理とメンタルヘルス向上',
          '持続可能なキャリア形成',
          '健康的な生活習慣の確立',
          'ワークライフバランスの改善'
        ].map((benefit, index) => (
          <div key={index} className="flex items-center gap-4 bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <Zap className="w-6 h-6 text-yellow-400 flex-shrink-0" />
            <span className="text-gray-200">{benefit}</span>
          </div>
        ))}
      </div>
    </div>
  </section>

  {/* 受講生の声 */}
  <section className="py-16 container mx-auto px-4">
    <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-400">
        受講生の声
      </span>
    </h2>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      {testimonials.map((testimonial, index) => (
        <div key={index} className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 p-8 rounded-2xl border border-gray-700">
          <div className="flex gap-1 mb-4">
            {[...Array(testimonial.rating)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <p className="text-gray-300 mb-4 italic">"{testimonial.text}"</p>
          <p className="text-cyan-400 font-semibold">- {testimonial.name}</p>
        </div>
      ))}
    </div>
  </section>

  {/* CTA */}
  <section className="py-16 bg-gradient-to-r from-pink-900/30 to-purple-900/30">
    <div className="container mx-auto px-4 text-center">
      <h2 className="text-3xl md:text-4xl font-bold mb-6">
        今すぐ健康的なエンジニアライフを始めよう
      </h2>
      <p className="text-xl mb-8 text-gray-300">
        初回無料カウンセリング実施中
      </p>
      <button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 px-12 py-4 rounded-full font-bold text-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-2xl">
        無料カウンセリングに申し込む
      </button>
      <p className="mt-6 text-sm text-gray-400">
        ※医師や専門家の監修のもと、安全で科学的なプログラムを提供しています
      </p>
    </div>
  </section>

  {/* フッター */}
  <footer className="bg-black py-8 text-center">
    <p className="text-gray-400">© 2024 MUSCLE CODE - 健康的なエンジニアライフを応援します</p>
    <p className="text-gray-500 text-sm mt-2">
      本プログラムは健康増進を目的としています。無理のない範囲で取り組んでください。
    </p>
  </footer>
</div>
```

);
};

export default MusclCodeApp;