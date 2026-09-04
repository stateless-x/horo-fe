'use client';

import { motion } from 'framer-motion';
import { Sparkles, Star } from 'lucide-react';
import { ClientDate } from '@/components/client-date';
import { ELEMENT_COLORS } from '@/lib-packages/shared/constants/design';

const ELEMENT_NAMES_THAI: Record<string, string> = {
  wood: 'ไม้',
  fire: 'ไฟ',
  earth: 'ดิน',
  metal: 'ทอง',
  water: 'น้ำ',
};

interface TodayHeroProps {
  displayName: string;
  primaryElement: string | null;
  planet: string | null;
  dailyTheme?: string | null;
  overallScore?: number | null;
}

/**
 * Condensed hero section for the today page.
 * Shows: greeting, element badge, daily score, and theme.
 */
export function TodayHero({
  displayName,
  primaryElement,
  planet,
  dailyTheme,
  overallScore,
}: TodayHeroProps) {
  const elementKey = (primaryElement?.toLowerCase() || 'earth') as keyof typeof ELEMENT_COLORS;
  const colors = ELEMENT_COLORS[elementKey] || ELEMENT_COLORS.earth;
  const elementNameThai = ELEMENT_NAMES_THAI[elementKey] || primaryElement || 'ดิน';

  // Render star rating
  const renderStars = (score: number) => (
    <div className="flex gap-0.5 justify-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.div
          key={star}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.1 * star, type: 'spring', stiffness: 300 }}
        >
          <Star
            className="w-6 h-6"
            fill={star <= score ? colors.primary : 'transparent'}
            stroke={star <= score ? colors.primary : 'rgba(161,161,170,0.4)'}
            strokeWidth={1.5}
          />
        </motion.div>
      ))}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-3 pb-2"
    >
      {/* Compact header: greeting + element badge inline */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <p className="text-accentFaint font-oracle text-base">
          สวัสดี, {displayName}
        </p>
        {(primaryElement || planet) && (
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-heading"
            style={{
              borderColor: `${colors.primary}40`,
              backgroundColor: colors.glow,
              color: colors.primary,
            }}
          >
            <Sparkles className="w-3 h-3" />
            ธาตุ{elementNameThai}
            {planet && ` · ${planet}`}
          </span>
        )}
      </div>

      {/* Date - compact */}
      <ClientDate className="text-inkMuted text-sm" />

      {/* Overall Score - the main visual hook */}
      {overallScore && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="py-3"
        >
          {renderStars(overallScore)}
        </motion.div>
      )}

      {/* Daily Theme - memorable takeaway */}
      {dailyTheme && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="px-4"
        >
          <p
            className="text-lg font-heading font-medium"
            style={{ color: colors.primary }}
          >
            {dailyTheme}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
