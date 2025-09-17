import React, { useState, useEffect, useCallback, useMemo } from ‘react’;
import { Card, CardHeader, CardTitle, CardContent } from ‘@/components/ui/card’;
import { Alert, AlertDescription } from ‘@/components/ui/alert’;
import { Button } from ‘@/components/ui/button’;
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from ‘@/components/ui/select’;
import { Input } from ‘@/components/ui/input’;
import { Label } from ‘@/components/ui/label’;
import { Tabs, TabsContent, TabsList, TabsTrigger } from ‘@/components/ui/tabs’;
import { Loader2, CheckCircle, AlertCircle, Shield, Zap } from ‘lucide-react’;

// 定数とデータ
const SPELLS = {
‘ルーモス’: { damage: 10, effect: ‘light’, description: ‘明かりを灯す呪文’, icon: ‘⚡’ },
‘エクスペクト・パトローナム’: { damage: 20, effect: ‘patronus’, description: ‘守護霊を呼び出す強力な呪文’, icon: ‘🛡️’ },
‘エクスペリアームス’: { damage: 15, effect: ‘disarm’, description: ‘相手の武器を奪う呪文’, icon: ‘⚔️’ },
‘ウィンガーディアム・レビオサ’: { damage: 5, effect: ‘levitate’, description: ‘物を浮かせる呪文’, icon: ‘✨’ },
‘プロテゴ’: { damage: 0, effect: ‘shield’, description: ‘防御の盾を作る呪文’, icon: ‘🔮’ },
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
return ‘ニューラル検証中’;
case TRANSFER_STEPS.EXECUTING:
return ‘量子転送実行中’;
case TRANSFER_STEPS.CHECKING_STATUS:
return ‘ブロックチェーン確認中’;
default:
return ‘デジタル転送開始’;
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

// カスタムフック：アナコンダ生成
const useAnacondaGenerator = () => {
const [svgSize, setSvgSize] = useState(600);
const [snakeData, setSnakeData] = useState(null);
const [generationCount, setGenerationCount] = useState(0);

const generateSnakePoints = useCallback(() => {
const points = [{ x: 50, y: svgSize / 2 }];

```
for (let i = 1; i < 8; i++) {
  const x = 50 + ((svgSize - 100) * i) / 7;
  const y = svgSize / 2 + (Math.random() - 0.5) * 200;
  points.push({ x, y });
}

return points;
```

}, [svgSize]);

const generateAnaconda = useCallback(() => {
const points = generateSnakePoints();
const patterns = [];

```
// Generate patterns for snake body
for (let i = 0; i < points.length - 1; i++) {
  const x1 = points[i].x;
  const y1 = points[i].y;
  const x2 = points[i + 1].x;
  const y2 = points[i + 1].y;
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  
  patterns.push({ x: midX, y: midY, r: 20 });
}

setSnakeData({
  points,
  patterns,
  headX: points[0].x - 10,
  headY: points[0].y,
  eyeX: points[0].x - 25,
  eyeY: points[0].y - 10,
  tongueStartX: points[0].x - 40,
  tongueStartY: points[0].y,
  tongue1EndX: points[0].x - 70,
  tongue1EndY: points[0].y - 15,
  tongue2EndX: points[0].x - 70,
  tongue2EndY: points[0].y + 15
});

setGenerationCount(prev => prev + 1);
```

}, [generateSnakePoints]);

const downloadSVG = useCallback(() => {
if (!snakeData) return;

```
const svgElement = document.getElementById('anaconda-svg');
if (!svgElement) return;

const svgData = new XMLSerializer().serializeToString(svgElement);
const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
const svgUrl = URL.createObjectURL(svgBlob);

const downloadLink = document.createElement('a');
downloadLink.href = svgUrl;
downloadLink.download = `anaconda_${generationCount}.svg`;
document.body.appendChild(downloadLink);
downloadLink.click();
document.body.removeChild(downloadLink);
URL.revokeObjectURL(svgUrl);
```

}, [snakeData, generationCount]);

// Generate initial snake on mount
useEffect(() => {
generateAnaconda();
}, [generateAnaconda]);

return {
svgSize,
setSvgSize,
snakeData,
generateAnaconda,
downloadSVG,
generationCount
};
};

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
<div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-900 to-black"></div>
<div className="relative z-10 flex items-center justify-center min-h-screen p-4">
<div className="w-full max-w-xl mx-auto">
<div className="backdrop-blur-xl bg-red-500/10 border border-red-500/30 rounded-2xl p-6 shadow-2xl">
<div className="text-center mb-4">
<div className="text-4xl text-red-400 mb-2">⚠</div>
<h1 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
システムエラー
</h1>
</div>
<Alert className="border border-red-500/30 bg-red-900/20 mb-4">
<AlertCircle className="h-4 w-4 text-red-400" />
<AlertDescription className="text-red-100">
{banking.initializationStatus.error}
</AlertDescription>
</Alert>
<Button
onClick={() => window.location.reload()}
className=“w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0”
>
システム再起動
</Button>
</div>
</div>
</div>
</div>
);
}

