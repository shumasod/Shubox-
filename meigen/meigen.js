<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>名言Bot</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif;
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }

        .container {
            max-width: 700px;
            width: 100%;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            color: white;
        }

        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }

        .header p {
            font-size: 1.1rem;
            opacity: 0.9;
        }

        .quote-card {
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            transition: opacity 0.3s, transform 0.3s;
        }

        .quote-card.fade {
            opacity: 0;
            transform: scale(0.95);
        }

        .quote-mark {
            font-size: 4rem;
            color: #667eea;
            opacity: 0.3;
            line-height: 0.5;
            margin-bottom: 20px;
        }

        .quote-text {
            font-size: 1.8rem;
            color: #333;
            line-height: 1.6;
            margin-bottom: 25px;
            font-weight: 500;
        }

        .quote-author {
            text-align: right;
            font-size: 1.2rem;
            color: #666;
            font-style: italic;
        }

        .button-container {
            margin-top: 30px;
        }

        button {
            width: 100%;
            padding: 18px;
            font-size: 1.1rem;
            font-weight: bold;
            color: white;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            border-radius: 12px;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }

        button:active {
            transform: translateY(0);
        }

        .footer {
            text-align: center;
            color: white;
            margin-top: 20px;
            opacity: 0.8;
            font-size: 0.9rem;
        }

        @media (max-width: 600px) {
            .header h1 {
                font-size: 2rem;
            }
            .quote-text {
                font-size: 1.4rem;
            }
            .quote-card {
                padding: 30px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✨ 名言Bot ✨</h1>
            <p>心に響く言葉をお届けします</p>
        </div>

        <div class="quote-card" id="quoteCard">
            <div class="quote-mark">"</div>
            <div class="quote-text" id="quoteText"></div>
            <div class="quote-author" id="quoteAuthor"></div>
            
            <div class="button-container">
                <button onclick="showNewQuote()">次の名言を見る</button>
            </div>
        </div>

        <div class="footer">
            クリックするたびに新しい名言が表示されます
        </div>
    </div>

    <script>
        const quotes = [
            { text: "千里の道も一歩から", author: "老子" },
            { text: "失敗は成功のもと", author: "日本のことわざ" },
            { text: "今日できることを明日に延ばすな", author: "ベンジャミン・フランクリン" },
            { text: "成功とは、失敗から失敗へと熱意を失わずに進むことである", author: "ウィンストン・チャーチル" },
            { text: "人生とは自転車のようなものだ。倒れないようにするには走らなければならない", author: "アルベルト・アインシュタイン" },
            { text: "最も大きな危険は、目標が高すぎて達成できないことではなく、低すぎて達成してしまうことだ", author: "ミケランジェロ" },
            { text: "夢を見るから、人生は輝く", author: "モーツァルト" },
            { text: "すべての偉業は、不可能だと言われたことから始まった", author: "チャールズ・チャップリン" },
            { text: "成功の秘訣は、始めることにある", author: "マーク・トウェイン" },
            { text: "あなたができると思えばできる。できないと思えばできない", author: "ヘンリー・フォード" },
            { text: "運命は、志ある者を導き、志なき者を引きずる", author: "セネカ" },
            { text: "時間は最も貴重なものである。なぜなら、失われた時間は二度と戻らないからだ", author: "ベンジャミン・フランクリン" },
            { text: "何事も成功するまでは不可能に思えるものである", author: "ネルソン・マンデラ" },
            { text: "人間は負けたら終わりなのではない。辞めたら終わりなのだ", author: "リチャード・ニクソン" },
            { text: "未来を予測する最良の方法は、それを創造することだ", author: "ピーター・ドラッカー" }
        ];

        let currentQuoteIndex = -1;

        function getRandomQuote() {
            let randomIndex;
            do {
                randomIndex = Math.floor(Math.random() * quotes.length);
            } while (randomIndex === currentQuoteIndex && quotes.length > 1);
            
            currentQuoteIndex = randomIndex;
            return quotes[randomIndex];
        }

        function displayQuote(quote) {
            document.getElementById('quoteText').textContent = quote.text;
            document.getElementById('quoteAuthor').textContent = `— ${quote.author}`;
        }

        function showNewQuote() {
            const card = document.getElementById('quoteCard');
            card.classList.add('fade');
            
            setTimeout(() => {
                const quote = getRandomQuote();
                displayQuote(quote);
                card.classList.remove('fade');
            }, 300);
        }

        window.onload = function() {
            const quote = getRandomQuote();
            displayQuote(quote);
        };
    </script>
</body>
</html>
