import React, { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'shubox-theme';

function applyTheme(theme: Theme): void {
  const root = document.documentElement;

  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    root.classList.toggle('dark', prefersDark);
  } else {
    root.setAttribute('data-theme', theme);
    root.classList.toggle('dark', theme === 'dark');
  }
}

function getStoredTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  return 'system';
}

function SunIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  );
}

function SystemIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

const THEME_OPTIONS: { value: Theme; label: string; Icon: React.FC }[] = [
  { value: 'light', label: 'ライト', Icon: SunIcon },
  { value: 'dark', label: 'ダーク', Icon: MoonIcon },
  { value: 'system', label: 'システム', Icon: SystemIcon },
];

interface DarkModeToggleProps {
  /** Compact icon-only button that cycles through modes */
  compact?: boolean;
}

export function DarkModeToggle({ compact = false }: DarkModeToggleProps) {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    const stored = getStoredTheme();
    setTheme(stored);
    applyTheme(stored);

    // Track system preference changes when in 'system' mode
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (getStoredTheme() === 'system') applyTheme('system');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  function setAndPersist(next: Theme) {
    localStorage.setItem(STORAGE_KEY, next);
    setTheme(next);
    applyTheme(next);
  }

  if (compact) {
    const current = THEME_OPTIONS.find(o => o.value === theme) ?? THEME_OPTIONS[2];
    const nextIndex = (THEME_OPTIONS.findIndex(o => o.value === theme) + 1) % THEME_OPTIONS.length;
    const next = THEME_OPTIONS[nextIndex];

    return (
      <button
        onClick={() => setAndPersist(next.value)}
        title={`テーマ: ${current.label} (クリックで${next.label}に変更)`}
        aria-label={`現在のテーマ: ${current.label}`}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
      >
        <current.Icon />
      </button>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label="テーマ選択"
      className="flex items-center rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      {THEME_OPTIONS.map(({ value, label, Icon }) => (
        <button
          key={value}
          role="radio"
          aria-checked={theme === value}
          onClick={() => setAndPersist(value)}
          title={label}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${
            theme === value
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <Icon />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}

/**
 * Inline script tag content to inject into <head> to prevent FOUC.
 * Must run synchronously before the page renders.
 */
export const darkModeInitScript = `
(function() {
  var theme = localStorage.getItem('${STORAGE_KEY}') || 'system';
  if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
`;
