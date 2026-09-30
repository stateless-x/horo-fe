'use client';

import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { spaceLatinName } from '@/lib-packages/shared/types/names';

interface UnlockProgressDialogProps {
  open: boolean;
  partnerName: string;
}

/** Protected progress state for the long-running full-report generation. */
export function UnlockProgressDialog({ open, partnerName }: UnlockProgressDialogProps) {
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
      aria-labelledby="unlock-progress-title"
      aria-describedby="unlock-progress-detail"
      onCancel={(event) => event.preventDefault()}
      className="m-auto w-[min(calc(100%-2rem),28rem)] max-w-md bg-transparent p-0 text-ink backdrop:bg-ground/70 backdrop:backdrop-blur-sm"
    >
      {open && (
        <div className="rounded-2xl border border-edge bg-surface px-6 py-7 text-center shadow-[0_20px_60px_rgb(107_33_168/0.18)] sm:px-8 sm:py-8">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-accent/10 text-accentBright" aria-hidden="true">
            <Loader2 className="size-7 animate-spin motion-reduce:animate-none" />
          </span>
          <h2 id="unlock-progress-title" className="mt-5 text-balance font-heading text-2xl font-semibold leading-snug text-ink">
            กำลังเขียนคำอ่านฉบับเต็ม
          </h2>
          <p id="unlock-progress-detail" className="mt-2 text-pretty text-base leading-relaxed text-inkMuted">
            {spaceLatinName(`กำลังเรียบเรียงคำตอบเฉพาะของคุณกับ${partnerName}`, partnerName)}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-inkMuted">เปิดหน้านี้ไว้ เมื่อเสร็จแล้วคำอ่านจะเปิดให้เอง</p>
        </div>
      )}
    </dialog>
  );
}
