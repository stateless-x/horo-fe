import { describe, expect, mock, test } from 'bun:test';
import { dashboardProfileRecoveryKey, profileRecoveryFailureAction, recoverDashboardProfile } from './dashboard-profile-recovery';

const validPendingProfile = {
  name: 'Purin',
  birthDate: '1990-01-01T00:00:00.000Z',
  gender: 'male' as const,
};

describe('dashboard profile recovery', () => {
  test('deduplicates only identical recovery inputs', () => {
    const base = { userId: 'user-1', authProvider: 'google', onboardingCompleted: false, attempt: 0 };
    const key = dashboardProfileRecoveryKey(base);
    expect(dashboardProfileRecoveryKey(base)).toBe(key);
    expect(dashboardProfileRecoveryKey({ ...base, authProvider: 'twitter' })).not.toBe(key);
    expect(dashboardProfileRecoveryKey({ ...base, onboardingCompleted: true })).not.toBe(key);
    expect(dashboardProfileRecoveryKey({ ...base, attempt: 1 })).not.toBe(key);
  });

  test('does not treat a missing authenticated user row as a missing birth profile', () => {
    expect(profileRecoveryFailureAction(401)).toBe('login');
    expect(profileRecoveryFailureAction(400)).toBe('setup');
    expect(profileRecoveryFailureAction(422)).toBe('setup');
    expect(profileRecoveryFailureAction(404)).toBe('error');
    expect(profileRecoveryFailureAction(500)).toBe('error');
  });

  test('saves a valid pending profile for an incomplete signup', async () => {
    const loadServerProfile = mock(async () => false);
    const savePendingProfile = mock(async () => undefined);
    const onPendingProfileSaved = mock(() => undefined);

    const result = await recoverDashboardProfile({
      onboardingCompleted: false,
      pendingProfile: validPendingProfile,
      loadServerProfile,
      savePendingProfile,
      onPendingProfileSaved,
    });

    expect(result).toEqual({ destination: 'dashboard', shouldCompleteOnboarding: true });
    expect(savePendingProfile).toHaveBeenCalledWith(validPendingProfile);
    expect(loadServerProfile).toHaveBeenCalledTimes(1);
    expect(onPendingProfileSaved).toHaveBeenCalledTimes(1);
  });

  test('keeps an incomplete user when a server profile already exists', async () => {
    const result = await recoverDashboardProfile({
      onboardingCompleted: false,
      pendingProfile: {},
      loadServerProfile: async () => true,
      savePendingProfile: async () => undefined,
      onPendingProfileSaved: () => undefined,
    });

    expect(result).toEqual({ destination: 'dashboard', shouldCompleteOnboarding: true });
  });

  test('sends a user without pending or server profile to setup', async () => {
    const result = await recoverDashboardProfile({
      onboardingCompleted: false,
      pendingProfile: {},
      loadServerProfile: async () => false,
      savePendingProfile: async () => undefined,
      onPendingProfileSaved: () => undefined,
    });

    expect(result).toEqual({ destination: 'setup', shouldCompleteOnboarding: false });
  });

  test('never overwrites a completed user with stale pending data', async () => {
    const savePendingProfile = mock(async () => undefined);

    const result = await recoverDashboardProfile({
      onboardingCompleted: true,
      pendingProfile: validPendingProfile,
      loadServerProfile: async () => true,
      savePendingProfile,
      onPendingProfileSaved: () => undefined,
    });

    expect(result).toEqual({ destination: 'dashboard', shouldCompleteOnboarding: false });
    expect(savePendingProfile).not.toHaveBeenCalled();
  });

  test('repairs a completed account whose server profile is missing', async () => {
    const savePendingProfile = mock(async () => undefined);
    const onPendingProfileSaved = mock(() => undefined);

    const result = await recoverDashboardProfile({
      onboardingCompleted: true,
      pendingProfile: validPendingProfile,
      loadServerProfile: async () => false,
      savePendingProfile,
      onPendingProfileSaved,
    });

    expect(result).toEqual({ destination: 'dashboard', shouldCompleteOnboarding: false });
    expect(savePendingProfile).toHaveBeenCalledWith(validPendingProfile);
    expect(onPendingProfileSaved).toHaveBeenCalledTimes(1);
  });

  test('sends a completed account with no server or browser profile to setup', async () => {
    const savePendingProfile = mock(async () => undefined);

    const result = await recoverDashboardProfile({
      onboardingCompleted: true,
      pendingProfile: {},
      loadServerProfile: async () => false,
      savePendingProfile,
      onPendingProfileSaved: () => undefined,
    });

    expect(result).toEqual({ destination: 'setup', shouldCompleteOnboarding: false });
    expect(savePendingProfile).not.toHaveBeenCalled();
  });

  test('does not clear pending data when saving fails', async () => {
    const onPendingProfileSaved = mock(() => undefined);

    await expect(
      recoverDashboardProfile({
        onboardingCompleted: false,
        pendingProfile: validPendingProfile,
        loadServerProfile: async () => false,
        savePendingProfile: async () => {
          throw new Error('save failed');
        },
        onPendingProfileSaved,
      }),
    ).rejects.toThrow('save failed');
    expect(onPendingProfileSaved).not.toHaveBeenCalled();
  });
});
