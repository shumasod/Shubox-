import React from 'react';
import { Link } from 'react-router-dom';
import { STATUS_LABELS, STATUS_COLORS, type Expense } from '../../types/expense';

interface Props {
  expense: Expense;
}

export function MobileExpenseCard({ expense }: Props) {
  return (
    <Link
      to={`/expenses/${expense.id}`}
      className="block bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 transition-colors active:bg-gray-50"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-medium text-gray-900 line-clamp-2 flex-1">
          {expense.title}
        </p>
        <span
          className={`flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            STATUS_COLORS[expense.status]
          }`}
        >
          {STATUS_LABELS[expense.status]}
        </span>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500 font-mono text-xs">
          {expense.expense_number}
        </span>
        <span className="font-semibold text-gray-900">
          {expense.total_amount_formatted}
        </span>
      </div>

      <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
        <span>{expense.applicant?.name ?? '-'}</span>
        <span>
          {expense.applied_at
            ? new Date(expense.applied_at).toLocaleDateString('ja-JP')
            : new Date(expense.created_at).toLocaleDateString('ja-JP')}
        </span>
      </div>
    </Link>
  );
}
