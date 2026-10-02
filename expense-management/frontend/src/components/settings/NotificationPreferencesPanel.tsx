import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api';

interface Preferences {
  email_on_submit: boolean;
  email_on_approve: boolean;
  email_on_reject: boolean;
  email_on_comment: boolean;
  email_on_reminder: boolean;
  push_on_approve: boolean;
  push_on_reject: boolean;
  push_on_comment: boolean;
  digest_frequency: 'none' | 'daily' | 'weekly';
}

interface ToggleRowProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}

function ToggleRow({ label, description, checked, onChange, disabled }: ToggleRowProps) {
  const id = React.useId();
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1 pr-4">
        <label htmlFor={id} className="text-sm font-medium text-gray-800 dark:text-gray-200 cursor-pointer">
          {label}
        </label>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
          checked ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

export default function NotificationPreferencesPanel() {
  const qc = useQueryClient();
  const [saved, setSaved] = useState(false);

  const { data: prefs, isLoading } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: () =>
      apiClient.get('/api/v1/user/notification-preferences').then(r => r.data.data as Preferences),
  });

  const [local, setLocal] = useState<Preferences | null>(null);
  const current = local ?? prefs;

  const toggle = (key: keyof Omit<Preferences, 'digest_frequency'>) =>
    setLocal(p => ({ ...(p ?? prefs!), [key]: !(p ?? prefs!)[key] }));

  const saveMutation = useMutation({
    mutationFn: (payload: Preferences) =>
      apiClient.put('/api/v1/user/notification-preferences', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notification-preferences'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  if (isLoading || !current) {
    return <div className="animate-pulse h-40 bg-gray-100 dark:bg-gray-700 rounded-xl" />;
  }

  return (
    <div className="space-y-6">
      <section className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">メール通知</h3>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          <ToggleRow label="経費申請時" description="自分の申請が提出されたとき" checked={current.email_on_submit} onChange={() => toggle('email_on_submit')} />
          <ToggleRow label="承認時" description="経費申請が承認されたとき" checked={current.email_on_approve} onChange={() => toggle('email_on_approve')} />
          <ToggleRow label="却下時" description="経費申請が却下されたとき" checked={current.email_on_reject} onChange={() => toggle('email_on_reject')} />
          <ToggleRow label="コメント時" checked={current.email_on_comment} onChange={() => toggle('email_on_comment')} />
          <ToggleRow label="承認リマインダー" description="承認待ちが続く場合にリマインド" checked={current.email_on_reminder} onChange={() => toggle('email_on_reminder')} />
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">ブラウザー通知</h3>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          <ToggleRow label="承認時" checked={current.push_on_approve} onChange={() => toggle('push_on_approve')} />
          <ToggleRow label="却下時" checked={current.push_on_reject} onChange={() => toggle('push_on_reject')} />
          <ToggleRow label="コメント時" checked={current.push_on_comment} onChange={() => toggle('push_on_comment')} />
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">ダイジェストメール</h3>
        <select
          value={current.digest_frequency}
          onChange={e => setLocal(p => ({ ...(p ?? prefs!), digest_frequency: e.target.value as Preferences['digest_frequency'] }))}
          className="w-full border rounded px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600"
        >
          <option value="none">送信しない</option>
          <option value="daily">毎日</option>
          <option value="weekly">毎週</option>
        </select>
      </section>

      <div className="flex items-center justify-end gap-3">
        {saved && <span className="text-sm text-green-600 dark:text-green-400">保存しました</span>}
        <button
          onClick={() => saveMutation.mutate(current)}
          disabled={saveMutation.isPending}
          className="px-5 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {saveMutation.isPending ? '保存中...' : '設定を保存'}
        </button>
      </div>
    </div>
  );
}
