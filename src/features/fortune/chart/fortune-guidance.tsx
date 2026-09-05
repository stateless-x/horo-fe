'use client';

import { useState } from 'react';
import { ChevronDown, Lightbulb, TriangleAlert } from 'lucide-react';
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
  life_overview: { positive: 'ใช้พลังกับสิ่งนี้', negative: 'อย่าฝืนเรื่องนี้' },
  love: { positive: 'เปิดใจในเรื่องนี้', negative: 'อย่าเพิ่งเร่ง' },
  career: { positive: 'จังหวะที่ใช่', negative: 'เรื่องที่ควรรอ' },
  finance: { positive: 'ทิศทางที่หนุน', negative: 'จุดที่ควรชะลอ' },
  health: { positive: 'สิ่งที่เติมพลัง', negative: 'สิ่งที่ควรพัก' },
  family: { positive: 'สิ่งที่เชื่อมใจ', negative: 'สิ่งที่ควรวาง' },
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
    <div className={`grid gap-6 sm:grid-cols-2 ${className}`}>
      {positiveItems.length > 0 && (
        <div>
          <h3 className="flex items-center gap-2 font-heading font-semibold text-success">
            <Lightbulb className="size-5" aria-hidden="true" /> {positiveLabel}
          </h3>
          <ul className="mt-3 space-y-2 font-thai leading-relaxed text-ink">
            {positiveItems.map((item, index) => <li key={`${item}-${index}`}>• {item}</li>)}
          </ul>
        </div>
      )}
      {negativeItems.length > 0 && (
        <div>
          <h3 className="flex items-center gap-2 font-heading font-semibold text-warn">
            <TriangleAlert className="size-5" aria-hidden="true" /> {negativeLabel}
          </h3>
          <ul className="mt-3 space-y-2 font-thai leading-relaxed text-ink">
            {negativeItems.map((item, index) => <li key={`${item}-${index}`}>• {item}</li>)}
          </ul>
        </div>
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
        <span>{isOpen ? 'ซ่อนแนวทางประกอบ' : 'เปิดแนวทางประกอบ'}</span>
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
