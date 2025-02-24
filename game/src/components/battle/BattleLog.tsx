import React from 'react';

interface BattleLogProps {
  logs: string[];
}

export const BattleLog: React.FC<BattleLogProps> = ({ logs }) => {
  return (
    <div className="h-32 overflow-y-auto border rounded p-2 bg-gray-50 text-sm">
      {logs.map((log, i) => (
        <p key={i}>{log}</p>
      ))}
    </div>
  );
};
