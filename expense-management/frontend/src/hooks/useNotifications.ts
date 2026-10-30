import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const notificationKeys = {
  all:  () => ['notifications'] as const,
  list: () => ['notifications', 'list'] as const,
};

const BASE = '/api/v1/notifications';

async function apiFetch(path: string, options?: RequestInit) {
  const token = localStorage.getItem('token');
  const res = await fetch(path, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok && res.status !== 204) throw new Error(await res.text());
  return res.status === 204 ? null : res.json();
}

export function useNotifications() {
  return useQuery({
    queryKey: notificationKeys.list(),
    queryFn:  () => apiFetch(BASE + '?per_page=20'),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useMarkAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`${BASE}/${id}/read`, { method: 'PATCH' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: notificationKeys.all() }),
  });
}

export function useMarkAllAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch(`${BASE}/read-all`, { method: 'POST' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: notificationKeys.all() }),
  });
}
