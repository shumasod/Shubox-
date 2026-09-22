import React, { useId, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

type Expense = {
  id: number;
  title: string;
  amount: number;
  currency: string;
  expense_date: string;
  status: string;
  description: string | null;
  category: { id: number; name: string } | null;
  project: { id: number; name: string } | null;
  user: { id: number; name: string; email: string; department: string | null };
  receipts: Array<{ id: number; name: string; url: string }>;
  policy_violations: Array<{ type: string; message: string; severity: 'error' | 'warning' }>;
  my_approval: { id: number; status: string } | null;
};

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency }).format(amount);
}

function PolicyAlert({ violations }: { violations: Expense['policy_violations'] }) {
  if (!violations.length) return null;

  const errors   = violations.filter(v => v.severity === 'error');
  const warnings = violations.filter(v => v.severity === 'warning');

  return (
    <div className="space-y-2">
      {errors.length > 0 && (
        <div role="alert" className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
          <p className="mb-2 text-sm font-semibold text-red-800 dark:text-red-300">ポリシー違反</p>
          <ul className="space-y-1">
            {errors.map((v, i) => (
              <li key={i} className="text-sm text-red-700 dark:text-red-300">• {v.message}</li>
            ))}
          </ul>
        </div>
      )}
      {warnings.length > 0 && (
        <div role="alert" className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4">
          <p className="mb-2 text-sm font-semibold text-amber-800 dark:text-amber-300">警告</p>
          <ul className="space-y-1">
            {warnings.map((v, i) => (
              <li key={i} className="text-sm text-amber-700 dark:text-amber-300">• {v.message}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

interface ActionPanelProps {
  approvalId: number;
  onDone: () => void;
}

function ActionPanel({ approvalId, onDone }: ActionPanelProps) {
  const textareaId = useId();
  const [comment, setComment] = useState('');
  const [action,  setAction]  = useState<'approve' | 'reject' | null>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ act, cmt }: { act: 'approve' | 'reject'; cmt: string }) =>
      api.post(`/approvals/${approvalId}/${act}`, { comment: cmt }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      onDone();
    },
  });

  const rejectRequiresComment = action === 'reject' && !comment.trim();

  return (
    <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow ring-1 ring-gray-200 dark:ring-gray-700">
      <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">承認アクション</h2>

      <div role="radiogroup" aria-label="アクションを選択" className="mb-4 flex gap-3">
        {(['approve', 'reject'] as const).map(a => (
          <label key={a} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="approval-action"
              value={a}
              checked={action === a}
              onChange={() => setAction(a)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
            <span className={`text-sm font-medium ${
              a === 'approve' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
            }`}>
              {a === 'approve' ? '承認' : '却下'}
            </span>
          </label>
        ))}
      </div>

      <div>
        <label htmlFor={textareaId} className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
          コメント{action === 'reject' && <span aria-hidden="true" className="ml-1 text-red-500">*必須</span>}
        </label>
        <textarea
          id={textareaId}
          rows={3}
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder={action === 'reject' ? '却下理由を入力してください...' : 'コメント（任意）'}
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        {rejectRequiresComment && (
          <p role="alert" className="mt-1 text-xs text-red-500">却下には理由が必要です。</p>
        )}
      </div>

      {mutation.isError && (
        <p role="alert" className="mt-2 text-sm text-red-500">処理に失敗しました。もう一度お試しください。</p>
      )}

      <div className="mt-4 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => { setAction(null); setComment(''); }}
          className="rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          リセット
        </button>
        <button
          type="button"
          onClick={() => action && mutation.mutate({ act: action, cmt: comment })}
          disabled={!action || rejectRequiresComment || mutation.isPending}
          className={`rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${
            action === 'approve'
              ? 'bg-green-600 hover:bg-green-700'
              : action === 'reject'
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-gray-400'
          }`}
        >
          {mutation.isPending ? '処理中...' : action === 'approve' ? '承認する' : action === 'reject' ? '却下する' : 'アクションを選択'}
        </button>
      </div>
    </div>
  );
}

export function ApproverExpenseView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: expense, isLoading } = useQuery<Expense>({
    queryKey: ['approver-expense', id],
    queryFn: () => api.get(`/approvals/expense/${id}`).then(r => r.data),
    enabled: Boolean(id),
  });

  if (isLoading || !expense) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 space-y-4 animate-pulse">
        <div className="h-6 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-48 rounded-xl bg-gray-100 dark:bg-gray-800" />
      </div>
    );
  }

  const alreadyActed = expense.my_approval?.status !== 'pending';

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 space-y-5">
      <button
        type="button"
        onClick={() => navigate('/approvals')}
        className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        ← 承認一覧に戻る
      </button>

      {/* Expense summary */}
      <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow ring-1 ring-gray-200 dark:ring-gray-700">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{expense.title}</h1>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {formatCurrency(expense.amount, expense.currency)}
            </p>
          </div>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <dt className="text-gray-500 dark:text-gray-400">申請者</dt>
            <dd className="font-medium text-gray-800 dark:text-gray-100">{expense.user.name}</dd>
          </div>
          <div>
            <dt className="text-gray-500 dark:text-gray-400">部署</dt>
            <dd className="font-medium text-gray-800 dark:text-gray-100">{expense.user.department ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-gray-500 dark:text-gray-400">日付</dt>
            <dd className="font-medium text-gray-800 dark:text-gray-100">{expense.expense_date}</dd>
          </div>
          <div>
            <dt className="text-gray-500 dark:text-gray-400">カテゴリ</dt>
            <dd className="font-medium text-gray-800 dark:text-gray-100">{expense.category?.name ?? '—'}</dd>
          </div>
          {expense.project && (
            <div>
              <dt className="text-gray-500 dark:text-gray-400">プロジェクト</dt>
              <dd className="font-medium text-gray-800 dark:text-gray-100">{expense.project.name}</dd>
            </div>
          )}
        </dl>

        {expense.description && (
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{expense.description}</p>
        )}
      </div>

      {/* Policy violations */}
      <PolicyAlert violations={expense.policy_violations} />

      {/* Receipts */}
      {expense.receipts.length > 0 && (
        <div className="rounded-xl bg-white dark:bg-gray-800 p-4 shadow ring-1 ring-gray-200 dark:ring-gray-700">
          <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">領収書</h2>
          <ul className="flex flex-wrap gap-2">
            {expense.receipts.map(r => (
              <li key={r.id}>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400"
                >
                  📄 {r.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action panel */}
      {alreadyActed ? (
        <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-6 text-center text-sm text-gray-500 dark:text-gray-400">
          この経費はすでに対応済みです（{expense.my_approval?.status === 'approved' ? '承認' : '却下'}）。
        </div>
      ) : expense.my_approval ? (
        <ActionPanel
          approvalId={expense.my_approval.id}
          onDone={() => navigate('/approvals')}
        />
      ) : null}
    </main>
  );
}
