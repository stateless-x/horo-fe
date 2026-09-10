import { describe, expect, test } from 'bun:test';
import { SHOPEE_AFFILIATE_LINKS, selectShopeeAffiliateLink } from './shopee-affiliate';

describe('Shopee affiliate link catalog', () => {
  test('contains the 77 unique trackable links from the batch export', () => {
    expect(SHOPEE_AFFILIATE_LINKS).toHaveLength(77);
    expect(new Set(SHOPEE_AFFILIATE_LINKS.map((link) => link.id)).size).toBe(77);
    for (const link of SHOPEE_AFFILIATE_LINKS) {
      expect(link.url).toBe(`https://s.shopee.co.th/${link.id}`);
    }
  });

  test('selects across the active catalog and drops expired offers', () => {
    expect(selectShopeeAffiliateLink('2026-09-10', () => 0)).toBe(SHOPEE_AFFILIATE_LINKS[0]);
    expect(selectShopeeAffiliateLink('2026-09-10', () => 0.999999)).toBe(
      SHOPEE_AFFILIATE_LINKS[SHOPEE_AFFILIATE_LINKS.length - 1],
    );

    const expiredIds = new Set(['70K1X6yGLl', '40gPxb9gRy', '3B7Iy4Cr8v', '70K1X6yGMm', '7AdRjPxd1p']);
    const selectedAfterAllExpiries = Array.from({ length: 72 }, (_, index) =>
      selectShopeeAffiliateLink('2026-10-16', () => index / 72),
    );
    expect(selectedAfterAllExpiries.every((link) => !expiredIds.has(link.id))).toBe(true);
  });
});
