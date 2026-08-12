import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Project {
  id: number;
  name: string;
  code: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  budget_amount: number | null;
  currency: string;
  spent_amount: number;
  budget_utilization: number | null;
  manager: { id: number; name: string } | null;
  department: { id: number; name: string } | null;
  created_at: string;
}

interface ProjectExpense {
  id: number;
  title: string;
  amount: number;
  currency: string;
  status: string;
  category: string;
  submitter: string;
  expense_date: string;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  planning:  { label: '計画中',   color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
  active:    { label: '進行中',   color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  on_hold:   { label: '保留中',   color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' },
  completed: { label: '完了',     color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  cancelled: { label: 'キャンセル', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
};

const TRANSITIONS: Record<string, string[]> = {
  planning:  ['active', 'cancelled'],
  active:    ['on_hold', 'completed', 'cancelled'],
  on_hold:   ['active', 'cancelled'],
  completed: [],
  cancelled: [],
};

const fmt = (n: number, currency: string) =>
  new Intl.NumberFormat('ja-JP', { style: 'currency', currency }).format(n);

function BudgetGauge({ spent, budget, currency }: { spent: number; budget: number; currency: string }) {
  const pct    = Math.min((spent / budget) * 100, 100);
  const isOver = spent > budget;
  const color  = isOver ? 'bg-red-500' : pct >= 80 ? 'bg-amber-500' : 'bg-blue-500';

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">プロジェクト予算</h3>
      <div className="mt-3 flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{fmt(spent, currency)}</p>
          <p className="text-sm text-gray-500">予算: {fmt(budget, currency)}</p>
        </div>
        <span className={`text-lg font-bold ${
          isOver ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'
        }`}>
          {pct.toFixed(1)}%
        </span>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className={`h-full rounded-full ${color} transition-all`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={Math.round(pct)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      {isOver && (
        <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
          予算超過: {fmt(spent - budget, currency)}
        </p>
      )}
    </div>
  );
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [expensePage, setExpensePage] = useState(1);

  const { data: project, isLoading } = useQuery<Project>({
    queryKey: ['project', id],
    queryFn: async () => {
      const r = await fetch(`/api/projects/${id}`);
      if (!r.ok) throw new Error();
      return (await r.json()).data;
    },
    enabled: !!id,
  });

  const { data: expensesData } = useQuery<{ data: ProjectExpense[]; meta: Record<string, number> }>({
    queryKey: ['project-expenses', id, expensePage],
    queryFn: async () => {
      const r = await fetch(`/api/expenses?project_id=${id}&page=${expensePage}&per_page=10`);
      if (!r.ok) throw new Error();
      return r.json();
    },
    enabled: !!id,
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) =>
      fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ status }),
      }).then(r => { if (!r.ok) throw new Error(); return r.json(); }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['project', id] }),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="space-y-4">
          <div className="h-8 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-32 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
          <div className="h-64 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    );
  }

  if (!project) return null;

  const status    = STATUS_MAP[project.status];
  const nextSteps = TRANSITIONS[project.status] ?? [];
  const expenses  = expensesData?.data ?? [];
  const meta      = expensesData?.meta;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-gray-500" aria-label="パンくず">
        <button onClick={() => navigate('/projects')} className="hover:text-gray-700 dark:hover:text-gray-300">プロジェクト</button>
        <span aria-hidden="true">/</span>
        <span className="text-gray-900 dark:text-white">{project.name}</span>
      </nav>

      {/* Header */}
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{project.name}</h1>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color}`}>
              {status.label}
            </span>
          </div>
          <p className="mt-1 font-mono text-sm text-gray-500">{project.code}</p>
          {project.description && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{project.description}</p>
          )}
        </div>

        {/* Status transitions */}
        {nextSteps.length > 0 && (
          <div className="flex gap-2">
            {nextSteps.map(s => (
              <button
                key={s}
                onClick={() => statusMutation.mutate(s)}
                disabled={statusMutation.isPending}
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                  s === 'cancelled'
                    ? 'border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                } disabled:opacity-50`}
              >
                {STATUS_MAP[s].label}に変更
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Meta info */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: '担当マネージャー', value: project.manager?.name ?? '未設定' },
          { label: '部門',       value: project.department?.name ?? '未設定' },
          { label: '開始日',     value: project.start_date ? new Date(project.start_date).toLocaleDateString('ja-JP') : '未設定' },
          { label: '終了予定日', value: project.end_date   ? new Date(project.end_date).toLocaleDateString('ja-JP')   : '未設定' },
        ].map(item => (
          <div key={item.label} className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <p className="text-xs text-gray-500">{item.label}</p>
            <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Budget gauge */}
      {project.budget_amount !== null && (
        <div className="mt-6">
          <BudgetGauge
            spent={project.spent_amount}
            budget={project.budget_amount}
            currency={project.currency}
          />
        </div>
      )}

      {/* Expense list */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">道具立替一覧</h2>
        {expenses.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">経費がありません</p>
        ) : (
          <div className="mt-3 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  {['申請', 'カテゴリ', '金額', 'ステータス', '申請者', '日付'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-700 dark:bg-gray-900">
                {expenses.map(e => (
                  <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                    onClick={() => navigate(`/expenses/${e.id}`)}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{e.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{e.category}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{fmt(e.amount, e.currency)}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-700">{e.status}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{e.submitter}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(e.expense_date).toLocaleDateString('ja-JP')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {meta && meta.last_page > 1 && (
          <div className="mt-4 flex justify-center gap-2">
            <button onClick={() => setExpensePage(p => Math.max(1, p - 1))} disabled={expensePage === 1}
              className="rounded border px-3 py-1 text-sm disabled:opacity-40">前へ</button>
            <span className="text-sm text-gray-500">{expensePage} / {meta.last_page}</span>
            <button onClick={() => setExpensePage(p => Math.min(meta.last_page, p + 1))} disabled={expensePage === meta.last_page}
              className="rounded border px-3 py-1 text-sm disabled:opacity-40">次へ</button>
          </div>
        )}
      </section>
    </div>
  );
}
