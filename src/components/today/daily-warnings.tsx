'use client';

import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';

interface DailyWarningsProps {
  warnings: string[];
}

export function DailyWarnings({ warnings }: DailyWarningsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.65 }}
    >
      <div className="bg-deepNight border border-red-500/20 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <ShieldAlert className="w-4 h-4 text-red-400" />
          <h3 className="font-heading text-sm font-medium text-red-400">
            คำเตือนวันนี้
          </h3>
        </div>
        <ul className="space-y-2">
          {warnings.map((item, index) => (
            <li
              key={index}
              className="text-sm leading-relaxed text-ghostWhite/80 font-thai pl-3 relative before:content-['·'] before:absolute before:left-0 before:text-red-400"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
