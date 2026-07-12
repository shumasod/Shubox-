import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';

const EXPENSE_CATEGORIES = [
  '交通費', '宿泊費', '飳食費', '通信費', '消耐品',
  'ソフトウェア', '外注・彴貨', '広告宿伝', '教育訓練', 'その他',
] as const;

const expenseSchema = z.object({
  title: z.string().min(1, '項目名を入力してください').max(200),
  amount: z.number({ invalid_type_error: '金額を入力してください' }).positive('金額は0より大きい必要があります'),
  currency: z.string().length(3).default('JPY'),
  category: z.enum(EXPENSE_CATEGORIES),
  description: z.string().max(2000).optional(),
  expense_date: z.string().min(1, '経費発生日を選択してください'),
  project_code: z.string().max(30).optional(),
  vendor_name: z.string().max(100).optional(),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

const STEPS = ['基本情報', '詳細', '颶等書'] as const;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-500" role="alert">{message}</p>;
}

function StepIndicator({ current, total, labels }: { current: number; total: number; labels: readonly string[] }) {
  return (
    <nav aria-label="フォームの進捗" className="flex items-center gap-2">
      {labels.map((label, i) => (
        <React.Fragment key={label}>
          <div className="flex items-center gap-1.5">
            <div className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 ${
              i < current
                ? 'bg-blue-600 text-white'
                : i === current
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 ring-2 ring-blue-600'
                : 'bg-gray-100 text-gray-400 dark:bg-gray-700'
            }`}>
              {i < current ? '✔' : i + 1}
            </div>
            <span className={`text-xs font-medium ${
              i === current ? 'text-blue-700 dark:text-blue-300' : 'text-gray-400 dark:text-gray-500'
            }`}>{label}</span>
          </div>
          {i < total - 1 && (
            <div className={`flex-1 h-0.5 ${
              i < current ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
            }`} />
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

export default function ExpenseForm() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;
  const [step, setStep] = useState(0);
  const [receipts, setReceipts] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      currency: 'JPY',
      expense_date: new Date().toISOString().slice(0, 10),
    },
  });

  const mutation = useMutation({
    mutationFn: async ({ values, submit }: { values: ExpenseFormValues; submit: boolean }) => {
      const formData = new FormData();
      Object.entries(values).forEach(([k, v]) => { if (v !== undefined) formData.append(k, String(v)); });
      formData.append('submit', submit ? '1' : '0');
      receipts.forEach(f => formData.append('receipts[]', f));

      const url = isEditing ? `/api/expenses/${id}` : '/api/expenses';
      const method = isEditing ? 'POST' : 'POST';
      const res = await fetch(url, { method, body: formData });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: (expense) => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      navigate(`/expenses/${expense.id}`);
    },
  });

  async function goNext() {
    const stepFields: (keyof ExpenseFormValues)[][] = [
      ['title', 'amount', 'currency', 'category', 'expense_date'],
      ['description', 'project_code', 'vendor_name'],
    ];
    const valid = await trigger(stepFields[step] as any);
    if (valid) setStep(s => s + 1);
  }

  function handleReceipts(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const valid = files.filter(f => f.size <= 10 * 1024 * 1024);
    setReceipts(prev => [...prev, ...valid].slice(0, 5));
    e.target.value = '';
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          {isEditing ? '経費申請を編集' : '新規経費申請'}
        </h1>
      </div>

      <StepIndicator current={step} total={STEPS.length} labels={STEPS} />

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">
        {/* Step 0: Basic info */}
        {step === 0 && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                項目名 <span className="text-red-500">*</span>
              </label>
              <input
                {...register('title')}
                type="text"
                placeholder="例: 出張旅費 (東京 - 大阪)"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
              />
              <FieldError message={errors.title?.message} />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  金額 <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('amount', { valueAsNumber: true })}
                  type="number"
                  min={0}
                  step={1}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
                />
                <FieldError message={errors.amount?.message} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">通貨</label>
                <select
                  {...register('currency')}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
                >
                  <option value="JPY">JPY</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  カテゴリ <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('category')}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
                >
                  <option value="">選択...</option>
                  {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <FieldError message={errors.category?.message} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  経費発生日 <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('expense_date')}
                  type="date"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
                />
                <FieldError message={errors.expense_date?.message} />
              </div>
            </div>
          </>
        )}

        {/* Step 1: Details */}
        {step === 1 && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">備考</label>
              <textarea
                {...register('description')}
                rows={4}
                placeholder="目的や詳細を入力..."
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">プロジェクトコード</label>
                <input
                  {...register('project_code')}
                  type="text"
                  placeholder="PRJ-001"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">取引先</label>
                <input
                  {...register('vendor_name')}
                  type="text"
                  placeholder="会社名を入力..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
                />
              </div>
            </div>
          </>
        )}

        {/* Step 2: Receipts */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                颶等書・領収書 (5枚まで、各10MB以内)
              </label>
              <label className="flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:border-blue-400 transition-colors">
                <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4-4m0 0l4 4m-4-4v8m8-12V4m0 0l-4 4m4-4l4 4" />
                </svg>
                <span className="text-sm text-gray-500">ファイルを選択またはドラッグアンドドロップ</span>
                <span className="text-xs text-gray-400">JPEG, PNG, PDF</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  multiple
                  onChange={handleReceipts}
                  className="sr-only"
                />
              </label>
            </div>

            {receipts.length > 0 && (
              <ul className="space-y-2">
                {receipts.map((file, i) => (
                  <li key={i} className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm">
                    <span className="truncate text-gray-700 dark:text-gray-200">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => setReceipts(prev => prev.filter((_, j) => j !== i))}
                      className="ml-3 text-red-400 hover:text-red-600 flex-shrink-0"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => step > 0 ? setStep(s => s - 1) : navigate('/expenses')}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          {step === 0 ? 'キャンセル' : '戻る'}
        </button>

        <div className="flex gap-2">
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={goNext}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg"
            >
              次へ
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleSubmit(values => mutation.mutate({ values, submit: false }))}
                disabled={mutation.isPending}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                下書き保存
              </button>
              <button
                type="button"
                onClick={handleSubmit(values => mutation.mutate({ values, submit: true }))}
                disabled={mutation.isPending}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg"
              >
                {mutation.isPending ? '送信中...' : '承認申請'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
