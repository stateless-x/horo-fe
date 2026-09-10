import { describe, expect, mock, test } from 'bun:test';
import { performLogout } from './logout';

describe('performLogout', () => {
  test('clears client state and navigates only after server revocation succeeds', async () => {
    const calls: string[] = [];

    await performLogout({
      revokeSession: async () => {
        calls.push('revoke');
      },
      clearClientState: () => calls.push('clear'),
      navigateToLogin: () => calls.push('navigate'),
    });

    expect(calls).toEqual(['revoke', 'clear', 'navigate']);
  });

  test('does not pretend logout succeeded when server revocation fails', async () => {
    const clearClientState = mock(() => undefined);
    const navigateToLogin = mock(() => undefined);

    await expect(
      performLogout({
        revokeSession: async () => {
          throw new Error('network error');
        },
        clearClientState,
        navigateToLogin,
      }),
    ).rejects.toThrow('network error');

    expect(clearClientState).not.toHaveBeenCalled();
    expect(navigateToLogin).not.toHaveBeenCalled();
  });

  test('still leaves the protected page if optional client cleanup fails', async () => {
    const navigateToLogin = mock(() => undefined);

    await expect(
      performLogout({
        revokeSession: async () => undefined,
        clearClientState: () => {
          throw new Error('storage blocked');
        },
        navigateToLogin,
      }),
    ).rejects.toThrow('storage blocked');

    expect(navigateToLogin).toHaveBeenCalledTimes(1);
  });
});
