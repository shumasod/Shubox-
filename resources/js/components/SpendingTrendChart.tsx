import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

interface MonthlyData {
  month:    string;
  label:    string;
  amount:   number;
  currency: string;
}

const formatCurrency = (amount: number, currency = 'JPY') =>
  new Intl.NumberFormat('ja-JP', { style: 'currency', currency, notation: 'compact' }).format(amount / 100);

const CHART_H  = 160;
const BAR_GAP  = 8;

interface TooltipState { x: number; y: number; data: MonthlyData } | null;

export const SpendingTrendChart: React.FC<{ months?: number }> = ({ months = 12 }) => {
  const { data: raw = [], isLoading } = useQuery<MonthlyData[]>({
    queryKey: ['spending-trend', months],
    queryFn: () => api.get('/reports/monthly', { params: { months } }).then(r => r.data.data),
    staleTime: 5 * 60_000,
  });

  const [tooltip, setTooltip] = React.useState<{ x: number; y: number; data: MonthlyData } | null>(null);

  const { bars, maxAmount, viewBox } = useMemo(() => {
    if (!raw.length) return { bars: [], maxAmount: 0, viewBox: '0 0 400 160' };
    const maxAmount = Math.max(...raw.map(d => d.amount), 1);
    const totalW    = 400;
    const barW      = Math.max(1, (totalW - BAR_GAP * (raw.length - 1)) / raw.length);
    const bars      = raw.map((d, i) => ({
      x:      i * (barW + BAR_GAP),
      y:      CHART_H - (d.amount / maxAmount) * CHART_H,
      w:      barW,
      h:      (d.amount / maxAmount) * CHART_H,
      data:   d,
    }));
    return { bars, maxAmount, viewBox: `0 0 ${totalW} ${CHART_H}` };
  }, [raw]);

  if (isLoading) {
    return <div className="h-48 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />;
  }

  if (!raw.length) {
    return <p className="text-sm text-gray-400 text-center py-8">No spending data yet.</p>;
  }

  const currency = raw[0]?.currency ?? 'JPY';

  return (
    <div className="space-y-2">
      <div className="relative">
        <svg
          viewBox={viewBox}
          className="w-full overflow-visible"
          style={{ height: CHART_H }}
          onMouseLeave={() => setTooltip(null)}
          role="img"
          aria-label="Monthly spending trend"
        >
          {/* Grid lines */}
          {[0.25, 0.5, 0.75, 1].map(pct => (
            <line
              key={pct}
              x1={0} y1={CHART_H - CHART_H * pct}
              x2={400} y2={CHART_H - CHART_H * pct}
              stroke="currentColor"
              strokeWidth={0.5}
              className="text-gray-200 dark:text-gray-700"
              strokeDasharray="4 4"
            />
          ))}

          {/* Bars */}
          {bars.map((bar, i) => (
            <g key={i} className="group cursor-pointer">
              <rect
                x={bar.x} y={bar.y}
                width={bar.w} height={bar.h}
                rx={3}
                className="fill-indigo-500 hover:fill-indigo-600 dark:fill-indigo-400 dark:hover:fill-indigo-300 transition-colors"
                onMouseEnter={e => {
                  const svg  = (e.target as SVGElement).closest('svg')!;
                  const rect = svg.getBoundingClientRect();
                  const scaleX = rect.width / 400;
                  setTooltip({
                    x: bar.x * scaleX + (bar.w * scaleX) / 2,
                    y: bar.y * (rect.height / CHART_H) - 8,
                    data: bar.data,
                  });
                }}
              />
            </g>
          ))}
        </svg>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="absolute pointer-events-none bg-gray-900 text-white text-xs rounded-lg px-2 py-1.5 shadow-lg -translate-x-1/2 -translate-y-full"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            <div className="font-semibold">{tooltip.data.label}</div>
            <div>{formatCurrency(tooltip.data.amount, currency)}</div>
          </div>
        )}
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between text-[10px] text-gray-400 font-medium">
        {raw.map((d, i) => (
          <span key={i} className="text-center" style={{ width: `${100 / raw.length}%` }}>
            {d.label}
          </span>
        ))}
      </div>

      {/* Y-axis max label */}
      <p className="text-[10px] text-gray-400 text-right">
        Max: {formatCurrency(maxAmount, currency)}
      </p>
    </div>
  );
};
