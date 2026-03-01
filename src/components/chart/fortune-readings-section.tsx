'use client';

import { useState } from 'react';
import {
  Orbit,
  Heart,
  Briefcase,
  Coins,
  Activity,
  Home,
  Star,
  ChevronDown,
  Lightbulb,
  AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FortuneReadingCategory } from '@/lib-packages/shared/types/astrology';
import { FORTUNE_CATEGORIES } from '@/lib-packages/shared/constants/design';

interface FortuneReadingsSectionProps {
  fortuneReadings: FortuneReadingCategory[];
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  life_overview: Orbit,
  love: Heart,
  career: Briefcase,
  finance: Coins,
  health: Activity,
  family: Home,
};

export function FortuneReadingsSection({ fortuneReadings }: FortuneReadingsSectionProps) {
  // Start with all categories collapsed
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  const toggleCategory = (key: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const renderStars = (score: number, isExpanded: boolean) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star, index) => {
          const isFilled = star <= score;
          return (
            <motion.div
              key={star}
              initial={isExpanded ? { scale: 0 } : false}
              animate={isExpanded ? { scale: [0, 1.3, 1] } : {}}
              transition={{
                duration: 0.4,
                delay: isExpanded ? index * 0.2 : 0,
                ease: [0.34, 1.56, 0.64, 1], // Bouncy easing
              }}
            >
              <Star
                className={`w-4 h-4 ${
                  isFilled
                    ? 'text-amethyst fill-amethyst'
                    : 'text-darkPurple/50'
                }`}
              />
              {/* Sparkle effect for high scores (4-5 stars) */}
              {isFilled && score >= 4 && isExpanded && (
                <motion.div
                  className="absolute -top-1 -right-1 w-2 h-2"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.2 + 0.3,
                    ease: 'easeOut',
                  }}
                >
                  <div className="w-full h-full bg-amethyst rounded-full blur-sm" />
                </motion.div>
              )}
            </motion.div>
          );
        })}
        <span className="font-mono text-amethyst text-base ml-1">
          {score}/5
        </span>
      </div>
    );
  };

  const getPreview = (reading: string) => {
    // Get first sentence as preview
    const firstSentence = reading.split(/[.!?]/).filter(Boolean)[0];
    return firstSentence ? `"${firstSentence}..."` : '';
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="font-heading text-2xl font-medium text-ghostWhite mb-2">
          คำทำนายโดยละเอียด
        </h2>
        <p className="font-thai text-ashGray text-base">
          แตะที่แต่ละหมวดเพื่ออ่านคำทำนายฉบับเต็ม
        </p>
      </div>

      <div className="space-y-4">
        {fortuneReadings.map((category) => {
          const isExpanded = expandedCategories.has(category.key);
          const Icon = CATEGORY_ICONS[category.key];
          const label = FORTUNE_CATEGORIES[category.key]?.label || category.key;

          return (
            <motion.div
              key={category.key}
              whileHover={!isExpanded ? { x: 2 } : {}}
              whileTap={{ scale: 0.98 }}
              className={`
                bg-deepNight rounded-xl transition-all duration-200
                ${
                  isExpanded
                    ? 'border-amethyst/30 bg-darkPurple/10 shadow-[0_0_20px_rgba(161,106,203,0.15)]'
                    : 'border-darkPurple/50 hover:border-royalPurple/50 hover:shadow-[0_0_15px_rgba(99,72,183,0.1)]'
                }
                border
                ${isExpanded ? 'border-l-4 border-l-amethyst' : 'border-l-4 border-l-transparent hover:border-l-royalPurple/30'}
              `}
            >
              {/* Collapsed header */}
              <button
                onClick={() => toggleCategory(category.key)}
                className="w-full p-5 flex items-start gap-4 cursor-pointer text-left"
              >
                <Icon className="text-amethyst w-6 h-6 flex-shrink-0 mt-1" />

                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-medium text-lg md:text-xl text-ghostWhite mb-2">
                    {label}
                  </h3>

                  {/* Star rating */}
                  <div className="mb-2">{renderStars(category.score, isExpanded)}</div>

                  {/* Preview (only when collapsed) */}
                  {!isExpanded && (
                    <p className="text-ashGray font-oracle text-base line-clamp-1">
                      {getPreview(category.reading)}
                    </p>
                  )}
                </div>

                {/* Chevron */}
                <ChevronDown
                  className={`text-ashGray w-5 h-5 flex-shrink-0 transition-transform duration-300 ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Expanded content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, translateY: 8 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    exit={{ opacity: 0, translateY: 8 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="px-5 pb-5"
                  >
                    {/* Full reading */}
                    <div className="mb-4 pt-2 border-t border-darkPurple/50">
                      <p className="text-ghostWhite font-oracle font-light text-lg md:text-xl leading-[1.75]">
                        {category.reading}
                      </p>
                    </div>

                    {/* Tips section */}
                    {category.tips.length > 0 && (
                      <div className="bg-emerald-400/5 border border-emerald-400/20 rounded-lg p-4 mb-4">
                        <div className="flex items-start gap-2 mb-2">
                          <Lightbulb className="text-emerald-400 w-4 h-4 flex-shrink-0 mt-0.5" />
                          <h4 className="text-emerald-400 font-heading font-medium text-base">
                            สิ่งที่ควรทำ
                          </h4>
                        </div>
                        <ul className="space-y-1.5">
                          {category.tips.map((tip, index) => (
                            <li
                              key={index}
                              className="text-ghostWhite font-thai text-base pl-6 relative before:content-['•'] before:absolute before:left-2 before:text-emerald-400"
                            >
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Warnings section */}
                    {category.warnings.length > 0 && (
                      <div className="bg-amber-400/5 border border-amber-400/20 rounded-lg p-4">
                        <div className="flex items-start gap-2 mb-2">
                          <AlertTriangle className="text-amber-400 w-4 h-4 flex-shrink-0 mt-0.5" />
                          <h4 className="text-amber-400 font-heading font-medium text-base">
                            สิ่งที่ต้องระวัง
                          </h4>
                        </div>
                        <ul className="space-y-1.5">
                          {category.warnings.map((warning, index) => (
                            <li
                              key={index}
                              className="text-ghostWhite font-thai text-base pl-6 relative before:content-['•'] before:absolute before:left-2 before:text-amber-400"
                            >
                              {warning}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
