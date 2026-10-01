import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

interface Statistics {
  mtd: { total: number; count: number };
  ytd: { total: number; count: number };
  this_week: { total: number; count: number };
  pending: { total: number; count: number };
  avg_approval_hours: number | null;
}

interface Expense {
  id: number;
  title: string;
  amount: number;
  currency: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  category: string;
  submitted_at: string | null;
  created_at: string;
}

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  submitted: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  approved: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

function formatCurrency(amount: number, currency = 'JPY'): string {
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency }).format(amount);
}

function KpiCard({ label, amount, count, currency = 'JPY', highlight = false }: {
  label: string;
  amount: number;
  count: number;
  currency?: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-xl p-5 border ${
      highlight
        ? 'bg-blue-600 border-blue-500 text-white'
        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
    }`}>
      <p className={`text-sm font-medium ${
        highlight ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
      }`}>{label}</p>
      <p className={`mt-1 text-2xl font-bold ${
        highlight ? 'text-white' : 'text-gray-900 dark:text-white'
      }`}>
        {formatCurrency(amount, currency)}
      </p>
      <p className={`mt-1 text-xs ${
        highlight ? 'text-blue-200' : 'text-gray-400 dark:text-gray-500'
      }`}>{count} 件</p>
    </div>
  );
}

export default function ExpenseDashboard() {
  const [scope, setScope] = useState<'tenant' | 'personal'>('tenant');

  const { data: stats, isLoading: statsLoading } = useQuery<Statistics>({
    queryKey: ['expense-statistics', scope],
    queryFn: () =>
      fetch(`/api/expenses/statistics?scope=${scope}`).then(r => r.json()),
    refetchInterval: 60_000,
  });

  const { data: recent, isLoading: recentLoading } = useQuery<{ data: Expense[] }>({
    queryKey: ['expenses-recent'],
    queryFn: () =>
      fetch('/api/expenses?per_page=8&sort=created_at&direction=desc').then(r => r.json()),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">経費ダッシュボード</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">経費の概況と最近の申請</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Scope toggle */}
          <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {(['tenant', 'personal'] as const).map(s => (
              <button
                key={s}
                onClick={() => setScope(s)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  scope === s
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {s === 'tenant' ? '全社' : '個人'}
              </button>
            ))}
          </div>
          <Link
            to="/expenses/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            経費を申請
          </Link>
        </div>
      </div>

      {/* KPI grid */}
      {statsLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="今月の経費" amount={stats.mtd.total} count={stats.mtd.count} highlight />
          <KpiCard label="今年の経費" amount={stats.ytd.total} count={stats.ytd.count} />
          <KpiCard label="今週の経費" amount={stats.this_week.total} count={stats.this_week.count} />
          <KpiCard label="承認待ち" amount={stats.pending.total} count={stats.pending.count} />
        </div>
      ) : null}

      {/* Avg approval time banner */}
      {stats?.avg_approval_hours !== null && stats?.avg_approval_hours !== undefined && (
        <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg text-sm text-amber-800 dark:text-amber-300">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          平均承認時間: <strong>{stats.avg_approval_hours.toFixed(1)} 時間</strong>
        </div>
      )}

      {/* Recent expenses */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">最近の申請</h2>
          <Link
            to="/expenses"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            すべて表示
          </Link>
        </div>

        {recentLoading ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-4">
                <div className="h-4 w-48 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
                <div className="ml-auto h-4 w-24 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {(recent?.data ?? []).map(expense => (
              <Link
                key={expense.id}
                to={`/expenses/${expense.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {expense.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {expense.category} · {new Date(expense.created_at).toLocaleDateString('ja-JP')}
                  </p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  STATUS_STYLES[expense.status]
                }`}>
                  {expense.status}
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
                  {formatCurrency(expense.amount, expense.currency)}
                </span>
              </Link>
            ))}
            {(recent?.data ?? []).length === 0 && (
              <p className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                まだ経費申請がありません
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
