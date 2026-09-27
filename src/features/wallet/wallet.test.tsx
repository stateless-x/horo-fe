import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { WalletResponse } from '@/lib-packages/shared/types/wallet';
import { ReportDoor } from '@/features/compatibility/report/report-door';
import { LedgerList } from './ledger-list';
import { PackList } from './pack-list';
import { WALLET_QUERY_KEY } from './use-wallet';
import { entryLabel, signed, stardustWithBaht } from './wallet-copy';

const wallet: WalletResponse = {
  balance: 49,
  cap: 2000,
  packs: [
    { id: 'p49', priceBaht: 49, base: 49, bonus: 0 },
    { id: 'p99', priceBaht: 99, base: 99, bonus: 10 },
    { id: 'p199', priceBaht: 199, base: 199, bonus: 30 },
  ],
  prices: { compat_unlock: 49, month_pass: 29, year_reading: 99, wallpaper: 39 },
  ledger: [
    {
      id: 'l2',
      delta: -49,
      kind: 'spend',
      productId: 'compat_unlock',
      refId: 'row',
      note: null,
      expiresAt: null,
      createdAt: '2026-09-27T10:00:00.000Z',
    },
    {
      id: 'l1',
      delta: 49,
      kind: 'welcome',
      productId: null,
      refId: null,
      note: 'ของขวัญต้อนรับ',
      expiresAt: null,
      createdAt: '2026-09-27T09:00:00.000Z',
    },
  ],
};

// Owner rule for cards and the report: no purple text.
const PURPLE_TEXT = /(?<![\w-])text-accent(Bright|Soft)?\b/;

describe('wallet copy', () => {
  test('amounts carry their baht, deltas their sign', () => {
    expect(stardustWithBaht(49)).toBe('49 ละอองดาว (฿49)');
    expect(signed(49)).toBe('+49');
    expect(signed(-49)).toBe('−49');
    expect(entryLabel(wallet.ledger[0])).toBe('ปลดล็อกดวงคู่');
    expect(entryLabel(wallet.ledger[1])).toBe('ของขวัญต้อนรับ');
  });
});

describe('PackList', () => {
  test('three packs with baht and bonus, each with a disabled PromptPay button and one honest line', () => {
    const html = renderToStaticMarkup(<PackList packs={wallet.packs} />);
    for (const [total, price] of [
      ['49', '฿49'],
      ['109', '฿99'],
      ['229', '฿199'],
    ]) {
      expect(html).toContain(`>${total}</span> ละอองดาว`);
      expect(html).toContain(price);
    }
    expect(html).toContain('99 + โบนัส 10');
    expect(html).toContain('199 + โบนัส 30');
    expect(html.match(/disabled=""/g)).toHaveLength(3);
    expect(html.match(/PromptPay เร็ว ๆ นี้/g)).toHaveLength(3);
    expect(html).toContain('ยังเติมละอองดาวไม่ได้ตอนนี้');
    expect(html).not.toMatch(PURPLE_TEXT);
  });
});

describe('LedgerList', () => {
  test('rows show what, when and a signed amount', () => {
    const html = renderToStaticMarkup(<LedgerList entries={wallet.ledger} />);
    expect(html).toContain('ปลดล็อกดวงคู่');
    expect(html).toContain('−49');
    expect(html).toContain('+49');
    expect(renderToStaticMarkup(<LedgerList entries={[]} />)).toContain('ยังไม่มีรายการ');
  });
});

describe('ReportDoor with a known balance', () => {
  test('the CTA spends from the real wallet: price and balance', () => {
    const client = new QueryClient();
    client.setQueryData(WALLET_QUERY_KEY, wallet);
    const html = renderToStaticMarkup(
      <QueryClientProvider client={client}>
        <ReportDoor
          partnerName="ต้น"
          readingMinutes={11}
          contents={[{ id: 'c1', title: 'บทหนึ่ง', short: 'หนึ่ง', n: 1 }]}
          full={false}
          onJump={() => {}}
          allOpen={false}
          onToggleAll={() => {}}
          onUnlock={() => {}}
        />
      </QueryClientProvider>,
    );
    expect(html).toContain('ใช้ 49 ละอองดาว ปลดล็อก (มี 49)');
    expect(html).toContain('1 ละอองดาว = ฿1');
    expect(html).not.toMatch(PURPLE_TEXT);
  });
});
