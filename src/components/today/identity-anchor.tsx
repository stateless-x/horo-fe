'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { ClientDate } from '@/components/client-date';
import { ELEMENT_COLORS } from '@/lib-packages/shared/constants/design';

const ELEMENT_NAMES_THAI: Record<string, string> = {
  wood: 'ไม้',
  fire: 'ไฟ',
  earth: 'ดิน',
  metal: 'โลหะ',
  water: 'น้ำ',
};

interface IdentityAnchorProps {
  displayName: string;
  primaryElement: string | null;
  planet: string | null;
}

export function IdentityAnchor({
  displayName,
  primaryElement,
  planet,
}: IdentityAnchorProps) {
  const elementKey = (primaryElement?.toLowerCase() || 'earth') as keyof typeof ELEMENT_COLORS;
  const colors = ELEMENT_COLORS[elementKey] || ELEMENT_COLORS.earth;
  const elementNameThai = ELEMENT_NAMES_THAI[elementKey] || primaryElement || 'ดิน';

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-3"
    >
      {/* Element + Planet identity badge */}
      {(primaryElement || planet) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border"
          style={{
            borderColor: `${colors.primary}40`,
            backgroundColor: colors.glow,
          }}
        >
          <Sparkles className="w-3.5 h-3.5" style={{ color: colors.primary }} />
          <span
            className="text-sm font-heading font-medium"
            style={{ color: colors.primary }}
          >
            ธาตุ{elementNameThai}
            {planet && ` · ${planet}`}
          </span>
        </motion.div>
      )}

      {/* Greeting */}
      <p className="text-paleOrchid font-oracle text-base">
        สวัสดี, {displayName}
      </p>

      {/* Main heading */}
      <h1 className="text-3xl sm:text-4xl font-heading text-ghostWhite">
        ดวงชะตาวันนี้
      </h1>

      {/* Date */}
      <ClientDate className="text-ashGray text-base" />

      {/* Freshness pill */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amethyst/10 border border-amethyst/20"
      >
        <motion.span
          className="w-1.5 h-1.5 rounded-full bg-amethyst"
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <span className="text-xs font-heading text-amethyst">ดวงใหม่วันนี้</span>
      </motion.div>
    </motion.div>
  );
}
