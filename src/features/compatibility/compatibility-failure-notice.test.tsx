import { afterAll, afterEach, beforeAll, describe, expect, test } from 'bun:test';
import { GlobalRegistrator } from '@happy-dom/global-registrator';
import type { ApiError } from '@/lib/api';

/**
 * The failure notice on the ดวงคู่ check (form) and the unlock (result page →
 * door), in a DOM (happy-dom, registered for this file only). The DOM
 * libraries load after registration.
 */
let rtl: typeof import('@testing-library/react');
let RQ: typeof import('@tanstack/react-query');
let dashboard: typeof import('./compatibility-dashboard');
let CompatibilityForm: typeof import('./compatibility-form').CompatibilityForm;
let RELATIONSHIP_CONFIG: typeof import('./relationship-config').RELATIONSHIP_CONFIG;
let unlockFailure: typeof import('./compatibility-result-page').unlockFailure;
let door: typeof import('./report/report-door');

beforeAll(async () => {
  GlobalRegistrator.register({ url: 'http://localhost:3000' });
  rtl = await import('@testing-library/react');
  RQ = await import('@tanstack/react-query');
  dashboard = await import('./compatibility-dashboard');
  CompatibilityForm = (await import('./compatibility-form')).CompatibilityForm;
  RELATIONSHIP_CONFIG = (await import('./relationship-config')).RELATIONSHIP_CONFIG;
  unlockFailure = (await import('./compatibility-result-page')).unlockFailure;
  door = await import('./report/report-door');
});

afterEach(() => rtl.cleanup());

afterAll(async () => {
  // Unregister without closing the window: React and react-query, cached for the
  // whole bun run, keep the timers of the window they were first imported under,
  // and a later DOM file (wallet/topup-sheet) would hang on closed ones. The real
  // fix is one process-wide happy-dom preload (bunfig) instead of per-file windows.
  delete (globalThis as { happyDOM?: unknown }).happyDOM;
  await GlobalRegistrator.unregister();
});

const ROW = '11111111-1111-4111-8111-111111111111';

/** An ApiError as lib/api builds it from a non-2xx answer. */
const apiError = (status: number, body?: ApiError['body'] & { reference?: string }) =>
  Object.assign(new Error(`API error ${status}`), { status, body }) as ApiError;
const timeout = () => Object.assign(new Error('Request timed out'), { status: 408, code: 'TIMEOUT' }) as ApiError;

function stubClipboard() {
  const copied: string[] = [];
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText: async (text: string) => void copied.push(text) },
  });
  return copied;
}

describe('teaserFailure (the check)', () => {
  test('a 5xx gets the teaser copy and the server reference, when sent', () => {
    expect(dashboard.teaserFailure(apiError(500, { error: 'server copy', reference: 'a1b2c3d4' }))).toEqual({
      message: 'เขียนดวงคู่ไม่สำเร็จ ลองใหม่ได้เลย',
      reference: 'a1b2c3d4',
    });
    expect(dashboard.teaserFailure(apiError(502))).toEqual({ message: dashboard.TEASER_FAILED, reference: undefined });
  });

  test('a timeout, a rate limit, a bad request or a network error keep their own handling', () => {
    expect(dashboard.teaserFailure(timeout())).toBeNull();
    expect(dashboard.teaserFailure(apiError(429, { error: 'limit' }))).toBeNull();
    expect(dashboard.teaserFailure(apiError(400, { error: 'MBTI ไม่ถูกต้อง' }))).toBeNull();
    expect(dashboard.teaserFailure(new TypeError('Failed to fetch'))).toBeNull();
  });
});

function renderForm(error: string, errorReference: string | undefined, failureToast: number) {
  return rtl.render(
    <CompatibilityForm
      config={RELATIONSHIP_CONFIG.talking}
      relationshipType="talking"
      onRelationshipTypeChange={() => {}}
      partnerName="ต้น"
      onPartnerNameChange={() => {}}
      day="1"
      onDayChange={() => {}}
      month="1"
      onMonthChange={() => {}}
      year="2540"
      onYearChange={() => {}}
      partnerMbti=""
      onPartnerMbtiChange={() => {}}
      currentYear={2569}
      error={error}
      errorReference={errorReference}
      failureToast={failureToast}
      onFailureToastDismiss={() => {}}
      calculating={false}
      isRateLimited={false}
      rateLimitCountdown={0}
      rateLimitInfo={null}
      onCalculate={() => {}}
    />,
  );
}

