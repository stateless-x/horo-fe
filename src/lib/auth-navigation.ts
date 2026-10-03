export const DEFAULT_AUTHENTICATED_PATH = '/dashboard/fortune/daily';

const INTERNAL_ORIGIN = 'https://saimu.local';

/**
 * Accept only app destinations that legitimately resume after authentication.
 * Parsing against a fixed origin rejects protocol-relative/external URLs and
 * prevents `returnTo` from becoming an open redirect.
 */
export function sanitizeReturnTo(candidate?: string | null): string {
  if (!candidate || !candidate.startsWith('/') || candidate.startsWith('//')) {
    return DEFAULT_AUTHENTICATED_PATH;
  }

  try {
    const url = new URL(candidate, INTERNAL_ORIGIN);
    const isDashboard =
      url.pathname === '/dashboard' || url.pathname.startsWith('/dashboard/');
    const isInvite = url.pathname.startsWith('/invite/');

    if (url.origin !== INTERNAL_ORIGIN || (!isDashboard && !isInvite)) {
      return DEFAULT_AUTHENTICATED_PATH;
    }

    return `${url.pathname}${url.search}`;
  } catch {
    return DEFAULT_AUTHENTICATED_PATH;
  }
}

export function withReturnTo(path: string, returnTo: string): string {
  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}returnTo=${encodeURIComponent(sanitizeReturnTo(returnTo))}`;
}

export function getCurrentReturnTo(): string {
  if (typeof window === 'undefined') return DEFAULT_AUTHENTICATED_PATH;
  return sanitizeReturnTo(`${window.location.pathname}${window.location.search}`);
}

/**
 * Resolves where auth should send the visitor, letting the onboarding
 * store's intent (e.g. "เช็คดวงกับคนคุย" → /dashboard/compatibility) win only
 * when the page did not already ask for a specific destination.
 *
 * An explicit `returnTo` (a real link into a specific dashboard page, or an
 * invite) always takes priority over the store's intent — that link's whole
 * point is to resume somewhere specific after auth. The store's
 * `postAuthDestination` only applies on the default landing path, which is
 * what every onboarding entry point uses when nothing more specific was asked
 * for.
 */
export function resolvePostAuthDestination(
  returnTo: string | null | undefined,
  postAuthDestination?: string | null,
): string {
  const sanitizedReturnTo = sanitizeReturnTo(returnTo);
  if (sanitizedReturnTo !== DEFAULT_AUTHENTICATED_PATH) return sanitizedReturnTo;
  if (!postAuthDestination) return sanitizedReturnTo;
  return sanitizeReturnTo(postAuthDestination);
}
