import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Hand, Trophy, XCircle, Minus, CreditCard, Gamepad2, RotateCcw, Star } from 'lucide-react';

// 定数定義
const BANK_LIST = [
  { code: 'MUFG', name: '三菱UFJ銀行', color: 'bg-red-500' },
  { code: 'MIZUHO', name: 'みずほ銀行', color: 'bg-blue-500' },
  { code: 'SMBC', name: '三井住友銀行', color: 'bg-green-500' },
  { code: 'JAPAN_POST', name: 'ゆうちょ銀行', color: 'bg-orange-500' }
];

const GAME_CHOICES = [
  { id: 'rock', name: 'グー', icon: '✊', emoji: '🪨', color: 'bg-gray-500' },
  { id: 'scissors', name: 'チョキ', icon: '✌️', emoji: '✂️', color: 'bg-blue-500' },
  { id: 'paper', name: 'パー', icon: '✋', emoji: '📄', color: 'bg-green-500' }
];

const GAME_RESULT_MESSAGES = {
  win: ['あなたの勝ち！', '素晴らしい！', 'やったね！', 'お見事！'],
  lose: ['あなたの負け！', '残念！', '次回頑張って！', '惜しい！'],
  tie: ['あいこ！', '引き分け！', '同じ手ですね！', 'もう一回！']
};

// カスタムフック：銀行取引
const useBankTransfer = () => {
  const [formData, setFormData] = useState({
    bank: '',
    amount: '',
    accountNumber: '',
    beneficiaryName: ''
  });
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  const updateFormData = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const validateForm = useCallback(() => {
    const { bank, amount, accountNumber, beneficiaryName } = formData;
    
    if (!bank) {
      setError('銀行を選択してください');
      return false;
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('有効な金額を入力してください');
      return false;
    }
    if (!accountNumber || accountNumber.length < 7) {
      setError('有効な口座番号を入力してください');
      return false;
    }
    if (!beneficiaryName) {
      setError('受取人名を入力してください');
      return false;
    }
    
    return true;
  }, [formData]);

  const handleTransfer = useCallback(async () => {
    if (!validateForm()) return false;

    setProcessing(true);
    setError(null);
    setStatus(null);

    try {
      // 振込データの作成
      const transferData = {
        amount: Number(formData.amount),
        currency: 'JPY',
        accountNumber: formData.accountNumber,
        bankCode: formData.bank,
        branchCode: '001',
        beneficiaryName: formData.beneficiaryName,
        transferId: `TR-${Date.now()}`,
        description: '振込処理',
        timestamp: new Date().toISOString()
      };

      // 段階的な処理シミュレーション
      await new Promise(resolve => setTimeout(resolve, 800));
      await new Promise(resolve => setTimeout(resolve, 1000));
      await new Promise(resolve => setTimeout(resolve, 700));

      setStatus({
        message: '振込処理が完了しました',
        details: transferData
      });
      
      return true;

    } catch (err) {
      setError(err.message || '処理中にエラーが発生しました');
      return false;
    } finally {
      setProcessing(false);
    }
  }, [formData, validateForm]);

  const resetForm = useCallback(() => {
    setFormData({ bank: '', amount: '', accountNumber: '', beneficiaryName: '' });
    setStatus(null);
    setError(null);
  }, []);

  return {
    formData,
    updateFormData,
    processing,
    status,
    error,
    handleTransfer,
    resetForm
  };
};

