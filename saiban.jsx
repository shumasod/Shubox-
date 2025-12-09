import React, { useState, useEffect, useCallback } from 'react';
import { Gavel, MessageCircle, AlertTriangle, CheckCircle, XCircle, ChevronRight, RotateCcw, Zap, Scale, FileText, Search, Bot, Trophy } from 'lucide-react';

// 被告人（教えてクレクレたち）
const defendants = [
  {
    id: 1,
    name: '初歩的質問マン',
    icon: '🙋',
    era: 'chprks',
    difficulty: 1,
    crime: 'AI時代に自分で調べない罪',
    testimony: [
      { text: 'Pythonのインストール方法がわからないんです...', hasContradiction: false },
      { text: '誰かに聞くのが一番早いと思って...', hasContradiction: true, contradictionPoint: 'AIに聞けば一瞬' },
      { text: 'ネットで調べても難しくて...', hasContradiction: true, contradictionPoint: 'ChatGPTなら初心者向けに説明してくれる' },
    ],
    evidence: ['ChatGPTの存在', 'Google検索の存在'],
    verdict: 'chprks！ChatGPTに聞けば3秒で解決する',
  },
  {
    id: 2,
    name: 'ググらない君',
    icon: '🔍',
    era: 'ggrks',
    difficulty: 1,
    crime: '検索能力の著しい欠如',
    testimony: [
      { text: 'このエラーメッセージの意味がわかりません', hasContradiction: false },
      { text: 'エラーメッセージをそのまま検索するなんて思いつきませんでした', hasContradiction: true, contradictionPoint: 'エラーメッセージはググるのが基本' },
      { text: '周りに聞ける人がいなくて...', hasContradiction: true, contradictionPoint: 'Googleという最強の相談相手がいる' },
    ],
    evidence: ['Google検索エンジン', 'Stack Overflow'],
    verdict: 'ggrks！エラーメッセージをそのままググれ',
  },
  {
    id: 3,
    name: '緊急質問野郎',
    icon: '😱',
    era: 'chprks',
    difficulty: 2,
    crime: '計画性の欠如および他人への責任転嫁',
    testimony: [
      { text: '【急募】明日までにReactを覚えたいんです！', hasContradiction: false },
      { text: '急いでるから誰かに教えてもらうしかないんです', hasContradiction: true, contradictionPoint: 'AIなら24時間即座に対応可能' },
      { text: '体系的に学ぶ時間がないんです', hasContradiction: true, contradictionPoint: 'AIに学習ロードマップを作らせれば効率的' },
      { text: '本当に急いでるんです！', hasContradiction: true, contradictionPoint: '急いでるならなおさらAIを使え' },
    ],
    evidence: ['ChatGPTの24時間対応', 'AIによる学習プラン作成機能'],
    verdict: 'chprks！急いでるならAIに学習計画を立てさせろ',
  },
  {
    id: 4,
    name: 'コピペ願望者',
    icon: '📋',
    era: 'chprks',
    difficulty: 2,
    crime: '思考放棄および丸投げ行為',
    testimony: [
      { text: 'コード全部書いてください', hasContradiction: false },
      { text: '自分で書くと時間がかかるので...', hasContradiction: true, contradictionPoint: 'AIに書かせても理解は必要' },
      { text: 'とりあえず動けばいいんです', hasContradiction: true, contradictionPoint: '理解せずにコピペは危険' },
      { text: '締め切りが近いんです', hasContradiction: true, contradictionPoint: 'AIに書かせてから理解する方が早い' },
    ],
    evidence: ['GitHub Copilot', 'ChatGPTのコード生成能力'],
    verdict: 'chprks！AIに書かせて、その後ちゃんと理解しろ',
  },
  {
    id: 5,
    name: '何度も聞くマン',
    icon: '🔄',
    era: 'chprks',
    difficulty: 2,
    crime: '学習能力の放棄および記録管理の怠慢',
    testimony: [
      { text: '前も聞いたんですけど、もう一回教えてください', hasContradiction: false },
      { text: 'メモを取るのを忘れてしまって...', hasContradiction: true, contradictionPoint: 'AIとの会話は履歴が残る' },
      { text: '同じこと何度も聞くのは申し訳ないと思ってます', hasContradiction: true, contradictionPoint: 'AIは何度聞いても怒らない' },
      { text: '人に聞く方が早いと思って...', hasContradiction: true, contradictionPoint: 'AIの履歴を見る方が早い' },
    ],
    evidence: ['ChatGPTの会話履歴機能', 'AIの無限の忍耐力'],
    verdict: 'chprks！AIの履歴を見ろ、同じこと何度聞いてもいい',
  },
  {
    id: 6,
    name: 'Wiki見ない奴',
    icon: '📖',
    era: 'ggrks',
    difficulty: 1,
    crime: '基礎的情報収集能力の欠如',
    testimony: [
      { text: 'この技術用語の意味を教えてください', hasContradiction: false },
      { text: 'Wikipediaって信用できないと聞いて...', hasContradiction: true, contradictionPoint: '技術用語の基本的な意味は十分信頼できる' },
      { text: '検索結果が多すぎて選べません', hasContradiction: true, contradictionPoint: '一番上のWikipediaをまず読め' },
    ],
    evidence: ['Wikipedia', '技術系ドキュメント'],
    verdict: 'ggrks！まずWikipediaで基本を押さえろ',
  },
  {
    id: 7,
    name: 'ふわふわ質問者',
    icon: '🌀',
    era: 'chprks',
    difficulty: 3,
    crime: '質問の具体性欠如および情報整理能力の放棄',
    testimony: [
      { text: 'なんかうまくいかないんですけど...', hasContradiction: false },
      { text: 'エラーは出てないんですけど、なんか変なんです', hasContradiction: true, contradictionPoint: '「なんか」では誰も助けられない' },
      { text: '状況を説明するのが難しくて...', hasContradiction: true, contradictionPoint: 'AIに状況整理を手伝わせろ' },
      { text: 'とにかく助けてほしいんです', hasContradiction: true, contradictionPoint: '具体的な情報がないと助けようがない' },
      { text: '専門用語がわからなくて説明できません', hasContradiction: true, contradictionPoint: 'AIに「初心者向けに」と言えば翻訳してくれる' },
    ],
    evidence: ['AIによる状況整理支援', 'ラバーダッキング効果'],
    verdict: 'chprks！まずAIに状況を整理させろ',
  },
  {
    id: 8,
    name: '教えてクレクレ大王',
    icon: '👑',
    era: 'boss',
    difficulty: 4,
    crime: '自助努力の完全放棄および他者依存の極み',
    testimony: [
      { text: '全部教えてください！！！', hasContradiction: false },
      { text: '自分で調べる時間がもったいないです', hasContradiction: true, contradictionPoint: 'AIに聞けば調べる時間は最小限' },
      { text: '人に聞いた方が正確だと思います', hasContradiction: true, contradictionPoint: 'AIの方が網羅的で正確なことも多い' },
      { text: 'お金を払ってるわけじゃないし...', hasContradiction: true, contradictionPoint: '無料のAIがある' },
      { text: 'AIは信用できません', hasContradiction: true, contradictionPoint: '人間も間違える、AIの回答を検証すればいい' },
      { text: '結局人に聞くのが一番です', hasContradiction: true, contradictionPoint: 'ggrks → chprks の進化を受け入れろ' },
    ],
    evidence: ['ChatGPT', 'Claude', 'Perplexity', 'Google検索', 'Stack Overflow'],
    verdict: 'まずググれ！それでもダメならAIに聞け！それが現代の作法だ！',
  },
];

