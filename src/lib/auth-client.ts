import { createAuthClient } from 'better-auth/react';

/**
 * Better Auth Client for Frontend
 *
 * Provides React hooks for authentication:
 * - useSession() - Get current session
 * - signIn.social() - Sign in with OAuth
 * - signOut() - Sign out
 */
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const appUrl = process.env.BETTER_AUTH_URL || 'http://localhost:3000';

// Debug: Log the URLs being used (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('[Auth Client] Using API URL:', apiUrl);
  console.log('[Auth Client] Using App URL:', appUrl);
}

export const authClient = createAuthClient({
  baseURL: apiUrl,
  // Enable credentials for cross-origin requests
  fetchOptions: {
    credentials: 'include',
  },
});

// Export hooks for easy use
export const { useSession, signIn, signOut } = authClient;

/**
 * Get full callback URL for OAuth redirects
 * This ensures users are redirected back to the frontend (not the API)
 */
export function getCallbackUrl(path: string): string {
  // If running in browser, use window.location.origin for better reliability
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${path}`;
  }
  // Fallback to env variable for SSR
  return `${appUrl}${path}`;
}

