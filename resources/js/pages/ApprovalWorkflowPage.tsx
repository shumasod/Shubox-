import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface ApprovalStep {
  id?: number;
  step_order: number;
  approver_type: 'user' | 'role' | 'department_head';
  approver_id: number | null;
  timeout_hours: number;
  escalate_to_user_id: number | null;
}

interface ApprovalChain {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
  conditions: {
    min_amount?: number;
    max_amount?: number;
    categories?: string[];
    department_ids?: number[];
  };
  steps: ApprovalStep[];
}

const APPROVER_TYPE_LABELS: Record<string, string> = {
  user: '特定ユーザー',
  role: 'ロール',
  department_head: '部門長',
};

function StepCard({
  step,
  index,
  onChange,
  onRemove,
}: {
  step: ApprovalStep;
  index: number;
  onChange: (updated: ApprovalStep) => void;
  onRemove: () => void;
}) {
  return (
    <div className="relative flex gap-4">
      {/* Connector line */}
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
          {index + 1}
        </div>
        {/* line below */}
        <div className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-700 mt-1" />
      </div>

      <div className="flex-1 pb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">ステップ {index + 1}</h4>
            <button
              onClick={onRemove}
              className="text-xs text-red-500 hover:text-red-700 transition-colors"
            >
              削除
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                承認者タイプ
              </label>
              <select
                value={step.approver_type}
                onChange={e => onChange({ ...step, approver_type: e.target.value as ApprovalStep['approver_type'] })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white"
              >
                {Object.entries(APPROVER_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                タイムアウト (時間)
              </label>
              <input
                type="number"
                min={1}
                max={720}
                value={step.timeout_hours}
                onChange={e => onChange({ ...step, timeout_hours: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChainEditor({
  chain,
  onSave,
  onCancel,
}: {
  chain: Partial<ApprovalChain>;
  onSave: (data: Partial<ApprovalChain>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Partial<ApprovalChain>>(chain);
  const [steps, setSteps] = useState<ApprovalStep[]>(chain.steps ?? []);

  function addStep() {
    setSteps(prev => [
      ...prev,
      {
        step_order: prev.length + 1,
        approver_type: 'department_head',
        approver_id: null,
        timeout_hours: 48,
        escalate_to_user_id: null,
      },
    ]);
  }

  function updateStep(index: number, updated: ApprovalStep) {
    setSteps(prev => prev.map((s, i) => (i === index ? { ...updated, step_order: i + 1 } : s)));
  }

  function removeStep(index: number) {
    setSteps(prev => prev.filter((_, i) => i !== index).map((s, i) => ({ ...s, step_order: i + 1 })));
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            承認フロー名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.name ?? ''}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="例: 高額経費承認フロー"
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            適用条件 — 最小金額 (JPY)
          </label>
          <input
            type="number"
            min={0}
            value={form.conditions?.min_amount ?? ''}
            onChange={e => setForm(f => ({
              ...f,
              conditions: { ...f.conditions, min_amount: e.target.value ? Number(e.target.value) : undefined },
            }))}
            placeholder="0 = 制限なし"
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Steps */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">承認ステップ</h3>
        <div>
          {steps.map((step, i) => (
            <StepCard
              key={i}
              step={step}
              index={i}
              onChange={updated => updateStep(i, updated)}
              onRemove={() => removeStep(i)}
            />
          ))}
        </div>

        <button
          onClick={addStep}
          className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          ステップを追加
        </button>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          キャンセル
        </button>
        <button
          onClick={() => onSave({ ...form, steps })}
          disabled={!form.name?.trim() || steps.length === 0}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg"
        >
          保存
        </button>
      </div>
    </div>
  );
}

export default function ApprovalWorkflowPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Partial<ApprovalChain> | null>(null);

  const { data: chains = [], isLoading } = useQuery<ApprovalChain[]>({
    queryKey: ['approval-chains'],
    queryFn: () => fetch('/api/admin/approval-chains').then(r => r.json()),
  });

  const saveMutation = useMutation({
    mutationFn: (data: Partial<ApprovalChain>) => {
      const url = data.id ? `/api/admin/approval-chains/${data.id}` : '/api/admin/approval-chains';
      const method = data.id ? 'PUT' : 'POST';
      return fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(r => r.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-chains'] });
      setEditing(null);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (chain: ApprovalChain) =>
      fetch(`/api/admin/approval-chains/${chain.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !chain.is_active }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['approval-chains'] }),
  });

  if (editing !== null) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setEditing(null)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="戻る"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {editing.id ? '承認フローを編集' : '新しい承認フローを作成'}
          </h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <ChainEditor
            chain={editing}
            onSave={data => saveMutation.mutate(data)}
            onCancel={() => setEditing(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">承認ワークフロー</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">経費承認のフローとステップを設定します</p>
        </div>
        <button
          onClick={() => setEditing({})}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新規作成
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : chains.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-sm">承認フローがまだ登録されていません</p>
        </div>
      ) : (
        <div className="space-y-4">
          {chains.map(chain => (
            <div
              key={chain.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{chain.name}</h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      chain.is_active
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {chain.is_active ? '有効' : '無効'}
                    </span>
                  </div>
                  {chain.description && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{chain.description}</p>
                  )}
                  <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                    {chain.steps.length} ステップ
                    {chain.conditions.min_amount !== undefined && (
                      <> ・ 最小金額: {new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(chain.conditions.min_amount)}以上</>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleMutation.mutate(chain)}
                    className="px-3 py-1.5 text-xs font-medium border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {chain.is_active ? '無効化' : '有効化'}
                  </button>
                  <button
                    onClick={() => setEditing(chain)}
                    className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    編集
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
