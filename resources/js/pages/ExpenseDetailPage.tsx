import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import UserAvatar from '../components/UserAvatar';
import ExpenseCommentThread from '../components/ExpenseCommentThread';
import ExpenseDuplicateButton from '../components/ExpenseDuplicateButton';

interface LineItem {
  id: number;
  description: string;
  unit_price: number;
  quantity: number;
  amount: number;
  unit?: string;
}

interface Expense {
  id: number;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  status: string;
  expense_date: string;
  submitted_at?: string;
  approved_at?: string;
  category: { id: number; name: string; color: string };
  user: { id: number; name: string; avatar_url?: string };
  line_items?: LineItem[];
  allowed_transitions?: string[];
}

const STATUS_LABELS: Record<string, string> = {
  draft:    'Draft',
  pending:  'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  paid:     'Paid',
  archived: 'Archived',
};

const STATUS_COLORS: Record<string, string> = {
  draft:    'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  pending:  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  paid:     'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  archived: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
};

async function fetchExpense(id: string): Promise<Expense> {
  const res = await fetch(`/api/v1/expenses/${id}`, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error('Expense not found');
  return res.json();
}

async function transitionStatus(id: number, status: string, comment?: string): Promise<Expense> {
  const res = await fetch(`/api/v1/expenses/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ status, comment }),
  });
  if (!res.ok) throw new Error('Transition failed');
  return res.json();
}

const fmt = (amount: number, currency: string) =>
  new Intl.NumberFormat('ja-JP', { style: 'currency', currency }).format(amount);

export default function ExpenseDetailPage() {
  const { id }       = useParams<{ id: string }>();
  const navigate     = useNavigate();
  const queryClient  = useQueryClient();
  const [rejectComment, setRejectComment] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const { data: expense, isLoading, error } = useQuery({
    queryKey: ['expense', id],
    queryFn:  () => fetchExpense(id!),
    enabled:  !!id,
  });

  const { mutate: doTransition, isPending } = useMutation({
    mutationFn: ({ status, comment }: { status: string; comment?: string }) =>
      transitionStatus(Number(id), status, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense', id] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (error || !expense) return <div className="p-8 text-center text-red-500">Expense not found.</div>;

  const canSubmit  = expense.allowed_transitions?.includes('pending');
  const canApprove = expense.allowed_transitions?.includes('approved');
  const canReject  = expense.allowed_transitions?.includes('rejected');
  const canPay     = expense.allowed_transitions?.includes('paid');

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <button onClick={() => navigate(-1)} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline mb-2 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{expense.title}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[expense.status]}`}>
              {STATUS_LABELS[expense.status]}
            </span>
            <span className="w-2 h-2 rounded-full" style={{ background: expense.category.color }} />
            <span className="text-sm text-gray-500 dark:text-gray-400">{expense.category.name}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
            {fmt(expense.amount, expense.currency)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{expense.expense_date}</div>
        </div>
      </div>

      {/* Submitter */}
      <div className="flex items-center gap-3 mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
        <UserAvatar name={expense.user.name} src={expense.user.avatar_url} size="md" />
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">{expense.user.name}</p>
          {expense.submitted_at && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Submitted {new Date(expense.submitted_at).toLocaleDateString('ja-JP')}
            </p>
          )}
        </div>
        <div className="ml-auto">
          <ExpenseDuplicateButton expense={expense} />
        </div>
      </div>

      {/* Description */}
      {expense.description && (
        <div className="mb-6">
          <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{expense.description}</p>
        </div>
      )}

      {/* Line items */}
      {expense.line_items && expense.line_items.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Line Items</h2>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="text-left px-4 py-2 text-gray-600 dark:text-gray-400 font-medium">Description</th>
                  <th className="text-right px-4 py-2 text-gray-600 dark:text-gray-400 font-medium">Qty</th>
                  <th className="text-right px-4 py-2 text-gray-600 dark:text-gray-400 font-medium">Unit Price</th>
                  <th className="text-right px-4 py-2 text-gray-600 dark:text-gray-400 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {expense.line_items.map(item => (
                  <tr key={item.id}>
                    <td className="px-4 py-2 text-gray-900 dark:text-white">{item.description}</td>
                    <td className="px-4 py-2 text-right text-gray-500 dark:text-gray-400 tabular-nums">
                      {item.quantity}{item.unit ? ` ${item.unit}` : ''}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums">{fmt(item.unit_price, expense.currency)}</td>
                    <td className="px-4 py-2 text-right font-medium tabular-nums">{fmt(item.amount, expense.currency)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <tr>
                  <td colSpan={3} className="px-4 py-2 text-right font-semibold text-gray-700 dark:text-gray-300">Total</td>
                  <td className="px-4 py-2 text-right font-bold text-gray-900 dark:text-white tabular-nums">{fmt(expense.amount, expense.currency)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
        {canSubmit && (
          <button onClick={() => doTransition({ status: 'pending' })} disabled={isPending}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
            Submit for Approval
          </button>
        )}
        {canApprove && (
          <button onClick={() => doTransition({ status: 'approved' })} disabled={isPending}
            className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
            Approve
          </button>
        )}
        {canReject && !showRejectForm && (
          <button onClick={() => setShowRejectForm(true)}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">
            Reject
          </button>
        )}
        {canPay && (
          <button onClick={() => doTransition({ status: 'paid' })} disabled={isPending}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            Mark as Paid
          </button>
        )}
      </div>

      {/* Reject form */}
      {showRejectForm && (
        <div className="mb-8 p-4 border border-red-200 dark:border-red-800 rounded-xl bg-red-50 dark:bg-red-900/10">
          <label className="block text-sm font-medium text-red-700 dark:text-red-300 mb-2">Rejection reason (required)</label>
          <textarea
            value={rejectComment}
            onChange={e => setRejectComment(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-red-300 dark:border-red-700 bg-white dark:bg-gray-800 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => { doTransition({ status: 'rejected', comment: rejectComment }); setShowRejectForm(false); }}
              disabled={!rejectComment.trim() || isPending}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              Confirm Reject
            </button>
            <button onClick={() => setShowRejectForm(false)} className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Comments */}
      <ExpenseCommentThread expenseId={expense.id} currentUserId={expense.user.id} />
    </div>
  );
}
