import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { categoryApi } from '../../lib/api';
import type { ExpenseSearchParams } from '../../types/expense';
import { STATUS_LABELS, type ExpenseStatus } from '../../types/expense';

interface Props {
  onSearch: (params: ExpenseSearchParams) => void;
  defaultParams?: ExpenseSearchParams;
}

interface SearchForm {
  keyword:      string;
  status:       string;
  category_id:  string;
  date_from:    string;
  date_to:      string;
  amount_min:   string;
  amount_max:   string;
  sort_by:      'created_at' | 'total_amount' | 'applied_at';
  sort_dir:     'asc' | 'desc';
}

export function AdvancedSearchDrawer({ onSearch, defaultParams }: Props) {
  const [open, setOpen] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn:  categoryApi.list,
  });

  const { register, handleSubmit, reset } = useForm<SearchForm>({
    defaultValues: {
      keyword:     defaultParams?.keyword ?? '',
      status:      defaultParams?.status  ?? '',
      category_id: '',
      date_from:   defaultParams?.date_from ?? '',
      date_to:     defaultParams?.date_to   ?? '',
      amount_min:  '',
      amount_max:  '',
      sort_by:     'created_at',
      sort_dir:    'desc',
    },
  });

  const onSubmit = (data: SearchForm) => {
    onSearch({
      page:        1,
      per_page:    20,
      keyword:     data.keyword     || undefined,
      status:      (data.status as ExpenseStatus) || undefined,
      date_from:   data.date_from   || undefined,
      date_to:     data.date_to     || undefined,
      sort_by:     data.sort_by,
      sort_dir:    data.sort_dir,
    });
    setOpen(false);
  };

  const handleReset = () => {
    reset();
    onSearch({ page: 1, per_page: 20, sort_by: 'created_at', sort_dir: 'desc' });
  };

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50"
      >
        <FilterIcon />
        詳細検索
        {open ? <ChevronUpIcon /> : <ChevronDownIcon />}
      </button>

      {open && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-3 bg-white border border-gray-200 rounded-lg p-5 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* キーワード */}
            <div className="md:col-span-3">
              <label className="block text-xs font-medium text-gray-600 mb-1">キーワード</label>
              <input
                type="text"
                {...register('keyword')}
                placeholder="件名・説明で検索"
                className="w-full text-sm rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* ステータス */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">ステータス</label>
              <select
                {...register('status')}
                className="w-full text-sm rounded-md border border-gray-300 px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">すべて</option>
                {(Object.entries(STATUS_LABELS) as [ExpenseStatus, string][]).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>

            {/* カテゴリ */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">カテゴリ</label>
              <select
                {...register('category_id')}
                className="w-full text-sm rounded-md border border-gray-300 px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">すべて</option>
                {categories.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* ソート */}
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 mb-1">ソート項目</label>
                <select
                  {...register('sort_by')}
                  className="w-full text-sm rounded-md border border-gray-300 px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="created_at">申請日</option>
                  <option value="total_amount">金額</option>
                  <option value="applied_at">提出日</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 mb-1">順</label>
                <select
                  {...register('sort_dir')}
                  className="w-full text-sm rounded-md border border-gray-300 px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="desc">降順</option>
                  <option value="asc">昇順</option>
                </select>
              </div>
            </div>

            {/* 日付範囲 */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">申請日 開始</label>
              <input type="date" {...register('date_from')}
                className="w-full text-sm rounded-md border border-gray-300 px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">申請日 終了</label>
              <input type="date" {...register('date_to')}
                className="w-full text-sm rounded-md border border-gray-300 px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
              検索
            </button>
            <button type="button" onClick={handleReset}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              リセット
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function FilterIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
    </svg>
  );
}
function ChevronDownIcon() {
  return <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;
}
function ChevronUpIcon() {
  return <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>;
}
