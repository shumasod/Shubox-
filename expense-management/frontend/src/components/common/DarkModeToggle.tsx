import React from 'react';
import { useDarkMode } from '../../hooks/useDarkMode';

function SunIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx={12} cy={12} r={5} />
      <path strokeLinecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}

function SystemIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x={2} y={3} width={20} height={14} rx={2} />
      <path strokeLinecap="round" d="M8 21h8M12 17v4" />
    </svg>
  );
}

export default function DarkModeToggle() {
  const { preference, setPreference } = useDarkMode();

  const cycle = () => {
    if (preference === 'system') setPreference('light');
    else if (preference === 'light') setPreference('dark');
    else setPreference('system');
  };

  const label = preference === 'dark' ? 'ダーク' : preference === 'light' ? 'ライト' : 'OS連動';

  return (
    <button
      onClick={cycle}
      title={`テーマ: ${label}`}
      className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-xs"
    >
      {preference === 'dark' ? <MoonIcon /> : preference === 'light' ? <SunIcon /> : <SystemIcon />}
      <span>{label}</span>
    </button>
  );
}
