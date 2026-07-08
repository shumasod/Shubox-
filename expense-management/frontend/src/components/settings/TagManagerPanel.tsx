import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api';

interface Tag {
  id: number;
  name: string;
  color: string;
  expenses_count: number;
}

const PRESET_COLORS = [
  '#6366f1', '#22c55e', '#f59e0b', '#ef4444',
  '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6',
];

function ColorDot({ color, selected, onClick }: { color: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-6 h-6 rounded-full border-2 transition-transform ${
        selected ? 'border-gray-900 scale-110' : 'border-transparent'
      }`}
      style={{ background: color }}
    />
  );
}

export default function TagManagerPanel() {
  const qc = useQueryClient();
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [error, setError] = useState('');

  const { data: tags = [], isLoading } = useQuery({
    queryKey: ['tags'],
    queryFn: () => apiClient.get('/api/v1/tags').then(r => r.data.data as Tag[]),
  });

  const createMutation = useMutation({
    mutationFn: (payload: { name: string; color: string }) =>
      apiClient.post('/api/v1/tags', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tags'] });
      setNewName('');
      setError('');
    },
    onError: () => setError('タグ名が重複しています'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/api/v1/tags/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tags'] }),
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    createMutation.mutate({ name: newName.trim(), color: newColor });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">タグ管理</h2>

      <form onSubmit={handleCreate} className="flex flex-col gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex gap-2">
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="タグ名を入力"
            maxLength={50}
            className="flex-1 border rounded px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600"
          />
          <button
            type="submit"
            disabled={!newName.trim() || createMutation.isPending}
            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            追加
          </button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {PRESET_COLORS.map(c => (
            <ColorDot key={c} color={c} selected={newColor === c} onClick={() => setNewColor(c)} />
          ))}
        </div>
        {error && <p className="text-red-500 text-xs">{error}</p>}
      </form>

      {isLoading ? (
        <p className="text-sm text-gray-400">読み込み中...</p>
      ) : (
        <ul className="space-y-2">
          {tags.map(tag => (
            <li key={tag.id} className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg px-4 py-2 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full" style={{ background: tag.color }} />
                <span className="text-sm text-gray-800 dark:text-gray-200">{tag.name}</span>
                <span className="text-xs text-gray-400">{tag.expenses_count}件</span>
              </div>
              <button
                onClick={() => {
                  if (confirm(`「${tag.name}」を削除しますか？`))
                    deleteMutation.mutate(tag.id);
                }}
                className="text-xs text-red-400 hover:text-red-600 disabled:opacity-30"
                disabled={deleteMutation.isPending}
              >
                削除
              </button>
            </li>
          ))}
          {tags.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">タグがありません</p>
          )}
        </ul>
      )}
    </div>
  );
}
