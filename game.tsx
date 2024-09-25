Updated game.tsx with import fixes

import React, { useState, useEffect } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./components/ui/alert-dialog"
import { Button } from "./components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./components/ui/card"
import { Progress } from "./components/ui/progress"
import { Sword, Shield, Heart, Star } from 'lucide-react';
// Types
type Character = {
  name: string;
  class: string;
  level: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  exp: number;
}

type Enemy = {
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  expReward: number;
}

type Quest = {
  id: number;
  name: string;
  description: string;
  reward: number;
  completed: boolean;
}

type Location = {
  id: number;
  name: string;
  description: string;
  enemies: Enemy[];
}


// Constants
const INITIAL_CHARACTER: Character = {
  name: '',
  class: '',
  level: 1,
  hp: 100,
  maxHp: 100,
  attack: 10,
  defense: 5,
  exp: 0,
};

const LOCATIONS: Location[] = [
  {
    id: 1,
    name: '緑の平原',
    description: '生い茂る草原が広がり、穏やかな風が吹いています。',
    enemies: [
      { name: 'スライム', hp: 20, maxHp: 20, attack: 5, defense: 2, expReward: 10 },
      { name: 'ゴブリン', hp: 30, maxHp: 30, attack: 8, defense: 3, expReward: 15 },
    ],
  },
  {
    id: 2,
    name: '暗い森',
    description: '鬱蒼とした木々が立ち並び、薄暗い雰囲気が漂っています。',
    enemies: [
      { name: 'ウルフ', hp: 40, maxHp: 40, attack: 12, defense: 5, expReward: 20 },
      { name: 'トロール', hp: 60, maxHp: 60, attack: 15, defense: 8, expReward: 30 },
    ],
  },
  {
    id: 3,
    name: '古代遺跡',
    description: '古びた石造りの建造物が点在し、神秘的な雰囲気が漂っています。',
    enemies: [
      { name: 'スケルトン', hp: 50, maxHp: 50, attack: 18, defense: 10, expReward: 35 },
      { name: 'ミイラ', hp: 70, maxHp: 70, attack: 22, defense: 12, expReward: 45 },
    ],
  },
];

const QUESTS: Quest[] = [
  { id: 1, name: 'スライム退治', description: 'スライムを5体倒す', reward: 50, completed: false },
  { id: 2, name: '森の探索', description: '暗い森で遺物を見つける', reward: 100, completed: false },
  { id: 3, name: '遺跡の謎', description: '古代遺跡の謎を解き明かす', reward: 200, completed: false },
];

// Helper functions
const calculateExpToNextLevel = (level: number) => level * 100;

const levelUp = (character: Character): Character => {
  return {
    ...character,
    level: character.level + 1,
    maxHp: Math.floor(character.maxHp * 1.1),
    hp: Math.floor(character.maxHp * 1.1),
    attack: Math.floor(character.attack * 1.1),
    defense: Math.floor(character.defense * 1.1),
    exp: character.exp - calculateExpToNextLevel(character.level),
  };
};

// Components
const CharacterCreation: React.FC<{ onCreateCharacter: (character: Character) => void }> = ({ onCreateCharacter }) => {
  const [name, setName] = useState('');
  const [characterClass, setCharacterClass] = useState('');

  const handleCreate = () => {
    if (name && characterClass) {
      onCreateCharacter({ ...INITIAL_CHARACTER, name, class: characterClass });
    }
  };

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>キャラクター作成</CardTitle>
        <CardDescription>あなたの冒険者を作成しましょう</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <label htmlFor="name">名前</label>
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="flex flex-col space-y-1.5">
            <label htmlFor="class">クラス</label>
            <select id="class" value={characterClass} onChange={(e) => setCharacterClass(e.target.value)}>
              <option value="">選択してください</option>
              <option value="戦士">戦士</option>
              <option value="魔法使い">魔法使い</option>
              <option value="盗賊">盗賊</option>
            </select>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={handleCreate}>作成</Button>
      </CardFooter>
    </Card>
  );
};

const CharacterStatus: React.FC<{ character: Character }> = ({ character }) => {
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>{character.name}</CardTitle>
        <CardDescription>{character.class} レベル {character.level}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center"><Heart className="mr-2" /> HP</span>
            <span>{character.hp} / {character.maxHp}</span>
          </div>
          <Progress value={(character.hp / character.maxHp) * 100} className="w-full" />
          <div className="flex items-center justify-between">
            <span className="flex items-center"><Sword className="mr-2" /> 攻撃力</span>
            <span>{character.attack}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center"><Shield className="mr-2" /> 防御力</span>
            <span>{character.defense}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center"><Star className="mr-2" /> 経験値</span>
            <span>{character.exp} / {calculateExpToNextLevel(character.level)}</span>
          </div>
          <Progress value={(character.exp / calculateExpToNextLevel(character.level)) * 100} className="w-full" />
        </div>
      </CardContent>
    </Card>
  );
};

