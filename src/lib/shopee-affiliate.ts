import {
  getTodayBangkokString,
  type AffiliatePlacement,
  type TrackedEvent,
} from '@/lib-packages/shared';

export interface ShopeeAffiliateLink {
  /** Stable short-link token, stored in analytics instead of the full URL. */
  id: string;
  url: `https://s.shopee.co.th/${string}`;
  /** Last commission-eligible Bangkok date. Missing means the export says no limit. */
  expiresOn?: string;
}

/**
 * Source: BatchShopLinks20260910191418-f0595b4079f14f718378782422f89fda.csv
 * Exported 2026-09-10. All 77 offers had already started on the export date.
 * Replace this one catalog when importing a newer Shopee batch.
 */
export const SHOPEE_AFFILIATE_LINKS: readonly ShopeeAffiliateLink[] = [
  { id: '3g3ZYzAx6v', url: 'https://s.shopee.co.th/3g3ZYzAx6v' },
  { id: '3Vk9MgBaRu', url: 'https://s.shopee.co.th/3Vk9MgBaRu' },
  { id: '3LQjANCDmt', url: 'https://s.shopee.co.th/3LQjANCDmt' },
  { id: '3B7Iy4Cr7s', url: 'https://s.shopee.co.th/3B7Iy4Cr7s' },
  { id: '30nsllDUSr', url: 'https://s.shopee.co.th/30nsllDUSr' },
  { id: '2qUSZSE7nq', url: 'https://s.shopee.co.th/2qUSZSE7nq' },
  { id: '2gB2N9El8p', url: 'https://s.shopee.co.th/2gB2N9El8p' },
  { id: '7pt8Wdv5eq', url: 'https://s.shopee.co.th/7pt8Wdv5eq' },
  { id: '7fZiKKvizp', url: 'https://s.shopee.co.th/7fZiKKvizp' },
  { id: '7VGI81wMKo', url: 'https://s.shopee.co.th/7VGI81wMKo' },
  { id: '7Kwrviwzfn', url: 'https://s.shopee.co.th/7Kwrviwzfn' },
  { id: '7AdRjPxd0m', url: 'https://s.shopee.co.th/7AdRjPxd0m' },
  { id: '70K1X6yGLl', url: 'https://s.shopee.co.th/70K1X6yGLl', expiresOn: '2026-09-30' },
  { id: '6q0bKnytgk', url: 'https://s.shopee.co.th/6q0bKnytgk' },
  { id: '6fhB8UzX1j', url: 'https://s.shopee.co.th/6fhB8UzX1j' },
  { id: '6VNkwC0AMi', url: 'https://s.shopee.co.th/6VNkwC0AMi' },
  { id: '6L4Kjt0nhh', url: 'https://s.shopee.co.th/6L4Kjt0nhh' },
  { id: '6AkuXa1R2g', url: 'https://s.shopee.co.th/6AkuXa1R2g' },
  { id: '60RULH24Nf', url: 'https://s.shopee.co.th/60RULH24Nf' },
  { id: '5q848y2hie', url: 'https://s.shopee.co.th/5q848y2hie' },
  { id: '5fodwf3L3d', url: 'https://s.shopee.co.th/5fodwf3L3d' },
  { id: '5VVDkM3yOc', url: 'https://s.shopee.co.th/5VVDkM3yOc' },
  { id: '5LBnY34bjb', url: 'https://s.shopee.co.th/5LBnY34bjb' },
  { id: 'AUtthXkwFc', url: 'https://s.shopee.co.th/AUtthXkwFc' },
  { id: 'AKaTVElZab', url: 'https://s.shopee.co.th/AKaTVElZab' },
  { id: 'AAH3IvmCva', url: 'https://s.shopee.co.th/AAH3IvmCva' },
  { id: '9zxd6cmqGZ', url: 'https://s.shopee.co.th/9zxd6cmqGZ' },
  { id: '9peCuJnTbY', url: 'https://s.shopee.co.th/9peCuJnTbY' },
  { id: '9fKmi0o6wX', url: 'https://s.shopee.co.th/9fKmi0o6wX' },
  { id: '9V1MVhokHW', url: 'https://s.shopee.co.th/9V1MVhokHW' },
  { id: '9KhwJOpNcV', url: 'https://s.shopee.co.th/9KhwJOpNcV' },
  { id: '9AOW75q0xU', url: 'https://s.shopee.co.th/9AOW75q0xU' },
  { id: '9055umqeIT', url: 'https://s.shopee.co.th/9055umqeIT' },
  { id: '8plfiTrHdS', url: 'https://s.shopee.co.th/8plfiTrHdS' },
  { id: '8fSFWAruyR', url: 'https://s.shopee.co.th/8fSFWAruyR' },
  { id: '8V8pJrsYJQ', url: 'https://s.shopee.co.th/8V8pJrsYJQ' },
  { id: '8KpP7YtBeP', url: 'https://s.shopee.co.th/8KpP7YtBeP' },
  { id: '8AVyvFtozO', url: 'https://s.shopee.co.th/8AVyvFtozO' },
  { id: '80CYiwuSKN', url: 'https://s.shopee.co.th/80CYiwuSKN' },
  { id: '2LYByXG1pI', url: 'https://s.shopee.co.th/2LYByXG1pI' },
  { id: '2VrcAqFOUL', url: 'https://s.shopee.co.th/2VrcAqFOUL' },
  { id: '20vLZvHIVG', url: 'https://s.shopee.co.th/20vLZvHIVG' },
  { id: '2BElmEGfAJ', url: 'https://s.shopee.co.th/2BElmEGfAJ' },
  { id: '1gIVBJIZBE', url: 'https://s.shopee.co.th/1gIVBJIZBE' },
  { id: '1qbvNcHvqH', url: 'https://s.shopee.co.th/1qbvNcHvqH' },
  { id: '1LfemhJprC', url: 'https://s.shopee.co.th/1LfemhJprC' },
  { id: '1Vz4z0JCWF', url: 'https://s.shopee.co.th/1Vz4z0JCWF' },
  { id: '112oO5L6XA', url: 'https://s.shopee.co.th/112oO5L6XA' },
  { id: '1BMEaOKTCD', url: 'https://s.shopee.co.th/1BMEaOKTCD' },
  { id: 'gPxzTMND8', url: 'https://s.shopee.co.th/gPxzTMND8' },
  { id: 'qjOBmLjsB', url: 'https://s.shopee.co.th/qjOBmLjsB' },
  { id: 'Ln7arNdt6', url: 'https://s.shopee.co.th/Ln7arNdt6' },
  { id: 'W6XnAN0Y9', url: 'https://s.shopee.co.th/W6XnAN0Y9' },
  { id: '1AHCFOuZ4', url: 'https://s.shopee.co.th/1AHCFOuZ4' },
  { id: 'BThOYOHE7', url: 'https://s.shopee.co.th/BThOYOHE7' },
  { id: '50Yx9R5sQ4', url: 'https://s.shopee.co.th/50Yx9R5sQ4' },
  { id: '5AsNLk5F57', url: 'https://s.shopee.co.th/5AsNLk5F57' },
  { id: '4fw6kp7962', url: 'https://s.shopee.co.th/4fw6kp7962' },
  { id: '4qFWx86Vl5', url: 'https://s.shopee.co.th/4qFWx86Vl5' },
  { id: '4LJGMD8Pm0', url: 'https://s.shopee.co.th/4LJGMD8Pm0' },
  { id: '4VcgYW7mR3', url: 'https://s.shopee.co.th/4VcgYW7mR3' },
  { id: '40gPxb9gRy', url: 'https://s.shopee.co.th/40gPxb9gRy', expiresOn: '2026-10-15' },
  { id: '4Azq9u9371', url: 'https://s.shopee.co.th/4Azq9u9371' },
  { id: '3g3ZYzAx7w', url: 'https://s.shopee.co.th/3g3ZYzAx7w' },
  { id: '3qMzlIAJmz', url: 'https://s.shopee.co.th/3qMzlIAJmz' },
  { id: '3LQjANCDnu', url: 'https://s.shopee.co.th/3LQjANCDnu' },
  { id: '3Vk9MgBaSx', url: 'https://s.shopee.co.th/3Vk9MgBaSx' },
  { id: '30nsllDUTs', url: 'https://s.shopee.co.th/30nsllDUTs' },
  { id: '3B7Iy4Cr8v', url: 'https://s.shopee.co.th/3B7Iy4Cr8v', expiresOn: '2026-09-30' },
  { id: '2gB2N9El9q', url: 'https://s.shopee.co.th/2gB2N9El9q' },
  { id: '2qUSZSE7ot', url: 'https://s.shopee.co.th/2qUSZSE7ot' },
  { id: '7fZiKKvj0q', url: 'https://s.shopee.co.th/7fZiKKvj0q' },
  { id: '7pt8Wdv5ft', url: 'https://s.shopee.co.th/7pt8Wdv5ft' },
  { id: '7Kwrviwzgo', url: 'https://s.shopee.co.th/7Kwrviwzgo' },
  { id: '7VGI81wMLr', url: 'https://s.shopee.co.th/7VGI81wMLr' },
  { id: '70K1X6yGMm', url: 'https://s.shopee.co.th/70K1X6yGMm', expiresOn: '2026-09-16' },
  { id: '7AdRjPxd1p', url: 'https://s.shopee.co.th/7AdRjPxd1p', expiresOn: '2026-09-18' },
] as const;

/** Picks uniformly from links whose Shopee commission period has not ended. */
export function selectShopeeAffiliateLink(
  todayBangkok = getTodayBangkokString(),
  random = Math.random,
): ShopeeAffiliateLink {
  const activeLinks = SHOPEE_AFFILIATE_LINKS.filter(
    (link) => !link.expiresOn || link.expiresOn >= todayBangkok,
  );
  return activeLinks[Math.floor(random() * activeLinks.length)];
}

/** Must run synchronously inside a user gesture so browsers allow the new tab. */
export function openShopeeAffiliateLink(): ShopeeAffiliateLink {
  const link = selectShopeeAffiliateLink();
  window.open(link.url, '_blank', 'noopener,noreferrer');
  return link;
}

export function openTrackedShopeeAffiliateLink(
  track: (event: TrackedEvent) => void,
  surface: 'today' | 'fortune',
  placement: AffiliatePlacement,
): void {
  const link = openShopeeAffiliateLink();
  track({
    event: 'affiliate_link_opened',
    surface,
    placement,
    affiliateLinkId: link.id,
  });
}
