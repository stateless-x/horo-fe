'use client';

import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { KofiWidget } from './kofi-widget';

export function KofiDonationBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
        delay: 0.2,
      }}
      className="max-w-4xl mx-auto px-4 mt-8 mb-4"
    >
      <div className="bg-deepNight border border-darkPurple/50 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Text content */}
          <div className="flex items-center gap-3">
            <span className="text-2xl" aria-hidden="true">☕✨</span>
            <div>
              <p className="font-heading text-sm font-medium text-ghostWhite">
                ดูดวงฟรีไม่อั้น ไม่มีกั๊ก
              </p>
              <p className="font-thai text-xs text-lavender mt-0.5 flex items-center gap-1">
                ชอบใจ? ฝากค่ากาแฟพี่ภูได้นะ <Heart className="inline w-3 h-3 text-pink-400" />
              </p>
            </div>
          </div>

          {/* Ko-fi widget button */}
          <motion.div
            animate={{ scale: [1, 1.04, 1] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
              ease: 'easeInOut',
            }}
          >
            <KofiWidget>
              ☕ Ko-fi
            </KofiWidget>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
