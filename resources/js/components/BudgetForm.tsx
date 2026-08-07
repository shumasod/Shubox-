import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const BUDGET_TYPES = ['department', 'project', 'category'] as const;
const PERIOD_TYPES = ['monthly', 'quarterly', 'annual', 'custom'] as const;

const budgetSchema = z.object({
  name: z.string().min(1, '予算名を入力してください').max(100),
  budget_type: z.enum(BUDGET_TYPES),
  budgetable_type: z.string().optional(),
  budgetable_id: z.number().int().positive().optional(),
  amount: z.number().positive('金額は0より大きい必要があります').max(999_999_999),
  currency: z.string().length(3).default('JPY'),
  period_type: z.enum(PERIOD_TYPES),
  period_start: z.string().min(1, '開始日を選択してください'),
  period_end: z.string().min(1, '終了日を選択してください'),
  alert_threshold: z.number().int().min(1).max(100).default(80),
  notes: z.string().max(500).optional(),
}).refine(
  data => new Date(data.period_end) >= new Date(data.period_start),
  { message: '終了日は開始日以降にしてください', path: ['period_end'] }
);

type BudgetFormValues = z.infer<typeof budgetSchema>;

interface Budget {
  id: number;
  name: string;
  budget_type: typeof BUDGET_TYPES[number];
  amount: number;
  currency: string;
  period_type: typeof PERIOD_TYPES[number];
  period_start: string;
  period_end: string;
  alert_threshold: number;
  notes?: string;
}

interface BudgetFormProps {
  initialData?: Partial<Budget>;
  onSuccess?: (budget: Budget) => void;
  onCancel?: () => void;
}

const PERIOD_TYPE_LABELS: Record<string, string> = {
  monthly: '月次',
  quarterly: '四半期',
  annual: '年次',
  custom: 'カスタム',
};

const BUDGET_TYPE_LABELS: Record<string, string> = {
  department: '部門',
  project: 'プロジェクト',
  category: 'カテゴリ',
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-500">{message}</p>;
}

export function BudgetForm({ initialData, onSuccess, onCancel }: BudgetFormProps) {
  const queryClient = useQueryClient();
  const isEditing = !!initialData?.id;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      budget_type: initialData?.budget_type ?? 'department',
      amount: initialData?.amount ?? 0,
      currency: initialData?.currency ?? 'JPY',
      period_type: initialData?.period_type ?? 'monthly',
      period_start: initialData?.period_start?.slice(0, 10) ?? '',
      period_end: initialData?.period_end?.slice(0, 10) ?? '',
      alert_threshold: initialData?.alert_threshold ?? 80,
      notes: initialData?.notes ?? '',
    },
  });

  const periodType = watch('period_type');
  const periodStart = watch('period_start');

  // Auto-fill period_end based on period_type and period_start
  useEffect(() => {
    if (!periodStart || periodType === 'custom') return;

    const start = new Date(periodStart);
    let end: Date;

    switch (periodType) {
      case 'monthly':
        end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
        break;
      case 'quarterly':
        end = new Date(start.getFullYear(), start.getMonth() + 3, 0);
        break;
      case 'annual':
        end = new Date(start.getFullYear() + 1, start.getMonth(), start.getDate() - 1);
        break;
      default:
        return;
    }

    setValue('period_end', end.toISOString().slice(0, 10), { shouldValidate: true });
  }, [periodType, periodStart, setValue]);

  const mutation = useMutation({
    mutationFn: async (data: BudgetFormValues) => {
      const url = isEditing ? `/api/budgets/${initialData!.id}` : '/api/budgets';
      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json() as Promise<Budget>;
    },
    onSuccess: budget => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      onSuccess?.(budget);
    },
  });

  return (
    <form onSubmit={handleSubmit(data => mutation.mutate(data))} className="space-y-6">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          予算名 <span className="text-red-500">*</span>
        </label>
        <input
          {...register('name')}
          type="text"
          placeholder="例: 営業部 Q1 予算"
          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder-gray-400"
        />
        <FieldError message={errors.name?.message} />
      </div>

      {/* Budget type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          予算タイプ <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2 flex-wrap">
          {BUDGET_TYPES.map(type => (
            <label key={type} className="flex items-center gap-2 cursor-pointer">
              <input
                {...register('budget_type')}
                type="radio"
                value={type}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {BUDGET_TYPE_LABELS[type]}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Amount and Currency */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            予算金額 <span className="text-red-500">*</span>
          </label>
          <input
            {...register('amount', { valueAsNumber: true })}
            type="number"
            min={0}
            step={1}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white"
          />
          <FieldError message={errors.amount?.message} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            通貨
          </label>
          <select
            {...register('currency')}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white"
          >
            <option value="JPY">JPY</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </div>
      </div>

      {/* Period */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          期間
        </label>
        <div className="flex gap-2 flex-wrap mb-3">
          {PERIOD_TYPES.map(type => (
            <label key={type} className="flex items-center gap-2 cursor-pointer">
              <input
                {...register('period_type')}
                type="radio"
                value={type}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {PERIOD_TYPE_LABELS[type]}
              </span>
            </label>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">開始日</label>
            <input
              {...register('period_start')}
              type="date"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white"
            />
            <FieldError message={errors.period_start?.message} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">終了日</label>
            <input
              {...register('period_end')}
              type="date"
              disabled={periodType !== 'custom'}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white disabled:opacity-60"
            />
            <FieldError message={errors.period_end?.message} />
          </div>
        </div>
      </div>

      {/* Alert threshold */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          アラートしきい値: {watch('alert_threshold')}%
        </label>
        <input
          {...register('alert_threshold', { valueAsNumber: true })}
          type="range"
          min={10}
          max={100}
          step={5}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>10%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
        <FieldError message={errors.alert_threshold?.message} />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          備考
        </label>
        <textarea
          {...register('notes')}
          rows={3}
          placeholder="オプションのメモ..."
          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white resize-none placeholder-gray-400"
        />
        <FieldError message={errors.notes?.message} />
      </div>

      {/* Error banner */}
      {mutation.isError && (
        <div className="px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-sm text-red-700 dark:text-red-300">
          保存に失敗しました。もう一度お試しください。
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            キャンセル
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting || mutation.isPending || (!isDirty && isEditing)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {mutation.isPending ? '保存中...' : isEditing ? '更新' : '予算を登録'}
        </button>
      </div>
    </form>
  );
}
