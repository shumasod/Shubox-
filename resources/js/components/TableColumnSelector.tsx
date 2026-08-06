import React, { useState, useRef, useEffect } from 'react';

export interface ColumnDef {
  key: string;
  label: string;
  required?: boolean;
}

interface Props {
  columns: ColumnDef[];
  visibleKeys: string[];
  onChange: (keys: string[]) => void;
  storageKey?: string;
}

export default function TableColumnSelector({ columns, visibleKeys, onChange, storageKey }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const toggle = (key: string) => {
    const col = columns.find(c => c.key === key);
    if (col?.required) return;

    const next = visibleKeys.includes(key)
      ? visibleKeys.filter(k => k !== key)
      : [...visibleKeys, key];

    onChange(next);
    if (storageKey) localStorage.setItem(storageKey, JSON.stringify(next));
  };

  const visibleCount  = visibleKeys.length;
  const totalCount    = columns.length;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        </svg>
        <span className="text-gray-700 dark:text-gray-300">Columns</span>
        <span className="text-xs text-gray-400 dark:text-gray-500">{visibleCount}/{totalCount}</span>
      </button>

      {open && (
        <div
          role="listbox"
          aria-multiselectable="true"
          className="absolute right-0 mt-1 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 py-1 overflow-hidden"
        >
          <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Visible Columns</span>
            <button
              onClick={() => {
                const all = columns.map(c => c.key);
                onChange(all);
                if (storageKey) localStorage.setItem(storageKey, JSON.stringify(all));
              }}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Show all
            </button>
          </div>

          {columns.map(col => {
            const checked = visibleKeys.includes(col.key);
            return (
              <label
                key={col.key}
                role="option"
                aria-selected={checked}
                className={[
                  'flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors',
                  col.required
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50',
                ].join(' ')}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={col.required}
                  onChange={() => toggle(col.key)}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{col.label}</span>
                {col.required && (
                  <span className="ml-auto text-[10px] text-gray-400 dark:text-gray-500">Required</span>
                )}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
