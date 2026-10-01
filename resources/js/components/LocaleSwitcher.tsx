import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

export default function LocaleSwitcher() {
  const { locale, changeLocale } = useTranslation();

  return (
    <div className="inline-flex rounded-md border border-gray-300 dark:border-gray-600 overflow-hidden">
      {(['ja', 'en'] as const).map((lang) => (
        <button
          key={lang}
          onClick={() => changeLocale(lang)}
          aria-pressed={locale === lang}
          className={[
            'px-3 py-1.5 text-sm font-medium transition-colors',
            locale === lang
              ? 'bg-indigo-600 text-white'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
          ].join(' ')}
        >
          {lang === 'ja' ? '日本語' : 'English'}
        </button>
      ))}
    </div>
  );
}
