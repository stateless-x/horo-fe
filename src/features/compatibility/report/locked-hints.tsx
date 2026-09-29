import { ChevronRight } from 'lucide-react';
import type { CompatibilityV4Teaser, V4ChapterKey } from '@/lib-packages/shared/types/compatibility';
import { spaceLatinName } from '@/lib-packages/shared/types/names';
import { SectionHeading, ThaiText } from './report-kit';

interface LockedHintsProps {
  hints: CompatibilityV4Teaser['cover']['lockedHints'];
  partnerName: string;
  /** The report section that answers a hint's chapter, named on each hint. */
  sectionLabel: (key: V4ChapterKey) => string;
  /** Full report: each hint becomes a jump link to the chapter that answers it. */
  onJump?: (key: V4ChapterKey) => void;
}

/**
 * LockedHints: three questions about the reader's own life. Locked in the
 * teaser; in the full report they are jump links to their answers.
 */
export function LockedHints({ hints, partnerName, sectionLabel, onJump }: LockedHintsProps) {
  const open = !!onJump;
  return (
    <section aria-labelledby="report-hints">
      <SectionHeading
        id="report-hints"
        title={open ? 'เรื่องที่อยากเข้าใจมากขึ้น' : 'มีเรื่องไหนที่คุณสงสัยอยู่ไหม'}
        sub={open ? 'แตะเพื่อไปที่คำตอบได้เลย' : spaceLatinName(`เรื่องที่คุณน่าจะเคยเจอกับ${partnerName}`, partnerName)}
      />
      <ol className="mt-4 divide-y divide-edge border-y border-edge">
        {hints.map((hint) => {
          const section = sectionLabel(hint.chapter);
          const question = (
            <span>
              <span className="block font-medium leading-[1.65] text-ink">
                <ThaiText>{hint.text}</ThaiText>
              </span>
              <span className="mt-1 block text-sm leading-normal text-inkMuted">
                {open ? `ไปที่คำตอบในส่วน ‘${section}’` : `อ่านต่อในฉบับเต็ม · ${section}`}
              </span>
            </span>
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
                  className="grid min-h-14 grid-cols-[minmax(0,1fr)_20px] items-center gap-3 px-1 py-3.5 transition-colors hover:bg-edgeSoft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright"
                >
                  {question}
                  <ChevronRight className="size-4 text-inkMuted" aria-hidden="true" />
                </a>
              ) : (
                <div className="px-1 py-4">{question}</div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
