import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

interface CategoryBreakdown {
  category: string;
  color: string;
  amount: number;
  count: number;
  pct: number;
}

interface MonthlyTrend {
  month: string;
  approved: number;
  rejected: number;
  pending: number;
}

interface AnalyticsData {
  total_amount: number;
  total_count: number;
  avg_amount: number;
  categories: CategoryBreakdown[];
  monthly_trends: MonthlyTrend[];
  top_vendors: { name: string; amount: number }[];
}

function formatJPY(n: number) {
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(n);
}

// Pure SVG donut chart
function DonutChart({ slices }: { slices: { color: string; pct: number; label: string }[] }) {
  const r = 60;
  const cx = 80;
  const cy = 80;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  return (
    <svg viewBox="0 0 160 160" className="h-40 w-40">
      {slices.map((s, i) => {
        const dash = (s.pct / 100) * circumference;
        const gap = circumference - dash;
        const rotate = (offset / 100) * 360 - 90;
        offset += s.pct;
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={24}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={0}
            transform={`rotate(${rotate} ${cx} ${cy})`}
          >
            <title>{s.label}: {s.pct.toFixed(1)}%</title>
          </circle>
        );
      })}
      <circle cx={cx} cy={cy} r={48} className="fill-white dark:fill-gray-800" />
    </svg>
  );
}

// Pure SVG stacked bar chart for monthly trends
function TrendChart({ data }: { data: MonthlyTrend[] }) {
  if (!data.length) return null;
  const maxTotal = Math.max(...data.map((d) => d.approved + d.rejected + d.pending));
  const W = 600;
  const H = 200;
  const PAD = { top: 10, right: 10, bottom: 40, left: 60 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;
  const barW = (chartW / data.length) * 0.6;
  const gap   = chartW / data.length;

  const scaleY = (v: number) => chartH - (v / (maxTotal || 1)) * chartH;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <g transform={`translate(${PAD.left},${PAD.top})`}>
        {/* Y gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <g key={t}>
            <line
              x1={0} y1={scaleY(maxTotal * t)}
              x2={chartW} y2={scaleY(maxTotal * t)}
              className="stroke-gray-200 dark:stroke-gray-700"
              strokeDasharray="4 4"
            />
            <text x={-6} y={scaleY(maxTotal * t) + 4} textAnchor="end"
              className="fill-gray-400 text-[10px]" fontSize={10}>
              {formatJPY(maxTotal * t)}
            </text>
          </g>
        ))}

        {data.map((d, i) => {
          const x = i * gap + gap / 2 - barW / 2;
          const approved = (d.approved / (maxTotal || 1)) * chartH;
          const rejected = (d.rejected / (maxTotal || 1)) * chartH;
          const pending  = (d.pending  / (maxTotal || 1)) * chartH;
          const yApproved = chartH - approved;
          const yRejected = yApproved - rejected;
          const yPending  = yRejected - pending;
          return (
            <g key={i}>
              {approved > 0 && <rect x={x} y={yApproved} width={barW} height={approved} fill="#10b981" rx={2} />}
              {rejected > 0 && <rect x={x} y={yRejected} width={barW} height={rejected} fill="#ef4444" rx={2} />}
              {pending  > 0 && <rect x={x} y={yPending}  width={barW} height={pending}  fill="#f59e0b" rx={2} />}
              <text x={x + barW / 2} y={chartH + 14} textAnchor="middle"
                className="fill-gray-500 dark:fill-gray-400" fontSize={10}>
                {d.month}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

export default function AnalyticsDashboard() {
  const [period, setPeriod] = useState('12m');

  const { data, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['analytics', period],
    queryFn: () =>
      fetch(`/api/analytics?period=${period}`).then((r) => r.json()),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Analytics</h1>
        <div className="flex rounded-xl border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800">
          {(['3m', '6m', '12m'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-700" />
          ))}
        </div>
      ) : data ? (
        <>
          {/* KPI row */}
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Total Spend', value: formatJPY(data.total_amount) },
              { label: 'Expenses Filed', value: data.total_count.toLocaleString() },
              { label: 'Avg per Expense', value: formatJPY(data.avg_amount) },
            ].map((kpi) => (
              <div key={kpi.label}
                className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400">{kpi.label}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{kpi.value}</p>
              </div>
            ))}
          </div>

          {/* Category breakdown */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 font-semibold text-gray-800 dark:text-gray-200">Spend by Category</h2>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <DonutChart
                slices={data.categories.map((c) => ({
                  color: c.color,
                  pct: c.pct,
                  label: c.category,
                }))}
              />
              <div className="flex-1 space-y-2">
                {data.categories.map((c) => (
                  <div key={c.category} className="flex items-center gap-2">
                    <span className="h-3 w-3 flex-shrink-0 rounded-full" style={{ background: c.color }} />
                    <span className="min-w-0 flex-1 truncate text-sm text-gray-700 dark:text-gray-300">{c.category}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatJPY(c.amount)}</span>
                    <span className="w-10 text-right text-xs text-gray-400">{c.pct.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Monthly trend */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-2 font-semibold text-gray-800 dark:text-gray-200">Monthly Trend</h2>
            <div className="mb-3 flex gap-4 text-xs">
              {[['#10b981','Approved'],['#ef4444','Rejected'],['#f59e0b','Pending']].map(([color, label]) => (
                <span key={label} className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
                  <span className="text-gray-600 dark:text-gray-400">{label}</span>
                </span>
              ))}
            </div>
            <TrendChart data={data.monthly_trends} />
          </div>

          {/* Top vendors */}
          {data.top_vendors.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 font-semibold text-gray-800 dark:text-gray-200">Top Vendors</h2>
              <div className="space-y-2">
                {data.top_vendors.map((v, i) => (
                  <div key={v.name} className="flex items-center gap-3">
                    <span className="w-5 text-center text-xs font-bold text-gray-400">{i + 1}</span>
                    <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{v.name}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatJPY(v.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
