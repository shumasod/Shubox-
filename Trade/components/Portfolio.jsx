import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { samplePortfolio } from '../data/sampleData';

const Portfolio = () => {
  const [activeTab, setActiveTab] = useState('holdings'); // holdings, performance, allocation
  
  // ポートフォリオの合計金額を計算
  const totalValue = samplePortfolio.reduce(
    (sum, stock) => sum + stock.currentPrice * stock.quantity, 
    0
  );
  
  // 各銘柄の割合を計算
  const portfolioData = samplePortfolio.map(stock => ({
    name: stock.name,
    value: (stock.currentPrice * stock.quantity / totalValue) * 100
  }));
  
  // 収益率でソート
  const sortedByReturn = [...samplePortfolio].sort(
    (a, b) => (b.currentPrice / b.avgCost - 1) - (a.currentPrice / a.avgCost - 1)
  );
  
  // 円グラフの色
  const COLORS = ['#16a34a', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#eab308', '#14b8a6', '#ef4444'];

  const renderContent = () => {
    switch (activeTab) {
      case 'holdings':
        return (
          <div className="overflow-y-auto h-64">
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
                {samplePortfolio.map((stock, index) => {
                  const profit = (stock.currentPrice - stock.avgCost) * stock.quantity;
                  const profitPercent = ((stock.currentPrice / stock.avgCost) - 1) * 100;
                  
                  return (
                    <tr key={index} className="hover:bg-gray-700">
                      <td className="p-2">{stock.code} {stock.name}</td>
                      <td className="p-2 text-right">{stock.quantity}</td>
                      <td className="p-2 text-right">{stock.avgCost.toLocaleString()}</td>
                      <td className="p-2 text-right">{stock.currentPrice.toLocaleString()}</td>
                      <td className="p-2 text-right">
                        {(stock.currentPrice * stock.quantity).toLocaleString()}
                      </td>
                      <td className={`p-2 text-right ${profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {profit.toLocaleString()} ({profitPercent.toFixed(2)}%)
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-700">
                <tr>
                  <td className="p-2 font-bold">合計</td>
                  <td className="p-2"></td>
                  <td className="p-2"></td>
                  <td className="p-2"></td>
                  <td className="p-2 text-right font-bold">{totalValue.toLocaleString()}</td>
                  <td className="p-2"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        );
        
      case 'performance':
        return (
          <div className="overflow-y-auto h-64">
            <table className="w-full text-sm">
              <thead className="bg-gray-700">
                <tr>
                  <th className="p-2 text-left">銘柄</th>
                  <th className="p-2 text-right">取得価格</th>
                  <th className="p-2 text-right">現在価格</th>
                  <th className="p-2 text-right">収益率</th>
                  <th className="p-2 text-right">保有期間</th>
                </tr>
              </thead>
              <tbody>
                {sortedByReturn.map((stock, index) => {
                  const returnPercent = ((stock.currentPrice / stock.avgCost) - 1) * 100;
                  
                  return (
                    <tr key={index} className="hover:bg-gray-700">
                      <td className="p-2">{stock.code} {stock.name}</td>
                      <td className="p-2 text-right">{stock.avgCost.toLocaleString()}</td>
                      <td className="p-2 text-right">{stock.currentPrice.toLocaleString()}</td>
                      <td className={`p-2 text-right ${returnPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {returnPercent.toFixed(2)}%
                      </td>
                      <td className="p-2 text-right">{stock.holdingPeriod}日</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
        
      case 'allocation':
        return (
          <div className="h-64 flex">
            <div className="w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={portfolioData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {portfolioData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value.toFixed(2)}%`, '比率']}
                    contentStyle={{ backgroundColor: '#333', border: 'none' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2">
              <table className="w-full text-sm">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="p-2 text-left">銘柄</th>
                    <th className="p-2 text-right">比率</th>
                    <th className="p-2 text-right">評価額</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolioData.map((item, index) => {
                    const stock = samplePortfolio.find(s => s.name === item.name);
                    return (
                      <tr key={index} className="hover:bg-gray-700">
                        <td className="p-2 flex items-center">
                          <div 
                            className="w-3 h-3 mr-2 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          ></div>
                          {item.name}
                        </td>
                        <td className="p-2 text-right">{item.value.toFixed(2)}%</td>
                        <td className="p-2 text-right">
                          {(stock.currentPrice * stock.quantity).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold">ポートフォリオ</h2>
        <div className="flex">
          <button 
            className={`px-3 py-1 rounded-l text-sm ${activeTab === 'holdings' ? 'bg-blue-600' : 'bg-gray-700'}`}
            onClick={() => setActiveTab('holdings')}
          >
            保有銘柄
          </button>
          <button 
            className={`px-3 py-1 text-sm ${activeTab === 'performance' ? 'bg-blue-600' : 'bg-gray-700'}`}
            onClick={() => setActiveTab('performance')}
          >
            パフォーマンス
          </button>
          <button 
            className={`px-3 py-1 rounded-r text-sm ${activeTab === 'allocation' ? 'bg-blue-600' : 'bg-gray-700'}`}
            onClick={() => setActiveTab('allocation')}
          >
            資産配分
          </button>
        </div>
      </div>
      
      {renderContent()}
    </div>
  );
};

export default Portfolio;
