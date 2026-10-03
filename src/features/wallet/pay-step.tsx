'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Download, Loader2 } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { Button } from '@/lib-packages/ui';
import type { CheckoutResponse } from '@/lib-packages/shared/types/wallet';
import { SUPPORT_EMAIL, baht, topupCopy, units } from './wallet-copy';

export type QrCheckout = Extract<CheckoutResponse, { payment: 'qr' }>;

/** Whole seconds until `expiresAt`, ticking once a second, floored at 0. */
function useSecondsLeft(expiresAt: string): number {
  const end = Date.parse(expiresAt);
  const read = () => Math.max(0, Math.ceil((end - Date.now()) / 1000));
  const [left, setLeft] = useState(read);
  useEffect(() => {
    setLeft(read());
    const timer = setInterval(() => {
      const next = read();
      setLeft(next);
      if (next === 0) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `read` depends only on `end`
  }, [end]);
  return left;
}

/** Hands a blob to the browser as a file download. */
function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

interface PayStepProps {
  checkout: QrCheckout;
  /** มู the pack credits (base + bonus), for "฿99 · 109 มู". */
  total: number;
  /** The server already reports the order expired (a clock ahead of ours). */
  serverExpired: boolean;
  /** Runs once when the countdown reaches zero: the verify call. */
  onExpire: () => void;
  onNewQr: () => void;
  busy: boolean;
  onVerify: () => Promise<void>;
}

/**
 * The PromptPay QR with its amount and countdown. On a phone the QR is large
 * with a save button and the save-then-scan hint (the bank app is on the same
 * phone); from sm up, the QR alone. At zero the QR gives way to one "ขอ QR ใหม่".
 */
export function PayStep({ checkout, total, serverExpired, onExpire, onNewQr, busy, onVerify }: PayStepProps) {
  const left = useSecondsLeft(checkout.expiresAt);
  const expired = left === 0 || serverExpired;
  const canvas = useRef<HTMLCanvasElement>(null);
  const [saveFailed, setSaveFailed] = useState(false);
  const expireFired = useRef(false);

  useEffect(() => {
    if (left !== 0 || expireFired.current) return;
    expireFired.current = true;
    onExpire();
  }, [left, onExpire]);

  /** Runs on the tap only: iOS allows a download from a user gesture. */
  const save = async () => {
    setSaveFailed(false);
    try {
      const blob = checkout.qr.pngUrl
        ? await fetch(checkout.qr.pngUrl).then((response) => {
            if (!response.ok) throw new Error(`QR image ${response.status}`);
            return response.blob();
          })
        : await new Promise<Blob | null>((resolve) => (canvas.current ? canvas.current.toBlob(resolve, 'image/png') : resolve(null)));
      if (!blob) throw new Error('QR canvas gave no image');
      download(blob, `horo-promptpay-${checkout.orderId.slice(0, 8)}.png`);
    } catch (error) {
      console.error('Saving the QR failed:', error);
      setSaveFailed(true);
    }
  };

  return (
    <div className="grid justify-items-center gap-3 text-center">
      <div>
        <p className="font-heading text-2xl font-semibold tabular-nums text-ink">ชำระ {baht(checkout.amountBaht)}</p>
        <p className="mt-0.5 text-sm text-inkMuted">จะได้รับ {units(total)}</p>
      </div>

      {expired ? (
        <div className="grid w-full justify-items-center gap-3 rounded-xl border border-edge bg-surface px-4 py-8">
          <p className="font-heading text-lg font-semibold text-ink">{topupCopy.expired}</p>
          <Button type="button" onClick={onNewQr} disabled={busy} aria-busy={busy} className="min-h-11 gap-2 font-heading">
            {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {topupCopy.newQr}
          </Button>
        </div>
      ) : (
        <>
          <div className="w-full max-w-[280px] rounded-2xl bg-[var(--promptpay-blue)] p-3 text-white shadow-[0_14px_32px_rgb(0_61_102/0.18)]">
            <div className="mb-3 flex justify-center">
              <div className="rounded-lg bg-white px-2.5 py-1.5">
                <Image src="/images/payments/promptpay-logo.webp" alt="พร้อมเพย์ PromptPay" width={400} height={134} className="h-auto w-[128px]" />
              </div>
            </div>
            <div className="overflow-hidden rounded-xl bg-white p-2">
              {checkout.qr.pngUrl ? (
                // A provider image: next/image would need its host allow-listed for no gain.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={checkout.qr.pngUrl} alt={`QR PromptPay ${topupCopy.amount(checkout.amountBaht, total)}`} className="aspect-square w-full" />
              ) : (
                <QRCodeCanvas
                  ref={canvas}
                  value={checkout.qr.data}
                  size={512}
                  marginSize={4}
                  role="img"
                  aria-label={`QR PromptPay ${topupCopy.amount(checkout.amountBaht, total)}`}
                  style={{ width: '100%', height: 'auto' }}
                />
              )}
            </div>
            <p className="mt-3 font-heading text-sm font-semibold">สแกนด้วยแอปธนาคาร</p>
            <p className="mt-0.5 text-xs text-white/85">ตรวจสอบยอดก่อนยืนยัน</p>
          </div>
          <p className="font-mono text-sm tabular-nums text-inkMuted">{topupCopy.countdown(left)}</p>
          <div className="grid w-full gap-2 sm:hidden">
            <Button type="button" variant="soft" onClick={save} className="min-h-12 w-full gap-2 font-heading">
              <Download className="size-4" aria-hidden="true" />
              {topupCopy.save}
            </Button>
            <p className="text-sm leading-relaxed text-inkMuted">{topupCopy.saveHint}</p>
            {saveFailed && (
              <p role="alert" className="text-sm leading-relaxed text-danger">
                {topupCopy.saveFailed}
              </p>
            )}
          </div>
          <p className="flex items-center gap-2 text-sm text-inkMuted" role="status">
            <Loader2 className="size-3.5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
            {topupCopy.waiting}
          </p>
        </>
      )}

      <MissingPayment orderId={checkout.orderId} onVerify={onVerify} />
    </div>
  );
}

/**
 * "ไม่เห็นยอด?": asks the provider now; if the order is still pending after
 * that, shows the short order id and where to send it.
 */
export function MissingPayment({ orderId, onVerify }: { orderId: string; onVerify: () => Promise<void> }) {
  const [state, setState] = useState<'idle' | 'checking' | 'asked' | 'error'>('idle');

  const ask = async () => {
    setState('checking');
    try {
      await onVerify();
      setState('asked');
    } catch (error) {
      console.error('Order verify failed:', error);
      setState('error');
    }
  };

  const ref = topupCopy.orderRef(orderId);
  return (
    <div className="grid w-full justify-items-center gap-1.5">
      <button
        type="button"
        onClick={ask}
        disabled={state === 'checking'}
        className="min-h-11 rounded-lg px-3 text-sm text-ink underline decoration-edge underline-offset-4 transition-colors hover:decoration-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright disabled:opacity-60"
      >
        {state === 'checking' ? topupCopy.checking : topupCopy.missing}
      </button>
      {state === 'error' && <p className="text-sm text-danger">{topupCopy.verifyFailed}</p>}
      {state === 'asked' && (
        <p className="text-pretty text-sm leading-relaxed text-inkMuted">
          {topupCopy.missingHelp}{' '}
          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(ref)}`}
            className="text-ink underline decoration-edge underline-offset-4 hover:decoration-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright"
          >
            {SUPPORT_EMAIL}
          </a>
          <span className="mt-1 block font-mono text-xs text-ink">{ref}</span>
        </p>
      )}
    </div>
  );
}
