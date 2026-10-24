import React, { useState, useMemo, useId } from 'react';

export type SortDirection = 'asc' | 'desc';

export interface ColumnDef<T> {
  key: string;
  header: string;
  accessor: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
  headerClassName?: string;
  hidden?: boolean;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  keyExtractor: (row: T) => string | number;
  pagination?: PaginationMeta;
  onPageChange?: (page: number) => void;
  sortKey?: string;
  sortDirection?: SortDirection;
  onSortChange?: (key: string, direction: SortDirection) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  stickyHeader?: boolean;
  caption?: string;
}

function SortIcon({ active, direction }: { active: boolean; direction: SortDirection }) {
  return (
    <span className={`ml-1 inline-flex flex-col gap-0.5 ${active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-300 dark:text-gray-600'}`}>
      <svg className={`w-2.5 h-2.5 transition-opacity ${active && direction === 'asc' ? 'opacity-100' : 'opacity-40'}`} viewBox="0 0 10 6" fill="currentColor">
        <path d="M0 6L5 0l5 6H0z" />
      </svg>
      <svg className={`w-2.5 h-2.5 transition-opacity ${active && direction === 'desc' ? 'opacity-100' : 'opacity-40'}`} viewBox="0 0 10 6" fill="currentColor">
        <path d="M0 0l5 6 5-6H0z" />
      </svg>
    </span>
  );
}

function SkeletonRow({ colCount }: { colCount: number }) {
  return (
    <tr>
      {Array.from({ length: colCount }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 rounded bg-gray-100 dark:bg-gray-700 animate-pulse" style={{ width: `${50 + (i * 17) % 50}%` }} />
        </td>
      ))}
    </tr>
  );
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  pagination,
  onPageChange,
  sortKey,
  sortDirection = 'asc',
  onSortChange,
  isLoading = false,
  emptyMessage = 'No data available',
  stickyHeader = false,
  caption,
}: DataTableProps<T>) {
  const tableId = useId();
  const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(
    () => new Set(columns.filter(c => c.hidden).map(c => c.key))
  );

  const visibleColumns = useMemo(
    () => columns.filter(c => !hiddenKeys.has(c.key)),
    [columns, hiddenKeys]
  );

  function handleSort(key: string) {
    if (!onSortChange) return;
    if (sortKey === key) {
      onSortChange(key, sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      onSortChange(key, 'asc');
    }
  }

  function toggleColumn(key: string) {
    setHiddenKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const showPagination = pagination && pagination.last_page > 1;

  return (
    <div className="flex flex-col gap-2">
      {/* Column visibility toggle */}
      {columns.length > 1 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">表示列:</span>
          {columns.map(col => (
            <button
              key={col.key}
              onClick={() => toggleColumn(col.key)}
              aria-pressed={!hiddenKeys.has(col.key)}
              className={`px-2 py-0.5 rounded text-xs font-medium border transition-colors ${
                !hiddenKeys.has(col.key)
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'
              }`}
            >
              {col.header}
            </button>
          ))}
        </div>
      )}

      {/* Table wrapper */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table
          id={tableId}
          className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm"
          aria-label={caption}
        >
          {caption && <caption className="sr-only">{caption}</caption>}

          <thead className={`bg-gray-50 dark:bg-gray-800/60 ${
            stickyHeader ? 'sticky top-0 z-10' : ''
          }`}>
            <tr>
              {visibleColumns.map(col => (
                <th
                  key={col.key}
                  scope="col"
                  className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap ${
                    col.sortable && onSortChange ? 'cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200' : ''
                  } ${col.headerClassName ?? ''}`}
                  onClick={col.sortable && onSortChange ? () => handleSort(col.key) : undefined}
                  aria-sort={
                    col.sortable && sortKey === col.key
                      ? sortDirection === 'asc' ? 'ascending' : 'descending'
                      : undefined
                  }
                >
                  <span className="inline-flex items-center">
                    {col.header}
                    {col.sortable && onSortChange && (
                      <SortIcon active={sortKey === col.key} direction={sortDirection} />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} colCount={visibleColumns.length} />
                ))
              : data.length === 0
              ? (
                <tr>
                  <td
                    colSpan={visibleColumns.length}
                    className="px-4 py-10 text-center text-gray-400 dark:text-gray-500"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              )
              : data.map(row => (
                <tr
                  key={keyExtractor(row)}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  {visibleColumns.map(col => (
                    <td
                      key={col.key}
                      className={`px-4 py-3 text-gray-700 dark:text-gray-300 ${col.className ?? ''}`}
                    >
                      {col.accessor(row)}
                    </td>
                  ))}
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {showPagination && pagination && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {pagination.from}–{pagination.to} / {pagination.total} 件
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange?.(pagination.current_page - 1)}
              disabled={pagination.current_page <= 1}
              className="px-2.5 py-1.5 rounded border border-gray-200 dark:border-gray-700 text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              aria-label="前のページ"
            >
              ‹
            </button>

            {Array.from({ length: Math.min(pagination.last_page, 7) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => onPageChange?.(page)}
                  aria-current={page === pagination.current_page ? 'page' : undefined}
                  className={`px-2.5 py-1.5 rounded border text-xs font-medium transition-colors ${
                    page === pagination.current_page
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => onPageChange?.(pagination.current_page + 1)}
              disabled={pagination.current_page >= pagination.last_page}
              className="px-2.5 py-1.5 rounded border border-gray-200 dark:border-gray-700 text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              aria-label="次のページ"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
