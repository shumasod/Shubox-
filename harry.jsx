import React, { useState, useEffect, useCallback, useMemo } from ‘react’;
import { Card, CardHeader, CardTitle, CardContent } from ‘@/components/ui/card’;
import { Alert, AlertDescription } from ‘@/components/ui/alert’;
import { Button } from ‘@/components/ui/button’;
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from ‘@/components/ui/select’;
import { Input } from ‘@/components/ui/input’;
import { Label } from ‘@/components/ui/label’;
import { Tabs, TabsContent, TabsList, TabsTrigger } from ‘@/components/ui/tabs’;
import { Loader2, CheckCircle, AlertCircle, Wand2, Coins, Sparkles, Shield, Zap } from ‘lucide-react’;

// 定数とデータ
const SPELLS = {
‘ルーモス’: { damage: 10, effect: ‘light’, description: ‘明かりを灯す呪文’, icon: ‘💡’ },
‘エクスペクト・パトローナム’: { damage: 20, effect: ‘patronus’, description: ‘守護霊を呼び出す強力な呪文’, icon: ‘🦌’ },
‘エクスペリアームス’: { damage: 15, effect: ‘disarm’, description: ‘相手の武器を奪う呪文’, icon: ‘🪄’ },
‘ウィンガーディアム・レビオサ’: { damage: 5, effect: ‘levitate’, description: ‘物を浮かせる呪文’, icon: ‘🪶’ },
‘プロテゴ’: { damage: 0, effect: ‘shield’, description: ‘防御の盾を作る呪文’, icon: ‘🛡️’ },
};

const TRANSFER_STEPS = {
IDLE: ‘idle’,
VALIDATING: ‘validating’,
EXECUTING: ‘executing’,
CHECKING_STATUS: ‘checkingStatus’,
COMPLETED: ‘completed’,
ERROR: ‘error’
};

const BANK_LIST = [
{ code: ‘GRINGOTTS_LONDON’, name: ‘グリンゴッツ銀行（ロンドン本店）’ },
{ code: ‘GRINGOTTS_HOGSMEADE’, name: ‘グリンゴッツ銀行（ホグズミード支店）’ },
{ code: ‘GRINGOTTS_DIAGON’, name: ‘グリンゴッツ銀行（ダイアゴン横丁支店）’ },
{ code: ‘GRINGOTTS_INTL’, name: ‘グリンゴッツ国際魔法銀行’ }
];

const FIELD_LABELS = {
bankCode: ‘銀行支店’,
amount: ‘ガリオン額’,
vaultNumber: ‘金庫番号’,
branchCode: ‘支店コード’,
beneficiaryName: ‘魔法使いの名前’
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

```
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
```

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
bankCode: ‘’,
amount: ‘’,
vaultNumber: ‘’,
branchCode: ‘’,
beneficiaryName: ‘’,
description: ‘’
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
apiEndpoint: ‘https://api.gringotts.wiz/banking’,
apiKey: ‘demo-key’,
timeout: 30000,
retryAttempts: 3
};

```
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
```

}, []);

const updateFormData = useCallback((field, value) => {
setFormData(prev => ({
…prev,
[field]: value
}));
}, []);

const validateForm = useCallback(() => {
const requiredFields = [‘bankCode’, ‘amount’, ‘vaultNumber’, ‘branchCode’, ‘beneficiaryName’];
for (const field of requiredFields) {
if (!formData[field]) {
setError(`${FIELD_LABELS[field]}を入力してください`);
return false;
}
}

```
if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
  setError('有効なガリオン額を入力してください');
  return false;
}

return true;
```

}, [formData]);

const handleTransfer = useCallback(async () => {
if (!validateForm()) {
return;
}

```
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
```

}, [formData, validateForm]);

