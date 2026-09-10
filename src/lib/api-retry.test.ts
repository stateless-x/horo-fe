import { describe, expect, test } from 'bun:test';
import { isRetriableApiError, rateLimitRetryAfterSeconds } from './api';

/**
 * Retrying the wrong failure is expensive here in both directions: a reading
 * costs ~a minute of LLM time, and a rate-limited request that is retried
 * spends another token and pushes its own reset further out — so a retry is
 * what keeps the user locked out. These pin which failures may be repeated.
 */

/** The shape lib/api.ts attaches to a failed request. */
const apiError = (init: {
  status?: number;
  code?: string;
  body?: { code?: string; retryAfter?: number; resetAt?: string };
}) => Object.assign(new Error('failed'), init);

describe('isRetriableApiError', () => {
  test('a timeout is not retried', () => {
    // The client gave up on a request the server may still have been serving;
    // asking again restarts the same long wait.
    expect(isRetriableApiError(apiError({ status: 408, code: 'TIMEOUT' }))).toBe(false);
  });

  test('a rate limit is not retried, however the code arrives', () => {
    expect(isRetriableApiError(apiError({ status: 429 }))).toBe(false);
    expect(
      isRetriableApiError(apiError({ status: 429, body: { code: 'RATE_LIMIT_EXCEEDED' } })),
    ).toBe(false);
    // Some callers surface the server code at the top level.
    expect(isRetriableApiError(apiError({ code: 'RATE_LIMIT_EXCEEDED' }))).toBe(false);
  });

  test('other client errors are not retried', () => {
    for (const status of [400, 401, 403, 404, 422]) {
      expect(isRetriableApiError(apiError({ status }))).toBe(false);
    }
  });

  test('server errors and transport faults are retried', () => {
    expect(isRetriableApiError(apiError({ status: 500 }))).toBe(true);
    expect(isRetriableApiError(apiError({ status: 502 }))).toBe(true);
    // A bare network failure carries no status at all.
    expect(isRetriableApiError(new TypeError('Failed to fetch'))).toBe(true);
  });
});

describe('rateLimitRetryAfterSeconds', () => {
  test('reads retryAfter from the limiter body', () => {
    expect(
      rateLimitRetryAfterSeconds(
        apiError({ status: 429, body: { code: 'RATE_LIMIT_EXCEEDED', retryAfter: 90 } }),
      ),
    ).toBe(90);
  });

  test('falls back to resetAt when retryAfter is absent', () => {
    const resetAt = new Date(Date.now() + 60_000).toISOString();
    const seconds = rateLimitRetryAfterSeconds(
      apiError({ status: 429, body: { code: 'RATE_LIMIT_EXCEEDED', resetAt } }),
    );
    expect(seconds).toBeGreaterThan(55);
    expect(seconds).toBeLessThanOrEqual(60);
  });

  test('never reports a negative wait for an already-passed reset', () => {
    const resetAt = new Date(Date.now() - 10_000).toISOString();
    expect(
      rateLimitRetryAfterSeconds(apiError({ status: 429, body: { resetAt, code: 'RATE_LIMIT_EXCEEDED' } })),
    ).toBe(0);
  });

  test('returns null for anything that is not a rate limit', () => {
    expect(rateLimitRetryAfterSeconds(apiError({ status: 500 }))).toBeNull();
    expect(rateLimitRetryAfterSeconds(apiError({ status: 408, code: 'TIMEOUT' }))).toBeNull();
    expect(rateLimitRetryAfterSeconds(null)).toBeNull();
  });
});
