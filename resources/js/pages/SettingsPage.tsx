import { useState, useId } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const generalSchema = z.object({
  company_name:    z.string().min(1).max(100),
  fiscal_year_start: z.number().int().min(1).max(12),
  default_currency: z.string().length(3),
  timezone:        z.string().min(1),
  locale:          z.enum(['ja', 'en']),
});

const securitySchema = z.object({
  session_lifetime_minutes: z.number().int().min(15).max(1440),
  require_2fa:             z.boolean(),
  password_min_length:     z.number().int().min(8).max(128),
  ip_allowlist:            z.string(),
});

const expenseSchema = z.object({
  expense_limit_per_submission: z.number().int().min(0),
  auto_approve_below_amount:    z.number().int().min(0),
  receipt_required_above:       z.number().int().min(0),
  auto_reject_after_days:       z.number().int().min(1).max(365),
});

type GeneralForm  = z.infer<typeof generalSchema>;
type SecurityForm = z.infer<typeof securitySchema>;
type ExpenseForm  = z.infer<typeof expenseSchema>;

const TABS = [
  { id: 'general',       label: '一般' },
  { id: 'security',      label: 'セキュリティ' },
  { id: 'expense_rules', label: '経費ルール' },
] as const;
type TabId = typeof TABS[number]['id'];

const CURRENCIES = ['JPY', 'USD', 'EUR', 'GBP', 'SGD', 'HKD'];
const TIMEZONES  = ['Asia/Tokyo', 'UTC', 'America/New_York', 'Europe/London', 'Asia/Singapore'];
const MONTHS     = [
  '1月', '2月', '3月', '4月', '5月', '6月',
  '7月', '8月', '9月', '10月', '11月', '12月',
];

function FieldRow({ label, children, hint, id }: { label: string; children: React.ReactNode; hint?: string; id?: string }) {
  return (
    <div className="grid grid-cols-1 gap-2 py-4 sm:grid-cols-3">
      <label htmlFor={id} className="pt-1 text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="sm:col-span-2">
        {children}
        {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
      </div>
    </div>
  );
}

function Toggle({ checked, onChange, id }: { checked: boolean; onChange: (v: boolean) => void; id: string }) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
        checked ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

function SaveBanner({ onSave, isDirty, isPending }: { onSave: () => void; isDirty: boolean; isPending: boolean }) {
  if (!isDirty && !isPending) return null;
  return (
    <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-gray-200 bg-white/95 px-6 py-3 backdrop-blur dark:border-gray-700 dark:bg-gray-900/95">
      <span className="text-sm text-gray-500">変更があります</span>
      <button
        onClick={onSave}
        disabled={!isDirty || isPending}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? '保存中…' : '変更を保存'}
      </button>
    </div>
  );
}

function GeneralTab({ settings }: { settings: Record<string, unknown> }) {
  const qc = useQueryClient();
  const companyId = useId();
  const currencyId = useId();
  const timezoneId = useId();
  const localeId = useId();
  const fiscalId = useId();

  const { register, handleSubmit, formState: { isDirty } } = useForm<GeneralForm>({
    resolver: zodResolver(generalSchema),
    defaultValues: {
      company_name:       String(settings.company_name ?? ''),
      fiscal_year_start:  Number(settings.fiscal_year_start ?? 4),
      default_currency:   String(settings.default_currency ?? 'JPY'),
      timezone:           String(settings.timezone ?? 'Asia/Tokyo'),
      locale:             (settings.locale as 'ja' | 'en') ?? 'ja',
    },
  });

  const mutation = useMutation({
    mutationFn: (data: GeneralForm) =>
      fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      }).then(r => { if (!r.ok) throw new Error(); return r.json(); }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tenant-settings'] }),
  });

  return (
    <form onSubmit={handleSubmit(d => mutation.mutate(d))}>
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        <FieldRow label="会社名" id={companyId}>
          <input
            id={companyId}
            {...register('company_name')}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </FieldRow>
        <FieldRow label="会計年度開始月" id={fiscalId}>
          <select
            id={fiscalId}
            {...register('fiscal_year_start', { valueAsNumber: true })}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            {MONTHS.map((m, i) => (
              <option key={i + 1} value={i + 1}>{m}</option>
            ))}
          </select>
        </FieldRow>
        <FieldRow label="デフォルト通貨" id={currencyId}>
          <select
            id={currencyId}
            {...register('default_currency')}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </FieldRow>
        <FieldRow label="タイムゾーン" id={timezoneId}>
          <select
            id={timezoneId}
            {...register('timezone')}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
          </select>
        </FieldRow>
        <FieldRow label="言語" id={localeId}>
          <select
            id={localeId}
            {...register('locale')}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="ja">日本語</option>
            <option value="en">English</option>
          </select>
        </FieldRow>
      </div>
      <SaveBanner onSave={handleSubmit(d => mutation.mutate(d))} isDirty={isDirty} isPending={mutation.isPending} />
    </form>
  );
}

