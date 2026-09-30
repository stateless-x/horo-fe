import { afterAll, afterEach, beforeAll, describe, expect, test } from 'bun:test';
import { useState } from 'react';
import { GlobalRegistrator } from '@happy-dom/global-registrator';
import type { WalletState } from '@/lib-packages/shared/types/wallet';
import type { TopupContext } from './pack-sheet';

/**
 * The เติมมู sheet in a DOM (happy-dom, registered for this file only). The
 * DOM libraries load after registration: react-dom and react-query decide at
 * import whether they run on a server (react-query then never polls).
 */
let rtl: typeof import('@testing-library/react');
let RQ: typeof import('@tanstack/react-query');
let PackSheet: typeof import('./pack-sheet').PackSheet;
let ReportDoor: typeof import('@/features/compatibility/report/report-door').ReportDoor;
let PENDING_ORDER_KEY: string;

beforeAll(async () => {
  GlobalRegistrator.register({ url: 'http://localhost:3000' });
  rtl = await import('@testing-library/react');
  RQ = await import('@tanstack/react-query');
  PackSheet = (await import('./pack-sheet')).PackSheet;
  ReportDoor = (await import('@/features/compatibility/report/report-door')).ReportDoor;
  PENDING_ORDER_KEY = (await import('./pending-order')).PENDING_ORDER_KEY;
});

afterEach(() => {
  rtl.cleanup();
  window.localStorage.clear();
});

afterAll(async () => {
  await GlobalRegistrator.unregister();
});

const wallet: WalletState = {
  enabled: true,
  balance: 0,
  cap: 2000,
  packs: [
    { id: 'p49', priceBaht: 49, base: 49, bonus: 0, bonusPercent: 0 },
    { id: 'p99', priceBaht: 99, base: 99, bonus: 10, bonusPercent: 10 },
    { id: 'p199', priceBaht: 199, base: 199, bonus: 30, bonusPercent: 15 },
    { id: 'p399', priceBaht: 399, base: 399, bonus: 80, bonusPercent: 20 },
  ],
  prices: { compat_unlock: 49, month_pass: 29, year_reading: 99, wallpaper: 39 },
  ledger: [],
};

const ROW = '11111111-1111-4111-8111-111111111111';

type Call = { method: string; url: string; body?: unknown };

/** A non-200 answer from the mocked API. */
class Refusal {
  constructor(
    readonly status: number,
    readonly body: unknown,
  ) {}
}

/** Replaces fetch with a router over the wallet routes; records every call. A `Refusal` answers with its status. */
function mockApi(route: (call: Call) => unknown) {
  const calls: Call[] = [];
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const call: Call = { method: init?.method ?? 'GET', url: String(input), body: init?.body ? JSON.parse(String(init.body)) : undefined };
    calls.push(call);
    const answer = route(call);
    const [status, body] = answer instanceof Refusal ? [answer.status, answer.body] : [200, answer];
    return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
  }) as typeof fetch;
  return calls;
}

const qr = (orderId: string, expiresInMs: number, amountBaht: number) => ({
  orderId,
  status: 'pending',
  payment: 'qr',
  qr: { data: `fake:${orderId}`, pngUrl: null, svgUrl: null },
  expiresAt: new Date(Date.now() + expiresInMs).toISOString(),
  amountBaht,
});

const order = (orderId: string, status: string, extra: Record<string, unknown> = {}) => ({
  orderId,
  packId: 'p99',
  status,
  amountSatang: 9900,
  units: 109,
  createdAt: new Date().toISOString(),
  paidAt: status === 'paid' ? new Date().toISOString() : null,
  expiresAt: new Date(Date.now() + 60_000).toISOString(),
  balance: status === 'paid' ? 109 : 0,
  ...extra,
});

type OnPaid = (order: unknown) => Promise<void>;

