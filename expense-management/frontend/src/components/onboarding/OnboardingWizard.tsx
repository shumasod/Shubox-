import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiClient } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';

const STEPS = ['会社情報', '部門設定', '承認フロー', '完了'] as const;

const step1Schema = z.object({
  company_name: z.string().min(1).max(100),
  fiscal_year_start: z.enum(['01', '04', '07', '10']),
  currency: z.enum(['JPY', 'USD', 'EUR']),
});

const step2Schema = z.object({
  departments: z.array(z.string().min(1)).min(1).max(20),
});

type Step1 = z.infer<typeof step1Schema>;
type Step2 = z.infer<typeof step2Schema>;

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {STEPS.map((label, i) => (
        <React.Fragment key={label}>
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                i < current
                  ? 'bg-indigo-600 text-white'
                  : i === current
                  ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-600'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {i < current ? '✓' : i + 1}
            </div>
            <span className={`text-xs ${i === current ? 'text-indigo-700 font-medium' : 'text-gray-400'}`}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mb-5 ${i < current ? 'bg-indigo-500' : 'bg-gray-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function OnboardingWizard({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [step1Data, setStep1Data] = useState<Step1 | null>(null);
  const [departments, setDepartments] = useState<string[]>(['']);
  const user = useAuthStore(s => s.user);

  const form1 = useForm<Step1>({ resolver: zodResolver(step1Schema) });

  const completeMutation = useMutation({
    mutationFn: (payload: object) => apiClient.post('/api/v1/onboarding/complete', payload),
    onSuccess: onComplete,
  });

  const handleStep1 = (data: Step1) => {
    setStep1Data(data);
    setStep(1);
  };

  const handleStep2 = () => {
    const valid = departments.filter(d => d.trim());
    if (valid.length === 0) return;
    setStep(2);
  };

  const handleFinish = () => {
    completeMutation.mutate({
      ...step1Data,
      departments: departments.filter(d => d.trim()),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg p-8">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Shuboxへようこそ</h1>
        <p className="text-sm text-gray-500 mb-6">{user?.name}さん、初期設定を完了してください</p>

        <StepIndicator current={step} />

        {step === 0 && (
          <form onSubmit={form1.handleSubmit(handleStep1)} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">会社名 *</label>
              <input {...form1.register('company_name')} className="w-full border rounded px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">会計年度開始月 *</label>
              <select {...form1.register('fiscal_year_start')} className="w-full border rounded px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600">
                <option value="01">1月 (正期)</option>
                <option value="04">4月 (日本会計年度)</option>
                <option value="07">7月</option>
                <option value="10">10月</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">通貨 *</label>
              <select {...form1.register('currency')} className="w-full border rounded px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600">
                <option value="JPY">JPY (日本円)</option>
                <option value="USD">USD (米ドル)</option>
                <option value="EUR">EUR (ユーロ)</option>
              </select>
            </div>
            <button type="submit" className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">次へ</button>
          </form>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">部門を登録してください（後から追加できます）</p>
            {departments.map((d, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={d}
                  onChange={e => setDepartments(prev => prev.map((v, j) => j === i ? e.target.value : v))}
                  placeholder={`部門名 ${i + 1}`}
                  className="flex-1 border rounded px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600"
                />
                {departments.length > 1 && (
                  <button onClick={() => setDepartments(prev => prev.filter((_, j) => j !== i))} className="text-red-400 text-sm">削除</button>
                )}
              </div>
            ))}
            {departments.length < 20 && (
              <button onClick={() => setDepartments(p => [...p, ''])} className="text-indigo-600 text-sm">+ 部門を追加</button>
            )}
            <div className="flex gap-3">
              <button onClick={() => setStep(0)} className="flex-1 py-2 border rounded-lg text-sm">戻る</button>
              <button onClick={handleStep2} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">次へ</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">承認フローは後で設定できます。ただち始める場合はこのまま進んでください。</p>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-xs text-gray-500 space-y-1">
              <p>• デフォルト: 1万円未満 → 直接承認</p>
              <p>• 1万円以上 → 上長承認必須</p>
              <p>• 10万円以上 → 役員承認必須</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-2 border rounded-lg text-sm">戻る</button>
              <button
                onClick={handleFinish}
                disabled={completeMutation.isPending}
                className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50"
              >
                {completeMutation.isPending ? '保存中...' : '設定完了'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
