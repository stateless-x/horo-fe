import { useEffect, useCallback } from 'react';

/**
 * Session Retry Hook
 *
 * Manages retry logic with exponential backoff for session validation failures.
 * Uses sessionStorage to persist retry count across OAuth redirects.
 *
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @param storageKey - Key for sessionStorage (default: 'fortune_retry_count')
 */
export function useSessionRetry(
  maxRetries: number = 3,
  storageKey: string = 'fortune_retry_count'
) {
  const getRetryCount = useCallback(() => {
    if (typeof window === 'undefined') return 0;
    const stored = sessionStorage.getItem(storageKey);
    return stored ? parseInt(stored, 10) : 0;
  }, [storageKey]);

  const incrementRetryCount = useCallback(() => {
    if (typeof window === 'undefined') return 0;
    const current = getRetryCount();
    const next = current + 1;
    sessionStorage.setItem(storageKey, next.toString());
    return next;
  }, [storageKey, getRetryCount]);

  const resetRetryCount = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  const isMaxRetriesReached = useCallback(() => {
    return getRetryCount() >= maxRetries;
  }, [getRetryCount, maxRetries]);

  /**
   * Calculate exponential backoff delay
   * @param retryCount - Current retry attempt number
   * @returns Delay in milliseconds (1s, 2s, 4s, etc.)
   */
  const getBackoffDelay = useCallback((retryCount: number) => {
    return Math.pow(2, retryCount - 1) * 1000;
  }, []);

  return {
    getRetryCount,
    incrementRetryCount,
    resetRetryCount,
    isMaxRetriesReached,
    getBackoffDelay,
    maxRetries,
  };
}
