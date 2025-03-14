import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, CheckCircle, AlertCircle, Wand2, Coins, Sparkles } from 'lucide-react';

// 魔法呪文データ
const spells = {
  'ルーモス': { damage: 10, effect: 'light', description: '明かりを灯す呪文' },
  'エクスペクト・パトローナム': { damage: 20, effect: 'patronus', description: '守護霊を呼び出す強力な呪文' },
  'エクスペリアームス': { damage: 15, effect: 'disarm', description: '相手の武器を奪う呪文' },
  'ウィンガーディアム・レビオサ': { damage: 5, effect: 'levitate', description: '物を浮かせる呪文' },
  'プロテゴ': { damage: 0, effect: 'shield', description: '防御の盾を作る呪文' },
};

// 魔法銀行API管理サービス
const gringottsApiManager = {
  adapters: {},
  
  initializeAdapter(bankCode, config) {
    if (this.adapters[bankCode]) {
      return this.adapters[bankCode];
    }
    
    // 各銀行向けのアダプターを作成
    this.adapters[bankCode] = {
      config,
      
      // 振込検証メソッド
      validateTransfer: async (transferData) => {
        try {
          console.log(`Validating transfer for ${bankCode}:`, transferData);
          
          // バリデーションのシミュレーション
          await new Promise(resolve => setTimeout(resolve, 1000));
          
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
      
      // 振込実行メソッド
      executeTransfer: async (transferData) => {
        try {
          console.log(`Executing transfer for ${bankCode}:`, transferData);
          
          // 振込実行のシミュレーション
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
      
      // 振込状態取得メソッド
      getTransferStatus: async (transferId) => {
        try {
          console.log(`Getting status for transfer ${transferId}`);
          
          // ステータス取得のシミュレーション
          await new Promise(resolve => setTimeout(resolve, 800));
          
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
  },
  
  getAdapter(bankCode) {
    if (!this.adapters[bankCode]) {
      throw new Error(`銀行コード ${bankCode} のアダプターが初期化されていません`);
    }
    return this.adapters[bankCode];
  },
  
  validateTransfer(bankCode, transferData) {
    return this.getAdapter(bankCode).validateTransfer(transferData);
  },
  
  executeTransfer(bankCode, transferData) {
    return this.getAdapter(bankCode).executeTransfer(transferData);
  },
  
  getTransferStatus(bankCode, transferId) {
    return this.getAdapter(bankCode).getTransferStatus(transferId);
  }
};

// 振込処理ステップ
const TRANSFER_STEPS = {
  IDLE: 'idle',
  VALIDATING: 'validating',
  EXECUTING: 'executing',
  CHECKING_STATUS: 'checkingStatus',
  COMPLETED: 'completed',
  ERROR: 'error'
};

const WizardingBankAndDuel = () => {
  // 共通の状態
  const [playerName, setPlayerName] = useState('');
  const [activeTab, setActiveTab] = useState('bank');
  const [canDuel, setCanDuel] = useState(false);
  
  // 銀行部分の状態
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

  // 決闘ゲームの状態
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

  // 銀行リスト
  const bankList = [
    { code: 'GRINGOTTS_LONDON', name: 'グリンゴッツ銀行（ロンドン本店）' },
    { code: 'GRINGOTTS_HOGSMEADE', name: 'グリンゴッツ銀行（ホグズミード支店）' },
    { code: 'GRINGOTTS_DIAGON', name: 'グリンゴッツ銀行（ダイアゴン横丁支店）' },
    { code: 'GRINGOTTS_INTL', name: 'グリンゴッツ国際魔法銀行' }
  ];

  // バンクアダプターの初期化
  useEffect(() => {
    const initializeAdapters = async () => {
      try {
        bankList.forEach(bank => {
          const config = {
            apiEndpoint: process.env.NEXT_PUBLIC_WIZARDING_BANK_API || 'https://api.gringotts.wiz/banking',
            apiKey: process.env.NEXT_PUBLIC_WIZARDING_BANK_KEY || 'alohomora-key',
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

  // 決闘ゲームの効果
  useEffect(() => {
    if (gameState.playerHealth <= 0 || gameState.dumbledoreHealth <= 0) {
      setGameOver(true);
    }
  }, [gameState.playerHealth, gameState.dumbledoreHealth]);

  // 入力ハンドラー
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // プレイヤー名の設定
    if (field === 'beneficiaryName') {
      setPlayerName(value);
    }
  };

  // フォームバリデーション
  const validateForm = () => {
    // 必須フィールドのチェック
    const requiredFields = ['bankCode', 'amount', 'vaultNumber', 'branchCode', 'beneficiaryName'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        setError(`${getFieldLabel(field)}を入力してください`);
        return false;
      }
    }
    
    // 金額のバリデーション
    if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      setError('有効なガリオン額を入力してください');
      return false;
    }
    
    return true;
  };

  // フィールド名の日本語表示用ヘルパー
  const getFieldLabel = (field) => {
    const labels = {
      bankCode: '銀行支店',
      amount: 'ガリオン額',
      vaultNumber: '金庫番号',
      branchCode: '支店コード',
      beneficiaryName: '魔法使いの名前'
    };
    return labels[field] || field;
  };

  // 振込処理の実行
  const handleTransfer = async () => {
    // フォームバリデーション
    if (!validateForm()) {
      return;
    }

    try {
      // 処理状態のリセット
      setError(null);
      setResult(null);
      
      // 振込データの作成
      const transferData = {
        amount: Number(formData.amount),
        currency: 'GAL', // ガリオン
        accountNumber: formData.vaultNumber,
        bankCode: formData.bankCode,
        branchCode: formData.branchCode,
        beneficiaryName: formData.beneficiaryName,
        transferId: `WIZ-${Date.now()}`,
        description: formData.description || '魔法振込'
      };

      // ステップ1: 振込の検証
      setCurrentStep(TRANSFER_STEPS.VALIDATING);
      const validationResult = await gringottsApiManager.validateTransfer(
        formData.bankCode,
        transferData
      );

      if (!validationResult.isValid) {
        throw new Error(validationResult.message || '振込の検証に失敗しました');
      }

      // ステップ2: 振込の実行
      setCurrentStep(TRANSFER_STEPS.EXECUTING);
      const executionResult = await gringottsApiManager.executeTransfer(
        formData.bankCode,
        { ...transferData, transferId: validationResult.transferId }
      );

      // ステップ3: 振込状態の確認
      setCurrentStep(TRANSFER_STEPS.CHECKING_STATUS);
      const transferStatus = await gringottsApiManager.getTransferStatus(
        formData.bankCode,
        executionResult.transferId
      );

      // 処理完了
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
      
      // 決闘を解放
      if (Number(formData.amount) >= 100) {
        setCanDuel(true);
      }

    } catch (err) {
      console.error('Transfer error:', err);
      setCurrentStep(TRANSFER_STEPS.ERROR);
      setError(err.message || '処理中にエラーが発生しました');
    }
  };

  // 処理中かどうか
  const isProcessing = [
    TRANSFER_STEPS.VALIDATING, 
    TRANSFER_STEPS.EXECUTING, 
    TRANSFER_STEPS.CHECKING_STATUS
  ].includes(currentStep);

  // 処理ステップに基づくボタンテキスト
  const getButtonText = () => {
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
  };

  // 決闘ゲームの関数
  const startGame = () => {
    setGameStarted(true);
    setActiveTab('duel');
  };

  const chooseDumbledoreSpell = () => {
    if (gameState.dumbledoreHealth < 30) {
      return 'エクスペクト・パトローナム';
    } else if (gameState.playerHealth > 70) {
      return 'エクスペリアームス';
    } else if (gameState.dumbledoreEffects.length === 0) {
      return 'プロテゴ';
    } else {
      return Object.keys(spells)[Math.floor(Math.random() * Object.keys(spells).length)];
    }
  };

  const calculateDamage = (spellInfo, casterLevel, targetEffects) => {
    let damage = spellInfo.damage * (1 + (casterLevel - 1) * 0.1);
    if (targetEffects.includes('shield')) damage *= 0.5;
    if (targetEffects.includes('disarm')) damage *= 0.75;
    return Math.round(damage);
  };

  const castSpell = (playerSpell) => {
    const dumbledoreSpell = chooseDumbledoreSpell();
    
    const playerDamage = calculateDamage(spells[playerSpell], gameState.playerLevel, gameState.dumbledoreEffects);
    const dumbledoreDamage = calculateDamage(spells[dumbledoreSpell], 10, gameState.playerEffects);

    setGameState(prev => ({
      ...prev,
      playerHealth: Math.max(0, Math.min(100, prev.playerHealth - dumbledoreDamage)),
      dumbledoreHealth: Math.max(0, Math.min(100, prev.dumbledoreHealth - playerDamage)),
      round: prev.round + 1,
      score: prev.score + playerDamage,
      playerExp: prev.playerExp + 10,
      playerLevel: prev.playerExp >= 90 ? prev.playerLevel + 1 : prev.playerLevel,
      playerEffects: [spells[playerSpell].effect],
      dumbledoreEffects: [spells[dumbledoreSpell].effect],
    }));

    setLastRound({ playerSpell, dumbledoreSpell, playerDamage, dumbledoreDamage });
  };

  // 初期化エラー表示
  if (initializationStatus.error) {
    return (
      <Card className="w-full max-w-xl mx-auto">
        <CardHeader className="bg-purple-900 text-white">
          <CardTitle>グリンゴッツ魔法銀行</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>{initializationStatus.error}</AlertDescription>
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
    <div className="max-w-4xl mx-auto p-4">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-purple-800">魔法の世界へようこそ</h1>
        {playerName && <p className="text-lg text-purple-600">魔法使い: {playerName}</p>}
      </div>
      
      <Tabs defaultValue="bank" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="bank" className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            <span>グリンゴッツ銀行</span>
          </TabsTrigger>
          <TabsTrigger value="duel" disabled={!canDuel && !gameStarted} className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            <span>ダンブルドアとの決闘</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="bank">
          <Card className="w-full">
            <CardHeader className="bg-purple-900 text-white">
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5" />
                グリンゴッツ魔法銀行取引
              </CardTitle>
            </CardHeader>
            <CardContent className="mt-4">
              <div className="space-y-4">
                {/* 銀行選択 */}
                <div className="space-y-2">
                  <Label htmlFor="bank-select">支店を選択</Label>
                  <Select
                    value={formData.bankCode}
                    onValueChange={(value) => handleInputChange('bankCode', value)}
                    disabled={isProcessing}
                  >
                    <SelectTrigger id="bank-select" className="border-purple-300">
                      <SelectValue placeholder="支店を選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      {bankList.map(bank => (
                        <SelectItem key={bank.code} value={bank.code}>
                          {bank.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 振込情報フォーム */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">ガリオン額</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="100"
                        value={formData.amount}
                        onChange={(e) => handleInputChange('amount', e.target.value)}
                        disabled={isProcessing}
                        className="border-purple-300"
                      />
                      {Number(formData.amount) >= 100 && (
                        <p className="text-xs text-green-600">※100ガリオン以上で決闘可能になります</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="branch-code">支店暗号</Label>
                      <Input
                        id="branch-code"
                        placeholder="D12"
                        value={formData.branchCode}
                        onChange={(e) => handleInputChange('branchCode', e.target.value)}
                        disabled={isProcessing}
                        className="border-purple-300"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="vault-number">金庫番号</Label>
                    <Input
                      id="vault-number"
                      placeholder="687"
                      value={formData.vaultNumber}
                      onChange={(e) => handleInputChange('vaultNumber', e.target.value)}
                      disabled={isProcessing}
                      className="border-purple-300"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="beneficiary-name">魔法使いの名前</Label>
                    <Input
                      id="beneficiary-name"
                      placeholder="ハリー・ポッター"
                      value={formData.beneficiaryName}
                      onChange={(e) => handleInputChange('beneficiaryName', e.target.value)}
                      disabled={isProcessing}
                      className="border-purple-300"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">取引メモ（任意）</Label>
                    <Input
                      id="description"
                      placeholder="ホグワーツ学費"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      disabled={isProcessing}
                      className="border-purple-300"
                    />
                  </div>
                </div>

                {/* 処理ステータス表示 */}
                {currentStep !== TRANSFER_STEPS.IDLE && currentStep !== TRANSFER_STEPS.ERROR && !result && (
                  <div className="bg-purple-50 p-4 rounded-md flex items-center space-x-2 border border-purple-200">
                    <Loader2 className="h-4 w-4 text-purple-500 animate-spin" />
                    <p className="text-purple-700 text-sm">
                      {currentStep === TRANSFER_STEPS.VALIDATING && 'ゴブリンによる振込情報を検証しています...'}
                      {currentStep === TRANSFER_STEPS.EXECUTING && '地下金庫での振込を実行しています...'}
                      {currentStep === TRANSFER_STEPS.CHECKING_STATUS && '魔法封印状態を確認しています...'}
                    </p>
                  </div>
                )}

                {/* エラーメッセージ */}
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* 成功メッセージ */}
                {result && (
                  <div className="space-y-3">
                    <Alert className="bg-green-50 text-green-700 border-green-200">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <AlertDescription>{result.message}</AlertDescription>
                    </Alert>
                    
                    <div className="bg-purple-50 p-4 rounded-md space-y-2 text-sm border border-purple-200">
                      <h3 className="font-medium text-purple-700 flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        振込詳細
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-purple-600">ガリオン額:</div>
                        <div className="font-medium">{Number(result.details.amount).toLocaleString()} G</div>
                        
                        <div className="text-purple-600">受取人:</div>
                        <div className="font-medium">{result.details.beneficiary}</div>
                        
                        <div className="text-purple-600">処理日時:</div>
                        <div className="font-medium">
                          {new Date(result.details.processedAt).toLocaleString('ja-JP')}
                        </div>
                        
                        <div className="text-purple-600">魔法参照番号:</div>
                        <div className="font-medium">{result.details.reference}</div>
                      </div>
                    </div>
                    
                    {canDuel && !gameStarted && (
                      <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                        <h3 className="font-medium text-yellow-700 mb-2">特別招待！</h3>
                        <p className="text-sm text-yellow-600 mb-3">
                          高額取引をご利用いただきありがとうございます！ダンブルドア教授との特別決闘にご招待します。
                        </p>
                        <Button 
                          onClick={startGame} 
                          className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                        >
                          <Wand2 className="h-4 w-4 mr-2" />
                          決闘を始める
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* 実行ボタン */}
                {!result && (
                  <Button
                    onClick={handleTransfer}
                    disabled={isProcessing}
                    className="w-full bg-purple-700 hover:bg-purple-800"
                  >
                    {isProcessing && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {getButtonText()}
                  </Button>
                )}
                
                {/* 結果画面からの戻るボタン */}
                {result && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCurrentStep(TRANSFER_STEPS.IDLE);
                      setResult(null);
                      setFormData({
                        bankCode: '',
                        amount: '',
                        vaultNumber: '',
                        branchCode: '',
                        beneficiaryName: '',
                        description: ''
                      });
                    }}
                    className="w-full mt-2 border-purple-300 text-purple-700"
                  >
                    新しい振込を作成
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="duel">
          <Card className="w-full">
            <CardHeader className="bg-blue-900 text-white">
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                ダンブルドアとの魔法決闘
              </CardTitle>
            </CardHeader>
            <CardContent className="mt-4">
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                {!gameStarted ? (
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4 text-blue-800">ダンブルドア教授との魔法決闘</h2>
                    <p className="mb-6 text-blue-700">ダンブルドア教授との魔法の決闘に挑戦しましょう！あなたの魔法スキルを試す時が来ました。</p>
                    <Button 
                      onClick={startGame}
                      className="w-full bg-blue-700 hover:bg-blue-800"
                    >
                      決闘を開始
                    </Button>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-2xl font-bold mb-4 text-blue-800">ダンブルドアとの決闘</h2>
                    
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold text-blue-700">{playerName || "魔法使い"} (レベル {gameState.playerLevel})</h3>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-1">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{width: `${gameState.playerHealth}%`}}></div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <p className="text-blue-700">体力: {gameState.playerHealth}/100</p>
                        <p className="text-blue-700">経験値: {gameState.playerExp}/100</p>
                        <p className="text-blue-700">効果: {gameState.playerEffects.join(', ') || "なし"}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h3 className="text-xl font-semibold text-purple-700">ダンブルドア教授</h3>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-1">
                        <div className="bg-purple-600 h-2.5 rounded-full" style={{width: `${gameState.dumbledoreHealth}%`}}></div>
                      </div>
                      <p className="text-sm text-purple-700">体力: {gameState.dumbledoreHealth}/100 | 効果: {gameState.dumbledoreEffects.join(', ') || "なし"}</p>
                    </div>

                    <div className="py-2 px-4 bg-blue-100 rounded-md mb-4">
                      <p className="text-lg font-semibold text-blue-800">ラウンド: {gameState.round} | スコア: {gameState.score}</p>
                    </div>

                    {lastRound && (
                      <div className="mb-4 p-3 bg-white rounded-md border border-blue-200">
                        <p className="text-blue-700"><span className="font-medium">あなたの呪文:</span> {lastRound.playerSpell} <span className="text-red-500">(ダメージ: {lastRound.playerDamage})</span></p>
                        <p className="text-purple-700"><span className="font-medium">ダンブルドアの呪文:</span> {lastRound.dumbledoreSpell} <span className="text-red-500">(ダメージ: {lastRound.dumbledoreDamage})</span></p>
                      </div>
                    )}

                    {gameOver ? (
                      <div>
                        <div className={`p-4 rounded-md mb-4 text-center ${gameState.playerHealth <= 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                          <h2 className="text-2xl font-bold">
                            {gameState.playerHealth <= 0 ? 'ゲームオーバー！ダンブルドアの勝利です。' : 'おめでとうございます！あなたの勝利です。'}
                          </h2>
                          <p className="mt-2">最終スコア: {gameState.score}</p>
                        </div>
                        <Button 
                          onClick={() => {
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
                          }}
                          className="w-full bg-blue-700 hover:bg-blue-800 mb-2"
                        >
                          再挑戦する
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <h3 className="font-semibold mb-2 text-blue-800">呪文を選んでください:</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                          {Object.entries(spells).map(([spell, info]) => (
                            <Button 
                              key={spell} 
                              onClick={() => castSpell(spell)}
                              className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded flex flex-col items-center justify-center h-auto py-2"
                            >
                              <span className="font-medium">{spell}</span>
                              <span className="text-xs mt-1">
                                ダメージ: {info.damage}, 効果: {info.effect}
                              </span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button 
                      variant="outline"
                      onClick={() => {
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
                        setActiveTab('bank');
                      }}
                      className="w-full border-blue-300 text-blue-700"
                    >
                      銀行に戻る
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WizardingBankAndDuel;
