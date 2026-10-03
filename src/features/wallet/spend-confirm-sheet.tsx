'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/lib-packages/ui';
import { CurrencyImage } from '@/components/ui/currency-image';
import { baht, units } from './wallet-copy';

/** Owner copy (2026-09-30): the spend-from-balance confirmation. Pronoun-free, no middle dots. */
export const spendConfirmCopy = {
  title: 'ยืนยันใช้มู',
  balance: 'มูที่มีอยู่',
  spend: 'ใช้ครั้งนี้',
  after: 'เหลือหลังเปิด',
  confirm: (price: number) => `ยืนยัน ใช้ ${units(price)}`,
  cancel: 'ยังไม่ใช้ตอนนี้',
  close: 'ปิด',
  worth: (price: number) => `${units(price)} เท่ากับ ${baht(price)}`,
};

interface SpendConfirmSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  price: number;
  balance: number;
  /** What the มู buys, one sentence: "เปิดคำอ่านฉบับเต็มของคุณกับต้น". */
  purpose: string;
  /** Closes the sheet first, then spends: the caller shows its own progress and failure states. */
  onConfirm: () => void;
}

/**
 * The last step before มู leave the wallet (monetization T21, "Wallet-aware
 * conversion states"): what it buys, the balance before and after, and the
 * money it is worth. Only for a spend from balance; a top-up's QR payment is
 * already the reader's consent. A native <dialog> like PackSheet: showModal
 * gives the focus trap and Escape; a tap on the backdrop cancels.
 */
export function SpendConfirmSheet({ open, onOpenChange, price, balance, purpose, onConfirm }: SpendConfirmSheetProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const close = () => onOpenChange(false);
  const confirm = () => {
    close();
    onConfirm();
  };

  const rows: Array<[string, string]> = [
    [spendConfirmCopy.balance, units(balance)],
    [spendConfirmCopy.spend, `−${units(price)}`],
    [spendConfirmCopy.after, units(balance - price)],
  ];

  return (
    <dialog
      ref={ref}
      aria-labelledby="spend-confirm-title"
      aria-describedby="spend-confirm-purpose"
      onClose={close}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
      className="m-0 mt-auto max-h-[100dvh] w-full max-w-none bg-transparent p-0 text-ink backdrop:bg-ground/70 backdrop:backdrop-blur-sm sm:m-auto sm:max-w-md"
    >
      {open && (
        <div className="max-h-[100dvh] overflow-y-auto rounded-t-2xl border border-edge bg-surface2 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 sm:rounded-2xl">
          <div className="flex items-center justify-between gap-3">
            <h2 id="spend-confirm-title" className="font-heading text-xl font-semibold text-ink">
              {spendConfirmCopy.title}
            </h2>
            <button
              type="button"
              onClick={close}
              aria-label={spendConfirmCopy.close}
              className="grid size-11 place-items-center rounded-lg text-inkMuted transition-colors hover:bg-edgeSoft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <p id="spend-confirm-purpose" className="mt-2 text-pretty text-base leading-relaxed text-inkMuted">
            {purpose}
          </p>

          <dl className="mt-4 divide-y divide-edge rounded-xl border border-edge bg-surface px-4">
            {rows.map(([label, value], i) => (
              <div key={label} className="flex min-h-12 items-center justify-between gap-3 py-2.5">
                <dt className="text-sm text-inkMuted">{label}</dt>
                <dd className={`font-heading tabular-nums ${i === rows.length - 1 ? 'text-lg font-semibold text-ink' : 'text-base text-ink'}`}>{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-2 px-1 text-center text-sm text-inkMuted">{spendConfirmCopy.worth(price)}</p>

          <div className="mt-5 grid gap-2.5">
            <Button type="button" size="lg" onClick={confirm} className="h-auto min-h-14 w-full gap-2.5 whitespace-normal px-5 py-3 font-heading">
              <CurrencyImage size={24} />
              {spendConfirmCopy.confirm(price)}
            </Button>
            <Button type="button" variant="soft" onClick={close} className="min-h-11 w-full font-heading">
              {spendConfirmCopy.cancel}
            </Button>
          </div>
        </div>
      )}
    </dialog>
  );
}
