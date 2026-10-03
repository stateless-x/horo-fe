'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { spaceLatinName } from '@/lib-packages/shared/types/names';

interface UnlockProgressDialogProps {
  open: boolean;
  partnerName: string;
}

const MESSAGE_INTERVAL_MS = 7_000;
const PROGRESS_MESSAGES = [
  (partnerName: string) => spaceLatinName(`กำลังเรียบเรียงคำตอบเฉพาะของคุณกับ${partnerName}`, partnerName),
  () => 'คำอ่านฉบับเต็มยังอยู่ระหว่างจัดทำ',
  () => 'เปิดหน้านี้ไว้ได้เลย ไม่ต้องกดเปิดซ้ำ',
  () => 'ยังทำงานอยู่ เมื่อพร้อมแล้วคำอ่านจะเปิดให้เอง',
];

/** These are waiting messages, not backend milestones or a completion percentage. */
export function unlockProgressMessage(index: number, partnerName: string): string {
  return PROGRESS_MESSAGES[index % PROGRESS_MESSAGES.length](partnerName);
}

/** Protected progress state for the long-running full-report generation. */
export function UnlockProgressDialog({ open, partnerName }: UnlockProgressDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [messageIndex, setMessageIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) {
      setMessageIndex(0);
      return;
    }
    let interval: number | undefined;
    const syncTimer = () => {
      if (document.visibilityState === 'visible' && interval === undefined) {
        interval = window.setInterval(() => setMessageIndex((index) => (index + 1) % PROGRESS_MESSAGES.length), MESSAGE_INTERVAL_MS);
      } else if (document.visibilityState !== 'visible' && interval !== undefined) {
        window.clearInterval(interval);
        interval = undefined;
      }
    };
    syncTimer();
    document.addEventListener('visibilitychange', syncTimer);
    return () => {
      if (interval !== undefined) window.clearInterval(interval);
      document.removeEventListener('visibilitychange', syncTimer);
    };
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
          <p id="unlock-progress-detail" className="mt-2 min-h-14 text-pretty text-base leading-relaxed text-inkMuted">
            {unlockProgressMessage(messageIndex, partnerName)}
          </p>
          <div role="progressbar" aria-label="กำลังสร้างคำอ่าน" className="mt-2 h-1 overflow-hidden rounded-full bg-edgeSoft">
            <motion.span
              className="block h-full w-1/3 rounded-full bg-accentBright"
              animate={reduceMotion ? { x: '0%' } : { x: ['-100%', '300%'] }}
              transition={reduceMotion ? undefined : { duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
          <p className="mt-4 text-sm leading-relaxed text-inkMuted">เปิดหน้านี้ไว้ เมื่อเสร็จแล้วคำอ่านจะเปิดให้เอง</p>
        </div>
      )}
    </dialog>
  );
}
