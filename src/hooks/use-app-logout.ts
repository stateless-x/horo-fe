'use client';

import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { signOut } from '@/lib/auth-client';
import { performLogout } from '@/lib/logout';
import { clearProfileFromSessionStorage } from '@/lib/profile-utils';
import { clearSignupSource } from '@/lib/signup-source';
import { useFortuneStore } from '@/stores/fortune';
import { useOnboardingStore } from '@/stores/onboarding';
import { useUserStore } from '@/stores/user';

function clearUserScopedClientState(): void {
  clearProfileFromSessionStorage();
  clearSignupSource();

  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem('fortune-profile-updated');
      sessionStorage.removeItem('fortune_retry_count');
    } catch {
      // A blocked storage API must not prevent a successful server logout.
    }
  }

  useFortuneStore.getState().reset();
  useOnboardingStore.getState().reset();
  useUserStore.getState().logout();
}

export function useAppLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const logoutInFlight = useRef(false);

  const logout = useCallback(async (): Promise<boolean> => {
    if (logoutInFlight.current) return false;

    logoutInFlight.current = true;
    setIsLoggingOut(true);
    try {
      await performLogout({
        // `throw: true` is important: Better Auth otherwise returns an error
        // result, which can make a failed network request look successful.
        revokeSession: async () => {
          await signOut({ fetchOptions: { throw: true } });
        },
        clearClientState: () => {
          queryClient.clear();
          clearUserScopedClientState();
        },
        navigateToLogin: () => router.replace('/login'),
      });
      return true;
    } catch (error) {
      console.error('[Auth] Logout failed:', error);
      return false;
    } finally {
      logoutInFlight.current = false;
      setIsLoggingOut(false);
    }
  }, [queryClient, router]);

  return { logout, isLoggingOut };
}
