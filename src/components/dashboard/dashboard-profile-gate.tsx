'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';
import { MainLoader } from '@/components/ui/main-loader';
import { api, type ApiError } from '@/lib/api';
import { useSession, type HoroSessionUser } from '@/lib/auth-client';
import { recoverDashboardProfile } from '@/lib/dashboard-profile-recovery';
import {
  clearProfileFromSessionStorage,
  getValidProfileWithFallback,
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
  const profile = useOnboardingStore((state) => state.profile);
  const [gateState, setGateState] = useState<GateState>('checking');
  const [attempt, setAttempt] = useState(0);
  const recoveryRef = useRef<{
    key: string;
    promise: ReturnType<typeof recoverDashboardProfile>;
  } | null>(null);

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      router.replace('/login');
      return;
    }

    let active = true;
    const user = session.user as typeof session.user & HoroSessionUser;
    const recoveryKey = `${user.id}:${attempt}`;

    if (recoveryRef.current?.key !== recoveryKey) {
      const onboardingCompleted = user.onboardingCompleted === true;
      const { profileData } = getValidProfileWithFallback(profile);

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

    setGateState('checking');
    recoveryRef.current.promise
      .then((result) => {
        if (!active) return;

        if (result.destination === 'setup') {
          router.replace('/fortune?setup=true');
          return;
        }

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
        if (error.status === 401) {
          router.replace('/login');
          return;
        }
        if (error.status === 400 || error.status === 404 || error.status === 422) {
          router.replace('/fortune?setup=true');
          return;
        }

        console.error('[DashboardProfileGate] Profile recovery failed:', error);
        setGateState('error');
      });

    return () => {
      active = false;
    };
  }, [attempt, isPending, profile, router, session]);

  if (gateState !== 'ready') {
    return (
      <main className="min-h-screen bg-ground flex items-center justify-center px-6">
        {gateState === 'checking' ? (
          <MainLoader label="กำลังเตรียมข้อมูลดวงของคุณ..." />
        ) : (
          <div className="max-w-sm text-center">
            <p className="text-ink font-oracle text-lg">เตรียมข้อมูลดวงไม่สำเร็จ</p>
            <p className="mt-2 text-sm text-muted-foreground">กรุณาตรวจสอบการเชื่อมต่อแล้วลองอีกครั้ง</p>
            <button
              type="button"
              onClick={() => setAttempt((value) => value + 1)}
              className="mt-5 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
            >
              ลองอีกครั้ง
            </button>
          </div>
        )}
      </main>
    );
  }

  return (
    <>
      <AppHeader />
      {children}
    </>
  );
}
