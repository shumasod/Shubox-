import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';

interface TrendPoint {
  period: string;
  amount: number;
  count: number;
}

interface CategoryBreakdown {
  category: string;
  amount: number;
  count: number;
  percentage: number;
  color: string;
}

interface DepartmentBreakdown {
  department: string;
  amount: number;
  budget: number | null;
  utilization: number | null;
}

interface AnalyticsData {
  trends: TrendPoint[];
  by_category: CategoryBreakdown[];
  by_department: DepartmentBreakdown[];
  total_amount: number;
  total_count: number;
  avg_amount: number;
  currency: string;
}

const PERIODS = [
  { label: '過去7日', value: '7d' },
  { label: '過去30日', value: '30d' },
  { label: '過去90日', value: '90d' },
  { label: '今年度', value: 'fiscal_year' },
] as const;
type Period = typeof PERIODS[number]['value'];

const fmt = (n: number, currency: string) =>
  new Intl.NumberFormat('ja-JP', { style: 'currency', currency, notation: 'compact' }).format(n);

const fmtFull = (n: number, currency: string) =>
  new Intl.NumberFormat('ja-JP', { style: 'currency', currency }).format(n);

// Inline SVG bar chart — no external dependencies
function TrendChart({ data, currency }: { data: TrendPoint[]; currency: string }) {
  if (!data.length) return null;
  const max = Math.max(...data.map(d => d.amount), 1);
  const BAR_W = 32;
  const GAP = 8;
  const HEIGHT = 120;
  const PADDING = 24;
  const width = data.length * (BAR_W + GAP) + PADDING * 2;

  return (
    <div className="overflow-x-auto">
      <svg
        width={width}
        height={HEIGHT + 48}
        aria-label="支出トレンドグラフ"
        role="img"
      >
        {data.map((d, i) => {
          const barH = Math.round((d.amount / max) * HEIGHT);
          const x = PADDING + i * (BAR_W + GAP);
          const y = HEIGHT - barH;
          return (
            <g key={d.period}>
              <title>{`${d.period}: ${fmtFull(d.amount, currency)}`}</title>
              <rect
                x={x}
                y={y}
                width={BAR_W}
                height={barH}
                rx={4}
                className="fill-blue-500 hover:fill-blue-600 transition-colors"
              />
              <text
                x={x + BAR_W / 2}
                y={HEIGHT + 16}
                textAnchor="middle"
                fontSize={10}
                className="fill-gray-500"
              >
                {d.period.slice(-5)}
              </text>
              {barH > 20 && (
                <text
                  x={x + BAR_W / 2}
                  y={y - 4}
                  textAnchor="middle"
                  fontSize={9}
                  className="fill-gray-700 dark:fill-gray-300"
                >
                  {fmt(d.amount, currency)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function DonutChart({ data }: { data: CategoryBreakdown[] }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const R = 60;
  const CX = 80;
  const CY = 80;

  let cumulative = 0;
  const slices = data.slice(0, 8).map(d => {
    const startAngle = cumulative * 360;
    cumulative += d.percentage / 100;
    const endAngle = cumulative * 360;
    return { ...d, startAngle, endAngle };
  });

  const polarToCartesian = (angle: number, r: number) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
  };

  const arc = (start: number, end: number, r: number) => {
    const s = polarToCartesian(start, r);
    const e = polarToCartesian(end, r);
    const large = end - start > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
  };

  return (
    <div className="flex flex-wrap items-center gap-6">
      <svg width={160} height={160} aria-label="カテゴリ別円グラフ" role="img">
        {slices.map(s => (
          <path
            key={s.category}
            d={`${arc(s.startAngle, s.endAngle, R)} L ${CX} ${CY} Z`}
            fill={s.color}
            opacity={hovered && hovered !== s.category ? 0.4 : 1}
            onMouseEnter={() => setHovered(s.category)}
            onMouseLeave={() => setHovered(null)}
            className="cursor-pointer transition-opacity"
          >
            <title>{`${s.category}: ${s.percentage.toFixed(1)}%`}</title>
          </path>
        ))}
        {/* Donut hole */}
        <circle cx={CX} cy={CY} r={R * 0.55} className="fill-white dark:fill-gray-900" />
      </svg>
      <ul className="space-y-1.5" role="list">
        {slices.map(s => (
          <li key={s.category} className="flex items-center gap-2 text-sm">
            <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: s.color }} />
            <span className="text-gray-700 dark:text-gray-300">{s.category}</span>
            <span className="ml-auto font-medium text-gray-900 dark:text-white">
              {s.percentage.toFixed(1)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DepartmentTable({ data, currency }: { data: DepartmentBreakdown[]; currency: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead>
          <tr>
            {['部門', '支出合計', '予算', '消化率'].map(h => (
              <th key={h} className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {data.map(d => (
            <tr key={d.department} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white">{d.department}</td>
              <td className="px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300">{fmtFull(d.amount, currency)}</td>
              <td className="px-4 py-2.5 text-sm text-gray-500">
                {d.budget !== null ? fmtFull(d.budget, currency) : '—'}
              </td>
              <td className="px-4 py-2.5">
                {d.utilization !== null ? (
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className={`h-full rounded-full ${
                          d.utilization >= 100
                            ? 'bg-red-500'
                            : d.utilization >= 80
                            ? 'bg-amber-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(d.utilization, 100)}%` }}
                      />
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        d.utilization >= 100
                          ? 'text-red-600 dark:text-red-400'
                          : d.utilization >= 80
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {d.utilization.toFixed(0)}%
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AnalyticsPage() {
  const [params, setParams] = useSearchParams();
  const period: Period = (params.get('period') as Period) ?? '30d';

  const { data, isLoading, isError } = useQuery<AnalyticsData>({
    queryKey: ['analytics', period],
    queryFn: async () => {
      const r = await fetch(`/api/analytics?period=${period}`);
      if (!r.ok) throw new Error('Failed to fetch analytics');
      return r.json();
    },
    staleTime: 5 * 60_000,
  });

  const currency = data?.currency ?? 'JPY';

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">分析レポート</h1>
        <div className="flex gap-1 rounded-lg border border-gray-200 p-1 dark:border-gray-700" role="radiogroup" aria-label="集計期間">
          {PERIODS.map(p => (
            <button
              key={p.value}
              role="radio"
              aria-checked={period === p.value}
              onClick={() => setParams({ period: p.value })}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                period === p.value
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI summary */}
      {isLoading ? (
        <div className="mt-6 grid grid-cols-3 gap-4">
          {[0, 1, 2].map(i => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
          ))}
        </div>
      ) : isError ? (
        <p className="mt-6 text-red-600">データの読み込みに失敗しました</p>
      ) : data ? (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { label: '合計支出', value: fmtFull(data.total_amount, currency) },
              { label: '申請件数', value: `${data.total_count.toLocaleString('ja-JP')}件` },
              { label: '平均金額', value: fmtFull(data.avg_amount, currency) },
            ].map(kpi => (
              <div key={kpi.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">{kpi.label}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{kpi.value}</p>
              </div>
            ))}
          </div>

          {/* Trend chart */}
          <section className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">支出トレンド</h2>
            <TrendChart data={data.trends} currency={currency} />
          </section>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Category donut */}
            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">カテゴリ別内訳</h2>
              <DonutChart data={data.by_category} />
            </section>

            {/* Department table */}
            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">部門別支出</h2>
              <DepartmentTable data={data.by_department} currency={currency} />
            </section>
          </div>
        </>
      ) : null}
    </div>
  );
}
