import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Hand, Trophy, XCircle, Minus } from 'lucide-react';

const BankTransferWithGame = () => {
  // 銀行取引関連の状態
  const [selectedBank, setSelectedBank] = useState('');
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  
  // じゃんけんゲーム関連の状態
  const [showGame, setShowGame] = useState(false);
  const [gameState, setGameState] = useState({
    wins: 0,
    losses: 0,
    ties: 0,
    lastResult: null,
    message: null,
  });
  const [isGameActive, setIsGameActive] = useState(true);

  // 銀行リスト
  const bankList = [
    { code: 'MUFG', name: '三菱UFJ銀行' },
    { code: 'MIZUHO', name: 'みずほ銀行' },
    { code: 'SMBC', name: '三井住友銀行' }
  ];

  // じゃんけんの選択肢
  const choices = [
    { id: '1', name: 'グー', icon: '✊' },
    { id: '2', name: 'チョキ', icon: '✌️' },
    { id: '3', name: 'パー', icon: '✋' }
  ];

  // じゃんけんの勝敗判定
  const getResult = (userChoice, cpuChoice) => {
    if (userChoice === cpuChoice) return 'tie';
    if (
      (userChoice === 'グー' && cpuChoice === 'チョキ') ||
      (userChoice === 'チョキ' && cpuChoice === 'パー') ||
      (userChoice === 'パー' && cpuChoice === 'グー')
    ) {
      return 'win';
    }
    return 'lose';
  };

  // じゃんけんゲームの実行
  const playGame = (userChoiceId) => {
    const userChoice = choices.find(c => c.id === userChoiceId)?.name;
    const cpuChoice = choices[Math.floor(Math.random() * choices.length)].name;

    const result = getResult(userChoice, cpuChoice);
    
    setGameState(prev => {
      const newState = {
        ...prev,
        lastResult: {
          userChoice,
          cpuChoice,
          result
        }
      };

      switch (result) {
        case 'win':
          newState.wins = prev.wins + 1;
          newState.message = 'あなたの勝ち！';
          break;
        case 'lose':
          newState.losses = prev.losses + 1;
          newState.message = 'あなたの負け！';
          break;
        case 'tie':
          newState.ties = prev.ties + 1;
          newState.message = 'あいこ！';
          if (newState.ties > 0 && newState.ties % 3 === 0) {
            newState.message += ' 3連続あいこ！これはなかなか珍しいことですね！';
          }
          break;
      }

      return newState;
    });
  };

  // 銀行取引の処理
  const handleTransfer = async () => {
    if (!selectedBank) {
      setError('銀行を選択してください');
      return;
    }

    setProcessing(true);
    setError(null);
    setStatus(null);

    try {
      // 振込データの作成（デモ用）
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

      // デモ用の非同期処理
      await new Promise(resolve => setTimeout(resolve, 1500));

      setStatus({
        message: '振込処理が完了しました',
        details: transferData
      });
      
      // 取引成功時にゲームを表示
      setShowGame(true);

    } catch (err) {
      setError(err.message || '処理中にエラーが発生しました');
    } finally {
      setProcessing(false);
    }
  };

  const endGame = () => {
    setIsGameActive(false);
  };

  return (
    <div className="space-y-4">
      {/* 銀行取引カード */}
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

      {/* じゃんけんゲーム */}
      {showGame && (
        <Card className="w-full max-w-xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hand className="w-5 h-5" />
              取引完了記念じゃんけん
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isGameActive ? (
                <>
                  <div className="flex justify-center gap-2">
                    {choices.map((choice) => (
                      <Button
                        key={choice.id}
                        onClick={() => playGame(choice.id)}
                        className="text-2xl p-6"
                      >
                        {choice.icon}
                      </Button>
                    ))}
                  </div>

                  {gameState.lastResult && (
                    <Alert className="mt-4">
                      <AlertDescription>
                        あなたは{gameState.lastResult.userChoice}、
                        CPUは{gameState.lastResult.cpuChoice}です。
                        <br />
                        {gameState.message}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex justify-between items-center mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      <span>{gameState.wins}勝</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-500" />
                      <span>{gameState.losses}敗</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Minus className="w-4 h-4 text-gray-500" />
                      <span>{gameState.ties}引き分け</span>
                    </div>
                  </div>

                  <Button 
                    onClick={endGame}
                    variant="outline" 
                    className="w-full mt-4"
                  >
                    ゲーム終了
                  </Button>
                </>
              ) : (
                <Alert>
                  <AlertDescription>
                    ゲーム終了！最終戦績: {gameState.wins}勝, {gameState.losses}敗, {gameState.ties}引き分け
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BankTransferWithGame;
