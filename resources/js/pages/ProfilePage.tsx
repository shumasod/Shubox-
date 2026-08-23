import { useState, useRef, useId } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface Profile {
  id: number;
  name: string;
  email: string;
  avatar_url: string | null;
  role: string;
  department: string | null;
  two_factor_enabled: boolean;
  created_at: string;
}

interface ApiKey {
  id: number;
  name: string;
  key_prefix: string;
  scopes: string[];
  expires_at: string | null;
  last_used_at: string | null;
  is_active: boolean;
  created_at: string;
}

const profileSchema = z.object({
  name:  z.string().min(1).max(100),
  email: z.string().email(),
});

const passwordSchema = z.object({
  current_password: z.string().min(1),
  new_password:     z.string().min(8),
  confirm_password: z.string().min(1),
}).refine(d => d.new_password === d.confirm_password, {
  message: '新しいパスワードが一致しません',
  path: ['confirm_password'],
});

type ProfileForm  = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

const TABS = [
  { id: 'profile',  label: 'プロフィール' },
  { id: 'password', label: 'パスワード' },
  { id: 'security', label: '2FA セキュリティ' },
  { id: 'api_keys', label: 'APIキー' },
] as const;
type TabId = typeof TABS[number]['id'];

const ALLOWED_SCOPES = [
  'expenses:read', 'expenses:write',
  'reports:read', 'approvals:read', 'approvals:write',
  'analytics:read', 'webhooks:manage',
];

