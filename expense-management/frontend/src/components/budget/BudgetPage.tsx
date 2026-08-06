import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiClient } from '../../lib/api';

interface Budget {
  id: number;
  fiscal_year: number;
  department_id: number | null;
  category_id: number | null;
  amount: number;
  spent: number;
  remaining: number;
  usage_rate: number;
  note: string | null;
}

const schema = z.object({
  fiscal_year: z.number().int().min(2000).max(2100),
  amount: z.number().int().min(1),
  note: z.string().max(500).optional(),
});
type FormValues = z.infer<typeof schema>;

function UsageBar({ rate }: { rate: number }) {
  const color = rate >= 90 ? 'bg-red-500' : rate >= 70 ? 'bg-yellow-400' : 'bg-indigo-500';
  return (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
      <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${Math.min(rate, 100)}%` }} />
    </div>
  );
}

export default function BudgetPage() {
  const qc = useQueryClient();
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['budgets', year],
    queryFn: () =>
      apiClient.get(`/api/v1/budgets?fiscal_year=${year}`).then(r => r.data.data as Budget[]),
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fiscal_year: currentYear },
  });

  const createMutation = useMutation({
    mutationFn: (values: FormValues) => apiClient.post('/api/v1/budgets', values),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['budgets'] }); reset(); setShowForm(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/api/v1/budgets/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets'] }),
  });

  const fmt = (n: number) => n.toLocaleString('ja-JP') + '円';

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">予算管理</h1>
        <div className="flex gap-3">
          <select
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            className="border rounded px-3 py-1 text-sm dark:bg-gray-800 dark:border-gray-600"
          >
            {[currentYear + 1, currentYear, currentYear - 1].map(y => (
              <option key={y} value={y}>{y}年度</option>
            ))}
          </select>
          <button
            onClick={() => setShowForm(v => !v)}
            className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
          >
            {showForm ? 'キャンセル' : '+ 新規予算'}
          </button>
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit(v => createMutation.mutate(v))}
          className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 space-y-4"
        >
          <h2 className="font-medium text-gray-800 dark:text-gray-200">新規予算登録</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">会計年度</label>
              <input
                type="number"
                {...register('fiscal_year', { valueAsNumber: true })}
                className="w-full border rounded px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600"
              />
              {errors.fiscal_year && <p className="text-red-500 text-xs mt-1">{errors.fiscal_year.message}</p>}
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">予算金額 (円)</label>
              <input
                type="number"
                {...register('amount', { valueAsNumber: true })}
                className="w-full border rounded px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600"
              />
              {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">備考</label>
            <input
              type="text"
              {...register('note')}
              className="w-full border rounded px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting || createMutation.isPending}
            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {createMutation.isPending ? '登録中...' : '登録'}
          </button>
        </form>
      )}

      {isLoading ? (
        <p className="text-center text-gray-400 py-10">読み込み中...</p>
      ) : data && data.length > 0 ? (
        <div className="space-y-3">
          {data.map(b => (
            <div key={b.id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{b.fiscal_year}年度予算</span>
                  {b.note && <p className="text-xs text-gray-400 mt-0.5">{b.note}</p>}
                </div>
                <button
                  onClick={() => { if (confirm('削除しますか？')) deleteMutation.mutate(b.id); }}
                  className="text-xs text-red-400 hover:text-red-600"
                >
                  削除
                </button>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-gray-400">予算</p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{fmt(b.amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">使用済</p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{fmt(b.spent)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">残額</p>
                  <p className={`text-sm font-semibold ${b.remaining <= 0 ? 'text-red-500' : 'text-green-600'}`}>{fmt(b.remaining)}</p>
                </div>
              </div>
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>使用率</span>
                  <span>{b.usage_rate}%</span>
                </div>
                <UsageBar rate={b.usage_rate} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-400 py-10">{year}年度の予算データがありません</p>
      )}
    </div>
  );
}
