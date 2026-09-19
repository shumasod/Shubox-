import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Toast, useToastStore } from '../stores/toastStore';

const ICONS: Record<Toast['type'], React.ReactNode> = {
  success: (
    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const ToastItem: React.FC<{ toast: Toast }> = ({ toast }) => {
  const remove = useToastStore(s => s.remove);

  useEffect(() => {
    const timer = setTimeout(() => remove(toast.id), toast.duration);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, remove]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex items-start gap-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 w-80 animate-in slide-in-from-right-full duration-300"
    >
      <div className="flex-shrink-0 mt-0.5">{ICONS[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{toast.title}</p>
        {toast.message && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => remove(toast.id)}
        aria-label="Dismiss notification"
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 mt-0.5"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const toasts = useToastStore(s => s.toasts);

  return createPortal(
    <div
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-[150] flex flex-col gap-2 items-end"
    >
      {toasts.map(t => <ToastItem key={t.id} toast={t} />)}
    </div>,
    document.body
  );
};
