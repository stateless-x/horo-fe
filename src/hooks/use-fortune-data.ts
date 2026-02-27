import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { FortuneReading } from './use-fortune-generation';

/**
 * Fortune Data Hook
 *
 * Fetches fortune chart data using React Query.
 * This is kept separate from the generation hook to allow independent data fetching.
 */
export function useFortuneData(enabled: boolean = true) {
  return useQuery<FortuneReading>({
    queryKey: ['fortune', 'chart'],
    queryFn: () => api.get<FortuneReading>('/fortune/chart'),
    enabled,
    staleTime: Infinity, // Fortune data doesn't change frequently
    gcTime: 30 * 60 * 1000, // Cache for 30 minutes
  });
}
