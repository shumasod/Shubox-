import { useState, useCallback, useId } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';

interface ApprovalItem {
  id: number;
  expense: {
    id: number;
    title: string;
    amount: number;
    currency: string;
    category: string;
    submitted_at: string;
  };
  submitter: { id: number; name: string; avatar_url: string | null };
  step_name: string;
  deadline_at: string | null;
  is_overdue: boolean;
}

interface ApprovalHistoryItem {
  id: number;
  expense: { id: number; title: string; amount: number; currency: string };
  submitter: { name: string };
  action: 'approved' | 'rejected';
  comment: string | null;
  acted_at: string;
}

const TABS = ['pending', 'history'] as const;
type Tab = typeof TABS[number];

const fmt = (amount: number, currency: string) =>
  new Intl.NumberFormat('ja-JP', { style: 'currency', currency }).format(amount);

const relativeTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return '1時間以内';
  if (hours < 24) return `${hours}時間前`;
  return `${Math.floor(hours / 24)}日前`;
};

function ApprovalCard({
  item,
  selected,
  onSelect,
  onApprove,
  onReject,
}: {
  item: ApprovalItem;
  selected: boolean;
  onSelect: (id: number) => void;
  onApprove: (id: number, comment: string) => void;
  onReject: (id: number, comment: string) => void;
}) {
  const [comment, setComment] = useState('');
  const [showComment, setShowComment] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const commentId = useId();

  const handleSubmit = () => {
    if (!action) return;
    if (action === 'approve') onApprove(item.id, comment);
    else onReject(item.id, comment);
    setComment('');
    setShowComment(false);
    setAction(null);
  };

  return (
    <div
      className={`rounded-lg border bg-white p-4 shadow-sm transition dark:bg-gray-800 ${
        item.is_overdue ? 'border-red-300 dark:border-red-700' : 'border-gray-200 dark:border-gray-700'
      } ${selected ? 'ring-2 ring-blue-500' : ''}`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(item.id)}
          aria-label={`Select ${item.expense.title}`}
          className="mt-1 h-4 w-4 rounded border-gray-300"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate font-medium text-gray-900 dark:text-white">
              {item.expense.title}
            </h3>
            <span className="shrink-0 font-semibold text-gray-900 dark:text-white">
              {fmt(item.expense.amount, item.expense.currency)}
            </span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
            <span>{item.submitter.name}</span>
            <span>·</span>
            <span>{item.expense.category}</span>
            <span>·</span>
            <span>{item.step_name}</span>
            <span>·</span>
            <span className={item.is_overdue ? 'text-red-600 dark:text-red-400' : ''}>
              {relativeTime(item.expense.submitted_at)}
            </span>
          </div>
          {item.is_overdue && (
            <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">期限超過</p>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={() => { setAction('approve'); setShowComment(true); }}
          className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
        >
          承認
        </button>
        <button
          onClick={() => { setAction('reject'); setShowComment(true); }}
          className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
        >
          否認
        </button>
        <a
          href={`/expenses/${item.expense.id}`}
          className="ml-auto text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          詳細を確認
        </a>
      </div>

      {showComment && (
        <div className="mt-3">
          <label htmlFor={commentId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            コメント{action === 'reject' ? '（必須）' : '（任意）'}
          </label>
          <textarea
            id={commentId}
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
          <div className="mt-2 flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={action === 'reject' && !comment.trim()}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {action === 'approve' ? '承認を確定' : '否認を確定'}
            </button>
            <button
              onClick={() => { setShowComment(false); setAction(null); setComment(''); }}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ApprovalInbox() {
  const [params, setParams] = useSearchParams();
  const tab: Tab = (params.get('tab') as Tab) ?? 'pending';
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const qc = useQueryClient();

  const pendingQuery = useQuery<ApprovalItem[]>({
    queryKey: ['approvals', 'pending'],
    queryFn: async () => {
      const r = await fetch('/api/approvals/pending');
      if (!r.ok) throw new Error('Failed to fetch');
      return (await r.json()).data;
    },
    enabled: tab === 'pending',
    refetchInterval: 60_000,
  });

  const historyQuery = useQuery<{ data: ApprovalHistoryItem[]; meta: Record<string, number> }>({
    queryKey: ['approvals', 'history', params.get('page') ?? '1'],
    queryFn: async () => {
      const r = await fetch(`/api/approvals/history?page=${params.get('page') ?? 1}`);
      if (!r.ok) throw new Error('Failed to fetch');
      return r.json();
    },
    enabled: tab === 'history',
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, comment }: { id: number; comment: string }) =>
      fetch(`/api/approvals/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ comment }),
      }).then(r => { if (!r.ok) throw new Error(); return r.json(); }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['approvals'] }),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, comment }: { id: number; comment: string }) =>
      fetch(`/api/approvals/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ comment }),
      }).then(r => { if (!r.ok) throw new Error(); return r.json(); }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['approvals'] }),
  });

  const bulkApproveMutation = useMutation({
    mutationFn: (ids: number[]) =>
      fetch('/api/approvals/bulk-approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ids }),
      }).then(r => { if (!r.ok) throw new Error(); return r.json(); }),
    onSuccess: () => { setSelected(new Set()); qc.invalidateQueries({ queryKey: ['approvals'] }); },
  });

  const toggleSelect = useCallback((id: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const pending = pendingQuery.data ?? [];
  const allSelected = pending.length > 0 && selected.size === pending.length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">承認受信トレイ</h1>

      {/* Tabs */}
      <div className="mt-4 flex border-b border-gray-200 dark:border-gray-700" role="tablist">
        {TABS.map(t => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setParams({ tab: t })}
            className={`px-4 py-2 text-sm font-medium ${
              tab === t
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            {t === 'pending' ? `承認待ち${pending.length ? ` (${pending.length})` : ''}` : '承認履歴'}
          </button>
        ))}
      </div>

      {/* Pending tab */}
      {tab === 'pending' && (
        <div className="mt-4">
          {pendingQuery.isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
              ))}
            </div>
          ) : pending.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              <p className="text-lg">承認待ちの申請はありません</p>
            </div>
          ) : (
            <>
              {/* Bulk actions */}
              <div className="mb-3 flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={() =>
                      setSelected(allSelected ? new Set() : new Set(pending.map(p => p.id)))
                    }
                    className="h-4 w-4 rounded"
                  />
                  全て選択
                </label>
                {selected.size > 0 && (
                  <button
                    onClick={() => bulkApproveMutation.mutate([...selected])}
                    disabled={bulkApproveMutation.isPending}
                    className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    {selected.size}件を一括承認
                  </button>
                )}
              </div>
              <div className="space-y-4">
                {pending.map(item => (
                  <ApprovalCard
                    key={item.id}
                    item={item}
                    selected={selected.has(item.id)}
                    onSelect={toggleSelect}
                    onApprove={(id, comment) => approveMutation.mutate({ id, comment })}
                    onReject={(id, comment) => rejectMutation.mutate({ id, comment })}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* History tab */}
      {tab === 'history' && (
        <div className="mt-4">
          {historyQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
              ))}
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    {['申請', '申請者', '金額', '結果', '処理日時'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                  {(historyQuery.data?.data ?? []).map(h => (
                    <tr key={h.id}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{h.expense.title}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{h.submitter.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {fmt(h.expense.amount, h.expense.currency)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          h.action === 'approved'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {h.action === 'approved' ? '承認' : '否認'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(h.acted_at).toLocaleDateString('ja-JP')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
