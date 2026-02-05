import React, { useState } from 'react';

const OrderPanel = ({ selectedStock }) => {
  const [quantity, setQuantity] = useState(100);
  
  return (
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
        <div className="flex justify-between mb-2">
          <span>出来高:</span>
          <span>{selectedStock.volume.toLocaleString()}</span>
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
            <span>{quantity}株</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>発注価格</span>
            <span>{selectedStock.price.toLocaleString()}円</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>注文総額</span>
            <span>{(selectedStock.price * quantity).toLocaleString()}円</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPanel;
