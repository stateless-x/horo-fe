import { ArrowUp } from 'lucide-react';
import type { CompatibilityV4Content } from '@/lib-packages/shared/types/compatibility';
import { MONTH_TONE, monthName, MoonGlyph, REPORT_CARD, SectionHeading, ThaiText } from './report-kit';

const CALENDAR_STATE = {
  good: 'เหมาะกับการขยับ',
  mixed: 'ค่อย ๆ ไป',
  caution: 'พักจังหวะก่อน',
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
 * MonthTiles: the computed 3-month calendar. Each state is a moon phase and
 * a word, never color alone.
 */
export function MonthTiles({ calendar, nextStepMonth, futureTitle, onJumpToFuture }: MonthTilesProps) {
  return (
    <section id="report-calendar-section" aria-labelledby="report-calendar" className="scroll-mt-32 min-[1120px]:scroll-mt-20">
      <SectionHeading
        id="report-calendar"
        title="จังหวะ 3 เดือนข้างหน้า"
        sub="ดูว่าเดือนไหนน่าลองขยับ และเดือนไหนค่อย ๆ ไปก่อน"
      />
      <ol className="mt-4 grid gap-3 min-[720px]:grid-cols-3">
        {calendar.map((month) => (
          <li key={month.month} className={`${REPORT_CARD} px-[18px] pb-[18px] pt-4`}>
            <div className="flex items-center gap-2.5">
              <MoonGlyph label={month.label} className={`size-6 ${MONTH_TONE[month.label]}`} />
              <span className="font-heading text-[1.0625rem] font-semibold leading-snug text-ink">{monthName(month.month)}</span>
              <span
                className={`ml-auto whitespace-nowrap rounded-full border border-current/40 bg-current/5 px-2.5 font-heading text-[0.8125rem] font-semibold leading-relaxed ${MONTH_TONE[month.label]}`}
              >
                <MoonGlyph label={month.label} className="mr-1 inline-block size-3.5 align-[-0.15em]" />
                {CALENDAR_STATE[month.label]}
              </span>
            </div>
            <p className="mt-2.5 text-[0.9375rem] leading-[1.7] text-ink">
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
