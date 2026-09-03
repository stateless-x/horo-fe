'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Heart, Coins, Activity, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import type { StructuredDailyContent } from '@/hooks/use-daily-fortune';

const CATEGORY_CONFIG = {
  career: { label: 'การงาน', icon: Briefcase, color: '#4A90D9' },
  love: { label: 'ความรัก', icon: Heart, color: '#E85D75' },
  finance: { label: 'การเงิน', icon: Coins, color: '#D4A843' },
  health: { label: 'สุขภาพ', icon: Activity, color: '#5BA55B' },
} as const;

type CategoryKey = keyof typeof CATEGORY_CONFIG;

interface CategoryCarouselProps {
  categories: StructuredDailyContent['categories'];
}

function StarRating({ score, color }: { score: number; color: string }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className="w-4 h-4"
          fill={star <= score ? color : 'transparent'}
          stroke={star <= score ? color : 'rgba(161,161,170,0.3)'}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

/**
 * Horizontal scrollable category cards.
 * Each card shows score + tip, tap to see full reading.
 */
export function CategoryCarousel({ categories }: CategoryCarouselProps) {
  const [expanded, setExpanded] = useState<CategoryKey | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const keys = Object.keys(CATEGORY_CONFIG) as CategoryKey[];

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.offsetWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative">
      {/* Scroll buttons for desktop */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-surface/90 border border-surface2/50 text-inkMuted hover:text-ink transition-colors"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-surface/90 border border-surface2/50 text-inkMuted hover:text-ink transition-colors"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Scrollable container */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 -mx-2 px-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {keys.map((key) => {
          const config = CATEGORY_CONFIG[key];
          const data = categories[key];
          const Icon = config.icon;
          const isExpanded = expanded === key;

          return (
            <motion.button
              key={key}
              onClick={() => setExpanded(isExpanded ? null : key)}
              className={`flex-shrink-0 snap-center bg-surface border border-surface2/50 rounded-xl p-4 text-left transition-all duration-200 hover:border-accent/30 ${
                isExpanded ? 'w-[85vw] max-w-sm' : 'w-[70vw] max-w-[200px]'
              }`}
              layout
            >
              {/* Header */}
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${config.color}15` }}
                >
                  <Icon className="w-4 h-4" style={{ color: config.color }} />
                </div>
                <span className="font-heading text-sm font-medium text-ink">
                  {config.label}
                </span>
              </div>

              {/* Score */}
              <div className="mb-2">
                <StarRating score={data.score} color={config.color} />
              </div>

              {/* Tip (always visible) */}
              <p className="text-sm text-inkMuted font-thai line-clamp-2">
                {data.tip}
              </p>

              {/* Expanded reading */}
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 pt-3 border-t border-surface2/30"
                >
                  <p className="text-base text-ink/80 font-oracle font-light leading-relaxed">
                    {data.reading}
                  </p>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Scroll indicator dots */}
      <div className="flex justify-center gap-1.5 mt-3">
        {keys.map((key, index) => (
          <div
            key={key}
            className="w-1.5 h-1.5 rounded-full transition-colors"
            style={{
              backgroundColor: expanded === key ? CATEGORY_CONFIG[key].color : 'rgba(161,161,170,0.3)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
