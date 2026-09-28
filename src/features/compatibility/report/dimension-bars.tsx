import type { CompatibilityV4Teaser, V4DimensionKey } from '@/lib-packages/shared/types/compatibility';
import { SectionHeading, ThaiText } from './report-kit';

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
      <div className="mt-4 border-y border-edge px-1 sm:px-2">
        <ol className="divide-y divide-edge">
          {dimensions.map((dimension) => (
            <li key={dimension.key} className="pb-4 pt-3.5">
              <div className="flex items-center gap-2">
                <span className="font-heading text-base font-semibold leading-snug text-ink">{dimension.label}</span>
                <span className="ml-auto font-mono font-medium tabular-nums text-ink">
                  {dimension.score}
                  <span className="sr-only">จาก 100</span>
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-edge" aria-hidden="true">
                <div className="h-full rounded-full bg-romance" style={{ width: `${dimension.score}%` }} />
              </div>
              {lines && (
                <p className="mt-2.5 font-oracle text-base font-light leading-[1.75] text-ink">
                  <ThaiText>{lines[dimension.key]}</ThaiText>
                </p>
              )}
            </li>
          ))}
        </ol>
      </div>
      {locked && (
        <p className="mt-3 text-sm leading-relaxed text-inkMuted">
          ฉบับเต็มอธิบายความหมายและที่มาของแต่ละคะแนน
        </p>
      )}
    </section>
  );
}
