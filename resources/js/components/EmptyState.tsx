import React from 'react';

interface Action {
  label:   string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

interface Props {
  illustration: 'expenses' | 'notifications' | 'search' | 'approvals' | 'reports' | 'generic';
  title:        string;
  description?: string;
  actions?:     Action[];
  compact?:     boolean;
}

const ILLUSTRATIONS: Record<Props['illustration'], React.ReactNode> = {
  expenses: (
    <svg viewBox="0 0 120 90" className="w-full h-full" fill="none">
      <rect x="20" y="15" width="80" height="60" rx="6" className="fill-gray-100 dark:fill-gray-800" />
      <rect x="30" y="28" width="45" height="5" rx="2.5" className="fill-gray-200 dark:fill-gray-700" />
      <rect x="30" y="40" width="35" height="5" rx="2.5" className="fill-gray-200 dark:fill-gray-700" />
      <rect x="30" y="52" width="50" height="5" rx="2.5" className="fill-gray-200 dark:fill-gray-700" />
      <circle cx="85" cy="65" r="18" className="fill-indigo-100 dark:fill-indigo-900/50" />
      <path d="M85 58v7.5M85 72h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-indigo-500" />
    </svg>
  ),
  notifications: (
    <svg viewBox="0 0 120 90" className="w-full h-full" fill="none">
      <path d="M60 20c-13.255 0-24 10.745-24 24 0 5.8-1.5 10-3.5 13H87.5C85.5 54 84 49.8 84 44c0-13.255-10.745-24-24-24z" className="fill-gray-100 dark:fill-gray-800" />
      <path d="M54 70h12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-gray-300 dark:text-gray-600" />
      <circle cx="84" cy="26" r="10" className="fill-indigo-100 dark:fill-indigo-900/50" />
      <path d="M84 22v4.5M84 29.5h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-indigo-500" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 120 90" className="w-full h-full" fill="none">
      <circle cx="52" cy="42" r="24" className="fill-gray-100 dark:fill-gray-800" />
      <circle cx="52" cy="42" r="24" stroke="currentColor" strokeWidth="3" className="text-gray-200 dark:text-gray-700" />
      <line x1="70" y1="60" x2="90" y2="78" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-gray-300 dark:text-gray-600" />
      <path d="M44 42h16M52 34v16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-indigo-400" />
    </svg>
  ),
  approvals: (
    <svg viewBox="0 0 120 90" className="w-full h-full" fill="none">
      <rect x="25" y="20" width="70" height="50" rx="6" className="fill-gray-100 dark:fill-gray-800" />
      <path d="M43 45l9 9 25-20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-green-400" />
    </svg>
  ),
  reports: (
    <svg viewBox="0 0 120 90" className="w-full h-full" fill="none">
      <rect x="20" y="15" width="80" height="60" rx="6" className="fill-gray-100 dark:fill-gray-800" />
      <rect x="33" y="58" width="10" height="12" rx="1" className="fill-indigo-300 dark:fill-indigo-700" />
      <rect x="50" y="46" width="10" height="24" rx="1" className="fill-indigo-400 dark:fill-indigo-600" />
      <rect x="67" y="38" width="10" height="32" rx="1" className="fill-indigo-500 dark:fill-indigo-500" />
    </svg>
  ),
  generic: (
    <svg viewBox="0 0 120 90" className="w-full h-full" fill="none">
      <circle cx="60" cy="45" r="28" className="fill-gray-100 dark:fill-gray-800" />
      <path d="M60 35v10M60 52h.01" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-gray-400 dark:text-gray-500" />
    </svg>
  ),
};

export const EmptyState: React.FC<Props> = ({ illustration, title, description, actions = [], compact = false }) => (
  <div className={`flex flex-col items-center text-center ${ compact ? 'py-6 px-4' : 'py-12 px-6' }`}>
    <div className={`${ compact ? 'w-20 h-16' : 'w-32 h-24' } mb-4 opacity-80`}>
      {ILLUSTRATIONS[illustration]}
    </div>
    <h3 className={`font-semibold text-gray-900 dark:text-gray-100 ${ compact ? 'text-sm' : 'text-base' }`}>
      {title}
    </h3>
    {description && (
      <p className={`mt-1 text-gray-500 dark:text-gray-400 max-w-sm ${ compact ? 'text-xs' : 'text-sm' }`}>
        {description}
      </p>
    )}
    {actions.length > 0 && (
      <div className="flex gap-3 mt-5">
        {actions.map((action, i) => (
          <button
            key={i}
            onClick={action.onClick}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              action.variant === 'secondary'
                ? 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {action.label}
          </button>
        ))}
      </div>
    )}
  </div>
);
