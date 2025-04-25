import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { calculateTechnicalIndicators } from '../utils/technicalAnalysis';

const TechnicalIndicators = ({ stockData }) => {
  const [selectedIndicators, setSelectedIndicators] = useState({
    sma: true,
    ema: false,
    rsi: true,
    macd: false,
    bollingerBands: false
  });

  // 指標の表示/非表示を切り替える
  const toggleIndicator = (indicator) => {
    setSelectedIndicators({
      ...selectedIndicators,
      [indicator]: !selectedIndicators[indicator]
    });
  };

  // テクニカル指標を計算
  const dataWithIndicators = calculateTechnicalIndicators(stockData);

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-wrap mb-2 space-x-2">
        <button 
          className={`px-2 py-1 rounded text-xs ${selectedIndicators.sma ? 'bg-blue-600' : 'bg-gray-700'}`}
          onClick={() => toggleIndicator('sma')}
        >
          SMA
        </button>
        <button 
          className={`px-2 py-1 rounded text-xs ${selectedIndicators.ema ? 'bg-blue-600' : 'bg-gray-700'}`}
          onClick={() => toggleIndicator('ema')}
        >
          EMA
        </button>
        <button 
          className={`px-2 py-1 rounded text-xs ${selectedIndicators.rsi ? 'bg-blue-600' : 'bg-gray-700'}`}
          onClick={() => toggleIndicator('rsi')}
        >
          RSI
        </button>
        <button 
          className={`px-2 py-1 rounded text-xs ${selectedIndicators.macd ? 'bg-blue-600' : 'bg-gray-700'}`}
          onClick={() => toggleIndicator('macd')}
        >
          MACD
        </button>
        <button 
          className={`px-2 py-1 rounded text-xs ${selectedIndicators.bollingerBands ? 'bg-blue-600' : 'bg-gray-700'}`}
          onClick={() => toggleIndicator('bollingerBands')}
        >
          ボリンジャーバンド
        </button>
      </div>

      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dataWithIndicators} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="date" stroke="#888" />
            <YAxis domain={['auto', 'auto']} stroke="#888" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#333', border: 'none' }}
              itemStyle={{ color: '#fff' }}
              labelStyle={{ color: '#999' }}
            />
            <Legend />
            
            {/* 株価 */}
            <Line type="monotone" dataKey="close" stroke="#16c784" name="終値" dot={false} />
            
            {/* SMA（単純移動平均線） */}
            {selectedIndicators.sma && (
              <>
                <Line type="monotone" dataKey="sma20" stroke="#3b82f6" name="SMA(20)" dot={false} strokeDasharray="3 3" />
                <Line type="monotone" dataKey="sma50" stroke="#8b5cf6" name="SMA(50)" dot={false} strokeDasharray="3 3" />
              </>
            )}
            
            {/* EMA（指数移動平均線） */}
            {selectedIndicators.ema && (
              <>
                <Line type="monotone" dataKey="ema12" stroke="#ec4899" name="EMA(12)" dot={false} />
                <Line type="monotone" dataKey="ema26" stroke="#f97316" name="EMA(26)" dot={false} />
              </>
            )}
            
            {/* ボリンジャーバンド */}
            {selectedIndicators.bollingerBands && (
              <>
                <Line type="monotone" dataKey="upperBand" stroke="#94a3b8" name="上限バンド" dot={false} />
                <Line type="monotone" dataKey="lowerBand" stroke="#94a3b8" name="下限バンド" dot={false} />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* RSIとMACDの表示エリア（選択されている場合） */}
      {(selectedIndicators.rsi || selectedIndicators.macd) && (
        <div className="mt-4 h-32">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dataWithIndicators} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="date" stroke="#888" />
              <YAxis domain={selectedIndicators.rsi ? [0, 100] : ['auto', 'auto']} stroke="#888" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#333', border: 'none' }}
                itemStyle={{ color: '#fff' }}
                labelStyle={{ color: '#999' }}
              />
              <Legend />
              
              {/* RSI */}
              {selectedIndicators.rsi && (
                <Line type="monotone" dataKey="rsi" stroke="#eab308" name="RSI(14)" dot={false} />
              )}
              
              {/* MACD */}
              {selectedIndicators.macd && (
                <>
                  <Line type="monotone" dataKey="macd" stroke="#ec4899" name="MACD" dot={false} />
                  <Line type="monotone" dataKey="signal" stroke="#8b5cf6" name="シグナル" dot={false} />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default TechnicalIndicators;
