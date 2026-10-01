import { useEffect, useRef, useCallback } from 'react';
import { useInfiniteQuery, UseInfiniteQueryOptions } from '@tanstack/react-query';

interface CursorPage<T> {
  data: T[];
  next_cursor: string | null;
  has_more: boolean;
}

interface UseInfiniteScrollOptions<T> extends
  Omit<UseInfiniteQueryOptions<CursorPage<T>, Error, CursorPage<T>, CursorPage<T>, string[], string | null>, 'queryFn' | 'getNextPageParam' | 'initialPageParam'> {
  queryKey: string[];
  fetcher: (cursor: string | null) => Promise<CursorPage<T>>;
  rootMargin?: string;
  threshold?: number;
}

export function useInfiniteScroll<T>({
  queryKey,
  fetcher,
  rootMargin = '200px',
  threshold = 0,
  ...queryOptions
}: UseInfiniteScrollOptions<T>) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => fetcher(pageParam ?? null),
    getNextPageParam: (last) => last.has_more ? last.next_cursor : undefined,
    initialPageParam: null as string | null,
    ...queryOptions,
  } as UseInfiniteQueryOptions<CursorPage<T>, Error, CursorPage<T>, CursorPage<T>, string[], string | null>);

  const { fetchNextPage, hasNextPage, isFetchingNextPage } = query;

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { rootMargin, threshold }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore, rootMargin, threshold]);

  const allItems = query.data?.pages.flatMap(p => p.data) ?? [];

  return {
    ...query,
    items: allItems,
    sentinelRef,
    loadMore,
  };
}