const resetForm = useCallback(() => {
setCurrentStep(TRANSFER_STEPS.IDLE);
setResult(null);
setError(null);
setFormData({
bankCode: ‘’,
amount: ‘’,
vaultNumber: ‘’,
branchCode: ‘’,
beneficiaryName: ‘’,
description: ‘’
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
return ‘ゴブリンによる検証中…’;
case TRANSFER_STEPS.EXECUTING:
return ‘金庫間移動中…’;
case TRANSFER_STEPS.CHECKING_STATUS:
return ‘魔法封印確認中…’;
default:
return ‘魔法振込処理開始’;
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
return ‘エクスペクト・パトローナム’;
} else if (gameState.playerHealth > 70) {
return ‘エクスペリアームス’;
} else if (gameState.dumbledoreEffects.length === 0) {
return ‘プロテゴ’;
} else {
return Object.keys(SPELLS)[Math.floor(Math.random() * Object.keys(SPELLS).length)];
}
}, [gameState.dumbledoreHealth, gameState.playerHealth, gameState.dumbledoreEffects]);

const calculateDamage = useCallback((spellInfo, casterLevel, targetEffects) => {
let damage = spellInfo.damage * (1 + (casterLevel - 1) * 0.1);
if (targetEffects.includes(‘shield’)) damage *= 0.5;
if (targetEffects.includes(‘disarm’)) damage *= 0.75;
return Math.round(damage);
}, []);

const castSpell = useCallback((playerSpell) => {
const dumbledoreSpell = chooseDumbledoreSpell();

```
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
```

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
const [activeTab, setActiveTab] = useState(‘bank’);
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
setActiveTab(‘duel’);
}, [duel]);

// 初期化エラー表示
if (banking.initializationStatus.error) {
return (
<div className="min-h-screen bg-gradient-to-br from-yellow-300 via-pink-400 to-purple-500">
<div className="p-4">
<Card className="w-full max-w-xl mx-auto border-4 border-red-500 shadow-2xl">
<CardHeader className="bg-gradient-to-r from-red-600 to-red-800 text-white text-center">
<CardTitle className="text-2xl font-bold animate-pulse">⚠️ エラー発生 ⚠️</CardTitle>
</CardHeader>
<CardContent className="pt-6 bg-yellow-100">
<Alert className="border-4 border-red-600 bg-red-100">
<AlertCircle className="h-4 w-4" />
<AlertDescription className="font-bold text-red-800">{banking.initializationStatus.error}</AlertDescription>
</Alert>
<Button
onClick={() => window.location.reload()}
className=“mt-4 w-full bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold text-lg animate-bounce”
>
🔄 再読み込み 🔄
</Button>
</CardContent>
</Card>
</div>
</div>
);
}

return (
<div className="min-h-screen bg-gradient-to-br from-yellow-300 via-pink-400 to-purple-500 animated-bg">
<style jsx>{`@keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } } @keyframes rainbow { 0% { color: #ff0000; } 16% { color: #ff8000; } 33% { color: #ffff00; } 50% { color: #80ff00; } 66% { color: #0080ff; } 83% { color: #8000ff; } 100% { color: #ff0080; } } @keyframes blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } } .animated-bg { background-image:  radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,0,0.3) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(255,0,255,0.3) 0%, transparent 50%); animation: float 6s ease-in-out infinite; } .rainbow-text { animation: rainbow 2s linear infinite; font-weight: bold; } .blink-text { animation: blink 1s linear infinite; } .retro-card { border: 4px solid; border-image: linear-gradient(45deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff) 1; box-shadow: 0 0 20px rgba(255,255,255,0.5); }`}</style>

```
  <div className="max-w-4xl mx-auto p-4 space-y-6">
    {/* FC2風ヘッダー */}
    <div className="text-center bg-gradient-to-r from-blue-400 to-purple-600 p-6 rounded-lg border-4 border-yellow-400 shadow-2xl">
      <div className="flex justify-center items-center gap-2 mb-2">
        <span className="text-4xl animate-bounce">🎆</span>
        <h1 className="text-4xl font-bold rainbow-text" style={{fontFamily: 'Comic Sans MS, cursive'}}>
          ★☆ 魔法の世界へようこそ ☆★
        </h1>
        <span className="text-4xl animate-bounce">🎆</span>
      </div>
      
      <div className="text-lg text-white mb-2">
        <span className="blink-text">✨ 最高の魔法体験をお届け ✨</span>
      </div>
      
      {playerName && (
        <div className="bg-yellow-300 p-2 rounded-lg border-2 border-red-500 inline-block">
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl animate-pulse">🧙‍♂️</span>
            <p className="text-xl font-bold text-purple-800" style={{fontFamily: 'Comic Sans MS, cursive'}}>
              魔法使い: {playerName}
            </p>
            <span className="text-2xl animate-pulse">🧙‍♀️</span>
          </div>
        </div>
      )}
      
      {/* カウンター風 */}
      <div className="mt-4 text-center">
        <span className="bg-black text-green-400 px-3 py-1 rounded font-mono text-sm">
          👤 本日の訪問者: {Math.floor(Math.random() * 999) + 1}人目 ⭐
        </span>
      </div>
    </div>
    
    {/* FC2風ナビゲーション */}
    <div className="bg-gradient-to-r from-orange-400 to-red-500 p-2 rounded-lg border-4 border-blue-400">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 mb-6 bg-white border-2 border-purple-500">
          <TabsTrigger 
            value="bank" 
            className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold border-2 border-yellow-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-400 data-[state=active]:to-orange-500"
          >
            <span className="text-xl">💰</span>
            <span className="text-lg font-bold">グリンゴッツ銀行</span>
            <span className="text-xl">💰</span>
          </TabsTrigger>
          <TabsTrigger 
            value="duel" 
            disabled={!canDuel && !duel.gameStarted} 
            className="bg-gradient-to-r from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600 text-white font-bold border-2 border-yellow-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-400 data-[state=active]:to-orange-500"
          >
            <span className="text-xl">⚡</span>
            <span className="text-lg font-bold">ダンブルドアとの決闘</span>
            <span className="text-xl">⚡</span>
            {canDuel && !duel.gameStarted && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full border-2 border-yellow-300 blink-text">
                NEW!
              </span>
            )}
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
    
    {/* FC2風フッター */}
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-lg border-4 border-yellow-400 text-center">
      <div className="text-white font-bold">
        <p className="rainbow-text text-lg">✨ Powered by Magic Technology ✨</p>
        <p className="text-sm mt-2">© 2024 魔法の世界 - すべての権利は魔法省によって保護されています</p>
        <div className="flex justify-center gap-4 mt-2 text-xs">
          <span className="blink-text">🌟 今すぐ登録</span>
          <span>|</span>
          <span className="blink-text">📧 お問い合わせ</span>
          <span>|</span>
          <span className="blink-text">🎯 サイトマップ</span>
        </div>
      </div>
    </div>
  </div>
</div>
```

);
};

