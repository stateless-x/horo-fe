'use client';

import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/lib-packages/ui';
import { ELEMENT_COLORS } from '@/lib-packages/shared/constants/design';

interface DailyReadingCardProps {
  overallReading: string;
  primaryElement: string | null;
}

export function DailyReadingCard({
  overallReading,
  primaryElement,
}: DailyReadingCardProps) {
  const elementKey = (primaryElement?.toLowerCase() || 'earth') as keyof typeof ELEMENT_COLORS;
  const colors = ELEMENT_COLORS[elementKey] || ELEMENT_COLORS.earth;

  // Split reading into paragraphs for staggered animation
  const paragraphs = overallReading
    .split('\n')
    .filter((p) => p.trim().length > 0);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
    >
      <Card
        className="overflow-hidden"
        style={{
          borderLeftWidth: '3px',
          borderLeftColor: colors.primary,
        }}
      >
        <CardHeader className="bg-gradient-to-br from-darkPurple to-deepNight">
          <CardTitle className="text-center">โชคลาภวันนี้</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {paragraphs.map((paragraph, index) => (
              <motion.p
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.15 }}
                className="text-lg md:text-xl leading-[1.8] text-ghostWhite/90 font-oracle font-light"
              >
                {paragraph}
              </motion.p>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
