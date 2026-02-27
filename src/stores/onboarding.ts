import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { BirthProfile } from '@/lib-packages/shared';

export type OnboardingStep =
  | 'welcome'
  | 'name'
  | 'birthDate'
  | 'gender'
  | 'birthTime'
  | 'teaser'
  | 'auth'
  | 'dashboard';

interface OnboardingState {
  currentStep: OnboardingStep;
  profile: Partial<BirthProfile>;
  teaserResult: {
    elementType?: string;
    personality?: string;
    todaySnippet?: string;
    luckyColor?: string;
    luckyNumber?: number;
  };
  expiresAt: number | null; // Timestamp when data expires

  // Actions
  setStep: (step: OnboardingStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateProfile: (data: Partial<BirthProfile>) => void;
  setTeaserResult: (result: OnboardingState['teaserResult']) => void;
  reset: () => void;
  isExpired: () => boolean;
}

const steps: OnboardingStep[] = [
  'welcome',
  'name',
  'birthDate',
  'gender',
  'birthTime',
  'teaser',
  'auth',
  'dashboard',
];

// Onboarding data expires after 15 minutes (900000ms)
const EXPIRATION_TIME = 15 * 60 * 1000;

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      currentStep: 'welcome',
      profile: {},
      teaserResult: {},
      expiresAt: null,

      setStep: (step) => {
        // Set expiration time on first step beyond welcome
        const shouldSetExpiry = step !== 'welcome' && !get().expiresAt;
        set({
          currentStep: step,
          ...(shouldSetExpiry && { expiresAt: Date.now() + EXPIRATION_TIME })
        });
      },

      nextStep: () => {
        const { currentStep } = get();
        const currentIndex = steps.indexOf(currentStep);
        if (currentIndex < steps.length - 1) {
          const nextStep = steps[currentIndex + 1];
          // Set expiration time when moving past welcome
          const shouldSetExpiry = nextStep !== 'welcome' && !get().expiresAt;
          set({
            currentStep: nextStep,
            ...(shouldSetExpiry && { expiresAt: Date.now() + EXPIRATION_TIME })
          });
        }
      },

      prevStep: () => {
        const { currentStep } = get();
        const currentIndex = steps.indexOf(currentStep);
        if (currentIndex > 0) {
          set({ currentStep: steps[currentIndex - 1] });
        }
      },

      updateProfile: (data) => {
        // Set expiration time when updating profile (user is engaged)
        const shouldSetExpiry = !get().expiresAt;
        set((state) => ({
          profile: { ...state.profile, ...data },
          ...(shouldSetExpiry && { expiresAt: Date.now() + EXPIRATION_TIME })
        }));
      },

      setTeaserResult: (result) => set({ teaserResult: result }),

      reset: () =>
        set({
          currentStep: 'welcome',
          profile: {},
          teaserResult: {},
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
        expiresAt: state.expiresAt,
      }),
    }
  )
);
