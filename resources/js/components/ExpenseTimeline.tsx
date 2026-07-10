import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

interface TimelineEvent {
  id:          number;
  action:      string;
  actor_name:  string;
  actor_avatar?: string;
  description: string;
  created_at:  string;
  metadata?:   Record<string, string | number>;
}

const ACTION_COLORS: Record<string, string> = {
  created:    'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  submitted:  'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  approved:   'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  rejected:   'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  paid:       'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  commented:  'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  updated:    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
};

const relativeTime = (iso: string): string => {
  const diff  = Date.now() - new Date(iso).getTime();
  const secs  = Math.floor(diff / 1000);
  const mins  = Math.floor(secs / 60);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);

  if (secs < 60)  return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7)   return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
};

const ActorAvatar: React.FC<{ name: string; src?: string }> = ({ name, src }) => {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const hue      = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;

  if (src) {
    return <img src={src} alt={name} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />;
  }
  return (
    <div
      className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
      style={{ backgroundColor: `hsl(${hue}, 60%, 50%)` }}
      aria-label={name}
    >
      {initials}
    </div>
  );
};

interface Props {
  expenseId: number;
}

export const ExpenseTimeline: React.FC<Props> = ({ expenseId }) => {
  const { data: events = [], isLoading } = useQuery<TimelineEvent[]>({
    queryKey: ['expense-timeline', expenseId],
    queryFn: () => api.get(`/expenses/${expenseId}/timeline`).then(r => r.data.data),
    refetchInterval: 30_000,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-1">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
              <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return <p className="text-sm text-gray-400 italic">No activity yet.</p>;
  }

  return (
    <ol className="space-y-1" aria-label="Expense activity timeline">
      {events.map((event, idx) => (
        <li key={event.id} className="flex items-start gap-3">
          <div className="flex flex-col items-center">
            <ActorAvatar name={event.actor_name} src={event.actor_avatar} />
            {idx < events.length - 1 && (
              <div className="w-px flex-1 bg-gray-200 dark:bg-gray-700 mt-1 min-h-[16px]" />
            )}
          </div>
          <div className="flex-1 pb-3">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{event.actor_name}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${ACTION_COLORS[event.action] ?? ACTION_COLORS.updated}`}>
                {event.action}
              </span>
              <time className="text-xs text-gray-400 ml-auto" dateTime={event.created_at}>
                {relativeTime(event.created_at)}
              </time>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{event.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
};
