import { afterAll, afterEach, beforeAll, describe, expect, test } from 'bun:test';
import { useState } from 'react';
import { GlobalRegistrator } from '@happy-dom/global-registrator';
import type { ShopOffer } from '@/lib-packages/shared/types/shop';
import type { WalletState } from '@/lib-packages/shared/types/wallet';
import type { TopupContext } from './pack-sheet';

let rtl: typeof import('@testing-library/react');
let RQ: typeof import('@tanstack/react-query');
let PackSheet: typeof import('./pack-sheet').PackSheet;
let MiniShopDialog: typeof import('./mini-shop-dialog').MiniShopDialog;
let readPendingOrder: typeof import('./pending-order').readPendingOrder;
let writePendingOrder: typeof import('./pending-order').writePendingOrder;
let pendingOrderKey: typeof import('./pending-order').pendingOrderKey;
let PENDING_ORDER_KEY: string;
const USER_ID = 'user-a';

beforeAll(async () => {
  GlobalRegistrator.register({ url: 'http://localhost:3000' });
  rtl = await import('@testing-library/react');
  RQ = await import('@tanstack/react-query');
  PackSheet = (await import('./pack-sheet')).PackSheet;
  MiniShopDialog = (await import('./mini-shop-dialog')).MiniShopDialog;
  const pendingOrder = await import('./pending-order');
  readPendingOrder = pendingOrder.readPendingOrder;
  writePendingOrder = pendingOrder.writePendingOrder;
  pendingOrderKey = pendingOrder.pendingOrderKey;
  PENDING_ORDER_KEY = pendingOrderKey(USER_ID);
});
afterEach(() => { rtl.cleanup(); window.localStorage.clear(); });
afterAll(async () => { await new Promise((resolve) => setTimeout(resolve, 100)); await GlobalRegistrator.unregister(); });

const offer: ShopOffer = { id: 'heart_ticket_3', label: '2 ใบ แถม 1', quantity: 2, bonusQuantity: 1, units: 3, priceMoo: 99, badges: ['bonus', 'recommended'] };
const wallet: WalletState = {
  enabled: true, balance: 20,
  packs: [
    { id: 'p50', priceBaht: 49, base: 49, bonus: 0, bonusPercent: 0 },
    { id: 'p100', priceBaht: 99, base: 99, bonus: 0, bonusPercent: 0 },
    { id: 'p150', priceBaht: 149, base: 149, bonus: 0, bonusPercent: 0 },
    { id: 'p300', priceBaht: 299, base: 299, bonus: 31, bonusPercent: 10 },
    { id: 'p500', priceBaht: 499, base: 499, bonus: 76, bonusPercent: 15 },
    { id: 'p1000', priceBaht: 999, base: 999, bonus: 201, bonusPercent: 20 },
  ],
  prices: { compat_unlock: 49, month_pass: 29, year_reading: 99, wallpaper: 39 },
  ledger: [], tickets: { usesLeft: 0, expiring: [] },
};
const ROW = '11111111-1111-4111-8111-111111111111';
type Call = { method: string; url: string; body?: Record<string, unknown> };
class Refusal { constructor(readonly status: number, readonly body: unknown) {} }

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

const qr = (orderId: string, expiresInMs = 60_000) => ({ orderId, status: 'pending', payment: 'qr', qr: { data: `fake:${orderId}`, pngUrl: null, svgUrl: null }, expiresAt: new Date(Date.now() + expiresInMs).toISOString(), amountBaht: 99 });
const order = (status: 'pending' | 'paid', fulfilment: 'done' | 'failed' | null = null) => ({
  orderId: 'o1', packId: 'p100', status, amountSatang: 9900, units: 99,
  createdAt: new Date().toISOString(), paidAt: status === 'paid' ? new Date().toISOString() : null,
  expiresAt: new Date(Date.now() + 60_000).toISOString(), balance: status === 'paid' ? 20 : 20,
  fulfilment, tickets: { usesLeft: fulfilment === 'done' ? 3 : 0, expiring: [] },
});

function Host({ context, onPaid, initiallyOpen = true }: { context: TopupContext; onPaid?: () => Promise<void>; initiallyOpen?: boolean }) {
  const [open, setOpen] = useState(initiallyOpen);
  return <><output data-testid="open">{String(open)}</output><PackSheet userId={USER_ID} open={open} onOpenChange={setOpen} wallet={wallet} context={context} onPaid={onPaid} pollMs={30} /></>;
}
function renderSheet(context: TopupContext, onPaid?: () => Promise<void>, initiallyOpen = true) {
  const client = new RQ.QueryClient({ defaultOptions: { queries: { retry: false } } });
  return rtl.render(<RQ.QueryClientProvider client={client}><Host context={context} onPaid={onPaid} initiallyOpen={initiallyOpen} /></RQ.QueryClientProvider>);
}

