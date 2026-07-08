import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  sub?: string;
  trend?: number;
  icon?: React.ReactNode;
  color?: 'indigo' | 'green' | 'yellow' | 'red' | 'teal';
  loading?: boolean;
}

const COLOR_MAP = {
  indigo: { bg: 'bg-indigo-50 dark:bg-indigo-900/20', icon: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-100 dark:border-indigo-800' },
  green:  { bg: 'bg-green-50 dark:bg-green-900/20',   icon: 'text-green-600 dark:text-green-400',   border: 'border-green-100 dark:border-green-800' },
  yellow: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', icon: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-100 dark:border-yellow-800' },
  red:    { bg: 'bg-red-50 dark:bg-red-900/20',       icon: 'text-red-600 dark:text-red-400',       border: 'border-red-100 dark:border-red-800' },
  teal:   { bg: 'bg-teal-50 dark:bg-teal-900/20',     icon: 'text-teal-600 dark:text-teal-400',     border: 'border-teal-100 dark:border-teal-800' },
};

function TrendBadge({ pct }: { pct: number }) {
  const up = pct >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-full ${
      up ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
         : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    }`}>
      {up ? '+' : ''}{pct.toFixed(1)}%
    </span>
  );
}

export default function StatCard({
  title, value, sub, trend, icon, color = 'indigo', loading = false,
}: StatCardProps) {
  const c = COLOR_MAP[color];

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 border border-gray-100 dark:border-gray-700 animate-pulse">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-3" />
        <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-32" />
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow p-5 border ${c.border} flex flex-col gap-3`}>
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{title}</p>
        {icon && (
          <span className={`p-2 rounded-lg ${c.bg} ${c.icon}`}>{icon}</span>
        )}
      </div>
      <div className="flex items-end gap-3">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">{value}</span>
        {trend !== undefined && <TrendBadge pct={trend} />}
      </div>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  );
}
