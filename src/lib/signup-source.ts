/**
 * Signup Source Attribution
 *
 * Records where a visitor arrived from on their FIRST page load, because the
 * Google/X OAuth redirect destroys both the query string and the referrer.
 * Mirrors the sessionStorage handoff used for pending profiles (profile-utils.ts):
 * capture before auth, replay when the profile is saved after auth.
 *
 * Privacy: hostname only — never a full referring URL, path, or query string.
 */

const SIGNUP_SOURCE_KEY = 'horo-signup-source';

/** Known referrer hostnames mapped to short, stable channel names */
const HOST_MAP: Record<string, string> = {
  't.co': 'x',
  'x.com': 'x',
  'twitter.com': 'x',
  'facebook.com': 'facebook',
  'm.facebook.com': 'facebook',
  'l.facebook.com': 'facebook',
  'instagram.com': 'instagram',
  'tiktok.com': 'tiktok',
  'lin.ee': 'line',
  'line.me': 'line',
};

function normalize(value: string): string {
  return value.trim().toLowerCase().slice(0, 64);
}

/**
 * Derive the source from the current URL and referrer.
 * utm_source wins; otherwise the referrer hostname; otherwise 'direct'.
 */
function deriveSource(): string {
  const utmSource = new URLSearchParams(window.location.search).get('utm_source');
  if (utmSource) return normalize(utmSource);

  if (!document.referrer) return 'direct';

  let host: string;
  try {
    host = new URL(document.referrer).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return 'direct';
  }

  // A new tab opened from our own site is not a new acquisition
  if (host === window.location.hostname.replace(/^www\./, '')) return 'direct';

  if (HOST_MAP[host]) return HOST_MAP[host];
  if (host.startsWith('google.')) return 'google';
  return normalize(host);
}

/**
 * Capture the signup source once per session (first touch wins).
 * Safe to call on every load; silently does nothing if storage is unavailable.
 */
export function captureSignupSource(): void {
  if (typeof window === 'undefined') return;

  try {
    if (sessionStorage.getItem(SIGNUP_SOURCE_KEY)) return;
    sessionStorage.setItem(SIGNUP_SOURCE_KEY, deriveSource());
  } catch {
    // Private mode / storage disabled — attribution is best-effort
  }
}

export function getSignupSource(): string | undefined {
  if (typeof window === 'undefined') return undefined;

  try {
    return sessionStorage.getItem(SIGNUP_SOURCE_KEY) || undefined;
  } catch {
    return undefined;
  }
}

export function clearSignupSource(): void {
  if (typeof window === 'undefined') return;

  try {
    sessionStorage.removeItem(SIGNUP_SOURCE_KEY);
  } catch {
    // Ignore
  }
}
