import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

type DashboardStats = {
  total_expenses_this_month: number;
  total_amount_this_month: number;
  pending_approvals: number;
  rejected_this_month: number;
  budget_utilization_pct: number;
  expenses_by_day: Array<{ date: string; amount: number }>;
  recent_expenses: Array<{
    id: number;
    title: string;
    amount: number;
    currency: string;
    status: string;
    created_at: string;
  }>;
};

function formatJPY(n: number) {
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }).format(n);
}

// Inline sparkline using inline SVG
function Sparkline({ data }: { data: number[] }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const w = 80;
  const h = 28;
  const step = w / (data.length - 1);
  const points = data
    .map((v, i) => `${i * step},${h - (v / max) * h}`)
    .join(' ');

  return (
    <svg width={w} height={h} aria-hidden="true" className="flex-shrink-0">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-blue-400"
        points={points}
      />
    </svg>
  );
}

const STATUS_DOT: Record<string, string> = {
  draft:     'bg-gray-400',
  submitted: 'bg-blue-500',
  approved:  'bg-green-500',
  rejected:  'bg-red-500',
  paid:      'bg-teal-500',
};

const STATUS_LABEL: Record<string, string> = {
  draft:     '下書き',
  submitted: '申請中',
  approved:  '承認済',
  rejected:  '却下',
  paid:      '支払済',
};

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
  sparkData?: number[];
}

function StatCard({ label, value, sub, accent = 'text-gray-900 dark:text-white', sparkData }: StatCardProps) {
  return (
    <div className="rounded-xl bg-white dark:bg-gray-800 p-5 shadow ring-1 ring-gray-200 dark:ring-gray-700">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</p>
          <p className={`mt-1 text-2xl font-bold truncate ${accent}`}>{value}</p>
          {sub && <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{sub}</p>}
        </div>
        {sparkData && <Sparkline data={sparkData} />}
      </div>
    </div>
  );
}

function BudgetMeter({ pct }: { pct: number }) {
  const clamped = Math.min(pct, 100);
  const color = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-blue-500';

  return (
    <div className="rounded-xl bg-white dark:bg-gray-800 p-5 shadow ring-1 ring-gray-200 dark:ring-gray-700">
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">今月予算利用率</p>
      <p className={`mt-1 text-2xl font-bold ${
        pct >= 90 ? 'text-red-600 dark:text-red-400' : pct >= 70 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-900 dark:text-white'
      }`}>{pct.toFixed(1)}%</p>
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="予算利用率"
        className="mt-3 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700"
      >
        <div className={`h-2 rounded-full transition-all duration-500 ${color}`} style={{ width: `${clamped}%` }} />
      </div>
      {pct > 100 && (
        <p className="mt-1 text-xs text-red-500">予算超過</p>
      )}
    </div>
  );
}

export function DashboardWidgets() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/dashboard/stats').then(r => r.data),
    staleTime: 2 * 60_000,
    refetchInterval: 5 * 60_000,
  });

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-gray-100 dark:bg-gray-800" />
        ))}
      </div>
    );
  }

  const sparkAmounts = stats.expenses_by_day.map(d => d.amount);

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="今月の経費件数"
          value={`${stats.total_expenses_this_month}件`}
          sparkData={sparkAmounts}
        />
        <StatCard
          label="今月の合計金額"
          value={formatJPY(stats.total_amount_this_month)}
          sparkData={sparkAmounts}
        />
        <StatCard
          label="承認待ち"
          value={stats.pending_approvals}
          accent={stats.pending_approvals > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-900 dark:text-white'}
        />
        <StatCard
          label="却下 (今月)"
          value={stats.rejected_this_month}
          accent={stats.rejected_this_month > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}
        />
      </div>

      {/* Budget meter */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <BudgetMeter pct={stats.budget_utilization_pct} />

        {/* Quick links */}
        <div className="sm:col-span-2 rounded-xl bg-white dark:bg-gray-800 p-5 shadow ring-1 ring-gray-200 dark:ring-gray-700">
          <p className="mb-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">クイックアクセス</p>
          <div className="flex flex-wrap gap-2">
            {[
              { to: '/expenses/new',      label: '+ 経費を申請' },
              { to: '/approvals',         label: '承認インボックス' },
              { to: '/reports',           label: 'レポート' },
              { to: '/analytics',         label: '分析' },
            ].map(l => (
              <Link
                key={l.to}
                to={l.to}
                className="rounded-md border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent expenses */}
      <div className="rounded-xl bg-white dark:bg-gray-800 shadow ring-1 ring-gray-200 dark:ring-gray-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">最近の経費</h2>
          <Link to="/expenses" className="text-xs text-blue-600 hover:underline dark:text-blue-400">すべて見る</Link>
        </div>
        <ul className="divide-y divide-gray-100 dark:divide-gray-700">
          {stats.recent_expenses.map(e => (
            <li key={e.id}>
              <Link
                to={`/expenses/${e.id}`}
                className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <span
                  aria-hidden="true"
                  className={`h-2 w-2 flex-shrink-0 rounded-full ${STATUS_DOT[e.status] ?? 'bg-gray-400'}`}
                  title={STATUS_LABEL[e.status]}
                />
                <span className="flex-1 truncate text-sm text-gray-800 dark:text-gray-100">{e.title}</span>
                <span className="flex-shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {formatJPY(e.amount)}
                </span>
                <span className="flex-shrink-0 text-xs text-gray-400">
                  {new Intl.DateTimeFormat('ja-JP', { month: 'short', day: 'numeric' }).format(new Date(e.created_at))}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
