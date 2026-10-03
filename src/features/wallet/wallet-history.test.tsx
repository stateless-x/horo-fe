import { afterAll, afterEach, beforeAll, describe, expect, test } from 'bun:test';
import { GlobalRegistrator } from '@happy-dom/global-registrator';
import type { LedgerEntry, WalletHistoryResponse } from '@/lib-packages/shared/types/wallet';

/** The paginated history on /dashboard/wallet in a DOM (happy-dom for this file only; DOM libraries load after registration). */
let rtl: typeof import('@testing-library/react');
let RQ: typeof import('@tanstack/react-query');
let WalletHistory: typeof import('./wallet-history').WalletHistory;
let WALLET_QUERY_KEY: typeof import('./use-wallet').WALLET_QUERY_KEY;

beforeAll(async () => {
  GlobalRegistrator.register({ url: 'http://localhost:3000' });
  rtl = await import('@testing-library/react');
  RQ = await import('@tanstack/react-query');
  WalletHistory = (await import('./wallet-history')).WalletHistory;
  WALLET_QUERY_KEY = (await import('./use-wallet')).WALLET_QUERY_KEY;
});

afterEach(() => rtl.cleanup());

afterAll(async () => {
  // Unregister without closing the window: React and react-query stay cached for
  // the whole bun run with this window's timers, and a later DOM file
  // (topup-sheet) would hang on closed ones. Same as failure-notice.test.tsx.
  delete (globalThis as { happyDOM?: unknown }).happyDOM;
  await GlobalRegistrator.unregister();
});

const row = (n: number): LedgerEntry => ({
  id: `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`,
  delta: n + 1,
  kind: 'admin_adjust',
  productId: null,
  refId: null,
  refName: null,
  note: null,
  expiresAt: null,
  createdAt: new Date(Date.UTC(2026, 8, 1) - n * 60_000).toISOString(),
  by: 'horo',
  amountBaht: null,
});

/** Serves GET /api/wallet/history from `pages`, keyed by "kind|cursor"; records each request's query. */
function mockHistory(pages: Record<string, WalletHistoryResponse>) {
  const calls: URLSearchParams[] = [];
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = new URL(String(input));
    expect(url.pathname).toBe('/api/wallet/history');
    calls.push(url.searchParams);
    const key = `${url.searchParams.get('kind') ?? ''}|${url.searchParams.get('cursor') ?? ''}`;
    const page = pages[key];
    if (!page) throw new Error(`no mocked page for ${key}`);
    return new Response(JSON.stringify(page), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }) as typeof fetch;
  return calls;
}

function mount() {
  const client = new RQ.QueryClient({ defaultOptions: { queries: { retry: false } } });
  const view = rtl.render(
    <RQ.QueryClientProvider client={client}>
      <WalletHistory />
    </RQ.QueryClientProvider>,
  );
  return { client, view };
}

const firstPage = Array.from({ length: 20 }, (_, i) => row(i + 1));
const CURSOR = '11111111-1111-4111-8111-111111111111';

