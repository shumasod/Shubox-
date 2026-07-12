import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';

interface ApprovalStep {
  id: number;
  step_order: number;
  approver_name: string;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  comment: string | null;
  acted_at: string | null;
}

interface Receipt {
  id: number;
  filename: string;
  url: string;
  mime_type: string;
  size_bytes: number;
}

interface Expense {
  id: number;
  title: string;
  amount: number;
  currency: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  category: string;
  description: string | null;
  project_code: string | null;
  submitted_at: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  submitted_by: { id: number; name: string; email: string } | null;
  receipts: Receipt[];
  approval_steps: ApprovalStep[];
}

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  submitted: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  approved: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

const STEP_STATUS_ICON: Record<string, string> = {
  approved: '✔',
  rejected: '✘',
  pending: '○',
  skipped: '‒',
};

function formatCurrency(amount: number, currency = 'JPY') {
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency }).format(amount);
}

function ReceiptThumbnail({ receipt }: { receipt: Receipt }) {
  const isImage = receipt.mime_type.startsWith('image/');
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group relative w-24 h-24 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-blue-400 transition-colors"
      >
        {isImage ? (
          <img src={receipt.url} alt={receipt.filename} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1 bg-gray-50 dark:bg-gray-800">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-xs text-gray-500">PDF</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
      </button>

      {open && isImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          onClick={() => setOpen(false)}
        >
          <img
            src={receipt.url}
            alt={receipt.filename}
            className="max-w-full max-h-full rounded-lg shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

export default function ExpenseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [approvalComment, setApprovalComment] = useState('');

  const { data: expense, isLoading } = useQuery<Expense>({
    queryKey: ['expense', id],
    queryFn: () => fetch(`/api/expenses/${id}`).then(r => {
      if (!r.ok) throw new Error('Not found');
      return r.json();
    }),
  });

  const approveMutation = useMutation({
    mutationFn: (action: 'approve' | 'reject') =>
      fetch(`/api/expenses/${id}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: approvalComment }),
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense', id] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setApprovalComment('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => fetch(`/api/expenses/${id}`, { method: 'DELETE' }),
    onSuccess: () => navigate('/expenses'),
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        {[80, 120, 200, 160].map((h, i) => (
          <div key={i} className="rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" style={{ height: h }} />
        ))}
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">経費が見つかりません。</p>
        <Link to="/expenses" className="mt-4 inline-block text-sm text-blue-600 hover:underline">一覧に戻る</Link>
      </div>
    );
  }

  const canApprove = expense.status === 'submitted';
  const canDelete = expense.status === 'draft';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/expenses" className="hover:text-gray-700 dark:hover:text-gray-300">経費一覧</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white">{expense.title}</span>
      </nav>

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{expense.title}</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {expense.submitted_by?.name} · {new Date(expense.created_at).toLocaleDateString('ja-JP')}
            </p>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${STATUS_STYLES[expense.status]}`}>
            {expense.status}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: '金額', value: formatCurrency(expense.amount, expense.currency) },
            { label: 'カテゴリ', value: expense.category },
            { label: 'プロジェクトコード', value: expense.project_code ?? '—' },
            { label: '申請日', value: expense.submitted_at ? new Date(expense.submitted_at).toLocaleDateString('ja-JP') : '—' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
              <p className="mt-0.5 text-sm font-semibold text-gray-900 dark:text-white">{value}</p>
            </div>
          ))}
        </div>

        {expense.description && (
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{expense.description}</p>
        )}
      </div>

      {/* Receipts */}
      {expense.receipts.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">領収書 ({expense.receipts.length})</h2>
          <div className="flex flex-wrap gap-3">
            {expense.receipts.map(r => <ReceiptThumbnail key={r.id} receipt={r} />)}
          </div>
        </div>
      )}

      {/* Approval timeline */}
      {expense.approval_steps.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">承認フロー</h2>
          <ol className="space-y-4">
            {expense.approval_steps.map((step, i) => (
              <li key={step.id} className="flex gap-4">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  step.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : step.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                }`}>
                  {STEP_STATUS_ICON[step.status]}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{step.approver_name}</p>
                  {step.acted_at && (
                    <p className="text-xs text-gray-400">{new Date(step.acted_at).toLocaleString('ja-JP')}</p>
                  )}
                  {step.comment && (
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2">
                      {step.comment}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Approval actions */}
      {canApprove && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">承認アクション</h2>
          <textarea
            value={approvalComment}
            onChange={e => setApprovalComment(e.target.value)}
            placeholder="コメント（任意）..."
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm resize-none placeholder-gray-400"
          />
          <div className="flex gap-3">
            <button
              onClick={() => approveMutation.mutate('approve')}
              disabled={approveMutation.isPending}
              className="flex-1 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg"
            >
              承認
            </button>
            <button
              onClick={() => approveMutation.mutate('reject')}
              disabled={approveMutation.isPending}
              className="flex-1 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg"
            >
              却下
            </button>
          </div>
        </div>
      )}

      {/* Danger zone */}
      {canDelete && (
        <div className="flex justify-end">
          <button
            onClick={() => { if (confirm('この経費申請を削除しますか？')) deleteMutation.mutate(); }}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 border border-red-200 hover:border-red-400 rounded-lg"
          >
            申請を削除
          </button>
        </div>
      )}
    </div>
  );
}
