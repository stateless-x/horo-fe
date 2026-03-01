'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Briefcase, Wallet, Activity, Lock, Sparkles } from 'lucide-react';
import { Button, OracleText } from '@/lib-packages/ui';
import { useOnboardingStore } from '@/stores/onboarding';
import { api } from '@/lib/api';

const LOCKED_CATEGORIES = [
  { icon: Heart, label: 'ความรัก' },
  { icon: Briefcase, label: 'การงาน' },
  { icon: Wallet, label: 'การเงิน' },
  { icon: Activity, label: 'สุขภาพ' },
];

/**
 * Step 6: Teaser Result
 *
 * IMMEDIATE wow moment:
 * - Personalized LLM reading with personality reveal + fortune hints + cliffhanger
 * - Locked fortune category previews to create FOMO
 * - Strong CTA to drive signup
 * - THIS MUST HAPPEN BEFORE AUTH!
 */
export function StepTeaser() {
  const { profile, setTeaserResult, nextStep, prevStep } = useOnboardingStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);
  const [result, setResult] = useState<{
    elementType: string;
    personality: string;
    todaySnippet: string;
    luckyColor?: string;
    luckyNumber?: number;
  } | null>(null);

  const generateTeaser = async () => {
    try {
      setIsLoading(true);
      setHasFailed(false);

      const data = await api.post<{
        elementType: string;
        personality: string;
        todaySnippet: string;
        luckyColor?: string;
        luckyNumber?: number;
      }>('/api/fortune/teaser', profile);

      setResult(data);
      setTeaserResult(data);
    } catch (error: any) {
      console.error('Failed to generate teaser:', error);

      if (error?.status === 429) {
        setIsRateLimited(true);
        setResult(null);
      } else {
        setHasFailed(true);
        setResult(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateTeaser();
  }, [profile, setTeaserResult]);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center p-6"
      >
        <div className="text-center space-y-4">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-16 h-16 mx-auto border-4 border-royalPurple border-t-transparent rounded-full animate-spin"
          />
          <p className="text-ashGray font-oracle text-lg">
            กำลังมองดูดวงชะตาของเจ้า...
          </p>
        </div>
      </motion.div>
    );
  }

  // Rate limited state
  if (isRateLimited) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="min-h-screen flex items-center justify-center p-6"
      >
        <div className="w-full max-w-lg space-y-6 text-center">
          <Sparkles className="w-12 h-12 mx-auto text-amethyst" />
          <h2 className="text-2xl font-heading text-ghostWhite">
            เจ้ากลับมาบ่อยนะ
          </h2>
          <p className="text-ashGray font-oracle text-lg leading-relaxed">
            ข้าเห็นว่าเจ้าสนใจดวงชะตามาก ลองกลับมาใหม่พรุ่งนี้สิ
            แล้วข้าจะเปิดเผยดวงของเจ้าให้
          </p>
          <Button variant="outline" size="lg" onClick={prevStep}>
            ย้อนกลับ
          </Button>
        </div>
      </motion.div>
    );
  }

  // LLM generation failed
  if (hasFailed) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="min-h-screen flex items-center justify-center p-6"
      >
        <div className="w-full max-w-lg space-y-6 text-center">
          <Sparkles className="w-12 h-12 mx-auto text-ashGray" />
          <h2 className="text-2xl font-heading text-ghostWhite">
            ดวงชะตายังไม่พร้อมเปิดเผย
          </h2>
          <p className="text-ashGray font-oracle text-lg leading-relaxed">
            ข้าไม่สามารถอ่านดวงของเจ้าได้ในตอนนี้ ลองอีกครั้งสิ
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" size="lg" onClick={prevStep}>
              ย้อนกลับ
            </Button>
            <Button size="lg" onClick={generateTeaser}>
              ลองอีกครั้ง
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen flex items-center justify-center p-6"
    >
      <div className="w-full max-w-lg space-y-6">
        {/* Main Reading Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-deepNight border border-darkPurple rounded-lg p-6 space-y-5"
        >
          {/* Element + Lucky Info Row */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-ashGray mb-1">องค์ประกอบหลัก</p>
              <p className="text-2xl font-heading text-amethyst capitalize">
                {result?.elementType}
              </p>
            </div>
            {(result?.luckyColor || result?.luckyNumber) && (
              <div className="flex gap-4">
                {result?.luckyColor && (
                  <div className="text-right">
                    <p className="text-xs text-ashGray mb-0.5">สีมงคล</p>
                    <p className="text-sm text-ghostWhite">
                      {result.luckyColor}
                    </p>
                  </div>
                )}
                {result?.luckyNumber && (
                  <div className="text-right">
                    <p className="text-xs text-ashGray mb-0.5">เลขมงคล</p>
                    <p className="text-sm text-ghostWhite">
                      {result.luckyNumber}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <hr className="border-darkPurple" />

          {/* Oracle Reading */}
          <OracleText
            text={result?.todaySnippet || ''}
            className="text-base leading-relaxed"
          />
        </motion.div>

        {/* Locked Fortune Previews */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-3"
        >
          <p className="text-sm text-ashGray text-center">
            ดวงชะตาของเจ้ายังมีอีกมาก
          </p>

          <div className="grid grid-cols-2 gap-2">
            {LOCKED_CATEGORIES.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-lg border border-royalPurple/10 bg-deepNight/50 px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-royalPurple/40" />
                  <span className="text-sm text-ashGray">{label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-ashGray/50">?/5</span>
                  <Lock className="w-3 h-3 text-ashGray/30" />
                </div>
              </div>
            ))}
          </div>

          <div className="text-center space-y-0.5">
            <p className="text-xs text-ashGray/60">
              + ทำนายรายปี รายวัน
            </p>
            <p className="text-xs text-ashGray/60">
              + ดูดวงคู่ความเข้ากัน
            </p>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="space-y-3"
        >
          <div className="flex gap-3">
            <Button variant="outline" size="lg" onClick={prevStep}>
              ย้อนกลับ
            </Button>
            <Button onClick={nextStep} size="lg" className="flex-1">
              เปิดดวงทั้งหมดของเจ้า
            </Button>
          </div>
          <p className="text-xs text-ashGray/50 text-center">
            ดูดวงชะตาครบ 6 ด้าน + ทำนายรายวัน
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
