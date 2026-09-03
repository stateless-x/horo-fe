'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';

interface AmbientAudioToggleProps {
  isMuted: boolean;
  onToggle: () => void;
}

/**
 * Fixed-position speaker toggle button for ambient audio.
 * Positioned top-right, styled to match the onboarding progress indicator.
 */
export function AmbientAudioToggle({
  isMuted,
  onToggle,
}: AmbientAudioToggleProps) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1, duration: 0.3 }}
      onClick={onToggle}
      className="fixed top-6 right-6 z-50 p-2.5 rounded-full bg-overlay/60 backdrop-blur-md border border-surface2/50 text-inkMuted hover:text-ink hover:border-accentBright/50 transition-colors duration-200 cursor-pointer"
      aria-label={isMuted ? 'เปิดเสียง' : 'ปิดเสียง'}
      title={isMuted ? 'เปิดเสียง' : 'ปิดเสียง'}
    >
      <AnimatePresence mode="wait">
        {isMuted ? (
          <motion.div
            key="muted"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <VolumeX className="w-4 h-4" />
          </motion.div>
        ) : (
          <motion.div
            key="unmuted"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Volume2 className="w-4 h-4" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
