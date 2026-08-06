import { useEffect, useRef } from 'react';

const FOCUSABLE = [
  'a[href]', 'button:not([disabled])', 'input:not([disabled])',
  'select:not([disabled])', 'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function useFocusTrap(active: boolean) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!active || !ref.current) return;

    const container = ref.current;
    const elements  = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));
    const first     = elements[0];
    const last      = elements[elements.length - 1];

    first?.focus();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (elements.length === 0) { e.preventDefault(); return; }

      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };

    container.addEventListener('keydown', handleKey);
    return () => container.removeEventListener('keydown', handleKey);
  }, [active]);

  return ref;
}
