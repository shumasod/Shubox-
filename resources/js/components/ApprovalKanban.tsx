import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Expense {
  id: number;
  title: string;
  amount: number;
  currency: string;
  expense_date: string;
  user: { name: string };
  category?: { name: string; color: string };
}

interface Column {
  id: 'pending' | 'approved' | 'rejected';
  label: string;
  color: string;
  headerClass: string;
}

const COLUMNS: Column[] = [
  { id: 'pending',  label: 'Pending Review', color: '#f59e0b', headerClass: 'border-amber-400 bg-amber-50 dark:bg-amber-900/20' },
  { id: 'approved', label: 'Approved',       color: '#10b981', headerClass: 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' },
  { id: 'rejected', label: 'Rejected',       color: '#ef4444', headerClass: 'border-red-400 bg-red-50 dark:bg-red-900/20' },
];

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency }).format(amount);
}

function ExpenseCard({ expense, onAction }: {
  expense: Expense;
  onAction: (id: number, action: 'approve' | 'reject') => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="group rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
      draggable={false}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2">{expense.title}</p>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-0.5 flex-shrink-0 rounded p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label={expanded ? 'Collapse' : 'Expand'}
        >
          <svg className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <p className="mt-1 text-base font-bold text-gray-900 dark:text-gray-100">
        {formatCurrency(expense.amount, expense.currency)}
      </p>

      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
        {expense.category && (
          <span
            className="rounded-full px-1.5 py-0.5 text-[10px] font-medium text-white"
            style={{ background: expense.category.color }}
          >
            {expense.category.name}
          </span>
        )}
        <span className="text-[10px] text-gray-400">{expense.expense_date}</span>
      </div>

      {expanded && (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Submitted by <span className="font-medium">{expense.user.name}</span>
        </p>
      )}

      <div className="mt-3 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={() => onAction(expense.id, 'approve')}
          className="flex-1 rounded-lg bg-emerald-500 py-1 text-xs font-semibold text-white hover:bg-emerald-600"
        >
          Approve
        </button>
        <button
          onClick={() => onAction(expense.id, 'reject')}
          className="flex-1 rounded-lg bg-red-500 py-1 text-xs font-semibold text-white hover:bg-red-600"
        >
          Reject
        </button>
      </div>
    </div>
  );
}

function KanbanColumn({ column, expenses, onAction }: {
  column: Column;
  expenses: Expense[];
  onAction: (id: number, action: 'approve' | 'reject') => void;
}) {
  return (
    <div className="flex w-80 flex-shrink-0 flex-col rounded-xl border-2 border-transparent">
      <div className={`mb-3 rounded-xl border-l-4 px-4 py-2.5 ${column.headerClass}`} style={{ borderLeftColor: column.color }}>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">{column.label}</h2>
          <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-bold text-gray-700 dark:bg-gray-700 dark:text-gray-300">
            {expenses.length}
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto pb-4">
        {expenses.length === 0 ? (
          <div className="flex h-24 items-center justify-center rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-400 dark:border-gray-700">
            Empty
          </div>
        ) : (
          expenses.map((e) => (
            <ExpenseCard key={e.id} expense={e} onAction={onAction} />
          ))
        )}
      </div>
    </div>
  );
}

export default function ApprovalKanban() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery<{ data: (Expense & { status: string })[] }>({
    queryKey: ['approvals-kanban'],
    queryFn: () => fetch('/api/expenses?per_page=100').then((r) => r.json()),
    refetchInterval: 60_000,
  });

  const approve = useMutation({
    mutationFn: ({ id, action }: { id: number; action: 'approve' | 'reject' }) =>
      fetch(`/api/expenses/${id}/${action}`, { method: 'POST' }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['approvals-kanban'] }),
  });

  const byStatus: Record<string, Expense[]> = { pending: [], approved: [], rejected: [] };
  if (data?.data) {
    for (const e of data.data) {
      if (byStatus[e.status]) byStatus[e.status].push(e);
    }
  }

  if (isLoading) {
    return (
      <div className="flex gap-4">
        {COLUMNS.map((c) => (
          <div key={c.id} className="h-96 w-80 flex-shrink-0 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-700" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Approval Board</h1>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            column={col}
            expenses={byStatus[col.id] ?? []}
            onAction={(id, action) => approve.mutate({ id, action })}
          />
        ))}
      </div>
    </div>
  );
}
