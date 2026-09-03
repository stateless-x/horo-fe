'use client';

import { useState } from 'react';
import { Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface InfoTooltipProps {
  text: string;
  className?: string;
}

/**
 * Info tooltip that works on both desktop (hover) and mobile (tap)
 * Shows a small info icon that reveals explanation text
 */
export function InfoTooltip({ text, className = '' }: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <span className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="ml-1 p-0.5 text-inkMuted/60 hover:text-inkMuted transition-colors"
        aria-label="ดูคำอธิบาย"
      >
        <Info className="w-3.5 h-3.5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 rounded-xl bg-overlay border border-surface2/50 shadow-lg shadow-black/20"
          >
            <p className="text-xs text-ink/80 leading-relaxed font-thai">
              {text}
            </p>
            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
              <div className="w-2 h-2 bg-overlay border-r border-b border-surface2/50 transform rotate-45" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}
