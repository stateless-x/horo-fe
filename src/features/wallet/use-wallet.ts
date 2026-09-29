'use client';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { HistoryKind, WalletHistoryResponse, WalletResponse, WalletState } from '@/lib-packages/shared/types/wallet';

/** One cache entry for the balance chip, the ดวงคู่ door and /dashboard/wallet; invalidate it after a spend. */
export const WALLET_QUERY_KEY = ['wallet'] as const;

/**
 * GET /api/wallet. The first call grants the welcome gift (horo-be/docs/wallet.md).
 * `{ enabled: false }` while nothing is sellable: callers then show no wallet at all.
 */
export function useWallet() {
  return useQuery({
    queryKey: WALLET_QUERY_KEY,
    queryFn: () => api.get<WalletResponse>('/api/wallet'),
    staleTime: 30_000,
  });
}

/** The wallet when it is on; undefined while loading, on error, or while disabled. */
export function enabledWallet(data: WalletResponse | undefined): WalletState | undefined {
  return data?.enabled ? data : undefined;
}

export const WALLET_HISTORY_PAGE_SIZE = 20;

/**
 * GET /api/wallet/history, newest first, one page of 20 per `fetchNextPage`.
 * The key sits under WALLET_QUERY_KEY, so every existing wallet invalidation
 * (after a top-up or an unlock) refetches the history too. `gcTime: 0` drops a
 * filter's pages once it is left, so switching filters starts again at page one.
 * Only call it while the wallet is on: the route answers 404 otherwise.
 */
export function useWalletHistory(kind: HistoryKind | undefined) {
  return useInfiniteQuery({
    queryKey: [...WALLET_QUERY_KEY, 'history', kind ?? 'all'],
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({ limit: String(WALLET_HISTORY_PAGE_SIZE) });
      if (pageParam) params.set('cursor', pageParam);
      if (kind) params.set('kind', kind);
      return api.get<WalletHistoryResponse>(`/api/wallet/history?${params}`);
    },
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor,
    gcTime: 0,
  });
}
