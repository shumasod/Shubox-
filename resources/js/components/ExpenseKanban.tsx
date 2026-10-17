import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

type Status = 'draft' | 'pending' | 'approved' | 'rejected' | 'paid';

interface Expense {
  id: number;
  title: string;
  amount: number;
  currency: string;
  expense_date: string;
  category?: { name: string; color: string };
  status: Status;
}

const COLUMNS: { status: Status; label: string; color: string; bg: string }[] = [
  { status: 'draft',    label: 'Draft',    color: 'text-gray-600',   bg: 'bg-gray-50 dark:bg-gray-800/40' },
  { status: 'pending',  label: 'Pending',  color: 'text-yellow-700', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
  { status: 'approved', label: 'Approved', color: 'text-green-700',  bg: 'bg-green-50 dark:bg-green-900/20' },
  { status: 'rejected', label: 'Rejected', color: 'text-red-700',    bg: 'bg-red-50 dark:bg-red-900/20' },
  { status: 'paid',     label: 'Paid',     color: 'text-blue-700',   bg: 'bg-blue-50 dark:bg-blue-900/20' },
];

async function fetchExpenses(): Promise<Expense[]> {
  const res = await fetch('/api/v1/expenses?per_page=100', { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error('Failed to load expenses');
  const data = await res.json();
  return data.data ?? data;
}

async function updateStatus(id: number, status: Status): Promise<void> {
  const res = await fetch(`/api/v1/expenses/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update status');
}

function ExpenseCard({ expense, onDragStart }: { expense: Expense; onDragStart: (e: React.DragEvent, id: number) => void }) {
  const fmt = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: expense.currency });

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, expense.id)}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow select-none"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-medium text-gray-900 dark:text-white leading-snug line-clamp-2">
          {expense.title}
        </p>
        {expense.category && (
          <span
            className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
            style={{ background: expense.category.color }}
          />
        )}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 dark:text-gray-400">{expense.expense_date}</span>
        <span className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
          {fmt.format(expense.amount)}
        </span>
      </div>
      {expense.category && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{expense.category.name}</p>
      )}
    </div>
  );
}

function KanbanColumn({
  column, expenses, onDrop, onDragOver, dragOverColumn, setDragOverColumn,
}: {
  column: typeof COLUMNS[0];
  expenses: Expense[];
  onDrop: (status: Status) => void;
  onDragOver: (e: React.DragEvent) => void;
  dragOverColumn: Status | null;
  setDragOverColumn: (s: Status | null) => void;
  onDragStart: (e: React.DragEvent, id: number) => void;
} & { onDragStart: (e: React.DragEvent, id: number) => void }) {
  const isOver = dragOverColumn === column.status;

  return (
    <div className="flex-1 min-w-0 flex flex-col min-w-[200px]">
      <div className={`flex items-center justify-between px-3 py-2 rounded-t-lg ${column.bg}`}>
        <span className={`text-sm font-semibold ${column.color}`}>{column.label}</span>
        <span className="text-xs font-medium bg-white dark:bg-gray-700 rounded-full px-2 py-0.5 text-gray-600 dark:text-gray-300">
          {expenses.length}
        </span>
      </div>
      <div
        onDragOver={(e) => { onDragOver(e); setDragOverColumn(column.status); }}
        onDragLeave={() => setDragOverColumn(null)}
        onDrop={() => { onDrop(column.status); setDragOverColumn(null); }}
        className={[
          'flex-1 p-2 space-y-2 min-h-[400px] rounded-b-lg border-2 transition-colors',
          isOver
            ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
            : `border-transparent ${column.bg}`,
        ].join(' ')}
      >
        {expenses.map(exp => (
          <ExpenseCard key={exp.id} expense={exp} onDragStart={onDragStart} />
        ))}
        {isOver && (
          <div className="border-2 border-dashed border-indigo-400 rounded-lg h-16 flex items-center justify-center">
            <span className="text-xs text-indigo-500">Drop here</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExpenseKanban() {
  const queryClient = useQueryClient();
  const [dragId, setDragId] = useState<number | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<Status | null>(null);

  const { data: expenses = [], isLoading } = useQuery({ queryKey: ['expenses-kanban'], queryFn: fetchExpenses });

  const { mutate } = useMutation({
    mutationFn: ({ id, status }: { id: number; status: Status }) => updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses-kanban'] }),
  });

  const handleDragStart = useCallback((e: React.DragEvent, id: number) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((targetStatus: Status) => {
    if (dragId === null) return;
    const expense = expenses.find(e => e.id === dragId);
    if (expense && expense.status !== targetStatus) {
      mutate({ id: dragId, status: targetStatus });
    }
    setDragId(null);
  }, [dragId, expenses, mutate]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-gray-500">Loading...</div>;
  }

  const byStatus = (status: Status) => expenses.filter(e => e.status === status);

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-3 min-w-max">
        {COLUMNS.map(col => (
          <KanbanColumn
            key={col.status}
            column={col}
            expenses={byStatus(col.status)}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragStart={handleDragStart}
            dragOverColumn={dragOverColumn}
            setDragOverColumn={setDragOverColumn}
          />
        ))}
      </div>
    </div>
  );
}
