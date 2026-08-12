import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface BulkAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  variant: 'primary' | 'danger' | 'default';
  confirm?: string;
}

interface BulkActionToolbarProps {
  selectedIds: number[];
  onClearSelection: () => void;
  totalCount: number;
}

const ACTIONS: BulkAction[] = [
  {
    id: 'approve',
    label: 'Approve',
    variant: 'primary',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  {
    id: 'reject',
    label: 'Reject',
    variant: 'danger',
    confirm: 'Reject the selected expenses?',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
  {
    id: 'export',
    label: 'Export',
    variant: 'default',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
  },
  {
    id: 'delete',
    label: 'Delete',
    variant: 'danger',
    confirm: 'Permanently delete the selected expenses? This cannot be undone.',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    ),
  },
];

const VARIANT_CLASSES: Record<string, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  danger:  'bg-red-600 text-white hover:bg-red-700',
  default: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600',
};

export default function BulkActionToolbar({
  selectedIds,
  onClearSelection,
  totalCount,
}: BulkActionToolbarProps) {
  const qc = useQueryClient();

  const bulkMutate = useMutation({
    mutationFn: ({ action, ids }: { action: string; ids: number[] }) =>
      fetch('/api/expenses/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ids }),
      }).then((r) => {
        if (!r.ok) throw new Error('Bulk action failed');
        return r.json();
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      onClearSelection();
    },
  });

  const handleAction = (action: BulkAction) => {
    if (action.confirm && !window.confirm(action.confirm)) return;
    bulkMutate.mutate({ action: action.id, ids: selectedIds });
  };

  if (selectedIds.length === 0) return null;

  return (
    <div
      role="toolbar"
      aria-label="Bulk actions"
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transform"
    >
      <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-2xl dark:border-gray-700 dark:bg-gray-800">
        {/* Selection count */}
        <div className="flex items-center gap-2 pr-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
            {selectedIds.length}
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            of {totalCount} selected
          </span>
          <button
            onClick={onClearSelection}
            className="ml-1 rounded p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Clear selection"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

        {/* Action buttons */}
        {ACTIONS.map((action) => (
          <button
            key={action.id}
            onClick={() => handleAction(action)}
            disabled={bulkMutate.isPending}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
              VARIANT_CLASSES[action.variant]
            }`}
          >
            {action.icon}
            {action.label}
          </button>
        ))}

        {bulkMutate.isError && (
          <span className="text-xs text-red-500">Action failed</span>
        )}
      </div>
    </div>
  );
}
