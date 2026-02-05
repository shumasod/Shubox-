import React, { useState } from 'react';
import { Coins, Wand2, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

const WizardingBankDuelPreview = () => {
  const [activeTab, setActiveTab] = useState('bank');
  const [showResult, setShowResult] = useState(true);
  const [showGameStarted, setShowGameStarted] = useState(true);

  return (
    <div className="max-w-4xl mx-auto p-4 font-sans">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-purple-800">魔法の世界へようこそ</h1>
        <p className="text-lg text-purple-600">魔法使い: ハリー・ポッター</p>
      </div>
      
      {/* タブ */}
      <div className="flex mb-6 border rounded-lg overflow-hidden">
        <button 
          className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 font-medium ${activeTab === 'bank' ? 'bg-purple-700 text-white' : 'bg-gray-100 text-gray-700'}`}
          onClick={() => setActiveTab('bank')}
        >
          <Coins className="h-5 w-5" />
          <span>グリンゴッツ銀行</span>
        </button>
        <button 
          className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 font-medium ${activeTab === 'duel' ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-700'}`}
          onClick={() => setActiveTab('duel')}
        >
          <Wand2 className="h-5 w-5" />
          <span>ダンブルドアとの決闘</span>
        </button>
      </div>
      
      {/* 銀行タブ */}
      {activeTab === 'bank' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-purple-900 text-white p-4 flex items-center gap-3">
            <Coins className="h-6 w-6" />
            <h2 className="text-xl font-bold">グリンゴッツ魔法銀行取引</h2>
          </div>
          
          <div className="p-6 space-y-6">
            {/* 銀行フォーム */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">支店を選択</label>
                <div className="border border-purple-300 rounded-md p-2.5 flex justify-between items-center">
                  <span>グリンゴッツ銀行（ロンドン本店）</span>
                  <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">ガリオン額</label>
                  <input 
                    type="text" 
                    value="100" 
                    disabled={showResult}
                    className="w-full border border-purple-300 rounded-md p-2.5"
                  />
                  <p className="text-xs text-green-600 mt-1">※100ガリオン以上で決闘可能になります</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">支店暗号</label>
                  <input 
                    type="text" 
                    value="D12" 
                    disabled={showResult}
                    className="w-full border border-purple-300 rounded-md p-2.5"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">金庫番号</label>
                <input 
                  type="text" 
                  value="687" 
                  disabled={showResult}
                  className="w-full border border-purple-300 rounded-md p-2.5"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">魔法使いの名前</label>
                <input 
                  type="text" 
                  value="ハリー・ポッター" 
                  disabled={showResult}
                  className="w-full border border-purple-300 rounded-md p-2.5"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">取引メモ（任意）</label>
                <input 
                  type="text" 
                  value="ホグワーツ学費" 
                  disabled={showResult}
                  className="w-full border border-purple-300 rounded-md p-2.5"
                />
              </div>
            </div>
            
            {/* 取引結果 */}
            {showResult && (
              <div className="space-y-4">
                <div className="bg-green-50 text-green-700 border border-green-200 rounded-md p-3 flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span>魔法振込処理が完了しました</span>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-md p-4 space-y-3">
                  <h3 className="font-medium text-purple-700 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    振込詳細
                  </h3>
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <div className="text-purple-600">ガリオン額:</div>
                    <div className="font-medium">100 G</div>
                    
                    <div className="text-purple-600">受取人:</div>
                    <div className="font-medium">ハリー・ポッター</div>
                    
                    <div className="text-purple-600">処理日時:</div>
                    <div className="font-medium">2025/3/14 12:34:56</div>
                    
                    <div className="text-purple-600">魔法参照番号:</div>
                    <div className="font-medium">G-123456</div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <h3 className="font-medium text-yellow-700 mb-2">特別招待！</h3>
                  <p className="text-sm text-yellow-600 mb-3">
                    高額取引をご利用いただきありがとうございます！ダンブルドア教授との特別決闘にご招待します。
                  </p>
                  <button 
                    onClick={() => setActiveTab('duel')}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-md font-medium flex items-center justify-center gap-2"
                  >
                    <Wand2 className="h-4 w-4" />
                    決闘を始める
                  </button>
                </div>
                
                <button
                  onClick={() => setShowResult(false)}
                  className="w-full border border-purple-300 text-purple-700 rounded-md py-2 px-4 font-medium hover:bg-purple-50"
                >
                  新しい振込を作成
                </button>
              </div>
            )}
            
            {!showResult && (
              <button
                onClick={() => setShowResult(true)}
                className="w-full bg-purple-700 hover:bg-purple-800 text-white py-2 px-4 rounded-md font-medium"
              >
                魔法振込処理開始
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* 決闘タブ */}
      {activeTab === 'duel' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-blue-900 text-white p-4 flex items-center gap-3">
            <Wand2 className="h-6 w-6" />
            <h2 className="text-xl font-bold">ダンブルドアとの魔法決闘</h2>
          </div>
          
          <div className="p-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              {!showGameStarted ? (
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-4 text-blue-800">ダンブルドア教授との魔法決闘</h2>
                  <p className="mb-6 text-blue-700">ダンブルドア教授との魔法の決闘に挑戦しましょう！あなたの魔法スキルを試す時が来ました。</p>
                  <button 
                    onClick={() => setShowGameStarted(true)}
                    className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2 px-4 rounded-md font-medium"
                  >
                    決闘を開始
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-blue-800 text-center">ダンブルドアとの決闘</h2>
                  
                  {/* プレイヤー情報 */}
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-blue-700">ハリー・ポッター (レベル 1)</h3>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{width: '80%'}}></div>
                    </div>
                    <div className="grid grid-cols-3 text-sm">
                      <p className="text-blue-700">体力: 80/100</p>
                      <p className="text-blue-700">経験値: 20/100</p>
                      <p className="text-blue-700">効果: light</p>
                    </div>
                  </div>
                  
                  {/* ダンブルドア情報 */}
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-purple-700">ダンブルドア教授</h3>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-purple-600 h-2.5 rounded-full" style={{width: '65%'}}></div>
                    </div>
                    <p className="text-sm text-purple-700">体力: 65/100 | 効果: shield</p>
                  </div>
                  
                  {/* ラウンド情報 */}
                  <div className="bg-blue-100 rounded-md p-3">
                    <p className="text-lg font-semibold text-blue-800">ラウンド: 2 | スコア: 35</p>
                  </div>
                  
                  {/* 最後のラウンド */}
                  <div className="bg-white rounded-md border border-blue-200 p-3 space-y-1">
                    <p className="text-blue-700">
                      <span className="font-medium">あなたの呪文:</span> ルーモス 
                      <span className="text-red-500"> (ダメージ: 10)</span>
                    </p>
                    <p className="text-purple-700">
                      <span className="font-medium">ダンブルドアの呪文:</span> プロテゴ 
                      <span className="text-red-500"> (ダメージ: 0)</span>
                    </p>
                  </div>
                  
                  {/* 呪文選択 */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-blue-800">呪文を選んでください:</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-md p-2 flex flex-col items-center">
                        <span className="font-medium">ルーモス</span>
                        <span className="text-xs mt-1">ダメージ: 10, 効果: light</span>
                      </button>
                      <button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-md p-2 flex flex-col items-center">
                        <span className="font-medium">エクスペクト・パトローナム</span>
                        <span className="text-xs mt-1">ダメージ: 20, 効果: patronus</span>
                      </button>
                      <button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-md p-2 flex flex-col items-center">
                        <span className="font-medium">エクスペリアームス</span>
                        <span className="text-xs mt-1">ダメージ: 15, 効果: disarm</span>
                      </button>
                      <button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-md p-2 flex flex-col items-center">
                        <span className="font-medium">ウィンガーディアム・レビオサ</span>
                        <span className="text-xs mt-1">ダメージ: 5, 効果: levitate</span>
                      </button>
                      <button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-md p-2 flex flex-col items-center col-span-2">
                        <span className="font-medium">プロテゴ</span>
                        <span className="text-xs mt-1">ダメージ: 0, 効果: shield</span>
                      </button>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setActiveTab('bank')}
                    className="w-full border border-blue-300 text-blue-700 rounded-md py-2 px-4 font-medium hover:bg-blue-50"
                  >
                    銀行に戻る
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WizardingBankDuelPreview;
