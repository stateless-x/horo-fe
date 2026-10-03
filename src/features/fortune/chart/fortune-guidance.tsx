'use client';

import { useState } from 'react';
import { ArrowUpRight, ChevronDown, Pause } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { FortuneCategoryKey } from '@/lib/fortune-category-config';

interface GuidanceColumnsProps {
  positiveItems: string[];
  negativeItems: string[];
  positiveLabel: string;
  negativeLabel: string;
  className?: string;
}

interface FortuneGuidanceProps {
  category: FortuneCategoryKey;
  tips: string[];
  warnings: string[];
}

const CATEGORY_GUIDANCE_LABELS: Record<FortuneCategoryKey, { positive: string; negative: string }> = {
  life_overview: { positive: 'ลองเริ่มจากตรงนี้', negative: 'เรื่องนี้พักไว้ก่อน' },
  love: { positive: 'ลองเปิดใจแบบนี้', negative: 'อย่าเพิ่งรีบหาคำตอบ' },
  career: { positive: 'งานที่ค่อย ๆ ดันได้', negative: 'งานที่ยังไม่ต้องฝืน' },
  finance: { positive: 'ใช้เงินกับเรื่องนี้ก่อน', negative: 'รายการนี้รอดูอีกนิด' },
  health: { positive: 'เติมพลังให้ตัวเอง', negative: 'เรื่องที่ร่างกายขอพัก' },
  family: { positive: 'เริ่มคุยจากตรงนี้', negative: 'เรื่องที่ยังไม่ต้องเคลียร์' },
};

export function GuidanceColumns({
  positiveItems,
  negativeItems,
  positiveLabel,
  negativeLabel,
  className = '',
}: GuidanceColumnsProps) {
  if (positiveItems.length === 0 && negativeItems.length === 0) return null;

  return (
    <div className={`grid gap-5 sm:grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)] sm:gap-6 ${className}`}>
      {positiveItems.length > 0 && (
        <section aria-label={positiveLabel}>
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-success/[0.1] text-success">
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </span>
            <h3 className="font-heading text-base font-semibold text-ink sm:text-lg">
              {positiveLabel}
            </h3>
          </div>
          <ul className="mt-3 divide-y divide-edge border-y border-edge">
            {positiveItems.map((item, index) => (
              <li key={`${item}-${index}`} className="grid grid-cols-[1.25rem_minmax(0,1fr)] gap-2.5 py-3 font-thai leading-[1.7] text-ink first:pt-2.5 last:pb-2.5">
                <ArrowUpRight className="mt-[0.3rem] size-4 text-success" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
      {positiveItems.length > 0 && negativeItems.length > 0 && <div className="hidden bg-edge sm:block" aria-hidden="true" />}
      {negativeItems.length > 0 && (
        <section aria-label={negativeLabel}>
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-warn/[0.1] text-warn">
              <Pause className="size-4" aria-hidden="true" />
            </span>
            <h3 className="font-heading text-base font-semibold text-ink sm:text-lg">
              {negativeLabel}
            </h3>
          </div>
          <ul className="mt-3 divide-y divide-edge border-y border-edge">
            {negativeItems.map((item, index) => (
              <li key={`${item}-${index}`} className="grid grid-cols-[1.25rem_minmax(0,1fr)] gap-2.5 py-3 font-thai leading-[1.7] text-ink first:pt-2.5 last:pb-2.5">
                <Pause className="mt-[0.3rem] size-4 text-warn" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export function FortuneGuidance({ category, tips, warnings }: FortuneGuidanceProps) {
  const [isOpen, setIsOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const labels = CATEGORY_GUIDANCE_LABELS[category];
  const panelId = `fortune-guidance-${category}`;

  if (tips.length === 0 && warnings.length === 0) return null;

  return (
    <div className="mt-7 border-t border-edge pt-4">
      <button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="flex min-h-11 w-full items-center justify-between gap-4 rounded-lg px-2 text-left font-heading text-sm font-semibold text-accentBright transition-colors hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright"
      >
        <span>{isOpen ? 'ย่อคำแนะนำ' : 'ดูคำแนะนำเพิ่ม'}</span>
        <ChevronDown className={`size-5 shrink-0 transition-transform motion-reduce:transition-none ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            initial={shouldReduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={shouldReduceMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <GuidanceColumns
              positiveItems={tips}
              negativeItems={warnings}
              positiveLabel={labels.positive}
              negativeLabel={labels.negative}
              className="px-2 pb-2 pt-5"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
