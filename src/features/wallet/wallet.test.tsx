import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import type { WalletState } from '@/lib-packages/shared/types/wallet';
import { FeatureCreditCard } from './feature-credit-card';
import { LedgerList } from './ledger-list';
import { OfferChoices } from './mini-shop-dialog';
import { PackList } from './pack-list';
import { doorPacks, entryLabel, nextPackUp, shortfallLine, signed } from './wallet-copy';

const wallet: WalletState = {
  enabled: true,
  balance: 55,
  packs: [
    { id: 'p50', priceBaht: 49, base: 49, bonus: 0, bonusPercent: 0 },
    { id: 'p100', priceBaht: 99, base: 99, bonus: 0, bonusPercent: 0 },
    { id: 'p150', priceBaht: 149, base: 149, bonus: 0, bonusPercent: 0 },
    { id: 'p300', priceBaht: 299, base: 299, bonus: 31, bonusPercent: 10 },
    { id: 'p500', priceBaht: 499, base: 499, bonus: 76, bonusPercent: 15 },
    { id: 'p1000', priceBaht: 999, base: 999, bonus: 201, bonusPercent: 20 },
  ],
  prices: { compat_unlock: 49, month_pass: 29, year_reading: 99, wallpaper: 39 },
  ledger: [{
    id: 'exchange', delta: -99, kind: 'spend', productId: 'heart_ticket_3', refId: 'purchase-id',
    refName: 'ตั๋วรู้ใจ 2 ใบ แถม 1', note: null, expiresAt: null,
    createdAt: '2026-09-30T10:00:00.000Z', by: 'you', amountBaht: null,
  }],
  tickets: { usesLeft: 4, expiring: [{ uses: 1, expiresAt: '2026-10-30T00:00:00.000Z', source: 'promotion' }] },
};

describe('wallet copy and balances', () => {
  test('shows top-up payment and received points without repeating the credit in the label', () => {
    const purchase = { ...wallet.ledger[0], id: 'purchase', kind: 'purchase' as const, productId: null, refName: null, delta: 100, amountBaht: 100 };
    const bonus = { ...purchase, id: 'bonus', kind: 'bonus' as const, delta: 5, amountBaht: null };
    expect(entryLabel(purchase)).toBe('เติมมู ฿100');
    expect(entryLabel(bonus)).toBe('โบนัสเติมมู');
    const html = renderToStaticMarkup(<LedgerList entries={[purchase, bonus]} />);
    expect(html).toContain('เติมมู ฿100');
    expect(html).toContain('โบนัสเติมมู');
    expect(html).not.toContain('→');
  });

  test('shows มู exchange as a catalog purchase without linking a purchase id to a report', () => {
    expect(shortfallLine(20, 99)).toBe('ยอดไม่พอ มี 20 มู ต้องใช้ 99 มู');
    expect(signed(-99)).toBe('−99');
    expect(entryLabel(wallet.ledger[0])).toContain('ตั๋วรู้ใจ 2 ใบ แถม 1');
    const html = renderToStaticMarkup(<LedgerList entries={wallet.ledger} />);
    expect(html).toContain('ตั๋วรู้ใจ 2 ใบ แถม 1');
    expect(html).not.toContain('href="/dashboard/compatibility/purchase-id"');
  });

  test('shows usable tickets and the soonest expiring grant separately', () => {
    const html = renderToStaticMarkup(<FeatureCreditCard credit={wallet.tickets} onBuy={() => {}} />);
    expect(html).toContain('<span class="font-mono tabular-nums">4</span> ใบ');
    expect(html).toContain('1 ใบ หมดอายุ');
    expect(html).toContain('heart-knowing-ticket-256.webp');
    expect(html).toContain('href="/dashboard/compatibility"');
    expect(html).toContain('ไปดูดวงคู่');
    expect(html).toContain('ซื้อตั๋วเพิ่ม');
  });

  test('offers purchase as the primary action when no ticket is available', () => {
    const html = renderToStaticMarkup(<FeatureCreditCard credit={{ usesLeft: 0, expiring: [] }} onBuy={() => {}} />);
    expect(html).toContain('ซื้อตั๋ว');
    expect(html).not.toContain('ไปดูดวงคู่');
    expect(html).not.toContain('href="/dashboard/compatibility"');
  });
});

describe('top-up ladder', () => {
  test('picks the smallest credit covering a shortfall and the next pack', () => {
    expect(doorPacks(wallet.packs, 49).map((pack) => pack.id)).toEqual(['p50', 'p100']);
    expect(doorPacks(wallet.packs, 79).map((pack) => pack.id)).toEqual(['p100', 'p150']);
    expect(doorPacks(wallet.packs, 149).map((pack) => pack.id)).toEqual(['p150', 'p300']);
    expect(doorPacks(wallet.packs, 1000).map((pack) => pack.id)).toEqual(['p1000']);
    expect(nextPackUp(wallet.packs, 'p100')?.id).toBe('p150');
    expect(nextPackUp(wallet.packs, 'p1000')).toBeUndefined();
  });

  test('renders all packs from wallet data with bonus percentages', () => {
    const html = renderToStaticMarkup(<PackList packs={wallet.packs} selected="p100" onSelect={() => {}} />);
    expect(html.match(/role="radio"/g)).toHaveLength(6);
    expect(html).toContain('99 มู ฿99');
    expect(html).toContain('149 มู ฿149');
    expect(html).toContain('330 มู +10% ฿299');
    expect(html).toContain('1,200 มู +20% คุ้มสุด ฿999');
    expect(html).not.toContain('+0%');
    expect(html).not.toContain('เพิ่ม ฿50');
  });
});

test('offer choices show a concise step-up and support future catalog offers', () => {
  const offers = [
    { id: 'one', label: '1 ใบ', quantity: 1, bonusQuantity: 0, units: 1, priceMoo: 49, badges: [] as ('bonus' | 'recommended')[] },
    { id: 'three', label: '2 ใบ แถม 1', quantity: 2, bonusQuantity: 1, units: 3, priceMoo: 99, badges: ['bonus', 'recommended'] as ('bonus' | 'recommended')[] },
    { id: 'five', label: '5 ใบ', quantity: 5, bonusQuantity: 0, units: 5, priceMoo: 149, badges: [] as ('bonus' | 'recommended')[] },
    { id: 'ten', label: '10 ใบ', quantity: 10, bonusQuantity: 0, units: 10, priceMoo: 399, badges: [] as ('bonus' | 'recommended')[] },
  ];
  const html = renderToStaticMarkup(<OfferChoices offers={offers} selectedId="three" onSelect={() => {}} />);
  expect(html.match(/role="radio"/g)).toHaveLength(4);
  expect(html).not.toContain('เพิ่ม 50 มู ได้อีก 2 ใบ');
  expect(html).toContain('149 มู');
  expect(html).toContain('10 ใบ');
  expect(html).toContain('399 มู');
  expect(html).not.toContain('฿');
  expect(html).toContain('3 ใบ');
  expect(html).toContain('99 มู');
  expect(html.match(/>แนะนำ</g)).toHaveLength(1);
  expect(html).not.toContain('รวม');
  expect(html).not.toContain('แถม');
  expect(html).not.toContain('ประหยัด');
});
