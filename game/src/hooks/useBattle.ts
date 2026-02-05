import { useState } from 'react';
import { Character } from '../types/character';
import { calculateDamage, gainExperience } from '../utils/battleCalculations';

export const useBattle = (
  initialPlayer: Character,
  initialEnemy: Character
) => {
  const [player, setPlayer] = useState(initialPlayer);
  const [enemy, setEnemy] = useState(initialEnemy);
  const [battleLog, setBattleLog] = useState<string[]>([]);

  const attack = () => {
    const playerDamage = calculateDamage(player.attack, enemy.defense || 0);
    const newEnemyHp = Math.max(0, enemy.hp - playerDamage);
    
    // プレイヤーの攻撃処理
    setEnemy(prev => ({ ...prev, hp: newEnemyHp }));
    addToBattleLog(`${player.name}の攻撃！ ${enemy.name}に${playerDamage}のダメージ！`);

    // 敵の反撃処理
    if (newEnemyHp > 0) {
      const enemyDamage = calculateDamage(enemy.attack, player.defense || 0);
      setPlayer(prev => ({
        ...prev,
        hp: Math.max(0, prev.hp - enemyDamage)
      }));
      addToBattleLog(`${enemy.name}の攻撃！ ${player.name}に${enemyDamage}のダメージ！`);
    } else {
      addToBattleLog(`${enemy.name}を倒した！`);
      const updatedPlayer = gainExperience(player);
      setPlayer(updatedPlayer);
      if (updatedPlayer.level !== player.level) {
        addToBattleLog(`レベルアップ！ ${updatedPlayer.level}になった！`);
      }
      setEnemy(prev => ({ ...prev, hp: prev.maxHp }));
    }
  };

  const addToBattleLog = (message: string) => {
    setBattleLog(prev => [...prev, message]);
  };

  return {
    player,
    enemy,
    battleLog,
    attack
  };
};
