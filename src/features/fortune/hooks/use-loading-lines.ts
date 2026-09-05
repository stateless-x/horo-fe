'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { LoadingLinesResponse, LoadingSurface } from '@/lib-packages/shared';

export type { LoadingLinesResponse, LoadingSurface, SponsoredLine } from '@/lib-packages/shared';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const EMPTY: LoadingLinesResponse = { lines: [], sponsored: [], version: '' };

/**
 * Loading-line copy for one surface.
 *
 * This must never gate a render: the loading screen it decorates is already
 * the user's wait. On error, or before the first response, `data` is an empty
 * pool and the caller falls back to its own hardcoded status messages. The
 * request is unauthenticated and the payload is identical for every user, so
 * the query key carries no user id.
 */
export function useLoadingLines(surface: LoadingSurface) {
  const query = useQuery<LoadingLinesResponse>({
    queryKey: ['loading-lines', surface],
    queryFn: () => api.get<LoadingLinesResponse>(`/api/loading-lines/${surface}`),
    staleTime: ONE_DAY_MS,
    gcTime: ONE_DAY_MS,
    // One retry only. A second failure means the loader shows its fallback
    // messages, which is a perfectly good outcome worth no further waiting.
    retry: 1,
  });

  return {
    lines: query.data?.lines ?? EMPTY.lines,
    sponsored: query.data?.sponsored ?? EMPTY.sponsored,
    version: query.data?.version ?? EMPTY.version,
  };
}