// 銀行インターフェースコンポーネント
const BankingInterface = ({ banking, canDuel, gameStarted, onStartDuel }) => (
<Card className="w-full retro-card bg-gradient-to-br from-green-100 to-blue-100">
<CardHeader className="bg-gradient-to-r from-green-500 to-teal-600 text-white text-center">
<CardTitle className=“text-2xl font-bold” style={{fontFamily: ‘Comic Sans MS, cursive’}}>
<span className="text-3xl">🏦</span>
<span className="rainbow-text">グリンゴッツ魔法銀行取引</span>
<span className="text-3xl">🏦</span>
</CardTitle>
<div className="text-sm bg-yellow-300 text-black p-2 rounded-lg border-2 border-red-400 inline-block mt-2">
<span className="blink-text">💎 安全・確実・迅速な魔法振込 💎</span>
</div>
</CardHeader>
<CardContent className="pt-6 bg-gradient-to-br from-yellow-50 to-green-50">
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

  <div className="space-y-2 p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg border-4 border-blue-500">
    <Label htmlFor="bank-select" className="text-lg font-bold text-purple-800" style={{fontFamily: 'Comic Sans MS, cursive'}}>
      🏪 支店を選択
    </Label>
    <Select
      value={banking.formData.bankCode}
      onValueChange={(value) => banking.updateFormData('bankCode', value)}
      disabled={banking.isProcessing}
    >
      <SelectTrigger id="bank-select" className="border-4 border-purple-400 bg-white">
        <SelectValue placeholder="✨ 支店を選択してください ✨" />
      </SelectTrigger>
      <SelectContent className="bg-yellow-100 border-4 border-purple-400">
        {BANK_LIST.map(bank => (
          <SelectItem key={bank.code} value={bank.code} className="hover:bg-pink-200">
            🏛️ {bank.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

// 振込フォームコンポーネント
const TransferForm = ({ banking }) => (

  <div className="space-y-4 p-4 bg-gradient-to-br from-pink-100 to-yellow-100 rounded-lg border-4 border-pink-400">
    <h3 className="text-xl font-bold text-center rainbow-text" style={{fontFamily: 'Comic Sans MS, cursive'}}>
      💸 振込情報入力フォーム 💸
    </h3>

```
<div className="grid grid-cols-2 gap-4">
  <div className="space-y-2">
    <Label htmlFor="amount" className="text-lg font-bold text-green-700">💰 ガリオン額</Label>
    <Input
      id="amount"
      type="number"
      placeholder="100"
      value={banking.formData.amount}
      onChange={(e) => banking.updateFormData('amount', e.target.value)}
      disabled={banking.isProcessing}
      className="border-4 border-green-400 bg-white text-lg font-bold"
    />
    {Number(banking.formData.amount) >= 100 && (
      <p className="text-xs text-green-600 flex items-center gap-1 bg-green-100 p-2 rounded border-2 border-green-400">
        <CheckCircle className="h-3 w-3" />
        <span className="font-bold blink-text">🎉 100ガリオン以上で決闘可能になります！ 🎉</span>
      </p>
    )}
  </div>
  
  <div className="space-y-2">
    <Label htmlFor="branch-code" className="text-lg font-bold text-blue-700">🔐 支店暗号</Label>
    <Input
      id="branch-code"
      placeholder="D12"
      value={banking.formData.branchCode}
      onChange={(e) => banking.updateFormData('branchCode', e.target.value)}
      disabled={banking.isProcessing}
      className="border-4 border-blue-400 bg-white text-lg font-bold"
    />
  </div>
</div>

<div className="space-y-2">
  <Label htmlFor="vault-number" className="text-lg font-bold text-purple-700">🔑 金庫番号</Label>
  <Input
    id="vault-number"
    placeholder="687"
    value={banking.formData.vaultNumber}
    onChange={(e) => banking.updateFormData('vaultNumber', e.target.value)}
    disabled={banking.isProcessing}
    className="border-4 border-purple-400 bg-white text-lg font-bold"
  />
</div>

<div className="space-y-2">
  <Label htmlFor="beneficiary-name" className="text-lg font-bold text-red-700">👤 魔法使いの名前</Label>
  <Input
    id="beneficiary-name"
    placeholder="ハリー・ポッター"
    value={banking.formData.beneficiaryName}
    onChange={(e) => banking.updateFormData('beneficiaryName', e.target.value)}
    disabled={banking.isProcessing}
    className="border-4 border-red-400 bg-white text-lg font-bold"
  />
</div>

<div className="space-y-2">
  <Label htmlFor="description" className="text-lg font-bold text-orange-700">📝 取引メモ（任意）</Label>
  <Input
    id="description"
    placeholder="ホグワーツ学費"
    value={banking.formData.description}
    onChange={(e) => banking.updateFormData('description', e.target.value)}
    disabled={banking.isProcessing}
    className="border-4 border-orange-400 bg-white text-lg font-bold"
  />
</div>
```

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
return ‘🧙‍♂️ ゴブリンによる振込情報を検証しています… 🧙‍♂️’;
case TRANSFER_STEPS.EXECUTING:
return ‘⚡ 地下金庫での振込を実行しています… ⚡’;
case TRANSFER_STEPS.CHECKING_STATUS:
return ‘🔐 魔法封印状態を確認しています… 🔐’;
default:
return ‘’;
}
};

return (
<div className="bg-gradient-to-r from-yellow-200 to-orange-200 p-4 rounded-lg border-4 border-red-500 shadow-2xl">
<div className="flex items-center space-x-3 justify-center">
<Loader2 className="h-8 w-8 text-red-600 animate-spin" />
<p className=“text-red-800 text-lg font-bold blink-text” style={{fontFamily: ‘Comic Sans MS, cursive’}}>
{getStatusMessage()}
</p>
<Loader2 className="h-8 w-8 text-red-600 animate-spin" />
</div>
</div>
);
};

// 取引結果表示コンポーネント
const TransferResult = ({ banking, canDuel, gameStarted, onStartDuel }) => {
if (banking.error) {
return (
<Alert className="border-4 border-red-600 bg-red-100">
<AlertCircle className="h-6 w-6 text-red-600" />
<AlertDescription className="text-lg font-bold text-red-800">
❌ {banking.error} ❌
</AlertDescription>
</Alert>
);
}

if (!banking.result) return null;

return (
<div className="space-y-4">
<Alert className="bg-gradient-to-r from-green-100 to-green-200 border-4 border-green-500">
<CheckCircle className="h-6 w-6 text-green-600" />
<AlertDescription className="text-lg font-bold text-green-800">
✅ {banking.result.message} ✅
</AlertDescription>
</Alert>

```
  <div className="bg-gradient-to-br from-purple-100 to-blue-100 p-4 rounded-lg border-4 border-purple-500 shadow-xl">
    <h3 className="font-bold text-purple-800 text-xl text-center mb-3 rainbow-text" style={{fontFamily: 'Comic Sans MS, cursive'}}>
      ✨ 振込詳細 ✨
    </h3>
    <div className="grid grid-cols-2 gap-3 text-sm">
      <div className="text-purple-700 font-bold">💰 ガリオン額:</div>
      <div className="font-bold text-green-600 text-lg">{Number(banking.result.details.amount).toLocaleString()} G</div>
      
      <div className="text-purple-700 font-bold">👤 受取人:</div>
      <div className="font-bold text-blue-600">{banking.result.details.beneficiary}</div>
      
      <div className="text-purple-700 font-bold">⏰ 処理日時:</div>
      <div className="font-bold text-red-600">
        {new Date(banking.result.details.processedAt).toLocaleString('ja-JP')}
      </div>
      
      <div className="text-purple-700 font-bold">🔖 魔法参照番号:</div>
      <div className="font-bold text-orange-600">{banking.result.details.reference}</div>
    </div>
  </div>
  
  {canDuel && !gameStarted && (
    <div className="bg-gradient-to-r from-yellow-200 to-orange-200 p-4 rounded-lg border-4 border-red-500 shadow-2xl">
      <h3 className="font-bold text-red-700 mb-2 text-xl text-center rainbow-text" style={{fontFamily: 'Comic Sans MS, cursive'}}>
        🎯 特別招待！ 🎯
      </h3>
      <p className="text-sm text-red-600 mb-3 text-center font-bold">
        高額取引をご利用いただきありがとうございます！<br/>
        <span className="blink-text">ダンブルドア教授との特別決闘にご招待します！</span>
      </p>
      <Button 
        onClick={onStartDuel} 
        className="w-full bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white font-bold text-lg border-4 border-yellow-400 animate-pulse"
      >
        ⚔️ 決闘を始める ⚔️
      </Button>
    </div>
  )}
</div>
```

);
};

// アクションボタンコンポーネント
const ActionButtons = ({ banking }) => {
if (banking.result) {
return (
<Button
onClick={banking.resetForm}
className="w-full mt-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold text-lg border-4 border-yellow-400"
>
🔄 新しい振込を作成 🔄
</Button>
);
}

return (
<Button
onClick={banking.handleTransfer}
disabled={banking.isProcessing}
className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-bold text-xl border-4 border-yellow-400 animate-bounce"
>
{banking.isProcessing && (
<Loader2 className="mr-2 h-6 w-6 animate-spin" />
)}
⚡ {banking.getButtonText()} ⚡
</Button>
);
};

// 決闘インターフェースコンポーネント
const DuelInterface = ({ duel, playerName, onReturnToBank }) => (
<Card className="w-full retro-card bg-gradient-to-br from-red-100 to-purple-100">
<CardHeader className="bg-gradient-to-r from-red-500 to-purple-600 text-white text-center">
<CardTitle className=“text-2xl font-bold” style={{fontFamily: ‘Comic Sans MS, cursive’}}>
<span className="text-3xl">⚔️</span>
<span className="rainbow-text">ダンブルドアとの魔法決闘</span>
<span className="text-3xl">⚔️</span>
</CardTitle>
<div className="text-sm bg-yellow-300 text-black p-2 rounded-lg border-2 border-red-400 inline-block mt-2">
<span className="blink-text">🔥 最強の魔法使いを目指せ！ 🔥</span>
</div>
</CardHeader>
<CardContent className="pt-6 bg-gradient-to-br from-blue-50 to-purple-50">
<div className="p-6 rounded-lg bg-gradient-to-br from-yellow-100 to-pink-100 border-4 border-rainbow">
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
    <div className="text-8xl mb-4 animate-bounce">🧙‍♂️</div>
    <h2 className="text-4xl font-bold rainbow-text" style={{fontFamily: 'Comic Sans MS, cursive'}}>
      ダンブルドア教授との魔法決闘
    </h2>
    <p className="text-blue-700 max-w-md mx-auto text-lg font-bold bg-white p-4 rounded-lg border-4 border-blue-500">
      ダンブルドア教授との魔法の決闘に挑戦しましょう！<br/>
      <span className="blink-text">あなたの魔法スキルを試す時が来ました。</span>
    </p>
    <Button 
      onClick={onStartGame}
      className="bg-gradient-to-r from-red-600 to-purple-700 hover:from-red-700 hover:to-purple-800 text-white px-8 py-4 text-2xl font-bold border-4 border-yellow-400 animate-pulse"
    >
      ⚡ 決闘を開始 ⚡
    </Button>
  </div>
);

// 決闘ゲームコンポーネント
const DuelGame = ({ duel, playerName, onReturnToBank }) => (

  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-center rainbow-text" style={{fontFamily: 'Comic Sans MS, cursive'}}>
      ⚔️ ダンブルドアとの決闘 ⚔️
    </h2>

```
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
  onClick={() => {
    duel.resetGame();
    onReturnToBank();
  }}
  className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold text-lg border-4 border-yellow-400"
>
  🏦 銀行に戻る 🏦
</Button>
```

  </div>
);

// プレイヤーステータスコンポーネント
const PlayerStatus = ({ duel, playerName }) => (

  <div className="bg-gradient-to-r from-blue-100 to-green-100 p-4 rounded-lg border-4 border-blue-500">
    <h3 className="text-xl font-bold text-blue-800 mb-2 text-center" style={{fontFamily: 'Comic Sans MS, cursive'}}>
      ✨ {playerName || "魔法使い"} (レベル {duel.gameState.playerLevel}) ✨
    </h3>
    <div className="w-full bg-gray-300 rounded-full h-4 mb-2 border-2 border-black">
      <div 
        className="bg-gradient-to-r from-blue-500 to-blue-700 h-4 rounded-full transition-all duration-500 border border-white" 
        style={{width: `${duel.gameState.playerHealth}%`}}
      />
    </div>
    <div className="grid grid-cols-3 gap-2 text-sm font-bold">
      <p className="text-blue-800 bg-white p-1 rounded border-2 border-blue-400">❤️ 体力: {duel.gameState.playerHealth}/100</p>
      <p className="text-green-800 bg-white p-1 rounded border-2 border-green-400">⭐ 経験値: {duel.gameState.playerExp}/100</p>
      <p className="text-purple-800 bg-white p-1 rounded border-2 border-purple-400">🔮 効果: {duel.gameState.playerEffects.join(', ') || "なし"}</p>
    </div>
  </div>
);

// ダンブルドアステータスコンポーネント
const DumbledoreStatus = ({ duel }) => (

  <div className="bg-gradient-to-r from-purple-100 to-red-100 p-4 rounded-lg border-4 border-purple-500">
    <h3 className="text-xl font-bold text-purple-800 mb-2 text-center" style={{fontFamily: 'Comic Sans MS, cursive'}}>
      🧙‍♂️ ダンブルドア教授 🧙‍♂️
    </h3>
    <div className="w-full bg-gray-300 rounded-full h-4 mb-2 border-2 border-black">
      <div 
        className="bg-gradient-to-r from-purple-500 to-purple-700 h-4 rounded-full transition-all duration-500 border border-white" 
        style={{width: `${duel.gameState.dumbledoreHealth}%`}}
      />
    </div>
    <p className="text-sm font-bold text-purple-800 bg-white p-2 rounded border-2 border-purple-400">
      ❤️ 体力: {duel.gameState.dumbledoreHealth}/100 | 🔮 効果: {duel.gameState.dumbledoreEffects.join(', ') || "なし"}
    </p>
  </div>
);

// ゲームステータスコンポーネント
const GameStatus = ({ duel }) => (

  <div className="bg-gradient-to-r from-yellow-200 to-orange-200 p-4 rounded-lg border-4 border-red-500">
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2 bg-white p-2 rounded border-2 border-blue-400">
        <Shield className="h-6 w-6 text-blue-600" />
        <span className="font-bold text-blue-800 text-lg">🔄 ラウンド: {duel.gameState.round}</span>
      </div>
      <div className="flex items-center gap-2 bg-white p-2 rounded border-2 border-purple-400">
        <Zap className="h-6 w-6 text-purple-600" />
        <span className="font-bold text-purple-800 text-lg">⚡ スコア: {duel.gameState.score}</span>
      </div>
    </div>
  </div>
);

// 前回の攻撃結果コンポーネント
const LastRoundSummary = ({ lastRound }) => (

  <div className="bg-gradient-to-r from-green-100 to-blue-100 p-4 rounded-lg border-4 border-green-500 space-y-2">
    <h4 className="font-bold text-green-800 text-center text-lg" style={{fontFamily: 'Comic Sans MS, cursive'}}>
      ⚔️ 前回の攻撃結果 ⚔️
    </h4>
    <div className="space-y-1 text-sm">
      <p className="text-blue-800 bg-white p-2 rounded border-2 border-blue-400 font-bold">
        <span>✨ あなたの呪文:</span> {lastRound.playerSpell} 
        <span className="text-red-600 ml-2">(ダメージ: {lastRound.playerDamage})</span>
      </p>
      <p className="text-purple-800 bg-white p-2 rounded border-2 border-purple-400 font-bold">
        <span>🧙‍♂️ ダンブルドアの呪文:</span> {lastRound.dumbledoreSpell} 
        <span className="text-red-600 ml-2">(ダメージ: {lastRound.dumbledoreDamage})</span>
      </p>
    </div>
  </div>
);

// 呪文選択コンポーネント
const SpellSelection = ({ duel }) => (

  <div className="space-y-4">
    <h3 className="font-bold text-center text-xl rainbow-text" style={{fontFamily: 'Comic Sans MS, cursive'}}>
      🪄 呪文を選んでください 🪄
    </h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {Object.entries(SPELLS).map(([spell, info]) => (
        <Button 
          key={spell} 
          onClick={() => duel.castSpell(spell)}
          className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg h-auto border-4 border-yellow-400 transform hover:scale-105 transition-transform"
        >
          <div className="text-center space-y-1">
            <div className="text-3xl animate-pulse">{info.icon}</div>
            <div className="font-bold text-sm">{spell}</div>
            <div className="text-xs bg-white text-black p-1 rounded">
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
    <div className={`p-6 rounded-lg text-center border-4 ${
      duel.gameState.playerHealth <= 0 
        ? 'bg-gradient-to-br from-red-200 to-red-300 text-red-900 border-red-600' 
        : 'bg-gradient-to-br from-green-200 to-green-300 text-green-900 border-green-600'
    }`}>
      <div className="text-6xl mb-2 animate-bounce">
        {duel.gameState.playerHealth <= 0 ? '💀' : '🏆'}
      </div>
      <h2 className="text-3xl font-bold mb-2 rainbow-text" style={{fontFamily: 'Comic Sans MS, cursive'}}>
        {duel.gameState.playerHealth <= 0 
          ? '💥 ゲームオーバー！ダンブルドアの勝利です。 💥' 
          : '🎉 おめでとうございます！あなたの勝利です。 🎉'
        }
      </h2>
      <p className="text-2xl font-bold">最終スコア: {duel.gameState.score}</p>
    </div>
    <Button 
      onClick={duel.resetGame}
      className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold text-xl border-4 border-yellow-400 animate-pulse"
    >
      🔄 再挑戦する 🔄
    </Button>
  </div>
);

export default WizardingBankAndDuel;