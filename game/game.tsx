import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sword, Shield, Heart } from 'lucide-react';

const App = () => {
  const [player, setPlayer] = useState({
    name: '勇者',
    hp: 100,
    maxHp: 100,
    attack: 15,
    defense: 10,
    level: 1,
    exp: 0
  });

  const [enemy, setEnemy] = useState({
    name: 'スライム',
    hp: 50,
    maxHp: 50,
    attack: 10
  });

  const [battleLog, setBattleLog] = useState<string[]>([]);

  const attack = () => {
    // プレイヤーの攻撃
    const playerDamage = Math.max(5, player.attack - 5);
    const newEnemyHp = Math.max(0, enemy.hp - playerDamage);
    
    setEnemy({ ...enemy, hp: newEnemyHp });
    setBattleLog(prev => [...prev, `${player.name}の攻撃！ ${enemy.name}に${playerDamage}のダメージ！`]);

    // 敵の反撃
    if (newEnemyHp > 0) {
      const enemyDamage = Math.max(3, enemy.attack - player.defense);
      const newPlayerHp = Math.max(0, player.hp - enemyDamage);
      
      setPlayer({ ...player, hp: newPlayerHp });
      setBattleLog(prev => [...prev, `${enemy.name}の攻撃！ ${player.name}に${enemyDamage}のダメージ！`]);
    } else {
      setBattleLog(prev => [...prev, `${enemy.name}を倒した！`]);
      gainExp();
    }
  };

  const gainExp = () => {
    const expGain = 20;
    const newExp = player.exp + expGain;
    
    if (newExp >= 100) {
      setPlayer({
        ...player,
        level: player.level + 1,
        hp: player.maxHp + 20,
        maxHp: player.maxHp + 20,
        attack: player.attack + 5,
        defense: player.defense + 3,
        exp: 0
      });
      setBattleLog(prev => [...prev, `レベルアップ！ ${player.level + 1}になった！`]);
    } else {
      setPlayer({ ...player, exp: newExp });
    }
    
    // 敵を回復
    setEnemy({ ...enemy, hp: enemy.maxHp });
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>シンプルRPG</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* プレイヤーステータス */}
            <div>
              <div className="flex justify-between mb-2">
                <div className="flex items-center">
                  <Heart className="w-4 h-4 mr-2" />
                  <span>{player.name} Lv.{player.level}</span>
                </div>
                <span>{player.hp}/{player.maxHp}</span>
              </div>
              <Progress value={(player.hp / player.maxHp) * 100} className="mb-2" />
              <div className="flex justify-between text-sm">
                <div className="flex items-center">
                  <Sword className="w-4 h-4 mr-1" />
                  <span>{player.attack}</span>
                </div>
                <div className="flex items-center">
                  <Shield className="w-4 h-4 mr-1" />
                  <span>{player.defense}</span>
                </div>
                <span>EXP: {player.exp}/100</span>
              </div>
            </div>

            {/* 敵ステータス */}
            <div>
              <div className="flex justify-between mb-2">
                <span>{enemy.name}</span>
                <span>{enemy.hp}/{enemy.maxHp}</span>
              </div>
              <Progress value={(enemy.hp / enemy.maxHp) * 100} className="mb-4" />
            </div>

            {/* バトルログ */}
            <div className="h-32 overflow-y-auto border rounded p-2 bg-gray-50 text-sm">
              {battleLog.map((log, i) => (
                <p key={i}>{log}</p>
              ))}
            </div>

            <Button 
              onClick={attack} 
              className="w-full"
              disabled={player.hp <= 0}
            >
              攻撃
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default App;
