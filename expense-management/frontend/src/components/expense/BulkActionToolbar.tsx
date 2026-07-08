import React from 'react';

interface Props {
  selectedIds: number[];
  total: number;
  onSelectAll: () => void;
  onClearAll: () => void;
  onBulkDelete: () => void;
  onBulkExport: () => void;
  isDeleting: boolean;
}

export default function BulkActionToolbar({
  selectedIds,
  total,
  onSelectAll,
  onClearAll,
  onBulkDelete,
  onBulkExport,
  isDeleting,
}: Props) {
  const count = selectedIds.length;
  if (count === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 inset-x-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 z-30 flex items-center gap-3 bg-gray-900 dark:bg-gray-700 text-white px-5 py-3 rounded-2xl shadow-2xl w-auto md:w-max">
      <span className="text-sm font-medium">{count}件選択中</span>

      {count < total ? (
        <button
          onClick={onSelectAll}
          className="text-xs text-indigo-300 hover:text-indigo-100 underline"
        >
          全{total}件選択
        </button>
      ) : (
        <button
          onClick={onClearAll}
          className="text-xs text-gray-400 hover:text-gray-200 underline"
        >
          解除
        </button>
      )}

      <div className="flex-1" />

      <button
        onClick={onBulkExport}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-medium transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        CSV出力
      </button>

      <button
        onClick={() => {
          if (confirm(`${count}件の申請を削除しますか？`)) onBulkDelete();
        }}
        disabled={isDeleting}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 rounded-lg text-xs font-medium transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        {isDeleting ? '削除中...' : '削除'}
      </button>

      <button
        onClick={onClearAll}
        className="text-gray-400 hover:text-white ml-1"
        aria-label="選択解除"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
