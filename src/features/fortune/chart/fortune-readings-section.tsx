'use client';

import { useState } from 'react';
import {
  ChevronDown,
  Lightbulb,
  Orbit,
  TriangleAlert,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { FortuneReadingCategory } from '@/lib-packages/shared/types/astrology';
import { CategoryClayImage } from '@/components/ui/category-clay-image';
import { FORTUNE_CATEGORY_CONFIG, type FortuneCategoryKey } from '@/lib/fortune-category-config';

interface FortuneReadingsSectionProps {
  fortuneReadings: FortuneReadingCategory[];
}

const SCORE_LABELS = ['ค่อยเป็นค่อยไป', 'ต้องใส่ใจ', 'สมดุล', 'จังหวะดี', 'โดดเด่น'];

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
          คำทำนาย 6 ด้านของชีวิต
        </h2>
        <p className="mt-2 font-thai text-inkMuted">อ่านภาพรวมก่อน แล้วเลือกเปิดเฉพาะเรื่องที่คุณสนใจ</p>
      </div>

      <div className="divide-y divide-edge border-y border-edge">
        {fortuneReadings.map((category) => {
          const isExpanded = expandedCategories.has(category.key);
          const categoryConfig = FORTUNE_CATEGORY_CONFIG[category.key as FortuneCategoryKey];
          const label = categoryConfig?.fullLabel || category.key;
          const panelId = `fortune-reading-${category.key}`;

          return (
            <article key={category.key}>
              <button
                type="button"
                onClick={() => toggleCategory(category.key)}
                className="flex min-h-20 w-full items-center gap-4 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accentBright"
                aria-expanded={isExpanded}
                aria-controls={panelId}
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accentBright">
                  {categoryConfig ? (
                    <CategoryClayImage category={category.key as FortuneCategoryKey} sizes="32px" className="size-8" />
                  ) : (
                    <Orbit className="size-5" aria-hidden="true" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-heading text-lg font-semibold text-ink">{label}</span>
                  {!isExpanded && (
                    <span className="mt-1 block line-clamp-1 font-thai text-sm text-inkMuted">{category.reading}</span>
                  )}
                </span>
                <span className="hidden shrink-0 rounded-full bg-surface2 px-3 py-1 text-sm text-inkMuted sm:block">
                  {SCORE_LABELS[category.score - 1]}
                </span>
                <ChevronDown
                  className={`size-5 shrink-0 text-inkMuted transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
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
                    <div className="pb-7 sm:pl-14">
                      <p className="max-w-[68ch] font-oracle text-lg font-light leading-[1.8] text-ink">
                        {category.reading}
                      </p>

                      <div className="mt-6 grid gap-6 sm:grid-cols-2">
                        {category.tips.length > 0 && (
                          <div>
                            <h3 className="flex items-center gap-2 font-heading font-semibold text-success">
                              <Lightbulb className="size-5" aria-hidden="true" /> สิ่งที่ช่วยคุณ
                            </h3>
                            <ul className="mt-3 space-y-2 font-thai leading-relaxed text-ink">
                              {category.tips.map((tip, index) => <li key={`${tip}-${index}`}>• {tip}</li>)}
                            </ul>
                          </div>
                        )}
                        {category.warnings.length > 0 && (
                          <div>
                            <h3 className="flex items-center gap-2 font-heading font-semibold text-warn">
                              <TriangleAlert className="size-5" aria-hidden="true" /> สิ่งที่ควรระวัง
                            </h3>
                            <ul className="mt-3 space-y-2 font-thai leading-relaxed text-ink">
                              {category.warnings.map((warning, index) => <li key={`${warning}-${index}`}>• {warning}</li>)}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </article>
          );
        })}
      </div>
    </section>
  );
}