function AvatarUpload({ profile, onUpload }: { profile: Profile; onUpload: (f: File) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const initials = profile.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-amber-500', 'bg-red-500'];
  const color  = colors[profile.id % colors.length];

  const handleFile = (f: File) => {
    if (f.size > 2 * 1024 * 1024) return;
    setPreview(URL.createObjectURL(f));
    onUpload(f);
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        {preview || profile.avatar_url ? (
          <img
            src={preview ?? profile.avatar_url!}
            alt={profile.name}
            className="h-20 w-20 rounded-full object-cover"
          />
        ) : (
          <div className={`flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white ${color}`}>
            {initials}
          </div>
        )}
        <button
          onClick={() => inputRef.current?.click()}
          className="absolute -bottom-1 -right-1 rounded-full bg-gray-800 p-1.5 text-white hover:bg-gray-700"
          aria-label="アバターを変更"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
      </div>
      <div>
        <p className="font-semibold text-gray-900 dark:text-white">{profile.name}</p>
        <p className="text-sm text-gray-500">{profile.role}</p>
        <p className="text-xs text-gray-400">アバター: JPEG/PNG/WebP, 2MB以内</p>
      </div>
    </div>
  );
}

function ApiKeysTab() {
  const qc = useQueryClient();
  const nameId = useId();
  const expiryId = useId();
  const [selectedScopes, setSelectedScopes] = useState<string[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [revealedKey, setRevealedKey] = useState<string | null>(null);

  const { data: keys = [], isLoading } = useQuery<ApiKey[]>({
    queryKey: ['api-keys'],
    queryFn: async () => {
      const r = await fetch('/api/api-keys');
      if (!r.ok) throw new Error();
      return (await r.json()).data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (body: object) => {
      const r = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error();
      return r.json();
    },
    onSuccess: (data) => {
      setRevealedKey(data.key);
      setNewKeyName('');
      setSelectedScopes([]);
      setExpiresAt('');
      qc.invalidateQueries({ queryKey: ['api-keys'] });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/api-keys/${id}/revoke`, { method: 'POST', headers: { Accept: 'application/json' } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['api-keys'] }),
  });

  const toggleScope = (scope: string) =>
    setSelectedScopes(prev =>
      prev.includes(scope) ? prev.filter(s => s !== scope) : [...prev, scope]
    );

  return (
    <div className="space-y-6">
      {/* Revealed key banner */}
      {revealedKey && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-900/30">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
            ⚠️このAPIKeyは一度だけ表示されます。安全な場所に保管してください。
          </p>
          <div className="mt-2 flex items-center gap-2">
            <code className="flex-1 rounded bg-amber-100 px-2 py-1 font-mono text-xs text-amber-900 dark:bg-amber-800 dark:text-amber-100 break-all">
              {revealedKey}
            </code>
            <button
              onClick={() => { navigator.clipboard.writeText(revealedKey); }}
              className="shrink-0 rounded bg-amber-600 px-2 py-1 text-xs text-white hover:bg-amber-700"
            >
              コピー
            </button>
          </div>
          <button
            onClick={() => setRevealedKey(null)}
            className="mt-2 text-xs text-amber-700 underline dark:text-amber-300"
          >
            閉じる
          </button>
        </div>
      )}

      {/* Create key form */}
      <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
        <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">新しいAPIKeyを作成</h3>
        <div className="space-y-3">
          <div>
            <label htmlFor={nameId} className="block text-xs font-medium text-gray-600 dark:text-gray-400">名前</label>
            <input
              id={nameId}
              value={newKeyName}
              onChange={e => setNewKeyName(e.target.value)}
              placeholder="CIインテグレーション"
              className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">スコープ</p>
            <div className="mt-1 flex flex-wrap gap-2">
              {ALLOWED_SCOPES.map(s => (
                <label key={s} className="flex cursor-pointer items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={selectedScopes.includes(s)}
                    onChange={() => toggleScope(s)}
                    className="h-3.5 w-3.5 rounded"
                  />
                  <span className="text-xs text-gray-700 dark:text-gray-300">{s}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor={expiryId} className="block text-xs font-medium text-gray-600 dark:text-gray-400">有効期限（任意）</label>
            <input
              id={expiryId}
              type="date"
              value={expiresAt}
              onChange={e => setExpiresAt(e.target.value)}
              className="mt-1 rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <button
            onClick={() => createMutation.mutate({
              name: newKeyName,
              scopes: selectedScopes,
              ...(expiresAt ? { expires_at: expiresAt } : {}),
            })}
            disabled={!newKeyName.trim() || selectedScopes.length === 0 || createMutation.isPending}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {createMutation.isPending ? '作成中…' : 'APIKeyを作成'}
          </button>
        </div>
      </div>

      {/* Key list */}
      {isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2].map(i => <div key={i} className="h-14 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />)}
        </div>
      ) : keys.length === 0 ? (
        <p className="text-sm text-gray-500">APIKeyがありません</p>
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
          {keys.map(k => (
            <li key={k.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-gray-900 dark:text-white">{k.name}</span>
                  <span className={`rounded-full px-1.5 py-0.5 text-xs ${
                    k.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {k.is_active ? '有効' : '無効'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-mono">{k.key_prefix}...</p>
                <p className="text-xs text-gray-400">
                  {k.last_used_at
                    ? `最終使用: ${new Date(k.last_used_at).toLocaleDateString('ja-JP')}`
                    : '未使用'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {k.is_active && (
                  <button
                    onClick={() => revokeMutation.mutate(k.id)}
                    className="text-xs text-red-600 hover:underline dark:text-red-400"
                  >
                    無効化
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const [params, setParams] = useSearchParams();
  const tab: TabId = (params.get('tab') as TabId) ?? 'profile';
  const qc = useQueryClient();
  const nameId = useId();
  const emailId = useId();
  const curPwId = useId();
  const newPwId = useId();
  const cnfPwId = useId();

  const { data: profile, isLoading } = useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: async () => {
      const r = await fetch('/api/profile');
      if (!r.ok) throw new Error();
      return (await r.json()).data;
    },
  });

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: profile ? { name: profile.name, email: profile.email } : undefined,
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const profileMutation = useMutation({
    mutationFn: (data: ProfileForm) =>
      fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      }).then(r => { if (!r.ok) throw new Error(); return r.json(); }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['profile'] }); profileForm.reset(); },
  });

  const passwordMutation = useMutation({
    mutationFn: (data: PasswordForm) =>
      fetch('/api/profile/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      }).then(r => { if (!r.ok) throw new Error(); return r.json(); }),
    onSuccess: () => passwordForm.reset(),
  });

  const avatarMutation = useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append('avatar', file);
      return fetch('/api/profile/avatar', { method: 'POST', body: fd })
        .then(r => { if (!r.ok) throw new Error(); return r.json(); });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile'] }),
  });

  const disable2faMutation = useMutation({
    mutationFn: () =>
      fetch('/api/two-factor', { method: 'DELETE', headers: { Accept: 'application/json' } })
        .then(r => { if (!r.ok) throw new Error(); }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile'] }),
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">プロフィール設定</h1>

      <div className="mt-4 flex gap-1 border-b border-gray-200 dark:border-gray-700" role="tablist">
        {TABS.map(t => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setParams({ tab: t.id })}
            className={`px-4 py-2.5 text-sm font-medium transition ${
              tab === t.id
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {isLoading ? (
          <div className="space-y-4">
            {[0, 1, 2].map(i => <div key={i} className="h-10 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />)}
          </div>
        ) : profile ? (
          <div role="tabpanel">
            {tab === 'profile' && (
              <form onSubmit={profileForm.handleSubmit(d => profileMutation.mutate(d))} className="space-y-5">
                <AvatarUpload profile={profile} onUpload={f => avatarMutation.mutate(f)} />
                <div>
                  <label htmlFor={nameId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">氏名</label>
                  <input
                    id={nameId}
                    {...profileForm.register('name')}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor={emailId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">メールアドレス</label>
                  <input
                    id={emailId}
                    type="email"
                    {...profileForm.register('email')}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!profileForm.formState.isDirty || profileMutation.isPending}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {profileMutation.isPending ? '保存中…' : '変更を保存'}
                </button>
              </form>
            )}

            {tab === 'password' && (
              <form onSubmit={passwordForm.handleSubmit(d => passwordMutation.mutate(d))} className="space-y-4">
                {[{ id: curPwId, name: 'current_password' as const, label: '現在のパスワード' },
                  { id: newPwId, name: 'new_password' as const,     label: '新しいパスワード' },
                  { id: cnfPwId, name: 'confirm_password' as const, label: '新しいパスワード（確認）' },
                ].map(f => (
                  <div key={f.name}>
                    <label htmlFor={f.id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{f.label}</label>
                    <input
                      id={f.id}
                      type="password"
                      autoComplete="new-password"
                      {...passwordForm.register(f.name)}
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                    {passwordForm.formState.errors[f.name] && (
                      <p className="mt-1 text-xs text-red-600">{passwordForm.formState.errors[f.name]?.message}</p>
                    )}
                  </div>
                ))}
                {passwordMutation.isSuccess && (
                  <p className="text-sm text-green-600">パスワードを変更しました</p>
                )}
                <button
                  type="submit"
                  disabled={passwordMutation.isPending}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {passwordMutation.isPending ? '変更中…' : 'パスワードを変更'}
                </button>
              </form>
            )}

            {tab === 'security' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">2要素認証 (TOTP)</p>
                    <p className="text-sm text-gray-500">
                      {profile.two_factor_enabled ? '有効化済み' : '未有効'}
                    </p>
                  </div>
                  {profile.two_factor_enabled ? (
                    <button
                      onClick={() => {
                        if (confirm('2FAを無効化しますか？')) disable2faMutation.mutate();
                      }}
                      className="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400"
                    >
                      2FAを無効化
                    </button>
                  ) : (
                    <a
                      href="/settings/2fa/setup"
                      className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      2FAを有効化
                    </a>
                  )}
                </div>
              </div>
            )}

            {tab === 'api_keys' && <ApiKeysTab />}
          </div>
        ) : null}
      </div>
    </div>
  );
}
