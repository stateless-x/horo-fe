'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Heart, Coins, Activity, ChevronDown } from 'lucide-react';
import type { StructuredDailyContent } from '@/features/fortune/hooks/use-daily-fortune';

const CATEGORY_CONFIG = {
  career: { label: 'การงาน', icon: Briefcase, color: '#4A90D9' },
  love: { label: 'ความรัก', icon: Heart, color: '#E85D75' },
  finance: { label: 'การเงิน', icon: Coins, color: '#D4A843' },
  health: { label: 'สุขภาพ', icon: Activity, color: '#5BA55B' },
} as const;

type CategoryKey = keyof typeof CATEGORY_CONFIG;

interface CategoryScoresProps {
  categories: StructuredDailyContent['categories'];
}

function StarRating({ score, color }: { score: number; color: string }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.svg
          key={star}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 * star, type: 'spring', stiffness: 300 }}
          className="w-3.5 h-3.5"
          viewBox="0 0 20 20"
          fill={star <= score ? color : 'rgba(161,161,170,0.3)'}
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </motion.svg>
      ))}
    </div>
  );
}

export function CategoryScores({ categories }: CategoryScoresProps) {
  const [expanded, setExpanded] = useState<CategoryKey | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="grid grid-cols-2 gap-3"
    >
      {(Object.keys(CATEGORY_CONFIG) as CategoryKey[]).map((key) => {
        const config = CATEGORY_CONFIG[key];
        const data = categories[key];
        const Icon = config.icon;
        const isExpanded = expanded === key;

        return (
          <button
            key={key}
            onClick={() => setExpanded(isExpanded ? null : key)}
            className={`bg-surface border border-surface2/50 rounded-xl p-4 text-left transition-all duration-200 hover:border-accent/30 ${
              isExpanded ? 'col-span-2 border-accent/30' : 'col-span-1'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4" style={{ color: config.color }} />
                <span className="font-heading text-sm md:text-base font-medium text-ink">
                  {config.label}
                </span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-inkMuted transition-transform duration-200 ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />
            </div>

            <StarRating score={data.score} color={config.color} />

            <p className="text-xs md:text-sm text-inkMuted mt-2 line-clamp-2 font-thai">
              {data.tip}
            </p>

            {/* Expanded reading */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <hr className="border-surface2/50 my-3" />
                  <p className="text-base md:text-lg leading-relaxed text-ink/80 font-oracle font-light">
                    {data.reading}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        );
      })}
    </motion.div>
  );
}
