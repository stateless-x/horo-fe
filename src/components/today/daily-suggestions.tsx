'use client';

import { motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';

interface DailySuggestionsProps {
  suggestions: string[];
}

export function DailySuggestions({ suggestions }: DailySuggestionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
    >
      <div className="bg-deepNight border border-amethyst/20 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-amethyst" />
          <h3 className="font-heading text-sm md:text-base font-medium text-amethyst">
            คำแนะนำสำหรับเจ้า
          </h3>
        </div>
        <ul className="space-y-2">
          {suggestions.map((item, index) => (
            <li
              key={index}
              className="text-sm md:text-base leading-relaxed text-ghostWhite/80 font-thai pl-3 relative before:content-['·'] before:absolute before:left-0 before:text-amethyst"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
