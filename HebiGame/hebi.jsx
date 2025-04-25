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
=======
  const gridSize = 20;
  const [snake, setSnake] = useState([[0, 0]]);
  const [food, setFood] = useState([10, 10]);
  const [direction, setDirection] = useState('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [speed] = useState(150);
  const [isPaused, setIsPaused] = useState(false);

  // ランダムな食べ物の位置を生成（蛇の体と重ならない位置）
  const generateFood = useCallback(() => {
    let newFood;
    let isOnSnake;
    
    do {
      isOnSnake = false;
      newFood = [
        Math.floor(Math.random() * gridSize),
        Math.floor(Math.random() * gridSize),
      ];
      
      // 蛇の体と食べ物が重ならないようにチェック
      for (const segment of snake) {
        if (segment[0] === newFood[0] && segment[1] === newFood[1]) {
          isOnSnake = true;
          break;
        }
      }
    } while (isOnSnake);