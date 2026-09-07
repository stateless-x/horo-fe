'use client';

import { motion } from 'framer-motion';

interface StepHeadingProps {
  title: string;
  /**
   * One line answering "why does the oracle ask this". Omit when the reason
   * is obvious; the oracle voice (Sarabun Light) marks it as ข้า speaking.
   */
  description?: string;
  /** Lets a lone input point at the heading via aria-labelledby. */
  id?: string;
}

/**
 * Shared question heading for onboarding steps: one balanced title and an
 * optional why-line, faded in together so every step opens the same way.
 */
export function StepHeading({ title, description, id }: StepHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="text-center space-y-3"
    >
      <h1 id={id} className="text-2xl md:text-3xl text-ink font-heading text-balance">
        {title}
      </h1>
      {description && (
        <p className="mx-auto max-w-sm font-oracle text-base leading-relaxed text-inkMuted text-balance">
          {description}
        </p>
      )}
    </motion.div>
  );
}
