const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/** Default timeouts in milliseconds */
const TIMEOUTS = {
  GET: 15_000,    // 15s for reads
  POST: 45_000,   // 45s for LLM generation (backend retries internally)
  DELETE: 15_000,  // 15s for deletes
} as const;

function createTimeoutSignal(timeoutMs: number): { signal: AbortSignal; clear: () => void } {
  const controller = new AbortController();
  const timerId = setTimeout(() => controller.abort(), timeoutMs);
  return {
    signal: controller.signal,
    clear: () => clearTimeout(timerId),
  };
}

/**
 * An Error carrying the response fields callers branch on — the shape
 * `classifyCompatibilityFailure` and every retry path already assume. Named
 * rather than `any` so renaming a field here breaks those call sites instead of
 * silently making their checks dead.
 */
export interface ApiError extends Error {
  status?: number;
  statusText?: string;
  code?: string;
  /** Parsed JSON error body. `retryAfter`/`resetAt` come from the rate limiter. */
  body?: { code?: string; error?: string; retryAfter?: number; resetAt?: string };
}

/** The error code a server sends with a 429, wherever it ends up on the error. */
const RATE_LIMITED = 'RATE_LIMIT_EXCEEDED';

/**
 * Whether asking again could plausibly produce a different answer.
 *
 * Shared by every generation query, because the wrong answer here is expensive
 * in both directions: a reading that costs a minute of LLM time should not be
 * re-run on a failure that will repeat, and a rate-limited request must not be
 * retried at all — each attempt spends another token and pushes the reset
 * further away, so retrying is what keeps the user locked out.
 */
export function isRetriableApiError(error: unknown): boolean {
  const failure = error as ApiError | null;
  const code = failure?.body?.code ?? failure?.code;

  // The client gave up on a request the server may still have been serving.
  // Asking again just starts the same long wait over.
  if (code === 'TIMEOUT' || failure?.status === 408) return false;
  if (code === RATE_LIMITED || failure?.status === 429) return false;
  // Any other 4xx is a problem with the request, not a transient fault.
  if (typeof failure?.status === 'number' && failure.status >= 400 && failure.status < 500) {
    return false;
  }
  return true;
}

/**
 * Seconds the caller must wait before a rate-limited request can succeed, or
 * null when the error is not a rate limit. Read from the body the limiter
 * sends, falling back to the reset timestamp when `retryAfter` is absent.
 */
export function rateLimitRetryAfterSeconds(error: unknown): number | null {
  const failure = error as ApiError | null;
  const code = failure?.body?.code ?? failure?.code;
  if (code !== RATE_LIMITED && failure?.status !== 429) return null;

  if (typeof failure?.body?.retryAfter === 'number') {
    return Math.max(0, Math.ceil(failure.body.retryAfter));
  }
  if (failure?.body?.resetAt) {
    const resetMs = new Date(failure.body.resetAt).getTime() - Date.now();
    if (Number.isFinite(resetMs)) return Math.max(0, Math.ceil(resetMs / 1000));
  }
  return null;
}

function handleFetchError(error: unknown): never {
  if (error instanceof Error && error.name === 'AbortError') {
    const timeoutError = new Error('Request timed out') as ApiError;
    timeoutError.status = 408;
    timeoutError.code = 'TIMEOUT';
    throw timeoutError;
  }
  throw error;
}

async function parseErrorResponse(res: Response): Promise<never> {
  const error = new Error(`API error: ${res.statusText}`) as ApiError;
  error.status = res.status;
  error.statusText = res.statusText;

  try {
    error.body = await res.json();
  } catch {
    // Response body is not JSON
  }

  throw error;
}

/**
 * API client for calling backend
 * All requests include credentials for cookie-based auth
 * All requests have timeouts to prevent infinite hangs
 */
export const api = {
  async get<T>(path: string, options?: { timeout?: number }): Promise<T> {
    const { signal, clear } = createTimeoutSignal(options?.timeout ?? TIMEOUTS.GET);
    try {
      const res = await fetch(`${API_URL}${path}`, {
        credentials: 'include',
        signal,
      });

      if (!res.ok) {
        await parseErrorResponse(res);
      }

      return res.json();
    } catch (error) {
      return handleFetchError(error);
    } finally {
      clear();
    }
  },

  /**
   * `keepalive` hands the request to the browser to finish on its own, so it
   * survives the page unloading. Analytics fired from a link click needs it:
   * without it a CTA click races its own navigation and the event is dropped
   * on the ~10% of clicks that leave the SPA. Browsers cap in-flight keepalive
   * bodies at 64KB, so it belongs on small beacons only, never on a reading.
   */
  async post<T>(
    path: string,
    body?: unknown,
    options?: { timeout?: number; onHeaders?: (headers: Headers) => void; keepalive?: boolean },
  ): Promise<T> {
    const { signal, clear } = createTimeoutSignal(options?.timeout ?? TIMEOUTS.POST);
    try {
      const res = await fetch(`${API_URL}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: body ? JSON.stringify(body) : undefined,
        keepalive: options?.keepalive,
        signal,
      });

      options?.onHeaders?.(res.headers);

      if (!res.ok) {
        await parseErrorResponse(res);
      }

      return await res.json();
    } catch (error) {
      return handleFetchError(error);
    } finally {
      clear();
    }
  },

  async delete<T>(path: string): Promise<T> {
    const { signal, clear } = createTimeoutSignal(TIMEOUTS.DELETE);
    try {
      const res = await fetch(`${API_URL}${path}`, {
        method: 'DELETE',
        credentials: 'include',
        signal,
      });

      if (!res.ok) {
        await parseErrorResponse(res);
      }

      return res.json();
    } catch (error) {
      return handleFetchError(error);
    } finally {
      clear();
    }
  },
};
