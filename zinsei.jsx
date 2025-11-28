import React, { useState, useCallback } from 'react';
import { Users, MessageCircle, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Trophy, RefreshCw, Star, ChevronRight, Sparkles, Target, Zap, Coffee, Code, Terminal, Heart, TrendingUp, Award } from 'lucide-react';

const boardSquares = [
  { id: 0, type: 'start', name: 'スタート', description: '懇親会スタート！', icon: '🚀', effect: null },
  { id: 1, type: 'talk', name: '自己紹介マス', description: '近くの人に話しかけよう', icon: '👋', effect: { type: 'mission', mission: '隣の人に「どんな技術使ってますか？」と聞く' }, points: 10 },
  { id: 2, type: 'topic', name: '技術トーク', description: '話題カードを引く', icon: '💻', effect: { type: 'topic' }, points: 5 },
  { id: 3, type: 'event', name: 'ラッキー！', description: '同じ言語の人発見', icon: '🎯', effect: { type: 'bonus', message: '同じプログラミング言語を使う仲間を見つけた！' }, points: 30 },
  { id: 4, type: 'debate', name: '技術論争', description: 'Vim vs VSCode論争に巻き込まれる', icon: '⚔️', effect: { type: 'debate' }, points: 15 },
  { id: 5, type: 'talk', name: '名刺交換', description: '名刺またはSNSを交換しよう', icon: '💳', effect: { type: 'mission', mission: 'Twitter/GitHub/名刺を交換する' }, points: 20 },
  { id: 6, type: 'event', name: '休憩マス', description: 'ドリンクを取りに行く', icon: '🍺', effect: { type: 'rest', message: '一息ついて次の会話に備えよう' }, points: 5 },
  { id: 7, type: 'topic', name: 'キャリア相談', description: 'キャリアの話題で盛り上がる', icon: '🚀', effect: { type: 'topic', category: 'キャリア' }, points: 10 },
  { id: 8, type: 'event', name: 'アクシデント', description: '話が途切れてしまった...', icon: '😅', effect: { type: 'penalty', message: '気まずい沈黙...でも大丈夫！話題カードを使おう' }, points: -5 },
  { id: 9, type: 'talk', name: '深い話', description: '仕事の悩みを共有', icon: '🤝', effect: { type: 'mission', mission: '技術的負債やチームの課題について話す' }, points: 25 },
  { id: 10, type: 'event', name: '大当たり！', description: '気が合う人と出会った', icon: '✨', effect: { type: 'jackpot', message: '最高に気が合うエンジニア仲間を発見！' }, points: 50 },
  { id: 11, type: 'topic', name: '開発あるある', description: '本番障害の話で盛り上がる', icon: '🔥', effect: { type: 'topic', category: '開発あるある' }, points: 15 },
  { id: 12, type: 'debate', name: 'エディタ戦争', description: 'エディタ論争が勃発', icon: '⌨️', effect: { type: 'debate' }, points: 15 },
  { id: 13, type: 'talk', name: 'LT誘い', description: '勉強会の登壇に誘われる', icon: '🎤', effect: { type: 'mission', mission: '次の勉強会やLTの約束をする' }, points: 30 },
  { id: 14, type: 'event', name: 'レベルアップ', description: 'コミュ力が上がった！', icon: '⬆️', effect: { type: 'levelup', message: 'コミュ力経験値大幅アップ！' }, points: 20 },
  { id: 15, type: 'goal', name: 'ゴール', description: '懇親会マスター！', icon: '🏆', effect: { type: 'goal' }, points: 100 },
];

const topics = {
  '技術スタック': [
    'メインで使っている言語は何ですか？',
    'エディタ/IDE何使ってます？',
    'AWS派？GCP派？Azure派？',
    '最近触って面白かった技術は？',
    'TypeScript派？JavaScript派？',
  ],
  'キャリア': [
    'エンジニア歴どのくらいですか？',
    'どんな経緯でエンジニアになりました？',
    '転職何回くらいしてます？',
    '副業やフリーランスしてます？',
    'マネジメントに興味あります？',
  ],
  '開発あるある': [
    '本番環境でやらかしたことあります？',
    '一番長いデバッグ何時間でした？',
    'レガシーコードと戦った話あります？',
    '「動くからヨシ！」派？リファクタ派？',
    '締め切り前の修羅場エピソードは？',
  ],
  '働き方': [
    'フルリモート？出社？ハイブリッド？',
    '朝型エンジニア？夜型エンジニア？',
    'アジャイル？ウォーターフォール？',
    'ミーティング多い派？少ない派？',
    '1on1ってどんな感じでやってます？',
  ],
  '学習・成長': [
    '最近読んで良かった技術書は？',
    '勉強会やカンファレンス行きます？',
    'ChatGPT/Copilot活用してます？',
    '個人開発してます？',
    '新しい技術のキャッチアップどうしてます？',
  ],
};

