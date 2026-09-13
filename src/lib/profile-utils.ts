import type { BirthProfile } from '@/lib-packages/shared';

/**
 * Profile Validation Utilities
 *
 * Handles profile data validation and sessionStorage fallback logic.
 * Centralized logic for recovering profile data after OAuth redirects.
 */

const PENDING_PROFILE_KEY = 'horo-pending-profile';

export type PendingProfileRecord = {
  version: 1;
  profile: Partial<BirthProfile>;
  provider: string;
  userId: string | null;
};

/**
 * Check if profile has all required fields
 */
export function isValidProfile(profile: Partial<BirthProfile>): boolean {
  return !!(profile.name && profile.birthDate && profile.gender);
}

export function getIncompleteProfileStep(
  profile: Partial<BirthProfile>,
): 'name' | 'birthDate' | 'gender' | null {
  if (!profile.name) return 'name';
  if (!profile.birthDate) return 'birthDate';
  if (!profile.gender) return 'gender';
  return null;
}

/**
 * Get profile from sessionStorage
 * Used as fallback after OAuth redirects where store data might be lost
 */
export function claimPendingProfile(
  value: unknown,
  userId: string,
  authProvider: string | null,
): PendingProfileRecord | null {
  if (!value || typeof value !== 'object') return null;

  const record = value as Partial<PendingProfileRecord>;
  if (
    record.version !== 1 ||
    !record.profile ||
    typeof record.profile !== 'object' ||
    typeof record.provider !== 'string' ||
    (record.userId !== null && typeof record.userId !== 'string')
  ) {
    return null;
  }

  if (record.userId) {
    return record.userId === userId ? (record as PendingProfileRecord) : null;
  }

  if (!authProvider || record.provider !== authProvider) return null;
  return { ...(record as PendingProfileRecord), userId };
}

export function getProfileFromSessionStorage(
  userId: string,
  authProvider: string | null,
): Partial<BirthProfile> | null {
  if (typeof window === 'undefined') return null;

  const pendingProfile = sessionStorage.getItem(PENDING_PROFILE_KEY);
  if (!pendingProfile) return null;

  try {
    const claimed = claimPendingProfile(JSON.parse(pendingProfile), userId, authProvider);
    if (!claimed) {
      sessionStorage.removeItem(PENDING_PROFILE_KEY);
      return null;
    }

    sessionStorage.setItem(PENDING_PROFILE_KEY, JSON.stringify(claimed));
    return claimed.profile;
  } catch (e) {
    console.error('[ProfileUtils] Failed to parse pending profile:', e);
    sessionStorage.removeItem(PENDING_PROFILE_KEY);
    return null;
  }
}

/**
 * Clear profile from sessionStorage
 */
export function clearProfileFromSessionStorage(): void {
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem(PENDING_PROFILE_KEY);
    } catch {
      // Storage may be disabled; profile recovery remains best-effort.
    }
  }
}

/**
 * Save profile to sessionStorage (for OAuth redirect persistence)
 */
export function saveProfileToSessionStorage(
  profile: Partial<BirthProfile>,
  provider: string,
  userId: string | null = null,
): void {
  if (typeof window !== 'undefined') {
    const record: PendingProfileRecord = { version: 1, profile, provider, userId };
    sessionStorage.setItem(PENDING_PROFILE_KEY, JSON.stringify(record));
  }
}
