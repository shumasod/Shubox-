import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api';

interface Step {
  order: number;
  approver_id: number;
  approver_name?: string;
}

interface Flow {
  id: number;
  name: string;
  min_amount: number | null;
  max_amount: number | null;
  is_active: boolean;
  steps: Step[];
}

interface User {
  id: number;
  name: string;
  role: string;
}

export default function ApprovalFlowEditor() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Flow | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const { data: flows = [] } = useQuery({
    queryKey: ['approval-flows'],
    queryFn: () => apiClient.get('/api/v1/approval-flows').then(r => r.data.data as Flow[]),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users-approvers'],
    queryFn: () =>
      apiClient.get('/api/v1/admin/users?role=approver').then(r => r.data.data as User[]),
  });

  const saveMutation = useMutation({
    mutationFn: (payload: { steps: Step[] }) =>
      apiClient.put(`/api/v1/approval-flows/${selected!.id}`, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['approval-flows'] }),
  });

  const selectFlow = (flow: Flow) => {
    setSelected(flow);
    setSteps(flow.steps.slice().sort((a, b) => a.order - b.order));
  };

  const addStep = (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (!user || steps.some(s => s.approver_id === userId)) return;
    setSteps(prev => [...prev, { order: prev.length + 1, approver_id: userId, approver_name: user.name }]);
  };

  const removeStep = (idx: number) => {
    setSteps(prev => prev.filter((_, i) => i !== idx).map((s, i) => ({ ...s, order: i + 1 })));
  };

  const handleDragStart = (idx: number) => setDragIdx(idx);

  const handleDrop = (targetIdx: number) => {
    if (dragIdx === null || dragIdx === targetIdx) return;
    const reordered = [...steps];
    const [moved] = reordered.splice(dragIdx, 1);
    reordered.splice(targetIdx, 0, moved);
    setSteps(reordered.map((s, i) => ({ ...s, order: i + 1 })));
    setDragIdx(null);
  };

  const fmt = (n: number | null) => (n === null ? '無制限' : `${n.toLocaleString('ja-JP')}円`);

  return (
    <div className="flex gap-6 p-6">
      {/* Flow list */}
      <aside className="w-56 flex-shrink-0 space-y-2">
        <h2 className="text-xs font-semibold text-gray-500 uppercase">承認フロー</h2>
        {flows.map(f => (
          <button
            key={f.id}
            onClick={() => selectFlow(f)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              selected?.id === f.id
                ? 'bg-indigo-600 text-white'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}
          >
            <div className="font-medium truncate">{f.name}</div>
            <div className={`text-xs mt-0.5 ${selected?.id === f.id ? 'text-indigo-200' : 'text-gray-400'}`}>
              {fmt(f.min_amount)} 〜 {fmt(f.max_amount)}
            </div>
          </button>
        ))}
      </aside>

      {/* Step editor */}
      {selected ? (
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-gray-800 dark:text-gray-100">{selected.name} — 承認ステップ編集</h2>
            <button
              onClick={() => saveMutation.mutate({ steps })}
              disabled={saveMutation.isPending}
              className="px-4 py-1.5 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {saveMutation.isPending ? '保存中...' : '保存'}
            </button>
          </div>

          {/* Approver picker */}
          <div className="flex gap-2">
            <select
              onChange={e => addStep(Number(e.target.value))}
              defaultValue=""
              className="border rounded px-3 py-2 text-sm flex-1 dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="" disabled>承認者を追加...</option>
              {users
                .filter(u => !steps.some(s => s.approver_id === u.id))
                .map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>

          {/* Step list (drag-to-reorder) */}
          <ul className="space-y-2">
            {steps.map((step, i) => (
              <li
                key={step.approver_id}
                draggable
                onDragStart={() => handleDragStart(i)}
                onDragOver={e => e.preventDefault()}
                onDrop={() => handleDrop(i)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-grab select-none ${
                  dragIdx === i
                    ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30'
                    : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'
                }`}
              >
                <span className="text-xs font-bold text-gray-400 w-5 text-center">{step.order}</span>
                <span className="flex-1 text-sm text-gray-800 dark:text-gray-200">{step.approver_name ?? `User #${step.approver_id}`}</span>
                <button
                  onClick={() => removeStep(i)}
                  className="text-xs text-red-400 hover:text-red-600"
                >
                  削除
                </button>
              </li>
            ))}
            {steps.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">承認者を追加してください</p>
            )}
          </ul>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
          左のリストからフローを選択してください
        </div>
      )}
    </div>
  );
}
