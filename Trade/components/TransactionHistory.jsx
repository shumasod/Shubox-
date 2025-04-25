import React, { useState } from 'react';
import { sampleTransactions } from '../data/sampleData';

const TransactionHistory = () => {
  const [activeTab, setActiveTab] = useState('orders'); // orders, executions, history
  
  // 表示するトランザクションタイプによってデータをフィルタリング
  const getFilteredTransactions = () => {
    switch (activeTab) {
      case 'orders':
        return sampleTransactions.filter(tx => tx.status === '注文中' || tx.status === '一部約定');
      case 'executions':
        return sampleTransactions.filter(tx => tx.status === '約定済' || tx.status === '一部約定');
      case 'history':
        return sampleTransactions; // すべての履歴
      default:
        return [];
    }
  };
  
  const filteredTransactions = getFilteredTransactions();

  return (
    <div className="bg-gray-800 rounded-lg p-4 h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold">取引履歴</h2>
        <div className="flex">
          <button 
            className={`px-3 py-1 rounded-l text-sm ${activeTab === 'orders' ? 'bg-blue-600' : 'bg-gray-700'}`}
            onClick={() => setActiveTab('orders')}
          >
            注文中
          </button>
          <button 
            className={`px-3 py-1 text-sm ${activeTab === 'executions' ? 'bg-blue-600' : 'bg-gray-700'}`}
            onClick={() => setActiveTab('executions')}
          >
            約定済
          </button>
          <button 
            className={`px-3 py-1 rounded-r text-sm ${activeTab === 'history' ? 'bg-blue-600' : 'bg-gray-700'}`}
            onClick={() => setActiveTab('history')}
          >
            全履歴
          </button>
        </div>
      </div>
      
      <div className="overflow-y-auto h-64">
        <table className="w-full text-sm">
          <thead className="bg-gray-700">
            <tr>
              <th className="p-2 text-left">日時</th>
              <th className="p-2 text-left">銘柄</th>
              <th className="p-2 text-center">種別</th>
              <th className="p-2 text-right">価格</th>
              <th className="p-2 text-right">数量</th>
              <th className="p-2 text-center">状態</th>
              <th className="p-2 text-center">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((tx, index) => (
              <tr key={index} className="hover:bg-gray-700">
                <td className="p-2">{tx.date}</td>
                <td className="p-2">{tx.code} {tx.name}</td>
                <td className={`p-2 text-center ${tx.type === '買' ? 'text-green-500' : 'text-red-500'}`}>
                  {tx.type}
                </td>
                <td className="p-2 text-right">{tx.price.toLocaleString()}</td>
                <td className="p-2 text-right">{tx.quantity}</td>
                <td className="p-2 text-center">
                  <span className={`px-2 py-1 rounded text-xs ${
                    tx.status === '約定済' ? 'bg-green-700' : 
                    tx.status === '注文中' ? 'bg-yellow-700' : 
                    tx.status === '一部約定' ? 'bg-blue-700' : 'bg-red-700'
                  }`}>
                    {tx.status}
                  </span>
                </td>
                <td className="p-2 text-center">
                  {(tx.status === '注文中' || tx.status === '一部約定') && (
                    <button className="text-xs bg-red-700 px-2 py-1 rounded">取消</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionHistory;
