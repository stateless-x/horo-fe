'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { RelationshipType } from '@/lib-packages/shared';
import { api } from '@/lib/api';
import type { HistoryResponse } from '@/features/compatibility/relationship-config';
import { compatibilityResultPath } from '@/features/compatibility/compatibility-routes';
import { HISTORY_PAGE_SIZE, selectHistoryPage } from '@/features/compatibility/history-paging';
import {
  CompatibilityHistoryPageView,
  type HistoryPageStatus,
} from '@/features/compatibility/compatibility-history-page-view';

/**
 * Shows one page of the full history. The endpoint pages by cursor, so pages are fetched in
 * order into one infinite-query cache and only the requested one is shown. The page lives in
 * the URL, and the cache keeps earlier pages, so Back from a result returns to the same page.
 */
export function CompatibilityHistoryPage({ page, type }: { page: number; type?: RelationshipType }) {
  const router = useRouter();

  const query = useInfiniteQuery<HistoryResponse>({
    queryKey: ['compatibility', 'history', 'all', type ?? 'all'],
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({ limit: String(HISTORY_PAGE_SIZE) });
      if (pageParam) params.set('cursor', pageParam as string);
      if (type) params.set('relationshipType', type);
      return api.get<HistoryResponse>(`/api/fortune/compatibility/history?${params}`);
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
    staleTime: 60_000,
  });

  const pages = query.data?.pages ?? [];
  const total = pages[0]?.total ?? 0;
  const selection = pages.length > 0 ? selectHistoryPage(pages, total, query.hasNextPage, page) : undefined;
  const needsFetch = selection?.needsFetch ?? false;
  const { fetchNextPage, isFetchingNextPage, isFetchNextPageError } = query;

  // A deep link (?page=3) or an expired cache: walk the cursor forward until the page is loaded.
  // A failed step stops here and shows the error; retrying fetches that step again.
  useEffect(() => {
    if (needsFetch && !isFetchingNextPage && !isFetchNextPageError) void fetchNextPage();
  }, [needsFetch, isFetchingNextPage, isFetchNextPageError, fetchNextPage]);

  const status: HistoryPageStatus = selection?.items ? 'ready' : query.isError ? 'error' : 'loading';

  return (
    <CompatibilityHistoryPageView
      type={type}
      status={status}
      total={total}
      items={selection?.items ?? []}
      page={selection?.current ?? page}
      pageCount={selection?.pageCount ?? 1}
      onRetry={() => void (pages.length > 0 ? fetchNextPage() : query.refetch())}
      onViewHistory={(id) => router.push(compatibilityResultPath(id))}
    />
  );
}
