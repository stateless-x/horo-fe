import type { BirthProfile } from '@/lib-packages/shared';
import { isValidProfile } from '@/lib/profile-utils';

export type DashboardProfileRecoveryResult = {
  destination: 'dashboard' | 'setup';
  shouldCompleteOnboarding: boolean;
};

interface DashboardProfileRecoveryOptions {
  onboardingCompleted: boolean;
  pendingProfile: Partial<BirthProfile>;
  loadServerProfile: () => Promise<boolean>;
  savePendingProfile: (profile: Partial<BirthProfile>) => Promise<void>;
  onPendingProfileSaved: () => void;
}

/**
 * Establish the one invariant required by every dashboard page: the signed-in
 * user has a birth profile on the server.
 *
 * Incomplete signups may still have their profile in browser storage after an
 * OAuth redirect. Completed users deliberately ignore that storage so stale
 * onboarding data can never overwrite their existing server profile.
 */
export async function recoverDashboardProfile({
  onboardingCompleted,
  pendingProfile,
  loadServerProfile,
  savePendingProfile,
  onPendingProfileSaved,
}: DashboardProfileRecoveryOptions): Promise<DashboardProfileRecoveryResult> {
  if (!onboardingCompleted && isValidProfile(pendingProfile)) {
    await savePendingProfile(pendingProfile);
    onPendingProfileSaved();
    return { destination: 'dashboard', shouldCompleteOnboarding: true };
  }

  const hasServerProfile = await loadServerProfile();
  if (!hasServerProfile) {
    return { destination: 'setup', shouldCompleteOnboarding: false };
  }

  return {
    destination: 'dashboard',
    // Heal accounts whose profile exists but whose completion flag was not
    // persisted (for example, an interrupted older onboarding request).
    shouldCompleteOnboarding: !onboardingCompleted,
  };
}
