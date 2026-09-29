import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { WalletResponse, WalletState } from '@/lib-packages/shared/types/wallet';
import { ReportDoor } from '@/features/compatibility/report/report-door';
import { BalanceChip, WalletMenuRow } from './balance-chip';
import { LedgerList } from './ledger-list';
import { PackList } from './pack-list';
import { WALLET_QUERY_KEY } from './use-wallet';
import { doorPacks, entryLabel, nextPackUp, shortfallLine, signed } from './wallet-copy';

const wallet: WalletState = {
  enabled: true,
  balance: 49,
  cap: 2000,
  packs: [
    { id: 'p49', priceBaht: 49, base: 49, bonus: 0, bonusPercent: 0 },
    { id: 'p99', priceBaht: 99, base: 99, bonus: 10, bonusPercent: 10 },
    { id: 'p199', priceBaht: 199, base: 199, bonus: 30, bonusPercent: 15 },
    { id: 'p399', priceBaht: 399, base: 399, bonus: 80, bonusPercent: 20 },
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
      by: 'you',
      amountBaht: null,
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
      by: 'horo',
      amountBaht: null,
    },
  ],
};

// Owner rule for cards and the report: no purple text.
const PURPLE_TEXT = /(?<![\w-])text-accent(Bright|Soft)?\b/;

describe('wallet copy', () => {
  test('shortfall, deltas and ledger labels', () => {
    expect(shortfallLine(0, 49)).toBe('ยอดไม่พอ มี 0 มู ต้องใช้ 49 มู');
    expect(signed(49)).toBe('+49');
    expect(signed(-49)).toBe('−49');
    expect(entryLabel(wallet.ledger[0])).toBe('ปลดล็อกดวงคู่ · ต้น');
    expect(entryLabel({ ...wallet.ledger[0], refName: null })).toBe('ปลดล็อกดวงคู่');
    expect(entryLabel(wallet.ledger[1])).toBe('ของขวัญต้อนรับ');
    const purchase = { ...wallet.ledger[1], kind: 'purchase' as const, delta: 99, amountBaht: 99, by: 'you' as const };
    expect(entryLabel(purchase)).toBe('เติมมู ฿99 → +99 มู');
    const adjust = { ...wallet.ledger[1], kind: 'admin_adjust' as const, delta: 10 };
    expect(entryLabel({ ...adjust, by: 'team' })).toBe('ปรับยอดโดยทีมงาน');
    expect(entryLabel({ ...adjust, by: 'horo' })).toBe('ปรับยอด');
  });
});

describe('doorPacks', () => {
  test('the smallest covering pack plus one step up, never p399', () => {
    expect(doorPacks(wallet.packs, 49).map((pack) => pack.id)).toEqual(['p49', 'p99']);
    expect(doorPacks(wallet.packs, 60).map((pack) => pack.id)).toEqual(['p99', 'p199']);
    expect(doorPacks(wallet.packs, 200).map((pack) => pack.id)).toEqual(['p199']);
    expect(doorPacks(wallet.packs, 5000).map((pack) => pack.id)).toEqual(['p199']);
  });

  test('the next pack up for the line after a purchase', () => {
    expect(nextPackUp(wallet.packs, 'p99')?.id).toBe('p199');
    expect(nextPackUp(wallet.packs, 'p399')).toBeUndefined();
  });
});

describe('PackList', () => {
  test('rows show มู, the bonus chip, คุ้มสุด on p199, baht and a radio mark; no ยอดนิยม', () => {
    const html = renderToStaticMarkup(<PackList packs={wallet.packs} selected="p99" onSelect={() => {}} />);
    for (const [total, price] of [
      ['49', '฿49'],
      ['109', '฿99'],
      ['229', '฿199'],
      ['479', '฿399'],
    ]) {
      expect(html).toContain(`>${total}</span> มู`);
      expect(html).toContain(price);
    }
    expect(html).toContain('+10%');
    expect(html).toContain('+15%');
    expect(html).not.toContain('+0%');
    expect(html.match(/>คุ้มสุด</g)).toHaveLength(1);
    // Each radio is named by its amount, bonus, tag and price; rows carry no bonus-expiry line.
    for (const name of ['49 มู ฿49', '109 มู +10% ฿99', '229 มู +15% คุ้มสุด ฿199', '479 มู +20% ฿399']) expect(html).toContain(`aria-label="${name}"`);
    expect(html).not.toContain('รวมโบนัส');
    expect(html).not.toContain('ยอดนิยม');
    expect(html.match(/role="radio"/g)).toHaveLength(4);
    expect(html.match(/aria-checked="true"/g)).toHaveLength(1);
    expect(html).not.toMatch(PURPLE_TEXT);
  });
});

