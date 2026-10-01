import React from 'react';

interface Props {
  currentPage:   number;
  totalPages:    number;
  totalItems:    number;
  perPage:       number;
  onPageChange:  (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
  perPageOptions?: number[];
  loading?:      boolean;
}

const PER_PAGE_DEFAULTS = [10, 25, 50, 100];

const range = (start: number, end: number): number[] =>
  Array.from({ length: end - start + 1 }, (_, i) => start + i);

const getPageNumbers = (current: number, total: number): (number | '...')[] => {
  if (total <= 7) return range(1, total);

  const pages: (number | '...')[] = [1];

  if (current > 3) pages.push('...');
  const start = Math.max(2, current - 1);
  const end   = Math.min(total - 1, current + 1);
  pages.push(...range(start, end));
  if (current < total - 2) pages.push('...');
  pages.push(total);

  return pages;
};

export const PaginationControls: React.FC<Props> = ({
  currentPage,
  totalPages,
  totalItems,
  perPage,
  onPageChange,
  onPerPageChange,
  perPageOptions = PER_PAGE_DEFAULTS,
  loading = false,
}) => {
  const from = Math.min((currentPage - 1) * perPage + 1, totalItems);
  const to   = Math.min(currentPage * perPage, totalItems);
  const pages = getPageNumbers(currentPage, totalPages);

  const btnBase = 'inline-flex items-center justify-center h-8 min-w-[2rem] px-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1';
  const btnActive  = 'bg-indigo-600 text-white';
  const btnDefault = 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800';
  const btnDisabled = 'text-gray-300 dark:text-gray-600 cursor-not-allowed';

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-3">
      {/* Item count */}
      <p className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
        {loading
          ? 'Loading…'
          : totalItems === 0
          ? 'No results'
          : `${from.toLocaleString()}–${to.toLocaleString()} of ${totalItems.toLocaleString()} results`
        }
      </p>

      {/* Page buttons */}
      <nav aria-label="Pagination" className="flex items-center gap-1">
        {/* Prev */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || loading}
          aria-label="Previous page"
          className={`${btnBase} ${currentPage <= 1 || loading ? btnDisabled : btnDefault}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Page numbers */}
        {pages.map((page, i) =>
          page === '...'
            ? <span key={`ellipsis-${i}`} className="px-1 text-gray-400">&hellip;</span>
            : (
              <button
                key={page}
                onClick={() => onPageChange(page as number)}
                disabled={loading}
                aria-label={`Page ${page}`}
                aria-current={page === currentPage ? 'page' : undefined}
                className={`${btnBase} ${page === currentPage ? btnActive : loading ? btnDisabled : btnDefault}`}
              >
                {page}
              </button>
            )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || loading}
          aria-label="Next page"
          className={`${btnBase} ${currentPage >= totalPages || loading ? btnDisabled : btnDefault}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </nav>

      {/* Per-page selector */}
      {onPerPageChange && (
        <div className="flex items-center gap-2 flex-shrink-0">
          <label className="text-sm text-gray-500 dark:text-gray-400">Per page</label>
          <select
            value={perPage}
            onChange={e => onPerPageChange(Number(e.target.value))}
            disabled={loading}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {perPageOptions.map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};
