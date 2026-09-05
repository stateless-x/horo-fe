'use client';

import { ArrowRight } from 'lucide-react';
import type { FortuneReadingCategory } from '@/lib-packages/shared/types/astrology';
import { FORTUNE_CATEGORY_CONFIG, type FortuneCategoryKey } from '@/lib/fortune-category-config';

interface FortuneEnergySectionProps {
  fortuneReadings: FortuneReadingCategory[];
  /** Resolved by the page from the chart's own readingPeriod, with the clock
      as fallback. Taking it as a prop keeps this note and the page header
      from naming two different months for the same narrative. */
  readingPeriod: { monthTh: string; renewsOn: string };
  onOpenReadings: () => void;
}

/** Order the six areas strongest-first so the reader's own highlights lead. */
function byScoreDesc(a: FortuneReadingCategory, b: FortuneReadingCategory) {
  return b.score - a.score;
}

/**
 * Per-area energy bars for the chart's สรุป tab.
 *
 * Scores are computed deterministically by the backend
 * (lib/astrology/chart-scores.ts) rather than chosen by the LLM, so a bar is
 * reproducible for a given birth chart, so a percentage is honest here. The
 * daily reading is scored the same way now (0 to 100, in code).
 *
 * Deliberately distinct from the daily page's bars: this is the enduring
 * birth-chart reading, not today's weather, and the two should not be mistaken
 * for each other. life_overview is excluded, it is the mean of the rest and
 * would read as a seventh, contradictory area.
 */
export function FortuneEnergySection({ fortuneReadings, readingPeriod, onOpenReadings }: FortuneEnergySectionProps) {
  const areas = fortuneReadings
    .filter((reading) => reading.key !== 'life_overview')
    .slice()
    .sort(byScoreDesc);

  if (areas.length === 0) return null;

  return (
    <section className="border-b border-edge py-8" aria-labelledby="fortune-energy-title">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div>
          <h3 id="fortune-energy-title" className="font-heading text-xl font-semibold text-ink">
            พลังแต่ละด้านของเจ้า
          </h3>
          <p className="mt-1 font-thai text-sm text-inkMuted">
            อ่านจากธาตุและเสาชะตาของเจ้า ไม่เปลี่ยนไปตามวัน
          </p>
        </div>
      </div>

      <ul className="mt-6 space-y-4">
        {areas.map((area) => {
          const config = FORTUNE_CATEGORY_CONFIG[area.key as FortuneCategoryKey];
          if (!config) return null;

          // Romance Pink is a reserved payload hue for love/relationship
          // content (DESIGN.md), matching the daily page's category bars.
          const isLove = area.key === 'love';
          const fillClass = isLove ? 'bg-pink-500' : 'bg-accentBright';
          const valueClass = isLove ? 'text-pink-600 dark:text-pink-400' : 'text-accentBright';

          return (
            <li key={area.key}>
              <div className="flex items-baseline justify-between gap-4">
                <span className="font-thai text-ink">{config.label}</span>
                <span className={`font-heading tabular-nums ${valueClass}`}>{area.score}%</span>
              </div>
              <div
                className="mt-2 h-2 overflow-hidden rounded-full bg-edgeSoft"
                role="progressbar"
                aria-label={config.fullLabel}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={area.score}
              >
                <div
                  className={`h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none ${fillClass}`}
                  style={{ width: `${area.score}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={onOpenReadings}
        className="mt-5 flex min-h-11 items-center gap-1 rounded font-heading text-accentBright transition-colors hover:text-accentSoft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright"
      >
        อ่านรายละเอียดแต่ละด้าน
        <ArrowRight className="size-4" aria-hidden="true" />
      </button>

      {/* Scope, not expiry: naming the month makes the reading feel authored and
          complete rather than something counting down to nothing. Says คำทำนาย
          because only the narrative regenerates, the chart itself never does. */}
      <p className="mt-6 font-thai text-sm text-inkMuted">
        คำทำนายเดือน{readingPeriod.monthTh} · อ่านใหม่ได้อีกครั้ง {readingPeriod.renewsOn}
      </p>
    </section>
  );
}
