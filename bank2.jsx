import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CheckCircle } from 'lucide-react';

const BankTransferComponent = () => {
  const [selectedBank, setSelectedBank] = useState('');
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  // 銀行リスト
  const bankList = [
    { code: 'MUFG', name: '三菱UFJ銀行' },
    { code: 'MIZUHO', name: 'みずほ銀行' },
    { code: 'SMBC', name: '三井住友銀行' }
  ];

  useEffect(() => {
    // 各銀行のアダプターを初期化
    bankList.forEach(bank => {
      const config = {
        apiEndpoint: process.env.NEXT_PUBLIC_BANK_API_ENDPOINT,
        apiKey: process.env.NEXT_PUBLIC_BANK_API_KEY,
        // 他の必要な設定...
      };
      
      try {
        bankApiManager.initializeAdapter(bank.code, config);
      } catch (error) {
        console.error(`Failed to initialize ${bank.name} adapter:`, error);
      }
    });
  }, []);

  const handleTransfer = async () => {
    if (!selectedBank) {
      setError('銀行を選択してください');
      return;
    }

    setProcessing(true);
    setError(null);
    setStatus(null);

    try {
      // 振込データの作成
      const transferData = {
        amount: 10000,
        currency: 'JPY',
        accountNumber: '1234567',
        bankCode: selectedBank,
        branchCode: '001',
        beneficiaryName: '振込先名義',
        transferId: Date.now().toString(),
        description: '振込の説明'
      };

      // 振込の検証
      const validationResult = await bankApiManager.validateTransfer(
        selectedBank,
        transferData
      );

      if (!validationResult.isValid) {
        throw new Error(validationResult.message || '振込の検証に失敗しました');
      }

      // 振込状態の確認
      const transferStatus = await bankApiManager.getAdapter(selectedBank)
        .getTransferStatus(validationResult.transferId);

      setStatus({
        message: '振込処理が完了しました',
        details: transferStatus
      });

    } catch (err) {
      setError(err.message || '処理中にエラーが発生しました');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>銀行振込処理</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 銀行選択 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">銀行を選択</label>
            <Select
              value={selectedBank}
              onValueChange={setSelectedBank}
              disabled={processing}
            >
              <SelectTrigger>
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

          {/* エラーメッセージ */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* 成功メッセージ */}
          {status && (
            <Alert className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle className="h-4 w-4 mr-2" />
              <AlertDescription>{status.message}</AlertDescription>
            </Alert>
          )}

          {/* 実行ボタン */}
          <Button
            onClick={handleTransfer}
            disabled={processing || !selectedBank}
            className="w-full"
          >
            {processing && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {processing ? '処理中...' : '振込確認処理開始'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BankTransferComponent;