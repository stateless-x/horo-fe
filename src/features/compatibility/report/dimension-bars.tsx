import { Sparkles } from 'lucide-react';
import type { CompatibilityV4Teaser, V4DimensionKey } from '@/lib-packages/shared/types/compatibility';
import { SectionHeading, ThaiText } from './report-kit';

interface DimensionBarsProps {
  dimensions: CompatibilityV4Teaser['dimensions'];
  /** The meaning of each score: paid. Absent in the teaser, which shows a lock instead. */
  lines?: Record<V4DimensionKey, string>;
  /** Share view: numbers only, with no lock (the viewer is not the buyer). */
  hideLockNote?: boolean;
}

const DIMENSION_TONES: Record<V4DimensionKey, { fill: string; dot: string; strongest: string; highlight: string }> = {
  chemistry: { fill: 'bg-romance', dot: 'bg-romance', strongest: 'border-romance/30 bg-romance/10 text-romanceText', highlight: 'เคมีมา' },
  communication: { fill: 'bg-accentBright', dot: 'bg-accentBright', strongest: 'border-edge bg-surface2 text-ink', highlight: 'คุยกันติด' },
  trust: { fill: 'bg-success', dot: 'bg-success', strongest: 'border-success/30 bg-success/10 text-success', highlight: 'ไว้ใจกันได้' },
  rhythm: { fill: 'bg-warn', dot: 'bg-warn', strongest: 'border-warn/30 bg-warn/10 text-warn', highlight: 'จังหวะตรงกัน' },
};

/** DimensionBars: the four computed scores. Numbers are free; the line under each is paid. */
export function DimensionBars({ dimensions, lines, hideLockNote }: DimensionBarsProps) {
  const locked = !lines && !hideLockNote;
  // Every score tied for the highest gets its own natural-language tag — a tie shouldn't
  // pick one arbitrarily. Text + icon, not color alone, so it still reads for
  // colorblind viewers (the same principle MoonGlyph uses for month states).
  const topScore = Math.max(...dimensions.map((d) => d.score));
  return (
    <section aria-labelledby="report-dimensions" id="report-dimensions-section" className="scroll-mt-32">
      <SectionHeading
        id="report-dimensions"
        title={`${dimensions.length} มิติของคู่นี้`}
        sub={lines ? 'ตัวเลขจากดวงของคุณสองคน พร้อมความหมายของแต่ละมิติ' : 'ตัวเลขจากดวงของคุณสองคน ยิ่งสูงยิ่งไหลลื่น'}
      />
      <div className="mt-4 border-y border-edge px-1 sm:px-2">
        <ol className="divide-y divide-edge">
          {dimensions.map((dimension) => {
            const isTop = dimension.score === topScore;
            const tone = DIMENSION_TONES[dimension.key];
            return (
              <li
                key={dimension.key}
                className="-mx-1 px-1 pb-4 pt-3.5 sm:-mx-2 sm:px-2"
              >
                <div className="flex items-center gap-2">
                  <span className={`size-2 shrink-0 rounded-full ${tone.dot}`} aria-hidden="true" />
                  <span className="font-heading text-base font-semibold leading-snug text-ink">{dimension.label}</span>
                  {isTop && (
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-heading text-xs font-medium ${tone.strongest}`}>
                      <Sparkles className="size-3" aria-hidden="true" />
                      {tone.highlight}
                    </span>
                  )}
                  <span className={`ml-auto font-mono tabular-nums text-ink ${isTop ? 'text-2xl font-bold leading-none tracking-[-0.04em]' : 'font-medium'}`}>
                    {dimension.score}
                    <span className="sr-only">{isTop ? 'จาก 100 ด้านที่โดดเด่นที่สุดของคู่นี้' : 'จาก 100'}</span>
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-edge" aria-hidden="true">
                  <div
                    className={`h-full rounded-full ${tone.fill}`}
                    style={{ width: `${dimension.score}%` }}
                  />
                </div>
                {lines && (
                  <p className="mt-2.5 font-oracle text-base font-light leading-[1.75] text-ink">
                    <ThaiText>{lines[dimension.key]}</ThaiText>
                  </p>
                )}
              </li>
            );
          })}
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
