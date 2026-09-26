import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { BirthProfile } from '@/lib-packages/shared';
import type { TeaserResult } from '@/lib/teaser-result';

export type OnboardingStep =
  | 'welcome'
  | 'returning'
  | 'name'
  | 'birthDate'
  | 'gender'
  | 'birthTime'
  | 'mbti'
  | 'teaser'
  | 'auth'
  | 'dashboard';

interface OnboardingState {
  currentStep: OnboardingStep;
  profile: Partial<BirthProfile>;
  teaserResult: Partial<TeaserResult>;
  /**
   * Where auth should land the visitor instead of the default dashboard page,
   * set by a teaser CTA other than the primary one (e.g. "เช็คดวงกับคนคุย" →
   * /dashboard/compatibility). Only takes effect when the page's own returnTo
   * is still the default — see resolvePostAuthDestination in auth-navigation.
   */
  postAuthDestination: string | null;
  expiresAt: number | null; // Timestamp when data expires
  lastStepChangeAt: number; // Timestamp of the last nextStep/prevStep call, for the transition guard

  // Actions
  setStep: (step: OnboardingStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateProfile: (data: Partial<BirthProfile>) => void;
  setTeaserResult: (result: OnboardingState['teaserResult']) => void;
  setPostAuthDestination: (destination: string | null) => void;
  reset: () => void;
  isExpired: () => boolean;
}

const steps: OnboardingStep[] = [
  'welcome',
  'returning',
  'name',
  'birthDate',
  'gender',
  'birthTime',
  'mbti',
  'teaser',
  'auth',
  'dashboard',
];

// Onboarding data expires after 15 minutes (900000ms)
const EXPIRATION_TIME = 15 * 60 * 1000;

// Minimum time between step transitions, to ignore a double-click on the
// nextStep/prevStep button while the exit animation is still playing
// (AnimatePresence mode="wait" keeps the exiting step mounted and clickable).
// Longest exit animation among steps is 0.5s (step-returning.tsx), so 500ms covers all.
const TRANSITION_GUARD_MS = 500;

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      currentStep: 'welcome',
      profile: {},
      teaserResult: {},
      postAuthDestination: null,
      expiresAt: null,
      lastStepChangeAt: 0,

      setStep: (step) => {
        // Set expiration time on first step beyond welcome
        const shouldSetExpiry = step !== 'welcome' && !get().expiresAt;
        set({
          currentStep: step,
          ...(shouldSetExpiry && { expiresAt: Date.now() + EXPIRATION_TIME })
        });
      },

      nextStep: () => {
        const { currentStep, lastStepChangeAt } = get();
        // Ignore double-clicks while the previous step's exit animation is still playing
        if (Date.now() - lastStepChangeAt < TRANSITION_GUARD_MS) return;

        const currentIndex = steps.indexOf(currentStep);
        if (currentIndex < steps.length - 1) {
          const nextStep = steps[currentIndex + 1];
          // Set expiration time when moving past welcome
          const shouldSetExpiry = nextStep !== 'welcome' && !get().expiresAt;
          set({
            currentStep: nextStep,
            lastStepChangeAt: Date.now(),
            ...(shouldSetExpiry && { expiresAt: Date.now() + EXPIRATION_TIME })
          });
        }
      },

      prevStep: () => {
        const { currentStep, lastStepChangeAt } = get();
        // Ignore double-clicks while the previous step's exit animation is still playing
        if (Date.now() - lastStepChangeAt < TRANSITION_GUARD_MS) return;

        const currentIndex = steps.indexOf(currentStep);
        if (currentIndex > 0) {
          set({ currentStep: steps[currentIndex - 1], lastStepChangeAt: Date.now() });
        }
      },

      updateProfile: (data) => {
        // Set expiration time when updating profile (user is engaged)
        const shouldSetExpiry = !get().expiresAt;
        set((state) => ({
          profile: { ...state.profile, ...data },
          // Any profile edit can change the teaser prompt. Clear the old result
          // so returning through the flow never shows a reading for stale data.
          teaserResult: {},
          ...(shouldSetExpiry && { expiresAt: Date.now() + EXPIRATION_TIME })
        }));
      },

      setTeaserResult: (result) => set({ teaserResult: result }),

      setPostAuthDestination: (destination) => set({ postAuthDestination: destination }),

      reset: () =>
        set({
          currentStep: 'welcome',
          profile: {},
          teaserResult: {},
          postAuthDestination: null,
          expiresAt: null,
        }),

      isExpired: () => {
        const { expiresAt } = get();
        if (!expiresAt) return false;
        return Date.now() > expiresAt;
      },
    }),
    {
      name: 'horo-onboarding-storage', // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist certain fields, not functions
      partialize: (state) => ({
        currentStep: state.currentStep,
        profile: state.profile,
        teaserResult: state.teaserResult,
        postAuthDestination: state.postAuthDestination,
        expiresAt: state.expiresAt,
      }),
    }
  )
);
