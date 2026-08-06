import { useEffect } from 'react';

export interface Shortcut {
  key:         string;
  meta?:       boolean;
  ctrl?:       boolean;
  shift?:      boolean;
  alt?:        boolean;
  description: string;
  action:      () => void;
  disabled?:   boolean;
}

export const useKeyboardShortcuts = (shortcuts: Shortcut[], enabled = true) => {
  useEffect(() => {
    if (!enabled) return;

    const handler = (e: KeyboardEvent) => {
      // Ignore when typing in an input/textarea
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      if ((e.target as HTMLElement).isContentEditable) return;

      for (const shortcut of shortcuts) {
        if (shortcut.disabled) continue;

        const keyMatch   = e.key.toLowerCase() === shortcut.key.toLowerCase();
        const metaMatch  = !!(shortcut.meta)  === (e.metaKey  || e.ctrlKey);
        const ctrlMatch  = !!(shortcut.ctrl)  === e.ctrlKey;
        const shiftMatch = !!(shortcut.shift) === e.shiftKey;
        const altMatch   = !!(shortcut.alt)   === e.altKey;

        if (keyMatch && metaMatch && shiftMatch && altMatch) {
          e.preventDefault();
          shortcut.action();
          return;
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shortcuts, enabled]);
};