function SecurityTab({ settings }: { settings: Record<string, unknown> }) {
  const qc = useQueryClient();
  const require2faId = useId();
  const sessionId = useId();
  const pwLenId = useId();
  const ipId = useId();

  const { register, handleSubmit, watch, setValue, formState: { isDirty } } = useForm<SecurityForm>({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      session_lifetime_minutes: Number(settings.session_lifetime_minutes ?? 480),
      require_2fa:             Boolean(settings.require_2fa ?? false),
      password_min_length:     Number(settings.password_min_length ?? 12),
      ip_allowlist:            String(settings.ip_allowlist ?? ''),
    },
  });

  const require2fa = watch('require_2fa');

  const mutation = useMutation({
    mutationFn: (data: SecurityForm) =>
      fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      }).then(r => { if (!r.ok) throw new Error(); return r.json(); }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tenant-settings'] }),
  });

  return (
    <form onSubmit={handleSubmit(d => mutation.mutate(d))}>
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        <FieldRow label="セッション有効期間（分）" id={sessionId}
          hint="15、60　1440分の間で設定">
          <input
            id={sessionId}
            type="number"
            min={15}
            max={1440}
            {...register('session_lifetime_minutes', { valueAsNumber: true })}
            className="w-32 rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </FieldRow>
        <FieldRow label="2要素認証必須" id={require2faId}>
          <Toggle id={require2faId} checked={require2fa} onChange={v => setValue('require_2fa', v, { shouldDirty: true })} />
        </FieldRow>
        <FieldRow label="最小パスワード長" id={pwLenId}
          hint="8〞128文字">
          <input
            id={pwLenId}
            type="number"
            min={8}
            max={128}
            {...register('password_min_length', { valueAsNumber: true })}
            className="w-32 rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </FieldRow>
        <FieldRow label="IPアドレス制限" id={ipId}
          hint="CIDR形式で1行1エントリ。空白の場合は制限なし">
          <textarea
            id={ipId}
            rows={4}
            placeholder="203.0.113.0/24\n198.51.100.1"
            {...register('ip_allowlist')}
            className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </FieldRow>
      </div>
      <SaveBanner onSave={handleSubmit(d => mutation.mutate(d))} isDirty={isDirty} isPending={mutation.isPending} />
    </form>
  );
}

function ExpenseRulesTab({ settings }: { settings: Record<string, unknown> }) {
  const qc = useQueryClient();
  const limitId = useId();
  const autoApproveId = useId();
  const receiptId = useId();
  const rejectDaysId = useId();

  const { register, handleSubmit, formState: { isDirty } } = useForm<ExpenseForm>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      expense_limit_per_submission: Number(settings.expense_limit_per_submission ?? 500000),
      auto_approve_below_amount:    Number(settings.auto_approve_below_amount ?? 0),
      receipt_required_above:       Number(settings.receipt_required_above ?? 5000),
      auto_reject_after_days:       Number(settings.auto_reject_after_days ?? 30),
    },
  });

  const mutation = useMutation({
    mutationFn: (data: ExpenseForm) =>
      fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      }).then(r => { if (!r.ok) throw new Error(); return r.json(); }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tenant-settings'] }),
  });

  return (
    <form onSubmit={handleSubmit(d => mutation.mutate(d))}>
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        <FieldRow label="1回の上限金額（円）" id={limitId}
          hint="0は上限なし">
          <input
            id={limitId}
            type="number"
            min={0}
            {...register('expense_limit_per_submission', { valueAsNumber: true })}
            className="w-48 rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </FieldRow>
        <FieldRow label="自動承認以下金額（円）" id={autoApproveId}
          hint="0は自動承認無効">
          <input
            id={autoApproveId}
            type="number"
            min={0}
            {...register('auto_approve_below_amount', { valueAsNumber: true })}
            className="w-48 rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </FieldRow>
        <FieldRow label="領収書必須金額（円以上）" id={receiptId}>
          <input
            id={receiptId}
            type="number"
            min={0}
            {...register('receipt_required_above', { valueAsNumber: true })}
            className="w-48 rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </FieldRow>
        <FieldRow label="自動否認日数" id={rejectDaysId}
          hint="承認待ちが設定日数を超えた場合に自動否認">
          <input
            id={rejectDaysId}
            type="number"
            min={1}
            max={365}
            {...register('auto_reject_after_days', { valueAsNumber: true })}
            className="w-32 rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </FieldRow>
      </div>
      <SaveBanner onSave={handleSubmit(d => mutation.mutate(d))} isDirty={isDirty} isPending={mutation.isPending} />
    </form>
  );
}

export default function SettingsPage() {
  const [params, setParams] = useSearchParams();
  const tab: TabId = (params.get('tab') as TabId) ?? 'general';

  const { data, isLoading } = useQuery<{ settings: Record<string, unknown> }>({
    queryKey: ['tenant-settings'],
    queryFn: async () => {
      const r = await fetch('/api/admin/settings');
      if (!r.ok) throw new Error();
      return r.json();
    },
  });

  const settings = data?.settings ?? {};

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">テナント設定</h1>

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

      <div className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {isLoading ? (
          <div className="space-y-4 p-6">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="h-10 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            ))}
          </div>
        ) : (
          <div role="tabpanel">
            {tab === 'general'       && <GeneralTab settings={settings} />}
            {tab === 'security'      && <SecurityTab settings={settings} />}
            {tab === 'expense_rules' && <ExpenseRulesTab settings={settings} />}
          </div>
        )}
      </div>
    </div>
  );
}
