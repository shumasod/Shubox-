export interface Character {
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense?: number;
  level?: number;
  exp?: number;
}
