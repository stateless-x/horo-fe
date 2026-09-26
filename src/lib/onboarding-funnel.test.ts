import { afterEach, beforeEach, expect, test } from 'bun:test';
import { trackOnboardingStep } from './onboarding-funnel';

const originalFetch = globalThis.fetch;
const originalSessionStorage = globalThis.sessionStorage;

function freshSessionStorage(): Storage {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
    clear: () => store.clear(),
    key: () => null,
    get length() {
      return store.size;
    },
  } as Storage;
}

beforeEach(() => {
  globalThis.sessionStorage = freshSessionStorage();
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  globalThis.sessionStorage = originalSessionStorage;
});

test('fires the beacon once per step per session', () => {
  let calls = 0;
  globalThis.fetch = (async () => {
    calls++;
    return new Response(null, { status: 204 });
  }) as unknown as typeof fetch;

  trackOnboardingStep('welcome');
  trackOnboardingStep('welcome');
  trackOnboardingStep('welcome');

  expect(calls).toBe(1);
});

test('a step already marked in sessionStorage from an earlier page life is not resent', () => {
  sessionStorage.setItem('horo-funnel:name', '1');
  let calls = 0;
  globalThis.fetch = (async () => {
    calls++;
    return new Response(null, { status: 204 });
  }) as unknown as typeof fetch;

  trackOnboardingStep('name');

  expect(calls).toBe(0);
});

test('different steps are tracked independently', () => {
  // Distinct, not-yet-used-in-this-file steps: the in-memory backstop Set is
  // process-lifetime by design (it exists for when sessionStorage itself is
  // unavailable), so reusing a step already sent by an earlier test in this
  // file would look like a dedup failure instead of testing independence.
  let calls = 0;
  globalThis.fetch = (async () => {
    calls++;
    return new Response(null, { status: 204 });
  }) as unknown as typeof fetch;

  trackOnboardingStep('teaser_shown');
  trackOnboardingStep('cta_full');
  trackOnboardingStep('cta_compat');

  expect(calls).toBe(3);
});

test('never throws when fetch rejects', () => {
  globalThis.fetch = (async () => {
    throw new Error('network down');
  }) as unknown as typeof fetch;

  expect(() => trackOnboardingStep('gender')).not.toThrow();
});

test('never throws when sessionStorage is unavailable', () => {
  // @ts-expect-error simulating storage being unavailable (private mode)
  globalThis.sessionStorage = undefined;
  globalThis.fetch = (async () => new Response(null, { status: 204 })) as unknown as typeof fetch;

  expect(() => trackOnboardingStep('birthTime')).not.toThrow();
});

test('sends the request as keepalive JSON to the onboarding-step endpoint', async () => {
  let capturedInit: RequestInit | undefined;
  let capturedUrl = '';
  globalThis.fetch = (async (url: string, init?: RequestInit) => {
    capturedUrl = url;
    capturedInit = init;
    return new Response(null, { status: 204 });
  }) as unknown as typeof fetch;

  trackOnboardingStep('mbti');
  // Let the microtask queue flush the fire-and-forget fetch call.
  await new Promise((resolve) => setTimeout(resolve, 0));

  expect(capturedUrl).toContain('/api/analytics/onboarding-step');
  expect(capturedInit?.method).toBe('POST');
  expect(capturedInit?.keepalive).toBe(true);
  expect(capturedInit?.body).toBe(JSON.stringify({ step: 'mbti' }));
});
