'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

interface DailyGuidanceProps {
  dos: string[];
  donts: string[];
}

export function DailyGuidance({ dos, donts }: DailyGuidanceProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="grid grid-cols-2 gap-3"
    >
      {/* Dos */}
      <div className="bg-deepNight border border-emerald-500/20 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <h3 className="font-heading text-sm md:text-base font-medium text-emerald-400">
            ควรทำ
          </h3>
        </div>
        <ul className="space-y-2">
          {dos.map((item, index) => (
            <li
              key={index}
              className="text-sm md:text-base leading-relaxed text-ghostWhite/80 font-thai pl-3 relative before:content-['·'] before:absolute before:left-0 before:text-emerald-400"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Don'ts */}
      <div className="bg-deepNight border border-amber-500/20 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <h3 className="font-heading text-sm md:text-base font-medium text-amber-400">
            ควรเลี่ยง
          </h3>
        </div>
        <ul className="space-y-2">
          {donts.map((item, index) => (
            <li
              key={index}
              className="text-sm md:text-base leading-relaxed text-ghostWhite/80 font-thai pl-3 relative before:content-['·'] before:absolute before:left-0 before:text-amber-400"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
