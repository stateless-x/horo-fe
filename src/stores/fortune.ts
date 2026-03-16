import { create } from 'zustand';

/**
 * Fortune Store
 *
 * Manages fortune reading state and UI interactions.
 * Keeps state separate from data fetching logic.
 */

export type LoadingState = 'initializing' | 'saving-profile' | 'generating-chart' | 'generating-narrative' | 'complete';
export type ShareStatus = 'idle' | 'copying' | 'copied';

interface FortuneState {
  // Loading and error states
  loadingState: LoadingState;
  error: string | null;
  hasAttemptedGeneration: boolean;

  // Rate limit info (ISO string of when rate limit resets)
  rateLimitResetAt: string | null;

  // Share functionality
  shareStatus: ShareStatus;

  // Actions
  setLoadingState: (state: LoadingState) => void;
  setError: (error: string | null) => void;
  setHasAttemptedGeneration: (attempted: boolean) => void;
  setRateLimitResetAt: (resetAt: string | null) => void;
  setShareStatus: (status: ShareStatus) => void;
  reset: () => void;
}

export const useFortuneStore = create<FortuneState>((set) => ({
  // Initial state
  loadingState: 'initializing',
  error: null,
  hasAttemptedGeneration: false,
  rateLimitResetAt: null,
  shareStatus: 'idle',

  // Actions
  setLoadingState: (state) => set({ loadingState: state }),
  setError: (error) => set({ error }),
  setHasAttemptedGeneration: (attempted) => set({ hasAttemptedGeneration: attempted }),
  setRateLimitResetAt: (resetAt) => set({ rateLimitResetAt: resetAt }),
  setShareStatus: (status) => set({ shareStatus: status }),
  reset: () =>
    set({
      loadingState: 'initializing',
      error: null,
      hasAttemptedGeneration: false,
      rateLimitResetAt: null,
      shareStatus: 'idle',
    }),
}));
