import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { WalletResponse, WalletState } from '@/lib-packages/shared/types/wallet';
import { ReportDoor } from '@/features/compatibility/report/report-door';
import { BalanceChip } from './balance-chip';
import { LedgerList } from './ledger-list';
import { PackList } from './pack-list';
import { WALLET_QUERY_KEY } from './use-wallet';
import { entryLabel, shortfallLine, signed, smallestPackCovering, unitsWithBaht } from './wallet-copy';

const wallet: WalletState = {
  enabled: true,
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
      refName: 'ต้น',
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
      refName: null,
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
    expect(unitsWithBaht(49)).toBe('49 มู (฿49)');
    expect(shortfallLine(0, 49)).toBe('ยอดไม่พอ มี 0 มู ต้องใช้ 49 มู (฿49)');
    expect(signed(49)).toBe('+49');
    expect(signed(-49)).toBe('−49');
    expect(entryLabel(wallet.ledger[0])).toBe('ปลดล็อกดวงคู่ · ต้น');
    expect(entryLabel({ ...wallet.ledger[0], refName: null })).toBe('ปลดล็อกดวงคู่');
    expect(entryLabel(wallet.ledger[1])).toBe('ของขวัญต้อนรับ');
  });
});

describe('smallestPackCovering', () => {
  test('picks the cheapest pack that covers the shortfall', () => {
    expect(smallestPackCovering(wallet.packs, 49)?.id).toBe('p49');
    expect(smallestPackCovering(wallet.packs, 60)?.id).toBe('p99');
    expect(smallestPackCovering(wallet.packs, 5000)?.id).toBe('p199');
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
      expect(html).toContain(`>${total}</span> มู`);
      expect(html).toContain(price);
    }
    expect(html).toContain('99 + โบนัส 10');
    expect(html).toContain('199 + โบนัส 30');
    expect(html.match(/disabled=""/g)).toHaveLength(3);
    expect(html.match(/PromptPay เร็ว ๆ นี้/g)).toHaveLength(3);
    expect(html).toContain('ยังเติมมูไม่ได้ตอนนี้');
    expect(html).not.toMatch(PURPLE_TEXT);
  });
});

describe('LedgerList', () => {
  test('rows show what, when and a signed amount', () => {
    const html = renderToStaticMarkup(<LedgerList entries={wallet.ledger} />);
    expect(html).toContain('href="/dashboard/compatibility?id=row"');
    expect(html).toContain('ปลดล็อกดวงคู่ · ต้น');
    // A deleted reading keeps the bare label and no link.
    const gone = renderToStaticMarkup(<LedgerList entries={[{ ...wallet.ledger[0], refName: null }]} />);
    expect(gone).toContain('ปลดล็อกดวงคู่');
    expect(gone).not.toContain('href=');
    expect(html).toContain('−49');
    expect(html).toContain('+49');
    expect(renderToStaticMarkup(<LedgerList entries={[]} />)).toContain('ยังไม่มีรายการ');
  });
});

const door = (data: WalletResponse) => {
  const client = new QueryClient();
  client.setQueryData(WALLET_QUERY_KEY, data);
  return renderToStaticMarkup(
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
};

describe('wallet off (nothing sellable)', () => {
  test('no chip, and the door shows no balance, price or packs', () => {
    const client = new QueryClient();
    client.setQueryData(WALLET_QUERY_KEY, { enabled: false });
    const chip = renderToStaticMarkup(
      <QueryClientProvider client={client}>
        <BalanceChip />
      </QueryClientProvider>,
    );
    expect(chip).toBe('');
    const html = door({ enabled: false });
    expect(html).toContain('ปลดล็อกฉบับเต็ม');
    expect(html).not.toContain('มี ');
    expect(html).not.toContain('<dialog');
  });

  test('the door carries nothing promotional', () => {
    for (const html of [door(wallet), door({ enabled: false })]) {
      for (const promo of ['สนับสนุน', 'ซื้อกาแฟ', 'shopee', 'Shopee', 'Pawjai', 'pawjai']) expect(html).not.toContain(promo);
    }
  });
});

describe('ReportDoor with a known balance', () => {
  test('short of the price, the primary button buys and unlocks in one flow, with packs as a secondary link', () => {
    const html = door({ ...wallet, balance: 0 });
    expect(html).toContain('ปลดล็อก ฿49');
    expect(html).toContain('ซื้อแพ็กคุ้มกว่า');
    expect(html).toContain('ยอดไม่พอ มี 0 มู ต้องใช้ 49 มู (฿49)');
    expect(html).not.toContain('ใช้ 49 มู ปลดล็อก');
    expect(html).not.toMatch(PURPLE_TEXT);
  });

  test('the CTA spends from the real wallet: price and balance', () => {
    const html = door(wallet);
    expect(html).not.toContain('ซื้อแพ็กคุ้มกว่า');
    expect(html).toContain('ใช้ 49 มู ปลดล็อก (มี 49 มู)');
    expect(html).toContain('1 มู = ฿1');
    expect(html).not.toMatch(PURPLE_TEXT);
  });
});

describe('no ads next to paid content', () => {
  test('the ดวงคู่ page mounts no Pawjai banner', async () => {
    const page = await Bun.file(new URL('../../app/dashboard/compatibility/page.tsx', import.meta.url)).text();
    expect(page).not.toContain('PawjaiAdsBanner');
  });
});
