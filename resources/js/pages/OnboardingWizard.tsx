import { useState, useId } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const STEPS = [
  { id: 'company',    label: '会社情報' },
  { id: 'departments', label: '部門' },
  { id: 'categories', label: '経費カテゴリ' },
  { id: 'invite',     label: 'メンバー招待' },
  { id: 'complete',   label: '完了' },
] as const;
type StepId = typeof STEPS[number]['id'];

const companySchema = z.object({
  company_name:       z.string().min(1, '会社名を入力してください'),
  fiscal_year_start:  z.number().int().min(1).max(12),
  default_currency:   z.string().length(3),
  timezone:           z.string().min(1),
  employee_count:     z.number().int().min(1),
});

type CompanyForm = z.infer<typeof companySchema>;

const DEFAULT_CATEGORIES = [
  { code: 'TRANSPORT',  name: '交通費',     icon: '🚂', selected: true },
  { code: 'LODGING',    name: '宿泊費',     icon: '🏨', selected: true },
  { code: 'MEALS',      name: '食費・接待費', icon: '🍽️', selected: true },
  { code: 'SUPPLIES',   name: '消耗品費',   icon: '📦', selected: false },
  { code: 'COMMS',      name: '通信費',     icon: '📱', selected: false },
  { code: 'TRAINING',   name: '研修費',     icon: '📚', selected: false },
  { code: 'ADVERTISING', name: '広告宣伝費', icon: '📣', selected: false },
  { code: 'OTHER',      name: 'その他',       icon: '📋', selected: false },
];

const DEFAULT_DEPARTMENTS = [
  '経市部', '財務部', '人事部', '営業部', 'エンジニアリング', 'マーケティング', '総務部',
];

