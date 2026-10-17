import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

interface Expense {
  id: number;
  title: string;
  description?: string;
  category_id: number;
  amount: number;
  currency: string;
  expense_date: string;
  metadata?: Record<string, unknown>;
}

interface Props {
  expense: Expense;
  className?: string;
}

async function duplicateExpense(expense: Expense): Promise<{ id: number }> {
  const payload = {
    title: `[Copy] ${expense.title}`,
    description: expense.description,
    category_id: expense.category_id,
    amount: expense.amount,
    currency: expense.currency,
    expense_date: new Date().toISOString().slice(0, 10),
    status: 'draft',
    metadata: { duplicated_from_id: expense.id },
  };

  const res = await fetch('/api/v1/expenses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error('Failed to duplicate expense');
  return res.json();
}

export default function ExpenseDuplicateButton({ expense, className = '' }: Props) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showConfirm, setShowConfirm] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: () => duplicateExpense(expense),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      navigate(`/expenses/${data.id}/edit`);
    },
  });

  if (showConfirm) {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Copy as new draft?
        </span>
        <button
          onClick={() => { mutate(); setShowConfirm(false); }}
          disabled={isPending}
          className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {isPending ? 'Copying...' : 'Yes, duplicate'}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${className}`}
      title="Duplicate this expense as a new draft"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
      Duplicate
    </button>
  );
}
