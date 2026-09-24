import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

interface Vendor {
  id: number;
  name: string;
  code: string;
  status: 'active' | 'inactive' | 'blocked';
  category: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  website: string | null;
  address: string | null;
  stats: {
    total_expenses: number;
    total_amount: number;
    last_expense_date: string | null;
  };
}

interface VendorPage {
  data: Vendor[];
  meta: { total: number; current_page: number; last_page: number };
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  inactive: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
  blocked: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

const STATUS_LABELS: Record<string, string> = {
  active: '有効',
  inactive: '無効',
  blocked: 'ブロック',
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount);
}

function VendorDetailModal({ vendor, onClose }: { vendor: Vendor; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="vendor-modal-title"
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 id="vendor-modal-title" className="text-lg font-bold text-gray-900 dark:text-white">
              {vendor.name}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{vendor.code}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="閉じる"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: '総支払額', value: formatCurrency(vendor.stats.total_amount) },
            { label: '経費件数', value: `${vendor.stats.total_expenses}件` },
            { label: '最終取引', value: vendor.stats.last_expense_date ? new Date(vendor.stats.last_expense_date).toLocaleDateString('ja-JP') : '—' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
              <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{value}</p>
            </div>
          ))}
        </div>

        {/* Contact details */}
        <dl className="space-y-2 text-sm">
          {vendor.contact_email && (
            <div className="flex gap-2">
              <dt className="w-24 text-gray-500 dark:text-gray-400 flex-shrink-0">メール</dt>
              <dd className="text-gray-900 dark:text-white">
                <a href={`mailto:${vendor.contact_email}`} className="text-blue-600 hover:underline">
                  {vendor.contact_email}
                </a>
              </dd>
            </div>
          )}
          {vendor.contact_phone && (
            <div className="flex gap-2">
              <dt className="w-24 text-gray-500 dark:text-gray-400 flex-shrink-0">電話</dt>
              <dd className="text-gray-900 dark:text-white">{vendor.contact_phone}</dd>
            </div>
          )}
          {vendor.website && (
            <div className="flex gap-2">
              <dt className="w-24 text-gray-500 dark:text-gray-400 flex-shrink-0">ウェブ</dt>
              <dd>
                <a
                  href={vendor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {vendor.website}
                </a>
              </dd>
            </div>
          )}
          {vendor.address && (
            <div className="flex gap-2">
              <dt className="w-24 text-gray-500 dark:text-gray-400 flex-shrink-0">住所</dt>
              <dd className="text-gray-900 dark:text-white">{vendor.address}</dd>
            </div>
          )}
        </dl>

        <div className="flex justify-end pt-2 border-t border-gray-200 dark:border-gray-700">
          <Link
            to={`/vendors/${vendor.id}/expenses`}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg"
          >
            経費履歴を見る
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VendorDirectory() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Vendor | null>(null);

  const { data, isLoading } = useQuery<VendorPage>({
    queryKey: ['vendors', search, status, page],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), per_page: '24' });
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      return fetch(`/api/vendors?${params}`).then(r => r.json());
    },
    placeholderData: prev => prev,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">取引先一覧</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {data?.meta.total ?? 0} 件の取引先
          </p>
        </div>
        <Link
          to="/vendors/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          取引先を登録
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
          </svg>
          <input
            type="search"
            placeholder="取引先名で検索..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400"
          />
        </div>
        <select
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
        >
          <option value="">すべてのステータス</option>
          <option value="active">有効</option>
          <option value="inactive">無効</option>
          <option value="blocked">ブロック</option>
        </select>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-36 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {(data?.data ?? []).map(vendor => (
            <button
              key={vendor.id}
              onClick={() => setSelected(vendor)}
              className="text-left bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-bold flex-shrink-0">
                  {vendor.name.slice(0, 2)}
                </div>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[vendor.status]}`}>
                  {STATUS_LABELS[vendor.status]}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">
                {vendor.name}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">{vendor.code}</p>
              <p className="mt-3 text-sm font-semibold text-gray-900 dark:text-white">
                {formatCurrency(vendor.stats.total_amount)}
              </p>
              <p className="text-xs text-gray-400">{vendor.stats.total_expenses} 件の経費</p>
            </button>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.meta.last_page > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1.5 rounded border border-gray-200 dark:border-gray-700 text-sm disabled:opacity-40"
          >
            ‹
          </button>
          <span className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400">
            {page} / {data.meta.last_page}
          </span>
          <button
            onClick={() => setPage(p => Math.min(data.meta.last_page, p + 1))}
            disabled={page >= data.meta.last_page}
            className="px-3 py-1.5 rounded border border-gray-200 dark:border-gray-700 text-sm disabled:opacity-40"
          >
            ›
          </button>
        </div>
      )}

      {selected && (
        <VendorDetailModal vendor={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
