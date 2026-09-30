'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, X } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import { Button } from '@/lib-packages/ui';
import { api, type ApiError } from '@/lib/api';
import type { CheckoutResponse, OrderStatusResponse, PackId, TicketPassId, WalletPack, WalletState } from '@/lib-packages/shared/types/wallet';
import { PackList } from './pack-list';
import { MissingPayment, PayStep, type QrCheckout } from './pay-step';
import { clearPendingOrder, readPendingOrder, writePendingOrder } from './pending-order';
import { ORDER_POLL_MS, fetchOrder, orderQueryKey, useOrderStatus, verifyOrder } from './use-order-status';
import { WALLET_QUERY_KEY } from './use-wallet';
import { STORE_PRESELECT, UNIT, doorPacks, nextPackUp, shortfallLine, topupCopy } from './wallet-copy';

/**
 * Where the sheet was opened. `door`: a locked ดวงคู่ door short of the price;
 * two packs, paid as a one-flow order that unlocks `unlockRef`. `store`: the
 * wallet page; every pack.
 */
export type TopupContext = { kind: 'door'; price: number; unlockRef?: string } | { kind: 'ticket'; price: number; passId: TicketPassId; unlockRef: string } | { kind: 'store' };

type Step =
  | { kind: 'packs' }
  | { kind: 'pay'; packId: PackId; checkout: QrCheckout }
  /** Resumed after a reload: the order is known, its QR is not. */
  | { kind: 'checking'; packId: PackId; orderId: string }
  | { kind: 'paid'; packId: PackId; order: OrderStatusResponse; from: number }
  | { kind: 'failed'; packId: PackId };

type Notice = 'unavailable' | 'email' | 'cap' | 'start';

const EMAIL_SETTINGS_PATH = '/dashboard/settings';

interface PackSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wallet: WalletState;
  context: TopupContext;
  /**
   * Door only: the order is paid and credited; run the unlock. The sheet
   * shows "+49 มู · กำลังเปิดคำตอบ…" until this settles, then closes.
   */
  onPaid?: (order: OrderStatusResponse) => Promise<void>;
  pollMs?: number;
}

/**
 * The เติมมู sheet (monetization T7): pick a pack, pay its PromptPay QR, see
 * the มู land. A native <dialog>: showModal gives the focus trap, Escape and
 * the backdrop; a tap on the backdrop closes it. The pending order survives a
 * reload in localStorage and reopens here in a checking state.
 */
