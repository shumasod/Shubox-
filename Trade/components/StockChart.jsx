import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StockChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
        <XAxis dataKey="date" stroke="#888" />
        <YAxis domain={['auto', 'auto']} stroke="#888" />
        <Tooltip
          contentStyle={{ backgroundColor: '#333', border: 'none' }}
          itemStyle={{ color: '#fff' }}
          labelStyle={{ color: '#999' }}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="close" 
          stroke="#16c784" 
          activeDot={{ r: 8 }} 
          dot={false} 
          strokeWidth={2}
        />
        <Line 
          type="monotone" 
          dataKey="open" 
          stroke="#ea3943" 
          dot={false} 
          strokeWidth={1}
          strokeDasharray="5 5"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

// キャンドルスティックチャートのデータポイントを描画するカスタムコンポーネント
// 必要に応じて実装
const CandlestickBar = (props) => {
  const { x, y, width, low, high, open, close } = props;
  const isGrowing = close > open;
  const color = isGrowing ? '#16c784' : '#ea3943'; // 上昇は緑、下落は赤

  return (
    <g>
      {/* 高値と安値を結ぶライン */}
      <line x1={x + width / 2} y1={y} x2={x + width / 2} y2={y + high - low} stroke={color} />
      {/* キャンドルの本体 */}
      <rect
        x={x}
        y={isGrowing ? y + high - close : y + high - open}
        width={width}
        height={isGrowing ? close - open : open - close}
        fill={color}
        stroke={color}
      />
    </g>
  );
};

export default StockChart;
