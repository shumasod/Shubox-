import React from 'react';
import { Button } from "@/components/ui/button";

const App = () => {
  return (
    <div className="font-sans">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-700 via-red-700 to-orange-500 text-white py-6">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-4xl font-bold">マッスルコードスポーツアカデミー</h1>
          <nav>
            <ul className="flex space-x-4">
              <li><a href="#" className="hover:text-yellow-300 transition">ホーム</a></li>
              <li><a href="#" className="hover:text-yellow-300 transition">プログラム</a></li>
              <li><a href="#" className="hover:text-yellow-300 transition">コーチ</a></li>
              <li><a href="#" className="hover:text-yellow-300 transition">施設</a></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-gray-900">
        <div className="relative z-10 text-center text-white">
          <h2 className="text-5xl font-bold mb-4">コード力と運動能力を同時に極めろ！</h2>
          <p className="text-xl mb-8">プログラミング、相撲、バスケットボールで心技体を鍛える</p>
          <Button variant="default" size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold">
            無料体験に申し込む
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">アカデミーの特徴</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {['データ分析力', 'アルゴリズム思考', '総合的な体力', 'チームワーク'].map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">{feature}</h3>
                <p>特徴の詳細説明がここに入ります。</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">トレーニングプログラム</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {['コーディング', '相撲', 'バスケットボール'].map((program, index) => (
              <div key={index} className="bg-gray-100 p-6 rounded-lg">
                <h3 className="text-2xl font-semibold mb-4">{program}</h3>
                <p>プログラムの詳細説明がここに入ります。</p>
                <Button className="mt-4">詳細を見る</Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-800 text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">受講生の声</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: '田中太郎', role: '元プログラマー、現相撲部員' },
              { name: '鈴木花子', role: 'データサイエンティスト兼バスケットボール選手' },
              { name: '佐藤次郎', role: '高校バスケットボール部コーチ' }
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-700 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">{testimonial.name}</h3>
                <p className="text-gray-300 mb-4">{testimonial.role}</p>
                <p>「受講生のコメントがここに入ります。」</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-4">マッスルコードスポーツアカデミー</h3>
              <p>コード力と運動能力の融合で、次世代のアスリート育成</p>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-4">リンク</h4>
              <ul>
                <li><a href="#" className="hover:text-yellow-300 transition">プライバシーポリシー</a></li>
                <li><a href="#" className="hover:text-yellow-300 transition">利用規約</a></li>
                <li><a href="#" className="hover:text-yellow-300 transition">お問い合わせ</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 text-center">
            <p>&copy; 2024 マッスルコードスポーツアカデミー. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
