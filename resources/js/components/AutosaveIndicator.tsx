import React from 'react';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface Props {
  status: SaveStatus;
  lastSavedAt: Date | null;
}

export default function AutosaveIndicator({ status, lastSavedAt }: Props) {
  if (status === 'idle') return null;

  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="inline-flex items-center gap-1.5 text-xs">
      {status === 'saving' && (
        <>
          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          <span className="text-yellow-600 dark:text-yellow-400">Saving...</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-green-600 dark:text-green-400">
            Saved{lastSavedAt ? ` at ${formatTime(lastSavedAt)}` : ''}
          </span>
        </>
      )}
      {status === 'error' && (
        <>
          <svg className="w-3.5 h-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-red-600 dark:text-red-400">Save failed</span>
        </>
      )}
    </div>
  );
}
