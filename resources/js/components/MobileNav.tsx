import { useState, useEffect, useRef, useCallback, useId } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface NavItem {
  label: string;
  path: string;
  icon: (active: boolean) => React.ReactNode;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'ホーム',
    path: '/dashboard',
    icon: (a) => (
      <svg className={`h-6 w-6 ${a ? 'text-blue-600' : 'text-gray-500'}`} fill={a ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={a ? 0 : 1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: '経費',
    path: '/expenses',
    icon: (a) => (
      <svg className={`h-6 w-6 ${a ? 'text-blue-600' : 'text-gray-500'}`} fill={a ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={a ? 0 : 1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    label: '承認',
    path: '/approvals',
    icon: (a) => (
      <svg className={`h-6 w-6 ${a ? 'text-blue-600' : 'text-gray-500'}`} fill={a ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={a ? 0 : 1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: '分析',
    path: '/analytics',
    icon: (a) => (
      <svg className={`h-6 w-6 ${a ? 'text-blue-600' : 'text-gray-500'}`} fill={a ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={a ? 0 : 1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    label: 'メニュー',
    path: '__drawer__',
    icon: (a) => (
      <svg className={`h-6 w-6 ${a ? 'text-blue-600' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    ),
  },
];

const DRAWER_ITEMS = [
  { label: '予算管理',   path: '/budgets' },
  { label: 'ベンダー',     path: '/vendors' },
  { label: 'プロジェクト', path: '/projects' },
  { label: '部門',         path: '/departments' },
  { label: '通知',         path: '/notifications' },
  { label: '設定',         path: '/settings' },
  { label: 'プロフィール', path: '/profile' },
];

export default function MobileNav({ unreadCount = 0 }: { unreadCount?: number }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerId = useId();
  const drawerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false); }, [location.pathname]);

  // Close on Escape
  useEffect(() => {
    if (!drawerOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setDrawerOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [drawerOpen]);

  // Focus trap inside drawer
  useEffect(() => {
    if (drawerOpen) {
      drawerRef.current?.querySelector<HTMLElement>('button, a')?.focus();
    }
  }, [drawerOpen]);

  // Right-edge swipe to open drawer
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const x = e.touches[0].clientX;
    if (x > window.innerWidth - 40) touchStartX.current = x;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = touchStartX.current - e.changedTouches[0].clientX;
    if (dx > 50) setDrawerOpen(true);
    touchStartX.current = null;
  }, []);

  // Swipe drawer to close
  const handleDrawerTouchEnd = useCallback((e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - (e.changedTouches[0].clientX - 60);
    if (dx < -40) setDrawerOpen(false);
  }, []);

  const activeItems = NAV_ITEMS.map(item => ({
    ...item,
    active: item.path !== '__drawer__' && location.pathname.startsWith(item.path),
  }));

  return (
    <>
      {/* Bottom navigation bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 sm:hidden"
        aria-label="モバイルナビゲーション"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {activeItems.map(item => (
          <button
            key={item.path}
            onClick={() => item.path === '__drawer__' ? setDrawerOpen(true) : navigate(item.path)}
            aria-label={item.label}
            aria-current={item.active ? 'page' : undefined}
            aria-expanded={item.path === '__drawer__' ? drawerOpen : undefined}
            aria-controls={item.path === '__drawer__' ? drawerId : undefined}
            className="relative flex flex-col items-center gap-0.5 px-3 py-2"
          >
            {item.icon(item.active)}
            <span className={`text-xs ${
              item.active ? 'font-semibold text-blue-600' : 'text-gray-500'
            }`}>
              {item.label}
            </span>
            {/* Notification badge on 承認 */}
            {item.path === '/approvals' && unreadCount > 0 && (
              <span className="absolute right-2 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Backdrop */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 sm:hidden"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Slide-out drawer */}
      <aside
        id={drawerId}
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="メニュー"
        onTouchEnd={handleDrawerTouchEnd}
        className={`fixed bottom-0 right-0 top-0 z-50 flex w-72 flex-col bg-white shadow-xl transition-transform duration-300 dark:bg-gray-900 sm:hidden ${
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4 dark:border-gray-700">
          <span className="font-semibold text-gray-900 dark:text-white">Shubox</span>
          <button
            onClick={() => setDrawerOpen(false)}
            aria-label="メニューを閉じる"
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-2">
          <ul role="list">
            {DRAWER_ITEMS.map(item => (
              <li key={item.path}>
                <button
                  onClick={() => navigate(item.path)}
                  aria-current={location.pathname === item.path ? 'page' : undefined}
                  className={`flex w-full items-center px-4 py-3 text-sm transition hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    location.pathname === item.path
                      ? 'font-semibold text-blue-600'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t border-gray-200 px-4 py-4 dark:border-gray-700">
          <button
            onClick={() => navigate('/logout')}
            className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            ログアウト
          </button>
        </div>
      </aside>

      {/* Bottom padding spacer so content isn't hidden under nav bar */}
      <div className="h-16 sm:hidden" aria-hidden="true" />
    </>
  );
}