const debates = [
  { topic: 'スペース vs タブ', optionA: 'スペース派', optionB: 'タブ派' },
  { topic: 'Vim vs VSCode', optionA: 'Vim派', optionB: 'VSCode派' },
  { topic: 'Mac vs Windows vs Linux', optionA: 'Mac派', optionB: 'Linux派' },
  { topic: 'モノリス vs マイクロサービス', optionA: 'モノリス派', optionB: 'マイクロ派' },
  { topic: 'REST vs GraphQL', optionA: 'REST派', optionB: 'GraphQL派' },
  { topic: '静的型付け vs 動的型付け', optionA: '静的派', optionB: '動的派' },
  { topic: 'フロントエンド vs バックエンド', optionA: 'フロント派', optionB: 'バック派' },
];

const DiceIcon = ({ value }) => {
  const icons = {
    1: Dice1, 2: Dice2, 3: Dice3, 4: Dice4, 5: Dice5, 6: Dice6
  };
  const Icon = icons[value] || Dice1;
  return <Icon size={64} className="text-white" />;
};

export default function EngineerLifeGame() {
  const [currentPosition, setCurrentPosition] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [diceValue, setDiceValue] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [gamePhase, setGamePhase] = useState('ready'); // ready, rolling, event, completed
  const [currentEvent, setCurrentEvent] = useState(null);
  const [conversationCount, setConversationCount] = useState(0);
  const [achievements, setAchievements] = useState([]);
  const [showTopic, setShowTopic] = useState(null);
  const [showDebate, setShowDebate] = useState(null);
  const [history, setHistory] = useState([]);

  const getLevel = () => {
    if (totalPoints >= 300) return { name: '伝説のコミュ力エンジニア', color: 'from-yellow-400 to-amber-500', icon: '👑', rank: 5 };
    if (totalPoints >= 200) return { name: 'シニアコミュ力エンジニア', color: 'from-purple-400 to-pink-500', icon: '⭐', rank: 4 };
    if (totalPoints >= 100) return { name: 'ミドルコミュ力エンジニア', color: 'from-blue-400 to-cyan-500', icon: '🚀', rank: 3 };
    if (totalPoints >= 50) return { name: 'ジュニアコミュ力エンジニア', color: 'from-green-400 to-emerald-500', icon: '🌱', rank: 2 };
    return { name: 'コミュ力インターン', color: 'from-gray-400 to-gray-500', icon: '🐣', rank: 1 };
  };

  const rollDice = useCallback(() => {
    if (gamePhase !== 'ready' || currentPosition >= 15) return;
    
    setIsRolling(true);
    setGamePhase('rolling');
    
    // Rolling animation
    let rollCount = 0;
    const rollInterval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      rollCount++;
      if (rollCount >= 10) {
        clearInterval(rollInterval);
        const finalValue = Math.floor(Math.random() * 6) + 1;
        setDiceValue(finalValue);
        setIsRolling(false);
        
        // Move player
        setTimeout(() => {
          const newPosition = Math.min(currentPosition + finalValue, 15);
          setCurrentPosition(newPosition);
          const square = boardSquares[newPosition];
          
          // Add to history
          setHistory(prev => [...prev, { position: newPosition, square: square.name, dice: finalValue }]);
          
          // Process square effect
          processSquareEffect(square);
        }, 500);
      }
    }, 100);
  }, [currentPosition, gamePhase]);

  const processSquareEffect = (square) => {
    if (square.points) {
      setTotalPoints(prev => Math.max(0, prev + square.points));
    }
    
    if (square.type === 'talk') {
      setConversationCount(prev => prev + 1);
    }

    if (square.type === 'goal') {
      setGamePhase('completed');
      setAchievements(prev => [...prev, '🏆 懇親会マスター']);
      return;
    }

    if (square.effect) {
      switch (square.effect.type) {
        case 'topic':
          const categories = Object.keys(topics);
          const category = square.effect.category || categories[Math.floor(Math.random() * categories.length)];
          const categoryTopics = topics[category];
          const randomTopic = categoryTopics[Math.floor(Math.random() * categoryTopics.length)];
          setShowTopic({ category, question: randomTopic });
          setCurrentEvent(square);
          setGamePhase('event');
          break;
        case 'debate':
          const randomDebate = debates[Math.floor(Math.random() * debates.length)];
          setShowDebate(randomDebate);
          setCurrentEvent(square);
          setGamePhase('event');
          break;
        case 'mission':
        case 'bonus':
        case 'penalty':
        case 'rest':
        case 'jackpot':
        case 'levelup':
          setCurrentEvent(square);
          setGamePhase('event');
          break;
        default:
          setGamePhase('ready');
      }
    } else {
      setGamePhase('ready');
    }
  };

  const closeEvent = () => {
    setCurrentEvent(null);
    setShowTopic(null);
    setShowDebate(null);
    setGamePhase('ready');
  };

  const resetGame = () => {
    setCurrentPosition(0);
    setTotalPoints(0);
    setDiceValue(null);
    setGamePhase('ready');
    setCurrentEvent(null);
    setConversationCount(0);
    setAchievements([]);
    setHistory([]);
    setShowTopic(null);
    setShowDebate(null);
  };

  const level = getLevel();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="max-w-md mx-auto min-h-screen relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -top-32 -left-32 animate-pulse"></div>
          <div className="absolute w-64 h-64 bg-pink-500/20 rounded-full blur-3xl -bottom-32 -right-32 animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10">
          {/* Header */}
          <div className="bg-black/30 backdrop-blur-sm p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="text-yellow-400" size={24} />
                  エンジニア人生ゲーム
                </h1>
                <p className="text-purple-300 text-sm">〜懇親会編〜</p>
              </div>
              <div className="text-right">
                <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r ${level.color} text-white text-sm font-bold`}>
                  <span>{level.icon}</span>
                  <span>{totalPoints} pt</span>
                </div>
                <p className="text-xs text-purple-300 mt-1">{level.name}</p>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex gap-2 p-3 bg-black/20">
            <div className="flex-1 bg-white/10 rounded-lg p-2 text-center">
              <Users size={16} className="mx-auto text-cyan-400" />
              <p className="text-lg font-bold text-white">{conversationCount}</p>
              <p className="text-xs text-gray-400">会話</p>
            </div>
            <div className="flex-1 bg-white/10 rounded-lg p-2 text-center">
              <Target size={16} className="mx-auto text-amber-400" />
              <p className="text-lg font-bold text-white">{currentPosition}/15</p>
              <p className="text-xs text-gray-400">進行度</p>
            </div>
            <div className="flex-1 bg-white/10 rounded-lg p-2 text-center">
              <Award size={16} className="mx-auto text-pink-400" />
              <p className="text-lg font-bold text-white">{achievements.length}</p>
              <p className="text-xs text-gray-400">実績</p>
            </div>
          </div>

          {/* Game Board */}
          <div className="p-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="grid grid-cols-4 gap-2">
                {boardSquares.map((square, index) => {
                  const isCurrentPosition = currentPosition === index;
                  const isPassed = currentPosition > index;
                  const isGoal = index === 15;
                  
                  return (
                    <div
                      key={square.id}
                      className={`
                        relative aspect-square rounded-xl flex flex-col items-center justify-center p-1 transition-all duration-300
                        ${isCurrentPosition ? 'bg-gradient-to-br from-yellow-400 to-orange-500 scale-110 shadow-lg shadow-yellow-500/50 z-10' : ''}
                        ${isPassed && !isCurrentPosition ? 'bg-white/20' : ''}
                        ${!isPassed && !isCurrentPosition ? 'bg-white/5 border border-white/10' : ''}
                        ${isGoal ? 'bg-gradient-to-br from-amber-400 to-yellow-500' : ''}
                      `}
                    >
                      <span className="text-xl">{square.icon}</span>
                      <span className={`text-[8px] text-center leading-tight mt-0.5 ${isCurrentPosition || isGoal ? 'text-white font-bold' : 'text-gray-400'}`}>
                        {square.name}
                      </span>
                      {isCurrentPosition && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center animate-bounce">
                          <span className="text-[8px]">👤</span>
                        </div>
                      )}
                      <span className="absolute top-0.5 left-1 text-[8px] text-white/50">{index}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Dice Area */}
          <div className="p-4 pt-0">
            <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              {gamePhase === 'completed' ? (
                <div className="text-center">
                  <div className="text-6xl mb-4">🎉</div>
                  <h2 className="text-2xl font-bold text-white mb-2">ゴール！</h2>
                  <p className="text-purple-300 mb-4">懇親会マスターになりました！</p>
                  <div className="bg-white/10 rounded-xl p-4 mb-4">
                    <p className="text-lg text-white">最終スコア: <span className="text-yellow-400 font-bold text-2xl">{totalPoints}</span> pt</p>
                    <p className="text-sm text-gray-400 mt-1">会話した人数: {conversationCount}人</p>
                  </div>
                  <button
                    onClick={resetGame}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl py-4 font-bold flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={20} />
                    もう一度プレイ
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex justify-center mb-4">
                    <div className={`
                      w-24 h-24 rounded-2xl bg-gradient-to-br from-red-500 to-pink-600 
                      flex items-center justify-center shadow-lg
                      ${isRolling ? 'animate-bounce' : ''}
                    `}>
                      {diceValue ? (
                        <DiceIcon value={diceValue} />
                      ) : (
                        <span className="text-4xl">🎲</span>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={rollDice}
                    disabled={gamePhase !== 'ready'}
                    className={`
                      w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all
                      ${gamePhase === 'ready' 
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/30' 
                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'}
                    `}
                  >
                    {isRolling ? (
                      <>サイコロ回転中...</>
                    ) : gamePhase === 'event' ? (
                      <>イベント発生中</>
                    ) : (
                      <>
                        <Zap size={24} />
                        サイコロを振る
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Current Square Info */}
          {gamePhase === 'ready' && currentPosition > 0 && currentPosition < 15 && (
            <div className="px-4 pb-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{boardSquares[currentPosition].icon}</span>
                  <div>
                    <p className="text-white font-bold">{boardSquares[currentPosition].name}</p>
                    <p className="text-gray-400 text-sm">{boardSquares[currentPosition].description}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* History */}
          {history.length > 0 && gamePhase !== 'completed' && (
            <div className="px-4 pb-4">
              <p className="text-xs text-gray-500 mb-2">履歴</p>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {history.slice(-5).map((h, i) => (
                  <div key={i} className="flex-shrink-0 bg-white/5 rounded-lg px-3 py-1 text-xs text-gray-400">
                    🎲{h.dice} → {h.square}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Event Modal */}
        {gamePhase === 'event' && currentEvent && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 max-w-sm w-full border border-white/20 shadow-2xl">
              <div className="text-center">
                <div className="text-5xl mb-4">{currentEvent.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{currentEvent.name}</h3>
                
                {showTopic && (
                  <div className="bg-blue-900/50 border border-blue-500/50 rounded-xl p-4 mb-4 text-left">
                    <p className="text-blue-400 text-sm mb-1">💬 {showTopic.category}</p>
                    <p className="text-white font-medium">{showTopic.question}</p>
                  </div>
                )}
                
                {showDebate && (
                  <div className="mb-4">
                    <p className="text-orange-400 text-sm mb-2">⚔️ {showDebate.topic}</p>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-blue-900/50 border border-blue-500/50 rounded-xl p-3">
                        <p className="text-blue-400 font-bold text-sm">{showDebate.optionA}</p>
                      </div>
                      <div className="flex items-center text-gray-500 font-bold text-xs">VS</div>
                      <div className="flex-1 bg-red-900/50 border border-red-500/50 rounded-xl p-3">
                        <p className="text-red-400 font-bold text-sm">{showDebate.optionB}</p>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm mt-2">相手はどっち派？聞いてみよう！</p>
                  </div>
                )}
                
                {currentEvent.effect?.mission && (
                  <div className="bg-amber-900/50 border border-amber-500/50 rounded-xl p-4 mb-4">
                    <p className="text-amber-400 text-sm mb-1">🎯 ミッション</p>
                    <p className="text-white">{currentEvent.effect.mission}</p>
                  </div>
                )}
                
                {currentEvent.effect?.message && !showTopic && !showDebate && (
                  <p className="text-gray-300 mb-4">{currentEvent.effect.message}</p>
                )}
                
                <div className={`inline-flex items-center gap-1 px-4 py-2 rounded-full mb-4 ${
                  currentEvent.points >= 0 
                    ? 'bg-emerald-900/50 text-emerald-400' 
                    : 'bg-red-900/50 text-red-400'
                }`}>
                  <Star size={16} />
                  <span className="font-bold">{currentEvent.points >= 0 ? '+' : ''}{currentEvent.points} pt</span>
                </div>
                
                <button
                  onClick={closeEvent}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl py-3 font-bold"
                >
                  OK！次へ進む
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Level Up Animation */}
        {level.rank >= 3 && gamePhase !== 'completed' && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 pointer-events-none">
            <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${level.color} text-white text-sm font-bold animate-pulse`}>
              {level.icon} {level.name}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
