import { useState, useId } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';

interface Budget {
  id: number;
  name: string;
  budget_type: 'department' | 'project' | 'category' | 'user';
  period_type: 'monthly' | 'quarterly' | 'annual' | 'custom';
  period_start: string;
  period_end: string;
  amount: number;
  currency: string;
  alert_threshold: number;
  is_active: boolean;
  spent_amount: number;
  utilization_pct: number;
  is_over_budget: boolean;
  is_near_alert: boolean;
}

const PERIOD_FILTERS = [
  { value: '',         label: '全期間' },
  { value: 'current',  label: '実施中' },
  { value: 'upcoming', label: '予定' },
  { value: 'past',     label: '過去' },
];

const TYPE_LABELS: Record<string, string> = {
  department: '部門',
  project:    'プロジェクト',
  category:   'カテゴリ',
  user:       '個人',
};

const fmt = (n: number, currency: string) =>
  new Intl.NumberFormat('ja-JP', { style: 'currency', currency }).format(n);

function UtilBar({ pct, threshold, isOver }: { pct: number; threshold: number; isOver: boolean }) {
  const barPct = Math.min(pct, 100);
  const color  = isOver ? 'bg-red-500' : pct >= threshold ? 'bg-amber-500' : 'bg-blue-500';
  const tPos   = `${threshold}%`;

  return (
    <div className="relative h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
      <div
        className={`h-full rounded-full transition-all ${color}`}
        style={{ width: `${barPct}%` }}
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
      />
      {/* Threshold marker */}
      <div
        className="absolute top-1/2 h-3 w-0.5 -translate-y-1/2 bg-gray-500 dark:bg-gray-400"
        style={{ left: tPos }}
        aria-hidden="true"
      />
    </div>
  );
}