// カスタムフック：じゃんけんゲーム
const useRockPaperScissors = () => {
  const [gameState, setGameState] = useState({
    wins: 0,
    losses: 0,
    ties: 0,
    totalGames: 0,
    streak: 0,
    maxStreak: 0,
    lastResult: null,
    message: null,
    isActive: true
  });

  const getWinner = useCallback((playerChoice, cpuChoice) => {
    if (playerChoice === cpuChoice) return 'tie';
    
    const winConditions = {
      rock: 'scissors',
      scissors: 'paper',
      paper: 'rock'
    };
    
    return winConditions[playerChoice] === cpuChoice ? 'win' : 'lose';
  }, []);

  const playGame = useCallback((playerChoiceId) => {
    const playerChoice = GAME_CHOICES.find(c => c.id === playerChoiceId);
    const cpuChoice = GAME_CHOICES[Math.floor(Math.random() * GAME_CHOICES.length)];
    const result = getWinner(playerChoice.id, cpuChoice.id);
    
    setGameState(prev => {
      const messages = GAME_RESULT_MESSAGES[result];
      const message = messages[Math.floor(Math.random() * messages.length)];
      
      let newStreak = result === 'win' ? prev.streak + 1 : 0;
      let specialMessage = message;
      
      if (result === 'win' && newStreak >= 3) {
        specialMessage += ` 🔥 ${newStreak}連勝！`;
      }
      
      if (result === 'tie' && prev.ties > 0 && (prev.ties + 1) % 3 === 0) {
        specialMessage += ' 🎯 3連続あいこ！レアですね！';
      }

      return {
        ...prev,
        wins: result === 'win' ? prev.wins + 1 : prev.wins,
        losses: result === 'lose' ? prev.losses + 1 : prev.losses,
        ties: result === 'tie' ? prev.ties + 1 : prev.ties,
        totalGames: prev.totalGames + 1,
        streak: newStreak,
        maxStreak: Math.max(prev.maxStreak, newStreak),
        lastResult: {
          playerChoice,
          cpuChoice,
          result
        },
        message: specialMessage
      };
    });
  }, [getWinner]);

  const resetGame = useCallback(() => {
    setGameState({
      wins: 0,
      losses: 0,
      ties: 0,
      totalGames: 0,
      streak: 0,
      maxStreak: 0,
      lastResult: null,
      message: null,
      isActive: true
    });
  }, []);

  const endGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isActive: false }));
  }, []);

  const winRate = useMemo(() => {
    return gameState.totalGames > 0 
      ? Math.round((gameState.wins / gameState.totalGames) * 100) 
      : 0;
  }, [gameState.wins, gameState.totalGames]);

  return {
    gameState,
    playGame,
    resetGame,
    endGame,
    winRate
  };
};

// メインコンポーネント
const BankTransferWithGame = () => {
  const [showGame, setShowGame] = useState(false);
  const banking = useBankTransfer();
  const game = useRockPaperScissors();

  const handleSuccessfulTransfer = useCallback(async () => {
    const success = await banking.handleTransfer();
    if (success) {
      setShowGame(true);
    }
  }, [banking.handleTransfer]);

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">銀行振込サービス</h1>
        <p className="text-gray-600">取引完了後にお楽しみゲームをプレゼント！</p>
      </div>

      <BankTransferCard banking={banking} onTransfer={handleSuccessfulTransfer} />
      
      {showGame && (
        <GameCard 
          game={game} 
          onClose={() => setShowGame(false)}
          transferAmount={banking.formData.amount}
        />
      )}
    </div>
  );
};

// 銀行振込カードコンポーネント
const BankTransferCard = ({ banking, onTransfer }) => (
  <Card className="w-full shadow-lg border-2 border-blue-100">
    <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
      <CardTitle className="flex items-center gap-2">
        <CreditCard className="w-5 h-5" />
        銀行振込処理
      </CardTitle>
    </CardHeader>
    <CardContent className="pt-6">
      <div className="space-y-6">
        <BankSelection banking={banking} />
        <TransferForm banking={banking} />
        <StatusDisplay banking={banking} />
        <ActionButtons banking={banking} onTransfer={onTransfer} />
      </div>
    </CardContent>
  </Card>
);

