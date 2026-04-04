import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useExpenses } from '../../hooks/useExpenses';
import { expenseApi } from '../../lib/api';
import {
  STATUS_LABELS,
  STATUS_COLORS,
  type ExpenseStatus,
  type ExpenseSearchParams,
} from '../../types/expense';

export function ExpenseList() {
  const [params, setParams] = useState<ExpenseSearchParams>({
    page: 1,
    per_page: 20,
    sort_by: 'created_at',
    sort_dir: 'desc',
  });

  const { data, isLoading, isError } = useExpenses(params);

  const handleFilterChange = (key: keyof ExpenseSearchParams, value: string) => {
    setParams((prev) => ({ ...prev, [key]: value || undefined, page: 1 }));
  };

  const handleExport = () => expenseApi.exportCsv(params);

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">経費申請一覧</h1>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <DownloadIcon />
            CSVエクスポート
          </button>
          <Link
            to="/expenses/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            <PlusIcon />
            新規申請
          </Link>
        </div>
      </div>

      {/* フィルター */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* ステータス */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">ステータス</label>
            <select
              value={params.status ?? ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full text-sm rounded-md border border-gray-300 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">すべて</option>
              {(Object.entries(STATUS_LABELS) as [ExpenseStatus, string][]).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {/* 申請日（開始） */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">申請日（開始）</label>
            <input
              type="date"
              value={params.date_from ?? ''}
              onChange={(e) => handleFilterChange('date_from', e.target.value)}
              className="w-full text-sm rounded-md border border-gray-300 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 申請日（終了） */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">申請日（終了）</label>
            <input
              type="date"
              value={params.date_to ?? ''}
              onChange={(e) => handleFilterChange('date_to', e.target.value)}
              className="w-full text-sm rounded-md border border-gray-300 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* キーワード */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">キーワード</label>
            <input
              type="text"
              placeholder="件名・説明で検索"
              value={params.keyword ?? ''}
              onChange={(e) => handleFilterChange('keyword', e.target.value)}
              className="w-full text-sm rounded-md border border-gray-300 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* テーブル */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center h-48 text-red-500">
            データの取得に失敗しました
          </div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">申請番号</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">件名</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">申請者</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">金額</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ステータス</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">申請日</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data?.data.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono text-gray-600">
                      {expense.expense_number}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/expenses/${expense.id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        {expense.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div>{expense.applicant?.name ?? '-'}</div>
                      {expense.applicant?.department && (
                        <div className="text-xs text-gray-400">{expense.applicant.department}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                      {expense.total_amount_formatted}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          STATUS_COLORS[expense.status]
                        }`}
                      >
                        {expense.status_label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {expense.applied_at
                        ? new Date(expense.applied_at).toLocaleDateString('ja-JP')
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/expenses/${expense.id}`}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        詳細 →
                      </Link>
                    </td>
                  </tr>
                ))}
                {data?.data.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-500">
                      申請データがありません
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* ページネーション */}
            {data && data.meta.last_page > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <p className="text-sm text-gray-600">
                  全{data.meta.total}件中{' '}
                  {(data.meta.current_page - 1) * data.meta.per_page + 1}〜
                  {Math.min(data.meta.current_page * data.meta.per_page, data.meta.total)}件
                </p>
                <div className="flex gap-1">
                  <button
                    onClick={() => setParams((p) => ({ ...p, page: (p.page ?? 1) - 1 }))}
                    disabled={data.meta.current_page === 1}
                    className="px-3 py-1 text-sm border rounded disabled:opacity-40 hover:bg-gray-50"
                  >
                    前へ
                  </button>
                  {Array.from({ length: Math.min(data.meta.last_page, 7) }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setParams((prev) => ({ ...prev, page: p }))}
                      className={`px-3 py-1 text-sm border rounded ${
                        p === data.meta.current_page
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setParams((p) => ({ ...p, page: (p.page ?? 1) + 1 }))}
                    disabled={data.meta.current_page === data.meta.last_page}
                    className="px-3 py-1 text-sm border rounded disabled:opacity-40 hover:bg-gray-50"
                  >
                    次へ
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}
