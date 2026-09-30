import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import type { ReactNode } from 'react';
import { GlobalRegistrator } from '@happy-dom/global-registrator';

/**
 * A missed webhook: our database still says pending, the provider says paid.
 * The poll must find out by asking the provider (`?verify=1`) on its own,
 * without the reader tapping anything or the QR expiring.
 */
let rtl: typeof import('@testing-library/react');
let RQ: typeof import('@tanstack/react-query');
let useOrderStatus: typeof import('./use-order-status').useOrderStatus;
const realFetch = globalThis.fetch;

beforeAll(async () => {
  GlobalRegistrator.register({ url: 'http://localhost:3000' });
  rtl = await import('@testing-library/react');
  RQ = await import('@tanstack/react-query');
  useOrderStatus = (await import('./use-order-status')).useOrderStatus;
});

afterAll(async () => {
  globalThis.fetch = realFetch;
  await GlobalRegistrator.unregister();
});

describe('useOrderStatus with a missed webhook', () => {
  test('plain polls stay pending; the periodic provider check finds the payment', async () => {
    const urls: string[] = [];
    globalThis.fetch = (async (input: RequestInfo | URL) => {
      const url = String(input);
      urls.push(url);
      const status = url.includes('verify=1') ? 'paid' : 'pending';
      return new Response(JSON.stringify({ orderId: 'o1', packId: 'p99', status }), { headers: { 'Content-Type': 'application/json' } });
    }) as typeof fetch;

    const client = new RQ.QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: ReactNode }) => <RQ.QueryClientProvider client={client}>{children}</RQ.QueryClientProvider>;
    const { result } = rtl.renderHook(() => useOrderStatus('o1', 20, 100), { wrapper });

    await rtl.waitFor(() => expect(result.current.data?.status).toBe('paid'), { timeout: 2_000 });
    const plain = urls.filter((url) => !url.includes('verify=1'));
    const verified = urls.filter((url) => url.includes('verify=1'));
    expect(plain.length).toBeGreaterThan(1); // the ordinary database polls ran first
    expect(verified.length).toBe(1); // one provider check was enough; polling stopped once paid
  });
});
