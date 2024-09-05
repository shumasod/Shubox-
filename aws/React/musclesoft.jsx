import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Menu, Bell, MessageSquare, User } from 'lucide-react';

const App = () => {
  return (
    <div className="font-sans bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <img src="/api/placeholder/32/32" alt="Logo" className="w-8 h-8" />
            <h1 className="text-xl font-semibold text-gray-800">Muscle Code Enterprise</h1>
          </div>
          <nav className="hidden md:flex space-x-4">
            <a href="#" className="text-gray-600 hover:text-gray-900">ホーム</a>
            <a href="#" className="text-gray-600 hover:text-gray-900">ダッシュボード</a>
            <a href="#" className="text-gray-600 hover:text-gray-900">トレーニング</a>
            <a href="#" className="text-gray-600 hover:text-gray-900">分析</a>
          </nav>
          <div className="flex items-center space-x-4">
            <Input type="text" placeholder="検索..." className="hidden md:block" />
            <Button variant="ghost" size="icon"><Search className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon"><Bell className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon"><MessageSquare className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon"><User className="h-5 w-5" /></Button>
          </div>
        </div>
      </header>

      {/* Blue banner */}
      <div className="bg-blue-600 text-white py-2 px-4 text-center">
        <p>AI と Muscle Code Copilot について学ぶ Muscle Code コミュニティ カンファレンスに参加しましょう。<a href="#" className="underline">今すぐ登録 &gt;</a></p>
      </div>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left column */}
          <div className="md:w-2/3">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Muscle Code Enterprise</h2>
            <p className="text-xl text-gray-600 mb-8">モバイル対応のインテリジェントな、あなたの企業向けトレーニングプラットフォームです。</p>
            <div className="flex space-x-4">
              <Button className="bg-teal-600 hover:bg-teal-700 text-white">プランと価格を確認する</Button>
              <Button variant="outline">サインイン</Button>
            </div>
            <a href="#" className="block mt-4 text-blue-600 hover:underline">ビデオを見る &gt;</a>
          </div>
          {/* Right column */}
          <div className="md:w-1/3">
            <img src="/api/placeholder/400/300" alt="Platform preview" className="rounded-lg shadow-lg" />
          </div>
        </div>

        {/* Features grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">インテリジェントなトレーニング推奨</h3>
            <p>AIを活用して、各従業員に最適なトレーニングプログラムを提案します。</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">リアルタイムパフォーマンス分析</h3>
            <p>トレーニングデータをリアルタイムで分析し、即座にフィードバックを提供します。</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">シームレスな連携</h3>
            <p>既存の企業システムと簡単に連携し、従業員データを一元管理します。</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-4">Muscle Code Enterprise</h3>
              <p>企業の成長と従業員の健康を両立する、次世代のトレーニングソリューション</p>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-4">リンク</h4>
              <ul>
                <li><a href="#" className="hover:text-gray-300 transition">製品情報</a></li>
                <li><a href="#" className="hover:text-gray-300 transition">サポート</a></li>
                <li><a href="#" className="hover:text-gray-300 transition">お問い合わせ</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 text-center">
            <p>&copy; 2024 Muscle Code Enterprise. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
