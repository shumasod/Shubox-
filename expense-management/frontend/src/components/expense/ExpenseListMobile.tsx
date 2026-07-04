import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useExpenses } from '../../hooks/useExpenses';
import { MobileExpenseCard } from './MobileExpenseCard';
import type { ExpenseSearchParams } from '../../types/expense';

export function ExpenseListMobile() {
  const [params, setParams] = useState<ExpenseSearchParams>({
    page: 1,
    per_page: 10,
    sort_by: 'created_at',
    sort_dir: 'desc',
  });

  const { data, isLoading, isError } = useExpenses(params);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* トップバー */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-semibold text-gray-900">経費申請</h1>
          <Link
            to="/expenses/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700 active:bg-blue-800"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            新規申請
          </Link>
        </div>

        {/* ステータスフィルター */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
          {(['', 'draft', 'submitted', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() =>
                setParams((p) => ({ ...p, status: status || undefined, page: 1 }))
              }
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                (params.status ?? '') === status
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300'
              }`}
            >
              {status === '' && 'すべて'}
              {status === 'draft' && '下書き'}
              {status === 'submitted' && '申請中'}
              {status === 'approved' && '承認済'}
              {status === 'rejected' && '却下'}
            </button>
          ))}
        </div>
      </div>

      {/* リスト */}
      <div className="flex-1 p-4 space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 bg-white rounded-lg border border-gray-200 animate-pulse" />
          ))
        ) : isError ? (
          <p className="text-center text-sm text-red-500 py-8">データの取得に失敗しました</p>
        ) : data?.data.length === 0 ? (
          <p className="text-center text-sm text-gray-500 py-12">申請データがありません</p>
        ) : (
          data?.data.map((expense) => (
            <MobileExpenseCard key={expense.id} expense={expense} />
          ))
        )}
      </div>

      {/* ページネーション */}
      {data && data.meta.last_page > 1 && (
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3 flex justify-between items-center">
          <button
            onClick={() => setParams((p) => ({ ...p, page: (p.page ?? 1) - 1 }))}
            disabled={data.meta.current_page === 1}
            className="px-4 py-2 text-sm border rounded-lg disabled:opacity-40"
          >
            ← 前へ
          </button>
          <span className="text-sm text-gray-500">
            {data.meta.current_page} / {data.meta.last_page}
          </span>
          <button
            onClick={() => setParams((p) => ({ ...p, page: (p.page ?? 1) + 1 }))}
            disabled={data.meta.current_page === data.meta.last_page}
            className="px-4 py-2 text-sm border rounded-lg disabled:opacity-40"
          >
            次へ →
          </button>
        </div>
      )}
    </div>
  );
}
