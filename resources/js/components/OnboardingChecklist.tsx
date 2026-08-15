import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';

interface ChecklistStep {
  id: string;
  title: string;
  description: string;
  href?: string;
  actionLabel?: string;
}

const STEPS: ChecklistStep[] = [
  {
    id: 'invite_team',
    title: 'Invite your team',
    description: 'Add employees so they can submit and approve expenses.',
    href: '/admin/users/invite',
    actionLabel: 'Invite members',
  },
  {
    id: 'create_categories',
    title: 'Set up expense categories',
    description: 'Create categories like Travel, Meals, and Software to organize expenses.',
    href: '/admin/categories',
    actionLabel: 'Add categories',
  },
  {
    id: 'configure_approval',
    title: 'Configure approval chains',
    description: 'Define who approves which expenses and at what amount thresholds.',
    href: '/admin/approval-chains',
    actionLabel: 'Set up approvals',
  },
  {
    id: 'set_budget',
    title: 'Create your first budget',
    description: 'Set spending limits for departments or projects.',
    href: '/budgets/new',
    actionLabel: 'Create budget',
  },
  {
    id: 'submit_expense',
    title: 'Submit your first expense',
    description: 'Try submitting an expense to see the workflow in action.',
    href: '/expenses/new',
    actionLabel: 'Submit expense',
  },
  {
    id: 'connect_slack',
    title: 'Connect Slack notifications',
    description: 'Get approval requests and status updates directly in Slack.',
    href: '/settings/integrations/slack',
    actionLabel: 'Connect Slack',
  },
];

const STORAGE_KEY = 'onboarding-completed-steps';

function loadCompleted(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function saveCompleted(ids: Set<string>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

function ProgressRing({ pct }: { pct: number }) {
  const r = 20;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width="52" height="52" viewBox="0 0 52 52">
      <circle cx="26" cy="26" r={r} fill="none" stroke="#e5e7eb" strokeWidth="4" className="dark:stroke-gray-700" />
      <circle
        cx="26" cy="26" r={r} fill="none" stroke="#2563eb" strokeWidth="4"
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        transform="rotate(-90 26 26)"
      />
      <text x="26" y="30" textAnchor="middle" fontSize="11" fontWeight="bold"
        className="fill-gray-900 dark:fill-gray-100">
        {Math.round(pct)}%
      </text>
    </svg>
  );
}

export default function OnboardingChecklist() {
  const [completed, setCompleted] = useState<Set<string>>(loadCompleted);
  const [dismissed, setDismissed] = useState(() =>
    localStorage.getItem('onboarding-dismissed') === '1'
  );

  const markComplete = useMutation({
    mutationFn: (stepId: string) =>
      fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: stepId }),
      }).then((r) => r.json()),
    onMutate: (stepId) => {
      const next = new Set(completed).add(stepId);
      setCompleted(next);
      saveCompleted(next);
    },
  });

  const pct = (completed.size / STEPS.length) * 100;
  const allDone = completed.size === STEPS.length;

  const dismiss = () => {
    localStorage.setItem('onboarding-dismissed', '1');
    setDismissed(true);
  };

  if (dismissed || allDone) return null;

  return (
    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-700/40 dark:bg-blue-900/20">
      <div className="flex items-start gap-4">
        <ProgressRing pct={pct} />
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-bold text-gray-900 dark:text-gray-100">
                Set up your workspace
              </h2>
              <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
                {completed.size} of {STEPS.length} steps completed
              </p>
            </div>
            <button
              onClick={dismiss}
              className="rounded p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Dismiss onboarding"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <ul className="mt-4 space-y-2">
            {STEPS.map((step) => {
              const done = completed.has(step.id);
              return (
                <li key={step.id} className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => !done && markComplete.mutate(step.id)}
                    className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                      done
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-gray-300 bg-white hover:border-blue-400 dark:border-gray-600 dark:bg-gray-700'
                    }`}
                    aria-label={done ? `${step.title} completed` : `Mark ${step.title} as done`}
                  >
                    {done && (
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium ${
                      done ? 'text-gray-400 line-through dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'
                    }`}>
                      {step.title}
                    </p>
                    {!done && (
                      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{step.description}</p>
                    )}
                  </div>

                  {!done && step.href && (
                    <a
                      href={step.href}
                      className="flex-shrink-0 text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {step.actionLabel ?? 'Go'} →
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
