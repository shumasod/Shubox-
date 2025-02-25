import React, { useState } from 'react';

const StockTradingApp = () => {
  const [activeTab, setActiveTab] = useState('chart');
  
  // サンプルデータ
  const stockList = [
    { code: '1001', name: 'テクノコープ', price: 1548.50, change: +34.20, changePercent: +2.21 },
    { code: '1002', name: 'ネットワーカー', price: 3421.00, change: -56.70, changePercent: -1.63 },
    { code: '1003', name: '未来電機', price: 789.30, change: +12.40, changePercent: +1.57 },
    { code: '1004', name: 'グリーンエナジー', price: 2345.60, change: -22.30, changePercent: -0.94 },
    { code: '1005', name: 'AIテクノロジー', price: 5678.90, change: +123.40, changePercent: +2.17 }
  ];
  
  const [selectedStock, setSelectedStock] = useState(stockList[0]);

  // チャートタイプを管理
  const [chartType, setChartType] = useState('daily');

  // テクニカル指標の表示状態
  const [indicators, setIndicators] = useState({ sma: true, rsi: true });

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white p-4 overflow-hidden">
      {/* ヘッダー */}
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">株式トレーディングプラットフォーム</h1>
        <div className="flex space-x-2">
          <button className={`px-4 py-2 rounded ${activeTab === 'chart' ? 'bg-blue-600' : 'bg-gray-700'}`}
                  onClick={() => setActiveTab('chart')}>チャート</button>
          <button className={`px-4 py-2 rounded ${activeTab === 'technical' ? 'bg-blue-600' : 'bg-gray-700'}`}
                  onClick={() => setActiveTab('technical')}>テクニカル</button>
          <button className={`px-4 py-2 rounded ${activeTab === 'portfolio' ? 'bg-blue-600' : 'bg-gray-700'}`}
                  onClick={() => setActiveTab('portfolio')}>ポートフォリオ</button>
          <button className={`px-4 py-2 rounded ${activeTab === 'watchlist' ? 'bg-blue-600' : 'bg-gray-700'}`}
                  onClick={() => setActiveTab('watchlist')}>ウォッチリスト</button>
        </div>
      </header>
      
      {/* メインコンテンツ */}
      <div className="flex flex-1 space-x-4 overflow-hidden">
        {/* 左側パネル: 銘柄リスト */}
        <div className="w-1/3 bg-gray-800 rounded-lg overflow-hidden">
          <div className="p-2 bg-gray-700 font-bold">銘柄リスト</div>
          <div className="overflow-y-auto h-full">
            <table className="w-full text-sm">
              <thead className="bg-gray-700">
                <tr>
                  <th className="p-2 text-left">コード</th>
                  <th className="p-2 text-left">銘柄名</th>
                  <th className="p-2 text-right">価格</th>
                  <th className="p-2 text-right">変動</th>
                </tr>
              </thead>
              <tbody>
                {stockList.map((stock) => (
                  <tr key={stock.code} 
                      className={`${selectedStock.code === stock.code ? 'bg-blue-900' : 'hover:bg-gray-700'} cursor-pointer`}
                      onClick={() => setSelectedStock(stock)}>
                    <td className="p-2">{stock.code}</td>
                    <td className="p-2">{stock.name}</td>
                    <td className="p-2 text-right">{stock.price.toLocaleString()}</td>
                    <td className={`p-2 text-right ${stock.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {stock.change > 0 ? '+' : ''}{stock.change} ({stock.change > 0 ? '+' : ''}{stock.changePercent}%)
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* 右側パネル: メインコンテンツ */}
        <div className="w-2/3 flex flex-col space-y-4">
          {/* タブコンテンツ */}
          <div className="flex-1 flex flex-col space-y-4">
            {/* チャートタブ */}
            {activeTab === 'chart' && (
              <>
                <div className="bg-gray-800 rounded-lg p-4 flex-1">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold">{selectedStock.code} - {selectedStock.name}</h2>
                    <div className="flex space-x-2">
                      <button className={`px-2 py-1 rounded text-xs ${chartType === 'daily' ? 'bg-blue-600' : 'bg-gray-700'}`}
                              onClick={() => setChartType('daily')}>日足</button>
                      <button className={`px-2 py-1 rounded text-xs ${chartType === 'weekly' ? 'bg-blue-600' : 'bg-gray-700'}`}
                              onClick={() => setChartType('weekly')}>週足</button>
                      <button className={`px-2 py-1 rounded text-xs ${chartType === 'monthly' ? 'bg-blue-600' : 'bg-gray-700'}`}
                              onClick={() => setChartType('monthly')}>月足</button>
                    </div>
                  </div>
                  
                  {/* チャート表示エリア */}
                  <div className="bg-gray-900 h-64 rounded flex items-center justify-center">
                    <svg width="100%" height="200" viewBox="0 0 400 200">
                      {/* チャート線 */}
                      <path d="M 0,150 L 40,130 L 80,140 L 120,100 L 160,120 L 200,90 L 240,70 L 280,80 L 320,60 L 360,40 L 400,50" 
                            fill="none" stroke="#16c784" strokeWidth="2" />
                      
                      {/* 移動平均線 */}
                      <path d="M 0,160 L 40,150 L 80,145 L 120,130 L 160,110 L 200,100 L 240,90 L 280,85 L 320,70 L 360,60 L 400,65" 
                            fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,5" />
                    </svg>
                  </div>
                </div>
                
                {/* 出来高チャート */}
                <div className="bg-gray-800 rounded-lg p-4 h-40">
                  <h3 className="font-bold mb-2">出来高</h3>
                  <div className="bg-gray-900 h-24 rounded flex items-end justify-between px-4">
                    {[5, 7, 4, 8, 6, 9, 5, 3, 7, 8].map((value, i) => (
                      <div key={i} className="w-6 bg-blue-600 mx-1" style={{ height: `${value * 10}%` }} />
                    ))}
                  </div>
                </div>
              </>
            )}
            
            {/* テクニカルタブ */}
            {activeTab === 'technical' && (
              <div className="bg-gray-800 rounded-lg p-4 flex-1">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-bold">{selectedStock.code} - {selectedStock.name} (テクニカル分析)</h2>
                </div>
                
                <div className="flex flex-wrap mb-2 space-x-2">
                  <button className={`px-2 py-1 rounded text-xs ${indicators.sma ? 'bg-blue-600' : 'bg-gray-700'}`}
                          onClick={() => setIndicators({...indicators, sma: !indicators.sma})}>
                    SMA
                  </button>
                  <button className={`px-2 py-1 rounded text-xs ${indicators.rsi ? 'bg-blue-600' : 'bg-gray-700'}`}
                          onClick={() => setIndicators({...indicators, rsi: !indicators.rsi})}>
                    RSI
                  </button>
                  <button className="px-2 py-1 rounded text-xs bg-gray-700">MACD</button>
                  <button className="px-2 py-1 rounded text-xs bg-gray-700">ボリンジャーバンド</button>
                </div>
                
                {/* テクニカルチャート */}
                <div className="bg-gray-900 h-64 rounded">
                  <svg width="100%" height="100%">
                    {/* チャート線と移動平均線 */}
                    <path d="M 0,150 L 40,130 L 80,140 L 120,100 L 160,120 L 200,90 L 240,70 L 280,80 L 320,60 L 360,40 L 400,50" 
                          fill="none" stroke="#16c784" strokeWidth="2" />
                    
                    {indicators.sma && (
                      <>
                        <path d="M 0,160 L 40,150 L 80,145 L 120,130 L 160,110 L 200,100 L 240,90 L 280,85 L 320,70 L 360,60 L 400,65" 
                              fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,5" />
                        <path d="M 0,170 L 40,165 L 80,160 L 120,155 L 160,140 L 200,130 L 240,120 L 280,110 L 320,100 L 360,90 L 400,85" 
                              fill="none" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="5,5" />
                      </>
                    )}
                  </svg>
                </div>
                
                {/* RSIチャート */}
                {indicators.rsi && (
                  <div className="mt-4 h-40 bg-gray-900 rounded p-2">
                    <div className="text-xs text-gray-400 mb-1">RSI(14)</div>
                    <svg width="100%" height="80%">
                      <path d="M 0,60 L 40,50 L 80,40 L 120,30 L 160,40 L 200,70 L 240,60 L 280,50 L 320,40 L 360,30 L 400,20" 
                            fill="none" stroke="#eab308" strokeWidth="2" />
                      <line x1="0" y1="20" x2="400" y2="20" stroke="#ef4444" strokeWidth="1" strokeDasharray="3,3" />
                      <line x1="0" y1="80" x2="400" y2="80" stroke="#16a34a" strokeWidth="1" strokeDasharray="3,3" />
                    </svg>
                  </div>
                )}
              </div>
            )}
            
            {/* ポートフォリオタブ */}
            {activeTab === 'portfolio' && (
              <div className="bg-gray-800 rounded-lg p-4 flex-1">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-bold">ポートフォリオ</h2>
                  <div className="flex">
                    <button className="px-3 py-1 rounded-l text-sm bg-blue-600">保有銘柄</button>
                    <button className="px-3 py-1 text-sm bg-gray-700">パフォーマンス</button>
                    <button className="px-3 py-1 rounded-r text-sm bg-gray-700">資産配分</button>
                  </div>
                </div>
                
                <table className="w-full text-sm">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="p-2 text-left">銘柄</th>
                      <th className="p-2 text-right">数量</th>
                      <th className="p-2 text-right">平均取得価格</th>
                      <th className="p-2 text-right">現在価格</th>
                      <th className="p-2 text-right">評価額</th>
                      <th className="p-2 text-right">損益</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-gray-700">
                      <td className="p-2">1001 テクノコープ</td>
                      <td className="p-2 text-right">100</td>
                      <td className="p-2 text-right">1,520</td>
                      <td className="p-2 text-right">1,548.50</td>
                      <td className="p-2 text-right">154,850</td>
                      <td className="p-2 text-right text-green-500">+2,850 (+1.88%)</td>
                    </tr>
                    <tr className="hover:bg-gray-700">
                      <td className="p-2">1003 未来電機</td>
                      <td className="p-2 text-right">200</td>
                      <td className="p-2 text-right">780</td>
                      <td className="p-2 text-right">789.30</td>
                      <td className="p-2 text-right">157,860</td>
                      <td className="p-2 text-right text-green-500">+1,860 (+1.19%)</td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-gray-700">
                    <tr>
                      <td className="p-2 font-bold">合計</td>
                      <td className="p-2"></td>
                      <td className="p-2"></td>
                      <td className="p-2"></td>
                      <td className="p-2 text-right font-bold">312,710</td>
                      <td className="p-2 text-right text-green-500">+4,710 (+1.53%)</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
            
            {/* ウォッチリストタブ */}
            {activeTab === 'watchlist' && (
              <div className="bg-gray-800 rounded-lg p-4 flex-1">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-bold">ウォッチリスト</h2>
                  <div className="flex space-x-2">
                    <input type="text" className="bg-gray-700 text-white px-2 py-1 rounded text-sm" placeholder="銘柄コード" />
                    <button className="bg-blue-600 px-2 py-1 rounded text-sm">追加</button>
                  </div>
                </div>
                
                <table className="w-full text-sm">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="p-2 text-left">コード</th>
                      <th className="p-2 text-left">銘柄名</th>
                      <th className="p-2 text-right">価格</th>
                      <th className="p-2 text-right">変動</th>
                      <th className="p-2 text-center">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-gray-700 cursor-pointer">
                      <td className="p-2">1002</td>
                      <td className="p-2">ネットワーカー</td>
                      <td className="p-2 text-right">3,421.00</td>
                      <td className="p-2 text-right text-red-500">-56.70 (-1.63%)</td>
                      <td className="p-2 text-center">
                        <button className="text-xs bg-red-700 px-2 py-1 rounded">削除</button>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-700 cursor-pointer">
                      <td className="p-2">1004</td>
                      <td className="p-2">グリーンエナジー</td>
                      <td className="p-2 text-right">2,345.60</td>
                      <td className="p-2 text-right text-red-500">-22.30 (-0.94%)</td>
                      <td className="p-2 text-center">
                        <button className="text-xs bg-red-700 px-2 py-1 rounded">削除</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {/* 注文パネル（常に表示） */}
          <div className="bg-gray-800 rounded-lg p-4 h-48">
            <h3 className="font-bold mb-2">注文</h3>
            <div className="flex space-x-4">
              <div className="w-1/2">
                <div className="flex justify-between mb-2">
                  <span>現在値:</span>
                  <span className={selectedStock.change > 0 ? 'text-green-500' : 'text-red-500'}>
                    {selectedStock.price.toLocaleString()} 円
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>変動率:</span>
                  <span className={selectedStock.change > 0 ? 'text-green-500' : 'text-red-500'}>
                    {selectedStock.change > 0 ? '+' : ''}{selectedStock.changePercent}%
                  </span>
                </div>
              </div>
              <div className="w-1/2">
                <div className="flex space-x-2 mb-2">
                  <button className="bg-green-600 rounded px-4 py-2 w-1/2">買い</button>
                  <button className="bg-red-600 rounded px-4 py-2 w-1/2">売り</button>
                </div>
                <div className="bg-gray-700 rounded p-2">
                  <div className="flex justify-between text-sm">
                    <span>数量</span>
                    <span>100株</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>発注価格</span>
                    <span>{selectedStock.price.toLocaleString()}円</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>注文総額</span>
                    <span>{(selectedStock.price * 100).toLocaleString()}円</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockTradingApp;
