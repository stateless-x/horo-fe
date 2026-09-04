"use client";

import { useState } from "react";
import { Moon, Compass, Palette, Hash, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { BirthStarDetail } from "@/lib-packages/shared/types/astrology";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { localizeColorName, localizeDayName } from "@/lib/thai-localize";

interface BirthStarSectionProps {
  birthStar: BirthStarDetail;
}

interface AttributeBadgeProps {
  icon: React.ElementType;
  label: string;
  value: string;
  tooltip: string;
}

function AttributeBadge({
  icon: Icon,
  label,
  value,
  tooltip,
}: AttributeBadgeProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="relative h-32 cursor-pointer"
      style={{ perspective: '1000px' }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
      >
        {/* Front of card */}
        <div
          className="absolute inset-0 bg-overlay border border-surface2/50 rounded-lg p-4 flex flex-col items-center justify-center"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          <Icon className="text-accentSoft w-5 h-5 mb-2" />
          <p className="text-inkMuted font-thai text-sm text-center mb-1">
            {label}
          </p>
          <p className="text-ink font-heading font-medium text-lg text-center">
            {value}
          </p>
        </div>

        {/* Back of card */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-surface2 to-accent/50 border border-accentBright/50 rounded-lg p-4 flex items-center justify-center"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <p className="text-accentFaint font-thai text-sm text-center leading-relaxed">
            {tooltip}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export function BirthStarSection({ birthStar }: BirthStarSectionProps) {
  return (
    <div>
      {/* Section header */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <Moon className="text-accentSoft w-6 h-6" />
        <h2 className="font-heading text-xl font-medium text-ink">
          ดาวประจำวันเกิดของเจ้า
          <InfoTooltip text="ดาวประจำวันเกิด (Day Master) คือดาวที่ครองวันเกิดของเจ้า บอกถึงพลังงานหลักที่กำกับชีวิตและบุคลิกภาพ" />
        </h2>
      </div>

      {/* Planet name and description */}
      <div className="text-center mb-8">
        <h3 className="font-heading text-2xl md:text-3xl font-semibold text-accentBright mb-2">
          {birthStar.planet}
        </h3>
        <p className="font-oracle text-lg md:text-xl font-light text-ink leading-[1.75] max-w-2xl mx-auto">
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
          value={localizeColorName(birthStar.luckyColor)}
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
          value={localizeDayName(birthStar.luckyDay)}
          tooltip={birthStar.luckyDayTooltip}
        />
      </div>

      {/* Hint text */}
      <p className="text-center text-inkMuted font-thai text-xs">
        แตะการ์ดเพื่อดูวิธีใช้
      </p>
    </div>
  );
}