function BudgetCard({ budget, onEdit }: { budget: Budget; onEdit: (b: Budget) => void }) {
  return (
    <div className={`rounded-lg border bg-white p-4 shadow-sm dark:bg-gray-800 ${
      budget.is_over_budget
        ? 'border-red-300 dark:border-red-700'
        : budget.is_near_alert
        ? 'border-amber-300 dark:border-amber-700'
        : 'border-gray-200 dark:border-gray-700'
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-medium text-gray-900 dark:text-white">{budget.name}</h3>
          <div className="mt-0.5 flex flex-wrap gap-x-2 text-xs text-gray-500">
            <span>{TYPE_LABELS[budget.budget_type]}</span>
            <span>·</span>
            <span>{budget.period_start} 〜 {budget.period_end}</span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {!budget.is_active && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-700">非有効</span>
          )}
          <button
            onClick={() => onEdit(budget)}
            className="text-xs text-blue-600 hover:underline dark:text-blue-400"
          >
            編集
          </button>
        </div>
      </div>

      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between text-sm">
          <span className="text-gray-700 dark:text-gray-300">
            {fmt(budget.spent_amount, budget.currency)}
          </span>
          <span className={`font-medium ${
            budget.is_over_budget
              ? 'text-red-600 dark:text-red-400'
              : budget.is_near_alert
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-gray-500'
          }`}>
            {budget.utilization_pct}%
          </span>
        </div>
        <UtilBar pct={budget.utilization_pct} threshold={budget.alert_threshold} isOver={budget.is_over_budget} />
        <p className="mt-1 text-right text-xs text-gray-400">予算: {fmt(budget.amount, budget.currency)}</p>
      </div>
    </div>
  );
}

function BudgetModal({ budget, onClose }: { budget: Budget | null; onClose: () => void }) {
  const qc = useQueryClient();
  const nameId   = useId();
  const amountId = useId();
  const startId  = useId();
  const endId    = useId();
  const alertId  = useId();

  const [form, setForm] = useState({
    name:            budget?.name ?? '',
    budget_type:     budget?.budget_type ?? 'department',
    period_type:     budget?.period_type ?? 'monthly',
    period_start:    budget?.period_start ?? '',
    period_end:      budget?.period_end ?? '',
    amount:          budget?.amount ?? 0,
    currency:        budget?.currency ?? 'JPY',
    alert_threshold: budget?.alert_threshold ?? 80,
    is_active:       budget?.is_active ?? true,
  });

  const mutation = useMutation({
    mutationFn: (data: typeof form) => {
      const url    = budget ? `/api/budgets/${budget.id}` : '/api/budgets';
      const method = budget ? 'PUT' : 'POST';
      return fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      }).then(r => { if (!r.ok) throw new Error(); return r.json(); });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['budgets'] }); onClose(); },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="budget-modal-title"
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800"
        onClick={e => e.stopPropagation()}
      >
        <h2 id="budget-modal-title" className="text-lg font-semibold text-gray-900 dark:text-white">
          {budget ? '予算を編集' : '予算を作成'}
        </h2>
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor={nameId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">名前</label>
            <input id={nameId} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">タイプ</label>
              <select value={form.budget_type} onChange={e => setForm(f => ({ ...f, budget_type: e.target.value as typeof form.budget_type }))}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor={amountId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">金額</label>
              <input id={amountId} type="number" min={1} value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: Number(e.target.value) }))}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor={startId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">開始日</label>
              <input id={startId} type="date" value={form.period_start}
                onChange={e => setForm(f => ({ ...f, period_start: e.target.value }))}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label htmlFor={endId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">終了日</label>
              <input id={endId} type="date" value={form.period_end}
                onChange={e => setForm(f => ({ ...f, period_end: e.target.value }))}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
            </div>
          </div>
          <div>
            <label htmlFor={alertId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              アラート閾値: {form.alert_threshold}%
            </label>
            <input id={alertId} type="range" min={10} max={100} step={5}
              value={form.alert_threshold}
              onChange={e => setForm(f => ({ ...f, alert_threshold: Number(e.target.value) }))}
              className="mt-1 w-full" />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300">
            キャンセル
          </button>
          <button
            onClick={() => mutation.mutate(form)}
            disabled={!form.name || form.amount <= 0 || !form.period_start || !form.period_end || mutation.isPending}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
            {mutation.isPending ? '保存中…' : budget ? '更新' : '作成'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BudgetList() {
  const [params, setParams] = useSearchParams();
  const [editing, setEditing] = useState<Budget | null | undefined>(undefined);
  const period      = params.get('period') ?? '';
  const budgetType  = params.get('budget_type') ?? '';

  const { data, isLoading } = useQuery<{ data: Budget[]; meta: Record<string, number> }>({
    queryKey: ['budgets', period, budgetType],
    queryFn: async () => {
      const sp = new URLSearchParams({ active_only: '1' });
      if (period)     sp.set('period', period);
      if (budgetType) sp.set('budget_type', budgetType);
      const r = await fetch(`/api/budgets?${sp}`);
      if (!r.ok) throw new Error();
      return r.json();
    },
  });

  const budgets     = data?.data ?? [];
  const overBudget  = budgets.filter(b => b.is_over_budget).length;
  const nearAlert   = budgets.filter(b => b.is_near_alert && !b.is_over_budget).length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">予算管理</h1>
        <button
          onClick={() => setEditing(null)}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + 予算を作成
        </button>
      </div>

      {/* Summary pills */}
      {(overBudget > 0 || nearAlert > 0) && (
        <div className="mt-4 flex gap-3">
          {overBudget > 0 && (
            <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800 dark:bg-red-900/40 dark:text-red-300">
              赤字: {overBudget}件
            </span>
          )}
          {nearAlert > 0 && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
              警告: {nearAlert}件
            </span>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="mt-4 flex flex-wrap gap-3">
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-700" role="radiogroup" aria-label="期間フィルター">
          {PERIOD_FILTERS.map(f => (
            <button key={f.value} role="radio" aria-checked={period === f.value}
              onClick={() => setParams(prev => { const next = new URLSearchParams(prev); next.set('period', f.value); return next; })}
              className={`px-3 py-1.5 text-sm transition first:rounded-l-lg last:rounded-r-lg ${
                period === f.value ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
        <select
          value={budgetType}
          onChange={e => setParams(prev => { const next = new URLSearchParams(prev); next.set('budget_type', e.target.value); return next; })}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white">
          <option value="">全タイプ</option>
          {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      {/* Grid */}
      <div className="mt-6">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-36 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
            ))}
          </div>
        ) : budgets.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            <p>予算がありません。上記の「+ 予算を作成」から追加してください。</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {budgets.map(b => (
              <BudgetCard key={b.id} budget={b} onEdit={setEditing} />
            ))}
          </div>
        )}
      </div>

      {editing !== undefined && (
        <BudgetModal budget={editing} onClose={() => setEditing(undefined)} />
      )}
    </div>
  );
}
