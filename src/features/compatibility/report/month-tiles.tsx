import { ArrowUp } from 'lucide-react';
import type { CompatibilityV4Content } from '@/lib-packages/shared/types/compatibility';
import { MONTH_TONE, monthName, REPORT_CARD, SectionHeading, ThaiText } from './report-kit';

const CALENDAR_STATE = {
  good: 'พร้อมขยับ',
  mixed: 'ไปแบบสบาย ๆ',
  caution: 'ยังไม่ต้องรีบ',
} as const;

interface MonthTilesProps {
  calendar: CompatibilityV4Content['calendar'];
  /** The month the future chapter recommends for the next step. */
  nextStepMonth?: string;
  /** The future chapter's title, which the next-step month links back to. */
  futureTitle: string;
  onJumpToFuture: () => void;
}

/**
 * MonthTiles: the computed 3-month timeline. Each state has a plain-language
 * label, so its meaning never depends on color or an icon alone.
 */
export function MonthTiles({ calendar, nextStepMonth, futureTitle, onJumpToFuture }: MonthTilesProps) {
  return (
    <section id="report-calendar-section" aria-labelledby="report-calendar" className="scroll-mt-32 min-[1120px]:scroll-mt-20">
      <SectionHeading
        id="report-calendar"
        title="จังหวะ 3 เดือนข้างหน้า"
        sub="เลื่อนดูทีละเดือน แล้วเลือกจังหวะที่เข้ากับคุณทั้งคู่"
      />
      <ol
        tabIndex={0}
        aria-label="เลื่อนดูจังหวะความสัมพันธ์ในแต่ละเดือน"
        className="mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-3 pr-4 [-webkit-overflow-scrolling:touch] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright"
      >
        {calendar.map((month) => (
          <li key={month.month} className={`${REPORT_CARD} w-72 shrink-0 snap-start px-[18px] pb-[18px] pt-4 sm:w-80`}>
            <span className="font-heading text-[1.0625rem] font-semibold leading-snug text-ink">{monthName(month.month)}</span>
            <span
              className={`mt-3 inline-flex min-h-7 w-fit items-center whitespace-nowrap rounded-full border border-current/40 bg-current/5 px-2.5 font-heading text-[0.8125rem] font-semibold leading-relaxed ${MONTH_TONE[month.label]}`}
            >
              {CALENDAR_STATE[month.label]}
            </span>
            <p className="mt-3 text-[0.9375rem] leading-[1.7] text-ink">
              <ThaiText>{month.text}</ThaiText>
            </p>
            {month.month === nextStepMonth && (
              <a
                href={`#ch-future`}
                onClick={(event) => {
                  event.preventDefault();
                  onJumpToFuture();
                }}
                className="mt-1 inline-flex min-h-11 items-center gap-1.5 font-heading text-sm font-medium text-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright"
              >
                เหมาะกับก้าวต่อไป ดู ‘{futureTitle}’
                <ArrowUp className="size-4" aria-hidden="true" />
              </a>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
