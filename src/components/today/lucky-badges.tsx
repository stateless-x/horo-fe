'use client';

import { motion } from 'framer-motion';
import { Hash, Palette, Compass, Clock } from 'lucide-react';

interface LuckyBadgesProps {
  luckyNumber: number | null;
  luckyColor: string | null;
  luckyDirection: string | null;
  luckyMoment: string | null;
  luckyNumbers?: number[] | null;
  luckyColorEnhanced?: string | null;
}

export function LuckyBadges({
  luckyNumber,
  luckyColor,
  luckyDirection,
  luckyMoment,
  luckyNumbers,
  luckyColorEnhanced,
}: LuckyBadgesProps) {
  // Prefer enhanced lucky numbers from LLM, fall back to deterministic single number
  const displayNumbers = luckyNumbers && luckyNumbers.length > 0
    ? luckyNumbers.join(', ')
    : luckyNumber?.toString() || '-';

  // Prefer LLM-personalized color, fall back to deterministic
  const displayColor = luckyColorEnhanced || luckyColor || '-';

  const badges = [
    {
      label: 'เลขมงคล',
      value: displayNumbers,
      icon: Hash,
      large: !luckyNumbers || luckyNumbers.length <= 1,
    },
    {
      label: 'สีมงคล',
      value: displayColor,
      icon: Palette,
      large: false,
    },
    {
      label: 'ทิศมงคล',
      value: luckyDirection || '-',
      icon: Compass,
      large: false,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="space-y-3"
    >
      <div className="grid grid-cols-3 gap-3">
        {badges.map((badge, index) => {
          const Icon = badge.icon;
          return (
            <div
              key={badge.label}
              className="bg-deepNight border border-darkPurple/50 rounded-xl p-3 text-center"
            >
              <Icon className="w-4 h-4 text-amethyst mx-auto mb-1.5" />
              <p className="text-xs text-ashGray mb-1">{badge.label}</p>
              <p
                className={`font-heading text-ghostWhite ${
                  badge.large ? 'text-2xl' : 'text-base'
                }`}
              >
                {badge.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Lucky moment highlight */}
      {luckyMoment && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-amethyst/5 border border-amethyst/15 rounded-lg">
          <Clock className="w-4 h-4 text-amethyst shrink-0" />
          <p className="text-sm text-ghostWhite/80 font-thai">
            <span className="text-amethyst font-medium">เวลามงคล:</span>{' '}
            {luckyMoment}
          </p>
        </div>
      )}
    </motion.div>
  );
}
