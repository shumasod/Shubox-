import React, { useId, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

type Tag = { id: number; name: string; color: string; expenses_count: number };

const PRESET_COLORS = [
  '#EF4444', '#F97316', '#EAB308', '#22C55E',
  '#14B8A6', '#3B82F6', '#8B5CF6', '#EC4899',
  '#6B7280', '#1E293B',
];

interface TagFormProps {
  initial?: Tag;
  onSave: (data: { name: string; color: string }) => void;
  onCancel: () => void;
  isPending: boolean;
}

function TagForm({ initial, onSave, onCancel, isPending }: TagFormProps) {
  const nameId  = useId();
  const colorId = useId();
  const [name,  setName]  = useState(initial?.name  ?? '');
  const [color, setColor] = useState(initial?.color ?? '#6B7280');

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3">
      <div className="flex-1 min-w-[140px]">
        <label htmlFor={nameId} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">タグ名</label>
        <input
          id={nameId}
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          maxLength={50}
          className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">カラー</p>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_COLORS.map(c => (
            <button
              key={c}
              type="button"
              aria-label={c}
              aria-pressed={color === c}
              onClick={() => setColor(c)}
              className={`h-6 w-6 rounded-full transition-transform ${
                color === c ? 'ring-2 ring-offset-1 ring-gray-800 dark:ring-white scale-110' : 'hover:scale-105'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
          <label className="flex items-center">
            <input
              id={colorId}
              type="color"
              value={color}
              onChange={e => setColor(e.target.value)}
              className="sr-only"
            />
            <span
              aria-label="カスタムカラーを選択"
              className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-gray-400 text-xs text-gray-400 hover:border-gray-600"
              onClick={() => document.getElementById(colorId)?.click()}
            >+</span>
          </label>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
        >
          キャンセル
        </button>
        <button
          type="button"
          onClick={() => name.trim() && onSave({ name: name.trim(), color })}
          disabled={!name.trim() || isPending}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? '保存中...' : '保存'}
        </button>
      </div>
    </div>
  );
}

export function TagManager() {
  const [showNew,    setShowNew]    = useState(false);
  const [editingId,  setEditingId]  = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data: tags = [], isLoading } = useQuery<Tag[]>({
    queryKey: ['tags'],
    queryFn: () => api.get('/tags').then(r => r.data),
    staleTime: 60_000,
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; color: string }) => api.post('/tags', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tags'] }); setShowNew(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: number; name: string; color: string }) =>
      api.put(`/tags/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tags'] }); setEditingId(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/tags/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tags'] }),
  });

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">タグ管理</h1>
        {!showNew && (
          <button
            type="button"
            onClick={() => setShowNew(true)}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            + 新規タグ
          </button>
        )}
      </div>

      {showNew && (
        <div className="mb-4">
          <TagForm
            onSave={(data) => createMutation.mutate(data)}
            onCancel={() => setShowNew(false)}
            isPending={createMutation.isPending}
          />
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-gray-100 dark:bg-gray-800" />
          ))}
        </div>
      ) : tags.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-12">タグがありません。作成してください。</p>
      ) : (
        <ul className="space-y-2">
          {tags.map(tag => (
            <li key={tag.id}>
              {editingId === tag.id ? (
                <TagForm
                  initial={tag}
                  onSave={(data) => updateMutation.mutate({ id: tag.id, ...data })}
                  onCancel={() => setEditingId(null)}
                  isPending={updateMutation.isPending}
                />
              ) : (
                <div className="flex items-center gap-3 rounded-lg bg-white dark:bg-gray-800 px-4 py-3 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                  <span
                    className="h-4 w-4 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: tag.color }}
                    aria-hidden="true"
                  />
                  <span className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-100">{tag.name}</span>
                  <span className="text-xs text-gray-400">{tag.expenses_count}件の経費</span>
                  <button
                    type="button"
                    onClick={() => setEditingId(tag.id)}
                    className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                  >編集</button>
                  <button
                    type="button"
                    onClick={() => window.confirm(`「${tag.name}」を削除しますか？`) && deleteMutation.mutate(tag.id)}
                    className="text-xs text-red-500 hover:underline"
                  >削除</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
