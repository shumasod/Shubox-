import React, { useState } from 'react';

interface NavItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  badge?: number;
  children?: NavItem[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: 'Expenses',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    children: [
      { label: 'All Expenses', href: '/expenses', icon: <span className="h-1.5 w-1.5 rounded-full bg-current" /> },
      { label: 'Submit New',   href: '/expenses/new', icon: <span className="h-1.5 w-1.5 rounded-full bg-current" /> },
      { label: 'Recurring',    href: '/expenses/recurring', icon: <span className="h-1.5 w-1.5 rounded-full bg-current" /> },
      { label: 'Import CSV',   href: '/expenses/import', icon: <span className="h-1.5 w-1.5 rounded-full bg-current" /> },
    ],
  },
  {
    label: 'Approvals',
    href: '/approvals',
    badge: 0,
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: 'Analytics',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    children: [
      { label: 'Overview',  href: '/analytics', icon: <span className="h-1.5 w-1.5 rounded-full bg-current" /> },
      { label: 'Budgets',   href: '/budgets', icon: <span className="h-1.5 w-1.5 rounded-full bg-current" /> },
      { label: 'Reports',   href: '/reports', icon: <span className="h-1.5 w-1.5 rounded-full bg-current" /> },
    ],
  },
  {
    label: 'Vendors',
    href: '/vendors',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    label: 'Admin',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    children: [
      { label: 'Categories',     href: '/admin/categories', icon: <span className="h-1.5 w-1.5 rounded-full bg-current" /> },
      { label: 'Approval Chains',href: '/admin/approval-chains', icon: <span className="h-1.5 w-1.5 rounded-full bg-current" /> },
      { label: 'Policies',       href: '/admin/policies', icon: <span className="h-1.5 w-1.5 rounded-full bg-current" /> },
      { label: 'Users',          href: '/admin/users', icon: <span className="h-1.5 w-1.5 rounded-full bg-current" /> },
    ],
  },
];

function NavLink({ item, currentPath, depth = 0 }: { item: NavItem; currentPath: string; depth?: number }) {
  const [open, setOpen] = useState(() =>
    item.children?.some((c) => c.href === currentPath) ?? false
  );
  const isActive = item.href === currentPath;
  const hasChildren = !!item.children?.length;

  const base = `flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors`;
  const active = 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
  const inactive = 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700/50 dark:hover:text-gray-100';

  if (hasChildren) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`${base} ${inactive}`}
          aria-expanded={open}
        >
          <span className="flex-shrink-0 text-gray-500 dark:text-gray-400">{item.icon}</span>
          <span className="flex-1 text-left">{item.label}</span>
          <svg
            className={`h-4 w-4 transition-transform ${open ? 'rotate-90' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        {open && (
          <ul className="mt-1 space-y-0.5 pl-9">
            {item.children!.map((child) => (
              <li key={child.href}>
                <NavLink item={child} currentPath={currentPath} depth={depth + 1} />
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <a
      href={item.href}
      className={`${base} ${isActive ? active : inactive}`}
      aria-current={isActive ? 'page' : undefined}
    >
      <span className={`flex-shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-500'}`}>
        {item.icon}
      </span>
      <span className="flex-1">{item.label}</span>
      {item.badge !== undefined && item.badge > 0 && (
        <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
          {item.badge}
        </span>
      )}
    </a>
  );
}

export default function SidebarNav({
  currentPath = '/',
  collapsed = false,
  onToggleCollapse,
}: {
  currentPath?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  return (
    <aside
      className={`flex h-full flex-col border-r border-gray-200 bg-white transition-all duration-200 dark:border-gray-700 dark:bg-gray-800 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-gray-200 px-4 dark:border-gray-700">
        {!collapsed && (
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">ShuBox</span>
        )}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="ml-auto rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d={collapsed ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'} />
          </svg>
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto p-3" aria-label="Main navigation">
        {!collapsed && (
          <ul className="space-y-0.5">
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                <NavLink item={item} currentPath={currentPath} />
              </li>
            ))}
          </ul>
        )}
        {collapsed && (
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href ?? '#'}
                  title={item.label}
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-gray-100"
                >
                  {item.icon}
                </a>
              </li>
            ))}
          </ul>
        )}
      </nav>

      {/* Settings link */}
      {!collapsed && (
        <div className="border-t border-gray-200 p-3 dark:border-gray-700">
          <a
            href="/settings"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Settings
          </a>
        </div>
      )}
    </aside>
  );
}
