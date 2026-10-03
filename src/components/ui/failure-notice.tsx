'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, Copy } from 'lucide-react';

const TOAST_MS = 6_000;
const COPIED_MS = 2_000;

/**
 * The support reference a failed request's body carries (horo-be sends
 * `{ error, reference }` on a ดวงคู่ 500 and logs the same id), or undefined.
 */
export function failureReference(error: unknown): string | undefined {
  const reference = (error as { body?: { reference?: unknown } } | null | undefined)?.body?.reference;
  return typeof reference === 'string' && reference ? reference : undefined;
}

/**
 * A transient notice at the bottom of the screen, portaled to <body> (callers
 * may sit in clipped, transformed boxes). role="alert" announces it.
 */
function FailureToast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  const reduce = useReducedMotion();
  // One timer per toast: parent re-renders must not restart it.
  const dismiss = useRef(onDismiss);
  dismiss.current = onDismiss;
  useEffect(() => {
    const timer = setTimeout(() => dismiss.current(), TOAST_MS);
    return () => clearTimeout(timer);
  }, []);
  return createPortal(
    <div className="pointer-events-none fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 flex justify-center">
      <motion.p
        role="alert"
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-sm rounded-xl border border-edge bg-overlay px-4 py-3 text-center text-sm leading-relaxed text-ink shadow-[0_8px_24px_rgb(0_0_0/0.25)]"
      >
        {message}
      </motion.p>
    </div>,
    document.body,
  );
}

/**
 * "รหัสอ้างอิง 1a2b3c4d" with a copy button for support: shows the first 8
 * characters, copies the full reference.
 */
function ReferenceLine({ id }: { id: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(id);
    } catch (failure) {
      // No clipboard (an in-app browser without permission): the full id is shown to copy by hand.
      console.error('Copying the reference id failed:', failure);
      setState('failed');
      return;
    }
    setState('copied');
    timer.current = setTimeout(() => setState('idle'), COPIED_MS);
  };

  return (
    <p className="flex flex-wrap items-center justify-center gap-x-1 text-xs text-inkMuted">
      <span>
        รหัสอ้างอิง <span className="font-mono tabular-nums text-ink">{id.slice(0, 8)}</span>
      </span>
      <button
        type="button"
        onClick={copy}
        aria-label="คัดลอกรหัสอ้างอิง"
        className="grid size-11 place-items-center rounded-lg text-inkMuted transition-colors hover:bg-edgeSoft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright"
      >
        {state === 'copied' ? <Check className="size-4 text-success" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
      </button>
      <span role="status" className="empty:hidden">
        {state === 'copied' ? 'คัดลอกแล้ว' : ''}
      </span>
      {state === 'failed' && (
        <span className="basis-full select-all break-all font-mono text-ink">{id}</span>
      )}
    </p>
  );
}

interface FailureNoticeProps {
  message: string;
  /** Support reference; without one no reference line is shown. */
  reference?: string;
  /** Bump per failure to show the toast again; 0 shows none. */
  toastKey: number;
  onToastDismiss: () => void;
  /** Styles the inline message (defaults to small danger text). */
  messageClassName?: string;
}

/**
 * A failed request, shown inline (message and รหัสอ้างอิง line) and as a
 * bottom toast, so the notice is seen wherever the page is scrolled.
 */
export function FailureNotice({ message, reference, toastKey, onToastDismiss, messageClassName = 'text-sm leading-relaxed text-danger' }: FailureNoticeProps) {
  return (
    <div className="grid justify-items-center gap-1 text-center">
      <p className={messageClassName}>{message}</p>
      {reference && <ReferenceLine id={reference} />}
      {toastKey > 0 && <FailureToast key={toastKey} message={message} onDismiss={onToastDismiss} />}
    </div>
  );
}
