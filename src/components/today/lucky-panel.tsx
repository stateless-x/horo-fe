'use client';

import { motion } from 'framer-motion';
import { Hash, Palette, Compass, Clock } from 'lucide-react';

interface LuckyPanelProps {
  luckyNumber: number | null;
  luckyColor: string | null;
  luckyDirection: string | null;
  luckyMoment: string | null;
  luckyNumbers?: number[] | null;
  luckyColorEnhanced?: string | null;
}

interface LuckyItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}

function LuckyItem({ icon, label, value, highlight }: LuckyItemProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-surface/50 rounded-xl border border-surface2/30">
      <div className="w-10 h-10 rounded-lg bg-accentBright/10 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-inkMuted mb-0.5">{label}</p>
        <p
          className={`font-heading truncate ${
            highlight ? 'text-xl text-accentBright' : 'text-base text-ink'
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

/**
 * Lucky attributes panel with a clean vertical layout.
 * More breathing room than the cramped 3-column grid.
 */
export function LuckyPanel({
  luckyNumber,
  luckyColor,
  luckyDirection,
  luckyMoment,
  luckyNumbers,
  luckyColorEnhanced,
}: LuckyPanelProps) {
  // Prefer enhanced lucky numbers from LLM, fall back to deterministic single number
  const displayNumbers =
    luckyNumbers && luckyNumbers.length > 0
      ? luckyNumbers.join(', ')
      : luckyNumber?.toString() || '-';

  // Prefer LLM-personalized color, fall back to deterministic
  const displayColor = luckyColorEnhanced || luckyColor || '-';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {/* Lucky numbers - highlighted */}
      <LuckyItem
        icon={<Hash className="w-5 h-5 text-accentBright" />}
        label="เลขมงคล"
        value={displayNumbers}
        highlight
      />

      {/* Lucky color */}
      <LuckyItem
        icon={<Palette className="w-5 h-5 text-accentBright" />}
        label="สีมงคล"
        value={displayColor}
      />

      {/* Lucky direction */}
      <LuckyItem
        icon={<Compass className="w-5 h-5 text-accentBright" />}
        label="ทิศมงคล"
        value={luckyDirection || '-'}
      />

      {/* Lucky moment */}
      {luckyMoment && (
        <LuckyItem
          icon={<Clock className="w-5 h-5 text-accentBright" />}
          label="เวลามงคล"
          value={luckyMoment}
        />
      )}
    </motion.div>
  );
}
