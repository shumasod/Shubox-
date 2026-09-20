import React, { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface Category {
  id: number;
  name: string;
  color: string;
}

interface FormValues {
  title: string;
  amount: string;
  currency: string;
  expense_date: string;
  category_id: string;
  description: string;
  receipt: File | null;
}

const CURRENCIES = ['JPY', 'USD', 'EUR', 'GBP', 'CNY', 'KRW'];

function CameraButton({ onCapture }: { onCapture: (file: File) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onCapture(file);
        }}
      />
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className="flex h-24 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500 active:bg-gray-100 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-400"
      >
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="text-sm font-medium">Capture Receipt</span>
      </button>
    </>
  );
}

export default function MobileExpenseForm({ onSuccess }: { onSuccess?: () => void }) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState<FormValues>({
    title: '',
    amount: '',
    currency: 'JPY',
    expense_date: today,
    category_id: '',
    description: '',
    receipt: null,
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const qc = useQueryClient();

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => fetch('/api/categories').then((r) => r.json()),
  });

  const submit = useMutation({
    mutationFn: async (values: FormValues) => {
      const body = new FormData();
      body.append('title', values.title);
      body.append('amount', values.amount);
      body.append('currency', values.currency);
      body.append('expense_date', values.expense_date);
      if (values.category_id) body.append('category_id', values.category_id);
      if (values.description) body.append('description', values.description);
      if (values.receipt) body.append('receipt', values.receipt);
      const r = await fetch('/api/expenses', { method: 'POST', body });
      if (!r.ok) throw new Error((await r.json()).message);
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      setForm({ title: '', amount: '', currency: 'JPY', expense_date: today, category_id: '', description: '', receipt: null });
      setPreviewUrl(null);
      onSuccess?.();
    },
  });

  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleCapture = (file: File) => {
    set('receipt', file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const field = 'block w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-base placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500';

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); submit.mutate(form); }}
      className="flex flex-col gap-4 p-4"
    >
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">New Expense</h1>

      {/* Amount + currency */}
      <div className="flex gap-2">
        <input
          type="number"
          inputMode="decimal"
          placeholder="0"
          value={form.amount}
          onChange={(e) => set('amount', e.target.value)}
          required
          className={`${field} flex-1 text-2xl font-bold`}
        />
        <select
          value={form.currency}
          onChange={(e) => set('currency', e.target.value)}
          className={`${field} w-24`}
        >
          {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      <input
        type="text"
        placeholder="What was this for?"
        value={form.title}
        onChange={(e) => set('title', e.target.value)}
        required
        className={field}
      />

      <input
        type="date"
        value={form.expense_date}
        onChange={(e) => set('expense_date', e.target.value)}
        required
        className={field}
      />

      <select
        value={form.category_id}
        onChange={(e) => set('category_id', e.target.value)}
        className={field}
      >
        <option value="">Category (optional)</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <textarea
        placeholder="Notes (optional)"
        value={form.description}
        onChange={(e) => set('description', e.target.value)}
        rows={3}
        className={`${field} resize-none`}
      />

      {previewUrl ? (
        <div className="relative">
          <img src={previewUrl} alt="Receipt preview" className="h-40 w-full rounded-2xl object-cover" />
          <button
            type="button"
            onClick={() => { set('receipt', null); setPreviewUrl(null); }}
            className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white"
            aria-label="Remove receipt"
          >
            ×
          </button>
        </div>
      ) : (
        <CameraButton onCapture={handleCapture} />
      )}

      {submit.isError && (
        <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {(submit.error as Error).message}
        </p>
      )}

      <button
        type="submit"
        disabled={submit.isPending}
        className="rounded-2xl bg-blue-600 py-4 text-base font-semibold text-white shadow-sm active:bg-blue-700 disabled:opacity-50"
      >
        {submit.isPending ? 'Submitting…' : 'Submit Expense'}
      </button>
    </form>
  );
}
