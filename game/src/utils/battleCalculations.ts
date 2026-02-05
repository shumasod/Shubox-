import { Character } from '../types/character';

export const calculateDamage = (attack: number, defense: number): number => {
  return Math.max(5, attack - defense);
};

export const gainExperience = (player: Character): Character => {
  if (!player.exp || !player.level) return player;
  
  const expGain = 20;
  const newExp = player.exp + expGain;
  
  if (newExp >= 100) {
    return {
      ...player,
      level: player.level + 1,
      hp: player.maxHp + 20,
      maxHp: player.maxHp + 20,
      attack: player.attack + 5,
      defense: (player.defense || 0) + 3,
      exp: 0
    };
  }
  
  return { ...player, exp: newExp };
};
