'use client';

import { Suspense } from 'react';
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow';
import { useSession } from '@/lib/auth-client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useOnboardingStore } from '@/stores/onboarding';

/**
 * Fortune Telling Onboarding Page
 *
 * Full 9-step onboarding flow:
 * 1. Welcome animation
 * 2. Name input
 * 3. Birth date picker
 * 4. Gender selection
 * 5. Birth time input
 * 6. MBTI selection (optional — skip if unknown)
 * 7. Teaser result (value shown BEFORE auth)
 * 8. Auth prompt (Google/X OAuth)
 * 9. Redirect to dashboard
 *
 * Features:
 * - Persists onboarding data in localStorage for 15 minutes
 * - Redirects logged-in users with completed onboarding to dashboard
 * - Only non-logged-in users can access onboarding
 * - Auto-clears expired onboarding data
 * - MBTI is optional and enhances fortune accuracy when provided
 */
function FortunePageContent() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSetupMode = searchParams.get('setup') === 'true';
  const { isExpired, reset, setStep, currentStep } = useOnboardingStore();

  // Check for expired data and clear it
  useEffect(() => {
    if (isExpired()) {
      console.log('[Fortune] Onboarding data expired, resetting');
      reset();
    }
  }, [isExpired, reset]);

  // Setup mode: logged-in user needs to fill birth profile
  // Skip welcome animation and start from name input
  useEffect(() => {
    if (isSetupMode && currentStep === 'welcome') {
      console.log('[Fortune] Setup mode: skipping welcome, starting from name');
      reset();
      setStep('name');
    }
  }, [isSetupMode, currentStep, reset, setStep]);

  // Redirect logged-in users to dashboard (unless in setup mode)
  useEffect(() => {
    if (!isPending && session && !isSetupMode) {
      console.log('[Fortune] User is logged in, redirecting to dashboard');
      router.replace('/dashboard/today');
    }
  }, [session, isPending, router, isSetupMode]);

  // Block render until session is resolved — prevents onboarding flash for logged-in users
  if (isPending || (session && !isSetupMode)) {
    return (
      <div className="min-h-screen bg-voidBlack flex items-center justify-center">
        <div className="text-ghostWhite text-lg font-oracle">กำลังโหลด...</div>
      </div>
    );
  }

  // Only show onboarding flow for non-logged-in users (or setup mode)
  return <OnboardingFlow />;
}

export default function FortunePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-voidBlack flex items-center justify-center">
          <div className="text-ghostWhite text-lg font-oracle">กำลังโหลด...</div>
        </div>
      }
    >
      <FortunePageContent />
    </Suspense>
  );
}
