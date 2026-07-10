import React, { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

interface KpiData {
  total_spend_mtd:     number;
  total_spend_ytd:     number;
  pending_count:       number;
  pending_amount:      number;
  approved_count:      number;
  rejected_count:      number;
  rejection_rate:      number;
  avg_approval_days:   number;
  currency:            string;
}

const useCountUp = (target: number, duration = 800): number => {
  const [value, setValue] = React.useState(0);
  const frame = useRef<number>(0);
  const start = useRef<number>(0);

  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    const animate = (ts: number) => {
      if (!start.current) start.current = ts;
      const progress = Math.min((ts - start.current) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(ease * target));
      if (progress < 1) frame.current = requestAnimationFrame(animate);
    };
    frame.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame.current);
  }, [target, duration]);

  return value;
};

const formatCurrency = (amount: number, currency = 'JPY') =>
  new Intl.NumberFormat('ja-JP', { style: 'currency', currency }).format(amount / 100);

interface WidgetProps {
  label:     string;
  value:     string | number;
  sublabel?: string;
  trend?:    'up' | 'down' | 'neutral';
  color?:    string;
}

const Widget: React.FC<WidgetProps> = ({ label, value, sublabel, trend, color = 'indigo' }) => {
  const colorMap: Record<string, string> = {
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800',
    green:  'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    red:    'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
  };

  const trendIcon = trend === 'up' ? '(+)' : trend === 'down' ? '(-)' : null;
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-500' : '';

  return (
    <div className={`rounded-xl border p-5 ${colorMap[color] ?? colorMap.indigo}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
      {sublabel && (
        <p className={`mt-1 text-sm ${trendColor || 'text-gray-500'}`}>
          {trendIcon && <span className="mr-1">{trendIcon}</span>}{sublabel}
        </p>
      )}
    </div>
  );
};

export const DashboardWidgets: React.FC = () => {
  const { data, isLoading } = useQuery<KpiData>({
    queryKey: ['dashboard-kpi'],
    queryFn: () => api.get('/dashboard/kpi').then(r => r.data),
    refetchInterval: 60_000,
  });

  const pendingCount   = useCountUp(data?.pending_count   ?? 0);
  const approvedCount  = useCountUp(data?.approved_count  ?? 0);
  const rejectedCount  = useCountUp(data?.rejected_count  ?? 0);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <Widget
        label="Spend (MTD)"
        value={formatCurrency(data.total_spend_mtd, data.currency)}
        sublabel="This month"
        color="indigo"
      />
      <Widget
        label="Spend (YTD)"
        value={formatCurrency(data.total_spend_ytd, data.currency)}
        sublabel="This year"
        color="indigo"
      />
      <Widget
        label="Pending Approval"
        value={pendingCount}
        sublabel={formatCurrency(data.pending_amount, data.currency)}
        color="yellow"
      />
      <Widget
        label="Approved"
        value={approvedCount}
        sublabel="Total approved"
        color="green"
      />
      <Widget
        label="Rejected"
        value={rejectedCount}
        sublabel="Total rejected"
        color="red"
      />
      <Widget
        label="Rejection Rate"
        value={`${data.rejection_rate.toFixed(1)}%`}
        sublabel="of submitted"
        trend={data.rejection_rate > 15 ? 'down' : 'neutral'}
        color={data.rejection_rate > 15 ? 'red' : 'green'}
      />
      <Widget
        label="Avg. Approval Time"
        value={`${data.avg_approval_days.toFixed(1)}d`}
        sublabel="Days to decision"
        color="indigo"
      />
    </div>
  );
};
