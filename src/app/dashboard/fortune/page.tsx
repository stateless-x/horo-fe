'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFortuneGeneration } from '@/hooks/use-fortune-generation';
import { useFortuneData } from '@/hooks/use-fortune-data';
import { useFortuneStore } from '@/stores/fortune';
import { LoadingSkeleton } from '@/components/fortune/loading-skeleton';
import { ErrorDisplay } from '@/components/fortune/error-display';
import { FortuneContent } from '@/components/fortune/fortune-content';

/**
 * Fortune Detail Page (Post-Registration)
 *
 * This page shows the FULL fortune reading after user completes auth.
 * It handles:
 * - Session validation with retry logic and exponential backoff
 * - Profile data recovery from sessionStorage (survives OAuth redirects)
 * - Streaming/progressive loading of LLM-generated content
 * - Skeleton loading states while generating
 * - Mobile-first responsive design
 *
 * Flow: User completes auth → lands here → sees their full fortune
 *
 * Architecture:
 * - useFortuneGeneration: Orchestrates fortune generation flow with retry logic
 * - useFortuneData: React Query hook for data fetching (future use)
 * - useFortuneStore: Zustand store for UI state management
 * - Profile validation and recovery logic extracted to profile-utils
 * - Components split into LoadingSkeleton, ErrorDisplay, and FortuneContent
 */
export default function FortuneDetailPage() {
  const router = useRouter();

  // State management
  const { loadingState, error } = useFortuneStore();

  // Session validation and fortune generation
  const { session, sessionLoading } = useFortuneGeneration();

  // Fortune data fetching (currently managed by generation hook, but available for future use)
  const { data: fortuneReading } = useFortuneData(loadingState === 'complete');

  // Redirect unauthenticated users
  useEffect(() => {
    if (!sessionLoading && !session) {
      router.push('/login');
    }
  }, [session, sessionLoading, router]);

  // Show loading skeleton while initializing or generating
  if (sessionLoading || !session || loadingState !== 'complete') {
    return <LoadingSkeleton loadingState={loadingState} />;
  }

  // Show error state
  if (error) {
    return <ErrorDisplay error={error} />;
  }

  // Show main content
  if (fortuneReading) {
    return <FortuneContent fortuneReading={fortuneReading} userName={session.user.name} />;
  }

  // Fallback - should not reach here in normal flow
  return <LoadingSkeleton loadingState={loadingState} />;
}