function Host({ context, initiallyOpen, onPaid }: { context: TopupContext; initiallyOpen: boolean; onPaid?: OnPaid }) {
  const [open, setOpen] = useState(initiallyOpen);
  return (
    <>
      <output data-testid="open">{String(open)}</output>
      <PackSheet open={open} onOpenChange={setOpen} wallet={wallet} context={context} onPaid={onPaid} pollMs={30} />
    </>
  );
}

function renderSheet(context: TopupContext, initiallyOpen = true, onPaid?: OnPaid) {
  const client = new RQ.QueryClient({ defaultOptions: { queries: { retry: false } } });
  return rtl.render(
    <RQ.QueryClientProvider client={client}>
      <Host context={context} initiallyOpen={initiallyOpen} onPaid={onPaid} />
    </RQ.QueryClientProvider>,
  );
}

const checked = (radios: HTMLElement[]) => radios.filter((radio) => radio.getAttribute('aria-checked') === 'true');


/** The door's spend button, then the confirmation it opens (SpendConfirmSheet). */
async function spend(view: ReturnType<typeof rtl.render>) {
  rtl.fireEvent.click(await view.findByText('เปิดคำอ่านฉบับเต็มด้วย 49 มู'));
  rtl.fireEvent.click(await view.findByText('ยืนยัน ใช้ 49 มู'));
}

describe('pack step', () => {
  test('store: every pack, p99 preselected; a tap or an arrow key moves the selection and the pay button follows', () => {
    const view = renderSheet({ kind: 'store' });
    const radios = view.getAllByRole('radio', { hidden: true });
    expect(radios).toHaveLength(4);
    expect(checked(radios)[0].textContent).toContain('฿99');
    expect(view.getByText('จ่าย ฿99 ด้วย PromptPay')).toBeTruthy();
    expect(view.getByText('ยอดคงเหลือ 0 มู · 1 มู = ฿1')).toBeTruthy();
    expect(view.getByText('จ่ายครั้งเดียว ไม่ตัดเงินอัตโนมัติ')).toBeTruthy();
    expect(view.getByText('มูที่เติมไม่หมดอายุ · โบนัสใช้ได้ 180 วัน')).toBeTruthy();
    expect(view.queryByText(/รวมโบนัส/)).toBeNull();
    expect(radios.map((radio) => radio.getAttribute('aria-label'))).toEqual(['49 มู ฿49', '109 มู +10% ฿99', '229 มู +15% คุ้มสุด ฿199', '479 มู +20% ฿399']);
    expect(view.getByRole('radio', { name: '109 มู +10% ฿99', hidden: true }).getAttribute('aria-checked')).toBe('true');

    rtl.fireEvent.click(radios[2]);
    expect(view.getByText('จ่าย ฿199 ด้วย PromptPay')).toBeTruthy();

    rtl.fireEvent.keyDown(view.getAllByRole('radio', { hidden: true })[2], { key: 'ArrowDown' });
    expect(checked(view.getAllByRole('radio', { hidden: true }))[0].textContent).toContain('฿399');
    expect(view.getByText('จ่าย ฿399 ด้วย PromptPay')).toBeTruthy();
  });

  test('door: the shortfall line, the smallest covering pack preselected plus one step up, never p399', () => {
    const view = renderSheet({ kind: 'door', price: 49, unlockRef: ROW });
    const radios = view.getAllByRole('radio', { hidden: true });
    expect(radios.map((radio) => radio.textContent)).toHaveLength(2);
    expect(radios[0].textContent).toContain('฿49');
    expect(radios[1].textContent).toContain('฿99');
    expect(checked(radios)[0]).toBe(radios[0]);
    expect(view.queryByText('฿399')).toBeNull();
    expect(view.getByText('ยอดไม่พอ มี 0 มู ต้องใช้ 49 มู')).toBeTruthy();
    expect(view.getByText('จ่าย ฿49 ด้วย PromptPay')).toBeTruthy();
  });
});