function StepIndicator({ current }: { current: number }) {
  return (
    <ol className="flex items-center" aria-label="オンボーディングステップ">
      {STEPS.filter(s => s.id !== 'complete').map((step, i) => {
        const done    = i < current;
        const active  = i === current;
        return (
          <li key={step.id} className="flex items-center">
            <div
              aria-current={active ? 'step' : undefined}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                done    ? 'bg-blue-600 text-white'
                : active ? 'border-2 border-blue-600 bg-white text-blue-600 dark:bg-gray-900'
                         : 'border-2 border-gray-300 bg-white text-gray-400 dark:bg-gray-900'
              }`}
            >
              {done ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : i + 1}
            </div>
            <span className={`ml-2 hidden text-xs sm:block ${
              active ? 'font-semibold text-blue-600' : 'text-gray-500'
            }`}>{step.label}</span>
            {i < STEPS.length - 2 && (
              <div className={`mx-3 h-0.5 w-8 ${
                done ? 'bg-blue-600' : 'bg-gray-300'
              }`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function CompanyStep({ onNext }: { onNext: (data: CompanyForm) => void }) {
  const companyId = useId();
  const fiscalId  = useId();
  const currId    = useId();
  const tzId      = useId();
  const empId     = useId();

  const { register, handleSubmit, formState: { errors } } = useForm<CompanyForm>({
    resolver: zodResolver(companySchema),
    defaultValues: { fiscal_year_start: 4, default_currency: 'JPY', timezone: 'Asia/Tokyo', employee_count: 50 },
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">会社情報を入力してください</h2>
        <p className="mt-1 text-sm text-gray-500">後から設定で変更できます。</p>
      </div>
      <div>
        <label htmlFor={companyId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">会社名 *</label>
        <input id={companyId} {...register('company_name')}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
        {errors.company_name && <p className="mt-1 text-xs text-red-600">{errors.company_name.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor={fiscalId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">会計年度開始月</label>
          <select id={fiscalId} {...register('fiscal_year_start', { valueAsNumber: true })}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white">
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}月</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={currId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">デフォルト通貨</label>
          <select id={currId} {...register('default_currency')}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white">
            {['JPY', 'USD', 'EUR', 'GBP', 'SGD'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor={tzId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">タイムゾーン</label>
          <select id={tzId} {...register('timezone')}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white">
            {['Asia/Tokyo', 'UTC', 'America/New_York', 'Europe/London'].map(tz => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={empId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">従業員数</label>
          <input id={empId} type="number" min={1} {...register('employee_count', { valueAsNumber: true })}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
        </div>
      </div>
      <button type="submit" className="w-full rounded-md bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
        次へ撰む →
      </button>
    </form>
  );
}

function DepartmentsStep({ onNext, onBack }: { onNext: (depts: string[]) => void; onBack: () => void }) {
  const [depts, setDepts] = useState<string[]>(DEFAULT_DEPARTMENTS);
  const [custom, setCustom] = useState('');

  const add = () => {
    const t = custom.trim();
    if (t && !depts.includes(t)) { setDepts(prev => [...prev, t]); }
    setCustom('');
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">部門を設定</h2>
        <p className="mt-1 text-sm text-gray-500">下記の部門をインポートします。後から追加・編集できます。</p>
      </div>
      <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 dark:divide-gray-700 dark:border-gray-700">
        {depts.map(d => (
          <li key={d} className="flex items-center justify-between px-4 py-2.5 text-sm">
            <span className="text-gray-800 dark:text-gray-200">{d}</span>
            <button onClick={() => setDepts(prev => prev.filter(x => x !== d))}
              className="text-gray-400 hover:text-red-500" aria-label={`${d}を削除`}>
              &times;
            </button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <input value={custom} onChange={e => setCustom(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder="部門名を入力"
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
        <button onClick={add}
          className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600">
          追加
        </button>
      </div>
      <div className="flex gap-3">
        <button onClick={onBack}
          className="flex-1 rounded-md border border-gray-300 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300">
          &larr; 戻る
        </button>
        <button onClick={() => onNext(depts)}
          className="flex-1 rounded-md bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
          次へ撰む →
        </button>
      </div>
    </div>
  );
}

function CategoriesStep({ onNext, onBack }: { onNext: (cats: typeof DEFAULT_CATEGORIES) => void; onBack: () => void }) {
  const [cats, setCats] = useState(DEFAULT_CATEGORIES);

  const toggle = (code: string) =>
    setCats(prev => prev.map(c => c.code === code ? { ...c, selected: !c.selected } : c));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">経費カテゴリを選択</h2>
        <p className="mt-1 text-sm text-gray-500">使用するカテゴリを選んでください。</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cats.map(c => (
          <button
            key={c.code}
            onClick={() => toggle(c.code)}
            aria-pressed={c.selected}
            className={`flex flex-col items-center gap-1 rounded-lg border-2 p-3 text-center transition ${
              c.selected
                ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/30'
                : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
            }`}
          >
            <span className="text-2xl">{c.icon}</span>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{c.name}</span>
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <button onClick={onBack}
          className="flex-1 rounded-md border border-gray-300 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300">
          &larr; 戻る
        </button>
        <button onClick={() => onNext(cats.filter(c => c.selected))}
          disabled={cats.filter(c => c.selected).length === 0}
          className="flex-1 rounded-md bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
          次へ撰む →
        </button>
      </div>
    </div>
  );
}

function InviteStep({ onNext, onBack }: { onNext: (emails: string[]) => void; onBack: () => void }) {
  const [emailInput, setEmailInput] = useState('');
  const [emails, setEmails] = useState<string[]>([]);

  const addEmail = () => {
    const e = emailInput.trim().toLowerCase();
    if (e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && !emails.includes(e)) {
      setEmails(prev => [...prev, e]);
      setEmailInput('');
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">メンバーを招待</h2>
        <p className="mt-1 text-sm text-gray-500">メールアドレスで招待状を送信します。後でも追加できます。</p>
      </div>
      <div className="flex gap-2">
        <input
          type="email"
          value={emailInput}
          onChange={e => setEmailInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addEmail())}
          placeholder="user@company.com"
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
        <button onClick={addEmail}
          className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium hover:bg-gray-200 dark:bg-gray-700">
          追加
        </button>
      </div>
      {emails.length > 0 && (
        <ul className="space-y-1">
          {emails.map(e => (
            <li key={e} className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm dark:bg-gray-800">
              <span className="text-gray-800 dark:text-gray-200">{e}</span>
              <button onClick={() => setEmails(prev => prev.filter(x => x !== e))}
                className="text-gray-400 hover:text-red-500" aria-label={`${e}を削除`}>
                &times;
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-3">
        <button onClick={onBack}
          className="flex-1 rounded-md border border-gray-300 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300">
          &larr; 戻る
        </button>
        <button onClick={() => onNext(emails)}
          className="flex-1 rounded-md bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
          {emails.length > 0 ? `${emails.length}件の招待を送信` : 'スキップ'} →
        </button>
      </div>
    </div>
  );
}

export default function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [companyData, setCompanyData] = useState<CompanyForm | null>(null);
  const [departments, setDepartments] = useState<string[]>([]);
  const [categories, setCategories] = useState<typeof DEFAULT_CATEGORIES>([]);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const completeMutation = useMutation({
    mutationFn: (payload: object) =>
      fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      }).then(r => { if (!r.ok) throw new Error(); return r.json(); }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tenant-settings'] });
      setStep(4);
    },
  });

  const handleInvite = (emails: string[]) => {
    completeMutation.mutate({ company: companyData, departments, categories, invite_emails: emails });
  };

  if (step === 4) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">セットアップ完了！</h2>
          <p className="mt-2 text-gray-500">{companyData?.company_name} の経費管理システムが準備できました。</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-6 rounded-md bg-blue-600 px-6 py-2.5 font-medium text-white hover:bg-blue-700"
          >
            ダッシュボードへ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Shubox</h1>
          <p className="mt-1 text-sm text-gray-500">経費管理システムの初期設定</p>
        </div>
        <div className="mb-8">
          <StepIndicator current={step} />
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          {step === 0 && <CompanyStep onNext={d => { setCompanyData(d); setStep(1); }} />}
          {step === 1 && <DepartmentsStep onNext={d => { setDepartments(d); setStep(2); }} onBack={() => setStep(0)} />}
          {step === 2 && <CategoriesStep onNext={c => { setCategories(c); setStep(3); }} onBack={() => setStep(1)} />}
          {step === 3 && <InviteStep onNext={handleInvite} onBack={() => setStep(2)} />}
        </div>
      </div>
    </div>
  );
}
