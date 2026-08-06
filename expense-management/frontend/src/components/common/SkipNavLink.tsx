import React from 'react';

export default function SkipNavLink() {
  return (
    <a
      href="#main-content"
      className=[
        'sr-only focus:not-sr-only',
        'focus:absolute focus:top-2 focus:left-2 focus:z-[100]',
        'px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg',
        'focus:ring-2 focus:ring-white focus:outline-none',
      ].join(' ')
    >
      メインコンテンツへ移動
    </a>
  );
}
