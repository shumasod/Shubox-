import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

interface ApprovalStep {
  id: number;
  step_order: number;
  approver_name: string;
  approver_role: string;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  decided_at: string | null;
  comment: string | null;
}

interface Props {
  expenseId: number;
}

const STATUS_CONFIG: Record<ApprovalStep['status'], { label: string; color: string; icon: string }> = {
  pending:  { label: 'Pending',  color: 'text-yellow-600 bg-yellow-50 border-yellow-200', icon: 'clock' },
  approved: { label: 'Approved', color: 'text-green-600 bg-green-50 border-green-200',   icon: 'check' },
  rejected: { label: 'Rejected', color: 'text-red-600 bg-red-50 border-red-200',         icon: 'x' },
  skipped:  { label: 'Skipped',  color: 'text-gray-400 bg-gray-50 border-gray-200',      icon: 'minus' },
};

const StepIcon: React.FC<{ status: ApprovalStep['status'] }> = ({ status }) => {
  const icons: Record<string, React.ReactNode> = {
    check: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    x: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    clock: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    minus: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
      </svg>
    ),
  };
  return <>{icons[STATUS_CONFIG[status].icon]}</>;
};

export const ApprovalWorkflowView: React.FC<Props> = ({ expenseId }) => {
  const { data: steps = [], isLoading } = useQuery<ApprovalStep[]>({
    queryKey: ['approval-steps', expenseId],
    queryFn: () => api.get(`/expenses/${expenseId}/approval-steps`).then(r => r.data.data),
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (steps.length === 0) {
    return <p className="text-sm text-gray-500">No approval steps defined for this expense.</p>;
  }

  return (
    <div className="space-y-1">
      {steps.map((step, idx) => {
        const cfg = STATUS_CONFIG[step.status];
        return (
          <div key={step.id} className="flex items-start gap-3">
            {/* connector line */}
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                <StepIcon status={step.status} />
              </div>
              {idx < steps.length - 1 && (
                <div className="w-0.5 h-6 bg-gray-200 dark:bg-gray-700 mt-1" />
              )}
            </div>

            {/* content */}
            <div className="flex-1 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {step.approver_name}
                  </span>
                  <span className="ml-2 text-xs text-gray-500">{step.approver_role}</span>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${cfg.color}`}>
                  <StepIcon status={step.status} />
                  {cfg.label}
                </span>
              </div>

              {step.decided_at && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(step.decided_at).toLocaleString()}
                </p>
              )}

              {step.comment && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded px-2 py-1">
                  "{step.comment}"
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