const Battle: React.FC<{ character: Character, enemy: Enemy, onBattleEnd: (result: 'win' | 'lose', expGained: number) => void }> = ({ character, enemy, onBattleEnd }) => {
  const [characterHp, setCharacterHp] = useState(character.hp);
  const [enemyHp, setEnemyHp] = useState(enemy.hp);
  const [battleLog, setBattleLog] = useState<string[]>([]);

  const attack = (attacker: 'character' | 'enemy') => {
    if (attacker === 'character') {
      const damage = Math.max(0, character.attack - enemy.defense);
      setEnemyHp(prev => Math.max(0, prev - damage));
      setBattleLog(prev => [...prev, `${character.name}の攻撃！${enemy.name}に${damage}のダメージ！`]);
    } else {
      const damage = Math.max(0, enemy.attack - character.defense);
      setCharacterHp(prev => Math.max(0, prev - damage));
      setBattleLog(prev => [...prev, `${enemy.name}の攻撃！${character.name}に${damage}のダメージ！`]);
    }
  };

  useEffect(() => {
    if (characterHp <= 0) {
      onBattleEnd('lose', 0);
    } else if (enemyHp <= 0) {
      onBattleEnd('win', enemy.expReward);
    }
  }, [characterHp, enemyHp]);

  return (
    <Card className="w-[450px]">
      <CardHeader>
        <CardTitle>バトル</CardTitle>
        <CardDescription>{character.name} VS {enemy.name}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          <div className="flex justify-between">
            <div>
              <p>{character.name}</p>
              <Progress value={(characterHp / character.maxHp) * 100} className="w-[200px]" />
            </div>
            <div>
              <p>{enemy.name}</p>
              <Progress value={(enemyHp / enemy.maxHp) * 100} className="w-[200px]" />
            </div>
          </div>
          <div className="h-[200px] overflow-y-auto border p-2">
            {battleLog.map((log, index) => (
              <p key={index}>{log}</p>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={() => attack('character')}>攻撃</Button>
      </CardFooter>
    </Card>
  );
};

const QuestList: React.FC<{ quests: Quest[], onQuestComplete: (quest: Quest) => void }> = ({ quests, onQuestComplete }) => {
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>クエスト</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          {quests.map(quest => (
            <div key={quest.id} className="flex justify-between items-center">
              <div>
                <p className="font-bold">{quest.name}</p>
                <p className="text-sm">{quest.description}</p>
              </div>
              <Button onClick={() => onQuestComplete(quest)} disabled={quest.completed}>
                {quest.completed ? '完了' : '受注'}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const LocationSelector: React.FC<{ locations: Location[], onSelectLocation: (location: Location) => void }> = ({ locations, onSelectLocation }) => {
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>ロケーション</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          {locations.map(location => (
            <div key={location.id}>
              <Button onClick={() => onSelectLocation(location)} className="w-full">
                {location.name}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Main App
const App: React.FC = () => {
  const [character, setCharacter] = useState<Character | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [currentEnemy, setCurrentEnemy] = useState<Enemy | null>(null);
  const [quests, setQuests] = useState<Quest[]>(QUESTS);
  const [gameState, setGameState] = useState<'creation' | 'exploration' | 'battle'>('creation');

  const handleCreateCharacter = (newCharacter: Character) => {
    setCharacter(newCharacter);
    setGameState('exploration');
  };

  const handleSelectLocation = (location: Location) => {
    setCurrentLocation(location);
    const randomEnemy = location.enemies[Math.floor(Math.random() * location.enemies.length)];
    setCurrentEnemy(randomEnemy);
    setGameState('battle');
  };

  const handleBattleEnd = (result: 'win' | 'lose', expGained: number) => {
    if (result === 'win' && character) {
      let updatedCharacter = { ...character, exp: character.exp + expGained };
      if (updatedCharacter.exp >= calculateExpToNextLevel(updatedCharacter.level)) {
        updatedCharacter = levelUp(updatedCharacter);
      }
      setCharacter(updatedCharacter);
    }
    setGameState('exploration');
  };

  const handleQuestComplete = (completedQuest: Quest) => {
    if (character) {
      const updatedQuests = quests.map(quest =>
        quest.id === completedQuest.id ? { ...quest, completed: true } : quest
      );
      setQuests(updatedQuests);
      setCharacter({ ...character, exp: character.exp + completedQuest.reward });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">壮大なRPGゲーム</h1>
      {gameState === 'creation' && (
        <CharacterCreation onCreateCharacter={handleCreateCharacter} />
      )}
      {gameState === 'exploration' && character && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CharacterStatus character={character} />
          <QuestList quests={quests} onQuestComplete={handleQuestComplete} />
          <LocationSelector locations={LOCATIONS} onSelectLocation={handleSelectLocation} />
        </div>
      )}
      {gameState === 'battle' && character && currentEnemy && (
        <Battle character={character} enemy={currentEnemy} onBattleEnd={handleBattleEnd} />
      )}
    </div>
  );
};

export default App;