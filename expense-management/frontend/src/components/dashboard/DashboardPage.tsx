import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

interface MonthlyStat {
  month: number;
  year: number;
  total_amount: number;
  total_count: number;
}

interface CategoryStat {
  name: string;
  code: string;
  total_amount: number;
  expense_count: number;
}

interface ApprovalStat {
  avg_hours: number;
  approved_count: number;
}

const token = () => localStorage.getItem('token') ?? '';

async function fetchMonthly(year: number) {
  const res = await fetch(`/api/v1/reports/monthly?year=${year}`, {
    headers: { Authorization: `Bearer ${token()}` },
  });
  return res.json();
}

async function fetchByCategory() {
  const from = new Date();
  from.setDate(1);
  const res = await fetch(
    `/api/v1/reports/by-category?from=${from.toISOString().split('T')[0]}&to=${new Date().toISOString().split('T')[0]}`,
    { headers: { Authorization: `Bearer ${token()}` } },
  );
  return res.json();
}

async function fetchApprovalStats() {
  const res = await fetch('/api/v1/reports/approval-stats', {
    headers: { Authorization: `Bearer ${token()}` },
  });
  return res.json();
}

export function DashboardPage() {
  const year = new Date().getFullYear();
  const { data: monthly }  = useQuery({ queryKey: ['reports', 'monthly', year],  queryFn: () => fetchMonthly(year) });
  const { data: byCategory } = useQuery({ queryKey: ['reports', 'category'],         queryFn: fetchByCategory });
  const { data: approval }  = useQuery({ queryKey: ['reports', 'approval-stats'],  queryFn: fetchApprovalStats });

  const currentMonth = monthly?.data?.find((m: MonthlyStat) => m.month === new Date().getMonth() + 1);
  const approvalData: ApprovalStat = approval?.data ?? { avg_hours: 0, approved_count: 0 };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>

      {/* KPI カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="今月の申請総額"
          value={`¥${(currentMonth?.total_amount ?? 0).toLocaleString()}`}
          sub={`${currentMonth?.total_count ?? 0}件`}
          color="blue"
        />
        <StatCard
          label="今月の承認件数"
          value={`${approvalData.approved_count}件`}
          sub={`平均 ${approvalData.avg_hours}時間で承認`}
          color="green"
        />
        <StatCard
          label="カテゴリ別トップ"
          value={byCategory?.data?.[0]?.name ?? '-'}
          sub={byCategory?.data?.[0] ? `¥${byCategory.data[0].total_amount.toLocaleString()}` : '-'}
          color="purple"
        />
      </div>

      {/* 月次推移グラフ（数値テーブル） */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">{year}年 月次申請額推移</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                {Array.from({ length: 12 }, (_, i) => (
                  <th key={i} className="px-3 py-2 text-center font-medium text-gray-500">{i + 1}月</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {monthly?.data?.map((m: MonthlyStat) => (
                  <td key={m.month} className="px-3 py-2 text-center">
                    <div className="font-medium text-gray-900">¥{Math.round((m.total_amount || 0) / 1000)}k</div>
                    <div className="text-xs text-gray-400">{m.total_count}件</div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* カテゴリ別 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">今月のカテゴリ別申請額</h2>
        <div className="space-y-3">
          {byCategory?.data?.map((c: CategoryStat) => {
            const pct = byCategory.total > 0 ? Math.round((c.total_amount / byCategory.total) * 100) : 0;
            return (
              <div key={c.code}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700">{c.name}</span>
                  <span className="font-medium text-gray-900">¥{c.total_amount.toLocaleString()} ({pct}%)</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end">
        <Link to="/expenses" className="text-sm text-blue-600 hover:text-blue-800">
          経費申請一覧を見る →
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  label, value, sub, color,
}: { label: string; value: string; sub: string; color: 'blue' | 'green' | 'purple' }) {
  const colors = {
    blue:   'bg-blue-50 text-blue-700',
    green:  'bg-green-50 text-green-700',
    purple: 'bg-purple-50 text-purple-700',
  };
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${colors[color].split(' ')[1]}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  );
}
