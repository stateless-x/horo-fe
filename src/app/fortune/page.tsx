'use client';

import { Suspense } from 'react';
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow';
import { useSession, type HoroSessionUser } from '@/lib/auth-client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useOnboardingStore } from '@/stores/onboarding';
import { sanitizeReturnTo, withReturnTo } from '@/lib/auth-navigation';

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
 * - `?new=true` skips welcome/returning and starts straight at the name step
 */
function FortunePageContent() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSetupMode = searchParams.get('setup') === 'true';
  const isNewUserMode = searchParams.get('new') === 'true';
  const returnTo = sanitizeReturnTo(searchParams.get('returnTo'));
  const { isExpired, reset, setStep, currentStep } = useOnboardingStore();
  // One-shot guard: only auto-advance once. Without this, pressing "back" from
  // the name step (which returns to 'returning') would re-trigger this effect
  // and bounce the user right back to 'name', trapping them.
  const hasAppliedNewUserMode = useRef(false);

  // Check for expired data and clear it
  useEffect(() => {
    if (isExpired()) {
      console.log('[Fortune] Onboarding data expired, resetting');
      reset();
    }
  }, [isExpired, reset]);

  // Setup mode: logged-in user needs to fill birth profile
  // Skip welcome/returning and start from name input. `returning` matters for
  // users who chose "I already have an account", signed in, then turned out
  // not to have a profile yet; leaving them there would create a login loop.
  useEffect(() => {
    if (isSetupMode && (currentStep === 'welcome' || currentStep === 'returning')) {
      console.log('[Fortune] Setup mode: skipping welcome, starting from name');
      reset();
      setStep('name');
    }
  }, [isSetupMode, currentStep, reset, setStep]);

  // New user mode: link from login's "ยังไม่มีบัญชี?" lands here.
  // Skip welcome + returning-user check and go straight to name input —
  // asking "have you been here before?" is redundant for someone who just
  // said they have no account. Keep any name/birth data already entered
  // (no reset) — the expiry effect above already resets if it's stale.
  useEffect(() => {
    if (
      isNewUserMode &&
      !hasAppliedNewUserMode.current &&
      (currentStep === 'welcome' || currentStep === 'returning')
    ) {
      console.log('[Fortune] New user mode: skipping welcome/returning, starting from name');
      hasAppliedNewUserMode.current = true;
      setStep('name');
    }
  }, [isNewUserMode, currentStep, setStep]);

  // Completed users go to the dashboard. An authenticated account without a
  // completed profile stays in the onboarding recovery path instead of landing
  // on a dashboard API that cannot serve it yet.
  useEffect(() => {
    if (!isPending && session && !isSetupMode) {
      const onboardingCompleted = (session.user as HoroSessionUser).onboardingCompleted === true;
      const destination = onboardingCompleted
        ? returnTo
        : withReturnTo('/fortune?setup=true', returnTo);
      console.log('[Fortune] User is logged in, redirecting to:', destination);
      router.replace(destination);
    }
  }, [session, isPending, returnTo, router, isSetupMode]);

  // Block render until session is resolved — prevents onboarding flash for logged-in users.
  // Also hold while new-user mode is about to skip ahead, so the welcome
  // animation never paints for a frame before the effect above moves to 'name'.
  // Reads the one-shot ref so that pressing back to 'returning' later renders
  // normally instead of re-tripping this gate.
  const isSkippingToName =
    isNewUserMode &&
    !hasAppliedNewUserMode.current &&
    (currentStep === 'welcome' || currentStep === 'returning');
  if (isPending || (session && !isSetupMode) || isSkippingToName) {
    return (
      <div className="min-h-screen bg-ground flex items-center justify-center">
        <div className="text-ink text-lg font-oracle">กำลังโหลด...</div>
      </div>
    );
  }

  // Only show onboarding flow for non-logged-in users (or setup mode)
  return <OnboardingFlow returnTo={returnTo} />;
}

export default function FortunePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-ground flex items-center justify-center">
          <div className="text-ink text-lg font-oracle">กำลังโหลด...</div>
        </div>
      }
    >
      <FortunePageContent />
    </Suspense>
  );
}
