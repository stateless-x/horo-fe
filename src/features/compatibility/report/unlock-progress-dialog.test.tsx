import { afterAll, afterEach, beforeAll, describe, expect, test } from 'bun:test';
import { GlobalRegistrator } from '@happy-dom/global-registrator';

let rtl: typeof import('@testing-library/react');
let UnlockProgressDialog: typeof import('./unlock-progress-dialog').UnlockProgressDialog;
let unlockProgressMessage: typeof import('./unlock-progress-dialog').unlockProgressMessage;

beforeAll(async () => {
  GlobalRegistrator.register({ url: 'http://localhost:3000' });
  rtl = await import('@testing-library/react');
  ({ UnlockProgressDialog, unlockProgressMessage } = await import('./unlock-progress-dialog'));
});

afterEach(() => rtl.cleanup());
afterAll(async () => {
  await new Promise((resolve) => setTimeout(resolve, 100));
  await GlobalRegistrator.unregister();
});

describe('unlock progress dialog', () => {
  test('cycles honest waiting messages while open and resets after closing', () => {
    const originalSetInterval = window.setInterval;
    const originalClearInterval = window.clearInterval;
    let tick: (() => void) | undefined;
    let cleared = false;
    window.setInterval = ((callback: TimerHandler) => {
      if (typeof callback === 'function') tick = callback as () => void;
      return 42;
    }) as typeof window.setInterval;
    window.clearInterval = ((id: number) => { if (id === 42) cleared = true; }) as typeof window.clearInterval;

    try {
      const view = rtl.render(<UnlockProgressDialog open partnerName="Ice" />);
      expect(view.getByText('กำลังเรียบเรียงคำตอบเฉพาะของคุณกับ Ice')).toBeTruthy();
      expect(view.getByRole('progressbar', { name: 'กำลังสร้างคำอ่าน' }).hasAttribute('aria-valuenow')).toBe(false);
      expect(tick).toBeDefined();
      rtl.act(() => tick?.());
      expect(view.getByText(unlockProgressMessage(1, 'Ice'))).toBeTruthy();
      rtl.act(() => tick?.());
      expect(view.getByText(unlockProgressMessage(2, 'Ice'))).toBeTruthy();
      view.rerender(<UnlockProgressDialog open={false} partnerName="Ice" />);
      expect(cleared).toBe(true);
      view.rerender(<UnlockProgressDialog open partnerName="Ice" />);
      expect(view.getByText(unlockProgressMessage(0, 'Ice'))).toBeTruthy();
    } finally {
      window.setInterval = originalSetInterval;
      window.clearInterval = originalClearInterval;
    }
  });
});
