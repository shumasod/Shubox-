import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

interface Budget {
  id: number;
  name: string;
  type: string;
  amount: number;
  spent_amount: number;
  currency: string;
  period: string;
  start_date: string;
  end_date: string;
  status: string;
  alert_threshold: number;
  utilization_percent: number;
  remaining_amount: string;
}

interface BudgetSummary {
  total_budgets: number;
  total_allocated: number;
  total_spent: number;
  total_remaining: number;
  utilization_pct: number;
  exceeded_count: number;
  alert_count: number;
}

function formatCurrency(amount: number, currency = 'JPY'): string {
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency }).format(amount);
}

function UtilizationBar({ percent, threshold }: { percent: number; threshold: number }) {
  const clamped = Math.min(percent, 100);
  const color =
    percent > 100
      ? 'bg-red-500'
      : percent >= threshold
      ? 'bg-amber-500'
      : 'bg-emerald-500';

  return (
    <div className="relative h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
      <div
        className={`h-2 rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${clamped}%` }}
      />
      <div
        className="absolute top-0 h-2 w-0.5 bg-gray-500 dark:bg-gray-400"
        style={{ left: `${threshold}%` }}
        title={`Alert at ${threshold}%`}
      />
    </div>
  );
}

function BudgetCard({ budget }: { budget: Budget }) {
  const exceeded = budget.spent_amount > budget.amount;
  const alerting = !exceeded && budget.utilization_percent >= budget.alert_threshold;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{budget.name}</h3>
          <span className="text-xs capitalize text-gray-500 dark:text-gray-400">
            {budget.type} &bull; {budget.period}
          </span>
        </div>
        {exceeded && (
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
            Exceeded
          </span>
        )}
        {alerting && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            Alert
          </span>
        )}
      </div>

      <UtilizationBar percent={budget.utilization_percent} threshold={budget.alert_threshold} />

      <div className="mt-3 flex justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">
          Spent: <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(budget.spent_amount, budget.currency)}</span>
        </span>
        <span className="text-gray-600 dark:text-gray-400">
          Budget: <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(budget.amount, budget.currency)}</span>
        </span>
      </div>

      <div className="mt-1 text-right text-xs text-gray-500 dark:text-gray-400">
        Remaining: {formatCurrency(parseFloat(budget.remaining_amount), budget.currency)}
      </div>

      <div className="mt-2 text-right text-xs text-gray-400 dark:text-gray-500">
        {budget.start_date} – {budget.end_date}
      </div>
    </div>
  );
}

function SummaryKPI({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{sub}</p>}
    </div>
  );
}

export default function BudgetOverview() {
  const [typeFilter, setTypeFilter] = useState<string>('');

  const { data: summary } = useQuery<BudgetSummary>({
    queryKey: ['budget-summary'],
    queryFn: () => fetch('/api/budgets/summary').then((r) => r.json()),
  });

  const { data, isLoading } = useQuery<{ data: Budget[] }>({
    queryKey: ['budgets', typeFilter],
    queryFn: () => {
      const params = new URLSearchParams({ current: '1' });
      if (typeFilter) params.set('type', typeFilter);
      return fetch(`/api/budgets?${params}`).then((r) => r.json());
    },
  });

  const budgets = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Budget Overview</h1>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
        >
          <option value="">All types</option>
          <option value="department">Department</option>
          <option value="project">Project</option>
          <option value="category">Category</option>
        </select>
      </div>

      {summary && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <SummaryKPI
            label="Total Allocated"
            value={formatCurrency(summary.total_allocated)}
            sub={`${summary.total_budgets} budgets`}
          />
          <SummaryKPI
            label="Total Spent"
            value={formatCurrency(summary.total_spent)}
            sub={`${summary.utilization_pct}% utilization`}
          />
          <SummaryKPI
            label="Remaining"
            value={formatCurrency(summary.total_remaining)}
          />
          <SummaryKPI
            label="Issues"
            value={String(summary.exceeded_count + summary.alert_count)}
            sub={`${summary.exceeded_count} exceeded, ${summary.alert_count} alerts`}
          />
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-700" />
          ))}
        </div>
      ) : budgets.length === 0 ? (
        <div className="py-20 text-center text-gray-500 dark:text-gray-400">No budgets found.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {budgets.map((b) => (
            <BudgetCard key={b.id} budget={b} />
          ))}
        </div>
      )}
    </div>
  );
}