describe('the form after a failed check', () => {
  test('a 500 with a reference: toast, inline copy, and a reference line that copies it', async () => {
    const copied = stubClipboard();
    const failure = dashboard.teaserFailure(apiError(500, { error: 'ตอนนี้เขียนดวงคู่ไม่สำเร็จ ลองอีกครั้งนะ', reference: 'a1b2c3d4' }))!;
    const view = renderForm(failure.message, failure.reference, 1);

    expect(view.getByRole('alert').textContent).toBe('เขียนดวงคู่ไม่สำเร็จ ลองใหม่ได้เลย');
    expect(view.queryByText(/ยังไม่หักมู/)).toBeNull();
    expect(view.getByText('a1b2c3d4')).toBeTruthy();
    rtl.fireEvent.click(view.getByRole('button', { name: 'คัดลอกรหัสอ้างอิง' }));
    await rtl.waitFor(() => expect(view.getByText('คัดลอกแล้ว')).toBeTruthy());
    expect(copied).toEqual(['a1b2c3d4']);
  });

  test('a 500 without a reference shows no reference line (no made-up id)', () => {
    const failure = dashboard.teaserFailure(apiError(500))!;
    const view = renderForm(failure.message, failure.reference, 1);
    expect(view.getByRole('alert')).toBeTruthy();
    expect(view.queryByText(/รหัสอ้างอิง/)).toBeNull();
  });

  test('any other error stays inline, without a toast', () => {
    const view = renderForm('ใส่ชื่ออีกฝ่ายก่อนนะ', undefined, 0);
    expect(view.getByText('ใส่ชื่ออีกฝ่ายก่อนนะ')).toBeTruthy();
    expect(view.queryByRole('alert')).toBeNull();
  });
});

/** The result page hands the door `unlockFailure(error)`, as handleUnlock does. */
function renderDoor(error: unknown, unlockRef: string | null = ROW) {
  // The wallet read: enough balance, so the button spends.
  globalThis.fetch = (async () =>
    new Response(
      JSON.stringify({
        enabled: true,
        balance: 49,
        cap: 2000,
        packs: [{ id: 'p49', priceBaht: 49, base: 49, bonus: 0, bonusPercent: 0 }],
        prices: { compat_unlock: 49, month_pass: 29, year_reading: 99, wallpaper: 39 },
        ledger: [],
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    )) as unknown as typeof fetch;
  const client = new RQ.QueryClient({ defaultOptions: { queries: { retry: false } } });
  return rtl.render(
    <RQ.QueryClientProvider client={client}>
      <door.ReportDoor
        partnerName="ต้น"
        readingMinutes={11}
        contents={[]}
        full={false}
        unlockRef={unlockRef ?? undefined}
        onJump={() => {}}
        allOpen={false}
        onToggleAll={() => {}}
        onUnlock={() => Promise.reject(unlockFailure(error))}
      />
    </RQ.QueryClientProvider>,
  );
}

describe('the result page unlock failure, through the door', () => {
  test('a 500 with a reference: the no-charge copy and the server reference, not the row id', async () => {
    const copied = stubClipboard();
    const view = renderDoor(apiError(500, { error: 'ตอนนี้เขียนฉบับเต็มไม่สำเร็จ ลองอีกครั้งนะ', reference: 'a1b2c3d4' }));
    rtl.fireEvent.click(await view.findByText('เปิดคำตอบทั้งหมด · 49 มู'));

    expect((await view.findByRole('alert')).textContent).toBe(door.UNLOCK_FAILED);
    expect(view.queryByText(/ลองอีกครั้งนะ/)).toBeNull();
    expect(view.getByText('a1b2c3d4')).toBeTruthy();
    expect(view.queryByText('11111111')).toBeNull();
    rtl.fireEvent.click(view.getByRole('button', { name: 'คัดลอกรหัสอ้างอิง' }));
    await rtl.waitFor(() => expect(copied).toEqual(['a1b2c3d4']));
  });

  test('a 500 without a reference falls back to the row id', async () => {
    const view = renderDoor(apiError(500, { error: 'x' }));
    rtl.fireEvent.click(await view.findByText('เปิดคำตอบทั้งหมด · 49 มู'));
    expect((await view.findByRole('alert')).textContent).toBe(door.UNLOCK_FAILED);
    expect(view.getByText('11111111')).toBeTruthy();
  });

  test('a client timeout passes through handleUnlock: the timeout copy, no charge claim', async () => {
    const view = renderDoor(timeout());
    rtl.fireEvent.click(await view.findByText('เปิดคำตอบทั้งหมด · 49 มู'));
    expect((await view.findByRole('alert')).textContent).toBe(door.UNLOCK_TIMED_OUT);
    expect(view.queryByText(/ยังไม่หักมู/)).toBeNull();
  });

  test('neither a reference nor a row id: no reference line', async () => {
    const view = renderDoor(apiError(500), null);
    rtl.fireEvent.click(await view.findByText('เปิดคำตอบทั้งหมด · 49 มู'));
    await view.findByRole('alert');
    expect(view.queryByText(/รหัสอ้างอิง/)).toBeNull();
  });

  test('a 402 passes through unchanged', () => {
    const refused = apiError(402, { error: 'insufficient_balance' });
    expect(unlockFailure(refused)).toBe(refused);
  });
});
