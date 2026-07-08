import React, { useState, useEffect } from 'react';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

export default function KeyboardShortcutsHelp() {
  const [open, setOpen] = useState(false);
  const shortcuts = useKeyboardShortcuts();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        const tag = (e.target as HTMLElement).tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        setOpen(v => !v);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={() => setOpen(false)}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-80 max-w-full"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">キーボードショートカット</h2>
          <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-lg">&times;</button>
        </div>
        <ul className="space-y-3">
          {shortcuts.map(s => (
            <li key={s.key} className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-300">{s.description}</span>
              <kbd className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-xs font-mono text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600">
                {s.key}
              </kbd>
            </li>
          ))}
          <li className="flex justify-between items-center border-t border-gray-100 dark:border-gray-700 pt-3">
            <span className="text-sm text-gray-600 dark:text-gray-300">このヘルプを閉じる</span>
            <kbd className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-xs font-mono text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600">?</kbd>
          </li>
        </ul>
      </div>
    </div>
  );
}
