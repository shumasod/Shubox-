import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Hand, Trophy, XCircle, Minus } from 'lucide-react';

const RockPaperScissors = ({ onGameEnd }) => {
  const [gameState, setGameState] = useState({
    wins: 0,
    losses: 0,
    ties: 0,
    lastResult: null,
    message: null,
  });

  const [isGameActive, setIsGameActive] = useState(true);

  const choices = [
    { id: '1', name: 'グー', icon: '✊' },
    { id: '2', name: 'チョキ', icon: '✌️' },
    { id: '3', name: 'パー', icon: '✋' }
  ];

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

  const endGame = () => {
    setIsGameActive(false);
    if (onGameEnd) {
      onGameEnd(gameState);
    }
  };

  return (
    <Card className="w-full max-w-xl mx-auto mt-4">
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
  );
};

export default RockPaperScissors;
