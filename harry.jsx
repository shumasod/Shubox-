import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, CheckCircle, AlertCircle, Wand2, Coins, Sparkles, Shield, Zap } from 'lucide-react';

// 定数とデータ
const SPELLS = {
  'ルーモス': { damage: 10, effect: 'light', description: '明かりを灯す呪文', icon: '💡' },
  'エクスペクト・パトローナム': { damage: 20, effect: 'patronus', description: '守護霊を呼び出す強力な呪文', icon: '🦌' },
  'エクスペリアームス': { damage: 15, effect: 'disarm', description: '相手の武器を奪う呪文', icon: '🪄' },
  'ウィンガーディアム・レビオサ': { damage: 5, effect: 'levitate', description: '物を浮かせる呪文', icon: '🪶' },
  'プロテゴ': { damage: 0, effect: 'shield', description: '防御の盾を作る呪文', icon: '🛡️' },
};

const TRANSFER_STEPS = {
  IDLE: 'idle',
  VALIDATING: 'validating',
  EXECUTING: 'executing',
  CHECKING_STATUS: 'checkingStatus',
  COMPLETED: 'completed',
  ERROR: 'error'
};

const BANK_LIST = [
  { code: 'GRINGOTTS_LONDON', name: 'グリンゴッツ銀行（ロンドン本店）' },
  { code: 'GRINGOTTS_HOGSMEADE', name: 'グリンゴッツ銀行（ホグズミード支店）' },
  { code: 'GRINGOTTS_DIAGON', name: 'グリンゴッツ銀行（ダイアゴン横丁支店）' },
  { code: 'GRINGOTTS_INTL', name: 'グリンゴッツ国際魔法銀行' }
];

const FIELD_LABELS = {
  bankCode: '銀行支店',
  amount: 'ガリオン額',
  vaultNumber: '金庫番号',
  branchCode: '支店コード',
  beneficiaryName: '魔法使いの名前'
};

// 魔法銀行API管理サービス
class GringottsApiManager {
  constructor() {
    this.adapters = {};
  }

