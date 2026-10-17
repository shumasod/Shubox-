import React from 'react';
import { useQuery } from '@tanstack/react-query';

interface BudgetSummary {
  id: number;
  name: string;
  budget_type: string;
  amount: number;
  spent_amount: number;
  currency: string;
  period_end: string;
  utilization_percent: number;
  alert_threshold: number;
}

interface BudgetSummaryResponse {
  data: BudgetSummary[];
}

function formatCurrency(amount: number, currency = 'JPY') {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function utilColor(pct: number, threshold: number): string {
  if (pct >= 100) return 'fill-red-500 dark:fill-red-400';
  if (pct >= threshold) return 'fill-amber-400 dark:fill-amber-300';
  return 'fill-blue-500 dark:fill-blue-400';
}

function utilTextColor(pct: number, threshold: number): string {
  if (pct >= 100) return 'text-red-600 dark:text-red-400';
  if (pct >= threshold) return 'text-amber-600 dark:text-amber-400';
  return 'text-blue-600 dark:text-blue-400';
}

const BAR_HEIGHT = 14;
const BAR_Y = 4;
const CHART_WIDTH = 240;

interface BarProps {
  budget: BudgetSummary;
}

function BudgetBar({ budget }: BarProps) {
  const pct = Math.min(budget.utilization_percent, 100);
  const overBudget = budget.utilization_percent > 100;
  const nearThreshold = budget.utilization_percent >= budget.alert_threshold && !overBudget;
  const filledWidth = (pct / 100) * CHART_WIDTH;
  const thresholdX = (budget.alert_threshold / 100) * CHART_WIDTH;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {overBudget && (
            <svg className="w-3.5 h-3.5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{budget.name}</p>
        </div>
        <span className={`text-xs font-bold tabular-nums flex-shrink-0 ${utilTextColor(budget.utilization_percent, budget.alert_threshold)}`}>
          {budget.utilization_percent.toFixed(1)}%
        </span>
      </div>

      {/* SVG progress bar */}
      <svg
        width="100%"
        height={BAR_HEIGHT + BAR_Y * 2}
        viewBox={`0 0 ${CHART_WIDTH} ${BAR_HEIGHT + BAR_Y * 2}`}
        preserveAspectRatio="none"
        aria-label={`${budget.name}: ${budget.utilization_percent.toFixed(1)}%`}
        role="progressbar"
        aria-valuenow={budget.utilization_percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {/* Track */}
        <rect
          x={0} y={BAR_Y}
          width={CHART_WIDTH} height={BAR_HEIGHT}
          rx={BAR_HEIGHT / 2}
          className="fill-gray-100 dark:fill-gray-700"
        />

        {/* Fill */}
        {filledWidth > 0 && (
          <rect
            x={0} y={BAR_Y}
            width={filledWidth} height={BAR_HEIGHT}
            rx={BAR_HEIGHT / 2}
            className={utilColor(budget.utilization_percent, budget.alert_threshold)}
          />
        )}

        {/* Threshold marker */}
        {thresholdX > 0 && thresholdX < CHART_WIDTH && (
          <line
            x1={thresholdX} y1={BAR_Y - 1}
            x2={thresholdX} y2={BAR_Y + BAR_HEIGHT + 1}
            stroke="currentColor"
            strokeWidth={1.5}
            className="text-amber-400 dark:text-amber-500"
            strokeDasharray="2 2"
          />
        )}

        {/* Over-budget overflow indicator */}
        {overBudget && (
          <rect
            x={CHART_WIDTH - BAR_HEIGHT} y={BAR_Y}
            width={BAR_HEIGHT} height={BAR_HEIGHT}
            rx={BAR_HEIGHT / 2}
            className="fill-red-600 dark:fill-red-500"
          />
        )}
      </svg>

      <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
        <span>{formatCurrency(budget.spent_amount, budget.currency)}</span>
        <span>{formatCurrency(budget.amount, budget.currency)}</span>
      </div>
    </div>
  );
}

interface BudgetUtilizationChartProps {
  budgetType?: 'department' | 'project' | 'category';
  limit?: number;
}

export function BudgetUtilizationChart({
  budgetType,
  limit = 10,
}: BudgetUtilizationChartProps) {
  const { data, isLoading } = useQuery<BudgetSummaryResponse>({
    queryKey: ['budgets-summary', budgetType],
    queryFn: () => {
      const params = new URLSearchParams({ per_page: String(limit) });
      if (budgetType) params.set('budget_type', budgetType);
      return fetch(`/api/budgets/summary?${params}`).then(r => r.json());
    },
  });

  const budgets = data?.data ?? [];
  const overBudgetCount = budgets.filter(b => b.utilization_percent >= 100).length;
  const alertCount = budgets.filter(b =>
    b.utilization_percent >= b.alert_threshold && b.utilization_percent < 100
  ).length;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-4 rounded bg-gray-100 dark:bg-gray-800 animate-pulse w-40" />
            <div className="h-5 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary pills */}
      {(overBudgetCount > 0 || alertCount > 0) && (
        <div className="flex items-center gap-2 flex-wrap">
          {overBudgetCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300">
              <span className="font-bold">{overBudgetCount}</span> 予算超過
            </span>
          )}
          {alertCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300">
              <span className="font-bold">{alertCount}</span> 警告
            </span>
          )}
        </div>
      )}

      {/* Bar chart */}
      <div className="space-y-4">
        {budgets.map(budget => (
          <BudgetBar key={budget.id} budget={budget} />
        ))}
      </div>

      {budgets.length === 0 && (
        <p className="text-sm text-center text-gray-400 py-6">予算が登録されていません</p>
      )}
    </div>
  );
}
