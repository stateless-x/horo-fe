import { ArrowDown, Lock } from 'lucide-react';
import type { CompatibilityV4Teaser, V4ChapterKey } from '@/lib-packages/shared/types/compatibility-v4';
import { REPORT_CARD, SectionHeading, ThaiText } from './report-kit';

interface LockedHintsProps {
  hints: CompatibilityV4Teaser['cover']['lockedHints'];
  partnerName: string;
  chapterNumber: (key: V4ChapterKey) => number;
  /** Full report: each hint becomes a jump link to the chapter that answers it. */
  onJump?: (key: V4ChapterKey) => void;
}

/**
 * LockedHints: three questions about the reader's own life. Locked in the
 * teaser; in the full report they are jump links to their answers.
 */
export function LockedHints({ hints, partnerName, chapterNumber, onJump }: LockedHintsProps) {
  const open = !!onJump;
  return (
    <section aria-labelledby="report-hints">
      <SectionHeading
        id="report-hints"
        title="3 คำถามที่ฉบับเต็มตอบ"
        sub={open ? 'แตะเพื่อไปที่คำตอบในบทนั้นได้เลย' : `เรื่องที่คุณน่าจะเคยเจอกับ${partnerName} คำตอบแต่ละข้ออยู่ในบทของฉบับเต็ม`}
      />
      <ol className={`${REPORT_CARD} mt-4 divide-y divide-edge px-2 py-1`}>
        {hints.map((hint) => {
          const n = chapterNumber(hint.chapter);
          const body = (
            <>
              <span
                className={`grid size-9 place-items-center rounded-full border ${open ? 'border-romance/30 bg-romance/10 text-romanceText' : 'border-edge bg-surface2 text-inkMuted'}`}
                aria-hidden="true"
              >
                {open ? <ArrowDown className="size-4" /> : <Lock className="size-4" />}
              </span>
              <span>
                <span className="block font-medium leading-[1.65] text-ink">
                  <ThaiText>{hint.text}</ThaiText>
                </span>
                <span className={`mt-1 block text-[0.8125rem] leading-normal ${open ? 'font-heading font-semibold text-romanceText' : 'text-inkMuted'}`}>
                  {open ? `คำตอบอยู่ตรงนี้ · บทที่ ${n}` : `คำตอบอยู่ในบทที่ ${n}`}
                </span>
              </span>
            </>
          );
          return (
            <li key={hint.chapter}>
              {open ? (
                <a
                  href={`#ch-${hint.chapter}`}
                  onClick={(event) => {
                    event.preventDefault();
                    onJump(hint.chapter);
                  }}
                  className="grid min-h-11 grid-cols-[36px_minmax(0,1fr)] items-start gap-3 rounded-xl px-3 py-3.5 transition-colors hover:bg-edgeSoft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright"
                >
                  {body}
                </a>
              ) : (
                <div className="grid grid-cols-[36px_minmax(0,1fr)] items-start gap-3 px-3 py-3.5">{body}</div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
