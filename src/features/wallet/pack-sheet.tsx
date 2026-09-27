'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { WalletPack } from '@/lib-packages/shared/types/wallet';
import { PackList } from './pack-list';
import { UNIT, stardustWithBaht } from './wallet-copy';

interface PackSheetProps {
  open: boolean;
  onClose: () => void;
  packs: WalletPack[];
  /** Set when a spend was refused: the line above the packs says what is missing. */
  shortfall?: { balance: number; price: number };
}

/**
 * Bottom sheet listing the ละอองดาว packs. A native <dialog>: showModal gives
 * the focus trap, Escape and the backdrop; a tap on the backdrop closes it.
 */
export function PackSheet({ open, onClose, packs, shortfall }: PackSheetProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="pack-sheet-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="m-0 mt-auto w-full max-w-none bg-transparent p-0 text-ink backdrop:bg-ground/70 backdrop:backdrop-blur-sm sm:m-auto sm:max-w-md"
    >
      <div className="rounded-t-2xl border border-edge bg-surface2 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 sm:rounded-2xl">
        <div className="flex items-center justify-between gap-3">
          <h2 id="pack-sheet-title" className="font-heading text-xl font-semibold text-ink">
            เติม{UNIT}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิด"
            className="grid size-11 place-items-center rounded-lg text-inkMuted transition-colors hover:bg-edgeSoft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <p className="mb-4 mt-1 text-[0.9375rem] leading-relaxed text-inkMuted">
          {shortfall
            ? `${UNIT}ไม่พอ มี ${shortfall.balance} ต้องใช้ ${stardustWithBaht(shortfall.price)}`
            : `1 ${UNIT} = ฿1 · ใช้ได้ในสายมูเท่านั้น`}
        </p>
        <PackList packs={packs} />
      </div>
    </dialog>
  );
}
