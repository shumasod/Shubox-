import React, { useId, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { ExpenseTimeline } from '../components/ExpenseTimeline';

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
  user: { id: number; name: string; email: string };
  receipts: Array<{ id: number; name: string; url: string; mime_type: string }>;
  approvals: Array<{ id: number; approver: { name: string }; status: string; comment: string | null; acted_at: string | null }>;
  created_at: string;
};

type Comment = {
  id: number;
  body: string;
  is_internal: boolean;
  user_name: string;
  reply_count: number;
  created_at: string;
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  draft:     { label: '下書き', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200' },
  submitted: { label: '申請中', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  approved:  { label: '承認済', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  rejected:  { label: '却下',   color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  paid:      { label: '支払済', color: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200' },
  cancelled: { label: 'キャンセル', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
};

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency }).format(amount);
}

function CommentBox({ expenseId }: { expenseId: number }) {
  const textareaId = useId();
  const [body, setBody] = useState('');
  const queryClient = useQueryClient();

  const { data: comments = [] } = useQuery<Comment[]>({
    queryKey: ['comments', expenseId],
    queryFn: () => api.get(`/expenses/${expenseId}/comments`).then(r => r.data),
  });

  const mutation = useMutation({
    mutationFn: (text: string) => api.post(`/expenses/${expenseId}/comments`, { body: text }),
    onSuccess: () => {
      setBody('');
      queryClient.invalidateQueries({ queryKey: ['comments', expenseId] });
    },
  });

  return (
    <section aria-label="コメント">
      <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">コメント</h3>
      <ul className="mb-4 space-y-3">
        {comments.map(c => (
          <li key={c.id} className={`rounded-lg p-3 text-sm ${
            c.is_internal
              ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
              : 'bg-gray-50 dark:bg-gray-700/50'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-gray-800 dark:text-gray-100">{c.user_name}</span>
              {c.is_internal && <span className="text-xs text-yellow-600 dark:text-yellow-400">内部メモ</span>}
              <time className="ml-auto text-xs text-gray-400" dateTime={c.created_at}>
                {new Intl.DateTimeFormat('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(c.created_at))}
              </time>
            </div>
            <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-200">{c.body}</p>
          </li>
        ))}
      </ul>
      <div>
        <label htmlFor={textareaId} className="sr-only">コメントを入力</label>
        <textarea
          id={textareaId}
          rows={3}
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="コメントを入力..."
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={() => body.trim() && mutation.mutate(body.trim())}
            disabled={!body.trim() || mutation.isPending}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {mutation.isPending ? '送信中...' : '送信'}
          </button>
        </div>
      </div>
    </section>
  );
}

export function ExpenseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: expense, isLoading, isError } = useQuery<Expense>({
    queryKey: ['expenses', id],
    queryFn: () => api.get(`/expenses/${id}`).then(r => r.data),
    enabled: Boolean(id),
  });

  const submitMutation = useMutation({
    mutationFn: () => api.post(`/expenses/${id}/submit`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses', id] }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/expenses/${id}`),
    onSuccess: () => navigate('/expenses'),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 space-y-4 animate-pulse">
        <div className="h-6 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-32 rounded-xl bg-gray-100 dark:bg-gray-800" />
      </div>
    );
  }

  if (isError || !expense) {
    return <p className="p-8 text-center text-red-500">経費情報の読み込みに失敗しました。</p>;
  }

  const status = STATUS_MAP[expense.status] ?? { label: expense.status, color: 'bg-gray-100 text-gray-700' };
  const isDraft = expense.status === 'draft';

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      {/* Breadcrumb */}
      <nav aria-label="パンくず">
        <ol className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
          <li><Link to="/expenses" className="hover:underline">経費一覧</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-gray-800 dark:text-gray-100">{expense.title}</li>
        </ol>
      </nav>

      {/* Header card */}
      <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow ring-1 ring-gray-200 dark:ring-gray-700">
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white truncate">{expense.title}</h1>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(expense.amount, expense.currency)}
            </p>
          </div>
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${status.color}`}>
            {status.label}
          </span>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-gray-500 dark:text-gray-400">日付</dt>
            <dd className="font-medium text-gray-800 dark:text-gray-100">{expense.expense_date}</dd>
          </div>
          <div>
            <dt className="text-gray-500 dark:text-gray-400">カテゴリ</dt>
            <dd className="font-medium text-gray-800 dark:text-gray-100">{expense.category?.name ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-gray-500 dark:text-gray-400">プロジェクト</dt>
            <dd className="font-medium text-gray-800 dark:text-gray-100">{expense.project?.name ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-gray-500 dark:text-gray-400">申請者</dt>
            <dd className="font-medium text-gray-800 dark:text-gray-100">{expense.user.name}</dd>
          </div>
        </dl>

        {expense.description && (
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{expense.description}</p>
        )}

        {/* Action buttons */}
        {isDraft && (
          <div className="mt-5 flex gap-3">
            <Link
              to={`/expenses/${expense.id}/edit`}
              className="rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              編集
            </Link>
            <button
              type="button"
              onClick={() => submitMutation.mutate()}
              disabled={submitMutation.isPending}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {submitMutation.isPending ? '申請中...' : '申請する'}
            </button>
            <button
              type="button"
              onClick={() => window.confirm('削除してもよいですか？') && deleteMutation.mutate()}
              className="ml-auto text-sm text-red-500 hover:underline"
            >
              削除
            </button>
          </div>
        )}
      </div>

      {/* Receipts */}
      {expense.receipts.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">領収書 ({expense.receipts.length})</h2>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {expense.receipts.map(r => (
              <li key={r.id}>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <span aria-hidden="true">{r.mime_type === 'application/pdf' ? '📄' : '🖼️'}</span>
                  <span className="truncate text-gray-700 dark:text-gray-200">{r.name}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Approval steps */}
      {expense.approvals.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">承認ステップ</h2>
          <ol className="space-y-2">
            {expense.approvals.map((a, i) => (
              <li key={a.id} className="flex items-start gap-3 rounded-lg bg-gray-50 dark:bg-gray-800 p-3 text-sm">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-xs font-medium">{i + 1}</span>
                <div className="flex-1">
                  <p className="font-medium text-gray-800 dark:text-gray-100">{a.approver.name}</p>
                  {a.comment && <p className="mt-0.5 text-gray-500 dark:text-gray-400">{a.comment}</p>}
                </div>
                <span className={`text-xs font-medium ${
                  a.status === 'approved' ? 'text-green-600' :
                  a.status === 'rejected' ? 'text-red-600' : 'text-gray-400'
                }`}>
                  {a.status === 'approved' ? '承認済' : a.status === 'rejected' ? '却下' : '待機中'}
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Comments */}
      <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow ring-1 ring-gray-200 dark:ring-gray-700">
        <CommentBox expenseId={expense.id} />
      </div>

      {/* Timeline */}
      <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow ring-1 ring-gray-200 dark:ring-gray-700">
        <ExpenseTimeline expenseId={expense.id} />
      </div>
    </main>
  );
}
