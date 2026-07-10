import React from 'react';

interface Props {
  sentinelRef: React.RefObject<HTMLDivElement>;
  isFetchingNextPage: boolean;
  hasNextPage: boolean | undefined;
}

export default function InfiniteScrollSentinel({ sentinelRef, isFetchingNextPage, hasNextPage }: Props) {
  return (
    <div ref={sentinelRef} className="py-4 flex justify-center">
      {isFetchingNextPage && (
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading more...
        </div>
      )}
      {!hasNextPage && !isFetchingNextPage && (
        <span className="text-xs text-gray-400 dark:text-gray-500">All items loaded</span>
      )}
    </div>
  );
}
