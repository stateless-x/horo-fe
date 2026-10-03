'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/lib-packages/ui';

type CopyState = 'idle' | 'copied' | 'failed';

/** Copies with the async clipboard API, else the textarea fallback that older in-app browsers need. */
async function copyText(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Denied (e.g. an in-app browser without permission): try the fallback below.
    }
  }
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none';
  document.body.appendChild(area);
  area.select();
  const ok = document.execCommand('copy');
  area.remove();
  return ok;
}

/**
 * "คัดลอก" for a ready-to-send line. On success it says so for 2 s; when
 * the browser refuses, it selects the text so a long-press copies it, and
 * says that instead of pretending.
 */
export function CopyButton({ text, targetId }: { text: string; targetId: string }) {
  const [state, setState] = useState<CopyState>('idle');
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const onCopy = async () => {
    const ok = await copyText(text);
    if (!ok) {
      const target = document.getElementById(targetId);
      if (target) {
        const range = document.createRange();
        range.selectNodeContents(target);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }
    setState(ok ? 'copied' : 'failed');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState('idle'), ok ? 2200 : 4000);
  };

  return (
    <>
      <Button
        type="button"
        variant="soft"
        onClick={onCopy}
        className={`h-11 shrink-0 gap-1.5 px-3 font-heading ${state === 'copied' ? 'border-success/40 text-success' : ''}`}
      >
        {state === 'copied' ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
        {state === 'copied' ? 'คัดลอกแล้ว' : 'คัดลอก'}
      </Button>
      <span className="sr-only" role="status" aria-live="polite">
        {state === 'copied' ? 'คัดลอกประโยคแล้ว' : state === 'failed' ? 'คัดลอกอัตโนมัติไม่ได้ เลือกข้อความไว้ให้แล้ว กดค้างเพื่อคัดลอก' : ''}
      </span>
      {state === 'failed' && <p className="basis-full text-sm text-inkMuted">คัดลอกอัตโนมัติไม่ได้ เลือกข้อความไว้ให้แล้ว กดค้างเพื่อคัดลอก</p>}
    </>
  );
}

/** A ready-to-send line as a chat bubble with its copy button. */
export function CopyLine({ id, text }: { id: string; text: string }) {
  return (
    <div className="flex flex-col items-start gap-1.5 sm:flex-row sm:flex-wrap sm:items-end sm:gap-2.5">
      <p
        id={id}
        className="rounded-[16px_16px_16px_4px] border border-edge bg-surface2 px-3.5 py-2.5 font-oracle text-[1.0625rem] leading-[1.65] text-ink sm:flex-1"
      >
        {text}
      </p>
      <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
        <CopyButton text={text} targetId={id} />
      </div>
    </div>
  );
}