describe('catalog top-up', () => {
  test('store top-up shows the currency art and keeps usage terms available', () => {
    const view = renderSheet({ kind: 'store' });
    expect(view.container.querySelector('img[src*="mu-gem-clay"]')).toBeTruthy();
    const terms = view.getByText('รายละเอียดการใช้มู').closest('details')!;
    expect(terms.open).toBe(false);
    rtl.fireEvent.click(view.getByText('รายละเอียดการใช้มู'));
    expect(terms.open).toBe(true);
    expect(view.getByText('มูใช้ซื้อสินค้าในสายมู.com แลกเป็นเงินสดไม่ได้')).toBeTruthy();
  });

  test('a 402 exchange opens the top-up with the recommended catalog offer', async () => {
    const calls = mockApi((call) => {
      if (call.url.endsWith('/api/shop/products/heart_ticket')) return { product: { id: 'heart_ticket', type: 'feature_credit', featureId: 'compat_unlock', name: 'ตั๋วรู้ใจ', description: 'ตั๋วสำหรับเปิดคำอ่านดวงคู่', imageKey: 'heart-knowing', offers: [{ ...offer, id: 'heart_ticket_1', label: '1 ใบ', quantity: 1, bonusQuantity: 0, units: 1, priceMoo: 49, badges: [] }, offer] } };
      if (call.url.endsWith('/api/wallet')) return wallet;
      if (call.url.endsWith('/api/shop/purchases')) return new Refusal(402, { error: 'insufficient_balance', balance: 20 });
      return {};
    });
    const client = new RQ.QueryClient({ defaultOptions: { queries: { retry: false } } });
    const view = rtl.render(<RQ.QueryClientProvider client={client}><MiniShopDialog userId={USER_ID} open onOpenChange={() => {}} productId="heart_ticket" entry="shop" onPurchased={() => {}} /></RQ.QueryClientProvider>);
    expect((await view.findByRole('radio', { name: /3 ใบ 99 มู/ })).getAttribute('aria-checked')).toBe('true');
    expect(view.queryByText('มูคืออะไร?')).toBeNull();
    rtl.fireEvent.click(view.getByRole('button', { name: 'ซื้อด้วย 99 มู' }));
    expect(await view.findByText('ยอดไม่พอ มี 20 มู ต้องใช้ 99 มู')).toBeTruthy();
    expect(calls.find((call) => call.url.endsWith('/api/shop/purchases'))?.body).toMatchObject({ offerId: offer.id, expectedPriceMoo: 99 });
    view.rerender(<RQ.QueryClientProvider client={client}><MiniShopDialog userId="user-b" open onOpenChange={() => {}} productId="heart_ticket" entry="shop" onPurchased={() => {}} /></RQ.QueryClientProvider>);
    expect(view.queryByText('ยอดไม่พอ มี 20 มู ต้องใช้ 99 มู')).toBeNull();
  });

  test('resumes a paid order until its catalog fulfilment is complete', async () => {
    writePendingOrder(USER_ID, { orderId: 'o1', packId: 'p100', productId: 'heart_ticket', offer });
    let reads = 0;
    mockApi((call) => {
      if (call.url.endsWith('/api/wallet/orders/o1')) return order('paid', ++reads < 3 ? null : 'done');
      return wallet;
    });
    let completed = 0;
    const view = renderSheet({ kind: 'catalog', productId: 'heart_ticket', offer }, async () => { completed++; }, false);
    expect(await view.findByText('เติมมูสำเร็จ กำลังแลกตั๋ว')).toBeTruthy();
    expect(completed).toBe(0);
    await rtl.waitFor(() => expect(completed).toBe(1));
    expect(window.localStorage.getItem(PENDING_ORDER_KEY)).toBeNull();
  });

  test('shows the shortfall and the two packs that can cover it', () => {
    const view = renderSheet({ kind: 'catalog', productId: 'heart_ticket', offer, unlockRef: ROW });
    const radios = view.getAllByRole('radio', { hidden: true });
    expect(radios).toHaveLength(2);
    expect(radios[0].textContent).toContain('฿99');
    expect(radios[1].textContent).toContain('฿149');
    expect(view.getByText('ยอดไม่พอ มี 20 มู ต้องใช้ 99 มู')).toBeTruthy();
  });

  test('never exposes another account pending order through the current account key', () => {
    writePendingOrder(USER_ID, { orderId: 'owned-by-a', packId: 'p100', productId: 'heart_ticket', offer });
    const userBKey = pendingOrderKey('user-b');
    window.localStorage.setItem(userBKey, JSON.stringify({
      version: 2,
      userId: USER_ID,
      orderId: 'owned-by-a',
      packId: 'p100',
      productId: 'heart_ticket',
      offer,
    }));

    expect(readPendingOrder('user-b')).toBeNull();
    expect(window.localStorage.getItem(userBKey)).toBeNull();
    expect(readPendingOrder(USER_ID)?.orderId).toBe('owned-by-a');
  });

  test('keeps a live checkout usable when browser persistence is unavailable', () => {
    const storagePrototype = Object.getPrototypeOf(window.localStorage) as Storage;
    const originalSetItem = storagePrototype.setItem;
    storagePrototype.setItem = () => { throw new Error('storage blocked'); };
    try {
      expect(() => writePendingOrder(USER_ID, { orderId: 'memory-only', packId: 'p100' })).not.toThrow();
    } finally {
      storagePrototype.setItem = originalSetItem;
    }
  });

  test('checkout sends the offer and unlock ref, and QR replacement keeps them', async () => {
    let count = 0;
    const calls = mockApi((call) => call.url.endsWith('/api/wallet/checkout') ? qr(`o${++count}`, count === 1 ? 1_200 : 60_000) : order('pending'));
    const view = renderSheet({ kind: 'catalog', productId: 'heart_ticket', offer, unlockRef: ROW });
    rtl.fireEvent.click(view.getByText('จ่าย ฿99 ด้วย PromptPay'));
    expect(await view.findByText(/สแกนด้วยแอปธนาคาร/)).toBeTruthy();
    expect(view.getByText('ชำระ ฿99')).toBeTruthy();
    expect(view.getByText('จะได้รับ 99 มู')).toBeTruthy();
    expect(view.getByText('จ่ายแล้ว แต่ยังไม่เห็นยอด?')).toBeTruthy();
    expect(view.getByRole('img', { name: 'พร้อมเพย์ PromptPay' }).getAttribute('src')).toContain('promptpay-logo.webp');
    expect(calls.find((call) => call.method === 'POST')?.body).toEqual({ packId: 'p100', offer: { offerId: offer.id, expectedPriceMoo: 99 }, unlockRef: ROW });
    expect(JSON.parse(window.localStorage.getItem(PENDING_ORDER_KEY)!).orderId).toBe('o1');
    rtl.fireEvent.click(await view.findByText('ขอ QR ใหม่', {}, { timeout: 4_000 }));
    await rtl.waitFor(() => expect(calls.filter((call) => call.method === 'POST')).toHaveLength(2));
    expect(calls.filter((call) => call.method === 'POST')[1].body).toEqual({ packId: 'p100', offer: { offerId: offer.id, expectedPriceMoo: 99 }, unlockRef: ROW, replaceOrderId: 'o1' });
  });

  test('closing an unpaid QR asks the server to cancel it and forgets an expired order', async () => {
    const calls = mockApi((call) => call.url.endsWith('/api/wallet/checkout') ? qr('o1') : call.url.endsWith('/api/wallet/orders/o1/cancel') ? { orderId: 'o1', status: 'expired' } : order('pending'));
    const view = renderSheet({ kind: 'store' });
    rtl.fireEvent.click(view.getByText('จ่าย ฿99 ด้วย PromptPay'));
    expect(await view.findByText(/สแกนด้วยแอปธนาคาร/)).toBeTruthy();
    rtl.fireEvent.click(view.getByRole('button', { name: 'ปิด' }));
    await rtl.waitFor(() => expect(calls.some((call) => call.method === 'POST' && call.url.endsWith('/api/wallet/orders/o1/cancel'))).toBe(true));
    await rtl.waitFor(() => expect(window.localStorage.getItem(PENDING_ORDER_KEY)).toBeNull());
    expect(view.getByTestId('open').textContent).toBe('false');
  });

  test('a changed price stops before QR and asks for a new decision', async () => {
    mockApi(() => new Refusal(409, { error: 'price_changed', offer: { ...offer, priceMoo: 109 } }));
    const view = renderSheet({ kind: 'catalog', productId: 'heart_ticket', offer });
    rtl.fireEvent.click(view.getByText('จ่าย ฿99 ด้วย PromptPay'));
    expect(await view.findByRole('alert')).toHaveProperty('textContent', 'ราคาเปลี่ยนแล้ว กลับไปตรวจสอบข้อเสนอใหม่');
    expect(view.queryByText(/สแกนด้วยแอปธนาคาร/)).toBeNull();
  });

  test('a paid order with failed exchange keeps มู and retries exchange on an explicit tap', async () => {
    const calls = mockApi((call) => call.url.endsWith('/api/wallet/checkout') ? qr('o1') : call.url.endsWith('/api/shop/purchases') ? { purchaseId: 'p1', offerId: offer.id, priceMoo: 99, units: 3, balance: 20, tickets: { usesLeft: 3, expiring: [] } } : order('paid', 'failed'));
    let completed = 0;
    const view = renderSheet({ kind: 'catalog', productId: 'heart_ticket', offer }, async () => { completed++; });
    rtl.fireEvent.click(view.getByText('จ่าย ฿99 ด้วย PromptPay'));
    expect(await view.findByText('เติมมูเข้ากระเป๋าแล้ว แต่ยังแลกตั๋วไม่สำเร็จ')).toBeTruthy();
    expect(completed).toBe(0);
    rtl.fireEvent.click(view.getByText('แลกตั๋วอีกครั้ง'));
    await rtl.waitFor(() => expect(completed).toBe(1));
    expect(calls.find((call) => call.url.endsWith('/api/shop/purchases'))?.body).toMatchObject({ offerId: offer.id, expectedPriceMoo: 99 });
  });
});
