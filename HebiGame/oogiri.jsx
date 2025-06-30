import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Timer, ThumbsUp, Send, RefreshCw, Trophy, Download, Shuffle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

// 定数の定義
const MAX_ANSWER_LENGTH = 200;
const VOTE_COOLDOWN = 3000;
const POST_COOLDOWN = 5000;
const INITIAL_TIME = 180;
const ERROR_DISPLAY_TIME = 3000;

// お題のプリセット
const PRESET_THEMES = [
  "銀座のホステスと間違われてそうな野菜は？",
  "こんな寿司ネタは嫌だ",
  "絶対に売れない自動販売機の中身",
  "史上最弱の必殺技",
  "最も役に立たないスマホアプリ",
  "絶対にモテない告白のセリフ"
];

// シンプルなID生成関数（uuidの代替）
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// HTML特殊文字のエスケープ（DOMPurifyの代替）
const escapeHtml = (text) => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

const OgiriApp = () => {
  const [theme, setTheme] = useState(PRESET_THEMES[0]);
  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [lastVoteTime, setLastVoteTime] = useState({});
  const [lastPostTime, setLastPostTime] = useState(0);
  const [error, setError] = useState("");
  const [votedAnswers, setVotedAnswers] = useState(new Set());
  const [showResults, setShowResults] = useState(false);
  const errorTimerRef = useRef(null);

  // 保存されたデータのstate（localStorageの代替）
  const [savedState, setSavedState] = useState(null);

  // 初回読み込み時に保存されたデータを適用
  useEffect(() => {
    if (savedState) {
      const { savedAnswers, savedTheme, savedVotes } = savedState;
      if (savedAnswers) setAnswers(savedAnswers);
      if (savedTheme) setTheme(savedTheme);
      if (savedVotes) setVotedAnswers(new Set(savedVotes));
    }
  }, [savedState]);

  // データの保存（メモリ内のみ）
  useEffect(() => {
    setSavedState({
      savedAnswers: answers,
      savedTheme: theme,
      savedVotes: Array.from(votedAnswers)
    });
  }, [answers, theme, votedAnswers]);

  // エラーメッセージの自動消去
  useEffect(() => {
    if (error) {
      if (errorTimerRef.current) {
        clearTimeout(errorTimerRef.current);
      }
      errorTimerRef.current = setTimeout(() => {
        setError("");
      }, ERROR_DISPLAY_TIME);
    }
    return () => {
      if (errorTimerRef.current) {
        clearTimeout(errorTimerRef.current);
      }
    };
  }, [error]);

  // 入力値のサニタイズと検証を統合
  const sanitizeAndValidateInput = useCallback((input) => {
    const trimmed = input.trim();
    
    if (!trimmed) return { isValid: false, error: "回答を入力してください" };
    if (trimmed.length > MAX_ANSWER_LENGTH) return { isValid: false, error: "回答が長すぎます" };
    if (/[\x00-\x1F\x7F]/.test(trimmed)) return { isValid: false, error: "不正な文字が含まれています" };
    
    // 同じ回答がないかチェック
    const isDuplicate = answers.some(answer => answer.text === trimmed);
    if (isDuplicate) return { isValid: false, error: "同じ回答が既に存在します" };
    
    return { isValid: true, sanitized: escapeHtml(trimmed) };
  }, [answers]);

  // タイマー制御
  useEffect(() => {
    let timer;
    if (isTimerRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            setShowResults(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTimerRunning, timeLeft]);

  // 回答追加（formタグを使わない実装）
  const handleSubmit = useCallback(() => {
    const now = Date.now();
    
    if (now - lastPostTime < POST_COOLDOWN) {
      setError(`投稿まで${Math.ceil((POST_COOLDOWN - (now - lastPostTime)) / 1000)}秒お待ちください`);
      return;
    }

    const validation = sanitizeAndValidateInput(newAnswer);
    
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    const answer = {
      id: generateId(),
      text: validation.sanitized,
      votes: 0,
      author: "匿名",
      timestamp: new Date().toLocaleTimeString('ja-JP')
    };

    setAnswers(prev => [...prev, answer]);
    setNewAnswer("");
    setLastPostTime(now);
    setError("");
    
    // 投稿成功のフィードバック
    if (!isTimerRunning && timeLeft === INITIAL_TIME) {
      setIsTimerRunning(true);
    }
  }, [newAnswer, lastPostTime, sanitizeAndValidateInput, isTimerRunning, timeLeft]);

  // Enterキーでの送信
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  // 投票機能
  const handleVote = useCallback((id) => {
    const now = Date.now();
    
    if (votedAnswers.has(id)) {
      setError("この回答には既に投票済みです");
      return;
    }
    
    if (lastVoteTime[id] && now - lastVoteTime[id] < VOTE_COOLDOWN) {
      setError(`投票まで${Math.ceil((VOTE_COOLDOWN - (now - lastVoteTime[id])) / 1000)}秒お待ちください`);
      return;
    }

    setAnswers(prev => prev.map(answer => 
      answer.id === id 
        ? { ...answer, votes: answer.votes + 1 }
        : answer
    ));
    
    setVotedAnswers(prev => new Set([...prev, id]));
    setLastVoteTime(prev => ({
      ...prev,
      [id]: now
    }));
    setError("");
  }, [lastVoteTime, votedAnswers]);

  // ゲームリセット
  const resetGame = useCallback(() => {
    setAnswers([]);
    setTimeLeft(INITIAL_TIME);
    setIsTimerRunning(false);
    setShowResults(false);
    setVotedAnswers(new Set());
    setLastVoteTime({});
    setError("");
  }, []);

  // お題をランダムに変更
  const shuffleTheme = useCallback(() => {
    const otherThemes = PRESET_THEMES.filter(t => t !== theme);
    const newTheme = otherThemes[Math.floor(Math.random() * otherThemes.length)];
    setTheme(newTheme);
    resetGame();
  }, [theme, resetGame]);

  // 時間のフォーマット
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // ソート済み回答（メモ化）
  const sortedAnswers = useMemo(() => {
    return [...answers].sort((a, b) => b.votes - a.votes);
  }, [answers]);

  // 上位3位の回答を取得
  const topAnswers = useMemo(() => {
    return sortedAnswers.slice(0, 3);
  }, [sortedAnswers]);

  // 結果をエクスポート
  const exportResults = useCallback(() => {
    const results = sortedAnswers.map((answer, index) => 
      `${index + 1}位: ${answer.text} (${answer.votes}票)`
    ).join('\n');
    
    const data = `大喜利結果\nお題: ${theme}\n日時: ${new Date().toLocaleString('ja-JP')}\n\n${results}`;
    
    const blob = new Blob([data], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ogiri_${new Date().getTime()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [sortedAnswers, theme]);

  return (
    <div className="max-w-4xl mx-auto p-4 min-h-screen">
      {/* お題カード */}
      <Card className="mb-6 shadow-lg border-2 border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold text-gray-800">今回のお題</CardTitle>
            <button
              onClick={shuffleTheme}
              className="flex items-center gap-2 px-3 py-1 bg-white text-blue-600 rounded-full hover:bg-blue-50 transition-colors shadow"
              aria-label="お題を変更"
            >
              <Shuffle className="w-4 h-4" />
              変更
            </button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-xl text-center font-medium">{theme}</p>
        </CardContent>
      </Card>

      {/* エラーメッセージ */}
      {error && (
        <Alert className="mb-4 bg-red-50 border-red-200 animate-shake">
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {/* コントロールパネル */}
      <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <button
          onClick={() => setIsTimerRunning(!isTimerRunning)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow"
          disabled={timeLeft === 0}
          aria-label={isTimerRunning ? "タイマー停止" : "タイマー開始"}
        >
          <Timer className="w-4 h-4" />
          {isTimerRunning ? "停止" : "開始"}
        </button>
        <button
          onClick={resetGame}
          className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors shadow"
          aria-label="ゲームをリセット"
        >
          <RefreshCw className="w-4 h-4" />
          リセット
        </button>
        <span className="text-2xl font-mono font-bold text-gray-700" role="timer" aria-live="polite">
          {formatTime(timeLeft)}
        </span>
        {showResults && answers.length > 0 && (
          <button
            onClick={exportResults}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow ml-auto"
            aria-label="結果をダウンロード"
          >
            <Download className="w-4 h-4" />
            結果を保存
          </button>
        )}
      </div>

      {/* 回答投稿エリア */}
      {!showResults && (
        <div className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="面白い回答を入力..."
              maxLength={MAX_ANSWER_LENGTH}
              className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              aria-label="回答入力"
              autoComplete="off"
            />
            <button
              onClick={handleSubmit}
              disabled={!newAnswer.trim()}
              className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 transition-colors shadow"
              aria-label="回答を投稿"
            >
              <Send className="w-4 h-4" />
              投稿
            </button>
          </div>
          <div className="text-sm text-gray-500 mt-1" aria-live="polite">
            残り {MAX_ANSWER_LENGTH - newAnswer.length} 文字
          </div>
        </div>
      )}

      {/* 結果発表モード */}
      {showResults && topAnswers.length > 0 && (
        <Card className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Trophy className="w-6 h-6 text-yellow-600" />
              結果発表！
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topAnswers.map((answer, index) => (
              <div key={answer.id} className={`p-3 mb-2 rounded-lg ${
                index === 0 ? 'bg-yellow-200' : 
                index === 1 ? 'bg-gray-100' : 
                'bg-orange-100'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</span>
                  <span className="font-bold">{answer.text}</span>
                  <span className="ml-auto text-sm font-medium">{answer.votes} 票</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 回答一覧 */}
      <div className="space-y-3">
        {sortedAnswers.map((answer, index) => (
          <Card 
            key={answer.id} 
            className={`transition-all duration-300 hover:shadow-lg ${
              showResults && index < 3 ? 'ring-2 ring-yellow-400' : ''
            }`}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <p className="text-lg break-words" dangerouslySetInnerHTML={{ __html: answer.text }} />
                  <div className="mt-2 text-sm text-gray-500">
                    {answer.author} - {answer.timestamp}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-lg font-bold ${
                    answer.votes > 0 ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {answer.votes} 票
                  </span>
                  <button
                    onClick={() => handleVote(answer.id)}
                    className={`flex items-center gap-1 px-4 py-2 rounded-lg transition-all ${
                      votedAnswers.has(answer.id)
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-100 text-blue-600 hover:bg-blue-200 hover:scale-105'
                    }`}
                    disabled={votedAnswers.has(answer.id)}
                    aria-label={votedAnswers.has(answer.id) ? "投票済み" : "投票する"}
                  >
                    <ThumbsUp className={`w-4 h-4 ${votedAnswers.has(answer.id) ? 'fill-current' : ''}`} />
                    {votedAnswers.has(answer.id) ? '投票済み' : '投票'}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 回答がない場合のメッセージ */}
      {answers.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">まだ回答がありません</p>
          <p className="mt-2">最初の回答を投稿してみましょう！</p>
        </div>
      )}
    </div>
  );
};

// カスタムCSSアニメーション
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
  .animate-shake {
    animation: shake 0.3s ease-in-out;
  }
`;
document.head.appendChild(style);

export default OgiriApp;
