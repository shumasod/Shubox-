import React, { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Snake Game Component
 * A classic snake game implementation with React hooks
 */
const SnakeGame = () => {
  // Game configuration
  const GRID_SIZE = 20;
  const INITIAL_SPEED = 150;
  const SPEED_INCREMENT = 5;
  const INITIAL_POSITION = [0, 0];
  const INITIAL_FOOD_POSITION = [10, 10];
  const INITIAL_DIRECTION = 'RIGHT';

  // Game state
  const [snake, setSnake] = useState([INITIAL_POSITION]);
  const [food, setFood] = useState(INITIAL_FOOD_POSITION);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [isPaused, setIsPaused] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('snakeHighScore');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Refs to avoid stale closures in event handlers
  const directionRef = useRef(direction);
  const gameOverRef = useRef(gameOver);
  const isPausedRef = useRef(isPaused);

  // Update refs when state changes
  useEffect(() => {
    directionRef.current = direction;
    gameOverRef.current = gameOver;
    isPausedRef.current = isPaused;
  }, [direction, gameOver, isPaused]);

  /**
   * Generate random food position that doesn't overlap with the snake
   */
  const generateFood = useCallback(() => {
    const snakePositions = new Set(snake.map(segment => `${segment[0]},${segment[1]}`));
    let newFood;
    
    do {
      newFood = [
        Math.floor(Math.random() * GRID_SIZE),
        Math.floor(Math.random() * GRID_SIZE)
      ];
    } while (snakePositions.has(`${newFood[0]},${newFood[1]}`));
    
    setFood(newFood);
  }, [snake]);

  /**
   * Check if the snake has collided with walls or itself
   */
  const checkCollision = useCallback((head) => {
    // Wall collision
    if (
      head[0] >= GRID_SIZE ||
      head[0] < 0 ||
      head[1] >= GRID_SIZE ||
      head[1] < 0
    ) {
      return true;
    }
    
    // Self collision (skip the head when checking)
    for (let i = 1; i < snake.length; i++) {
      const segment = snake[i];
      if (head[0] === segment[0] && head[1] === segment[1]) {
        return true;
      }
    }
    
    return false;
  }, [snake]);

  /**
   * Update high score in state and localStorage
   */
  const updateHighScore = useCallback((currentScore) => {
    if (currentScore > highScore) {
      setHighScore(currentScore);
      localStorage.setItem('snakeHighScore', currentScore.toString());
    }
  }, [highScore]);

  /**
   * Move the snake based on current direction
   */
  const moveSnake = useCallback(() => {
    if (gameOverRef.current || isPausedRef.current) return;

    setSnake(prevSnake => {
      const newSnake = [...prevSnake];
      const head = [...newSnake[0]];

      // Calculate new head position
      switch (directionRef.current) {
        case 'UP':
          head[1] -= 1;
          break;
        case 'DOWN':
          head[1] += 1;
          break;
        case 'LEFT':
          head[0] -= 1;
          break;
        case 'RIGHT':
          head[0] += 1;
          break;
        default:
          break;
      }

      // Check for collision
      if (checkCollision(head)) {
        setGameOver(true);
        updateHighScore(score);
        return prevSnake;
      }

      // Add new head
      newSnake.unshift(head);

      // Check if food was eaten
      if (head[0] === food[0] && head[1] === food[1]) {
        setScore(prevScore => {
          const newScore = prevScore + 1;
          // Increase speed slightly with each food eaten
          setSpeed(prevSpeed => Math.max(INITIAL_SPEED - (newScore * SPEED_INCREMENT), 50));
          return newScore;
        });
        generateFood();
      } else {
        // Remove tail if no food was eaten
        newSnake.pop();
      }

      return newSnake;
    });
  }, [checkCollision, food, generateFood, score, updateHighScore]);

  /**
   * Game loop
   */
  useEffect(() => {
    const gameInterval = setInterval(moveSnake, speed);
    return () => clearInterval(gameInterval);
  }, [moveSnake, speed]);

  /**
   * Handle keyboard controls
   */
  useEffect(() => {
    const handleKeyPress = (e) => {
      e.preventDefault();
      
      // Game controls
      switch (e.key) {
        case 'ArrowUp':
          if (directionRef.current !== 'DOWN') setDirection('UP');
          break;
        case 'ArrowDown':
          if (directionRef.current !== 'UP') setDirection('DOWN');
          break;
        case 'ArrowLeft':
          if (directionRef.current !== 'RIGHT') setDirection('LEFT');
          break;
        case 'ArrowRight':
          if (directionRef.current !== 'LEFT') setDirection('RIGHT');
          break;
        case ' ':
          // Space bar to pause/resume
          setIsPaused(prev => !prev);
          break;
        case 'Enter':
          // Enter to restart if game over
          if (gameOverRef.current) resetGame();
          break;
        default:
          break;
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  /**
   * Reset game to initial state
   */
  const resetGame = () => {
    setSnake([INITIAL_POSITION]);
    setFood(INITIAL_FOOD_POSITION);
    setDirection(INITIAL_DIRECTION);
    setGameOver(false);
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setIsPaused(false);
  };

  /**
   * Handle direction change from UI buttons
   */
  const handleDirectionButton = (newDirection) => {
    const current = directionRef.current;
    
    // Prevent 180-degree turns
    if (
      (newDirection === 'UP' && current !== 'DOWN') ||
      (newDirection === 'DOWN' && current !== 'UP') ||
      (newDirection === 'LEFT' && current !== 'RIGHT') ||
      (newDirection === 'RIGHT' && current !== 'LEFT')
    ) {
      setDirection(newDirection);
    }
  };

  /**
   * Toggle pause state
   */
  const togglePause = () => {
    setIsPaused(prev => !prev);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto p-4">
      {/* Game stats */}
      <div className="w-full flex justify-between mb-4">
        <div className="text-2xl font-bold">Score: {score}</div>
        <div className="text-2xl font-bold">High Score: {highScore}</div>
      </div>
      
      {/* Game board */}
      <div 
        className="relative w-full h-96 bg-gray-100 border-2 border-gray-300 rounded-lg overflow-hidden"
        aria-label="Snake game board"
        role="region"
      >
        {/* Snake segments */}
        {snake.map((segment, i) => (
          <div
            key={i}
            className={`absolute w-4 h-4 rounded-sm ${i === 0 ? 'bg-green-700' : 'bg-green-500'}`}
            style={{
              left: `${(segment[0] * 100) / GRID_SIZE}%`,
              top: `${(segment[1] * 100) / GRID_SIZE}%`,
              transition: 'all 0.1s ease',
            }}
            aria-hidden="true"
          />
        ))}
        
        {/* Food */}
        <div
          className="absolute w-4 h-4 bg-red-500 rounded-full"
          style={{
            left: `${(food[0] * 100) / GRID_SIZE}%`,
            top: `${(food[1] * 100) / GRID_SIZE}%`,
          }}
          aria-hidden="true"
        />
        
        {/* Pause overlay */}
        {isPaused && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="text-3xl font-bold text-white">PAUSED</div>
          </div>
        )}
      </div>
      
      {/* Game over message */}
      {gameOver && (
        <div className="mt-4 text-center" aria-live="assertive">
          <div className="text-xl font-bold text-red-500 mb-2">Game Over!</div>
          <button
            onClick={resetGame}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
            aria-label="Play again"
          >
            Play Again
          </button>
        </div>
      )}
      
      {/* Controls section */}
      <div className="mt-6 w-full">
        {/* Mobile controls */}
        <div className="grid grid-cols-3 gap-2 mb-4 md:hidden">
          {/* Top row - Up button */}
          <div className="col-start-2">
            <button 
              className="w-full p-3 bg-gray-200 rounded-lg active:bg-gray-300 focus:outline-none focus:ring-2"
              onClick={() => handleDirectionButton('UP')}
              aria-label="Move up"
              disabled={gameOver}
            >
              ↑
            </button>
          </div>
          
          {/* Middle row - Left, Pause/Play, Right buttons */}
          <div className="col-start-1">
            <button 
              className="w-full p-3 bg-gray-200 rounded-lg active:bg-gray-300 focus:outline-none focus:ring-2"
              onClick={() => handleDirectionButton('LEFT')}
              aria-label="Move left"
              disabled={gameOver}
            >
              ←
            </button>
          </div>
          <div className="col-start-2">
            <button 
              className="w-full p-3 bg-gray-200 rounded-lg active:bg-gray-300 focus:outline-none focus:ring-2"
              onClick={togglePause}
              aria-label={isPaused ? "Resume game" : "Pause game"}
              disabled={gameOver}
            >
              {isPaused ? '▶' : '❚❚'}
            </button>
          </div>
          <div className="col-start-3">
            <button 
              className="w-full p-3 bg-gray-200 rounded-lg active:bg-gray-300 focus:outline-none focus:ring-2"
              onClick={() => handleDirectionButton('RIGHT')}
              aria-label="Move right"
              disabled={gameOver}
            >
              →
            </button>
          </div>
          
          {/* Bottom row - Down button */}
          <div className="col-start-2">
            <button 
              className="w-full p-3 bg-gray-200 rounded-lg active:bg-gray-300 focus:outline-none focus:ring-2"
              onClick={() => handleDirectionButton('DOWN')}
              aria-label="Move down"
              disabled={gameOver}
            >
              ↓
            </button>
          </div>
        </div>
        
        {/* Instructions */}
        <div className="text-center">
          <div className="mb-2 font-medium">Controls:</div>
          <div className="hidden md:block text-sm text-gray-600 mb-1">
            Arrow keys to move • Space to pause • Enter to restart
          </div>
          <div className="md:hidden text-sm text-gray-600">
            Use on-screen buttons or swipe gestures
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnakeGame;
