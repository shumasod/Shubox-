import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  children?: NavItem[];
}

interface Props {
  items: NavItem[];
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

function NavItemRow({
  item,
  collapsed,
  depth = 0,
}: {
  item: NavItem;
  collapsed: boolean;
  depth?: number;
}) {
  const location = useLocation();
  const hasChildren = item.children && item.children.length > 0;
  const isActive = location.pathname.startsWith(item.href);
  const [open, setOpen] = useState(isActive);

  const paddingLeft = collapsed ? 'px-3' : depth === 0 ? 'px-3' : 'pl-9 pr-3';

  const linkContent = (
    <>
      <span className="flex-shrink-0 w-5 h-5">{item.icon}</span>
      {!collapsed && (
        <>
          <span className="flex-1 text-sm font-medium truncate">{item.label}</span>
          {item.badge !== undefined && item.badge > 0 && (
            <span className="ml-auto flex-shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 text-[10px] font-bold">
              {item.badge > 99 ? '99+' : item.badge}
            </span>
          )}
          {hasChildren && (
            <svg
              className={`w-4 h-4 flex-shrink-0 transition-transform ${open ? 'rotate-90' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </>
      )}
    </>
  );

  return (
    <li>
      {hasChildren ? (
        <button
          onClick={() => setOpen(o => !o)}
          className={[
            'w-full flex items-center gap-3 py-2 rounded-lg transition-colors',
            paddingLeft,
            isActive
              ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
          ].join(' ')}
          title={collapsed ? item.label : undefined}
        >
          {linkContent}
        </button>
      ) : (
        <NavLink
          to={item.href}
          className={({ isActive: a }) => [
            'flex items-center gap-3 py-2 rounded-lg transition-colors',
            paddingLeft,
            a
              ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
          ].join(' ')}
          title={collapsed ? item.label : undefined}
        >
          {linkContent}
        </NavLink>
      )}

      {hasChildren && open && !collapsed && (
        <ul className="mt-1 space-y-1">
          {item.children!.map(child => (
            <NavItemRow key={child.href} item={child} collapsed={collapsed} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function SidebarNavigation({ items, collapsed = false, onToggleCollapse, className = '' }: Props) {
  return (
    <nav
      className={[
        'flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-200',
        collapsed ? 'w-16' : 'w-60',
        className,
      ].join(' ')}
      aria-label="Main navigation"
    >
      <div className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-1">
          {items.map(item => (
            <NavItemRow key={item.href} item={item} collapsed={collapsed} />
          ))}
        </ul>
      </div>

      {onToggleCollapse && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-2">
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg
              className={`w-5 h-5 transition-transform ${collapsed ? '' : 'rotate-180'}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>
      )}
    </nav>
  );
}
