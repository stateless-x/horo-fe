'use client';

import { useState } from 'react';
import { Moon, Compass, Palette, Hash, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BirthStarDetail } from '@/lib-packages/shared/types/astrology';

interface BirthStarSectionProps {
  birthStar: BirthStarDetail;
}

interface AttributeBadgeProps {
  icon: React.ElementType;
  label: string;
  value: string;
  tooltip: string;
}

function AttributeBadge({ icon: Icon, label, value, tooltip }: AttributeBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative">
      <div
        className="bg-charcoal border border-darkPurple/50 rounded-lg p-4 cursor-help transition-colors duration-200 hover:bg-darkPurple/30"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
      >
        <Icon className="text-lavenderGlow w-5 h-5 mb-2 mx-auto" />
        <p className="text-ashGray font-thai text-xs text-center mb-1">{label}</p>
        <p className="text-ghostWhite font-heading font-medium text-base text-center">
          {value}
        </p>
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48"
          >
            <div className="bg-darkPurple border border-royalPurple/30 rounded-md shadow-xl shadow-amethyst/5 px-3 py-2">
              <p className="text-paleOrchid font-thai text-sm">{tooltip}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function BirthStarSection({ birthStar }: BirthStarSectionProps) {
  return (
    <div>
      {/* Section header */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <Moon className="text-lavenderGlow w-6 h-6" />
        <h2 className="font-heading text-xl font-medium text-ghostWhite">
          ดาวประจำวันเกิดของคุณ
        </h2>
      </div>

      {/* Planet name and description */}
      <div className="text-center mb-8">
        <h3 className="font-heading text-2xl font-semibold text-amethyst mb-2">
          {birthStar.planet}
        </h3>
        <p className="font-oracle text-base font-light text-ghostWhite leading-relaxed max-w-2xl mx-auto">
          {birthStar.planetDescription}
        </p>
      </div>

      {/* Attribute badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <AttributeBadge
          icon={Compass}
          label="ทิศมงคล"
          value={birthStar.luckyDirection}
          tooltip={birthStar.luckyDirectionTooltip}
        />
        <AttributeBadge
          icon={Palette}
          label="สีประจำวัน"
          value={birthStar.luckyColor}
          tooltip={birthStar.luckyColorTooltip}
        />
        <AttributeBadge
          icon={Hash}
          label="เลขประจำวัน"
          value={birthStar.luckyNumber.toString()}
          tooltip={birthStar.luckyNumberTooltip}
        />
        <AttributeBadge
          icon={Calendar}
          label="วันมงคล"
          value={birthStar.luckyDay}
          tooltip={birthStar.luckyDayTooltip}
        />
      </div>

      {/* Hint text */}
      <p className="text-center text-ashGray font-thai text-xs">
        แตะหรือวางเมาส์บนแต่ละช่องเพื่อดูวิธีใช้
      </p>
    </div>
  );
}
