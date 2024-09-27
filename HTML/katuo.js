<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>カツオたたきゲーム</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f0f0f0;
        }
        #game-container {
            text-align: center;
            position: relative;
            width: 100%;
            height: 100%;
        }
        #katsuo {
            width: 150px;
            height: 100px;
            position: absolute;
            cursor: pointer;
        }
        #score, #timer {
            font-size: 24px;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div id="game-container">
        <h1>カツオたたきゲーム</h1>
        <div id="score">スコア: 0</div>
        <div id="timer">残り時間: 30秒</div>
        <svg id="katsuo" viewBox="0 0 150 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M10,50 Q75,10 140,50 Q75,90 10,50" fill="#4a86e8" stroke="#000" stroke-width="2"/>
            <circle cx="30" cy="50" r="5" fill="#000"/>
            <path d="M140,50 L145,45 M140,50 L145,55" fill="none" stroke="#000" stroke-width="2"/>
        </svg>
    </div>

    <script>
        let score = 0;
        let timeLeft = 30;
        const katsuo = document.getElementById('katsuo');
        const scoreDisplay = document.getElementById('score');
        const timerDisplay = document.getElementById('timer');
        const gameContainer = document.getElementById('game-container');

        function updateScore() {
            score++;
            scoreDisplay.textContent = `スコア: ${score}`;
            moveKatsuo();
        }

        function moveKatsuo() {
            const maxX = gameContainer.clientWidth - 150;
            const maxY = gameContainer.clientHeight - 100;
            const newX = Math.random() * maxX;
            const newY = Math.random() * maxY;
            katsuo.style.left = `${newX}px`;
            katsuo.style.top = `${newY}px`;
            katsuo.style.transform = `scaleX(${Math.random() < 0.5 ? -1 : 1})`;
        }

        function updateTimer() {
            timeLeft--;
            timerDisplay.textContent = `残り時間: ${timeLeft}秒`;
            if (timeLeft <= 0) {
                endGame();
            }
        }

        function endGame() {
            katsuo.removeEventListener('click', updateScore);
            clearInterval(timerInterval);
            alert(`ゲーム終了！あなたのスコアは${score}点です！`);
        }

        katsuo.addEventListener('click', updateScore);
        const timerInterval = setInterval(updateTimer, 1000);
        moveKatsuo();
    </script>
</body>
</html>