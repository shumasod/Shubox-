import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const RamenGamePlayScreen = () => {
  const [water, setWater] = useState(0);
  const [temperature, setTemperature] = useState(20);
  const [noodlesCooked, setNoodlesCooked] = useState(false);
  const [gameState, setGameState] = useState('preparing'); // preparing, cooking, finished
  const [timer, setTimer] = useState(180); // 3 minutes in seconds

  useEffect(() => {
    let interval;
    if (gameState === 'cooking') {
      interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 0) {
            clearInterval(interval);
            setGameState('finished');
            return 0;
          }
          return prevTimer - 1;
        });
        setTemperature((prevTemp) => Math.max(20, prevTemp - 0.5));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  const addWater = () => {
    if (water < 100) {
      setWater(water + 10);
    }
  };

  const heatWater = () => {
    if (temperature < 100) {
      setTemperature(Math.min(100, temperature + 10));
    }
  };

  const startCooking = () => {
    if (water >= 100 && temperature >= 95) {
      setGameState('cooking');
      setNoodlesCooked(true);
    }
  };

  return (
    <div className="w-full h-screen bg-yellow-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold text-red-600 mb-4">カップラーメンを作ろう！</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="mb-4">
          <p>水量: {water}%</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <motion.div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${water}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${water}%` }}
            ></motion.div>
          </div>
          <button 
            onClick={addWater} 
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
            disabled={gameState !== 'preparing'}
          >
            水を追加
          </button>
        </div>

        <div className="mb-4">
          <p>温度: {temperature.toFixed(1)}℃</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <motion.div 
              className="bg-red-600 h-2.5 rounded-full" 
              style={{ width: `${temperature}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${temperature}%` }}
            ></motion.div>
          </div>
          <button 
            onClick={heatWater} 
            className="mt-2 bg-red-500 text-white px-4 py-2 rounded"
            disabled={gameState !== 'preparing'}
          >
            お湯を沸かす
          </button>
        </div>

        {gameState === 'preparing' && (
          <button 
            onClick={startCooking} 
            className="w-full bg-green-500 text-white px-4 py-2 rounded"
            disabled={water < 100 || temperature < 95}
          >
            調理開始！
          </button>
        )}

        {gameState === 'cooking' && (
          <div>
            <p>調理中... {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</p>
            <motion.div 
              className="w-full h-4 bg-gray-200 rounded-full overflow-hidden"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 180 }}
            >
              <motion.div 
                className="h-full bg-green-500"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 180 }}
              ></motion.div>
            </motion.div>
          </div>
        )}

        {gameState === 'finished' && (
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">完成！</p>
            <p>美味しいカップラーメンの出来上がり！</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RamenGamePlayScreen;
