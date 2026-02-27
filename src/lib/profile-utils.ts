import type { BirthProfile } from '@/lib-packages/shared';

/**
 * Profile Validation Utilities
 *
 * Handles profile data validation and sessionStorage fallback logic.
 * Centralized logic for recovering profile data after OAuth redirects.
 */

const PENDING_PROFILE_KEY = 'horo-pending-profile';

/**
 * Check if profile has all required fields
 */
export function isValidProfile(profile: Partial<BirthProfile>): boolean {
  return !!(profile.name && profile.birthDate && profile.gender);
}

/**
 * Get profile from sessionStorage
 * Used as fallback after OAuth redirects where store data might be lost
 */
export function getProfileFromSessionStorage(): Partial<BirthProfile> | null {
  if (typeof window === 'undefined') return null;

  const pendingProfile = sessionStorage.getItem(PENDING_PROFILE_KEY);
  if (!pendingProfile) return null;

  try {
    return JSON.parse(pendingProfile);
  } catch (e) {
    console.error('[ProfileUtils] Failed to parse pending profile:', e);
    return null;
  }
}

/**
 * Clear profile from sessionStorage
 */
export function clearProfileFromSessionStorage(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(PENDING_PROFILE_KEY);
  }
}

/**
 * Save profile to sessionStorage (for OAuth redirect persistence)
 */
export function saveProfileToSessionStorage(profile: Partial<BirthProfile>): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(PENDING_PROFILE_KEY, JSON.stringify(profile));
  }
}

/**
 * Get valid profile data with sessionStorage fallback
 * Returns profile data and whether it's valid
 */
export function getValidProfileWithFallback(
  storeProfile: Partial<BirthProfile>
): { profileData: Partial<BirthProfile>; isValid: boolean } {
  let profileData = storeProfile;
  let isValid = isValidProfile(storeProfile);

  // Fallback: Check sessionStorage for profile data (survives OAuth redirect)
  if (!isValid) {
    const sessionProfile = getProfileFromSessionStorage();
    if (sessionProfile) {
      profileData = sessionProfile;
      isValid = isValidProfile(sessionProfile);
      console.log('[ProfileUtils] Restored profile from sessionStorage:', isValid);

      // Clear sessionStorage after reading
      clearProfileFromSessionStorage();
    }
  }

  return { profileData, isValid };
}
