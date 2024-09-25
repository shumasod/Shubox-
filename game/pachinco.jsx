import React, { useState, useEffect } from 'react';

const PachinkoMachine = () => {
  const [credits, setCredits] = useState(1000);
  const [balls, setBalls] = useState(0);
  const [jackpot, setJackpot] = useState(10000);
  const [isSpinning, setIsSpinning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setJackpot(prev => prev + 10);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const insertCredit = () => {
    if (credits >= 100) {
      setCredits(prev => prev - 100);
      setBalls(prev => prev + 10);
    }
  };

  const spin = () => {
    if (balls > 0 && !isSpinning) {
      setIsSpinning(true);
      setBalls(prev => prev - 1);
      setTimeout(() => {
        const win = Math.random() < 0.1;
        if (win) {
          setCredits(prev => prev + jackpot);
          setJackpot(10000);
        }
        setIsSpinning(false);
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col items-center p-4 bg-gray-800 text-white" style={{maxWidth: '400px', margin: 'auto'}}>
      <div className="w-full h-64 bg-red-600 rounded-t-3xl relative overflow-hidden">
        <div className="absolute top-2 left-2 right-2 h-40 bg-blue-400 rounded-xl flex items-center justify-center">
          <div className="text-4xl font-bold" style={{color: isSpinning ? '#FFD700' : '#FFF'}}>
            {isSpinning ? 'SPINNING!' : 'CR FEVER'}
          </div>
        </div>
        <div className="absolute bottom-2 left-2 right-2 h-16 bg-green-400 rounded-xl flex items-center justify-center">
          <div className="text-2xl font-bold">JACKPOT: {jackpot}</div>
        </div>
      </div>
      <div className="w-full bg-yellow-400 p-4 rounded-b-3xl">
        <div className="flex justify-between mb-4">
          <div>Credits: {credits}</div>
          <div>Balls: {balls}</div>
        </div>
        <div className="flex justify-center space-x-4">
          <button 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={insertCredit}
          >
            Insert Credit
          </button>
          <button 
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            onClick={spin}
            disabled={isSpinning}
          >
            {isSpinning ? 'Spinning...' : 'Spin'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PachinkoMachine;
