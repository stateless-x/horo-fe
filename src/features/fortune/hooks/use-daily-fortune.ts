'use client';

import { useQuery } from '@tanstack/react-query';
import { api, isRetriableApiError } from '@/lib/api';
import { useSession } from '@/lib/auth-client';
import { getMsUntilThaiMidnight } from '@/lib/date-utils';

export {
  getDailyHookLine,
  HOOK_LINE_MAX_CHARS,
  type StructuredDailyContent,
} from '../daily-content';
import type { StructuredDailyContent } from '../daily-content';
import { DAILY_BUDGET } from '@/lib-packages/shared';

export interface DailyReadingResponse {
  id: string;
  profileId: string;
  date: string;
  content: string;
  luckyNumber: number | null;
  luckyColor: string | null;
  luckyDirection: string | null;
  elementEnergy: string | null;
  createdAt: string;
  structuredContent: StructuredDailyContent | null;
}

export interface UserProfileResponse {
  user: {
    name: string;
    displayName: string | null;
  };
  profile: {
    birthDate: string;
    gender: string;
    birthHour: number | null;
  } | null;
  astrology: {
    primaryElement: string | null;
    planet: string | null;
  };
}

/**
 * Hook for fetching today's daily fortune reading.
 * Uses staleTime based on Thai midnight to avoid unnecessary refetches.
 *
 * IMPORTANT: Cache key includes userId to prevent cross-account data leakage
 * when switching between accounts.
 */
export function useDailyFortune(enabled: boolean = true) {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  return useQuery<DailyReadingResponse>({
    queryKey: ['fortune', 'daily', userId],
    // Derived from the shared budget, which sits just past the socket ceiling
    // so the server is always what gives up. Restating the number here is what
    // let it drift from the loading screen's escape hatch.
    queryFn: () =>
      api.get<DailyReadingResponse>('/api/fortune/daily', {
        timeout: DAILY_BUDGET.clientTimeoutMs,
      }),
    enabled: enabled && !!userId,
    staleTime: getMsUntilThaiMidnight(),
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    // The backend already runs its own retry ladder inside one request, so a
    // client retry re-runs a full cold generation rather than recovering from a
    // blip. At the old retry:3 that stacked into ~17 minutes of loader before
    // any error surfaced — which is what "does not load" looked like. Retry
    // once, and never on a timeout: if the server burned its whole socket
    // budget, asking again produces the same wait, not a different answer.
    retry: (failureCount, error) => isRetriableApiError(error) && failureCount < 1,
    retryDelay: (attemptIndex) =>
      Math.min(1000 * Math.pow(2, attemptIndex), 30000),
  });
}

/**
 * Hook for fetching user profile with astrology identity data.
 * This data rarely changes so we use a long staleTime.
 *
 * IMPORTANT: Cache key includes userId to prevent cross-account data leakage
 * when switching between accounts.
 */
export function useUserProfile(enabled: boolean = true) {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  return useQuery<UserProfileResponse>({
    queryKey: ['fortune', 'user-profile', userId],
    queryFn: () => api.get<UserProfileResponse>('/api/fortune/user-profile'),
    enabled: enabled && !!userId,
    staleTime: Infinity,
    gcTime: 24 * 60 * 60 * 1000,
  });
}
