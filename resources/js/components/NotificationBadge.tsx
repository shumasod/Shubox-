import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Notification {
  id: number;
  type: string;
  title: string;
  body: string;
  url?: string;
  read_at: string | null;
  created_at: string;
}

interface NotificationResponse {
  data: Notification[];
  unread_count: number;
}

async function fetchNotifications(): Promise<NotificationResponse> {
  const res = await fetch('/api/v1/notifications?per_page=10', { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error('Failed to fetch notifications');
  return res.json();
}

async function markAllRead(): Promise<void> {
  await fetch('/api/v1/notifications/mark-all-read', { method: 'POST', headers: { Accept: 'application/json' } });
}

async function markOneRead(id: number): Promise<void> {
  await fetch(`/api/v1/notifications/${id}/read`, { method: 'PATCH', headers: { Accept: 'application/json' } });
}

const TYPE_ICONS: Record<string, string> = {
  approval_required:  'ring-yellow-400',
  expense_approved:   'ring-green-400',
  expense_rejected:   'ring-red-400',
  comment_added:      'ring-blue-400',
  report_ready:       'ring-purple-400',
};

function NotificationItem({ notif, onClick }: { notif: Notification; onClick: (notif: Notification) => void }) {
  const ringColor = TYPE_ICONS[notif.type] ?? 'ring-gray-300';
  const timeAgo = formatTimeAgo(notif.created_at);

  return (
    <button
      onClick={() => onClick(notif)}
      className={[
        'w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0',
        !notif.read_at ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : '',
      ].join(' ')}
    >
      <div className="flex items-start gap-3">
        <span className={`mt-1 w-2 h-2 rounded-full ring-2 flex-shrink-0 ${ringColor} ${!notif.read_at ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
        <div className="flex-1 min-w-0">
          <p className={`text-sm ${!notif.read_at ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
            {notif.title}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{notif.body}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{timeAgo}</p>
        </div>
      </div>
    </button>
  );
}

function formatTimeAgo(isoString: string): string {
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diff < 60)   return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationBadge() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    refetchInterval: 30_000,
    staleTime: 25_000,
  });

  const { mutate: markAll } = useMutation({
    mutationFn: markAllRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const { mutate: markOne } = useMutation({
    mutationFn: markOneRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const handleNotifClick = useCallback((notif: Notification) => {
    if (!notif.read_at) markOne(notif.id);
    if (notif.url) window.location.href = notif.url;
    setOpen(false);
  }, [markOne]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const unreadCount = data?.unread_count ?? 0;
  const notifications = data?.data ?? [];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={() => markAll()} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No notifications</p>
            ) : (
              notifications.map(n => <NotificationItem key={n.id} notif={n} onClick={handleNotifClick} />)
            )}
          </div>
          <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700">
            <a href="/notifications" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">View all notifications</a>
          </div>
        </div>
      )}
    </div>
  );
}
