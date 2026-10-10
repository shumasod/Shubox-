import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

type TimelineEvent = {
  id: number;
  event: string;
  created_at: string;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  user: { id: number; name: string; email: string } | null;
};

const EVENT_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  created:           { label: '作成',     color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',   icon: '📝' },
  updated:           { label: '更新',     color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200',   icon: '✏️' },
  submitted:         { label: '申請',     color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', icon: '📤' },
  approved:          { label: '承認',     color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: '✅' },
  rejected:          { label: '却下',     color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',       icon: '❌' },
  payment_processed: { label: '支払済',   color: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',   icon: '💰' },
  cancelled:         { label: 'キャンセル', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', icon: '🚫' },
  deleted:           { label: '削除',     color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',       icon: '🗑️' },
};

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso));
}

function DiffRow({ label, old: oldVal, next: newVal }: { label: string; old: unknown; next: unknown }) {
  if (oldVal === newVal || (oldVal === null && newVal === null)) return null;
  return (
    <div className="text-xs mt-1">
      <span className="font-medium text-gray-500 dark:text-gray-400">{label}: </span>
      {oldVal !== null && oldVal !== undefined && (
        <span className="line-through text-red-500 mr-1">{String(oldVal)}</span>
      )}
      {newVal !== null && newVal !== undefined && (
        <span className="text-green-600 dark:text-green-400">{String(newVal)}</span>
      )}
    </div>
  );
}

function TimelineItem({ event }: { event: TimelineEvent }) {
  const config = EVENT_CONFIG[event.event] ?? {
    label: event.event, color: 'bg-gray-100 text-gray-700', icon: '•',
  };

  const changedKeys = event.new_values ? Object.keys(event.new_values) : [];

  return (
    <li className="relative flex gap-4">
      {/* vertical line */}
      <div className="absolute left-4 top-8 bottom-0 w-px bg-gray-200 dark:bg-gray-700" aria-hidden="true" />

      <span
        className="relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white dark:bg-gray-900 ring-2 ring-gray-200 dark:ring-gray-700 text-base"
        aria-hidden="true"
      >
        {config.icon}
      </span>

      <div className="pb-6 min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${config.color}`}>
            {config.label}
          </span>
          {event.user && (
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {event.user.name}
            </span>
          )}
          <time className="ml-auto text-xs text-gray-400 dark:text-gray-500" dateTime={event.created_at}>
            {formatDate(event.created_at)}
          </time>
        </div>

        {changedKeys.length > 0 && (
          <div className="mt-1 rounded bg-gray-50 dark:bg-gray-800 px-2 py-1">
            {changedKeys.map((key) => (
              <DiffRow
                key={key}
                label={key}
                old={event.old_values?.[key]}
                next={event.new_values?.[key]}
              />
            ))}
          </div>
        )}
      </div>
    </li>
  );
}

interface Props {
  expenseId: number;
}

export function ExpenseTimeline({ expenseId }: Props) {
  const { data: events, isLoading, isError } = useQuery<TimelineEvent[]>({
    queryKey: ['audit-logs', 'expenses', expenseId],
    queryFn: () => api.get(`/audit-logs/expenses/${expenseId}`).then((r) => r.data),
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-3 w-1/2 rounded bg-gray-100 dark:bg-gray-800" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return <p className="text-sm text-red-500">履歴の読み込みに失敗しました。</p>;
  }

  if (!events?.length) {
    return <p className="text-sm text-gray-400 dark:text-gray-500">履歴がありません。</p>;
  }

  return (
    <section aria-label="変更履歴">
      <h3 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">変更履歴</h3>
      <ol className="relative">
        {events.map((event) => (
          <TimelineItem key={event.id} event={event} />
        ))}
      </ol>
    </section>
  );
}