  initializeAdapter(bankCode, config) {
    if (this.adapters[bankCode]) {
      return this.adapters[bankCode];
    }
    
    this.adapters[bankCode] = {
      config,
      
      validateTransfer: async (transferData) => {
        try {
          console.log(`Validating transfer for ${bankCode}:`, transferData);
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          return {
            isValid: true,
            transferId: transferData.transferId || `${bankCode}-${Date.now()}`
          };
        } catch (error) {
          console.error(`Validation error for ${bankCode}:`, error);
          return {
            isValid: false,
            message: error.message || 'ゴブリンによる検証中にエラーが発生しました'
          };
        }
      },
      
      executeTransfer: async (transferData) => {
        try {
          console.log(`Executing transfer for ${bankCode}:`, transferData);
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          return {
            success: true,
            transferId: transferData.transferId,
            timestamp: new Date().toISOString(),
            reference: `G-${Math.floor(Math.random() * 1000000)}`
          };
        } catch (error) {
          console.error(`Execution error for ${bankCode}:`, error);
          throw new Error(error.message || '金庫間振込実行中にエラーが発生しました');
        }
      },
      
      getTransferStatus: async (transferId) => {
        try {
          console.log(`Getting status for transfer ${transferId}`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          return {
            transferId,
            status: 'completed',
            processedAt: new Date().toISOString(),
            description: '魔法による振込が完了しました'
          };
        } catch (error) {
          console.error(`Status check error for ${bankCode}:`, error);
          throw new Error(error.message || '金庫状態確認中にエラーが発生しました');
        }
      }
    };
    
    return this.adapters[bankCode];
  }

  getAdapter(bankCode) {
    if (!this.adapters[bankCode]) {
      throw new Error(`銀行コード ${bankCode} のアダプターが初期化されていません`);
    }
    return this.adapters[bankCode];
  }

  validateTransfer(bankCode, transferData) {
    return this.getAdapter(bankCode).validateTransfer(transferData);
  }

  executeTransfer(bankCode, transferData) {
    return this.getAdapter(bankCode).executeTransfer(transferData);
  }

  getTransferStatus(bankCode, transferId) {
    return this.getAdapter(bankCode).getTransferStatus(transferId);
  }
}

// グローバルインスタンス
const gringottsApiManager = new GringottsApiManager();

// カスタムフック：バンキング機能
const useBanking = () => {
  const [formData, setFormData] = useState({
    bankCode: '',
    amount: '',
    vaultNumber: '',
    branchCode: '',
    beneficiaryName: '',
    description: ''
  });
  
  const [currentStep, setCurrentStep] = useState(TRANSFER_STEPS.IDLE);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [initializationStatus, setInitializationStatus] = useState({
    initialized: false,
    error: null
  });

  // 初期化
  useEffect(() => {
    const initializeAdapters = async () => {
      try {
        BANK_LIST.forEach(bank => {
          const config = {
            apiEndpoint: 'https://api.gringotts.wiz/banking',
            apiKey: 'demo-key',
            timeout: 30000,
            retryAttempts: 3
          };
          
          gringottsApiManager.initializeAdapter(bank.code, config);
        });
        
        setInitializationStatus({ initialized: true, error: null });
      } catch (error) {
        console.error('Failed to initialize bank adapters:', error);
        setInitializationStatus({ 
          initialized: false, 
          error: 'ゴブリンAPIの初期化に失敗しました。ページをリロードしてください。' 
        });
      }
    };

    initializeAdapters();
  }, []);

  const updateFormData = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const validateForm = useCallback(() => {
    const requiredFields = ['bankCode', 'amount', 'vaultNumber', 'branchCode', 'beneficiaryName'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        setError(`${FIELD_LABELS[field]}を入力してください`);
        return false;
      }
    }
    
    if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      setError('有効なガリオン額を入力してください');
      return false;
    }
    
    return true;
  }, [formData]);

  const handleTransfer = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setError(null);
      setResult(null);
      
      const transferData = {
        amount: Number(formData.amount),
        currency: 'GAL',
        accountNumber: formData.vaultNumber,
        bankCode: formData.bankCode,
        branchCode: formData.branchCode,
        beneficiaryName: formData.beneficiaryName,
        transferId: `WIZ-${Date.now()}`,
        description: formData.description || '魔法振込'
      };

      setCurrentStep(TRANSFER_STEPS.VALIDATING);
      const validationResult = await gringottsApiManager.validateTransfer(
        formData.bankCode,
        transferData
      );

      if (!validationResult.isValid) {
        throw new Error(validationResult.message || '振込の検証に失敗しました');
      }

      setCurrentStep(TRANSFER_STEPS.EXECUTING);
      const executionResult = await gringottsApiManager.executeTransfer(
        formData.bankCode,
        { ...transferData, transferId: validationResult.transferId }
      );

      setCurrentStep(TRANSFER_STEPS.CHECKING_STATUS);
      const transferStatus = await gringottsApiManager.getTransferStatus(
        formData.bankCode,
        executionResult.transferId
      );

      setCurrentStep(TRANSFER_STEPS.COMPLETED);
      setResult({
        message: '魔法振込処理が完了しました',
        details: {
          ...transferStatus,
          reference: executionResult.reference,
          amount: formData.amount,
          beneficiary: formData.beneficiaryName
        }
      });

    } catch (err) {
      console.error('Transfer error:', err);
      setCurrentStep(TRANSFER_STEPS.ERROR);
      setError(err.message || '処理中にエラーが発生しました');
    }
  }, [formData, validateForm]);

  const resetForm = useCallback(() => {
    setCurrentStep(TRANSFER_STEPS.IDLE);
    setResult(null);
    setError(null);
    setFormData({
      bankCode: '',
      amount: '',
      vaultNumber: '',
      branchCode: '',
      beneficiaryName: '',
      description: ''
    });
  }, []);

  const isProcessing = useMemo(() => [
    TRANSFER_STEPS.VALIDATING, 
    TRANSFER_STEPS.EXECUTING, 
    TRANSFER_STEPS.CHECKING_STATUS
  ].includes(currentStep), [currentStep]);

  const getButtonText = useCallback(() => {
    switch (currentStep) {
      case TRANSFER_STEPS.VALIDATING:
        return 'ゴブリンによる検証中...';
      case TRANSFER_STEPS.EXECUTING:
        return '金庫間移動中...';
      case TRANSFER_STEPS.CHECKING_STATUS:
        return '魔法封印確認中...';
      default:
        return '魔法振込処理開始';
    }
  }, [currentStep]);

  return {
    formData,
    updateFormData,
    currentStep,
    error,
    result,
    initializationStatus,
    isProcessing,
    handleTransfer,
    resetForm,
    getButtonText
  };
};

