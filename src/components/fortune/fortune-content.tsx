import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/lib-packages/ui';
import { useOnboardingStore } from '@/stores/onboarding';
import { useFortuneStore } from '@/stores/fortune';
import { useFortuneShare } from '@/hooks/use-fortune-share';
import type { FortuneReading } from '@/hooks/use-fortune-generation';

interface FortuneContentProps {
  fortuneReading: FortuneReading;
  userName?: string;
}

/**
 * Fortune Content Component
 *
 * Displays the complete fortune reading including:
 * - Four Pillars Chart
 * - Thai Astrology
 * - Narrative with streaming effect
 * - Share and navigation buttons
 */
export function FortuneContent({ fortuneReading, userName }: FortuneContentProps) {
  const router = useRouter();
  const { teaserResult } = useOnboardingStore();
  const { narrativeChunks } = useFortuneStore();
  const { handleShare, shareStatus } = useFortuneShare();

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2 md:space-y-3"
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading text-ghostWhite">
            ดวงชะตาของเจ้า
          </h1>
          <p className="text-sm md:text-base text-ashGray font-oracle">
            {userName || 'ผู้มาเยือน'}
          </p>
        </motion.div>

        {/* Teaser Result Summary */}
        {teaserResult.elementType && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-darkPurple to-deepNight border-royalPurple/50">
              <CardContent className="pt-6">
                <div className="text-center space-y-3 md:space-y-4">
                  <p className="text-xs md:text-sm text-paleOrchid/80 uppercase tracking-wider">
                    องค์ประกอบหลัก
                  </p>
                  <p className="text-3xl md:text-4xl lg:text-5xl font-heading text-amethyst capitalize">
                    {teaserResult.elementType}
                  </p>
                  {(teaserResult.luckyColor || teaserResult.luckyNumber) && (
                    <div className="flex gap-4 md:gap-6 justify-center pt-2">
                      {teaserResult.luckyColor && (
                        <div className="text-center">
                          <p className="text-xs text-ashGray mb-1">สีมงคล</p>
                          <p className="text-sm md:text-base text-ghostWhite">{teaserResult.luckyColor}</p>
                        </div>
                      )}
                      {teaserResult.luckyNumber && (
                        <div className="text-center">
                          <p className="text-xs text-ashGray mb-1">เลขมงคล</p>
                          <p className="text-sm md:text-base text-ghostWhite">{teaserResult.luckyNumber}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Four Pillars Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="bg-gradient-to-br from-darkPurple to-deepNight">
              <CardTitle className="text-center text-base md:text-lg">
                สี่เสาชะตา (Four Pillars)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {[
                  { label: 'ปี', pillar: fortuneReading.baziChart.yearPillar },
                  { label: 'เดือน', pillar: fortuneReading.baziChart.monthPillar },
                  { label: 'วัน', pillar: fortuneReading.baziChart.dayPillar },
                  { label: 'ชั่วโมง', pillar: fortuneReading.baziChart.hourPillar },
                ].map((item, idx) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                    className="bg-deepNight border border-darkPurple rounded-lg p-3 md:p-4 text-center space-y-2"
                  >
                    <p className="text-xs text-ashGray">{item.label}</p>
                    {item.pillar ? (
                      <div className="space-y-1">
                        <p className="text-base md:text-lg font-heading text-amethyst">
                          {item.pillar.stem}
                        </p>
                        <p className="text-base md:text-lg font-heading text-ghostWhite">
                          {item.pillar.branch}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-ashGray/50 italic">ไม่ทราบ</p>
                    )}
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-6 p-4 bg-darkPurple/30 rounded-lg text-center"
              >
                <p className="text-xs md:text-sm text-ashGray mb-1">จุ๊ของเจ้า (Day Master)</p>
                <p className="text-2xl md:text-3xl font-heading text-royalPurple capitalize">
                  {fortuneReading.baziChart.dayMaster} ({fortuneReading.baziChart.element})
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Thai Astrology */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base md:text-lg">โหราศาสตร์ไทย</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 text-center">
                <div>
                  <p className="text-xs text-ashGray mb-1">วันเกิด</p>
                  <p className="text-sm md:text-base text-ghostWhite font-oracle">
                    {fortuneReading.thaiAstrology.day}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-ashGray mb-1">ดาวประจำวัน</p>
                  <p className="text-sm md:text-base text-ghostWhite font-oracle">
                    {fortuneReading.thaiAstrology.planet}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-ashGray mb-1">ทิศมงคล</p>
                  <p className="text-sm md:text-base text-ghostWhite font-oracle">
                    {fortuneReading.thaiAstrology.luckyDirection}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Full Narrative - Streaming */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base md:text-lg">คำทำนายโดยละเอียด</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 font-oracle font-light text-sm md:text-base text-ghostWhite/90 leading-relaxed">
                <AnimatePresence>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {narrativeChunks.join(' ')}
                    {narrativeChunks.length < fortuneReading.narrative.split(' ').length && (
                      <motion.span
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="inline-block w-1 h-4 bg-amethyst ml-1"
                      />
                    )}
                  </motion.p>
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-3 md:gap-4"
        >
          <button
            onClick={() => router.push('/dashboard')}
            className="flex-1 py-3 md:py-4 bg-royalPurple hover:bg-amethyst text-ghostWhite rounded-lg transition-all font-heading text-sm md:text-base"
          >
            ไปยังแดชบอร์ด
          </button>
          <button
            onClick={() => handleShare(fortuneReading)}
            className="flex-1 py-3 md:py-4 border-2 border-darkPurple hover:border-amethyst text-ghostWhite rounded-lg transition-all font-heading text-sm md:text-base relative"
          >
            {shareStatus === 'copied' ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                คัดลอกแล้ว!
              </span>
            ) : (
              'แชร์ดวงชะตา'
            )}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