export function PackSheet({ open, onOpenChange, wallet, context, onPaid, pollMs = ORDER_POLL_MS }: PackSheetProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>({ kind: 'packs' });
  const [notice, setNotice] = useState<Notice | null>(null);
  const [busy, setBusy] = useState(false);
  const unlockRef = context.kind === 'store' ? undefined : context.unlockRef;

  const offered =
    context.kind === 'store' ? [...wallet.packs].sort((a, b) => a.priceBaht - b.priceBaht) : doorPacks(wallet.packs, context.price - wallet.balance);
  const preselect = context.kind === 'store' ? STORE_PRESELECT : offered[0]?.id;
  const [picked, setPicked] = useState<PackId | null>(null);
  const selected = offered.find((pack) => pack.id === picked) ?? offered.find((pack) => pack.id === preselect) ?? offered[0];
  const packOf = (id: PackId) => wallet.packs.find((pack) => pack.id === id);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Resume: an order left pending (a reload, the bank app) reopens the sheet
  // that started it: the door with the same unlockRef, or the store.
  useEffect(() => {
    const pending = readPendingOrder();
    if (!pending) return;
    const mine = context.kind === 'store' ? pending.unlockRef === undefined : unlockRef !== undefined && pending.unlockRef === unlockRef;
    if (!mine) return;
    let live = true;
    fetchOrder(pending.orderId).then(
      (order) => {
        if (!live) return;
        if (order.status !== 'pending') {
          clearPendingOrder(order.orderId);
          if (order.status === 'paid') void queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEY });
          return;
        }
        queryClient.setQueryData(orderQueryKey(order.orderId), order);
        setStep({ kind: 'checking', packId: pending.packId, orderId: pending.orderId });
        onOpenChange(true);
      },
      (error: ApiError) => {
        // Not this user's order any more: forget it. Anything else (offline) keeps it for the next visit.
        if (error.status === 404) clearPendingOrder(pending.orderId);
        else console.error('Resuming the pending order failed:', error);
      },
    );
    return () => {
      live = false;
    };
    // Mount only: one resume check per sheet.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** A paid order (the poll, or a 409 already_paid): show the มู landing and refresh the wallet. */
  const markPaid = useCallback(
    (packId: PackId, paid: OrderStatusResponse) => {
      clearPendingOrder(paid.orderId);
      setStep({ kind: 'paid', packId, order: paid, from: wallet.balance });
      void queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEY });
    },
    [wallet.balance, queryClient],
  );

  const orderId = step.kind === 'pay' ? step.checkout.orderId : step.kind === 'checking' ? step.orderId : null;
  const order = useOrderStatus(open ? orderId : null, pollMs).data;
  const current = order && order.orderId === orderId ? order : undefined;

  useEffect(() => {
    if (!current || (step.kind !== 'pay' && step.kind !== 'checking')) return;
    if (current.status === 'pending') return;
    if (current.status === 'paid') {
      markPaid(step.packId, current);
    } else if (current.status === 'failed') {
      clearPendingOrder(current.orderId);
      setStep({ kind: 'failed', packId: step.packId });
    } else {
      // expired (and refunded) stay on the step, which shows ขอ QR ใหม่.
      clearPendingOrder(current.orderId);
    }
  }, [current, step, markPaid]);

  // Door: hand the paid order over once; the sheet stays on "+49 มู · กำลังเปิดคำตอบ…"
  // until the door's unlock settles, then closes on the opened report.
  const onPaidRef = useRef(onPaid);
  useEffect(() => {
    onPaidRef.current = onPaid;
  }, [onPaid]);
  const handedOver = useRef<string | null>(null);
  useEffect(() => {
    if (step.kind !== 'paid' || context.kind !== 'door' || handedOver.current === step.order.orderId) return;
    handedOver.current = step.order.orderId;
    void (async () => {
      await onPaidRef.current?.(step.order);
      setStep({ kind: 'packs' });
      onOpenChange(false);
    })();
  }, [step, context.kind, onOpenChange]);

  /**
   * POST /api/wallet/checkout. `replaceOrderId` ("ขอ QR ใหม่") cancels that
   * pending order's QR first. 409 already_paid: that order (or the row's
   * earlier one) was paid meanwhile, so it takes the paid path. 409
   * order_not_pending: it ended already, so it is forgotten and a fresh
   * checkout runs once.
   */
  const checkout = async (packId: PackId, replaceOrderId?: string) => {
    if (busy) return;
    setBusy(true);
    setNotice(null);
    let replace = replaceOrderId;
    try {
      for (;;) {
        try {
          const response = await api.post<CheckoutResponse>('/api/wallet/checkout', { packId, unlockRef, ticketPassId: context.kind === 'ticket' ? context.passId : undefined, replaceOrderId: replace });
          if (response.payment === 'unavailable') {
            setStep({ kind: 'packs' });
            setNotice('unavailable');
            return;
          }
          writePendingOrder({ orderId: response.orderId, packId, unlockRef });
          setStep({ kind: 'pay', packId, checkout: response });
          return;
        } catch (error) {
          const refused = error as ApiError;
          const code = refused.status === 409 ? refused.body?.error : undefined;
          if (code === 'order_not_pending' && replace) {
            clearPendingOrder(replace);
            replace = undefined;
            continue;
          }
          if (code === 'already_paid') {
            const paidId = paidOrderId(refused) ?? replace;
            if (paidId) {
              markPaid(packId, await fetchOrder(paidId));
              return;
            }
          }
          setStep({ kind: 'packs' });
          setNotice(code === 'email_required' ? 'email' : code === 'balance_cap' ? 'cap' : 'start');
          if (code !== 'email_required' && code !== 'balance_cap') console.error('Checkout failed:', error);
          return;
        }
      }
    } catch (error) {
      // Only the already_paid order read lands here.
      console.error('Reading the paid order failed:', error);
      setStep({ kind: 'packs' });
      setNotice('start');
    } finally {
      setBusy(false);
    }
  };

  const verify = useCallback(() => (orderId ? verifyOrder(queryClient, orderId) : Promise.resolve()), [orderId, queryClient]);
  const verifyOnExpire = useCallback(() => {
    verify().catch((error) => console.error('Order verify at expiry failed:', error));
  }, [verify]);

  const close = () => {
    // Closed while the door's unlock runs: it carries on behind the sheet (handed over once, above).
    onOpenChange(false);
    // A finished step starts over next time; a pending one reopens where it was.
    if (step.kind === 'paid' || step.kind === 'failed') setStep({ kind: 'packs' });
    setNotice(null);
  };

  return (
    <dialog
      ref={ref}
      aria-labelledby="pack-sheet-title"
      onClose={close}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
      className="m-0 mt-auto max-h-[100dvh] w-full max-w-none bg-transparent p-0 text-ink backdrop:bg-ground/70 backdrop:backdrop-blur-sm sm:m-auto sm:max-w-md"
    >
      {open && (
        <div className="max-h-[100dvh] overflow-y-auto rounded-t-2xl border border-edge bg-surface2 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 sm:rounded-2xl">
          <div className="flex items-center justify-between gap-3">
            <h2 id="pack-sheet-title" className="font-heading text-xl font-semibold text-ink">
              เติม{UNIT}
            </h2>
            <button
              type="button"
              onClick={close}
              aria-label={topupCopy.close}
              className="grid size-11 place-items-center rounded-lg text-inkMuted transition-colors hover:bg-edgeSoft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          {step.kind === 'packs' && selected && (
            <>
              <p className="mt-1 text-[0.9375rem] leading-relaxed text-ink">
                {context.kind === 'store' ? topupCopy.balance(wallet.balance) : shortfallLine(wallet.balance, context.price)}
              </p>
              <p className="mb-4 mt-0.5 text-sm leading-relaxed text-inkMuted">{topupCopy.purpose}</p>
              <PackList packs={offered} selected={selected.id} onSelect={setPicked} />
              <Button
                type="button"
                size="lg"
                onClick={() => checkout(selected.id)}
                disabled={busy || notice === 'unavailable'}
                aria-busy={busy}
                className="mt-4 min-h-14 w-full gap-2 font-heading"
              >
                {busy && <Loader2 className="size-5 animate-spin" aria-hidden="true" />}
                {notice === 'unavailable' ? topupCopy.unavailable : topupCopy.pay(selected.priceBaht)}
              </Button>
              <p className="mt-2 text-center text-[0.8125rem] leading-relaxed text-inkMuted">
                {topupCopy.trust.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </p>
              {notice && notice !== 'unavailable' && (
                <p role="alert" className="mt-3 text-sm leading-relaxed text-danger">
                  {notice === 'email' ? topupCopy.emailRequired : notice === 'cap' ? topupCopy.cap(wallet.cap) : topupCopy.startFailed}
                  {notice === 'email' && (
                    <>
                      {' '}
                      <Link href={EMAIL_SETTINGS_PATH} className="text-ink underline decoration-edge underline-offset-4 hover:decoration-ink">
                        {topupCopy.emailLink}
                      </Link>
                    </>
                  )}
                </p>
              )}
            </>
          )}

          {step.kind === 'pay' && (
            <div className="mt-2">
              <PayStep
                key={step.checkout.orderId}
                checkout={step.checkout}
                total={totalOf(packOf(step.packId))}
                serverExpired={current?.status === 'expired'}
                onExpire={verifyOnExpire}
                onNewQr={() => checkout(step.packId, step.checkout.orderId)}
                busy={busy}
                onVerify={verify}
              />
            </div>
          )}

          {step.kind === 'checking' && (
            <div className="mt-4 grid justify-items-center gap-3 text-center">
              {current?.status === 'expired' ? (
                <p className="font-heading text-lg font-semibold text-ink">{topupCopy.expired}</p>
              ) : (
                <p role="status" className="flex items-center gap-2 font-heading text-lg font-semibold text-ink">
                  <Loader2 className="size-5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                  {topupCopy.checking}
                </p>
              )}
              <Button
                type="button"
                variant={current?.status === 'expired' ? 'default' : 'soft'}
                onClick={() => checkout(step.packId, step.orderId)}
                disabled={busy}
                className="min-h-11 font-heading"
              >
                {topupCopy.newQr}
              </Button>
              {current?.status !== 'expired' && <MissingPayment orderId={step.orderId} onVerify={verify} />}
            </div>
          )}

          {step.kind === 'paid' && (
            <PaidStep
              order={step.order}
              from={step.from}
              door={context.kind !== 'store'}
              upsell={context.kind === 'store' ? nextPackUp(wallet.packs, step.packId) : undefined}
              onClose={close}
            />
          )}

          {step.kind === 'failed' && (
            <div className="mt-4 grid justify-items-center gap-3 rounded-xl border border-edge bg-surface px-4 py-8 text-center">
              <p className="font-heading text-lg font-semibold text-ink">{topupCopy.failed}</p>
              <Button type="button" onClick={() => checkout(step.packId)} disabled={busy} aria-busy={busy} className="min-h-11 font-heading">
                {topupCopy.retry}
              </Button>
            </div>
          )}
        </div>
      )}
    </dialog>
  );
}