// カスタムフック：決闘ゲーム
const useDuelGame = (playerName) => {
  const [gameState, setGameState] = useState({
    playerHealth: 100,
    dumbledoreHealth: 100,
    playerLevel: 1,
    playerExp: 0,
    round: 0,
    playerEffects: [],
    dumbledoreEffects: [],
    score: 0,
  });

  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [lastRound, setLastRound] = useState(null);

  // ゲーム終了判定
  useEffect(() => {
    if (gameState.playerHealth <= 0 || gameState.dumbledoreHealth <= 0) {
      setGameOver(true);
    }
  }, [gameState.playerHealth, gameState.dumbledoreHealth]);

  const chooseDumbledoreSpell = useCallback(() => {
    if (gameState.dumbledoreHealth < 30) {
      return 'エクスペクト・パトローナム';
    } else if (gameState.playerHealth > 70) {
      return 'エクスペリアームス';
    } else if (gameState.dumbledoreEffects.length === 0) {
      return 'プロテゴ';
    } else {
      return Object.keys(SPELLS)[Math.floor(Math.random() * Object.keys(SPELLS).length)];
    }
  }, [gameState.dumbledoreHealth, gameState.playerHealth, gameState.dumbledoreEffects]);

  const calculateDamage = useCallback((spellInfo, casterLevel, targetEffects) => {
    let damage = spellInfo.damage * (1 + (casterLevel - 1) * 0.1);
    if (targetEffects.includes('shield')) damage *= 0.5;
    if (targetEffects.includes('disarm')) damage *= 0.75;
    return Math.round(damage);
  }, []);

  const castSpell = useCallback((playerSpell) => {
    const dumbledoreSpell = chooseDumbledoreSpell();
    
    const playerDamage = calculateDamage(SPELLS[playerSpell], gameState.playerLevel, gameState.dumbledoreEffects);
    const dumbledoreDamage = calculateDamage(SPELLS[dumbledoreSpell], 10, gameState.playerEffects);

    setGameState(prev => {
      const newExp = prev.playerExp + 10;
      const newLevel = newExp >= 100 ? prev.playerLevel + 1 : prev.playerLevel;
      const finalExp = newExp >= 100 ? newExp - 100 : newExp;
      
      return {
        ...prev,
        playerHealth: Math.max(0, Math.min(100, prev.playerHealth - dumbledoreDamage)),
        dumbledoreHealth: Math.max(0, Math.min(100, prev.dumbledoreHealth - playerDamage)),
        round: prev.round + 1,
        score: prev.score + playerDamage,
        playerExp: finalExp,
        playerLevel: newLevel,
        playerEffects: [SPELLS[playerSpell].effect],
        dumbledoreEffects: [SPELLS[dumbledoreSpell].effect],
      };
    });

    setLastRound({ playerSpell, dumbledoreSpell, playerDamage, dumbledoreDamage });
  }, [gameState.playerLevel, gameState.dumbledoreEffects, gameState.playerEffects, chooseDumbledoreSpell, calculateDamage]);

  const startGame = useCallback(() => {
    setGameStarted(true);
  }, []);

  const resetGame = useCallback(() => {
    setGameState({
      playerHealth: 100,
      dumbledoreHealth: 100,
      playerLevel: 1,
      playerExp: 0,
      round: 0,
      playerEffects: [],
      dumbledoreEffects: [],
      score: 0,
    });
    setGameOver(false);
    setLastRound(null);
  }, []);

  return {
    gameState,
    gameStarted,
    gameOver,
    lastRound,
    startGame,
    resetGame,
    castSpell
  };
};

