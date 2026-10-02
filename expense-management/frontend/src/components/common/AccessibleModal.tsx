import React, { useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_MAP = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
};

export default function AccessibleModal({ open, onClose, title, description, children, size = 'md' }: Props) {
  const dialogRef = useFocusTrap(open) as React.RefObject<HTMLDivElement>;
  const titleId   = useId();
  const descId    = useId();

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement;
    document.body.style.overflow = 'hidden';
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
      prev?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full ${SIZE_MAP[size]} p-6 focus:outline-none`}
        tabIndex={-1}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
            {description && (
              <p id={descId} className="text-sm text-gray-500 mt-1">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="閉じる"
            className="ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg p-1 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}
