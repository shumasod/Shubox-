import React from 'react';
import { Link } from 'react-router-dom';
import { useExpenses } from '../../hooks/useExpenses';
import { STATUS_COLORS } from '../../types/expense';

/**
 * 承認者向けダッシュボード
 * 自分が承認すべき申請一覧を表示
 */
export function ApprovalDashboard() {
  const { data: pendingData, isLoading: pendingLoading } = useExpenses({
    status: 'pending',
    per_page: 50,
  });

  const { data: partialData } = useExpenses({
    status: 'partially_approved',
    per_page: 50,
  });

  const pendingCount = (pendingData?.meta.total ?? 0) + (partialData?.meta.total ?? 0);
  const allPending = [
    ...(pendingData?.data ?? []),
    ...(partialData?.data ?? []),
  ].sort((a, b) => (a.applied_at ?? '').localeCompare(b.applied_at ?? ''));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">承認ダッシュボード</h1>
        {pendingCount > 0 && (
          <span className="inline-flex items-center justify-center w-7 h-7 bg-red-500 text-white text-sm font-bold rounded-full">
            {pendingCount > 99 ? '99+' : pendingCount}
          </span>
        )}
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="承認待ち"
          value={pendingData?.meta.total ?? 0}
          color="blue"
          icon={<ClockIcon />}
        />
        <StatCard
          title="一部承認"
          value={partialData?.meta.total ?? 0}
          color="yellow"
          icon={<HalfCheckIcon />}
        />
        <StatCard
          title="合計承認待ち金額"
          value={'¥' + allPending.reduce((s, e) => s + e.total_amount, 0).toLocaleString()}
          color="green"
          icon={<MoneyIcon />}
        />
      </div>

      {/* 承認待ち一覧 */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">承認待ちの申請</h2>
        </div>

        {pendingLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
          </div>
        ) : allPending.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
            承認待ちの申請はありません
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {allPending.map((expense) => (
              <div key={expense.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[expense.status]}`}>
                        {expense.status === 'pending' ? '承認待ち' : '一部承認'}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">{expense.expense_number}</span>
                      {isUrgent(expense.applied_at) && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700">
                          ⚠ 3日以上経過
                        </span>
                      )}
                    </div>
                    <Link
                      to={`/expenses/${expense.id}`}
                      className="text-sm font-medium text-gray-900 hover:text-blue-600"
                    >
                      {expense.title}
                    </Link>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500">
                        申請者: {expense.applicant?.name}
                        {expense.applicant?.department && ` (${expense.applicant.department})`}
                      </span>
                      <span className="text-xs text-gray-500">
                        申請日: {expense.applied_at
                          ? new Date(expense.applied_at).toLocaleDateString('ja-JP')
                          : '-'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    <span className="text-sm font-semibold text-gray-900">
                      {expense.total_amount_formatted}
                    </span>
                    <Link
                      to={`/expenses/${expense.id}`}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 whitespace-nowrap"
                    >
                      確認・承認
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function isUrgent(appliedAt: string | null): boolean {
  if (!appliedAt) return false;
  const days = (Date.now() - new Date(appliedAt).getTime()) / (1000 * 60 * 60 * 24);
  return days >= 3;
}

interface StatCardProps {
  title: string;
  value: number | string;
  color: 'blue' | 'yellow' | 'green';
  icon: React.ReactNode;
}

function StatCard({ title, value, color, icon }: StatCardProps) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    green: 'bg-green-50 text-green-700',
  };

  return (
    <div className={`rounded-lg ${colors[color]} p-5`}>
      <div className="flex items-center gap-3">
        <div className="opacity-70">{icon}</div>
        <div>
          <p className="text-xs font-medium opacity-70">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}

function ClockIcon() {
  return (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function HalfCheckIcon() {
  return (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  );
}

function MoneyIcon() {
  return (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
