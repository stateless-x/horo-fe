import { describe, expect, test } from 'bun:test';
import { DONATION_AUTO_DELAY_MS } from './donation-eligibility';

/**
 * The modal now auto-opens on every eligible visit: no permanent dismiss and
 * no cooldown (decision 2026-09-10). All that survives is the delay that keeps
 * it from covering a reading the moment it lands, so that is all there is to
 * assert. The cooldown/dismiss rules and their tests were removed together —
 * a test asserting rules that no longer exist is worse than no test.
 */
describe('donation auto-display delay', () => {
  test('waits long enough for the reading to be read first', () => {
    expect(DONATION_AUTO_DELAY_MS).toBe(10_000);
  });
});
