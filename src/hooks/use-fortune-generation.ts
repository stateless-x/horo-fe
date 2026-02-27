import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { api } from '@/lib/api';
import { useOnboardingStore } from '@/stores/onboarding';
import { useFortuneStore } from '@/stores/fortune';
import { useSessionRetry } from './use-session-retry';
import { getValidProfileWithFallback } from '@/lib/profile-utils';

/**
 * Fortune Reading Interface
 */
export interface FortuneReading {
  baziChart: {
    yearPillar: { stem: string; branch: string };
    monthPillar: { stem: string; branch: string };
    dayPillar: { stem: string; branch: string };
    hourPillar?: { stem: string; branch: string };
    dayMaster: string;
    element: string;
  };
  thaiAstrology: {
    day: string;
    color: string;
    planet: string;
    personality: string;
    luckyNumber: number;
    luckyDirection: string;
  };
  narrative: string;
  currentAge: number;
}

/**
 * Fortune Generation Hook
 *
 * Orchestrates the entire fortune generation flow:
 * - Session validation with retry logic
 * - Profile data validation and recovery
 * - Fortune chart generation
 * - Narrative streaming simulation
 * - Error handling with appropriate redirects
 */
export function useFortuneGeneration() {
  const { data: session, isPending: sessionLoading } = useSession();
  const router = useRouter();
  const { profile } = useOnboardingStore();
  const {
    loadingState,
    hasAttemptedGeneration,
    setLoadingState,
    setError,
    setHasAttemptedGeneration,
    addNarrativeChunk,
    resetNarrativeChunks,
  } = useFortuneStore();

  const {
    incrementRetryCount,
    resetRetryCount,
    isMaxRetriesReached,
    getBackoffDelay,
    getRetryCount,
    maxRetries,
  } = useSessionRetry();

  useEffect(() => {
    // Prevent re-running if already loading or complete
    if (loadingState !== 'initializing') {
      return;
    }

    // Wait for session to load
    if (!session || sessionLoading) {
      return;
    }

    // Prevent infinite redirect loops - only attempt once per page load
    if (hasAttemptedGeneration) {
      return;
    }

    // Prevent infinite retries - max 3 attempts
    if (isMaxRetriesReached()) {
      console.log('[FortuneGeneration] Max retries reached, giving up');
      setError('ไม่สามารถโหลดดวงชะตาได้ กรุณาลองใหม่ภายหลัง');
      setLoadingState('complete');
      resetRetryCount();
      return;
    }

    async function generateFortune() {
      console.log('[FortuneGeneration] Session loaded, generating fortune for user:', session?.user?.id);
      setHasAttemptedGeneration(true);

      try {
        // Get valid profile data with sessionStorage fallback
        const { profileData, isValid: hasStoreData } = getValidProfileWithFallback(profile);

        // Step 1: Save birth profile (only if coming from onboarding flow)
        if (hasStoreData) {
          setLoadingState('saving-profile');
          console.log('[FortuneGeneration] Saving profile to backend:', profileData);
          await api.post('/fortune/profile', profileData);
        }

        // Step 2: Fetch chart data (this will return cached data if it exists, not regenerate)
        setLoadingState('generating-chart');
        console.log('[FortuneGeneration] Fetching fortune chart (cached or new)');
        const reading = await api.get<FortuneReading>('/fortune/chart');

        console.log('[FortuneGeneration] Fortune chart received:', !!reading);

        // Step 3: Simulate streaming effect by breaking narrative into chunks
        // In a real implementation, this would use SSE or streaming API
        resetNarrativeChunks();
        const words = reading.narrative.split(' ');
        const chunkSize = 3; // Words per chunk
        const chunks: string[] = [];

        for (let i = 0; i < words.length; i += chunkSize) {
          chunks.push(words.slice(i, i + chunkSize).join(' '));
        }

        // Progressive reveal
        for (let i = 0; i < chunks.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 50));
          addNarrativeChunk(chunks[i]);
        }

        setLoadingState('complete');

        // Mark onboarding as complete
        await api.post('/api/onboarding/complete', {});

        // Success! Reset retry count
        resetRetryCount();

        return reading;
      } catch (err: any) {
        console.error('[FortuneGeneration] Error:', err);

        // Increment retry count (persists across page reloads)
        const newRetryCount = incrementRetryCount();

        // Handle 401 - Authentication error
        if (err?.status === 401) {
          if (newRetryCount >= maxRetries) {
            console.log('[FortuneGeneration] Max retries reached on 401, showing error');
            setError('ไม่สามารถยืนยันตัวตนได้ กรุณาเข้าสู่ระบบใหม่');
            setLoadingState('complete');
            resetRetryCount();
            setTimeout(() => router.push('/login'), 3000);
          } else {
            console.log(`[FortuneGeneration] Not authenticated, retry ${newRetryCount}/${maxRetries}`);
            // Exponential backoff: 1s, 2s, 4s
            const delay = getBackoffDelay(newRetryCount);
            setTimeout(() => {
              setHasAttemptedGeneration(false); // Allow retry
              window.location.reload(); // Force reload to retry
            }, delay);
          }
          return;
        }

        // Handle 404 - Birth profile not found
        if (err?.status === 404) {
          console.error('[FortuneGeneration] Birth profile not found (404)');
          setError('ไม่พบข้อมูลดวงชะตา กรุณากรอกข้อมูลใหม่อีกครั้ง');
          setLoadingState('complete');
          setTimeout(() => router.push('/fortune'), 3000);
          return;
        }

        // Handle 422 - Validation error
        if (err?.status === 422) {
          console.error('[FortuneGeneration] Validation error (422):', err?.body);
          setError('ข้อมูลไม่ถูกต้อง กรุณากรอกข้อมูลใหม่อีกครั้ง');
          setLoadingState('complete');
          setTimeout(() => router.push('/fortune'), 3000);
          return;
        }

        // Generic error
        setError('ไม่สามารถสร้างดวงชะตาได้ กรุณาลองใหม่อีกครั้ง');
        setLoadingState('complete');
      }
    }

    generateFortune();
  }, [session, sessionLoading, hasAttemptedGeneration]);

  return {
    sessionLoading,
    session,
  };
}
