import { Lock } from 'lucide-react';
import type { CompatibilityV4Teaser, V4DimensionKey } from '@/lib-packages/shared/types/compatibility-v4';
import { REPORT_CARD, SectionHeading, ThaiText } from './report-kit';

interface DimensionBarsProps {
  dimensions: CompatibilityV4Teaser['dimensions'];
  /** The meaning of each score: paid. Absent in the teaser, which shows a lock instead. */
  lines?: Record<V4DimensionKey, string>;
  /** Share view: numbers only, with no lock (the viewer is not the buyer). */
  hideLockNote?: boolean;
}

/** DimensionBars: the four computed scores. Numbers are free; the line under each is paid. */
export function DimensionBars({ dimensions, lines, hideLockNote }: DimensionBarsProps) {
  const locked = !lines && !hideLockNote;
  return (
    <section aria-labelledby="report-dimensions" id="report-dimensions-section" className="scroll-mt-32">
      <SectionHeading
        id="report-dimensions"
        title={`${dimensions.length} มิติของคู่นี้`}
        sub={lines ? 'ตัวเลขจากดวงของคุณสองคน พร้อมความหมายของแต่ละมิติ' : 'ตัวเลขจากดวงของคุณสองคน ยิ่งสูงยิ่งไหลลื่น'}
      />
      <div className={`${REPORT_CARD} mt-4 px-5 py-1.5 sm:px-7`}>
        <ol className="divide-y divide-edge">
          {dimensions.map((dimension) => (
            <li key={dimension.key} className="pb-4 pt-3.5">
              <div className="flex items-center gap-2">
                <span className="font-heading text-[1.0625rem] font-semibold leading-snug text-ink">{dimension.label}</span>
                <span className="ml-auto inline-flex items-center gap-2 font-mono font-medium tabular-nums text-ink">
                  {dimension.score}
                  <span className="sr-only">จาก 100</span>
                  {locked && <Lock className="size-4 text-inkMuted" role="img" aria-label="คำอธิบายล็อกอยู่" />}
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-edge" aria-hidden="true">
                <div className="h-full rounded-full bg-romance" style={{ width: `${dimension.score}%` }} />
              </div>
              {lines && (
                <p className="mt-2.5 font-oracle text-[1.0625rem] font-light leading-[1.75] text-ink">
                  <ThaiText>{lines[dimension.key]}</ThaiText>
                </p>
              )}
            </li>
          ))}
        </ol>
      </div>
      {locked && (
        <p className="mt-3.5 flex items-start gap-2.5 text-sm leading-relaxed text-inkMuted">
          <Lock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          ความหมายของแต่ละมิติ และเหตุผลที่ได้คะแนนนี้ อยู่ในฉบับเต็ม
        </p>
      )}
    </section>
  );
}
