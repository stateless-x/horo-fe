'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getMsUntilThaiMidnight } from '@/lib/date-utils';

/**
 * Structured daily reading from the API
 */
export interface StructuredDailyContent {
  overallReading: string;
  categories: {
    career: { reading: string; score: number; tip: string };
    love: { reading: string; score: number; tip: string };
    finance: { reading: string; score: number; tip: string };
    health: { reading: string; score: number; tip: string };
  };
  dos: string[];
  donts: string[];
  luckyMoment: string;
}

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
 */
export function useDailyFortune(enabled: boolean = true) {
  return useQuery<DailyReadingResponse>({
    queryKey: ['fortune', 'daily'],
    queryFn: () => api.get<DailyReadingResponse>('/api/fortune/daily'),
    enabled,
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
 */
export function useUserProfile(enabled: boolean = true) {
  return useQuery<UserProfileResponse>({
    queryKey: ['fortune', 'user-profile'],
    queryFn: () => api.get<UserProfileResponse>('/api/fortune/user-profile'),
    enabled,
    staleTime: Infinity,
    gcTime: 24 * 60 * 60 * 1000,
  });
}