describe('pay step', () => {
  test('the countdown reaches expiry, verifies once, and ขอ QR ใหม่ replaces that order for the same pack and row', async () => {
    let checkouts = 0;
    const calls = mockApi((call) => {
      if (call.url.endsWith('/api/wallet/checkout')) return qr(`o${++checkouts}`, checkouts === 1 ? 1_200 : 60_000, 49);
      return order('o1', 'pending');
    });
    const view = renderSheet({ kind: 'door', price: 49, unlockRef: ROW });
    rtl.fireEvent.click(view.getByText('จ่าย ฿49 ด้วย PromptPay'));

    await rtl.waitFor(() => expect(view.getByText('฿49 · 49 มู')).toBeTruthy());
    expect(JSON.parse(window.localStorage.getItem(PENDING_ORDER_KEY)!)).toEqual({ orderId: 'o1', packId: 'p49', unlockRef: ROW });

    await rtl.waitFor(() => expect(view.getByText('QR หมดอายุ')).toBeTruthy(), { timeout: 4_000 });
    expect(calls.filter((call) => call.url.includes('verify=1'))).toHaveLength(1);

    rtl.fireEvent.click(view.getByText('ขอ QR ใหม่'));
    await rtl.waitFor(() => expect(view.getByText(/QR ใช้ได้อีก/)).toBeTruthy());
    const posts = calls.filter((call) => call.method === 'POST');
    expect(posts.map((call) => call.body)).toEqual([
      { packId: 'p49', unlockRef: ROW },
      { packId: 'p49', unlockRef: ROW, replaceOrderId: 'o1' },
    ]);
    expect(JSON.parse(window.localStorage.getItem(PENDING_ORDER_KEY)!).orderId).toBe('o2');
  });

  test('polling stops once the order is paid; the store shows +109 มู and the next pack up', async () => {
    let polls = 0;
    const calls = mockApi((call) => {
      if (call.url.endsWith('/api/wallet/checkout')) return qr('o1', 60_000, 99);
      polls += 1;
      return order('o1', polls < 3 ? 'pending' : 'paid');
    });
    const view = renderSheet({ kind: 'store' });
    rtl.fireEvent.click(view.getByText('จ่าย ฿99 ด้วย PromptPay'));

    await rtl.waitFor(() => expect(view.getByText('+109 มู')).toBeTruthy(), { timeout: 3_000 });
    expect(view.getByText('ครั้งหน้าเติม ฿199 ได้ 229 มู')).toBeTruthy();
    expect(window.localStorage.getItem(PENDING_ORDER_KEY)).toBeNull();

    const settled = calls.filter((call) => call.url.includes('/orders/')).length;
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(calls.filter((call) => call.url.includes('/orders/')).length).toBe(settled);
  });
});

describe('resume after a reload', () => {
  test('a stored pending order reopens its sheet in the checking state', async () => {
    window.localStorage.setItem(PENDING_ORDER_KEY, JSON.stringify({ orderId: 'o9', packId: 'p99' }));
    mockApi(() => order('o9', 'pending'));
    const view = renderSheet({ kind: 'store' }, false);
    await rtl.waitFor(() => expect(view.getByTestId('open').textContent).toBe('true'));
    expect(view.getByText('กำลังตรวจสอบการชำระ')).toBeTruthy();
  });

  test('a door leaves an order that belongs to another row alone', async () => {
    window.localStorage.setItem(PENDING_ORDER_KEY, JSON.stringify({ orderId: 'o9', packId: 'p49', unlockRef: 'another-row' }));
    const calls = mockApi(() => order('o9', 'pending'));
    const view = renderSheet({ kind: 'door', price: 49, unlockRef: ROW }, false);
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(view.getByTestId('open').textContent).toBe('false');
    expect(calls).toHaveLength(0);
  });

  test('a stored order that was paid meanwhile is cleared, and the sheet stays closed', async () => {
    window.localStorage.setItem(PENDING_ORDER_KEY, JSON.stringify({ orderId: 'o9', packId: 'p99' }));
    mockApi(() => order('o9', 'paid'));
    const view = renderSheet({ kind: 'store' }, false);
    await rtl.waitFor(() => expect(window.localStorage.getItem(PENDING_ORDER_KEY)).toBeNull());
    expect(view.getByTestId('open').textContent).toBe('false');
  });
});

