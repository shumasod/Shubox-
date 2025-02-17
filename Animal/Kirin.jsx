import React, { useState, useEffect } from 'react';

const GiraffeGame = () => {
  const [score, setScore] = useState(0);
  const [giraffePosition, setGiraffePosition] = useState({ x: 50, y: 50 });
  const [leafPosition, setLeafPosition] = useState({ x: 200, y: 200 });
  const [isGameOver, setIsGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  // Move giraffe with arrow keys
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (isGameOver) return;

      const speed = 20;
      const newPosition = { ...giraffePosition };

      switch (e.key) {
        case 'ArrowUp':
          newPosition.y = Math.max(0, giraffePosition.y - speed);
          break;
        case 'ArrowDown':
          newPosition.y = Math.min(400, giraffePosition.y + speed);
          break;
        case 'ArrowLeft':
          newPosition.x = Math.max(0, giraffePosition.x - speed);
          break;
        case 'ArrowRight':
          newPosition.x = Math.min(400, giraffePosition.x + speed);
          break;
        default:
          return;
      }

      setGiraffePosition(newPosition);
      checkCollision(newPosition);
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [giraffePosition, isGameOver]);

  // Timer
  useEffect(() => {
    if (timeLeft > 0 && !isGameOver) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      setIsGameOver(true);
    }
  }, [timeLeft, isGameOver]);

  // Check if giraffe catches the leaf
  const checkCollision = (giraffePos) => {
    const distance = Math.sqrt(
      Math.pow(giraffePos.x - leafPosition.x, 2) + 
      Math.pow(giraffePos.y - leafPosition.y, 2)
    );

    if (distance < 50) {
      setScore(prev => prev + 1);
      generateNewLeaf();
    }
  };

  // Generate new leaf position
  const generateNewLeaf = () => {
    setLeafPosition({
      x: Math.floor(Math.random() * 350),
      y: Math.floor(Math.random() * 350)
    });
  };

  // Restart game
  const restartGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGiraffePosition({ x: 50, y: 50 });
    generateNewLeaf();
    setIsGameOver(false);
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold mb-2">Giraffe Leaf Collector</h1>
        <div className="flex justify-between mb-4">
          <p className="text-lg">Score: {score}</p>
          <p className="text-lg">Time: {timeLeft}s</p>
        </div>
      </div>

      <div className="relative w-full h-96 bg-green-100 rounded-lg border-2 border-green-500">
        {/* Giraffe */}
        <div
          className="absolute w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center"
          style={{
            left: giraffePosition.x,
            top: giraffePosition.y,
            transition: 'all 0.1s'
          }}
        >
          🦒
        </div>

        {/* Leaf */}
        <div
          className="absolute w-8 h-8 flex items-center justify-center"
          style={{
            left: leafPosition.x,
            top: leafPosition.y
          }}
        >
          🌿
        </div>
      </div>

      {isGameOver && (
        <div className="text-center mt-4">
          <h2 className="text-xl font-bold mb-2">Game Over!</h2>
          <p className="mb-4">Final Score: {score}</p>
          <button
            onClick={restartGame}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
          >
            Play Again
          </button>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        <p>使い方:</p>
        <ul className="list-disc pl-5">
          <li>矢印キーでキリンを動かします</li>
          <li>葉っぱを集めてスコアを獲得します</li>
          <li>制限時間は30秒です</li>
        </ul>
      </div>
    </div>
  );
};

export default GiraffeGame;
