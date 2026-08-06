import React from 'react';
import VirtualList from './VirtualList';

interface Expense {
  id: number;
  title: string;
  amount: number;
  currency: string;
  status: string;
  expense_date: string;
  category?: { name: string; color: string };
}

const STATUS_COLORS: Record<string, string> = {
  draft:    'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  pending:  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  paid:     'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
};

function ExpenseRow({ expense, onClick }: { expense: Expense; onClick: (id: number) => void }) {
  const fmt = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: expense.currency });

  return (
    <button
      onClick={() => onClick(expense.id)}
      className="w-full flex items-center gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-100 dark:border-gray-700/50 text-left"
    >
      {expense.category && (
        <span
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ background: expense.category.color }}
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{expense.title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {expense.expense_date}
          {expense.category && ` · ${expense.category.name}`}
        </p>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[expense.status] ?? ''}`}>
          {expense.status}
        </span>
        <span className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
          {fmt.format(expense.amount)}
        </span>
      </div>
    </button>
  );
}

interface Props {
  expenses: Expense[];
  onExpenseClick: (id: number) => void;
  onLoadMore?: () => void;
  containerHeight?: number;
}

export default function VirtualExpenseList({ expenses, onExpenseClick, onLoadMore, containerHeight = 600 }: Props) {
  if (expenses.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500 dark:text-gray-400 text-sm">
        No expenses found.
      </div>
    );
  }

  return (
    <VirtualList
      items={expenses}
      itemHeight={64}
      containerHeight={containerHeight}
      onScrollBottom={onLoadMore}
      renderItem={(expense, _index) => (
        <ExpenseRow expense={expense} onClick={onExpenseClick} />
      )}
    />
  );
}
