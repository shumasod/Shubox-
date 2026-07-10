import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface UserProfile {
  name: string;
  email: string;
  timezone: string;
  locale: string;
  department_id: number | null;
  notification_email: boolean;
  notification_slack: boolean;
  notification_in_app: boolean;
  two_factor_enabled: boolean;
  avatar_url: string | null;
}

const TIMEZONES = [
  'Asia/Tokyo', 'Asia/Seoul', 'Asia/Shanghai', 'Asia/Singapore',
  'Europe/London', 'Europe/Paris', 'America/New_York', 'America/Los_Angeles', 'UTC',
];

const LOCALES = [
  { value: 'ja', label: '日本語' },
  { value: 'en', label: 'English' },
  { value: 'zh', label: '中文' },
  { value: 'ko', label: '한국어' },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between">
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          checked ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </label>
  );
}

export default function SettingsPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<'profile' | 'notifications' | 'security'>('profile');
  const [saved, setSaved] = useState(false);

  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ['user-profile'],
    queryFn: () => fetch('/api/user/profile').then((r) => r.json()),
  });

  const [form, setForm] = useState<Partial<UserProfile>>({});
  const merged = { ...profile, ...form } as UserProfile;

  const save = useMutation({
    mutationFn: (data: Partial<UserProfile>) =>
      fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-profile'] });
      setForm({});
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const set = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const inputClass = 'block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';

  const tabs = [
    { id: 'profile' as const,       label: 'Profile' },
    { id: 'notifications' as const, label: 'Notifications' },
    { id: 'security' as const,      label: 'Security' },
  ];

  if (isLoading) {
    return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-700" />)}</div>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>

      {/* Tab bar */}
      <div className="flex gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-800">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
              tab === t.id
                ? 'bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-gray-100'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <Section title="Profile">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Display name</label>
              <input type="text" value={merged.name ?? ''} onChange={(e) => set('name', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input type="email" value={merged.email ?? ''} disabled className={`${inputClass} opacity-60`} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Timezone</label>
                <select value={merged.timezone ?? 'Asia/Tokyo'} onChange={(e) => set('timezone', e.target.value)} className={inputClass}>
                  {TIMEZONES.map((tz) => <option key={tz}>{tz}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Language</label>
                <select value={merged.locale ?? 'ja'} onChange={(e) => set('locale', e.target.value)} className={inputClass}>
                  {LOCALES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>
            </div>
          </div>
        </Section>
      )}

      {tab === 'notifications' && (
        <Section title="Notification Preferences">
          <div className="space-y-4">
            <Toggle
              label="Email notifications"
              checked={merged.notification_email ?? true}
              onChange={(v) => set('notification_email', v)}
            />
            <Toggle
              label="Slack notifications"
              checked={merged.notification_slack ?? false}
              onChange={(v) => set('notification_slack', v)}
            />
            <Toggle
              label="In-app notifications"
              checked={merged.notification_in_app ?? true}
              onChange={(v) => set('notification_in_app', v)}
            />
          </div>
        </Section>
      )}

      {tab === 'security' && (
        <Section title="Security">
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Two-factor authentication</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {merged.two_factor_enabled ? 'Enabled — TOTP app configured' : 'Not enabled'}
                </p>
              </div>
              <a
                href="/settings/2fa"
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                {merged.two_factor_enabled ? 'Manage' : 'Enable'}
              </a>
            </div>
            <a
              href="/settings/password"
              className="block rounded-lg border border-gray-200 p-4 text-sm font-medium text-blue-600 hover:bg-gray-50 dark:border-gray-700 dark:text-blue-400 dark:hover:bg-gray-700/50"
            >
              Change password →
            </a>
          </div>
        </Section>
      )}

      <div className="flex items-center justify-end gap-3">
        {saved && <span className="text-sm text-green-600 dark:text-green-400">Saved successfully</span>}
        <button
          onClick={() => save.mutate(form)}
          disabled={save.isPending || Object.keys(form).length === 0}
          className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {save.isPending ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  );
}
