import React from 'react';

export interface TimelineEvent {
  id: number;
  action: 'submitted' | 'approved' | 'rejected' | 'paid' | 'commented' | 'ocr_completed';
  actor_name: string;
  comment?: string;
  created_at: string;
}

const ACTION_META: Record<TimelineEvent['action'], { label: string; color: string; dot: string }> = {
  submitted:     { label: '申請',         color: 'text-indigo-600 dark:text-indigo-400',  dot: 'bg-indigo-500' },
  approved:      { label: '承認',         color: 'text-green-600 dark:text-green-400',    dot: 'bg-green-500' },
  rejected:      { label: '却下',         color: 'text-red-600 dark:text-red-400',        dot: 'bg-red-500' },
  paid:          { label: '支払済',     color: 'text-teal-600 dark:text-teal-400',     dot: 'bg-teal-500' },
  commented:     { label: 'コメント',   color: 'text-gray-600 dark:text-gray-400',     dot: 'bg-gray-400' },
  ocr_completed: { label: 'OCR完了', color: 'text-purple-600 dark:text-purple-400', dot: 'bg-purple-500' },
};

function fmt(iso: string): string {
  return new Date(iso).toLocaleString('ja-JP', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function ExpenseTimeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return <p className="text-sm text-gray-400 py-4">履歴なし</p>;
  }

  return (
    <ol className="relative border-l border-gray-200 dark:border-gray-700 ml-3">
      {events.map((ev, i) => {
        const meta = ACTION_META[ev.action] ?? { label: ev.action, color: 'text-gray-500', dot: 'bg-gray-400' };
        const isLast = i === events.length - 1;
        return (
          <li key={ev.id} className={`ml-6 ${isLast ? '' : 'pb-6'}`}>
            <span
              className={`absolute -left-[9px] flex items-center justify-center w-4 h-4 rounded-full ring-2 ring-white dark:ring-gray-900 ${meta.dot}`}
            />
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className={`text-sm font-semibold ${meta.color}`}>{meta.label}</span>
              <span className="text-xs text-gray-500">{ev.actor_name}</span>
              <time className="text-xs text-gray-400 ml-auto">{fmt(ev.created_at)}</time>
            </div>
            {ev.comment && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded px-3 py-2">
                {ev.comment}
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