/** The paid order a 409 already_paid names (`{ error, orderId }`). */
function paidOrderId(error: ApiError): string | undefined {
  const body: Record<string, unknown> | undefined = error.body;
  return typeof body?.orderId === 'string' ? body.orderId : undefined;
}

const totalOf = (pack: { base: number; bonus: number } | undefined) => (pack ? pack.base + pack.bonus : 0);

/** A short count-up from `from` to `to`; the end value at once under reduced motion. */
function useCountUp(from: number, to: number): number {
  const reduce = useReducedMotion();
  const [value, setValue] = useState(reduce ? to : from);
  useEffect(() => {
    if (reduce || from === to) {
      setValue(to);
      return;
    }
    const start = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      const t = Math.min(1, (now - start) / 700);
      setValue(Math.round(from + (to - from) * (1 - (1 - t) ** 3)));
      if (t < 1) frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [from, to, reduce]);
  return value;
}

function PaidStep({
  order,
  from,
  door,
  upsell,
  onClose,
}: {
  order: OrderStatusResponse;
  from: number;
  door: boolean;
  upsell?: WalletPack;
  onClose: () => void;
}) {
  const balance = useCountUp(from, order.balance);
  if (door) {
    return (
      <div className="mt-4 grid justify-items-center gap-2 text-center" role="status">
        <p className="flex items-center gap-2 font-heading text-2xl font-semibold tabular-nums text-ink">
          <Loader2 className="size-5 shrink-0 animate-spin motion-reduce:animate-none" aria-hidden="true" />
          {topupCopy.opening(order.units)}
        </p>
        <p className="text-sm leading-relaxed text-inkMuted">{topupCopy.openingHint}</p>
      </div>
    );
  }
  return (
    <div className="mt-4 grid justify-items-center gap-2 text-center" role="status">
      <p className="font-heading text-4xl font-semibold tabular-nums text-success">{topupCopy.credited(order.units)}</p>
      <p className="text-base tabular-nums text-ink">{topupCopy.newBalance(balance)}</p>
      {upsell && <p className="mt-2 text-sm leading-relaxed text-inkMuted">{topupCopy.upsell(upsell)}</p>}
      <Button type="button" variant="soft" onClick={onClose} className="mt-3 min-h-11 w-full font-heading">
        {topupCopy.close}
      </Button>
    </div>
  );
}
