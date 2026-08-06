import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface NotificationPreference {
  key: string;
  label: string;
  description: string;
  channels: {
    email: boolean;
    in_app: boolean;
    push: boolean;
  };
}

interface PreferencesResponse {
  preferences: NotificationPreference[];
}

const CHANNELS = [
  { key: 'email', label: 'メール' },
  { key: 'in_app', label: 'アプリ内' },
  { key: 'push', label: 'プッシュ' },
] as const;

type Channel = typeof CHANNELS[number]['key'];

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex w-10 h-5 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
      }`}
    >
      <span className={`inline-block w-4 h-4 rounded-full bg-white shadow transition-transform ${
        checked ? 'translate-x-5' : 'translate-x-0.5'
      }`} />
    </button>
  );
}

export function NotificationPreferences() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<PreferencesResponse>({
    queryKey: ['notification-preferences'],
    queryFn: () => fetch('/api/user/notification-preferences').then(r => r.json()),
  });

  const mutation = useMutation({
    mutationFn: (preferences: NotificationPreference[]) =>
      fetch('/api/user/notification-preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences }),
      }).then(r => r.json()),
    onSuccess: result => {
      queryClient.setQueryData(['notification-preferences'], result);
    },
  });

  function toggle(prefKey: string, channel: Channel, value: boolean) {
    if (!data) return;
    const updated = data.preferences.map(p =>
      p.key === prefKey
        ? { ...p, channels: { ...p.channels, [channel]: value } }
        : p
    );
    mutation.mutate(updated);
  }

  function toggleAll(channel: Channel, value: boolean) {
    if (!data) return;
    const updated = data.preferences.map(p => ({
      ...p,
      channels: { ...p.channels, [channel]: value },
    }));
    mutation.mutate(updated);
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
        ))}
      </div>
    );
  }

  const prefs = data?.preferences ?? [];

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        受け取りた通知と配信方法を設定してください。
      </p>

      {/* Header row */}
      <div className="hidden sm:grid sm:grid-cols-[1fr_repeat(3,auto)] sm:gap-6 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        <span>通知の種類</span>
        {CHANNELS.map(ch => (
          <div key={ch.key} className="flex flex-col items-center gap-1 w-14">
            <span>{ch.label}</span>
            <Toggle
              checked={prefs.every(p => p.channels[ch.key])}
              onChange={v => toggleAll(ch.key, v)}
              label={`すべて${ch.label}を${prefs.every(p => p.channels[ch.key]) ? 'OFF' : 'ON'}`}
            />
          </div>
        ))}
      </div>

      {/* Preference rows */}
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {prefs.map(pref => (
          <div
            key={pref.key}
            className="grid grid-cols-1 sm:grid-cols-[1fr_repeat(3,auto)] gap-3 sm:gap-6 items-center py-4 px-4"
          >
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{pref.label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{pref.description}</p>
            </div>

            {CHANNELS.map(ch => (
              <div key={ch.key} className="flex items-center justify-between sm:justify-center sm:w-14">
                <span className="text-xs text-gray-500 sm:hidden">{ch.label}</span>
                <Toggle
                  checked={pref.channels[ch.key]}
                  onChange={v => toggle(pref.key, ch.key, v)}
                  label={`${pref.label}の${ch.label}通知を${pref.channels[ch.key] ? '無効' : '有効'}にする`}
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      {mutation.isError && (
        <p className="text-sm text-red-500">設定の保存に失敗しました。再度お試しください。</p>
      )}
    </div>
  );
}
