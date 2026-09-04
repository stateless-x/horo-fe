'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, ShieldAlert, Lightbulb } from 'lucide-react';

interface GuidancePanelProps {
  dos: string[];
  donts: string[];
  warnings?: string[];
  suggestions?: string[];
}

interface GuidanceSectionProps {
  title: string;
  items: string[];
  icon: React.ReactNode;
  accentColor: string;
  bgColor: string;
}

function GuidanceSection({ title, items, icon, accentColor, bgColor }: GuidanceSectionProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className={`rounded-xl p-4 ${bgColor}`}>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className={`font-heading text-sm font-medium ${accentColor}`}>
          {title}
        </h3>
      </div>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li
            key={index}
            className="text-sm leading-relaxed text-ink/80 font-thai pl-4 relative"
          >
            <span className={`absolute left-0 ${accentColor}`}>·</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Consolidated guidance panel combining dos, donts, warnings, and suggestions.
 * Uses a compact layout to reduce vertical space.
 */
export function GuidancePanel({ dos, donts, warnings, suggestions }: GuidancePanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {/* Dos & Donts - side by side on larger screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <GuidanceSection
          title="ควรทำ"
          items={dos}
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          accentColor="text-emerald-400"
          bgColor="bg-emerald-500/5 border border-emerald-500/15"
        />
        <GuidanceSection
          title="ควรเลี่ยง"
          items={donts}
          icon={<AlertTriangle className="w-4 h-4 text-amber-400" />}
          accentColor="text-amber-400"
          bgColor="bg-amber-500/5 border border-amber-500/15"
        />
      </div>

      {/* Warnings - only if present */}
      {warnings && warnings.length > 0 && (
        <GuidanceSection
          title="คำเตือนวันนี้"
          items={warnings}
          icon={<ShieldAlert className="w-4 h-4 text-red-400" />}
          accentColor="text-red-400"
          bgColor="bg-red-500/5 border border-red-500/15"
        />
      )}

      {/* Suggestions - only if present */}
      {suggestions && suggestions.length > 0 && (
        <GuidanceSection
          title="คำแนะนำสำหรับเจ้า"
          items={suggestions}
          icon={<Lightbulb className="w-4 h-4 text-accentBright" />}
          accentColor="text-accentBright"
          bgColor="bg-accentBright/5 border border-accentBright/15"
        />
      )}
    </motion.div>
  );
}