/** A promise the test settles by hand. */
function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((settle) => {
    resolve = settle;
  });
  return { promise, resolve };
}

describe('ขอ QR ใหม่ conflicts', () => {
  test('from the resume state it names the pending order; 409 already_paid runs the paid path and the door unlock', async () => {
    window.localStorage.setItem(PENDING_ORDER_KEY, JSON.stringify({ orderId: 'o9', packId: 'p49', unlockRef: ROW }));
    let paidNow = false;
    const calls = mockApi((call) => {
      if (call.url.endsWith('/api/wallet/checkout')) {
        paidNow = true;
        return new Refusal(409, { error: 'already_paid', orderId: 'o9' });
      }
      return order('o9', paidNow ? 'paid' : 'pending', { packId: 'p49', units: 49, balance: 49 });
    });
    const unlocking = deferred();
    const paidOrders: unknown[] = [];
    const view = renderSheet({ kind: 'door', price: 49, unlockRef: ROW }, false, (paid) => {
      paidOrders.push(paid);
      return unlocking.promise;
    });
    await rtl.waitFor(() => expect(view.getByText('กำลังตรวจสอบการชำระ')).toBeTruthy());

    rtl.fireEvent.click(view.getByText('ขอ QR ใหม่'));
    // One state until the unlock settles: the earned มู and next action stay clear together.
    await rtl.waitFor(() => expect(view.getByText('เติมสำเร็จ ได้รับ +49 มู กำลังเปิดคำอ่าน')).toBeTruthy());
    expect(view.getByText('กำลังเตรียมคำตอบให้คุณ')).toBeTruthy();
    expect(calls.find((call) => call.method === 'POST')?.body).toEqual({ packId: 'p49', unlockRef: ROW, replaceOrderId: 'o9' });
    expect(window.localStorage.getItem(PENDING_ORDER_KEY)).toBeNull();
    expect(paidOrders).toHaveLength(1);
    expect(view.getByTestId('open').textContent).toBe('true');

    unlocking.resolve();
    await rtl.waitFor(() => expect(view.getByTestId('open').textContent).toBe('false'));
    expect(paidOrders).toHaveLength(1);
  });

  test('409 order_not_pending clears the pending order and starts a fresh checkout without replaceOrderId', async () => {
    let checkouts = 0;
    const calls = mockApi((call) => {
      if (call.url.endsWith('/api/wallet/checkout')) {
        checkouts += 1;
        if (checkouts === 1) return qr('o1', 1_000, 99);
        if (checkouts === 2) return new Refusal(409, { error: 'order_not_pending', orderId: 'o1', status: 'expired' });
        return qr('o2', 60_000, 99);
      }
      return order('o1', 'pending');
    });
    const view = renderSheet({ kind: 'store' });
    rtl.fireEvent.click(view.getByText('จ่าย ฿99 ด้วย PromptPay'));
    await rtl.waitFor(() => expect(view.getByText('QR หมดอายุ')).toBeTruthy(), { timeout: 4_000 });

    rtl.fireEvent.click(view.getByText('ขอ QR ใหม่'));
    await rtl.waitFor(() => expect(view.getByText(/QR ใช้ได้อีก/)).toBeTruthy());
    expect(calls.filter((call) => call.method === 'POST').map((call) => call.body)).toEqual([
      { packId: 'p99' },
      { packId: 'p99', replaceOrderId: 'o1' },
      { packId: 'p99' },
    ]);
    expect(JSON.parse(window.localStorage.getItem(PENDING_ORDER_KEY)!)).toEqual({ orderId: 'o2', packId: 'p99' });
  });
});