// 異議フレーズ
const objectionPhrases = {
  ggrks: { text: 'ggrks!', subtext: 'ググレカス！', color: '#22c55e' },
  chprks: { text: 'chprks!', subtext: 'チャピレカス！', color: '#06b6d4' },
  gotcha: { text: 'そこだ！', subtext: '矛盾を発見！', color: '#eab308' },
};

export default function ChprksCourtGame() {
  const [gameState, setGameState] = useState('title'); // title, case-intro, testimony, objection, verdict, game-over, victory
  const [currentCase, setCurrentCase] = useState(0);
  const [currentTestimony, setCurrentTestimony] = useState(0);
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [showObjection, setShowObjection] = useState(null);
  const [penaltyCount, setPenaltyCount] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [solvedCases, setSolvedCases] = useState([]);
  const [dialogText, setDialogText] = useState('');
  const [dialogSpeaker, setDialogSpeaker] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEvidencePanel, setShowEvidencePanel] = useState(false);
  const [shake, setShake] = useState(false);
  const [flash, setFlash] = useState(false);

  const defendant = defendants[currentCase];
  const maxPenalties = 3;

  // テキストをタイプライター風に表示
  const typeText = useCallback((text, speaker, callback) => {
    setDialogSpeaker(speaker);
    setDialogText('');
    setIsTyping(true);
    
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDialogText(text.substring(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
        if (callback) setTimeout(callback, 500);
      }
    }, 30);
    
    return () => clearInterval(interval);
  }, []);

  // ゲーム開始
  const startGame = () => {
    setCurrentCase(0);
    setPenaltyCount(0);
    setTotalScore(0);
    setSolvedCases([]);
    startCase(0);
  };

  // ケース開始
  const startCase = (caseIndex) => {
    setCurrentCase(caseIndex);
    setCurrentTestimony(0);
    setSelectedEvidence(null);
    setGameState('case-intro');
    const def = defendants[caseIndex];
    typeText(`被告人「${def.name}」\n罪状：${def.crime}`, '裁判長');
  };

  // 証言開始
  const startTestimony = () => {
    setGameState('testimony');
    showCurrentTestimony();
  };

  // 現在の証言を表示
  const showCurrentTestimony = () => {
    const testimony = defendant.testimony[currentTestimony];
    typeText(testimony.text, defendant.name);
  };

  // 次の証言へ
  const nextTestimony = () => {
    if (currentTestimony < defendant.testimony.length - 1) {
      setCurrentTestimony(prev => prev + 1);
      setTimeout(() => showCurrentTestimony(), 300);
    } else {
      // 証言ループ
      setCurrentTestimony(0);
      setTimeout(() => showCurrentTestimony(), 300);
    }
  };

  // 前の証言へ
  const prevTestimony = () => {
    if (currentTestimony > 0) {
      setCurrentTestimony(prev => prev - 1);
      setTimeout(() => showCurrentTestimony(), 300);
    }
  };

  // 異議あり！
  const pressObjection = () => {
    const testimony = defendant.testimony[currentTestimony];
    
    if (testimony.hasContradiction) {
      // 正解！
      setFlash(true);
      setTimeout(() => setFlash(false), 500);
      
      const phrase = defendant.era === 'ggrks' ? objectionPhrases.ggrks : objectionPhrases.chprks;
      setShowObjection(phrase);
      
      setTimeout(() => {
        setShowObjection(null);
        typeText(`異議あり！\n\n${testimony.contradictionPoint}`, '検察官（あなた）', () => {
          // 全ての矛盾を指摘したかチェック
          const contradictions = defendant.testimony.filter(t => t.hasContradiction);
          const isLastContradiction = currentTestimony === defendant.testimony.findIndex(t => t === testimony);
          
          if (contradictions.length === 1 || currentTestimony === defendant.testimony.length - 1) {
            // 有罪確定
            setTimeout(() => showVerdict(), 1500);
          } else {
            // 次の証言へ
            setTimeout(() => {
              setCurrentTestimony(prev => prev + 1);
              showCurrentTestimony();
            }, 1500);
          }
        });
      }, 1500);
    } else {
      // 不正解
      setShake(true);
      setTimeout(() => setShake(false), 500);
      
      setPenaltyCount(prev => {
        const newCount = prev + 1;
        if (newCount >= maxPenalties) {
          setTimeout(() => {
            setGameState('game-over');
            typeText('ペナルティが限界に達しました...\n被告人は無罪となりました', '裁判長');
          }, 500);
        } else {
          typeText(`この証言に矛盾はありません！\nペナルティ: ${newCount}/${maxPenalties}`, '裁判長');
        }
        return newCount;
      });
    }
  };

  // 判決表示
  const showVerdict = () => {
    setGameState('verdict');
    setFlash(true);
    setTimeout(() => setFlash(false), 300);
    
    const points = defendant.difficulty * 1000 - penaltyCount * 200;
    setTotalScore(prev => prev + Math.max(points, 100));
    setSolvedCases(prev => [...prev, defendant.id]);
    
    typeText(`判決！\n\n${defendant.verdict}\n\n+${Math.max(points, 100)}点`, '裁判長');
  };

  // 次のケースへ
  const nextCase = () => {
    const nextIndex = currentCase + 1;
    if (nextIndex < defendants.length) {
      setPenaltyCount(0);
      startCase(nextIndex);
    } else {
      // 全クリア
      setGameState('victory');
      typeText(`全ての被告人を有罪にしました！\n\nあなたは真の「自己解決推進検察官」です！`, '裁判長');
    }
  };

  // ケース選択
  const selectCase = (index) => {
    if (!solvedCases.includes(defendants[index].id)) {
      setPenaltyCount(0);
      startCase(index);
    }
  };

  const getEraColor = (era) => {
    if (era === 'ggrks') return 'text-green-400 border-green-500 bg-green-500/20';
    if (era === 'chprks') return 'text-cyan-400 border-cyan-500 bg-cyan-500/20';
    return 'text-yellow-400 border-yellow-500 bg-yellow-500/20';
  };

  const getEraBg = (era) => {
    if (era === 'ggrks') return 'from-green-900/50 to-green-950/50';
    if (era === 'chprks') return 'from-cyan-900/50 to-cyan-950/50';
    return 'from-yellow-900/50 to-yellow-950/50';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-slate-900 to-gray-950 flex items-center justify-center p-2">
      <div className={`relative w-full max-w-md ${shake ? 'animate-shake' : ''}`}>
        {/* メイン画面 */}
        <div className={`relative bg-slate-900 rounded-xl border-2 border-amber-600 overflow-hidden shadow-2xl ${flash ? 'bg-white' : ''}`}>
          
          {/* タイトル画面 */}
          {gameState === 'title' && (
            <div className="p-6 text-center">
              <img 
                src="/api/files/1764398801494_image.png" 
                alt="chprks" 
                className="w-48 mx-auto mb-4 rounded-lg"
                style={{ filter: 'drop-shadow(0 0 20px rgba(217, 119, 6, 0.5))' }}
              />
              <h1 className="text-3xl font-black text-amber-500 mb-2">逆転裁判</h1>
              <p className="text-amber-600 text-lg mb-6">〜教えてクレクレを論破せよ〜</p>
              
              <div className="flex justify-center gap-3 mb-6">
                <span className="px-3 py-1 bg-green-500/20 border border-green-500 rounded text-green-400 text-sm font-bold">ggrks</span>
                <span className="text-gray-500">→</span>
                <span className="px-3 py-1 bg-cyan-500/20 border border-cyan-500 rounded text-cyan-400 text-sm font-bold">chprks</span>
              </div>
              
              <p className="text-gray-400 text-sm mb-8">
                「教えて」と聞いてくる被告人たちの<br/>
                証言の矛盾を突いて有罪にせよ！
              </p>
              
              <button
                onClick={startGame}
                className="px-10 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold rounded-xl text-xl shadow-lg hover:scale-105 transition-transform"
              >
                <Gavel className="inline mr-2" size={24} />
                裁判開始
              </button>
              
              {/* ケース一覧 */}
              <div className="mt-8 text-left">
                <p className="text-amber-600 text-sm mb-3 font-bold">📁 被告人一覧</p>
                <div className="grid grid-cols-4 gap-2">
                  {defendants.map((def, i) => (
                    <button
                      key={def.id}
                      onClick={() => selectCase(i)}
                      disabled={solvedCases.includes(def.id)}
                      className={`p-2 rounded-lg text-center transition-all ${
                        solvedCases.includes(def.id)
                          ? 'bg-gray-800 opacity-50'
                          : 'bg-slate-800 hover:bg-slate-700 border border-slate-600'
                      }`}
                    >
                      <span className="text-2xl">{def.icon}</span>
                      <p className="text-[10px] text-gray-400 mt-1 truncate">{def.name}</p>
                      {solvedCases.includes(def.id) && (
                        <CheckCircle size={12} className="text-green-500 mx-auto mt-1" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              
              {totalScore > 0 && (
                <p className="mt-4 text-amber-500 font-mono">TOTAL SCORE: {totalScore.toLocaleString()}</p>
              )}
            </div>
          )}

          {/* ケース紹介 */}
          {gameState === 'case-intro' && defendant && (
            <div className="p-4">
              {/* 法廷背景 */}
              <div className="bg-gradient-to-b from-amber-900/30 to-slate-900 rounded-lg p-4 mb-4 border border-amber-700/50">
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold border ${getEraColor(defendant.era)}`}>
                    {defendant.era === 'ggrks' ? 'ggrks世代' : defendant.era === 'chprks' ? 'chprks世代' : 'BOSS'}
                  </span>
                  <span className="text-amber-600 text-sm">難易度: {'★'.repeat(defendant.difficulty)}</span>
                </div>
                
                {/* 被告人 */}
                <div className="text-center mb-4">
                  <div className={`inline-block p-4 rounded-xl bg-gradient-to-b ${getEraBg(defendant.era)} border-2 border-slate-600`}>
                    <span className="text-6xl">{defendant.icon}</span>
                  </div>
                  <h2 className="text-xl font-bold text-white mt-3">{defendant.name}</h2>
                </div>
              </div>
              
              {/* ダイアログ */}
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-600 min-h-[120px]">
                <p className="text-amber-500 text-sm font-bold mb-2">{dialogSpeaker}</p>
                <p className="text-white whitespace-pre-line">{dialogText}</p>
                {isTyping && <span className="animate-pulse">▌</span>}
              </div>
              
              {!isTyping && (
                <button
                  onClick={startTestimony}
                  className="w-full mt-4 py-3 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-500 transition-colors"
                >
                  証言を聞く <ChevronRight className="inline" size={20} />
                </button>
              )}
            </div>
          )}

          {/* 証言パート */}
          {gameState === 'testimony' && defendant && (
            <div className="p-4">
              {/* ペナルティゲージ */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-red-500 text-sm font-bold">PENALTY</span>
                <div className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all"
                    style={{ width: `${(penaltyCount / maxPenalties) * 100}%` }}
                  />
                </div>
                <span className="text-red-400 text-sm">{penaltyCount}/{maxPenalties}</span>
              </div>
              
              {/* 被告人表示 */}
              <div className={`bg-gradient-to-b ${getEraBg(defendant.era)} rounded-lg p-4 mb-4 border border-slate-600`}>
                <div className="flex items-center gap-4">
                  <div className="text-5xl">{defendant.icon}</div>
                  <div>
                    <p className="text-white font-bold">{defendant.name}</p>
                    <p className="text-gray-400 text-sm">証言 {currentTestimony + 1}/{defendant.testimony.length}</p>
                  </div>
                </div>
              </div>
              
              {/* 証言ダイアログ */}
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-600 min-h-[100px] mb-4">
                <p className="text-amber-500 text-sm font-bold mb-2">{dialogSpeaker}</p>
                <p className="text-white text-lg">{dialogText}</p>
                {isTyping && <span className="animate-pulse">▌</span>}
              </div>
              
              {/* 操作ボタン */}
              {!isTyping && (
                <div className="space-y-3">
                  {/* 証言操作 */}
                  <div className="flex gap-2">
                    <button
                      onClick={prevTestimony}
                      disabled={currentTestimony === 0}
                      className="flex-1 py-2 bg-slate-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ← 前の証言
                    </button>
                    <button
                      onClick={nextTestimony}
                      className="flex-1 py-2 bg-slate-700 text-white rounded-lg"
                    >
                      次の証言 →
                    </button>
                  </div>
                  
                  {/* 異議ボタン */}
                  <button
                    onClick={pressObjection}
                    className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white font-black text-xl rounded-lg hover:scale-105 transition-transform shadow-lg"
                  >
                    <Zap className="inline mr-2" size={24} />
                    異議あり！
                  </button>
                  
                  {/* 証拠確認 */}
                  <button
                    onClick={() => setShowEvidencePanel(true)}
                    className="w-full py-2 bg-slate-700 text-amber-400 rounded-lg border border-amber-600/50"
                  >
                    <FileText className="inline mr-2" size={16} />
                    証拠品を確認
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 判決 */}
          {gameState === 'verdict' && defendant && (
            <div className="p-6 text-center">
              <div className="mb-6">
                <Gavel size={64} className="text-amber-500 mx-auto mb-4" />
                <h2 className="text-2xl font-black text-amber-500 mb-2">有罪！</h2>
              </div>
              
              <div className="bg-slate-800 rounded-lg p-4 border border-amber-600/50 mb-6">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <span className="text-4xl">{defendant.icon}</span>
                  <span className="text-white font-bold text-lg">{defendant.name}</span>
                </div>
                <p className={`text-lg font-bold ${defendant.era === 'ggrks' ? 'text-green-400' : 'text-cyan-400'}`}>
                  {defendant.verdict}
                </p>
              </div>
              
              <div className="bg-slate-800 rounded-lg p-4 mb-6">
                <p className="text-gray-400 text-sm mb-2">獲得スコア</p>
                <p className="text-3xl font-black text-amber-400 font-mono">
                  +{Math.max(defendant.difficulty * 1000 - penaltyCount * 200, 100)}
                </p>
              </div>
              
              <button
                onClick={nextCase}
                className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold rounded-xl text-lg"
              >
                次の裁判へ <ChevronRight className="inline" size={20} />
              </button>
            </div>
          )}

          {/* ゲームオーバー */}
          {gameState === 'game-over' && (
            <div className="p-6 text-center">
              <XCircle size={64} className="text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-black text-red-500 mb-4">無罪...</h2>
              
              <div className="bg-slate-800 rounded-lg p-4 mb-6">
                <p className="text-white whitespace-pre-line">{dialogText}</p>
              </div>
              
              <p className="text-gray-400 mb-6">被告人は自分で調べることなく去っていきました...</p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => startCase(currentCase)}
                  className="flex-1 py-3 bg-amber-600 text-white font-bold rounded-lg"
                >
                  <RotateCcw className="inline mr-2" size={18} />
                  再挑戦
                </button>
                <button
                  onClick={() => setGameState('title')}
                  className="flex-1 py-3 bg-slate-700 text-white rounded-lg"
                >
                  タイトルへ
                </button>
              </div>
            </div>
          )}

          {/* 全クリア */}
          {gameState === 'victory' && (
            <div className="p-6 text-center">
              <Trophy size={64} className="text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-black text-yellow-500 mb-2">完全勝利！</h2>
              <p className="text-amber-400 mb-6">全ての被告人を有罪にしました！</p>
              
              <img 
                src="/api/files/1764398801494_image.png" 
                alt="chprks" 
                className="w-40 mx-auto mb-4 rounded-lg"
              />
              
              <div className="bg-slate-800 rounded-lg p-4 mb-6">
                <p className="text-gray-400 text-sm mb-2">TOTAL SCORE</p>
                <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-cyan-400 to-amber-400 font-mono">
                  {totalScore.toLocaleString()}
                </p>
                <p className="text-amber-500 mt-2 font-bold">🏆 自己解決推進検察官</p>
              </div>
              
              <p className="text-gray-400 text-sm mb-6">
                ggrks → chprks<br/>
                時代は変わっても、自分で調べる精神は変わらない！
              </p>
              
              <button
                onClick={() => setGameState('title')}
                className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold rounded-xl"
              >
                タイトルへ戻る
              </button>
            </div>
          )}

          {/* 異議エフェクト */}
          {showObjection && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50">
              <div className="text-center animate-bounce">
                <p 
                  className="text-6xl font-black mb-2"
                  style={{ color: showObjection.color, textShadow: `0 0 30px ${showObjection.color}` }}
                >
                  {showObjection.text}
                </p>
                <p className="text-white text-xl font-bold">{showObjection.subtext}</p>
              </div>
            </div>
          )}

          {/* 証拠パネル */}
          {showEvidencePanel && defendant && (
            <div className="absolute inset-0 bg-slate-900/95 z-40 p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-amber-500 font-bold text-lg">📁 証拠品</h3>
                <button
                  onClick={() => setShowEvidencePanel(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕ 閉じる
                </button>
              </div>
              
              <div className="space-y-3">
                {defendant.evidence.map((ev, i) => (
                  <div key={i} className="bg-slate-800 rounded-lg p-4 border border-slate-600">
                    <div className="flex items-center gap-3">
                      {ev.includes('Google') || ev.includes('検索') ? (
                        <Search className="text-green-400" size={24} />
                      ) : ev.includes('ChatGPT') || ev.includes('AI') || ev.includes('Claude') || ev.includes('Copilot') ? (
                        <Bot className="text-cyan-400" size={24} />
                      ) : (
                        <FileText className="text-amber-400" size={24} />
                      )}
                      <p className="text-white">{ev}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-amber-900/30 rounded-lg border border-amber-600/50">
                <p className="text-amber-400 text-sm">
                  💡 ヒント: 被告人の証言と証拠を照らし合わせて、矛盾を見つけよう！
                </p>
              </div>
            </div>
          )}
        </div>

        <style jsx>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
          }
          .animate-shake {
            animation: shake 0.3s ease-in-out;
          }
        `}</style>
      </div>
    </div>
  );
}
