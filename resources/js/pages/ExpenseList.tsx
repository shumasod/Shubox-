import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { DataTable, ColumnDef, PaginationMeta } from '../components/DataTable';

interface Expense {
  id: number;
  title: string;
  amount: number;
  currency: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  category: string;
  submitted_at: string | null;
  created_at: string;
  submitted_by: { id: number; name: string } | null;
}

interface ExpensePage {
  data: Expense[];
  meta: PaginationMeta;
}

const STATUS_OPTIONS = ['', 'draft', 'submitted', 'approved', 'rejected'] as const;
const STATUS_LABELS: Record<string, string> = {
  '': 'すべて',
  draft: '下書き',
  submitted: '承認中',
  approved: '承認済',
  rejected: '却下',
};

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  submitted: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  approved: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

function formatCurrency(amount: number, currency = 'JPY') {
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency }).format(amount);
}

export default function ExpenseList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const page = Number(searchParams.get('page') ?? '1');
  const search = searchParams.get('search') ?? '';
  const status = searchParams.get('status') ?? '';
  const sortKey = searchParams.get('sort') ?? 'created_at';
  const sortDir = (searchParams.get('dir') ?? 'desc') as 'asc' | 'desc';

  function updateParam(key: string, value: string) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      if (key !== 'page') next.delete('page');
      return next;
    });
    setSelected(new Set());
  }

  const { data, isLoading } = useQuery<ExpensePage>({
    queryKey: ['expenses', page, search, status, sortKey, sortDir],
    queryFn: () => {
      const params = new URLSearchParams({
        page: String(page),
        per_page: '20',
        sort: sortKey,
        direction: sortDir,
      });
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      return fetch(`/api/expenses?${params}`).then(r => r.json());
    },
    placeholderData: prev => prev,
  });

  const columns: ColumnDef<Expense>[] = [
    {
      key: 'select',
      header: '',
      accessor: row => (
        <input
          type="checkbox"
          checked={selected.has(row.id)}
          onChange={e => {
            setSelected(prev => {
              const next = new Set(prev);
              e.target.checked ? next.add(row.id) : next.delete(row.id);
              return next;
            });
          }}
          className="w-4 h-4 rounded border-gray-300 text-blue-600"
          aria-label={`選択: ${row.title}`}
        />
      ),
      className: 'w-10',
    },
    {
      key: 'title',
      header: '項目名',
      sortable: true,
      accessor: row => (
        <Link
          to={`/expenses/${row.id}`}
          className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
        >
          {row.title}
        </Link>
      ),
    },
    {
      key: 'amount',
      header: '金額',
      sortable: true,
      className: 'tabular-nums text-right',
      headerClassName: 'text-right',
      accessor: row => formatCurrency(row.amount, row.currency),
    },
    {
      key: 'category',
      header: 'カテゴリ',
      sortable: true,
      accessor: row => row.category,
    },
    {
      key: 'status',
      header: 'ステータス',
      accessor: row => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[row.status]}`}>
          {STATUS_LABELS[row.status] ?? row.status}
        </span>
      ),
    },
    {
      key: 'submitted_by',
      header: '申請者',
      accessor: row => row.submitted_by?.name ?? '—',
    },
    {
      key: 'submitted_at',
      header: '申請日',
      sortable: true,
      accessor: row =>
        row.submitted_at
          ? new Date(row.submitted_at).toLocaleDateString('ja-JP')
          : '—',
    },
  ];

  const allIds = data?.data.map(e => e.id) ?? [];
  const allSelected = allIds.length > 0 && allIds.every(id => selected.has(id));

  const handleSelectAll = useCallback(() => {
    setSelected(prev => {
      if (allSelected) return new Set();
      return new Set([...prev, ...allIds]);
    });
  }, [allIds, allSelected]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">経費一覧</h1>
        <Link
          to="/expenses/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新規申請
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
          </svg>
          <input
            type="search"
            placeholder="タイトルで検索..."
            value={search}
            onChange={e => updateParam('search', e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400"
          />
        </div>

        <select
          value={status}
          onChange={e => updateParam('status', e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200"
        >
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-4 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
          <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
            {selected.size}件選択中
          </span>
          <button
            onClick={() => fetch('/api/expenses/bulk', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'export', ids: [...selected] }),
            })}
            className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm font-medium hover:bg-gray-50"
          >
            エクスポート
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="ml-auto text-sm text-gray-500 hover:text-gray-700"
          >
            選択解除
          </button>
        </div>
      )}

      {/* Select all checkbox row */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="select-all"
          checked={allSelected}
          onChange={handleSelectAll}
          className="w-4 h-4 rounded border-gray-300 text-blue-600"
        />
        <label htmlFor="select-all" className="text-sm text-gray-500 dark:text-gray-400">
          このページをすべて選択
        </label>
        {data?.meta && (
          <span className="ml-auto text-xs text-gray-400">
            全 {data.meta.total} 件
          </span>
        )}
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        keyExtractor={r => r.id}
        pagination={data?.meta}
        onPageChange={p => updateParam('page', String(p))}
        sortKey={sortKey}
        sortDirection={sortDir}
        onSortChange={(key, dir) => {
          setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            next.set('sort', key);
            next.set('dir', dir);
            next.delete('page');
            return next;
          });
        }}
        isLoading={isLoading}
        emptyMessage="経費申請がありません"
        stickyHeader
        caption="経費一覧"
      />
    </div>
  );
}
