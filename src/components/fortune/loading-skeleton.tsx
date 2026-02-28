import { motion } from 'framer-motion';
import { Card, CardHeader, CardContent } from '@/lib-packages/ui';
import type { LoadingState } from '@/stores/fortune';

interface LoadingSkeletonProps {
  loadingState: LoadingState;
}

/**
 * Loading Skeleton Component
 *
 * Displays animated loading states during fortune generation.
 * Shows different messages based on the current loading state.
 */
export function LoadingSkeleton({ loadingState }: LoadingSkeletonProps) {
  const getLoadingMessage = () => {
    switch (loadingState) {
      case 'saving-profile':
        return 'กำลังบันทึกข้อมูลของเจ้า...';
      case 'generating-chart':
        return 'กำลังวิเคราะห์ดวงชะตา...';
      case 'generating-narrative':
        return 'กำลังวิเคราะห์ดวงชะตา...';
      case 'initializing':
      default:
        return 'กำลังเตรียมการ...';
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
        {/* Header Skeleton */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2 md:space-y-4"
        >
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="h-8 md:h-10 bg-darkPurple/50 rounded-lg w-3/4 mx-auto"
          />
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
            className="h-4 md:h-5 bg-darkPurple/30 rounded-lg w-1/2 mx-auto"
          />
        </motion.div>

        {/* Status Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 border-4 border-royalPurple border-t-transparent rounded-full animate-spin"
          />
          <p className="text-paleOrchid font-oracle text-base md:text-lg">
            {getLoadingMessage()}
          </p>
        </motion.div>

        {/* Four Pillars Skeleton */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-darkPurple to-deepNight">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="h-6 bg-royalPurple/30 rounded w-1/3 mx-auto"
            />
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {[1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-deepNight border border-darkPurple rounded-lg p-3 md:p-4 space-y-2"
                >
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
                    className="h-3 bg-darkPurple/50 rounded w-2/3 mx-auto"
                  />
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 + 0.2 }}
                    className="h-6 bg-amethyst/30 rounded w-full"
                  />
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 + 0.4 }}
                    className="h-6 bg-ghostWhite/20 rounded w-full"
                  />
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Narrative Skeleton */}
        <Card>
          <CardHeader>
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="h-6 bg-royalPurple/30 rounded w-1/2"
            />
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.15 }}
                  className="h-4 bg-ghostWhite/10 rounded w-full"
                />
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
