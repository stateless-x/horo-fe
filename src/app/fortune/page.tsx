'use client';

import { OnboardingFlow } from '@/components/onboarding/onboarding-flow';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

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
 * This route is for:
 * - First-time users who clicked "ดูดวงของเจ้า" from landing page
 * - Users who want to create a new fortune reading
 */
export default function FortunePage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  // Redirect authenticated users who have completed onboarding to dashboard
  // Allow authenticated users who haven't completed onboarding to go through the flow
  useEffect(() => {
    if (session && !isPending && (session.user as any)?.onboardingCompleted) {
      router.push('/dashboard');
    }
  }, [session, isPending]);

  // Show loading state while checking session
  if (isPending) {
    return (
      <div className="min-h-screen bg-voidBlack flex items-center justify-center">
        <div className="text-ghostWhite text-lg font-oracle">กำลังโหลด...</div>
      </div>
    );
  }

  // Show onboarding flow for non-authenticated users
  return <OnboardingFlow />;
}
