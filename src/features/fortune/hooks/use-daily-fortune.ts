'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useSession } from '@/lib/auth-client';
import { getMsUntilThaiMidnight } from '@/lib/date-utils';

export {
  getDailyHookLine,
  HOOK_LINE_MAX_CHARS,
  type StructuredDailyContent,
} from '../daily-content';
import type { StructuredDailyContent } from '../daily-content';

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
    queryFn: () => api.get<DailyReadingResponse>('/api/fortune/daily'),
    enabled: enabled && !!userId,
    staleTime: getMsUntilThaiMidnight(),
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    retry: 3,
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