// メインコンポーネント
const WizardingBankAndDuel = () => {
  const [activeTab, setActiveTab] = useState('bank');
  const [canDuel, setCanDuel] = useState(false);
  
  const banking = useBanking();
  const playerName = banking.formData.beneficiaryName;
  const duel = useDuelGame(playerName);

  // 決闘解放条件のチェック
  useEffect(() => {
    if (banking.result && Number(banking.formData.amount) >= 100) {
      setCanDuel(true);
    }
  }, [banking.result, banking.formData.amount]);

  const startDuelFromBank = useCallback(() => {
    duel.startGame();
    setActiveTab('duel');
  }, [duel]);

  // 初期化エラー表示
  if (banking.initializationStatus.error) {
    return (
      <Card className="w-full max-w-xl mx-auto">
        <CardHeader className="bg-purple-900 text-white">
          <CardTitle>グリンゴッツ魔法銀行</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{banking.initializationStatus.error}</AlertDescription>
          </Alert>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4 w-full bg-purple-700 hover:bg-purple-800"
          >
            再読み込み
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-purple-800 mb-2">魔法の世界へようこそ</h1>
        {playerName && (
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <p className="text-lg text-purple-600">魔法使い: {playerName}</p>
            <Sparkles className="h-5 w-5 text-purple-600" />
          </div>
        )}
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="bank" className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            <span>グリンゴッツ銀行</span>
          </TabsTrigger>
          <TabsTrigger value="duel" disabled={!canDuel && !duel.gameStarted} className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            <span>ダンブルドアとの決闘</span>
            {canDuel && !duel.gameStarted && <span className="text-xs bg-yellow-500 text-white px-1 rounded">NEW!</span>}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="bank">
          <BankingInterface 
            banking={banking} 
            canDuel={canDuel} 
            gameStarted={duel.gameStarted}
            onStartDuel={startDuelFromBank}
          />
        </TabsContent>
        
        <TabsContent value="duel">
          <DuelInterface 
            duel={duel} 
            playerName={playerName} 
            onReturnToBank={() => setActiveTab('bank')}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// 銀行インターフェースコンポーネント
const BankingInterface = ({ banking, canDuel, gameStarted, onStartDuel }) => (
  <Card className="w-full">
    <CardHeader className="bg-gradient-to-r from-purple-900 to-purple-700 text-white">
      <CardTitle className="flex items-center gap-2">
        <Coins className="h-5 w-5" />
        グリンゴッツ魔法銀行取引
      </CardTitle>
    </CardHeader>
    <CardContent className="pt-6">
      <div className="space-y-6">
        <BankSelection banking={banking} />
        <TransferForm banking={banking} />
        <ProcessingStatus banking={banking} />
        <TransferResult 
          banking={banking} 
          canDuel={canDuel} 
          gameStarted={gameStarted}
          onStartDuel={onStartDuel}
        />
        <ActionButtons banking={banking} />
      </div>
    </CardContent>
  </Card>
);

// 銀行選択コンポーネント
const BankSelection = ({ banking }) => (
  <div className="space-y-2">
    <Label htmlFor="bank-select">支店を選択</Label>
    <Select
      value={banking.formData.bankCode}
      onValueChange={(value) => banking.updateFormData('bankCode', value)}
      disabled={banking.isProcessing}
    >
      <SelectTrigger id="bank-select" className="border-purple-300">
        <SelectValue placeholder="支店を選択してください" />
      </SelectTrigger>
      <SelectContent>
        {BANK_LIST.map(bank => (
          <SelectItem key={bank.code} value={bank.code}>
            {bank.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

// 振込フォームコンポーネント
const TransferForm = ({ banking }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="amount">ガリオン額</Label>
        <Input
          id="amount"
          type="number"
          placeholder="100"
          value={banking.formData.amount}
          onChange={(e) => banking.updateFormData('amount', e.target.value)}
          disabled={banking.isProcessing}
          className="border-purple-300"
        />
        {Number(banking.formData.amount) >= 100 && (
          <p className="text-xs text-green-600 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            100ガリオン以上で決闘可能になります
          </p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="branch-code">支店暗号</Label>
        <Input
          id="branch-code"
          placeholder="D12"
          value={banking.formData.branchCode}
          onChange={(e) => banking.updateFormData('branchCode', e.target.value)}
          disabled={banking.isProcessing}
          className="border-purple-300"
        />
      </div>
    </div>
    
    <div className="space-y-2">
      <Label htmlFor="vault-number">金庫番号</Label>
      <Input
        id="vault-number"
        placeholder="687"
        value={banking.formData.vaultNumber}
        onChange={(e) => banking.updateFormData('vaultNumber', e.target.value)}
        disabled={banking.isProcessing}
        className="border-purple-300"
      />
    </div>
    
    <div className="space-y-2">
      <Label htmlFor="beneficiary-name">魔法使いの名前</Label>
      <Input
        id="beneficiary-name"
        placeholder="ハリー・ポッター"
        value={banking.formData.beneficiaryName}
        onChange={(e) => banking.updateFormData('beneficiaryName', e.target.value)}
        disabled={banking.isProcessing}
        className="border-purple-300"
      />
    </div>
    
    <div className="space-y-2">
      <Label htmlFor="description">取引メモ（任意）</Label>
      <Input
        id="description"
        placeholder="ホグワーツ学費"
        value={banking.formData.description}
        onChange={(e) => banking.updateFormData('description', e.target.value)}
        disabled={banking.isProcessing}
        className="border-purple-300"
      />
    </div>
  </div>
);

// 処理状況表示コンポーネント
const ProcessingStatus = ({ banking }) => {
  if (banking.currentStep === TRANSFER_STEPS.IDLE || banking.currentStep === TRANSFER_STEPS.ERROR || banking.result) {
    return null;
  }

  const getStatusMessage = () => {
    switch (banking.currentStep) {
      case TRANSFER_STEPS.VALIDATING:
        return 'ゴブリンによる振込情報を検証しています...';
      case TRANSFER_STEPS.EXECUTING:
        return '地下金庫での振込を実行しています...';
      case TRANSFER_STEPS.CHECKING_STATUS:
        return '魔法封印状態を確認しています...';
      default:
        return '';
    }
  };

  return (
    <div className="bg-purple-50 p-4 rounded-md flex items-center space-x-3 border border-purple-200">
      <Loader2 className="h-5 w-5 text-purple-500 animate-spin" />
      <p className="text-purple-700 text-sm">{getStatusMessage()}</p>
    </div>
  );
};

// 取引結果表示コンポーネント
const TransferResult = ({ banking, canDuel, gameStarted, onStartDuel }) => {
  if (banking.error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{banking.error}</AlertDescription>
      </Alert>
    );
  }

  if (!banking.result) return null;

  return (
    <div className="space-y-4">
      <Alert className="bg-green-50 text-green-700 border-green-200">
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>{banking.result.message}</AlertDescription>
      </Alert>
      
      <div className="bg-purple-50 p-4 rounded-md space-y-3 border border-purple-200">
        <h3 className="font-medium text-purple-700 flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          振込詳細
        </h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="text-purple-600">ガリオン額:</div>
          <div className="font-medium">{Number(banking.result.details.amount).toLocaleString()} G</div>
          
          <div className="text-purple-600">受取人:</div>
          <div className="font-medium">{banking.result.details.beneficiary}</div>
          
          <div className="text-purple-600">処理日時:</div>
          <div className="font-medium">
            {new Date(banking.result.details.processedAt).toLocaleString('ja-JP')}
          </div>
          
          <div className="text-purple-600">魔法参照番号:</div>
          <div className="font-medium">{banking.result.details.reference}</div>
        </div>
      </div>
      
      {canDuel && !gameStarted && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-md border border-yellow-200">
          <h3 className="font-medium text-yellow-700 mb-2 flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            特別招待！
          </h3>
          <p className="text-sm text-yellow-600 mb-3">
            高額取引をご利用いただきありがとうございます！ダンブルドア教授との特別決闘にご招待します。
          </p>
          <Button 
            onClick={onStartDuel} 
            className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white"
          >
            <Wand2 className="h-4 w-4 mr-2" />
            決闘を始める
          </Button>
        </div>
      )}
    </div>
  );
};

// アクションボタンコンポーネント
const ActionButtons = ({ banking }) => {
  if (banking.result) {
    return (
      <Button
        variant="outline"
        onClick={banking.resetForm}
        className="w-full mt-2 border-purple-300 text-purple-700 hover:bg-purple-50"
      >
        新しい振込を作成
      </Button>
    );
  }

  return (
    <Button
      onClick={banking.handleTransfer}
      disabled={banking.isProcessing}
      className="w-full bg-gradient-to-r from-purple-700 to-purple-800 hover:from-purple-800 hover:to-purple-900"
    >
      {banking.isProcessing && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      {banking.getButtonText()}
    </Button>
  );
};

// 決闘インターフェースコンポーネント
const DuelInterface = ({ duel, playerName, onReturnToBank }) => (
  <Card className="w-full">
    <CardHeader className="bg-gradient-to-r from-blue-900 to-indigo-700 text-white">
      <CardTitle className="flex items-center gap-2">
        <Wand2 className="h-5 w-5" />
        ダンブルドアとの魔法決闘
      </CardTitle>
    </CardHeader>
    <CardContent className="pt-6">
      <div className="p-6 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
        {!duel.gameStarted ? (
          <DuelStart onStartGame={duel.startGame} />
        ) : (
          <DuelGame 
            duel={duel} 
            playerName={playerName} 
            onReturnToBank={onReturnToBank}
          />
        )}
      </div>
    </CardContent>
  </Card>
);

// 決闘開始コンポーネント
const DuelStart = ({ onStartGame }) => (
  <div className="text-center space-y-6">
    <div className="text-6xl mb-4">🧙‍♂️</div>
    <h2 className="text-3xl font-bold text-blue-800">ダンブルドア教授との魔法決闘</h2>
    <p className="text-blue-700 max-w-md mx-auto">
      ダンブルドア教授との魔法の決闘に挑戦しましょう！あなたの魔法スキルを試す時が来ました。
    </p>
    <Button 
      onClick={onStartGame}
      className="bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white px-8 py-3 text-lg"
    >
      <Wand2 className="h-5 w-5 mr-2" />
      決闘を開始
    </Button>
  </div>
);

// 決闘ゲームコンポーネント
const DuelGame = ({ duel, playerName, onReturnToBank }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-blue-800 text-center">ダンブルドアとの決闘</h2>
    
    <PlayerStatus duel={duel} playerName={playerName} />
    <DumbledoreStatus duel={duel} />
    <GameStatus duel={duel} />
    
    {duel.lastRound && <LastRoundSummary lastRound={duel.lastRound} />}
    
    {duel.gameOver ? (
      <GameOverScreen duel={duel} onReturnToBank={onReturnToBank} />
    ) : (
      <SpellSelection duel={duel} />
    )}
    
    <Button 
      variant="outline"
      onClick={() => {
        duel.resetGame();
        onReturnToBank();
      }}
      className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
    >
      銀行に戻る
    </Button>
  </div>
);

// プレイヤーステータスコンポーネント
const PlayerStatus = ({ duel, playerName }) => (
  <div className="bg-white p-4 rounded-lg border border-blue-200">
    <h3 className="text-xl font-semibold text-blue-700 mb-2 flex items-center gap-2">
      <Sparkles className="h-5 w-5" />
      {playerName || "魔法使い"} (レベル {duel.gameState.playerLevel})
    </h3>
    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
      <div 
        className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500" 
        style={{width: `${duel.gameState.playerHealth}%`}}
      />
    </div>
    <div className="grid grid-cols-3 gap-2 text-sm">
      <p className="text-blue-700">体力: {duel.gameState.playerHealth}/100</p>
      <p className="text-blue-700">経験値: {duel.gameState.playerExp}/100</p>
      <p className="text-blue-700">効果: {duel.gameState.playerEffects.join(', ') || "なし"}</p>
    </div>
  </div>
);

// ダンブルドアステータスコンポーネント
const DumbledoreStatus = ({ duel }) => (
  <div className="bg-white p-4 rounded-lg border border-purple-200">
    <h3 className="text-xl font-semibold text-purple-700 mb-2 flex items-center gap-2">
      🧙‍♂️ ダンブルドア教授
    </h3>
    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
      <div 
        className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500" 
        style={{width: `${duel.gameState.dumbledoreHealth}%`}}
      />
    </div>
    <p className="text-sm text-purple-700">
      体力: {duel.gameState.dumbledoreHealth}/100 | 効果: {duel.gameState.dumbledoreEffects.join(', ') || "なし"}
    </p>
  </div>
);

// ゲームステータスコンポーネント
const GameStatus = ({ duel }) => (
  <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-4 rounded-lg border">
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-blue-600" />
        <span className="font-semibold text-blue-800">ラウンド: {duel.gameState.round}</span>
      </div>
      <div className="flex items-center gap-2">
        <Zap className="h-5 w-5 text-purple-600" />
        <span className="font-semibold text-purple-800">スコア: {duel.gameState.score}</span>
      </div>
    </div>
  </div>
);

// 前回の攻撃結果コンポーネント
const LastRoundSummary = ({ lastRound }) => (
  <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-2">
    <h4 className="font-medium text-gray-700">前回の攻撃結果</h4>
    <div className="space-y-1 text-sm">
      <p className="text-blue-700">
        <span className="font-medium">あなたの呪文:</span> {lastRound.playerSpell} 
        <span className="text-red-500 ml-2">(ダメージ: {lastRound.playerDamage})</span>
      </p>
      <p className="text-purple-700">
        <span className="font-medium">ダンブルドアの呪文:</span> {lastRound.dumbledoreSpell} 
        <span className="text-red-500 ml-2">(ダメージ: {lastRound.dumbledoreDamage})</span>
      </p>
    </div>
  </div>
);

// 呪文選択コンポーネント
const SpellSelection = ({ duel }) => (
  <div className="space-y-4">
    <h3 className="font-semibold text-blue-800 text-center">呪文を選んでください:</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {Object.entries(SPELLS).map(([spell, info]) => (
        <Button 
          key={spell} 
          onClick={() => duel.castSpell(spell)}
          className="p-4 bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg h-auto"
        >
          <div className="text-center space-y-1">
            <div className="text-2xl">{info.icon}</div>
            <div className="font-medium text-sm">{spell}</div>
            <div className="text-xs opacity-90">
              ダメージ: {info.damage} | {info.effect}
            </div>
          </div>
        </Button>
      ))}
    </div>
  </div>
);

// ゲーム終了画面コンポーネント
const GameOverScreen = ({ duel, onReturnToBank }) => (
  <div className="space-y-4">
    <div className={`p-6 rounded-lg text-center ${
      duel.gameState.playerHealth <= 0 
        ? 'bg-gradient-to-br from-red-100 to-red-200 text-red-800' 
        : 'bg-gradient-to-br from-green-100 to-green-200 text-green-800'
    }`}>
      <div className="text-4xl mb-2">
        {duel.gameState.playerHealth <= 0 ? '💀' : '🏆'}
      </div>
      <h2 className="text-2xl font-bold mb-2">
        {duel.gameState.playerHealth <= 0 
          ? 'ゲームオーバー！ダンブルドアの勝利です。' 
          : 'おめでとうございます！あなたの勝利です。'
        }
      </h2>
      <p className="text-lg">最終スコア: {duel.gameState.score}</p>
    </div>
    <Button 
      onClick={duel.resetGame}
      className="w-full bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white"
    >
      再挑戦する
    </Button>
  </div>
);

export default WizardingBankAndDuel;
