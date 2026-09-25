import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

interface SearchResult {
  id:          number;
  title:       string;
  amount:      number;
  currency:    string;
  status:      string;
  category:    string;
  submitted_by:string;
  created_at:  string;
}

interface FilterChip {
  key:   string;
  label: string;
  value: string;
}

const STATUS_CHIPS: FilterChip[] = [
  { key: 'status', label: 'Draft',    value: 'draft' },
  { key: 'status', label: 'Pending',  value: 'pending' },
  { key: 'status', label: 'Approved', value: 'approved' },
  { key: 'status', label: 'Rejected', value: 'rejected' },
];

const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const formatAmount = (amount: number, currency = 'JPY') =>
  new Intl.NumberFormat('ja-JP', { style: 'currency', currency }).format(amount / 100);

const STATUS_COLORS: Record<string, string> = {
  draft:    'bg-gray-100 text-gray-600',
  pending:  'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
  paid:     'bg-blue-100 text-blue-700',
};

export const ExpenseSearch: React.FC = () => {
  const [query, setQuery]           = useState('');
  const [activeStatus, setActive]   = useState<string | null>(null);
  const [isOpen, setIsOpen]         = useState(false);
  const inputRef                    = useRef<HTMLInputElement>(null);
  const containerRef                = useRef<HTMLDivElement>(null);
  const debouncedQuery              = useDebounce(query, 300);

  const { data, isFetching } = useQuery<{ data: SearchResult[] }>({
    queryKey: ['expense-search', debouncedQuery, activeStatus],
    queryFn: () =>
      api.get('/expenses/search', {
        params: {
          q:      debouncedQuery || undefined,
          status: activeStatus  || undefined,
          limit:  10,
        },
      }).then(r => r.data),
    enabled: debouncedQuery.length >= 2 || activeStatus !== null,
    staleTime: 30_000,
  });

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const results = data?.data ?? [];

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      {/* Search input */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          type="search"
          value={query}
          placeholder="Search expenses..."
          className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          onChange={e => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
        />
        {isFetching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 mt-2 flex-wrap">
        {STATUS_CHIPS.map(chip => (
          <button
            key={chip.value}
            onClick={() => { setActive(prev => prev === chip.value ? null : chip.value); setIsOpen(true); }}
            className={`px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors ${
              activeStatus === chip.value
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-indigo-400'
            }`}
          >
            {chip.label}
          </button>
        ))}
        {activeStatus && (
          <button
            onClick={() => setActive(null)}
            className="px-2.5 py-0.5 rounded-full text-xs text-red-500 border border-red-300 hover:bg-red-50"
          >
            Clear
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-80 overflow-y-auto">
          {results.map(result => (
            <a
              key={result.id}
              href={`/expenses/${result.id}`}
              className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{result.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{result.submitted_by} &middot; {new Date(result.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {formatAmount(result.amount, result.currency)}
                </span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${STATUS_COLORS[result.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {result.status}
                </span>
              </div>
            </a>
          ))}
        </div>
      )}

      {isOpen && debouncedQuery.length >= 2 && results.length === 0 && !isFetching && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 px-4 py-6 text-center">
          <p className="text-sm text-gray-500">No expenses found for "{debouncedQuery}"</p>
        </div>
      )}
    </div>
  );
};
