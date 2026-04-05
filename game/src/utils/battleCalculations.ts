import { Character } from '../types/character';

const MIN_DAMAGE = 5;
const EXP_GAIN = 20;
const EXP_THRESHOLD = 100;
const LEVEL_UP_HP_BONUS = 20;
const LEVEL_UP_ATTACK_BONUS = 5;
const LEVEL_UP_DEFENSE_BONUS = 3;

export const calculateDamage = (attack: number, defense: number): number => {
  return Math.max(MIN_DAMAGE, attack - defense);
};

export const gainExperience = (player: Character): Character => {
  if (player.exp === undefined || player.level === undefined) return player;

  const newExp = player.exp + EXP_GAIN;

  if (newExp >= EXP_THRESHOLD) {
    const newMaxHp = player.maxHp + LEVEL_UP_HP_BONUS;
    return {
      ...player,
      level: player.level + 1,
      hp: newMaxHp,
      maxHp: newMaxHp,
      attack: player.attack + LEVEL_UP_ATTACK_BONUS,
      defense: (player.defense ?? 0) + LEVEL_UP_DEFENSE_BONUS,
      exp: 0
    };
  }

  return { ...player, exp: newExp };
};
