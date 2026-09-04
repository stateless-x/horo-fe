import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useSession } from '@/lib/auth-client';
import type { StructuredChartResponse } from '@/lib-packages/shared/types/astrology';

/**
 * Fortune Data Hook
 *
 * Fetches fortune chart data using React Query.
 * This is kept separate from the generation hook to allow independent data fetching.
 *
 * IMPORTANT: Cache key includes userId to prevent cross-account data leakage
 * when switching between accounts.
 */
export function useFortuneData(enabled: boolean = true) {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  return useQuery<StructuredChartResponse>({
    queryKey: ['fortune', 'chart', userId],
    queryFn: () => api.get<StructuredChartResponse>('/api/fortune/chart', { timeout: 45_000 }),
    enabled: enabled && !!userId,
    staleTime: Infinity, // Fortune data doesn't change frequently
    gcTime: 30 * 60 * 1000, // Cache for 30 minutes
  });
}
