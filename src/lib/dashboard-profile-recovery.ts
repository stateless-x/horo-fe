import type { BirthProfile } from '@/lib-packages/shared';
import { isValidProfile } from '@/lib/profile-utils';

export function dashboardProfileRecoveryKey({
  userId,
  authProvider,
  onboardingCompleted,
  attempt,
}: {
  userId: string;
  authProvider: string | null;
  onboardingCompleted: boolean;
  attempt: number;
}): string {
  return JSON.stringify([userId, authProvider, onboardingCompleted, attempt]);
}

export type ProfileRecoveryFailureAction = 'login' | 'setup' | 'error';

export function profileRecoveryFailureAction(status: number | undefined): ProfileRecoveryFailureAction {
  if (status === 401) return 'login';
  if (status === 400 || status === 422) return 'setup';
  return 'error';
}

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
 * A signup may still have its profile in browser storage after an OAuth
 * redirect. Browser data is used only when the server has no profile, so stale
 * onboarding data can never overwrite an existing server profile.
 */
export async function recoverDashboardProfile({
  onboardingCompleted,
  pendingProfile,
  loadServerProfile,
  savePendingProfile,
  onPendingProfileSaved,
}: DashboardProfileRecoveryOptions): Promise<DashboardProfileRecoveryResult> {
  const hasServerProfile = await loadServerProfile();
  if (hasServerProfile) {
    return {
      destination: 'dashboard',
      // Heal accounts whose profile exists but whose completion flag was not
      // persisted (for example, an interrupted older onboarding request).
      shouldCompleteOnboarding: !onboardingCompleted,
    };
  }

  // The server profile is the source of truth. Only use browser data after we
  // know no server profile exists, so stale onboarding data cannot overwrite a
  // returning user's saved profile. This also repairs inconsistent accounts
  // whose completion flag is true even though their profile is missing.
  if (isValidProfile(pendingProfile)) {
    await savePendingProfile(pendingProfile);
    onPendingProfileSaved();
    return { destination: 'dashboard', shouldCompleteOnboarding: !onboardingCompleted };
  }

  return { destination: 'setup', shouldCompleteOnboarding: false };
}