describe('LedgerList', () => {
  test('rows show what, when and a signed amount', () => {
    const html = renderToStaticMarkup(<LedgerList entries={wallet.ledger} />);
    expect(html).toContain('href="/dashboard/compatibility/row"');
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
        contents={[{ id: 'c1', title: 'ส่วนหนึ่ง', short: 'หนึ่ง' }]}
        full={false}
        onJump={() => {}}
        allOpen={false}
        onToggleAll={() => {}}
        onUnlock={() => {}}
      />
    </QueryClientProvider>,
  );
};

const withWallet = (node: React.ReactNode, state: WalletState = { ...wallet, balance: 71 }) => {
  const client = new QueryClient();
  client.setQueryData(WALLET_QUERY_KEY, state);
  return renderToStaticMarkup(<QueryClientProvider client={client}>{node}</QueryClientProvider>);
};

describe('header wallet (on)', () => {
  test('the chip shows the crystal and the number only, and keeps its accessible name', () => {
    const html = withWallet(<BalanceChip />);
    expect(html).toContain('href="/dashboard/wallet"');
    expect(html).toContain('aria-label="ยอด 71 มู เปิดหน้ามูของคุณ"');
    expect(html).toContain('mu-gem-clay-48.webp');
    const visible = html.replace(/<[^>]*>/g, '');
    expect(visible).toBe('71');
  });

  test('the menu row links to the wallet with มูของคุณ and the balance', () => {
    const html = withWallet(<WalletMenuRow className="row" />);
    expect(html).toContain('href="/dashboard/wallet"');
    expect(html).toContain('mu-gem-clay');
    expect(html.replace(/<[^>]*>/g, '')).toBe('มูของคุณ71');
  });
});

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
    const row = renderToStaticMarkup(
      <QueryClientProvider client={client}>
        <WalletMenuRow className="" />
      </QueryClientProvider>,
    );
    expect(row).toBe('');
    const html = door({ enabled: false });
    expect(html).toContain('เปิดคำตอบทั้งหมด');
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
  test('short of the price, the primary button reads baht-first and opens the เติมมู sheet', () => {
    const html = door({ ...wallet, balance: 0 });
    expect(html).toContain('เปิดคำตอบทั้งหมด · ฿49');
    expect(html).toContain('aria-haspopup="dialog"');
    expect(html).not.toContain('49 มู');
    expect(html).not.toMatch(PURPLE_TEXT);
  });

  test('the CTA spends from the real wallet: price and balance', () => {
    const html = door(wallet);
    expect(html).not.toContain('ซื้อแพ็กคุ้มกว่า');
    expect(html).toContain('เปิดคำตอบทั้งหมด · 49 มู');
    expect(html).not.toContain('(฿49)');
    expect(html).toContain('ยอดคงเหลือ 49 มู');
    // Owner, 2026-09-28: the pay-once line waits for the payment system.
    expect(html).not.toContain('จ่ายครั้งเดียว');
    expect(html).not.toContain('กลับมาอ่านได้ทุกเมื่อ');
    expect(html).not.toMatch(PURPLE_TEXT);
  });
});

describe('no ads next to paid content', () => {
  test('the ดวงคู่ page mounts no Pawjai banner', async () => {
    const page = await Bun.file(new URL('../../app/dashboard/compatibility/page.tsx', import.meta.url)).text();
    expect(page).not.toContain('PawjaiAdsBanner');
  });
});
