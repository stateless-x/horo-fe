'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface HeroSectionProps {
  personalityTraits: string[];
  birthDateFormatted: string;
  currentAge: string;
  userName: string;
  element?: string;
  elementAccent?: string;
  loadingState?: 'loading' | 'complete';
}

export function HeroSection({
  personalityTraits,
  birthDateFormatted,
  currentAge,
  userName,
  element,
  elementAccent,
  loadingState = 'complete',
}: HeroSectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const elementTextColor = element ? `var(--el-${element})` : 'var(--accent-bright)';

  return (
    <div className="glass-card relative rounded-3xl md:rounded-[32px] p-6 sm:p-8 md:p-12 text-center overflow-hidden">
      {/* Element-tinted glow orbs */}
      <div
        className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 rounded-full blur-3xl opacity-10 -z-10"
        style={{ backgroundColor: elementAccent || 'var(--accent-bright)' }}
      />
      <div
        className="absolute bottom-0 left-0 w-40 h-40 md:w-56 md:h-56 rounded-full blur-3xl opacity-5 -z-10"
        style={{ backgroundColor: elementAccent || 'var(--accent-bright)' }}
      />

      {/* Badge */}
      <motion.div
        className="inline-flex items-center justify-center mb-6 md:mb-8"
        initial={shouldReduceMotion ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="relative group cursor-default">
          <div
            className="absolute inset-0 rounded-full blur-xl opacity-30"
            style={{ backgroundColor: elementAccent || 'var(--accent-bright)' }}
          />
          <div
            className="relative bg-edgeSoft backdrop-blur-md border border-edge text-accentSoft rounded-full px-5 py-2 text-sm md:text-base font-heading font-medium flex items-center gap-2 transition-all duration-300 group-hover:scale-105"
            style={{
              boxShadow: `0 0 30px ${elementAccent ? `${elementAccent}30` : 'color-mix(in srgb, var(--accent-bright) 20%, transparent)'}`,
            }}
          >
            <Sparkles className="w-4 h-4" style={{ color: elementAccent || 'var(--accent-bright)' }} />
            <span>คำทำนายของเจ้าพร้อมแล้ว</span>
          </div>
        </div>
      </motion.div>

      {/* User name */}
      <motion.div
        className="mb-3 md:mb-4"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: shouldReduceMotion ? 0 : 0.1 }}
      >
        <h1 className="font-heading text-ink font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl inline-block">
          ดวงชะตาของ <span style={{ color: elementTextColor }}>{userName}</span>
        </h1>
      </motion.div>

      {/* Birth date and age */}
      <motion.div
        className="flex items-center justify-center gap-2 md:gap-3 mb-8 md:mb-10"
        initial={shouldReduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: shouldReduceMotion ? 0 : 0.15 }}
      >
        <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-accentSoft/30" />
        <p className="font-thai text-inkMuted text-sm md:text-base flex items-center gap-2">
          <span>{birthDateFormatted}</span>
          <span className="text-accentSoft/50">·</span>
          <span>อายุ {currentAge}</span>
        </p>
        <div className="w-8 h-[1px] bg-gradient-to-l from-transparent to-accentSoft/30" />
      </motion.div>

      {/* Personality traits */}
      <motion.div
        className="flex flex-wrap items-center justify-center gap-2 md:gap-3 max-w-3xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: shouldReduceMotion ? 0 : 0.06, delayChildren: shouldReduceMotion ? 0 : 0.2 },
          },
        }}
      >
        {personalityTraits.map((trait, index) => (
          <motion.div
            key={index}
            className="group relative cursor-default"
            variants={{
              hidden: shouldReduceMotion ? {} : { opacity: 0, y: 8 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <div
              className="absolute inset-0 rounded-full blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300"
              style={{ backgroundColor: elementAccent || 'var(--accent-bright)' }}
            />
            <div
              className="relative px-4 py-2 rounded-full text-sm md:text-base font-thai transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1"
              style={{
                backgroundColor: elementAccent ? `${elementAccent}15` : 'color-mix(in srgb, var(--accent-bright) 8%, transparent)',
                border: `1px solid ${elementAccent ? `${elementAccent}30` : 'color-mix(in srgb, var(--accent-bright) 20%, transparent)'}`,
                color: elementTextColor,
              }}
            >
              {trait}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