return (
<div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
{/* Background Effects */}
<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-900 to-black"></div>
<div className="absolute inset-0">
<div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
<div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
<div className="absolute top-3/4 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
</div>

```
  {/* Grid Pattern Overlay */}
  <div className="absolute inset-0 bg-[linear-gradient(rgba(147,51,234,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(147,51,234,0.1)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

  <div className="relative z-10 max-w-6xl mx-auto p-6 space-y-8">
    {/* Header */}
    <div className="text-center backdrop-blur-xl bg-slate-800/30 border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
      <div className="mb-4">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
          NEXUS MAGICAL SYSTEMS
        </h1>
        <p className="text-slate-400 text-lg">Advanced Wizarding Technology Platform</p>
      </div>
      
      {playerName && (
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 backdrop-blur-md border border-purple-400/30 rounded-full px-6 py-3">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-purple-200 font-medium">ユーザー: {playerName}</span>
        </div>
      )}
      
      {/* Status Bar */}
      <div className="mt-6 flex justify-center">
        <div className="bg-black/50 backdrop-blur-md border border-green-500/30 rounded-full px-4 py-2">
          <span className="text-green-400 text-sm font-mono">SYSTEM ONLINE • CONNECTION SECURE</span>
        </div>
      </div>
    </div>
    
    {/* Navigation */}
    <div className="backdrop-blur-xl bg-slate-800/30 border border-slate-700/50 rounded-2xl p-2">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 bg-transparent border-0 gap-2">
          <TabsTrigger 
            value="bank" 
            className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/30 data-[state=active]:from-emerald-500/40 data-[state=active]:to-teal-500/40 data-[state=active]:border-emerald-400/60 text-emerald-100 hover:from-emerald-500/30 hover:to-teal-500/30 rounded-xl transition-all duration-300"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              <span className="font-medium">デジタル銀行</span>
            </div>
          </TabsTrigger>
          <TabsTrigger 
            value="duel" 
            disabled={!canDuel && !duel.gameStarted}
            className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-400/30 data-[state=active]:from-red-500/40 data-[state=active]:to-orange-500/40 data-[state=active]:border-red-400/60 text-red-100 hover:from-red-500/30 hover:to-orange-500/30 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <span className="font-medium">量子決闘</span>
            </div>
            {canDuel && !duel.gameStarted && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="anaconda" 
            className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 data-[state=active]:from-purple-500/40 data-[state=active]:to-pink-500/40 data-[state=active]:border-purple-400/60 text-purple-100 hover:from-purple-500/30 hover:to-pink-500/30 rounded-xl transition-all duration-300"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span className="font-medium">AI生成器</span>
            </div>
          </TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
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
          
          <TabsContent value="anaconda">
            <AnacondaGenerator />
          </TabsContent>
        </div>
      </Tabs>
    </div>
    
    {/* Footer */}
    <div className="text-center backdrop-blur-xl bg-slate-800/20 border border-slate-700/30 rounded-2xl p-6">
      <div className="text-slate-400">
        <p className="text-lg bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent font-semibold">
          Powered by Quantum Magic Technology
        </p>
        <p className="text-sm mt-2">© 2024 Nexus Systems - All rights protected by Neural Networks</p>
        <div className="flex justify-center gap-6 mt-3 text-xs">
          <span className="text-cyan-400 hover:text-cyan-300 cursor-pointer transition-colors">Neural Interface</span>
          <span className="text-slate-500">•</span>
          <span className="text-purple-400 hover:text-purple-300 cursor-pointer transition-colors">Quantum Support</span>
          <span className="text-slate-500">•</span>
          <span className="text-pink-400 hover:text-pink-300 cursor-pointer transition-colors">System Map</span>
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

  <div className="backdrop-blur-xl bg-slate-800/30 border border-slate-700/50 rounded-2xl overflow-hidden">
    <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-b border-slate-700/50 p-6">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
        Gringotts Digital Banking System
      </h2>
      <p className="text-slate-400 mt-1">Secure • Instant • Quantum-Encrypted</p>
    </div>
    <div className="p-6 space-y-6">
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
  </div>
);

// 銀行選択コンポーネント
const BankSelection = ({ banking }) => (

  <div className="space-y-3">
    <Label htmlFor="bank-select" className="text-slate-200 font-medium">
      支店選択
    </Label>
    <Select
      value={banking.formData.bankCode}
      onValueChange={(value) => banking.updateFormData('bankCode', value)}
      disabled={banking.isProcessing}
    >
      <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-slate-200 backdrop-blur-md">
        <SelectValue placeholder="支店を選択してください" />
      </SelectTrigger>
      <SelectContent className="bg-slate-800 border-slate-600 backdrop-blur-xl">
        {BANK_LIST.map(bank => (
          <SelectItem key={bank.code} value={bank.code} className="text-slate-200 hover:bg-slate-700">
            {bank.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

// 振込フォームコンポーネント
const TransferForm = ({ banking }) => (

  <div className="space-y-4 bg-slate-900/30 backdrop-blur-md border border-slate-700/50 rounded-xl p-6">
    <h3 className="text-xl font-semibold text-slate-200 mb-4">転送情報</h3>

```
<div className="grid grid-cols-2 gap-4">
  <div className="space-y-2">
    <Label htmlFor="amount" className="text-slate-300">ガリオン額</Label>
    <Input
      id="amount"
      type="number"
      placeholder="100"
      value={banking.formData.amount}
      onChange={(e) => banking.updateFormData('amount', e.target.value)}
      disabled={banking.isProcessing}
      className="bg-slate-800/50 border-slate-600/50 text-slate-200 backdrop-blur-md"
    />
    {Number(banking.formData.amount) >= 100 && (
      <p className="text-xs text-green-400 flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded p-2">
        <CheckCircle className="h-3 w-3" />
        <span>100ガリオン以上で量子決闘が解放されます</span>
      </p>
    )}
  </div>
  
  <div className="space-y-2">
    <Label htmlFor="branch-code" className="text-slate-300">支店コード</Label>
    <Input
      id="branch-code"
      placeholder="D12"
      value={banking.formData.branchCode}
      onChange={(e) => banking.updateFormData('branchCode', e.target.value)}
      disabled={banking.isProcessing}
      className="bg-slate-800/50 border-slate-600/50 text-slate-200 backdrop-blur-md"
    />
  </div>
</div>

<div className="space-y-2">
  <Label htmlFor="vault-number" className="text-slate-300">金庫番号</Label>
  <Input
    id="vault-number"
    placeholder="687"
    value={banking.formData.vaultNumber}
    onChange={(e) => banking.updateFormData('vaultNumber', e.target.value)}
    disabled={banking.isProcessing}
    className="bg-slate-800/50 border-slate-600/50 text-slate-200 backdrop-blur-md"
  />
</div>

<div className="space-y-2">
  <Label htmlFor="beneficiary-name" className="text-slate-300">受益者名</Label>
  <Input
    id="beneficiary-name"
    placeholder="ハリー・ポッター"
    value={banking.formData.beneficiaryName}
    onChange={(e) => banking.updateFormData('beneficiaryName', e.target.value)}
    disabled={banking.isProcessing}
    className="bg-slate-800/50 border-slate-600/50 text-slate-200 backdrop-blur-md"
  />
</div>

<div className="space-y-2">
  <Label htmlFor="description" className="text-slate-300">取引メモ（任意）</Label>
  <Input
    id="description"
    placeholder="ホグワーツ学費"
    value={banking.formData.description}
    onChange={(e) => banking.updateFormData('description', e.target.value)}
    disabled={banking.isProcessing}
    className="bg-slate-800/50 border-slate-600/50 text-slate-200 backdrop-blur-md"
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
return ‘ニューラルネットワークによる検証を実行中’;
case TRANSFER_STEPS.EXECUTING:
return ‘量子暗号化転送を実行中’;
case TRANSFER_STEPS.CHECKING_STATUS:
return ‘ブロックチェーン確認を実行中’;
default:
return ‘’;
}
};

