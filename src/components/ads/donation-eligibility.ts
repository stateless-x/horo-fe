/**
 * Pure eligibility rules for the auto-opening donation modal.
 * Kept free of DOM/storage access so they can be unit-tested.
 */

/** Minimum time primary content must be visible before auto-display. */
export const DONATION_AUTO_DELAY_MS = 10_000;
