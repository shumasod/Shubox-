import React, { useState, useEffect, useCallback } from 'react';
import { Timer, ThumbsUp, Send, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import DOMPurify from 'dompurify';
import { v4 as uuidv4 } from 'uuid';

// 定数の定義
const MAX_ANSWER_LENGTH = 200;
const VOTE_COOLDOWN = 3000; // ミリ秒
const POST_COOLDOWN = 5000; // ミリ秒
const INITIAL_TIME = 180;

const OgiriApp = () => {
  const [theme, setTheme] = useState("銀座のホステスと間違われてそうな野菜は？");
  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [lastVoteTime, setLastVoteTime] = useState({});
  const [lastPostTime, setLastPostTime] = useState(0);
  const [error, setError] = useState("");

  // 入力値のサニタイズ
  const sanitizeInput = (input) => {
    return DOMPurify.sanitize(input.trim(), {
      ALLOWED_TAGS: [], // タグを全て除去
      ALLOWED_ATTR: [] // 属性を全て除去
    });
  };

  // 入力値のバリデーション
  const validateInput = (input) => {
    if (!input) return "回答を入力してください";
    if (input.length > MAX_ANSWER_LENGTH) return "回答が長すぎます";
    // 制御文字のチェック
    if (/[\x00-\x1F\x7F]/.test(input)) return "不正な文字が含まれています";
    return "";
  };

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

  // レート制限付きの回答追加
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const now = Date.now();
    
    // レート制限チェック
    if (now - lastPostTime < POST_COOLDOWN) {
      setError("投稿の間隔を空けてください");
      return;
    }

    const sanitizedAnswer = sanitizeInput(newAnswer);
    const validationError = validateInput(sanitizedAnswer);
    
    if (validationError) {
      setError(validationError);
      return;
    }

    const answer = {
      id: uuidv4(), // UUIDを使用して予測不可能なIDを生成
      text: sanitizedAnswer,
      votes: 0,
      author: "匿名",
      timestamp: new Date().toLocaleTimeString()
    };

    setAnswers(prev => [...prev, answer]);
    setNewAnswer("");
    setLastPostTime(now);
    setError("");
  }, [newAnswer, lastPostTime]);

  // レート制限付きの投票機能
  const handleVote = useCallback((id) => {
    const now = Date.now();
    
    // レート制限チェック
    if (lastVoteTime[id] && now - lastVoteTime[id] < VOTE_COOLDOWN) {
      setError("投票の間隔を空けてください");
      return;
    }

    setAnswers(prev => prev.map(answer => 
      answer.id === id 
        ? { ...answer, votes: answer.votes + 1 }
        : answer
    ));
    
    setLastVoteTime(prev => ({
      ...prev,
      [id]: now
    }));
    setError("");
  }, [lastVoteTime]);

  // タイマーリセット
  const resetTimer = useCallback(() => {
    setTimeLeft(INITIAL_TIME);
    setIsTimerRunning(false);
  }, []);

  // 時間のフォーマット
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

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

      {/* エラーメッセージ */}
      {error && (
        <Alert className="mb-4 bg-red-100">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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
            maxLength={MAX_ANSWER_LENGTH}
            className="flex-1 px-4 py-2 border rounded"
          />
          <button
            type="submit"
            disabled={!newAnswer.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
          >
            <Send className="w-4 h-4" />
            投稿
          </button>
        </div>
        <div className="text-sm text-gray-500 mt-1">
          残り {MAX_ANSWER_LENGTH - newAnswer.length} 文字
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
                  <p className="text-lg break-all">{answer.text}</p>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">
                      {answer.votes} 票
                    </span>
                    <button
                      onClick={() => handleVote(answer.id)}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                      disabled={lastVoteTime[answer.id] && Date.now() - lastVoteTime[answer.id] < VOTE_COOLDOWN}
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