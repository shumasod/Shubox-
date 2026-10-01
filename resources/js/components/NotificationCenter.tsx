import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

type Notification = {
  id: number;
  type: string;
  title: string;
  body: string;
  read_at: string | null;
  created_at: string;
  data: Record<string, unknown>;
};

const TYPE_ICON: Record<string, string> = {
  expense_approved:          '✅',
  expense_rejected:          '❌',
  approval_requested:        '🔔',
  budget_alert:              '⚠️',
  report_ready:              '📊',
  payment_processed:         '💰',
  expense_submitted:         '📤',
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1)  return 'たった今';
  if (m < 60) return `${m}分前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}時間前`;
  return `${Math.floor(h / 24)}日前`;
}

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: number) => void;
}

function NotificationItem({ notification: n, onMarkRead }: NotificationItemProps) {
  const icon = TYPE_ICON[n.type] ?? '📨';
  const isUnread = n.read_at === null;

  return (
    <li
      className={`flex gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
        isUnread ? 'bg-blue-50/60 dark:bg-blue-900/20' : ''
      }`}
    >
      <span className="mt-0.5 text-xl flex-shrink-0" aria-hidden="true">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className={`text-sm leading-snug ${isUnread ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
          {n.title}
        </p>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{n.body}</p>
        <time className="mt-1 text-xs text-gray-400" dateTime={n.created_at}>
          {timeAgo(n.created_at)}
        </time>
      </div>
      {isUnread && (
        <button
          type="button"
          onClick={() => onMarkRead(n.id)}
          aria-label="既読にする"
          className="flex-shrink-0 self-start rounded p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <circle cx="10" cy="10" r="8" />
          </svg>
        </button>
      )}
    </li>
  );
}

export function NotificationCenter() {
  const popoverId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then(r => r.data),
    refetchInterval: 30_000,
  });

  const unreadCount = notifications.filter(n => n.read_at === null).length;

  const markReadMutation = useMutation({
    mutationFn: (id: number) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => api.post('/notifications/mark-all-read'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const handleMarkRead = useCallback(
    (id: number) => markReadMutation.mutate(id),
    [markReadMutation]
  );

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') { setOpen(false); triggerRef.current?.focus(); }
    }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label={`通知${unreadCount > 0 ? `、未読${unreadCount}件` : ''}`}
        aria-expanded={open}
        aria-controls={popoverId}
        onClick={() => setOpen(v => !v)}
        className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V5a1 1 0 00-2 0v.083A6 6 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          id={popoverId}
          ref={popoverRef}
          role="dialog"
          aria-label="通知センター"
          aria-modal="false"
          className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl bg-white dark:bg-gray-800 shadow-xl ring-1 ring-gray-200 dark:ring-gray-700 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 px-4 py-3">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">通知</h2>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isPending}
                className="text-xs text-blue-600 hover:underline dark:text-blue-400 disabled:opacity-50"
              >
                すべて既読にする
              </button>
            )}
          </div>

          {/* List */}
          {notifications.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-gray-400 dark:text-gray-500">
              通知はありません
            </p>
          ) : (
            <ul className="max-h-96 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
              {notifications.map(n => (
                <NotificationItem key={n.id} notification={n} onMarkRead={handleMarkRead} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
