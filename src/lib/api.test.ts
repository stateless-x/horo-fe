import { afterEach, expect, spyOn, test } from 'bun:test';
import { api } from './api';

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });

test('compatibility request can override the short default without retrying', async () => {
  const deadlines: number[] = [];
  const originalSetTimeout = globalThis.setTimeout;
  const timer = spyOn(globalThis, 'setTimeout').mockImplementation(((handler: TimerHandler, ms?: number) => {
    deadlines.push(ms ?? 0);
    return originalSetTimeout(handler, ms);
  }) as typeof setTimeout);
  let calls = 0;
  globalThis.fetch = (async () => {
    calls++;
    return Response.json({ cached: false }, { headers: { 'X-RateLimit-Remaining': '4' } });
  }) as unknown as typeof fetch;
  let remaining = '';
  try {
    expect(await api.post<{ cached: boolean }>('/api/fortune/compatibility', {}, {
      timeout: 270_000,
      onHeaders: headers => { remaining = headers.get('X-RateLimit-Remaining') ?? ''; },
    })).toEqual({ cached: false });
    expect(calls).toBe(1);
    expect(deadlines).toContain(270_000);
    expect(remaining).toBe('4');
    await api.post('/api/analytics/event', {});
    expect(deadlines).toContain(45_000);
  } finally { timer.mockRestore(); }
});

test('POST deadline remains active while reading the response body', async () => {
  globalThis.fetch = (async (_input: unknown, init?: RequestInit) => ({
    ok: true,
    headers: new Headers(),
    json: () => new Promise((_resolve, reject) => {
      init!.signal!.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
    }),
  })) as typeof fetch;

  await expect(api.post('/api/fortune/compatibility', {}, { timeout: 15 }))
    .rejects.toMatchObject({ status: 408, code: 'TIMEOUT' });
});

test('rate limits keep their status and body and are not retried', async () => {
  let calls = 0;
  globalThis.fetch = (async () => {
    calls++;
    return Response.json({ retryAfter: 60 }, { status: 429 });
  }) as unknown as typeof fetch;
  await expect(api.post('/api/fortune/compatibility', {}))
    .rejects.toMatchObject({ status: 429, body: { retryAfter: 60 } });
  expect(calls).toBe(1);
});
