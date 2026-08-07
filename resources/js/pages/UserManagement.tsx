import React, { useId, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string | null;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
};

const ROLES = [
  { value: 'employee',  label: '一般社員' },
  { value: 'approver',  label: '承認者' },
  { value: 'finance',   label: '経理' },
  { value: 'admin',     label: '管理者' },
];

const ROLE_BADGE: Record<string, string> = {
  employee: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
  approver: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  finance:  'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  admin:    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

interface InviteModalProps {
  onClose: () => void;
}

function InviteModal({ onClose }: InviteModalProps) {
  const dialogId = useId();
  const [email, setEmail] = useState('');
  const [role, setRole]   = useState('employee');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: { email: string; role: string }) =>
      api.post('/admin/users/invite', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onClose();
    },
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={dialogId}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-800 p-6 shadow-xl">
        <h2 id={dialogId} className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">ユーザーを招待</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="invite-email" className="block text-sm font-medium text-gray-700 dark:text-gray-200">メールアドレス</label>
            <input
              id="invite-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="user@example.com"
            />
          </div>
          <div>
            <label htmlFor="invite-role" className="block text-sm font-medium text-gray-700 dark:text-gray-200">権限</label>
            <select
              id="invite-role"
              value={role}
              onChange={e => setRole(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
        </div>

        {mutation.isError && (
          <p role="alert" className="mt-3 text-sm text-red-500">招待に失敗しました。</p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose}
            className="rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
            キャンセル
          </button>
          <button
            type="button"
            onClick={() => mutation.mutate({ email, role })}
            disabled={!email || mutation.isPending}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {mutation.isPending ? '送信中...' : '招待メールを送信'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function UserManagement() {
  const [showInvite, setShowInvite] = useState(false);
  const [search, setSearch] = useState('');
  const searchId = useId();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['users', search],
    queryFn: () => api.get(`/admin/users?q=${encodeURIComponent(search)}`).then(r => r.data.data),
    staleTime: 30_000,
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: number; role: string }) =>
      api.patch(`/admin/users/${id}/role`, { role }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      api.patch(`/admin/users/${id}/active`, { is_active: active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  const filtered = users.filter(u =>
    !search || u.name.includes(search) || u.email.includes(search)
  );

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white flex-1">ユーザー管理</h1>
        <button
          type="button"
          onClick={() => setShowInvite(true)}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + 招待
        </button>
      </div>

      <div className="mb-4">
        <label htmlFor={searchId} className="sr-only">ユーザーを検索</label>
        <input
          id={searchId}
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="名前・メールで検索..."
          className="block w-full max-w-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow ring-1 ring-gray-200 dark:ring-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              {['名前', 'メール', '権限', '部署', '状態', '最終ログイン', '操作'].map(h => (
                <th key={h} scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {isLoading ? (
              <tr><td colSpan={7} className="py-8 text-center text-sm text-gray-400">読み込み中...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="py-8 text-center text-sm text-gray-400">ユーザーが見つかりません</td></tr>
            ) : filtered.map(user => (
              <tr key={user.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 ${!user.is_active ? 'opacity-50' : ''}`}>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{user.name}</td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{user.email}</td>
                <td className="px-4 py-3">
                  <select
                    value={user.role}
                    onChange={e => roleMutation.mutate({ id: user.id, role: e.target.value })}
                    aria-label={`${user.name}の権限`}
                    className={`rounded-full px-2 py-0.5 text-xs font-medium border-0 bg-transparent cursor-pointer ${ROLE_BADGE[user.role] ?? ''}`}
                  >
                    {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{user.department ?? '—'}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={user.is_active}
                    onClick={() => toggleActiveMutation.mutate({ id: user.id, active: !user.is_active })}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      user.is_active ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                      user.is_active ? 'translate-x-4' : 'translate-x-1'
                    }`} />
                  </button>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">
                  {user.last_login_at
                    ? new Intl.DateTimeFormat('ja-JP', { month: 'short', day: 'numeric' }).format(new Date(user.last_login_at))
                    : '未ログイン'}
                </td>
                <td className="px-4 py-3 text-sm">
                  <a href={`/admin/users/${user.id}`} className="text-blue-600 hover:underline dark:text-blue-400">詳細</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showInvite && <InviteModal onClose={() => setShowInvite(false)} />}
    </main>
  );
}
