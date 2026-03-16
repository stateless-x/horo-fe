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

function handleFetchError(error: any): never {
  if (error.name === 'AbortError') {
    const timeoutError: any = new Error('Request timed out');
    timeoutError.status = 408;
    timeoutError.code = 'TIMEOUT';
    throw timeoutError;
  }
  throw error;
}

async function parseErrorResponse(res: Response): Promise<never> {
  const error: any = new Error(`API error: ${res.statusText}`);
  error.status = res.status;
  error.statusText = res.statusText;

  try {
    const body = await res.json();
    error.body = body;
  } catch (e) {
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
    } catch (error: any) {
      return handleFetchError(error);
    } finally {
      clear();
    }
  },

  async post<T>(path: string, body?: unknown): Promise<T> {
    const { signal, clear } = createTimeoutSignal(TIMEOUTS.POST);
    try {
      const res = await fetch(`${API_URL}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: body ? JSON.stringify(body) : undefined,
        signal,
      });

      if (!res.ok) {
        await parseErrorResponse(res);
      }

      return res.json();
    } catch (error: any) {
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
    } catch (error: any) {
      return handleFetchError(error);
    } finally {
      clear();
    }
  },
};
