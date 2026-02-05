import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

// 銀行API管理サービス
const bankApiManager = {
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
          // 実際の実装では、APIへの検証リクエストを行います
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
            message: error.message || 'バリデーション中にエラーが発生しました'
          };
        }
      },
      
      // 振込実行メソッド
      executeTransfer: async (transferData) => {
        try {
          // 実際の実装では、APIへの振込実行リクエストを行います
          console.log(`Executing transfer for ${bankCode}:`, transferData);
          
          // 振込実行のシミュレーション
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          return {
            success: true,
            transferId: transferData.transferId,
            timestamp: new Date().toISOString(),
            reference: `REF-${Math.floor(Math.random() * 1000000)}`
          };
        } catch (error) {
          console.error(`Execution error for ${bankCode}:`, error);
          throw new Error(error.message || '振込実行中にエラーが発生しました');
        }
      },
      
      // 振込状態取得メソッド
      getTransferStatus: async (transferId) => {
        try {
          // 実際の実装では、APIへのステータス取得リクエストを行います
          console.log(`Getting status for transfer ${transferId}`);
          
          // ステータス取得のシミュレーション
          await new Promise(resolve => setTimeout(resolve, 800));
          
          return {
            transferId,
            status: 'completed',
            processedAt: new Date().toISOString(),
            description: '処理が完了しました'
          };
        } catch (error) {
          console.error(`Status check error for ${bankCode}:`, error);
          throw new Error(error.message || '状態確認中にエラーが発生しました');
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

const BankTransferComponent = () => {
  // フォーム状態
  const [formData, setFormData] = useState({
    bankCode: '',
    amount: '',
    accountNumber: '',
    branchCode: '',
    beneficiaryName: '',
    description: ''
  });
  
  // 処理状態
  const [currentStep, setCurrentStep] = useState(TRANSFER_STEPS.IDLE);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [initializationStatus, setInitializationStatus] = useState({
    initialized: false,
    error: null
  });

  // 銀行リスト
  const bankList = [
    { code: 'MUFG', name: '三菱UFJ銀行' },
    { code: 'MIZUHO', name: 'みずほ銀行' },
    { code: 'SMBC', name: '三井住友銀行' },
    { code: 'JP_POST', name: 'ゆうちょ銀行' }
  ];

  // バンクアダプターの初期化
  useEffect(() => {
    const initializeAdapters = async () => {
      try {
        bankList.forEach(bank => {
          const config = {
            apiEndpoint: process.env.NEXT_PUBLIC_BANK_API_ENDPOINT || 'https://api.example.com/banking',
            apiKey: process.env.NEXT_PUBLIC_BANK_API_KEY || 'demo-key',
            timeout: 30000,
            retryAttempts: 3
          };
          
          bankApiManager.initializeAdapter(bank.code, config);
        });
        
        setInitializationStatus({ initialized: true, error: null });
      } catch (error) {
        console.error('Failed to initialize bank adapters:', error);
        setInitializationStatus({ 
          initialized: false, 
          error: 'バンクAPIの初期化に失敗しました。ページをリロードしてください。' 
        });
      }
    };

    initializeAdapters();
  }, []);

  // 入力ハンドラー
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // フォームバリデーション
  const validateForm = () => {
    // 必須フィールドのチェック
    const requiredFields = ['bankCode', 'amount', 'accountNumber', 'branchCode', 'beneficiaryName'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        setError(`${getFieldLabel(field)}を入力してください`);
        return false;
      }
    }
    
    // 金額のバリデーション
    if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      setError('有効な金額を入力してください');
      return false;
    }
    
    return true;
  };

  // フィールド名の日本語表示用ヘルパー
  const getFieldLabel = (field) => {
    const labels = {
      bankCode: '銀行',
      amount: '金額',
      accountNumber: '口座番号',
      branchCode: '支店コード',
      beneficiaryName: '受取人名'
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
        currency: 'JPY',
        accountNumber: formData.accountNumber,
        bankCode: formData.bankCode,
        branchCode: formData.branchCode,
        beneficiaryName: formData.beneficiaryName,
        transferId: `TR-${Date.now()}`,
        description: formData.description || '振込'
      };

      // ステップ1: 振込の検証
      setCurrentStep(TRANSFER_STEPS.VALIDATING);
      const validationResult = await bankApiManager.validateTransfer(
        formData.bankCode,
        transferData
      );

      if (!validationResult.isValid) {
        throw new Error(validationResult.message || '振込の検証に失敗しました');
      }

      // ステップ2: 振込の実行
      setCurrentStep(TRANSFER_STEPS.EXECUTING);
      const executionResult = await bankApiManager.executeTransfer(
        formData.bankCode,
        { ...transferData, transferId: validationResult.transferId }
      );

      // ステップ3: 振込状態の確認
      setCurrentStep(TRANSFER_STEPS.CHECKING_STATUS);
      const transferStatus = await bankApiManager.getTransferStatus(
        formData.bankCode,
        executionResult.transferId
      );

      // 処理完了
      setCurrentStep(TRANSFER_STEPS.COMPLETED);
      setResult({
        message: '振込処理が完了しました',
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
        return '検証中...';
      case TRANSFER_STEPS.EXECUTING:
        return '振込実行中...';
      case TRANSFER_STEPS.CHECKING_STATUS:
        return '状態確認中...';
      default:
        return '振込確認処理開始';
    }
  };

  // 初期化エラー表示
  if (initializationStatus.error) {
    return (
      <Card className="w-full max-w-xl mx-auto">
        <CardHeader>
          <CardTitle>銀行振込処理</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>{initializationStatus.error}</AlertDescription>
          </Alert>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4 w-full"
          >
            再読み込み
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>銀行振込処理</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 銀行選択 */}
          <div className="space-y-2">
            <Label htmlFor="bank-select">銀行を選択</Label>
            <Select
              value={formData.bankCode}
              onValueChange={(value) => handleInputChange('bankCode', value)}
              disabled={isProcessing}
            >
              <SelectTrigger id="bank-select">
                <SelectValue placeholder="銀行を選択してください" />
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
                <Label htmlFor="amount">金額（円）</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="10000"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  disabled={isProcessing}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="branch-code">支店コード</Label>
                <Input
                  id="branch-code"
                  placeholder="001"
                  value={formData.branchCode}
                  onChange={(e) => handleInputChange('branchCode', e.target.value)}
                  disabled={isProcessing}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="account-number">口座番号</Label>
              <Input
                id="account-number"
                placeholder="1234567"
                value={formData.accountNumber}
                onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                disabled={isProcessing}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="beneficiary-name">受取人名</Label>
              <Input
                id="beneficiary-name"
                placeholder="振込先名義"
                value={formData.beneficiaryName}
                onChange={(e) => handleInputChange('beneficiaryName', e.target.value)}
                disabled={isProcessing}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">振込メモ（任意）</Label>
              <Input
                id="description"
                placeholder="給料支払い 2月分"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                disabled={isProcessing}
              />
            </div>
          </div>

          {/* 処理ステータス表示 */}
          {currentStep !== TRANSFER_STEPS.IDLE && currentStep !== TRANSFER_STEPS.ERROR && !result && (
            <div className="bg-blue-50 p-4 rounded-md flex items-center space-x-2">
              <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
              <p className="text-blue-700 text-sm">
                {currentStep === TRANSFER_STEPS.VALIDATING && '振込情報を検証しています...'}
                {currentStep === TRANSFER_STEPS.EXECUTING && '振込を実行しています...'}
                {currentStep === TRANSFER_STEPS.CHECKING_STATUS && '振込状態を確認しています...'}
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
              
              <div className="bg-gray-50 p-4 rounded-md space-y-2 text-sm">
                <h3 className="font-medium text-gray-700">振込詳細</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-gray-500">金額:</div>
                  <div className="font-medium">{Number(result.details.amount).toLocaleString()}円</div>
                  
                  <div className="text-gray-500">受取人:</div>
                  <div className="font-medium">{result.details.beneficiary}</div>
                  
                  <div className="text-gray-500">処理日時:</div>
                  <div className="font-medium">
                    {new Date(result.details.processedAt).toLocaleString('ja-JP')}
                  </div>
                  
                  <div className="text-gray-500">参照番号:</div>
                  <div className="font-medium">{result.details.reference}</div>
                </div>
              </div>
            </div>
          )}

          {/* 実行ボタン */}
          <Button
            onClick={handleTransfer}
            disabled={isProcessing || result}
            className="w-full"
          >
            {isProcessing && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {getButtonText()}
          </Button>
          
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
                  accountNumber: '',
                  branchCode: '',
                  beneficiaryName: '',
                  description: ''
                });
              }}
              className="w-full mt-2"
            >
              新しい振込を作成
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BankTransferComponent;
