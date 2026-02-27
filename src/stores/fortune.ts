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

  // Share functionality
  shareStatus: ShareStatus;

  // Narrative streaming
  narrativeChunks: string[];

  // Actions
  setLoadingState: (state: LoadingState) => void;
  setError: (error: string | null) => void;
  setHasAttemptedGeneration: (attempted: boolean) => void;
  setShareStatus: (status: ShareStatus) => void;
  addNarrativeChunk: (chunk: string) => void;
  resetNarrativeChunks: () => void;
  reset: () => void;
}

export const useFortuneStore = create<FortuneState>((set) => ({
  // Initial state
  loadingState: 'initializing',
  error: null,
  hasAttemptedGeneration: false,
  shareStatus: 'idle',
  narrativeChunks: [],

  // Actions
  setLoadingState: (state) => set({ loadingState: state }),
  setError: (error) => set({ error }),
  setHasAttemptedGeneration: (attempted) => set({ hasAttemptedGeneration: attempted }),
  setShareStatus: (status) => set({ shareStatus: status }),
  addNarrativeChunk: (chunk) => set((state) => ({ narrativeChunks: [...state.narrativeChunks, chunk] })),
  resetNarrativeChunks: () => set({ narrativeChunks: [] }),
  reset: () =>
    set({
      loadingState: 'initializing',
      error: null,
      hasAttemptedGeneration: false,
      shareStatus: 'idle',
      narrativeChunks: [],
    }),
}));
