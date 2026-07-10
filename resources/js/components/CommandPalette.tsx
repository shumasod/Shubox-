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
