import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';

interface Step {
  id:    string;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  { id: 'company',      title: 'Company Info',      description: 'Basic company details' },
  { id: 'departments',  title: 'Departments',        description: 'Set up your org structure' },
  { id: 'approvals',    title: 'Approval Flow',      description: 'Define who approves expenses' },
  { id: 'categories',   title: 'Categories',         description: 'Expense categories and budgets' },
  { id: 'invite',       title: 'Invite Team',        description: 'Add your first team members' },
];

interface FormData {
  company:     { name: string; fiscal_year_start: number };
  departments: { name: string; code: string }[];
  approvals:   { approver_email: string; limit: string }[];
  categories:  { name: string; color: string; monthly_limit: string }[];
  invites:     { email: string; role: string }[];
}

const DEFAULT_FORM: FormData = {
  company:     { name: '', fiscal_year_start: 1 },
  departments: [{ name: '', code: '' }],
  approvals:   [{ approver_email: '', limit: '' }],
  categories:  [
    { name: 'Travel',        color: '#6366f1', monthly_limit: '' },
    { name: 'Meals',         color: '#10b981', monthly_limit: '' },
    { name: 'Office Supply', color: '#f59e0b', monthly_limit: '' },
  ],
  invites:     [{ email: '', role: 'employee' }],
};

const StepIndicator: React.FC<{ steps: Step[]; current: number }> = ({ steps, current }) => (
  <nav aria-label="Progress" className="flex items-center gap-2">
    {steps.map((step, idx) => (
      <React.Fragment key={step.id}>
        <div className="flex flex-col items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 ${
            idx < current  ? 'bg-indigo-600 border-indigo-600 text-white'
            : idx === current ? 'border-indigo-600 text-indigo-600'
            : 'border-gray-300 text-gray-400'
          }`}>
            {idx < current
              ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
              : idx + 1
            }
          </div>
          <span className={`mt-1 text-[10px] font-medium hidden sm:block ${
            idx === current ? 'text-indigo-600' : 'text-gray-400'
          }`}>{step.title}</span>
        </div>
        {idx < steps.length - 1 && (
          <div className={`flex-1 h-0.5 mt-[-16px] ${
            idx < current ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
          }`} />
        )}
      </React.Fragment>
    ))}
  </nav>
);

export const OnboardingWizard: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep]   = useState(0);
  const [form, setForm]   = useState<FormData>(DEFAULT_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const completeMutation = useMutation({
    mutationFn: () => api.post('/onboarding/complete', form),
    onSuccess: onComplete,
  });

  const next = () => {
    setErrors({});
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else completeMutation.mutate();
  };

  const back = () => setStep(s => Math.max(0, s - 1));

  const current = STEPS[step];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Welcome! Let's set up your account</h1>
          <StepIndicator steps={STEPS} current={step} />
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">{current.title}</h2>
          <p className="text-sm text-gray-500 mb-6">{current.description}</p>

          {/* Step 0: Company */}
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company name</label>
                <input
                  type="text"
                  value={form.company.name}
                  onChange={e => setForm(f => ({ ...f, company: { ...f.company, name: e.target.value } }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800"
                  placeholder="Acme Corporation"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fiscal year starts</label>
                <select
                  value={form.company.fiscal_year_start}
                  onChange={e => setForm(f => ({ ...f, company: { ...f.company, fiscal_year_start: +e.target.value } }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800"
                >
                  {['January','February','March','April','May','June','July','August','September','October','November','December']
                    .map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Step 4: Invite */}
          {step === 4 && (
            <div className="space-y-3">
              {form.invites.map((invite, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="email"
                    value={invite.email}
                    onChange={e => setForm(f => {
                      const invites = [...f.invites];
                      invites[i] = { ...invites[i], email: e.target.value };
                      return { ...f, invites };
                    })}
                    placeholder="colleague@company.com"
                    className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800"
                  />
                  <select
                    value={invite.role}
                    onChange={e => setForm(f => {
                      const invites = [...f.invites];
                      invites[i] = { ...invites[i], role: e.target.value };
                      return { ...f, invites };
                    })}
                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-2 text-sm bg-white dark:bg-gray-800"
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, invites: [...f.invites, { email: '', role: 'employee' }] }))}
                className="text-sm text-indigo-600 hover:text-indigo-700"
              >
                + Add another
              </button>
            </div>
          )}

          {/* Steps 1-3: placeholder */}
          {step >= 1 && step <= 3 && (
            <p className="text-sm text-gray-400 italic">Configure {current.title.toLowerCase()} settings here.</p>
          )}
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={back}
            disabled={step === 0}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Back
          </button>
          <button
            onClick={next}
            disabled={completeMutation.isPending}
            className="px-6 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {step === STEPS.length - 1
              ? (completeMutation.isPending ? 'Setting up...' : 'Finish')
              : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};
