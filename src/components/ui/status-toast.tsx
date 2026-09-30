'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2 } from 'lucide-react';

const TOAST_MS = 5_000;

interface StatusToastProps {
  message: string;
  onDismiss: () => void;
}

/** A transient positive status, portaled above long report content. */
export function StatusToast({ message, onDismiss }: StatusToastProps) {
  const dismiss = useRef(onDismiss);
  dismiss.current = onDismiss;

  useEffect(() => {
    const timer = setTimeout(() => dismiss.current(), TOAST_MS);
    return () => clearTimeout(timer);
  }, []);

  return createPortal(
    <div className="pointer-events-none fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-[60] flex justify-center">
      <p
        role="status"
        aria-live="polite"
        className="flex max-w-sm items-center gap-2 rounded-xl border border-edge bg-overlay px-4 py-3 text-center text-sm leading-relaxed text-ink shadow-[0_8px_24px_rgb(0_0_0/0.25)]"
      >
        <CheckCircle2 className="size-4 shrink-0 text-success" aria-hidden="true" />
        {message}
      </p>
    </div>,
    document.body,
  );
}
