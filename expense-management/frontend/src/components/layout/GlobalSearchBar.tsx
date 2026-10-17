import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../lib/api';

interface SearchResult {
  id: number;
  expense_number: string;
  title: string;
  status: string;
  total_amount: number;
  applicant_name: string;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  draft:     'bg-gray-100 text-gray-600',
  submitted: 'bg-yellow-100 text-yellow-700',
  approved:  'bg-green-100 text-green-700',
  rejected:  'bg-red-100 text-red-700',
  paid:      'bg-teal-100 text-teal-700',
};

function useDebounce<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

export default function GlobalSearchBar() {
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState<SearchResult[]>([]);
  const [loading, setLoading]   = useState(false);
  const [open, setOpen]         = useState(false);
  const [activeIdx, setActive]  = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const debounced = useDebounce(query, 250);

  useEffect(() => {
    if (debounced.length < 2) { setResults([]); setOpen(false); return; }
    setLoading(true);
    apiClient.get(`/api/v1/search?q=${encodeURIComponent(debounced)}`)
      .then(r => { setResults(r.data.data); setOpen(true); setActive(-1); })
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [debounced]);

  const go = useCallback((id: number) => {
    navigate(`/expenses/${id}`);
    setQuery('');
    setOpen(false);
  }, [navigate]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(i => Math.min(i + 1, results.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActive(i => Math.max(i - 1, -1)); }
    if (e.key === 'Enter' && activeIdx >= 0) go(results[activeIdx].id);
    if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur(); }
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKey}
          onFocus={() => results.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="経費を検索... (Ctrl+K)"
          className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {open && results.length > 0 && (
        <ul className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto">
          {results.map((r, i) => (
            <li key={r.id}>
              <button
                onMouseDown={() => go(r.id)}
                className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  i === activeIdx ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-mono">{r.expense_number}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${STATUS_COLORS[r.status] ?? 'bg-gray-100 text-gray-500'}`}>
                      {r.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 dark:text-gray-100 truncate mt-0.5">{r.title}</p>
                  <p className="text-xs text-gray-400">{r.applicant_name} &middot; &yen;{r.total_amount.toLocaleString('ja-JP')}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && debounced.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-xl z-50 px-4 py-3 text-sm text-gray-400">
          "「{debounced}」に一致する経費が見つかりません
        </div>
      )}
    </div>
  );
}
