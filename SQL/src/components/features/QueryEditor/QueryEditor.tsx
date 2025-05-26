import React from 'react';
import { Card } from '../../common/Card';

interface QueryEditorProps 
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export const QueryEditor: React.FC<QueryEditorProps> = ({
  value,
  onChange,
  onSubmit,
}) => {
  return (
    <Card className="w-full p-4">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-32 p-2 border rounded font-mono"
        placeholder="SQLクエリを入力してください..."
      />
      <button
        onClick={onSubmit}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-2"
      >
        実行
      </button>
    </Card>
  );
};
