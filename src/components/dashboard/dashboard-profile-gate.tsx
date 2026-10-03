'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { AppHeader } from '@/components/layout/app-header';
import { MainLoader } from '@/components/ui/main-loader';
import { Button } from '@/lib-packages/ui';
import { api, type ApiError } from '@/lib/api';
import { useSession, type HoroSessionUser } from '@/lib/auth-client';
import { getCurrentReturnTo, withReturnTo } from '@/lib/auth-navigation';
import { dashboardProfileRecoveryKey, profileRecoveryFailureAction, recoverDashboardProfile } from '@/lib/dashboard-profile-recovery';
import { useAppLogout } from '@/hooks/use-app-logout';
import {
  clearProfileFromSessionStorage,
  getIncompleteProfileStep,
  getProfileFromSessionStorage,
} from '@/lib/profile-utils';
import { clearSignupSource, getSignupSource } from '@/lib/signup-source';
import { useOnboardingStore } from '@/stores/onboarding';

interface ProfileLookupResponse {
  profile: unknown | null;
}

type GateState = 'checking' | 'ready' | 'error';

export function DashboardProfileGate({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { logout, isLoggingOut } = useAppLogout();
  const [gateState, setGateState] = useState<GateState>('checking');
  const [readyUserId, setReadyUserId] = useState<string | null>(null);
  const [accountMissing, setAccountMissing] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const recoveryRef = useRef<{
    key: string;
    promise: ReturnType<typeof recoverDashboardProfile>;
  } | null>(null);
  const previousUserId = useRef<string | null>(null);

  useEffect(() => {
    if (isPending) return;

    const returnTo = getCurrentReturnTo();

    if (!session?.user) {
      router.replace(withReturnTo('/login', returnTo));
      return;
    }

    let active = true;
    const user = session.user as typeof session.user & HoroSessionUser;
    if (previousUserId.current !== null && previousUserId.current !== user.id) {
      queryClient.clear();
    }
    previousUserId.current = user.id;
    const authProvider = user.authProvider ?? null;
    const onboardingCompleted = user.onboardingCompleted === true;
    const recoveryKey = dashboardProfileRecoveryKey({
      userId: user.id,
      authProvider,
      onboardingCompleted,
      attempt,
    });
    // OAuth drafts are claimed by the returned user and provider. Never read
    // the global Zustand draft here: it may belong to another signed-in user
    // on the same browser.
    const profileData = getProfileFromSessionStorage(
      user.id,
      authProvider,
    ) ?? {};

    if (recoveryRef.current?.key !== recoveryKey) {
      recoveryRef.current = {
        key: recoveryKey,
        promise: recoverDashboardProfile({
          onboardingCompleted,
          pendingProfile: profileData,
          loadServerProfile: async () => {
            const response = await api.get<ProfileLookupResponse>('/api/fortune/user-profile');
            return response.profile !== null;
          },
          savePendingProfile: async (pendingProfile) => {
            const signupSource = getSignupSource();
            await api.post('/api/fortune/profile', {
              ...pendingProfile,
              ...(signupSource && { signupSource }),
            });
          },
          onPendingProfileSaved: () => {
            clearProfileFromSessionStorage();
            clearSignupSource();
            useOnboardingStore.getState().reset();
          },
        }),
      };
    }

    setAccountMissing(false);
    setGateState('checking');
    recoveryRef.current.promise
      .then((result) => {
        if (!active) return;

        if (result.destination === 'setup') {
          const onboarding = useOnboardingStore.getState();
          onboarding.reset();

          if (Object.keys(profileData).length > 0) {
            // Rehydrate only this account's claimed partial draft, then resume
            // at its first missing required field.
            onboarding.updateProfile(profileData);
            onboarding.setStep(getIncompleteProfileStep(profileData) ?? 'name');
          }
          router.replace(withReturnTo('/fortune?setup=true', returnTo));
          return;
        }

        setReadyUserId(user.id);
        setGateState('ready');
        if (result.shouldCompleteOnboarding) {
          void api.post('/api/onboarding/complete', {}).catch((error) => {
            console.warn('[DashboardProfileGate] Could not update onboarding flag:', error);
          });
        }
      })
      .catch((raw) => {
        if (!active) return;

        const error = raw as ApiError;
        const action = profileRecoveryFailureAction(error.status);
        if (action === 'login') {
          router.replace(withReturnTo('/login', returnTo));
          return;
        }
        if (action === 'setup') {
          router.replace(withReturnTo('/fortune?setup=true', returnTo));
          return;
        }

        console.error('[DashboardProfileGate] Profile recovery failed:', error);
        setReadyUserId(null);
        setAccountMissing(error.status === 404);
        setGateState('error');
      });

    return () => {
      active = false;
    };
  }, [attempt, isPending, queryClient, router, session]);

  const currentUserId = session?.user.id ?? null;
  if (gateState !== 'ready' || readyUserId !== currentUserId) {
    return (
      <main className="min-h-screen bg-ground flex items-center justify-center px-6">
        {gateState === 'checking' ? (
          <MainLoader label="กำลังเตรียมข้อมูลดวงของคุณ..." />
        ) : (
          <div className="max-w-sm text-center">
            <p className="text-ink font-oracle text-lg">เตรียมข้อมูลดวงไม่สำเร็จ</p>
            <p className="mt-2 text-sm text-inkMuted">
              {accountMissing ? 'ไม่พบบัญชีที่เชื่อมอยู่ กรุณาเข้าสู่ระบบใหม่' : 'กรุณาตรวจสอบการเชื่อมต่อแล้วลองอีกครั้ง'}
            </p>
            <Button
              type="button"
              onClick={() => accountMissing ? void logout() : setAttempt((value) => value + 1)}
              disabled={isLoggingOut}
              aria-busy={isLoggingOut}
              className="mt-5 min-h-11 font-heading"
            >
              {accountMissing ? (isLoggingOut ? 'กำลังออกจากระบบ' : 'เข้าสู่ระบบใหม่') : 'ลองอีกครั้ง'}
            </Button>
          </div>
        )}
      </main>
    );
  }

  return (
    <>
      <Link
        href="#dashboard-main"
        className="fixed left-4 top-2 z-[60] inline-flex min-h-11 -translate-y-20 items-center rounded-md bg-accent px-4 py-2 font-heading text-sm font-semibold text-accentInk shadow-md transition-transform focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-accentBright focus:ring-offset-2 motion-reduce:transition-none"
      >
        ข้ามไปเนื้อหาหลัก
      </Link>
      <AppHeader />
      <main id="dashboard-main" tabIndex={-1} className="focus:outline-none">
        {children}
      </main>
    </>
  );
}