// 銀行選択コンポーネント
const BankSelection = ({ banking }) => (
  <div className="space-y-2">
    <Label htmlFor="bank-select">銀行選択</Label>
    <Select
      value={banking.formData.bank}
      onValueChange={(value) => banking.updateFormData('bank', value)}
      disabled={banking.processing}
    >
      <SelectTrigger id="bank-select" className="h-12">
        <SelectValue placeholder="銀行を選択してください" />
      </SelectTrigger>
      <SelectContent>
        {BANK_LIST.map(bank => (
          <SelectItem key={bank.code} value={bank.code}>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${bank.color}`} />
              {bank.name}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

// 振込フォームコンポーネント
const TransferForm = ({ banking }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="space-y-2">
      <Label htmlFor="amount">振込金額（円）</Label>
      <Input
        id="amount"
        type="number"
        placeholder="10000"
        value={banking.formData.amount}
        onChange={(e) => banking.updateFormData('amount', e.target.value)}
        disabled={banking.processing}
        className="h-12"
      />
    </div>
    
    <div className="space-y-2">
      <Label htmlFor="account">口座番号</Label>
      <Input
        id="account"
        placeholder="1234567"
        value={banking.formData.accountNumber}
        onChange={(e) => banking.updateFormData('accountNumber', e.target.value)}
        disabled={banking.processing}
        className="h-12"
      />
    </div>
    
    <div className="md:col-span-2 space-y-2">
      <Label htmlFor="beneficiary">受取人名</Label>
      <Input
        id="beneficiary"
        placeholder="山田太郎"
        value={banking.formData.beneficiaryName}
        onChange={(e) => banking.updateFormData('beneficiaryName', e.target.value)}
        disabled={banking.processing}
        className="h-12"
      />
    </div>
  </div>
);

// ステータス表示コンポーネント
const StatusDisplay = ({ banking }) => {
  if (banking.error) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription>{banking.error}</AlertDescription>
      </Alert>
    );
  }

  if (banking.status) {
    return (
      <Alert className="bg-green-50 text-green-700 border-green-200">
        <Trophy className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">{banking.status.message}</p>
            <div className="text-sm space-y-1">
              <p>振込ID: {banking.status.details.transferId}</p>
              <p>金額: ¥{banking.status.details.amount.toLocaleString()}</p>
              <p>受取人: {banking.status.details.beneficiaryName}</p>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};

// アクションボタンコンポーネント
const ActionButtons = ({ banking, onTransfer }) => {
  if (banking.status) {
    return (
      <Button
        onClick={banking.resetForm}
        variant="outline"
        className="w-full h-12"
      >
        <RotateCcw className="mr-2 h-4 w-4" />
        新しい振込を作成
      </Button>
    );
  }

  return (
    <Button
      onClick={onTransfer}
      disabled={banking.processing}
      className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
    >
      {banking.processing ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <CreditCard className="mr-2 h-4 w-4" />
      )}
      {banking.processing ? '処理中...' : '振込処理を開始'}
    </Button>
  );
};

// ゲームカードコンポーネント
const GameCard = ({ game, onClose, transferAmount }) => (
  <Card className="w-full shadow-lg border-2 border-green-100">
    <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white">
      <CardTitle className="flex items-center gap-2">
        <Gamepad2 className="w-5 h-5" />
        取引完了記念じゃんけん
        <div className="ml-auto text-sm bg-white/20 px-2 py-1 rounded">
          ¥{Number(transferAmount).toLocaleString()} 取引完了
        </div>
      </CardTitle>
    </CardHeader>
    <CardContent className="pt-6">
      {game.gameState.isActive ? (
        <ActiveGame game={game} />
      ) : (
        <GameSummary game={game} onClose={onClose} />
      )}
    </CardContent>
  </Card>
);

// アクティブゲームコンポーネント
const ActiveGame = ({ game }) => (
  <div className="space-y-6">
    <div className="text-center">
      <h3 className="text-lg font-semibold mb-4">手を選んでください</h3>
      <div className="grid grid-cols-3 gap-4">
        {GAME_CHOICES.map((choice) => (
          <Button
            key={choice.id}
            onClick={() => game.playGame(choice.id)}
            className={`h-20 text-3xl ${choice.color} hover:scale-105 transition-transform`}
          >
            <div className="text-center">
              <div>{choice.icon}</div>
              <div className="text-xs mt-1">{choice.name}</div>
            </div>
          </Button>
        ))}
      </div>
    </div>

    {game.gameState.lastResult && <GameResult game={game} />}
    <GameStats game={game} />
    <GameActions game={game} />
  </div>
);

// ゲーム結果表示コンポーネント
const GameResult = ({ game }) => {
  const { lastResult, message } = game.gameState;
  const resultColors = {
    win: 'bg-green-50 text-green-700 border-green-200',
    lose: 'bg-red-50 text-red-700 border-red-200',
    tie: 'bg-yellow-50 text-yellow-700 border-yellow-200'
  };

  return (
    <Alert className={resultColors[lastResult.result]}>
      <AlertDescription>
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-4 text-2xl">
            <div className="text-center">
              <div>{lastResult.playerChoice.icon}</div>
              <div className="text-xs">あなた</div>
            </div>
            <span className="text-lg">VS</span>
            <div className="text-center">
              <div>{lastResult.cpuChoice.icon}</div>
              <div className="text-xs">CPU</div>
            </div>
          </div>
          <p className="font-medium">{message}</p>
        </div>
      </AlertDescription>
    </Alert>
  );
};

// ゲーム統計コンポーネント
const GameStats = ({ game }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    <div className="bg-green-50 p-3 rounded-lg text-center">
      <Trophy className="w-6 h-6 text-green-600 mx-auto mb-1" />
      <div className="text-2xl font-bold text-green-600">{game.gameState.wins}</div>
      <div className="text-xs text-green-600">勝利</div>
    </div>
    <div className="bg-red-50 p-3 rounded-lg text-center">
      <XCircle className="w-6 h-6 text-red-600 mx-auto mb-1" />
      <div className="text-2xl font-bold text-red-600">{game.gameState.losses}</div>
      <div className="text-xs text-red-600">敗北</div>
    </div>
    <div className="bg-gray-50 p-3 rounded-lg text-center">
      <Minus className="w-6 h-6 text-gray-600 mx-auto mb-1" />
      <div className="text-2xl font-bold text-gray-600">{game.gameState.ties}</div>
      <div className="text-xs text-gray-600">引分</div>
    </div>
    <div className="bg-blue-50 p-3 rounded-lg text-center">
      <Star className="w-6 h-6 text-blue-600 mx-auto mb-1" />
      <div className="text-2xl font-bold text-blue-600">{game.winRate}%</div>
      <div className="text-xs text-blue-600">勝率</div>
    </div>
  </div>
);

// ゲームアクションコンポーネント
const GameActions = ({ game }) => (
  <div className="flex gap-3">
    <Button 
      onClick={game.resetGame}
      variant="outline" 
      className="flex-1"
    >
      <RotateCcw className="mr-2 h-4 w-4" />
      リセット
    </Button>
    <Button 
      onClick={game.endGame}
      className="flex-1 bg-green-600 hover:bg-green-700"
    >
      ゲーム終了
    </Button>
  </div>
);

// ゲーム終了画面コンポーネント
const GameSummary = ({ game, onClose }) => (
  <div className="text-center space-y-4">
    <div className="text-4xl mb-4">🎉</div>
    <h3 className="text-xl font-bold">ゲーム終了！</h3>
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-green-600">{game.gameState.wins}</div>
          <div className="text-sm">勝利</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-red-600">{game.gameState.losses}</div>
          <div className="text-sm">敗北</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-600">{game.gameState.ties}</div>
          <div className="text-sm">引分</div>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <p>最終勝率: <span className="font-bold text-blue-600">{game.winRate}%</span></p>
        <p>最高連勝: <span className="font-bold text-green-600">{game.gameState.maxStreak}連勝</span></p>
      </div>
    </div>
    <Button onClick={onClose} className="w-full">
      完了
    </Button>
  </div>
);

export default BankTransferWithGame;
