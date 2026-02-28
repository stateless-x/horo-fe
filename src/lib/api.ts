const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * API client for calling backend
 * All requests include credentials for cookie-based auth
 */
export const api = {
  async get<T>(path: string): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, {
      credentials: 'include',
    });

    if (!res.ok) {
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

    return res.json();
  },

  async post<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
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

    return res.json();
  },

  async delete<T>(path: string): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!res.ok) {
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

    return res.json();
  },
};
