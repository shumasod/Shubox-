import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';

const expenseSchema = z.object({
  title:        z.string().min(1, '件名を入力してください').max(200),
  amount:       z.coerce.number().positive('金額は正の値を入力してください').max(99_999_999),
  currency:     z.string().min(3).max(3).default('JPY'),
  expense_date: z.string().min(1, '日付を選択してください'),
  category_id:  z.coerce.number({ required_error: 'カテゴリを選択してください' }).int().positive(),
  project_id:   z.coerce.number().int().positive().optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
  description:  z.string().max(2000).optional(),
  is_recurring: z.boolean().default(false),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

interface Category { id: number; name: string; }
interface Project  { id: number; name: string; }

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p role="alert" className="mt-1 text-xs text-red-500">{message}</p>;
}

export function ExpenseForm() {
  const { id } = useParams<{ id?: string }>();
  const isEdit  = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then(r => r.data),
    staleTime: 5 * 60_000,
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['projects', 'active'],
    queryFn: () => api.get('/projects?status=active').then(r => r.data.data),
    staleTime: 5 * 60_000,
  });

  const { data: existing } = useQuery<ExpenseFormValues & { id: number }>({
    queryKey: ['expenses', id],
    queryFn: () => api.get(`/expenses/${id}`).then(r => r.data),
    enabled: isEdit,
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: { currency: 'JPY', is_recurring: false },
  });

  useEffect(() => {
    if (existing) {
      reset({
        title:        existing.title,
        amount:       existing.amount,
        currency:     existing.currency,
        expense_date: existing.expense_date,
        category_id:  existing.category_id,
        project_id:   existing.project_id,
        description:  existing.description,
        is_recurring: existing.is_recurring ?? false,
      });
    }
  }, [existing, reset]);

  const mutation = useMutation({
    mutationFn: (data: ExpenseFormValues) =>
      isEdit
        ? api.put(`/expenses/${id}`, data).then(r => r.data)
        : api.post('/expenses', data).then(r => r.data),
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      navigate(`/expenses/${saved.id}`);
    },
  });

  const amount = watch('amount');
  const formattedAmount = amount
    ? new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(Number(amount))
    : '';

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
        {isEdit ? '経費を編集' : '経費を申請'}
      </h1>

      <form
        onSubmit={handleSubmit((data) => mutation.mutate(data))}
        noValidate
        className="space-y-5 rounded-xl bg-white dark:bg-gray-800 p-6 shadow ring-1 ring-gray-200 dark:ring-gray-700"
      >
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            件名 <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            {...register('title')}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:text-white"
          />
          <FieldError message={errors.title?.message} />
        </div>

        {/* Amount + Currency */}
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              金額 <span aria-hidden="true" className="text-red-500">*</span>
            </label>
            <input
              id="amount"
              type="number"
              min="1"
              step="1"
              {...register('amount')}
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:text-white"
            />
            {formattedAmount && (
              <p className="mt-0.5 text-xs text-gray-400">{formattedAmount}</p>
            )}
            <FieldError message={errors.amount?.message} />
          </div>
          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700 dark:text-gray-200">通貨</label>
            <select
              id="currency"
              {...register('currency')}
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:text-white"
            >
              {['JPY', 'USD', 'EUR', 'GBP', 'CNY'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Date */}
        <div>
          <label htmlFor="expense_date" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            日付 <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <input
            id="expense_date"
            type="date"
            {...register('expense_date')}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:text-white"
          />
          <FieldError message={errors.expense_date?.message} />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            カテゴリ <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <select
            id="category_id"
            {...register('category_id')}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:text-white"
          >
            <option value="">選択してください</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <FieldError message={errors.category_id?.message} />
        </div>

        {/* Project (optional) */}
        <div>
          <label htmlFor="project_id" className="block text-sm font-medium text-gray-700 dark:text-gray-200">プロジェクト</label>
          <select
            id="project_id"
            {...register('project_id')}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:text-white"
          >
            <option value="">なし</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-200">説明</label>
          <textarea
            id="description"
            rows={3}
            {...register('description')}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:text-white"
          />
          <FieldError message={errors.description?.message} />
        </div>

        {/* Recurring */}
        <div className="flex items-center gap-2">
          <input
            id="is_recurring"
            type="checkbox"
            {...register('is_recurring')}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="is_recurring" className="text-sm text-gray-700 dark:text-gray-200">
            毎月の定期経費として登録する
          </label>
        </div>

        {/* Server error */}
        {mutation.isError && (
          <p role="alert" className="text-sm text-red-500">
            保存に失敗しました。もう一度お試しください。
          </p>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={isSubmitting || mutation.isPending || (!isDirty && isEdit)}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mutation.isPending ? '保存中...' : isEdit ? '更新' : '申請する'}
          </button>
        </div>
      </form>
    </main>
  );
}