return (
<div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 backdrop-blur-md border border-cyan-400/30 rounded-xl p-4">
<div className="flex items-center space-x-3">
<Loader2 className="h-5 w-5 text-cyan-400 animate-spin" />
<p className="text-cyan-100 font-medium">{getStatusMessage()}</p>
</div>
<div className="mt-3 w-full bg-slate-700 rounded-full h-2">
<div className=“bg-gradient-to-r from-cyan-400 to-purple-400 h-2 rounded-full animate-pulse” style={{width: ‘75%’}}></div>
</div>
</div>
);
};

// 取引結果表示コンポーネント
const TransferResult = ({ banking, canDuel, gameStarted, onStartDuel }) => {
if (banking.error) {
return (
<Alert className="border border-red-500/30 bg-red-900/20 backdrop-blur-md">
<AlertCircle className="h-4 w-4 text-red-400" />
<AlertDescription className="text-red-100">
{banking.error}
</AlertDescription>
</Alert>
);
}

if (!banking.result) return null;

return (
<div className="space-y-4">
<Alert className="bg-green-500/10 border border-green-500/30 backdrop-blur-md">
<CheckCircle className="h-4 w-4 text-green-400" />
<AlertDescription className="text-green-100">
{banking.result.message}
</AlertDescription>
</Alert>

```
  <div className="bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-6">
    <h3 className="font-semibold text-slate-200 text-lg mb-4">取引詳細</h3>
    <div className="grid grid-cols-2 gap-3 text-sm">
      <div className="text-slate-400">ガリオン額:</div>
      <div className="font-medium text-green-400">{Number(banking.result.details.amount).toLocaleString()} G</div>
      
      <div className="text-slate-400">受取人:</div>
      <div className="font-medium text-cyan-400">{banking.result.details.beneficiary}</div>
      
      <div className="text-slate-400">処理日時:</div>
      <div className="font-medium text-purple-400">
        {new Date(banking.result.details.processedAt).toLocaleString('ja-JP')}
      </div>
      
      <div className="text-slate-400">参照番号:</div>
      <div className="font-medium text-orange-400">{banking.result.details.reference}</div>
    </div>
  </div>
  
  {canDuel && !gameStarted && (
    <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 backdrop-blur-md border border-yellow-400/30 rounded-xl p-6">
      <h3 className="font-semibold text-yellow-400 mb-3 text-lg">高額取引特典</h3>
      <p className="text-slate-300 mb-4">
        量子決闘システムへのアクセスが許可されました。
      </p>
      <Button 
        onClick={onStartDuel} 
        className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold"
      >
        量子決闘を開始
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
className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-slate-200"
>
新しい転送を作成
</Button>
);
}

return (
<Button
onClick={banking.handleTransfer}
disabled={banking.isProcessing}
className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold disabled:opacity-50"
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

  <div className="backdrop-blur-xl bg-slate-800/30 border border-slate-700/50 rounded-2xl overflow-hidden">
    <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border-b border-slate-700/50 p-6">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
        Quantum Duel Chamber
      </h2>
      <p className="text-slate-400 mt-1">Neural Combat System • Real-time Processing</p>
    </div>
    <div className="p-6">
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
  </div>
);

// 決闘開始コンポーネント
const DuelStart = ({ onStartGame }) => (

  <div className="text-center space-y-6">
    <div className="text-6xl mb-4">⚡</div>
    <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
      Dumbledore Neural Combat System
    </h2>
    <p className="text-slate-400 max-w-md mx-auto">
      Advanced AI opponent with adaptive learning algorithms. 
      Test your skills in real-time quantum combat simulation.
    </p>
    <Button 
      onClick={onStartGame}
      className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-8 py-3 text-lg font-semibold"
    >
      Initialize Combat Sequence
    </Button>
  </div>
);

// 決闘ゲームコンポーネント
const DuelGame = ({ duel, playerName, onReturnToBank }) => (

  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-red-400 to-purple-400 bg-clip-text text-transparent">
      Combat Session Active
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
  className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-slate-200"
>
  Return to Banking System
</Button>
```

  </div>
);

// プレイヤーステータスコンポーネント
const PlayerStatus = ({ duel, playerName }) => (

  <div className="bg-slate-900/50 backdrop-blur-md border border-blue-500/30 rounded-xl p-4">
    <h3 className="text-lg font-semibold text-blue-400 mb-3">
      {playerName || "Player"} • Level {duel.gameState.playerLevel}
    </h3>
    <div className="w-full bg-slate-700 rounded-full h-3 mb-3">
      <div 
        className="bg-gradient-to-r from-blue-400 to-cyan-400 h-3 rounded-full transition-all duration-500" 
        style={{width: `${duel.gameState.playerHealth}%`}}
      />
    </div>
    <div className="grid grid-cols-3 gap-3 text-sm">
      <div className="text-slate-400">Health: <span className="text-blue-400 font-medium">{duel.gameState.playerHealth}/100</span></div>
      <div className="text-slate-400">EXP: <span className="text-green-400 font-medium">{duel.gameState.playerExp}/100</span></div>
      <div className="text-slate-400">Effects: <span className="text-purple-400 font-medium">{duel.gameState.playerEffects.join(', ') || "None"}</span></div>
    </div>
  </div>
);

// ダンブルドアステータスコンポーネント
const DumbledoreStatus = ({ duel }) => (

  <div className="bg-slate-900/50 backdrop-blur-md border border-purple-500/30 rounded-xl p-4">
    <h3 className="text-lg font-semibold text-purple-400 mb-3">
      Dumbledore AI • Neural Level 10
    </h3>
    <div className="w-full bg-slate-700 rounded-full h-3 mb-3">
      <div 
        className="bg-gradient-to-r from-purple-400 to-pink-400 h-3 rounded-full transition-all duration-500" 
        style={{width: `${duel.gameState.dumbledoreHealth}%`}}
      />
    </div>
    <div className="text-sm text-slate-400">
      Health: <span className="text-purple-400 font-medium">{duel.gameState.dumbledoreHealth}/100</span> • 
      Effects: <span className="text-pink-400 font-medium">{duel.gameState.dumbledoreEffects.join(', ') || "None"}</span>
    </div>
  </div>
);

// ゲームステータスコンポーネント
const GameStatus = ({ duel }) => (

  <div className="bg-slate-900/30 backdrop-blur-md border border-slate-700/50 rounded-xl p-4">
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-cyan-400" />
        <span className="font-medium text-cyan-400">Round: {duel.gameState.round}</span>
      </div>
      <div className="flex items-center gap-2">
        <Zap className="h-5 w-5 text-yellow-400" />
        <span className="font-medium text-yellow-400">Score: {duel.gameState.score}</span>
      </div>
    </div>
  </div>
);

// 前回の攻撃結果コンポーネント
const LastRoundSummary = ({ lastRound }) => (

  <div className="bg-slate-900/30 backdrop-blur-md border border-slate-700/50 rounded-xl p-4 space-y-2">
    <h4 className="font-medium text-slate-200">Last Combat Sequence</h4>
    <div className="space-y-1 text-sm">
      <p className="text-blue-300">
        <span className="font-medium">Your Spell:</span> {lastRound.playerSpell} 
        <span className="text-red-400 ml-2">(Damage: {lastRound.playerDamage})</span>
      </p>
      <p className="text-purple-300">
        <span className="font-medium">Dumbledore's Spell:</span> {lastRound.dumbledoreSpell} 
        <span className="text-red-400 ml-2">(Damage: {lastRound.dumbledoreDamage})</span>
      </p>
    </div>
  </div>
);

// 呪文選択コンポーネント
const SpellSelection = ({ duel }) => (

  <div className="space-y-4">
    <h3 className="font-semibold text-center text-xl text-slate-200">
      Select Combat Spell
    </h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {Object.entries(SPELLS).map(([spell, info]) => (
        <Button 
          key={spell} 
          onClick={() => duel.castSpell(spell)}
          className="p-4 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-400/30 hover:from-indigo-500/30 hover:to-purple-500/30 hover:border-indigo-400/50 text-slate-200 rounded-xl h-auto transition-all duration-300 hover:scale-105"
        >
          <div className="text-center space-y-2">
            <div className="text-2xl">{info.icon}</div>
            <div className="font-medium text-sm">{spell}</div>
            <div className="text-xs text-slate-400">
              DMG: {info.damage} • {info.effect}
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
    <div className={`p-6 rounded-xl text-center backdrop-blur-md border ${
      duel.gameState.playerHealth <= 0 
        ? 'bg-red-500/10 border-red-500/30' 
        : 'bg-green-500/10 border-green-500/30'
    }`}>
      <div className="text-4xl mb-2">
        {duel.gameState.playerHealth <= 0 ? '💀' : '🏆'}
      </div>
      <h2 className={`text-2xl font-bold mb-2 ${
        duel.gameState.playerHealth <= 0 
          ? 'text-red-400' 
          : 'text-green-400'
      }`}>
        {duel.gameState.playerHealth <= 0 
          ? 'Combat Failed - AI Victory' 
          : 'Mission Complete - Victory Achieved'
        }
      </h2>
      <p className="text-xl text-slate-300">Final Score: {duel.gameState.score}</p>
    </div>
    <Button 
      onClick={duel.resetGame}
      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold"
    >
      Restart Combat Simulation
    </Button>
  </div>
);

// アナコンダ生成器コンポーネント
const AnacondaGenerator = () => {
const { svgSize, setSvgSize, snakeData, generateAnaconda, downloadSVG, generationCount } = useAnacondaGenerator();

if (!snakeData) {
return (
<div className="backdrop-blur-xl bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 text-center">
<div className="text-4xl mb-4">🔄</div>
<p className="text-lg font-medium text-slate-200">Initializing AI Generator…</p>
</div>
);
}

return (
<div className="backdrop-blur-xl bg-slate-800/30 border border-slate-700/50 rounded-2xl overflow-hidden">
<div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-b border-slate-700/50 p-6">
<h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
AI Anaconda Generator
</h2>
<p className="text-slate-400 mt-1">Neural Network Procedural Generation</p>
</div>
<div className="p-6 space-y-6">
{/* Control Panel */}
<div className="bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-6">
<h3 className="text-xl font-semibold text-slate-200 mb-4">Control Panel</h3>

```
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="space-y-2">
          <Label htmlFor="svg-size" className="text-slate-300">Output Resolution</Label>
          <Select
            value={svgSize.toString()}
            onValueChange={(value) => setSvgSize(Number(value))}
          >
            <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="400">400x400</SelectItem>
              <SelectItem value="600">600x600</SelectItem>
              <SelectItem value="800">800x800</SelectItem>
              <SelectItem value="1000">1000x1000</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-end">
          <Button
            onClick={generateAnaconda}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold"
          >
            Generate New Pattern
          </Button>
        </div>
        
        <div className="flex items-end">
          <Button
            onClick={downloadSVG}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold"
          >
            Download SVG
          </Button>
        </div>
      </div>
      
      <div className="text-center bg-slate-800/50 backdrop-blur-md border border-slate-600/50 rounded-lg p-3">
        <p className="font-medium text-slate-200">
          Generation Count: {generationCount}
        </p>
      </div>
    </div>

    {/* SVG Display */}
    <div className="bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-6">
      <h3 className="text-xl font-semibold text-slate-200 mb-4 text-center">Generated Output</h3>
      
      <div className="flex justify-center">
        <div className="border border-slate-600/50 rounded-lg p-3 bg-slate-800/30 backdrop-blur-md">
          <svg
            id="anaconda-svg"
            width={Math.min(svgSize, 500)}
            height={Math.min(svgSize, 500)}
            viewBox={`0 0 ${svgSize} ${svgSize}`}
            className="rounded"
          >
            {/* Background */}
            <defs>
              <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="50%" stopColor="#334155" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
              <linearGradient id="snakeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#059669" />
                <stop offset="100%" stopColor="#047857" />
              </linearGradient>
            </defs>
            
            <rect x="0" y="0" width={svgSize} height={svgSize} fill="url(#bgGradient)" />
            
            {/* Snake Body */}
            <polyline
              points={snakeData.points.map(p => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke="url(#snakeGradient)"
              strokeWidth="60"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Body Patterns */}
            {snakeData.patterns.map((pattern, index) => (
              <circle
                key={index}
                cx={pattern.x}
                cy={pattern.y}
                r={pattern.r}
                fill="#065f46"
                opacity="0.8"
              />
            ))}
            
            {/* Head */}
            <ellipse
              cx={snakeData.headX}
              cy={snakeData.headY}
              rx="30"
              ry="20"
              fill="url(#snakeGradient)"
            />
            
            {/* Eye */}
            <circle
              cx={snakeData.eyeX}
              cy={snakeData.eyeY}
              r="5"
              fill="#facc15"
            />
            <circle
              cx={snakeData.eyeX}
              cy={snakeData.eyeY}
              r="2"
              fill="#000"
            />
            
            {/* Tongue */}
            <line
              x1={snakeData.tongueStartX}
              y1={snakeData.tongueStartY}
              x2={snakeData.tongue1EndX}
              y2={snakeData.tongue1EndY}
              stroke="#ef4444"
              strokeWidth="3"
            />
            <line
              x1={snakeData.tongueStartX}
              y1={snakeData.tongueStartY}
              x2={snakeData.tongue2EndX}
              y2={snakeData.tongue2EndY}
              stroke="#ef4444"
              strokeWidth="3"
            />
          </svg>
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-slate-400 bg-slate-800/30 backdrop-blur-md border border-slate-600/30 rounded p-3">
          Each generation produces unique procedural patterns using advanced algorithms
        </p>
      </div>
    </div>

    {/* Feature Info */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-slate-900/30 backdrop-blur-md border border-slate-700/50 rounded-xl p-4">
        <h4 className="text-purple-400 font-semibold mb-3">AI Features</h4>
        <ul className="space-y-2 text-sm text-slate-300">
          <li>• Procedural curve generation</li>
          <li>• Neural pattern recognition</li>
          <li>• Adaptive coloring system</li>
          <li>• Real-time rendering</li>
        </ul>
      </div>
      <div className="bg-slate-900/30 backdrop-blur-md border border-slate-700/50 rounded-xl p-4">
        <h4 className="text-cyan-400 font-semibold mb-3">System Controls</h4>
        <ul className="space-y-2 text-sm text-slate-300">
          <li>• Resolution selection</li>
          <li>• Instant regeneration</li>
          <li>• SVG export functionality</li>
          <li>• Infinite variations</li>
        </ul>
      </div>
    </div>
  </div>
</div>
```

);
};

export default WizardingBankAndDuel;