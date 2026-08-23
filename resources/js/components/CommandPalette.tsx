import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';

interface Command {
  id:       string;
  label:    string;
  group:    string;
  icon?:    React.ReactNode;
  action:   () => void;
  keywords?: string[];
}

const fuzzyMatch = (query: string, target: string): boolean => {
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length;
};

const score = (query: string, target: string): number => {
  if (target.toLowerCase().startsWith(query.toLowerCase())) return 2;
  if (target.toLowerCase().includes(query.toLowerCase())) return 1;
  return 0;
};

const NavIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

interface Props {
  open:    boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<Props> = ({ open, onClose }) => {
  const [query, setQuery]     = useState('');
  const [selected, setSelected] = useState(0);
  const navigate              = useNavigate();
  const inputRef              = useRef<HTMLInputElement>(null);
  const listRef               = useRef<HTMLDivElement>(null);

  const COMMANDS: Command[] = [
    { id: 'nav-home',       group: 'Navigate', label: 'Go to Dashboard',       icon: <NavIcon />, action: () => navigate('/'),              keywords: ['home', 'dashboard'] },
    { id: 'nav-expenses',   group: 'Navigate', label: 'Go to Expenses',        icon: <NavIcon />, action: () => navigate('/expenses'),       keywords: ['list', 'all'] },
    { id: 'nav-reports',    group: 'Navigate', label: 'Go to Reports',         icon: <NavIcon />, action: () => navigate('/reports'),        keywords: ['analytics', 'charts'] },
    { id: 'nav-settings',   group: 'Navigate', label: 'Go to Settings',        icon: <NavIcon />, action: () => navigate('/settings'),       keywords: ['config', 'profile'] },
    { id: 'new-expense',    group: 'Actions',  label: 'New Expense',           icon: <PlusIcon />, action: () => navigate('/expenses/new'), keywords: ['create', 'add'] },
    { id: 'new-category',   group: 'Actions',  label: 'New Category',          icon: <PlusIcon />, action: () => navigate('/admin/categories/new') },
    { id: 'export-csv',     group: 'Actions',  label: 'Export Expenses (CSV)', icon: <NavIcon />, action: () => navigate('/exports') },
    { id: 'theme-dark',     group: 'Appearance', label: 'Switch to Dark Mode',  action: () => { localStorage.setItem('expense-theme', 'dark');  document.documentElement.classList.add('dark'); } },
    { id: 'theme-light',    group: 'Appearance', label: 'Switch to Light Mode', action: () => { localStorage.setItem('expense-theme', 'light'); document.documentElement.classList.remove('dark'); } },
  ];

  const filtered = query.trim() === ''
    ? COMMANDS
    : COMMANDS
        .filter(cmd => {
          const haystack = [cmd.label, ...(cmd.keywords ?? [])].join(' ');
          return fuzzyMatch(query, haystack);
        })
        .sort((a, b) => {
          const as = score(query, a.label);
          const bs = score(query, b.label);
          return bs - as;
        });

  const groups = [...new Set(filtered.map(c => c.group))];

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  useEffect(() => setSelected(0), [query]);

  const runSelected = () => {
    if (filtered[selected]) {
      filtered[selected].action();
      onClose();
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, filtered.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
    if (e.key === 'Enter')     { e.preventDefault(); runSelected(); }
    if (e.key === 'Escape')    { onClose(); }
  };

  if (!open) return null;

  let globalIdx = 0;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[20vh] px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none"
          />
          <kbd className="hidden sm:flex items-center gap-0.5 text-xs text-gray-400">
            <span className="px-1 py-0.5 rounded border border-gray-300 dark:border-gray-600 font-mono">Esc</span>
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-72 overflow-y-auto py-2">
          {filtered.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">No commands found</p>
          )}
          {groups.map(group => (
            <div key={group}>
              <p className="px-4 py-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400">{group}</p>
              {filtered.filter(c => c.group === group).map(cmd => {
                const idx = globalIdx++;
                return (
                  <button
                    key={cmd.id}
                    onMouseEnter={() => setSelected(idx)}
                    onClick={() => { cmd.action(); onClose(); }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                      idx === selected
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span className="text-gray-400">{cmd.icon}</span>
                    {cmd.label}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
};
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

interface SearchResult {
  id: number;
  type: 'expense' | 'vendor' | 'project' | 'user';
  title: string;
  subtitle: string;
  url: string;
}

interface SearchResponse {
  results: SearchResult[];
}

const TYPE_ICONS: Record<string, string> = {
  expense: '💰',
  vendor: '🏢',
  project: '📁',
  user: '👤',
};

const TYPE_LABELS: Record<string, string> = {
  expense: '経費',
  vendor: '取引先',
  project: 'プロジェクト',
  user: 'ユーザー',
};

const QUICK_LINKS = [
  { label: '新規経費申請', url: '/expenses/new', icon: '➕' },
  { label: '承認待ち一覧', url: '/expenses?status=submitted', icon: '⏳' },
  { label: '経費ダッシュボード', url: '/', icon: '📊' },
  { label: '予算管理', url: '/budgets', icon: '🎯' },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const navigate = useNavigate();

  // Open on Cmd+K / Ctrl+K
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(o => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 10);
      setQuery('');
      setActiveIndex(0);
    }
  }, [open]);

  const { data, isFetching } = useQuery<SearchResponse>({
    queryKey: ['command-search', query],
    queryFn: () =>
      fetch(`/api/search?q=${encodeURIComponent(query)}&per_type=5`).then(r => r.json()),
    enabled: query.length >= 2,
    staleTime: 10_000,
  });

  const results = data?.results ?? [];
  const showQuickLinks = query.length < 2;
  const items = showQuickLinks ? QUICK_LINKS : results;

  const go = useCallback((url: string) => {
    navigate(url);
    setOpen(false);
  }, [navigate]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && items[activeIndex]) {
      go(items[activeIndex].url);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-400 hover:border-gray-300 transition-colors"
        aria-label="検索 (Cmd+K)"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
        </svg>
        <span>検索...</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 font-mono">
          ⌘K
        </kbd>
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4"
      role="dialog"
      aria-modal="true"
      aria-label="グローバル検索"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setActiveIndex(0); }}
            onKeyDown={handleKeyDown}
            placeholder="経費、取引先、プロジェクトを検索..."
            className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none"
            aria-autocomplete="list"
            aria-controls="command-list"
            aria-activedescendant={items[activeIndex] ? `cmd-item-${activeIndex}` : undefined}
          />
          {isFetching && (
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          )}
          <kbd className="text-xs text-gray-400 font-mono">Esc</kbd>
        </div>

        {/* Results */}
        <ul
          id="command-list"
          ref={listRef}
          role="listbox"
          className="max-h-80 overflow-y-auto py-2"
        >
          {showQuickLinks && (
            <li className="px-4 py-1.5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">クイックリンク</p>
            </li>
          )}

          {!showQuickLinks && results.length === 0 && !isFetching && (
            <li className="px-4 py-8 text-center text-sm text-gray-400">
              &ldquo;{query}&rdquo; に一致する結果が見つかりません
            </li>
          )}

          {(showQuickLinks ? QUICK_LINKS : results).map((item, i) => (
            <li
              key={i}
              id={`cmd-item-${i}`}
              role="option"
              aria-selected={i === activeIndex}
            >
              <button
                onClick={() => go(item.url)}
                onMouseEnter={() => setActiveIndex(i)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  i === activeIndex
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <span className="text-base">
                  {'icon' in item ? item.icon : TYPE_ICONS[(item as SearchResult).type] ?? '🔍'}
                </span>
                <div className="flex-1 text-left">
                  <p className="font-medium">{item.title ?? (item as any).label}</p>
                  {'subtitle' in item && item.subtitle && (
                    <p className="text-xs text-gray-400 mt-0.5">{item.subtitle}</p>
                  )}
                </div>
                {'type' in item && (
                  <span className="text-xs text-gray-400">{TYPE_LABELS[(item as SearchResult).type]}</span>
                )}
              </button>
            </li>
          ))}
        </ul>

        <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800 flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1"><kbd className="font-mono">↵</kbd> 確定</span>
          <span className="flex items-center gap-1"><kbd className="font-mono">↑↓</kbd> 選択</span>
          <span className="flex items-center gap-1"><kbd className="font-mono">Esc</kbd> 閉じる</span>
        </div>
      </div>
    </div>
  );
}
