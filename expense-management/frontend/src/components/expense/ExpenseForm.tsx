import React, { useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { categoryApi } from '../../lib/api';
import type { CreateExpenseInput, Expense } from '../../types/expense';

const itemSchema = z.object({
  category_id: z.string().uuid('カテゴリを選択してください'),
  description: z.string().min(1, '説明は必須です').max(500, '500文字以内で入力してください'),
  amount: z.number({ invalid_type_error: '金額を入力してください' })
    .int('整数で入力してください')
    .min(1, '1円以上で入力してください')
    .max(99999999, '金額が上限を超えています'),
  quantity: z.number().int().min(1).default(1),
  expense_date: z.string().min(1, '日付は必須です'),
  vendor: z.string().max(200).nullable().optional(),
  purpose: z.string().max(500).nullable().optional(),
  sort_order: z.number().int().default(0),
});

const expenseSchema = z.object({
  title: z.string().min(1, '件名は必須です').max(200, '200文字以内で入力してください'),
  description: z.string().max(2000, '2000文字以内で入力してください').nullable().optional(),
  currency: z.enum(['JPY', 'USD', 'EUR']).default('JPY'),
  items: z.array(itemSchema).min(1, '明細は最低1件必要です'),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface Props {
  defaultValues?: Partial<Expense>;
  onSubmit: (data: CreateExpenseInput) => Promise<void>;
  onSaveDraft?: (data: CreateExpenseInput) => Promise<void>;
  isLoading?: boolean;
}

export function ExpenseForm({ defaultValues, onSubmit, onSaveDraft, isLoading }: Props) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: defaultValues
      ? {
          title: defaultValues.title ?? '',
          description: defaultValues.description ?? '',
          currency: (defaultValues.currency as 'JPY') ?? 'JPY',
          items: defaultValues.items?.map((item) => ({
            category_id: item.category_id,
            description: item.description,
            amount: item.amount,
            quantity: item.quantity,
            expense_date: item.expense_date,
            vendor: item.vendor ?? '',
            purpose: item.purpose ?? '',
            sort_order: item.sort_order,
          })) ?? [{ category_id: '', description: '', amount: 0, quantity: 1, expense_date: today(), sort_order: 0 }],
        }
      : {
          currency: 'JPY',
          items: [{ category_id: '', description: '', amount: 0, quantity: 1, expense_date: today(), sort_order: 0 }],
        },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.list,
  });

  const watchedItems = watch('items');
  const totalAmount = watchedItems.reduce(
    (sum, item) => sum + (Number(item.amount) || 0) * (Number(item.quantity) || 1),
    0
  );

  const handleFormSubmit = async (data: ExpenseFormData) => {
    await onSubmit(data as CreateExpenseInput);
  };

  const handleSaveDraft = async () => {
    const data = watch();
    if (onSaveDraft) {
      await onSaveDraft(data as CreateExpenseInput);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* ヘッダー情報 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">基本情報</h2>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            件名 <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            {...register('title')}
            placeholder="例: 大阪出張交通費"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            備考
          </label>
          <textarea
            id="description"
            {...register('description')}
            rows={3}
            placeholder="申請の背景や詳細を入力してください"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>
      </div>

      {/* 明細 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">明細</h2>
          <button
            type="button"
            onClick={() =>
              append({
                category_id: '',
                description: '',
                amount: 0,
                quantity: 1,
                expense_date: today(),
                sort_order: fields.length,
              })
            }
            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <PlusIcon />
            明細を追加
          </button>
        </div>

        {errors.items?.root && (
          <p className="text-sm text-red-600">{errors.items.root.message}</p>
        )}

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">明細 {index + 1}</span>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    削除
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* カテゴリ */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    カテゴリ <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register(`items.${index}.category_id`)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">選択してください</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.items?.[index]?.category_id && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.items[index]!.category_id!.message}
                    </p>
                  )}
                </div>

                {/* 利用日 */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    利用日 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    {...register(`items.${index}.expense_date`)}
                    max={today()}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.items?.[index]?.expense_date && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.items[index]!.expense_date!.message}
                    </p>
                  )}
                </div>

                {/* 説明 */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    内容 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register(`items.${index}.description`)}
                    placeholder="例: 新幹線 東京→大阪"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.items?.[index]?.description && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.items[index]!.description!.message}
                    </p>
                  )}
                </div>

                {/* 金額 */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    金額（円） <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">¥</span>
                    <Controller
                      name={`items.${index}.amount`}
                      control={control}
                      render={({ field }) => (
                        <input
                          type="number"
                          min="1"
                          step="1"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                          className="w-full rounded-md border border-gray-300 pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                        />
                      )}
                    />
                  </div>
                  {errors.items?.[index]?.amount && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.items[index]!.amount!.message}
                    </p>
                  )}
                </div>

                {/* 数量 */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">数量</label>
                  <Controller
                    name={`items.${index}.quantity`}
                    control={control}
                    render={({ field }) => (
                      <input
                        type="number"
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 1)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  />
                </div>

                {/* 支払先 */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">支払先</label>
                  <input
                    type="text"
                    {...register(`items.${index}.vendor`)}
                    placeholder="例: JR東海"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* 目的 */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">目的・用途</label>
                  <input
                    type="text"
                    {...register(`items.${index}.purpose`)}
                    placeholder="例: 顧客訪問"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* 小計 */}
              <div className="flex justify-end text-sm text-gray-600">
                小計:{' '}
                <span className="font-medium ml-1">
                  ¥{((watchedItems[index]?.amount || 0) * (watchedItems[index]?.quantity || 1)).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* 合計 */}
        <div className="flex justify-end border-t pt-4">
          <div className="text-right">
            <span className="text-sm text-gray-600">合計金額</span>
            <div className="text-2xl font-bold text-gray-900">
              ¥{totalAmount.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* 送信ボタン */}
      <div className="flex gap-3 justify-end">
        {onSaveDraft && (
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            下書き保存
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '保存中...' : '申請する'}
        </button>
      </div>
    </form>
  );
}

function today(): string {
  return new Date().toISOString().split('T')[0];
}

function PlusIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}
