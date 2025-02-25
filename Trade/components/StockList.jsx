import React from 'react';

const StockList = ({ stocks, selectedStock, onSelectStock }) => {
  return (
    <div className="overflow-y-auto h-full">
      <table className="w-full text-sm">
        <thead className="bg-gray-700">
          <tr>
            <th className="p-2 text-left">コード</th>
            <th className="p-2 text-left">銘柄名</th>
            <th className="p-2 text-right">価格</th>
            <th className="p-2 text-right">変動</th>
            <th className="p-2 text-right">出来高</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock) => (
            <tr 
              key={stock.code} 
              className={`${selectedStock.code === stock.code ? 'bg-blue-900' : 'hover:bg-gray-700'} cursor-pointer`}
              onClick={() => onSelectStock(stock)}
            >
              <td className="p-2">{stock.code}</td>
              <td className="p-2">{stock.name}</td>
              <td className="p-2 text-right">{stock.price.toLocaleString()}</td>
              <td className={`p-2 text-right ${stock.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {stock.change > 0 ? '+' : ''}{stock.change} ({stock.change > 0 ? '+' : ''}{stock.changePercent}%)
              </td>
              <td className="p-2 text-right">{stock.volume.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StockList;
