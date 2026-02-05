import React from 'react';
import { Character } from '../../types/character';
import { Progress } from "@/components/ui/progress";
import { Sword, Shield, Heart } from 'lucide-react';

interface CharacterStatsProps {
  character: Character;
  showDetails?: boolean;
}

export const CharacterStats: React.FC<CharacterStatsProps> = ({
  character,
  showDetails = false
}) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <div className="flex items-center">
          <Heart className="w-4 h-4 mr-2" />
          <span>
            {character.name}
            {character.level && ` Lv.${character.level}`}
          </span>
        </div>
        <span>{character.hp}/{character.maxHp}</span>
      </div>
      <Progress 
        value={(character.hp / character.maxHp) * 100} 
        className="mb-2"
      />
      {showDetails && (
        <div className="flex justify-between text-sm">
          <div className="flex items-center">
            <Sword className="w-4 h-4 mr-1" />
            <span>{character.attack}</span>
          </div>
          {character.defense && (
            <div className="flex items-center">
              <Shield className="w-4 h-4 mr-1" />
              <span>{character.defense}</span>
            </div>
          )}
          {character.exp !== undefined && (
            <span>EXP: {character.exp}/100</span>
          )}
        </div>
      )}
    </div>
  );
};
