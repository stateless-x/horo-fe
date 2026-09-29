import { afterAll, afterEach, beforeAll, describe, expect, test } from 'bun:test';
import { GlobalRegistrator } from '@happy-dom/global-registrator';

/** The shared failure notice in a DOM (happy-dom, registered for this file only). */
let rtl: typeof import('@testing-library/react');
let mod: typeof import('./failure-notice');

beforeAll(async () => {
  GlobalRegistrator.register({ url: 'http://localhost:3000' });
  rtl = await import('@testing-library/react');
  mod = await import('./failure-notice');
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

describe('failureReference', () => {
  test('reads a non-empty string reference from the error body, else undefined', () => {
    expect(mod.failureReference({ body: { error: 'x', reference: 'a1b2c3d4' } })).toBe('a1b2c3d4');
    expect(mod.failureReference({ body: { error: 'x' } })).toBeUndefined();
    expect(mod.failureReference({ body: { reference: '' } })).toBeUndefined();
    expect(mod.failureReference({ body: { reference: 42 } })).toBeUndefined();
    expect(mod.failureReference(new Error('no body'))).toBeUndefined();
    expect(mod.failureReference(null)).toBeUndefined();
  });
});

describe('FailureNotice', () => {
  test('shows the message inline and in a toast; the reference line copies the full reference', async () => {
    const copied: string[] = [];
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async (text: string) => void copied.push(text) },
    });
    const reference = 'a1b2c3d4e5f6';
    const view = rtl.render(<mod.FailureNotice message="เขียนดวงคู่ไม่สำเร็จ ลองใหม่ได้เลย" reference={reference} toastKey={1} onToastDismiss={() => {}} />);

    expect(view.getByRole('alert').textContent).toBe('เขียนดวงคู่ไม่สำเร็จ ลองใหม่ได้เลย');
    expect(view.getAllByText('เขียนดวงคู่ไม่สำเร็จ ลองใหม่ได้เลย')).toHaveLength(2);
    expect(view.getByText('a1b2c3d4')).toBeTruthy();

    rtl.fireEvent.click(view.getByRole('button', { name: 'คัดลอกรหัสอ้างอิง' }));
    await rtl.waitFor(() => expect(view.getByText('คัดลอกแล้ว')).toBeTruthy());
    expect(copied).toEqual([reference]);
  });

  test('no reference: no reference line; toastKey 0: no toast', () => {
    const view = rtl.render(<mod.FailureNotice message="ผิดพลาด" toastKey={0} onToastDismiss={() => {}} />);
    expect(view.getByText('ผิดพลาด')).toBeTruthy();
    expect(view.queryByText(/รหัสอ้างอิง/)).toBeNull();
    expect(view.queryByRole('button', { name: 'คัดลอกรหัสอ้างอิง' })).toBeNull();
    expect(view.queryByRole('alert')).toBeNull();
  });
});
