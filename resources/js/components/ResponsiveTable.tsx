import React, { useRef, useState, useEffect } from 'react';

export interface Column<T> {
  key:        string;
  header:     string;
  render:     (row: T, index: number) => React.ReactNode;
  width?:     number;
  pinned?:    boolean;
  align?:     'left' | 'right' | 'center';
  sortable?:  boolean;
}

interface SortState {
  key:       string;
  direction: 'asc' | 'desc';
}

interface Props<T> {
  columns:      Column<T>[];
  data:         T[];
  rowKey:       (row: T) => string | number;
  loading?:     boolean;
  emptyMessage?: string;
  onSort?:      (key: string, direction: 'asc' | 'desc') => void;
  stickyHeader?: boolean;
}

export function ResponsiveTable<T>({
  columns,
  data,
  rowKey,
  loading = false,
  emptyMessage = 'No data',
  onSort,
  stickyHeader = true,
}: Props<T>) {
  const [sort, setSort]         = useState<SortState | null>(null);
  const [canScrollLeft, setLeft]  = useState(false);
  const [canScrollRight, setRight] = useState(false);
  const containerRef            = useRef<HTMLDivElement>(null);

  const updateScrollState = () => {
    const el = containerRef.current;
    if (!el) return;
    setLeft(el.scrollLeft > 0);
    setRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    updateScrollState();
    const el = containerRef.current;
    el?.addEventListener('scroll', updateScrollState, { passive: true });
    return () => el?.removeEventListener('scroll', updateScrollState);
  }, [data]);

  const handleSort = (col: Column<T>) => {
    if (!col.sortable) return;
    const next: SortState = {
      key:       col.key,
      direction: sort?.key === col.key && sort.direction === 'asc' ? 'desc' : 'asc',
    };
    setSort(next);
    onSort?.(next.key, next.direction);
  };

  const pinnedCols  = columns.filter(c => c.pinned);
  const scrollCols  = columns.filter(c => !c.pinned);
  const pinnedWidth = pinnedCols.reduce((s, c) => s + (c.width ?? 140), 0);

  const thBase = `px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 whitespace-nowrap ${
    stickyHeader ? 'sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700' : ''
  }`;
  const tdBase = 'px-3 py-3 text-sm text-gray-800 dark:text-gray-200 whitespace-nowrap';

  const SortIcon: React.FC<{ colKey: string }> = ({ colKey }) => {
    if (sort?.key !== colKey) return <span className="ml-1 text-gray-300">&#8597;</span>;
    return <span className="ml-1">{sort.direction === 'asc' ? '&#8593;' : '&#8595;'}</span>;
  };

  const renderRows = (cols: Column<T>[], pinned: boolean) =>
    data.map((row, ri) => (
      <tr
        key={rowKey(row)}
        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
      >
        {cols.map(col => (
          <td
            key={col.key}
            className={`${tdBase} ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${
              pinned ? 'sticky left-0 z-[1] bg-white dark:bg-gray-900' : ''
            } ${pinned && canScrollRight ? 'shadow-[2px_0_4px_rgba(0,0,0,0.08)]' : ''}`}
            style={{ width: col.width, minWidth: col.width }}
          >
            {col.render(row, ri)}
          </td>
        ))}
      </tr>
    ));

  return (
    <div className="relative border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      {/* Scroll shadow indicators */}
      {canScrollLeft  && <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-gray-900 to-transparent z-20 pointer-events-none" />}
      {canScrollRight && <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-gray-900 to-transparent z-20 pointer-events-none" />}

      <div ref={containerRef} className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  scope="col"
                  onClick={() => handleSort(col)}
                  className={`${thBase} ${
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                  } ${col.sortable ? 'cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 select-none' : ''} ${
                    col.pinned ? 'sticky left-0 z-20 bg-white dark:bg-gray-900' : ''
                  }`}
                  style={{ width: col.width, minWidth: col.width }}
                >
                  {col.header}
                  {col.sortable && <SortIcon colKey={col.key} />}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
                    {columns.map(col => (
                      <td key={col.key} className={tdBase}>
                        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              : data.length === 0
              ? <tr><td colSpan={columns.length} className="px-3 py-10 text-center text-sm text-gray-400">{emptyMessage}</td></tr>
              : renderRows(columns, false)
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
