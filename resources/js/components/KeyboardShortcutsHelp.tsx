import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ShortcutEntry {
  key:         string;
  meta?:       boolean;
  shift?:      boolean;
  alt?:        boolean;
  description: string;
}

const KEY_LABELS: Record<string, string> = {
  escape: 'Esc',
  arrowup: 'Up',
  arrowdown: 'Down',
  arrowleft: 'Left',
  arrowright: 'Right',
  enter: 'Enter',
  '/': '/',
};

const renderKey = (key: string) => KEY_LABELS[key.toLowerCase()] ?? key.toUpperCase();

const Kbd: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <kbd className="inline-flex items-center justify-center min-w-[1.75rem] h-6 px-1.5 rounded border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-xs font-mono text-gray-700 dark:text-gray-300 shadow-sm">
    {children}
  </kbd>
);

const SHORTCUT_GROUPS: { group: string; shortcuts: ShortcutEntry[] }[] = [
  {
    group: 'Navigation',
    shortcuts: [
      { key: 'g h',    description: 'Go to Home' },
      { key: 'g e',    description: 'Go to Expenses' },
      { key: 'g r',    description: 'Go to Reports' },
      { key: '?',      description: 'Show this help' },
    ],
  },
  {
    group: 'Expenses',
    shortcuts: [
      { key: 'n',    description: 'New expense' },
      { key: '/',    description: 'Focus search' },
      { key: 'f',    description: 'Toggle filters' },
      { key: 'Esc', description: 'Close modal / cancel' },
    ],
  },
  {
    group: 'Actions',
    shortcuts: [
      { key: 's', meta: true, description: 'Save / Submit' },
      { key: 'd', meta: true, description: 'Delete selected' },
    ],
  },
];

interface Props {
  open:    boolean;
  onClose: () => void;
}

export const KeyboardShortcutsHelp: React.FC<Props> = ({ open, onClose }) => {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-4 space-y-6">
          {SHORTCUT_GROUPS.map(group => (
            <div key={group.group}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                {group.group}
              </h3>
              <div className="space-y-2">
                {group.shortcuts.map(s => (
                  <div key={s.key + s.description} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{s.description}</span>
                    <div className="flex items-center gap-1">
                      {s.meta  && <><Kbd>Cmd</Kbd><span className="text-gray-400 text-xs">+</span></>}
                      {s.shift && <><Kbd>Shift</Kbd><span className="text-gray-400 text-xs">+</span></>}
                      {s.alt   && <><Kbd>Alt</Kbd><span className="text-gray-400 text-xs">+</span></>}
                      {s.key.split(' ').map((k, i) => (
                        <React.Fragment key={i}>
                          {i > 0 && <span className="text-gray-400 text-xs mx-0.5">then</span>}
                          <Kbd>{renderKey(k)}</Kbd>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
};
