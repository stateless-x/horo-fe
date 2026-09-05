'use client';

import { useState } from 'react';
import {
  ChevronDown,
  Orbit,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { FortuneReadingCategory } from '@/lib-packages/shared/types/astrology';
import { CategoryClayImage } from '@/components/ui/category-clay-image';
import { FORTUNE_CATEGORY_CONFIG, type FortuneCategoryKey } from '@/lib/fortune-category-config';
import { FortuneGuidance } from '@/features/fortune/chart/fortune-guidance';

interface FortuneReadingsSectionProps {
  fortuneReadings: FortuneReadingCategory[];
}

const SCORE_LABELS = ['ค่อยเป็นค่อยไป', 'ต้องใส่ใจ', 'สมดุล', 'จังหวะดี', 'โดดเด่น'];

/**
 * Scores are 0-100 (computed in horo-be/lib/astrology/chart-scores.ts). Bucket
 * them into the five qualitative labels. The word is what belongs on a reading;
 * while the precise number lives on the overview tab's energy bars.
 */
function scoreLabel(score: number): string {
  const index = Math.min(4, Math.max(0, Math.floor((score - 1) / 20)));
  return SCORE_LABELS[index];
}

/**
 * One short line under the label when the backend has no tips yet: the
 * first sentence of the reading, cut at the first space at or after 60
 * chars. Thai running text has no spaces around most word breaks, so a
 * plain indexOf can return -1 on real copy, so fall back to a hard cut at
 * 60 rather than yielding the whole paragraph.
 */
function readingPreview(reading: string, tips: string[]): string {
  if (tips[0]) return tips[0];
  if (reading.length <= 60) return reading;
  const spaceIndex = reading.indexOf(' ', 60);
  const cut = spaceIndex === -1 ? 60 : spaceIndex;
  return `${reading.slice(0, cut).trim()}…`;
}

export function FortuneReadingsSection({ fortuneReadings }: FortuneReadingsSectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    () => new Set(fortuneReadings[0] ? [fortuneReadings[0].key] : []),
  );

  const toggleCategory = (key: string) => {
    setExpandedCategories((previous) => {
      const next = new Set(previous);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <section aria-labelledby="fortune-readings-title">
      <div className="mb-8">
        <h2 id="fortune-readings-title" className="font-heading text-2xl font-semibold text-ink sm:text-3xl">
          โชค 6 ด้านของชีวิต
        </h2>
        <p className="mt-2 font-thai text-inkMuted">อ่านภาพรวมก่อน แล้วเลือกเปิดเฉพาะเรื่องที่อยากรู้</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-edge bg-surface shadow-lg shadow-accent/5">
        {fortuneReadings.map((category, index) => {
          const isExpanded = expandedCategories.has(category.key);
          const categoryConfig = FORTUNE_CATEGORY_CONFIG[category.key as FortuneCategoryKey];
          const label = categoryConfig?.fullLabel || category.key;
          const panelId = `fortune-reading-${category.key}`;
          const percent = Math.round(Math.min(100, Math.max(0, category.score)));
          const isLove = category.key === 'love';
          const accentClass = isLove ? 'bg-pink-500' : 'bg-accentBright';
          const textAccentClass = isLove ? 'text-pink-600 dark:text-pink-400' : 'text-accentBright';

          return (
            <div key={category.key} className={index > 0 ? 'border-t border-edge' : ''}>
              <button
                type="button"
                onClick={() => toggleCategory(category.key)}
                aria-expanded={isExpanded}
                aria-controls={panelId}
                className="grid w-full grid-cols-[3.5rem_1fr_auto] items-center gap-3 p-4 text-left transition-colors hover:bg-surface2/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accentBright md:grid-cols-[4.5rem_1fr_12rem_auto] md:gap-5 md:p-5"
              >
                {categoryConfig ? (
                  <CategoryClayImage category={category.key as FortuneCategoryKey} sizes="72px" className="size-14 md:size-[4.5rem]" />
                ) : (
                  <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accentBright md:size-[4.5rem]">
                    <Orbit className="size-5" aria-hidden="true" />
                  </span>
                )}
                <div className="min-w-0">
                  <p className="font-heading text-lg font-semibold text-ink">{label}</p>
                  <p className="mt-0.5 line-clamp-1 text-sm leading-relaxed text-inkMuted md:text-base">
                    {readingPreview(category.reading, category.tips)}
                  </p>
                </div>
                <div className="hidden md:block">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-inkMuted">พลัง</span>
                    <span className={`font-heading tabular-nums ${textAccentClass}`}>{percent}%</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-edgeSoft" aria-hidden="true">
                    <div className={`h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none ${accentClass}`} style={{ width: `${percent}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-inkMuted">{scoreLabel(category.score)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-heading text-lg tabular-nums md:hidden ${textAccentClass}`}>{percent}%</span>
                  <ChevronDown className={`size-5 shrink-0 text-inkMuted transition-transform ${isExpanded ? 'rotate-180' : ''}`} aria-hidden="true" />
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    id={panelId}
                    initial={shouldReduceMotion ? false : { height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={shouldReduceMotion ? undefined : { height: 0, opacity: 0 }}
                    transition={{ duration: shouldReduceMotion ? 0 : 0.24, ease: 'easeOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-5 md:px-5 md:pb-6">
                      <p className="ml-0 max-w-[64ch] border-t border-edge pt-4 font-oracle text-lg font-light leading-[1.8] text-ink md:ml-[5.75rem]">
                        {category.reading}
                      </p>

                      {categoryConfig && (
                        <div className="md:pl-[5.75rem]">
                          <FortuneGuidance
                            category={category.key as FortuneCategoryKey}
                            tips={category.tips}
                            warnings={category.warnings}
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
