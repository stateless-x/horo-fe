'use client';

import { OnboardingFlow } from '@/components/onboarding/onboarding-flow';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useOnboardingStore } from '@/stores/onboarding';

/**
 * Fortune Telling Onboarding Page
 *
 * Full 8-step onboarding flow:
 * 1. Welcome animation
 * 2. Name input
 * 3. Birth date picker
 * 4. Gender selection
 * 5. Birth time input
 * 6. Teaser result (value shown BEFORE auth)
 * 7. Auth prompt (Google/X OAuth)
 * 8. Redirect to dashboard
 *
 * Features:
 * - Persists onboarding data in localStorage for 15 minutes
 * - Redirects logged-in users with completed onboarding to dashboard
 * - Only non-logged-in users can access onboarding
 * - Auto-clears expired onboarding data
 */
export default function FortunePage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const { isExpired, reset } = useOnboardingStore();

  // Check for expired data and clear it
  useEffect(() => {
    if (isExpired()) {
      console.log('[Fortune] Onboarding data expired, resetting');
      reset();
    }
  }, [isExpired, reset]);

  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (!isPending && session) {
      console.log('[Fortune] User is logged in, redirecting to dashboard');
      router.push('/dashboard');
    }
  }, [session, isPending, router]);

  // Show loading state while checking session
  if (isPending) {
    return (
      <div className="min-h-screen bg-voidBlack flex items-center justify-center">
        <div className="text-ghostWhite text-lg font-oracle">กำลังโหลด...</div>
      </div>
    );
  }

  // Only show onboarding flow for non-logged-in users
  return <OnboardingFlow />;
}
