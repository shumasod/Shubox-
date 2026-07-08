import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Shortcut {
  key: string;
  description: string;
  action: () => void;
}

export function useKeyboardShortcuts(): Shortcut[] {
  const navigate = useNavigate();

  const shortcuts: Shortcut[] = [
    { key: 'n', description: '新規申請', action: () => navigate('/expenses/new') },
    { key: 'e', description: '経費一覧', action: () => navigate('/expenses') },
    { key: 'a', description: '承認ダッシュボード', action: () => navigate('/approvals') },
    { key: 'd', description: 'ダッシュボード', action: () => navigate('/dashboard') },
    { key: 'r', description: 'レポート', action: () => navigate('/reports') },
    { key: 's', description: '設定', action: () => navigate('/settings') },
  ];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;

      const match = shortcuts.find(s => s.key === e.key);
      if (match) {
        e.preventDefault();
        match.action();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return shortcuts;
}
