import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

interface Expense {
  id:     number;
  title:  string;
  status: string;
  amount: number;
}

interface Props {
  expenses: Expense[];
}

type BulkAction = 'submit' | 'delete' | 'export';

const ACTION_CONFIG: Record<BulkAction, { label: string; color: string; confirmMsg?: string }> = {
  submit:  { label: 'Submit for Approval', color: 'bg-indigo-600 hover:bg-indigo-700 text-white' },
  delete:  { label: 'Delete',              color: 'bg-red-600 hover:bg-red-700 text-white', confirmMsg: 'Delete selected expenses? This cannot be undone.' },
  export:  { label: 'Export CSV',          color: 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200' },
};

export const ExpenseBulkActions: React.FC<Props> = ({ expenses }) => {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const queryClient             = useQueryClient();

  const toggleAll = () => {
    if (selected.size === expenses.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(expenses.map(e => e.id)));
    }
  };

  const toggleOne = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const bulkMutation = useMutation({
    mutationFn: ({ action, ids }: { action: BulkAction; ids: number[] }) =>
      api.post('/expenses/bulk', { action, ids }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setSelected(new Set());
    },
  });

  const handleAction = (action: BulkAction) => {
    const ids = [...selected];
    const cfg = ACTION_CONFIG[action];
    if (cfg.confirmMsg && !window.confirm(cfg.confirmMsg)) return;
    bulkMutation.mutate({ action, ids });
  };

  const allSelected  = expenses.length > 0 && selected.size === expenses.length;
  const someSelected = selected.size > 0 && selected.size < expenses.length;

  return (
    <div>
      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-2.5 bg-indigo-50 dark:bg-indigo-900/30 border-b border-indigo-200 dark:border-indigo-800">
          <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
            {selected.size} selected
          </span>
          <div className="flex-1" />
          {(Object.entries(ACTION_CONFIG) as [BulkAction, typeof ACTION_CONFIG[BulkAction]][]).map(([action, cfg]) => (
            <button
              key={action}
              onClick={() => handleAction(action)}
              disabled={bulkMutation.isPending}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${cfg.color}`}
            >
              {cfg.label}
            </button>
          ))}
          <button
            onClick={() => setSelected(new Set())}
            className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 ml-1"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Table */}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="w-10 px-4 py-3">
              <input
                type="checkbox"
                checked={allSelected}
                ref={el => { if (el) el.indeterminate = someSelected; }}
                onChange={toggleAll}
                aria-label="Select all"
                className="rounded"
              />
            </th>
            <th className="text-left px-2 py-3 font-medium text-gray-600 dark:text-gray-400">Title</th>
            <th className="text-left px-2 py-3 font-medium text-gray-600 dark:text-gray-400">Status</th>
            <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Amount</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map(expense => (
            <tr
              key={expense.id}
              className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                selected.has(expense.id) ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
              }`}
            >
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selected.has(expense.id)}
                  onChange={() => toggleOne(expense.id)}
                  aria-label={`Select ${expense.title}`}
                  className="rounded"
                />
              </td>
              <td className="px-2 py-3 text-gray-900 dark:text-gray-100 font-medium">{expense.title}</td>
              <td className="px-2 py-3">
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  {expense.status}
                </span>
              </td>
              <td className="px-4 py-3 text-right text-gray-900 dark:text-gray-100">
                {new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(expense.amount / 100)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
