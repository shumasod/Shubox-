import { useEffect, useRef } from 'react';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  'details > summary',
].join(', ');

export const useFocusTrap = (active: boolean) => {
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;
    const getFocusable = () => Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));

    // Focus first focusable element
    const first = getFocusable()[0];
    first?.focus();

    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusable = getFocusable();
      if (focusable.length === 0) { e.preventDefault(); return; }

      const firstEl = focusable[0];
      const lastEl  = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };

    container.addEventListener('keydown', handler);
    return () => container.removeEventListener('keydown', handler);
  }, [active]);

  return containerRef;
};
