import React from 'react';
import { Button } from "@/components/ui/button";

const App = () => {
  const features = [
    {
      title: 'データ分析力',
      description: 'スポーツデータを解析し、最適なトレーニング方法を見つけ出す能力を養います。'
    },
    {
      title: 'アルゴリズム思考',
      description: '論理的思考力を高め、問題解決能力を鍛えることでプレイの質を向上させます。'
    },
    {
      title: '総合的な体力',
      description: '筋力、持久力、柔軟性など多角的な体力トレーニングを提供します。'
    },
    {
      title: 'チームワーク',
      description: 'コードの共同開発とスポーツを通じて、効果的なコミュニケーション能力を育成します。'
    }
  ];

  const programs = [
    {
      title: 'コーディング',
      description: 'Python、JavaScriptなどを使ったプログラミング基礎から応用まで。スポーツ分析アプリの開発も行います。',
      icon: '💻'
    },
    {
      title: '相撲',
      description: '日本の伝統武道である相撲を通じて、バランス感覚と瞬発力、そして礼節を学びます。',
      icon: '🥋'
    },
    {
      title: 'バスケットボール',
      description: 'チームプレーの基本からアドバンスドな戦術まで、データ分析を取り入れた現代的な指導法で上達を目指します。',
      icon: '🏀'
    }
  ];

  const testimonials = [
    {
      name: '田中太郎',
      role: '元プログラマー、現相撲部員',
      comment: 'プログラミングと相撲の融合で、論理的思考と身体能力の両方が飛躍的に向上しました。異なる分野のスキルが互いに高め合うことを実感しています。'
    },
    {
      name: '鈴木花子',
      role: 'データサイエンティスト兼バスケットボール選手',
      comment: 'データ分析スキルを活かしてバスケットボールのプレイを改善できるようになりました。統計的思考がコート上での判断力を高めてくれています。'
    },
    {
      name: '佐藤次郎',
      role: '高校バスケットボール部コーチ',
      comment: 'コーディングを学ぶことで選手のパフォーマンス分析が可能になり、指導法が劇的に改善しました。現代のスポーツ指導に必須のスキルです。'
    }
  ];

  return (
    <div className="font-sans min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-700 via-red-700 to-orange-500 text-white py-6 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 md:mb-0">マッスルコードスポーツアカデミー</h1>
          <nav className="w-full md:w-auto">
            <ul className="flex flex-wrap justify-center md:justify-end space-x-2 md:space-x-6">
              <li><a href="#home" className="hover:text-yellow-300 transition px-3 py-2 block">ホーム</a></li>
              <li><a href="#features" className="hover:text-yellow-300 transition px-3 py-2 block">特徴</a></li>
              <li><a href="#programs" className="hover:text-yellow-300 transition px-3 py-2 block">プログラム</a></li>
              <li><a href="#testimonials" className="hover:text-yellow-300 transition px-3 py-2 block">受講生の声</a></li>
              <li><a href="#contact" className="hover:text-yellow-300 transition px-3 py-2 block">お問い合わせ</a></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative flex items-center justify-center overflow-hidden bg-gray-900 py-24 md:py-32 lg:py-48">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/80 to-black/90 z-0"></div>
        <div className="absolute inset-0 opacity-20 bg-[url('/api/placeholder/1200/800')] bg-cover bg-center z-0"></div>
        <div className="relative z-10 text-center text-white container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">コード力と運動能力を<span className="text-yellow-400">同時に極めろ！</span></h2>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">プログラミング、相撲、バスケットボールで心技体を鍛える次世代のスポーツアカデミー</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button variant="default" size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold">
              無料体験に申し込む
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
              カリキュラムを見る
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">アカデミーの特徴</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">コード力と運動能力を融合させた独自のプログラムで、身体と頭脳の両方を鍛えます</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md transition-transform hover:translate-y-[-5px]">
                <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section id="programs" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">トレーニングプログラム</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">それぞれの得意分野を活かしながら、総合的なスキル向上を目指します</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {programs.map((program, index) => (
              <div key={index} className="bg-gray-100 p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{program.icon}</div>
                <h3 className="text-2xl font-semibold mb-4">{program.title}</h3>
                <p className="text-gray-600 mb-6">{program.description}</p>
                <Button className="mt-4 w-full">詳細を見る</Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 bg-gray-800 text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">受講生の声</h2>
          <p className="text-center text-gray-300 mb-12 max-w-2xl mx-auto">実際に参加された方々の体験談をご紹介します</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-700 p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-500 mr-4 flex items-center justify-center text-xl font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{testimonial.name}</h3>
                    <p className="text-gray-300">{testimonial.role}</p>
                  </div>
                </div>
                <p className="italic">「{testimonial.comment}」</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-700 to-red-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">あなたも始めてみませんか？</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">最初の1ヶ月は入会金無料キャンペーン実施中！</p>
          <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8">
            今すぐ申し込む
          </Button>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">お問い合わせ</h2>
          <div className="max-w-3xl mx-auto bg-gray-100 p-8 rounded-lg shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">アクセス</h3>
                <p className="mb-2">〒123-4567</p>
                <p className="mb-2">東京都渋谷区マッスルコード1-2-3</p>
                <p className="mb-2">渋谷駅から徒歩10分</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">営業時間</h3>
                <p className="mb-2">平日: 10:00 - 21:00</p>
                <p className="mb-2">土日祝: 9:00 - 18:00</p>
                <p className="mb-2">定休日: 毎週月曜日</p>
              </div>
            </div>
            <div className="text-center">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white font-bold">
                お問い合わせフォームへ
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">マッスルコードスポーツアカデミー</h3>
              <p className="mb-4">コード力と運動能力の融合で、次世代のアスリート育成</p>
              <div className="flex space-x-4">
                <a href="#" aria-label="Twitter" className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center hover:bg-blue-600 transition">X</a>
                <a href="#" aria-label="Instagram" className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center hover:bg-pink-600 transition">IG</a>
                <a href="#" aria-label="YouTube" className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center hover:bg-red-700 transition">YT</a>
              </div>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-4">リンク</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-yellow-300 transition">会社概要</a></li>
                <li><a href="#" className="hover:text-yellow-300 transition">プライバシーポリシー</a></li>
                <li><a href="#" className="hover:text-yellow-300 transition">利用規約</a></li>
                <li><a href="#" className="hover:text-yellow-300 transition">よくある質問</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-4">ニュースレター登録</h4>
              <p className="mb-4">最新情報やお得なキャンペーン情報をお届けします</p>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="メールアドレス" 
                  className="px-4 py-2 rounded-l text-black w-full"
                  aria-label="メールアドレス"
                />
                <Button className="rounded-l-none">登録</Button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center">
            <p>&copy; {new Date().getFullYear()} マッスルコードスポーツアカデミー. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
