import React, { useCallback, useId } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

type BulkAction = 'submit' | 'approve' | 'delete' | 'export';

interface BulkActionBarProps {
  selectedIds: number[];
  onClearSelection: () => void;
  allowedActions?: BulkAction[];
  queryKey?: string[];
}

const ACTION_CONFIG: Record<BulkAction, { label: string; variant: string; confirmMsg?: string }> = {
  submit:  { label: '一括申請',   variant: 'primary' },
  approve: { label: '一括承認',   variant: 'success' },
  delete:  { label: '一括削除',   variant: 'danger',  confirmMsg: '選択した経費を削除してもよいですか？この操作は取り消せません。' },
  export:  { label: 'CSVエクスポート', variant: 'secondary' },
};

const VARIANT_CLASSES: Record<string, string> = {
  primary:   'bg-blue-600 hover:bg-blue-700 text-white',
  success:   'bg-green-600 hover:bg-green-700 text-white',
  danger:    'bg-red-600 hover:bg-red-700 text-white',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100',
};

interface ProgressBarProps {
  current: number;
  total: number;
  labelId: string;
}

function ProgressBar({ current, total, labelId }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-labelledby={labelId}
      className="mt-2 h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700"
    >
      <div
        className="h-1.5 rounded-full bg-blue-500 transition-all duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function BulkActionBar({
  selectedIds,
  onClearSelection,
  allowedActions = ['submit', 'approve', 'delete', 'export'],
  queryKey = ['expenses'],
}: BulkActionBarProps) {
  const queryClient = useQueryClient();
  const progressLabelId = useId();

  const mutation = useMutation({
    mutationFn: async ({ action, ids }: { action: BulkAction; ids: number[] }) => {
      if (action === 'export') {
        const res = await api.post('/reports/export', { ids });
        return res.data;
      }
      const endpoint = action === 'approve' ? '/approvals/bulk-approve' : `/expenses/bulk-${action}`;
      const res = await api.post(endpoint, { ids });
      return res.data;
    },
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey });
      onClearSelection();
      if (action === 'export') {
        // notify user to check report history
        console.info('レポート生成を開始しました');
      }
    },
  });

  const handleAction = useCallback(
    (action: BulkAction) => {
      const config = ACTION_CONFIG[action];
      if (config.confirmMsg && ! window.confirm(config.confirmMsg)) return;
      mutation.mutate({ action, ids: selectedIds });
    },
    [mutation, selectedIds]
  );

  if (selectedIds.length === 0) return null;

  const isPending = mutation.isPending;
  const completedCount = isPending ? 0 : selectedIds.length;

  return (
    <div
      role="toolbar"
      aria-label="一括操作"
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 min-w-[520px] rounded-xl bg-white dark:bg-gray-800 shadow-2xl ring-1 ring-gray-200 dark:ring-gray-700 px-4 py-3"
    >
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap">
          {selectedIds.length} 件選択中
        </span>

        <div className="flex flex-1 flex-wrap gap-2">
          {allowedActions.map((action) => (
            <button
              key={action}
              type="button"
              onClick={() => handleAction(action)}
              disabled={isPending}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                VARIANT_CLASSES[ACTION_CONFIG[action].variant]
              }`}
            >
              {ACTION_CONFIG[action].label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onClearSelection}
          disabled={isPending}
          aria-label="選択を解除"
          className="ml-auto rounded p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-50"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      </div>

      {isPending && (
        <div>
          <span id={progressLabelId} className="sr-only">処理中</span>
          <ProgressBar current={completedCount} total={selectedIds.length} labelId={progressLabelId} />
        </div>
      )}

      {mutation.isError && (
        <p role="alert" className="mt-1 text-xs text-red-500">
          操作に失敗しました。もう一度お試しください。
        </p>
      )}
    </div>
  );
}
