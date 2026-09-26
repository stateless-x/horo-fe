import { ONBOARDING_FUNNEL_STEPS, type OnboardingFunnelStep } from '@/lib-packages/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/** sessionStorage key prefix for "this step already fired this session". */
const STORAGE_PREFIX = 'horo-funnel:';

// Backstop for when sessionStorage throws (private mode, storage disabled) or
// is unavailable: still de-dupes within this page's lifetime.
const sentThisSession = new Set<OnboardingFunnelStep>();

/**
 * Reports one anonymous onboarding funnel step. No auth, no PII — just which
 * step of the flow a browser reached, so the drop-off between steps is
 * visible without waiting for a signup to attach events to.
 *
 * Deduped to at most once per step per browser session: marked as sent BEFORE
 * the request goes out (not after it resolves), so a StrictMode double-effect
 * or a fast remount can never fire the same step twice while the first
 * request is still in flight.
 *
 * Fire-and-forget and never throws into the caller — a beacon failure must
 * never block or crash an onboarding step.
 */
export function trackOnboardingStep(step: OnboardingFunnelStep): void {
  if (!ONBOARDING_FUNNEL_STEPS.includes(step)) return;
  if (sentThisSession.has(step)) return;

  const key = `${STORAGE_PREFIX}${step}`;
  try {
    if (sessionStorage.getItem(key)) {
      sentThisSession.add(step);
      return;
    }
    sessionStorage.setItem(key, '1');
  } catch {
    // Private mode / storage disabled — fall through to the in-memory guard.
  }
  sentThisSession.add(step);

  try {
    fetch(`${API_URL}/api/analytics/onboarding-step`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step }),
      // Hands the request to the browser so it survives the page navigating
      // away right after (e.g. an auth button starting an OAuth redirect).
      keepalive: true,
    }).catch((error) => {
      console.warn('[OnboardingFunnel] Failed to record step:', error);
    });
  } catch (error) {
    console.warn('[OnboardingFunnel] Failed to record step:', error);
  }
}
