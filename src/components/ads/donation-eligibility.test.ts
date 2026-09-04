import { describe, expect, test } from 'bun:test';
import { canAutoShowDonation, DONATION_COOLDOWN_MS } from './donation-eligibility';

const NOW = 1_800_000_000_000;

describe('canAutoShowDonation', () => {
  test('permanent dismiss always wins', () => {
    expect(canAutoShowDonation(NOW, 'true', null)).toBe(false);
    expect(canAutoShowDonation(NOW, 'true', String(NOW - DONATION_COOLDOWN_MS * 2))).toBe(false);
  });

  test('blocks within the seven-day cooldown', () => {
    expect(canAutoShowDonation(NOW, null, String(NOW - 1000))).toBe(false);
    expect(canAutoShowDonation(NOW, null, String(NOW - DONATION_COOLDOWN_MS + 1))).toBe(false);
  });

  test('allows after the cooldown has passed', () => {
    expect(canAutoShowDonation(NOW, null, String(NOW - DONATION_COOLDOWN_MS - 1))).toBe(true);
  });

  test('allows when never shown before', () => {
    expect(canAutoShowDonation(NOW, null, null)).toBe(true);
  });

  test('treats an unparseable timestamp as never shown', () => {
    expect(canAutoShowDonation(NOW, null, 'garbage')).toBe(true);
  });
});