function renderFailingDoor(failure: Error) {
  mockApi(() => ({ ...wallet, balance: 49 }));
  const client = new RQ.QueryClient({ defaultOptions: { queries: { retry: false } } });
  return rtl.render(
    <RQ.QueryClientProvider client={client}>
      <ReportDoor
        partnerName="ต้น"
        readingMinutes={11}
        contents={[]}
        full={false}
        unlockRef={ROW}
        onJump={() => {}}
        allOpen={false}
        onToggleAll={() => {}}
        onUnlock={() => Promise.reject(failure)}
      />
    </RQ.QueryClientProvider>,
  );
}

describe('ReportDoor unlock failure', () => {
  test('a server failure: the toast says nothing was charged; the reference line copies the full result id', async () => {
    const copied: string[] = [];
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async (text: string) => void copied.push(text) },
    });
    const view = renderFailingDoor(new Error('เขียนฉบับเต็มไม่สำเร็จ'));
    await spend(view);

    const toast = await view.findByRole('alert');
    expect(toast.textContent).toBe('เปิดคำอ่านไม่สำเร็จ มูของคุณยังอยู่ครบ ลองใหม่ได้เลย');
    expect(view.getByText('11111111')).toBeTruthy();
    expect(view.queryByText('เขียนฉบับเต็มไม่สำเร็จ')).toBeNull();

    rtl.fireEvent.click(view.getByRole('button', { name: 'คัดลอกรหัสอ้างอิง' }));
    await rtl.waitFor(() => expect(view.getByText('คัดลอกแล้ว')).toBeTruthy());
    expect(copied).toEqual([ROW]);
  });

  test('a client timeout: no charge claim, a refresh hint, and the reference line stays', async () => {
    const timeout = Object.assign(new Error('Request timed out'), { status: 408, code: 'TIMEOUT' });
    const view = renderFailingDoor(timeout);
    await spend(view);

    const toast = await view.findByRole('alert');
    expect(toast.textContent).toBe('ใช้เวลานานกว่าปกติ คำตอบอาจกำลังเสร็จ ลองรีเฟรชหน้านี้');
    expect(view.queryByText(/ยังไม่หักมู/)).toBeNull();
    expect(view.getByText('11111111')).toBeTruthy();
    expect(view.getByRole('button', { name: 'คัดลอกรหัสอ้างอิง' })).toBeTruthy();
  });
});

describe('ReportDoor spend confirmation', () => {
  function renderDoor(onUnlock: () => Promise<void>) {
    mockApi(() => ({ ...wallet, balance: 60 }));
    const client = new RQ.QueryClient({ defaultOptions: { queries: { retry: false } } });
    return rtl.render(
      <RQ.QueryClientProvider client={client}>
        <ReportDoor partnerName="ต้น" readingMinutes={11} contents={[]} full={false} unlockRef={ROW} onJump={() => {}} allOpen={false} onToggleAll={() => {}} onUnlock={onUnlock} />
      </RQ.QueryClientProvider>,
    );
  }

  test('the spend asks first, with the balance before and after and what it is worth; cancel spends nothing', async () => {
    let unlocks = 0;
    const view = renderDoor(async () => void unlocks++);
    rtl.fireEvent.click(await view.findByText('เปิดคำอ่านฉบับเต็มด้วย 49 มู'));

    const dialog = await view.findByRole('dialog', { hidden: true, name: 'ยืนยันใช้มู' });
    expect(dialog.textContent).toContain('เปิดคำอ่านฉบับเต็มของคุณกับต้น');
    expect(dialog.textContent).toContain('60 มู');
    expect(dialog.textContent).toContain('−49 มู');
    expect(dialog.textContent).toContain('11 มู');
    expect(dialog.textContent).toContain('49 มู เท่ากับ ฿49');

    rtl.fireEvent.click(view.getByText('ยังไม่ใช้ตอนนี้'));
    await rtl.waitFor(() => expect(view.queryByText('ยืนยัน ใช้ 49 มู')).toBeNull());
    expect(unlocks).toBe(0);

    await spend(view);
    await rtl.waitFor(() => expect(unlocks).toBe(1));
  });
});
