import React, { useRef, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Notification {
  id: number;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

interface NotificationResponse {
  data: Notification[];
  unread_count: number;
}

const TYPE_ICONS: Record<string, string> = {
  'expense.approved':  '✅',
  'expense.rejected':  '❌',
  'expense.submitted': '📋',
  'export.ready':      '📥',
  'budget.alert':      '⚠️',
  'budget.exceeded':   '🚨',
  default:             '🔔',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function NotificationItem({
  notification,
  onMarkRead,
}: {
  notification: Notification;
  onMarkRead: (id: number) => void;
}) {
  const icon = TYPE_ICONS[notification.type] ?? TYPE_ICONS.default;
  const isUnread = !notification.read_at;

  return (
    <div
      className={`flex gap-3 px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
        isUnread ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
      }`}
    >
      <span className="mt-0.5 text-lg" aria-hidden>
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium ${
          isUnread ? 'text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'
        }`}>
          {notification.title}
        </p>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-500 line-clamp-2">
          {notification.body}
        </p>
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-600">{timeAgo(notification.created_at)}</p>
      </div>
      {isUnread && (
        <button
          onClick={() => onMarkRead(notification.id)}
          className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500"
          aria-label="Mark as read"
        />
      )}
    </div>
  );
}

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  const { data } = useQuery<NotificationResponse>({
    queryKey: ['notifications'],
    queryFn: () => fetch('/api/notifications').then((r) => r.json()),
    refetchInterval: 30_000,
  });

  const markRead = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/notifications/${id}/read`, { method: 'PATCH' }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllRead = useMutation({
    mutationFn: () =>
      fetch('/api/notifications/read-all', { method: 'POST' }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const unread = data?.unread_count ?? 0;
  const notifications = data?.data ?? [];

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100"
        aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ''}`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 top-full z-50 mt-2 w-96 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Notifications</h2>
            {unread > 0 && (
              <button
                onClick={() => markAllRead.mutate()}
                className="text-xs text-blue-600 hover:underline dark:text-blue-400"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[480px] divide-y divide-gray-100 overflow-y-auto dark:divide-gray-700">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                No notifications
              </div>
            ) : (
              notifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onMarkRead={(id) => markRead.mutate(id)}
                />
              ))
            )}
          </div>

          <div className="border-t border-gray-200 px-4 py-2 dark:border-gray-700">
            <a
              href="/notifications"
              className="block text-center text-xs text-blue-600 hover:underline dark:text-blue-400"
            >
              View all notifications
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
