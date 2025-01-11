import React, { useState, useEffect } from 'react';
import { Timer, ThumbsUp, Send, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const OgiriApp = () => {
  const [theme, setTheme] = useState("銀座のホステスと間違われてそうな野菜は？");
  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(180); // 3分
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // タイマー制御
  useEffect(() => {
    let timer;
    if (isTimerRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTimerRunning, timeLeft]);

  // 回答を追加
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newAnswer.trim()) return;
    
    const answer = {
      id: Date.now(),
      text: newAnswer,
      votes: 0,
      author: "匿名",
      timestamp: new Date().toLocaleTimeString()
    };
    
    setAnswers([...answers, answer]);
    setNewAnswer("");
  };

  // 投票機能
  const handleVote = (id) => {
    setAnswers(answers.map(answer => 
      answer.id === id 
        ? { ...answer, votes: answer.votes + 1 }
        : answer
    ));
  };

  // タイマーリセット
  const resetTimer = () => {
    setTimeLeft(180);
    setIsTimerRunning(false);
  };

  // 時間のフォーマット
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* お題カード */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">今回のお題</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl">{theme}</p>
        </CardContent>
      </Card>

      {/* タイマー */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setIsTimerRunning(!isTimerRunning)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          <Timer className="w-4 h-4" />
          {isTimerRunning ? "停止" : "開始"}
        </button>
        <button
          onClick={resetTimer}
          className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          <RefreshCw className="w-4 h-4" />
          リセット
        </button>
        <span className="text-xl font-mono">{formatTime(timeLeft)}</span>
      </div>

      {/* 回答投稿フォーム */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            placeholder="回答を入力..."
            className="flex-1 px-4 py-2 border rounded"
          />
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            <Send className="w-4 h-4" />
            投稿
          </button>
        </div>
      </form>

      {/* タイムアップアラート */}
      {timeLeft === 0 && (
        <Alert className="mb-6 bg-yellow-100">
          <AlertDescription>
            時間切れです！投票を始めましょう。
          </AlertDescription>
        </Alert>
      )}

      {/* 回答一覧 */}
      <div className="space-y-4">
        {answers
          .sort((a, b) => b.votes - a.votes)
          .map((answer) => (
            <Card key={answer.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <p className="text-lg">{answer.text}</p>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">
                      {answer.votes} 票
                    </span>
                    <button
                      onClick={() => handleVote(answer.id)}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      投票
                    </button>
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  {answer.author} - {answer.timestamp}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
};

export default OgiriApp;