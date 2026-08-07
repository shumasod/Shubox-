import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

type Report = {
  id: number;
  report_key: string;
  format: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  completed_at: string | null;
  created_at: string;
};

type ExportFilters = {
  from?: string;
  to?: string;
  status?: string;
  format: string;
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  pending:    { label: '待機中',   color: 'text-gray-500',   icon: '⏳' },
  processing: { label: '生成中',   color: 'text-blue-500',   icon: '⚙️' },
  completed:  { label: '完了',     color: 'text-green-600',  icon: '✅' },
  failed:     { label: '失敗',     color: 'text-red-500',    icon: '❌' },
};

function ExportRequestForm({ onSubmit, isPending }: { onSubmit: (f: ExportFilters) => void; isPending: boolean }) {
  const [from,   setFrom]   = useState('');
  const [to,     setTo]     = useState('');
  const [status, setStatus] = useState('');

  return (
    <div className="rounded-xl bg-white dark:bg-gray-800 p-5 shadow ring-1 ring-gray-200 dark:ring-gray-700">
      <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">新しいレポートを出力</h2>
      <div className="flex flex-wrap gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">開始日</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)}
            className="block rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1.5 text-sm dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">終了日</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)}
            className="block rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1.5 text-sm dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">ステータス</label>
          <select value={status} onChange={e => setStatus(e.target.value)}
            className="block rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1.5 text-sm dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
            <option value="">すべて</option>
            {['draft','submitted','approved','rejected','paid'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button
            type="button"
            onClick={() => onSubmit({ from: from || undefined, to: to || undefined, status: status || undefined, format: 'csv' })}
            disabled={isPending}
            className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? '送信中...' : 'CSV出力'}
          </button>
        </div>
      </div>
    </div>
  );
}

function DownloadButton({ reportKey }: { reportKey: string }) {
  const mutation = useMutation({
    mutationFn: () =>
      api.get(`/reports/export/${reportKey}/download`).then(r => r.data),
    onSuccess: (data) => {
      // Open presigned URL in new tab
      window.open(data.download_url, '_blank', 'noopener,noreferrer');
    },
  });

  return (
    <button
      type="button"
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
      className="text-xs text-blue-600 hover:underline dark:text-blue-400 disabled:opacity-50"
    >
      {mutation.isPending ? '準備中...' : 'ダウンロード'}
    </button>
  );
}

export function ReportHistory() {
  const queryClient = useQueryClient();

  const { data: reports = [], isLoading } = useQuery<Report[]>({
    queryKey: ['reports'],
    queryFn: () => api.get('/reports/export/history').then(r => r.data),
    // Poll every 10s if any report is in-flight
    refetchInterval: (query) => {
      const data = query.state.data as Report[] | undefined;
      const hasInFlight = data?.some(r => r.status === 'pending' || r.status === 'processing');
      return hasInFlight ? 10_000 : false;
    },
  });

  const requestMutation = useMutation({
    mutationFn: (filters: ExportFilters) => api.post('/reports/export', filters),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reports'] }),
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-white">レポート出力</h1>

      <ExportRequestForm
        onSubmit={(f) => requestMutation.mutate(f)}
        isPending={requestMutation.isPending}
      />

      {requestMutation.isSuccess && (
        <p role="status" className="text-sm text-green-600 dark:text-green-400">
          レポートの生成を開始しました。完了後にダウンロードできます。
        </p>
      )}

      <div className="rounded-xl bg-white dark:bg-gray-800 shadow ring-1 ring-gray-200 dark:ring-gray-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">出力履歴</h2>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-sm text-gray-400">読み込み中...</div>
        ) : reports.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">出力履歴がありません。</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                {['形式', 'ステータス', '完了日時', '操作'].map(h => (
                  <th key={h} scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {reports.map(report => {
                const cfg = STATUS_CONFIG[report.status] ?? STATUS_CONFIG.pending;
                return (
                  <tr key={report.report_key} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-100 uppercase">{report.format}</td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1.5 text-sm ${cfg.color}`}>
                        <span aria-hidden="true">{cfg.icon}</span>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {report.completed_at
                        ? new Intl.DateTimeFormat('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(report.completed_at))
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {report.status === 'completed' && (
                        <DownloadButton reportKey={report.report_key} />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
