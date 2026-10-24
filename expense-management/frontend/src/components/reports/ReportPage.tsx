import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api';

interface MonthlyData {
  month: string;
  total: number;
  count: number;
}

interface CategoryData {
  category_name: string;
  total: number;
  percentage: number;
}

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];

function BarChart({ data }: { data: MonthlyData[] }) {
  const max = Math.max(...data.map(d => d.total), 1);
  const width = 600;
  const height = 200;
  const barWidth = Math.floor((width - 40) / data.length) - 4;

  return (
    <svg viewBox={`0 0 ${width} ${height + 40}`} className="w-full">
      {data.map((d, i) => {
        const barHeight = (d.total / max) * height;
        const x = 20 + i * (barWidth + 4);
        const y = height - barHeight;
        return (
          <g key={d.month}>
            <rect x={x} y={y} width={barWidth} height={barHeight} fill={COLORS[0]} rx={3} />
            <text x={x + barWidth / 2} y={height + 14} textAnchor="middle" fontSize={9} fill="#6b7280">
              {d.month.slice(5)}
            </text>
            <text x={x + barWidth / 2} y={y - 4} textAnchor="middle" fontSize={8} fill="#374151">
              {d.total >= 10000 ? `${Math.round(d.total / 1000)}k` : d.total}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function DonutChart({ data }: { data: CategoryData[] }) {
  const cx = 80;
  const cy = 80;
  const r = 60;
  const innerR = 36;
  let cumAngle = -Math.PI / 2;

  const slices = data.slice(0, 7).map((d, i) => {
    const angle = (d.percentage / 100) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(cumAngle);
    const y1 = cy + r * Math.sin(cumAngle);
    cumAngle += angle;
    const x2 = cx + r * Math.cos(cumAngle);
    const y2 = cy + r * Math.sin(cumAngle);
    const ix1 = cx + innerR * Math.cos(cumAngle);
    const iy1 = cy + innerR * Math.sin(cumAngle);
    const ix2 = cx + innerR * Math.cos(cumAngle - angle);
    const iy2 = cy + innerR * Math.sin(cumAngle - angle);
    const large = angle > Math.PI ? 1 : 0;
    return (
      <path
        key={d.category_name}
        d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${large} 0 ${ix2} ${iy2} Z`}
        fill={COLORS[i % COLORS.length]}
      />
    );
  });

  return (
    <div className="flex items-start gap-4">
      <svg viewBox="0 0 160 160" className="w-40 flex-shrink-0">{slices}</svg>
      <div className="space-y-1 pt-2">
        {data.slice(0, 7).map((d, i) => (
          <div key={d.category_name} className="flex items-center gap-2 text-xs">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ background: COLORS[i % COLORS.length] }} />
            <span className="text-gray-700 dark:text-gray-300">{d.category_name}</span>
            <span className="text-gray-500">{d.percentage.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ReportPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);

  const { data: monthly, isLoading: loadingMonthly } = useQuery({
    queryKey: ['report-monthly', year],
    queryFn: () => apiClient.get(`/api/v1/reports/monthly?year=${year}`).then(r => r.data.data as MonthlyData[]),
  });

  const { data: byCategory, isLoading: loadingCat } = useQuery({
    queryKey: ['report-category', year],
    queryFn: () => apiClient.get(`/api/v1/reports/by-category?year=${year}`).then(r => r.data.data as CategoryData[]),
  });

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">レポート</h1>
        <select
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          className="border rounded px-3 py-1 text-sm dark:bg-gray-800 dark:border-gray-600"
        >
          {[currentYear, currentYear - 1, currentYear - 2].map(y => (
            <option key={y} value={y}>{y}年</option>
          ))}
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
        <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">月別経費推移</h2>
        {loadingMonthly ? (
          <div className="h-40 flex items-center justify-center text-gray-400 text-sm">読み込み中...</div>
        ) : monthly && monthly.length > 0 ? (
          <BarChart data={monthly} />
        ) : (
          <p className="text-sm text-gray-400 text-center py-8">データなし</p>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
        <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">カテゴリ別内訳</h2>
        {loadingCat ? (
          <div className="h-32 flex items-center justify-center text-gray-400 text-sm">読み込み中...</div>
        ) : byCategory && byCategory.length > 0 ? (
          <DonutChart data={byCategory} />
        ) : (
          <p className="text-sm text-gray-400 text-center py-8">データなし</p>
        )}
      </div>
    </div>
  );
}