describe('WalletHistory', () => {
  test('first page, then ดูเพิ่ม sends the cursor and appends; ครบแล้ว at the end', async () => {
    const calls = mockHistory({
      '|': { entries: firstPage, nextCursor: CURSOR },
      [`|${CURSOR}`]: { entries: [row(21), row(22)], nextCursor: null },
    });
    const { view } = mount();
    await rtl.waitFor(() => expect(view.getAllByRole('listitem')).toHaveLength(20));
    expect(calls[0].get('limit')).toBe('20');
    expect(calls[0].has('cursor')).toBe(false);
    expect(calls[0].has('kind')).toBe(false);
    expect(view.queryByText('ครบแล้ว')).toBeNull();

    rtl.fireEvent.click(view.getByRole('button', { name: 'ดูเพิ่ม' }));
    await rtl.waitFor(() => expect(view.getAllByRole('listitem')).toHaveLength(22));
    expect(calls[1].get('cursor')).toBe(CURSOR);
    // Each row has a distinct delta, so distinct text means no row was repeated.
    const ids = view.getAllByRole('listitem').map((li) => li.textContent);
    expect(new Set(ids).size).toBe(22);
    expect(view.getByText('ครบแล้ว')).toBeTruthy();
    expect(view.queryByRole('button', { name: 'ดูเพิ่ม' })).toBeNull();
  });

  test('a filter sends its kind and starts again at page one', async () => {
    const calls = mockHistory({
      '|': { entries: firstPage, nextCursor: CURSOR },
      [`|${CURSOR}`]: { entries: [row(21)], nextCursor: null },
      'topup|': { entries: [row(30)], nextCursor: null },
    });
    const { view } = mount();
    await rtl.waitFor(() => expect(view.getAllByRole('listitem')).toHaveLength(20));
    rtl.fireEvent.click(view.getByRole('button', { name: 'ดูเพิ่ม' }));
    await rtl.waitFor(() => expect(view.getAllByRole('listitem')).toHaveLength(21));

    rtl.fireEvent.click(view.getByRole('button', { name: 'เติมมู' }));
    await rtl.waitFor(() => expect(view.getAllByRole('listitem')).toHaveLength(1));
    const topup = calls.at(-1)!;
    expect(topup.get('kind')).toBe('topup');
    expect(topup.has('cursor')).toBe(false);
    expect(view.getByRole('button', { name: 'เติมมู' }).getAttribute('aria-pressed')).toBe('true');

    // Back to ทั้งหมด: its loaded pages come from cache, with no new request.
    const before = calls.length;
    rtl.fireEvent.click(view.getByRole('button', { name: 'ทั้งหมด' }));
    await rtl.waitFor(() => expect(view.getAllByRole('listitem')).toHaveLength(21));
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(calls.length).toBe(before);
  });

  test('mounting fetches only the active filter: one request, no kind', async () => {
    const calls = mockHistory({ '|': { entries: firstPage, nextCursor: CURSOR } });
    const { view } = mount();
    await rtl.waitFor(() => expect(view.getAllByRole('listitem')).toHaveLength(20));
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(calls).toHaveLength(1);
    expect(calls[0].has('kind')).toBe(false);
    const pills = view.getAllByRole('button', { pressed: false }).map((b) => b.textContent);
    expect(pills).toEqual(['เติมมู', 'ใช้มู', 'คืนยอด', 'ปรับยอด']);
  });

  test('no rows: the empty state, no ดูเพิ่ม and no ครบแล้ว', async () => {
    mockHistory({ 'refund|': { entries: [], nextCursor: null }, '|': { entries: [], nextCursor: null } });
    const { view } = mount();
    await rtl.waitFor(() => expect(view.getByText('ยังไม่มีรายการ')).toBeTruthy());
    expect(view.queryByText('ครบแล้ว')).toBeNull();
    expect(view.queryByRole('button', { name: 'ดูเพิ่ม' })).toBeNull();
  });

  test('a wallet invalidation (after a top-up or an unlock) refetches the history', async () => {
    let newest: LedgerEntry[] = [row(1)];
    const calls: string[] = [];
    globalThis.fetch = (async (input: RequestInfo | URL) => {
      calls.push(String(input));
      return new Response(JSON.stringify({ entries: newest, nextCursor: null }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }) as typeof fetch;
    const { client, view } = mount();
    await rtl.waitFor(() => expect(view.getAllByRole('listitem')).toHaveLength(1));
    newest = [row(0), row(1)];
    await rtl.act(() => client.invalidateQueries({ queryKey: WALLET_QUERY_KEY }));
    await rtl.waitFor(() => expect(view.getAllByRole('listitem')).toHaveLength(2));
    expect(calls).toHaveLength(2);
  });
});
