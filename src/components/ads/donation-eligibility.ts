/**
 * Pure eligibility rules for the auto-opening donation modal.
 * Kept free of DOM/storage access so they can be unit-tested.
 */

export const DONATION_DISMISSED_KEY = 'horo-donation-dismissed';
export const DONATION_LAST_AUTO_SHOWN_KEY = 'horo-donation-last-auto-shown';

/** Auto-display cooldown: at most once per seven days. */
export const DONATION_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

/** Minimum time primary content must be visible before auto-display. */
export const DONATION_AUTO_DELAY_MS = 10_000;

export function canAutoShowDonation(
  now: number,
  dismissedForever: string | null,
  lastAutoShown: string | null,
): boolean {
  if (dismissedForever === 'true') return false;
  if (lastAutoShown !== null) {
    const last = Number(lastAutoShown);
    if (Number.isFinite(last) && now - last < DONATION_COOLDOWN_MS) return false;
  }
  return true;
}
