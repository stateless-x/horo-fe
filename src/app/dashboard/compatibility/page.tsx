'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from '@/lib-packages/ui';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { THAI_MONTHS, BE_OFFSET, toGregorianYear } from '@/lib-packages/shared';
import { Loader2, ArrowLeft } from 'lucide-react';

/**
 * Compatibility / เข้าใจดวงของทั้งสองคน
 *
 * Features:
 * - Enter partner's birth data manually
 * - Compatibility analysis based on elements and day masters
 * - Educational insights (no numerical scores)
 *
 * Protected route - requires authentication
 */
export default function CompatibilityPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const router = useRouter();
  const [partnerName, setPartnerName] = useState('');
  const [hasResult, setHasResult] = useState(false);

  // Calculation state
  const [calculating, setCalculating] = useState(false);
  const [calculationStep, setCalculationStep] = useState('');
  const [compatibilityResult, setCompatibilityResult] = useState<any>(null);
  const [error, setError] = useState('');

  // Date picker state
  const currentYear = new Date().getFullYear() + BE_OFFSET;
  const [day, setDay] = useState('1');
  const [month, setMonth] = useState('1');
  const [year, setYear] = useState((currentYear - 25).toString());

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!session && !sessionLoading) {
      router.push('/login');
    }
  }, [session, sessionLoading, router]);

  // Show loading state while checking session
  if (sessionLoading || !session) {
    return (
      <div className="min-h-screen bg-voidBlack flex items-center justify-center">
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
          className="w-16 h-16 border-4 border-royalPurple border-t-transparent rounded-full animate-spin"
        />
      </div>
    );
  }

  const handleCalculate = async () => {
    // Validation
    if (!partnerName.trim()) {
      setError('กรุณากรอกชื่อคู่ของเจ้า');
      return;
    }

    const dayNum = parseInt(day);
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    setCalculating(true);
    setError('');
    setHasResult(false);

    try {
      // Progressive loading messages
      setCalculationStep('วิเคราะห์ธาตุของทั้งสองคน...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      setCalculationStep('เปรียบเทียบดาวประจำวัน...');
      await new Promise(resolve => setTimeout(resolve, 800));

      setCalculationStep('ประมวลผลความสัมพันธ์...');

      // Convert BE year to Gregorian
      const gregorianYear = toGregorianYear(yearNum);
      // Create date in UTC to avoid timezone issues
      // monthNum is 1-12, but Date.UTC expects 0-11
      const birthDate = new Date(Date.UTC(gregorianYear, monthNum - 1, dayNum));

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/fortune/compatibility`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          partnerBirthDate: birthDate.toISOString(),
          partnerGender: 'female', // TODO: Add gender selection
          partnerBirthTime: {
            isUnknown: true,
          },
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to calculate compatibility');
      }

      const result = await response.json();
      setCompatibilityResult(result);
      setHasResult(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate compatibility');
    } finally {
      setCalculating(false);
      setCalculationStep('');
    }
  };

  // Loading state during calculation
  if (calculating) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
        {/* Animated background particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-royalPurple/20 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              animate={{
                y: [null, Math.random() * window.innerHeight],
                x: [null, Math.random() * window.innerWidth],
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-8 max-w-md relative z-10"
        >
          {/* Animated spinner with pulsing glow */}
          <div className="relative">
            <div className="w-32 h-32 mx-auto relative">
              {/* Outer glow ring */}
              <motion.div
                className="absolute inset-0 border-4 border-royalPurple/20 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Middle ring */}
              <motion.div
                className="absolute inset-2 border-4 border-amethyst/40 rounded-full"
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />

              {/* Inner spinning ring */}
              <motion.div
                className="absolute inset-4 border-4 border-t-royalPurple border-r-transparent border-b-transparent border-l-transparent rounded-full"
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />

              {/* Center dot */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="w-4 h-4 bg-gradient-to-br from-royalPurple to-amethyst rounded-full shadow-lg shadow-royalPurple/50" />
              </motion.div>
            </div>
          </div>

          {/* Text content */}
          <div className="space-y-3">
            <motion.h2
              className="text-3xl font-heading text-ghostWhite"
              animate={{
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              กำลังคำนวณ...
            </motion.h2>

            <motion.p
              key={calculationStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-lg text-ashGray font-oracle min-h-[28px]"
            >
              {calculationStep}
            </motion.p>

            {/* Progress indicator */}
            <div className="flex justify-center gap-2 mt-4">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-royalPurple/60 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.4, 1, 0.4],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (hasResult && compatibilityResult) {
    return (
      <div className="min-h-screen p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header with Back Button */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Button
              variant="ghost"
              onClick={() => setHasResult(false)}
              className="text-ashGray hover:text-ghostWhite -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              ดูดวงอีกครั้ง
            </Button>

            <div className="text-center space-y-2">
              <h1 className="text-3xl md:text-4xl font-heading text-ghostWhite">เข้าใจดวงของทั้งสองคน</h1>
              <p className="text-ashGray">ความสัมพันธ์ระหว่างเจ้าและ {partnerName}</p>
            </div>
          </motion.div>

          {/* Element Interaction */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-darkPurple to-deepNight">
              <CardHeader>
                <CardTitle className="text-center flex items-center justify-center gap-2">
                  <span className="text-2xl">🌟</span>
                  <span>พลังธาตุของทั้งสองคน</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Element visualization */}
                <div className="flex items-center justify-center gap-4 py-6">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-royalPurple/20 border-2 border-royalPurple flex items-center justify-center mb-2">
                      <span className="text-3xl">{compatibilityResult.user?.element || '🔥'}</span>
                    </div>
                    <p className="text-sm text-ghostWhite">เจ้า</p>
                    <p className="text-xs text-ashGray">{compatibilityResult.user?.dayMaster || 'ธาตุ'}</p>
                  </div>

                  <div className="flex-1 flex items-center justify-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: 'spring' }}
                      className="text-4xl"
                    >
                      ⟷
                    </motion.div>
                  </div>

                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-amethyst/20 border-2 border-amethyst flex items-center justify-center mb-2">
                      <span className="text-3xl">{compatibilityResult.partner?.element || '🌱'}</span>
                    </div>
                    <p className="text-sm text-ghostWhite">{partnerName}</p>
                    <p className="text-xs text-ashGray">{compatibilityResult.partner?.dayMaster || 'ธาตุ'}</p>
                  </div>
                </div>

                <p className="text-center text-ghostWhite/80 leading-relaxed">
                  {compatibilityResult.reading || 'ธาตุของทั้งสองคนมีพลังที่เติมเต็มกัน สร้างความสมดุลในความสัมพันธ์'}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {/* Complementary Strengths */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                  <span className="text-xl">✨</span>
                  <span>พลังที่เติมเต็มกัน</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-400 mt-1 text-lg flex-shrink-0">●</span>
                    <div>
                      <p className="text-ghostWhite font-medium mb-1">
                        ธาตุสนับสนุนกัน
                      </p>
                      <p className="text-ashGray leading-relaxed text-sm md:text-base">
                        องค์ประกอบธาตุของทั้งสองคนช่วยเสริมพลังให้กัน ทำให้เกิดความเข้าใจที่ดี
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-400 mt-1 text-lg flex-shrink-0">●</span>
                    <div>
                      <p className="text-ghostWhite font-medium mb-1">
                        จุดแข็งเสริมจุดอ่อน
                      </p>
                      <p className="text-ashGray leading-relaxed text-sm md:text-base">
                        จุดแข็งของคนหนึ่งช่วยเติมเต็มจุดที่อีกคนต้องการการสนับสนุน
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-400 mt-1 text-lg flex-shrink-0">●</span>
                    <div>
                      <p className="text-ghostWhite font-medium mb-1">
                        เป้าหมายที่สอดคล้อง
                      </p>
                      <p className="text-ashGray leading-relaxed text-sm md:text-base">
                        ทั้งสองมีทิศทางในชีวิตที่ไปในทางเดียวกัน
                      </p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Things to Understand */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                  <span className="text-xl">💭</span>
                  <span>สิ่งที่ควรเข้าใจ</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1 text-lg flex-shrink-0">●</span>
                    <div>
                      <p className="text-ghostWhite font-medium mb-1">
                        วิธีตัดสินใจที่แตกต่าง
                      </p>
                      <p className="text-ashGray leading-relaxed text-sm md:text-base">
                        ทั้งสองคนอาจมีวิธีคิดและตัดสินใจที่ไม่เหมือนกัน ซึ่งเป็นเรื่องปกติ
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1 text-lg flex-shrink-0">●</span>
                    <div>
                      <p className="text-ghostWhite font-medium mb-1">
                        ความต้องการพื้นที่ส่วนตัว
                      </p>
                      <p className="text-ashGray leading-relaxed text-sm md:text-base">
                        การให้พื้นที่แก่กันจะช่วยสร้างสมดุลที่ดีในความสัมพันธ์
                      </p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="bg-gradient-to-br from-royalPurple/10 to-amethyst/5 border-royalPurple/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                  <span className="text-xl">💡</span>
                  <span>คำแนะนำ</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-amethyst flex-shrink-0">→</span>
                    <p className="text-ghostWhite/90 leading-relaxed text-sm md:text-base">
                      สื่อสารอย่างตรงไปตรงมา เปิดใจรับฟังความคิดเห็นของกัน
                    </p>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-amethyst flex-shrink-0">→</span>
                    <p className="text-ghostWhite/90 leading-relaxed text-sm md:text-base">
                      ยอมรับและเคารพความแตกต่างของกัน
                    </p>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-amethyst flex-shrink-0">→</span>
                    <p className="text-ghostWhite/90 leading-relaxed text-sm md:text-base">
                      ใช้จุดแข็งของแต่ละคนเพื่อสนับสนุนกัน
                    </p>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Back to Dashboard */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <Button
              size="lg"
              variant="outline"
              className="w-full"
              onClick={() => setHasResult(false)}
            >
              ดูดวงคู่อีกครั้ง
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="w-full text-ashGray"
              onClick={() => router.push('/dashboard')}
            >
              กลับสู่หน้าหลัก
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="text-ashGray hover:text-ghostWhite -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            กลับ
          </Button>

          <div className="text-center space-y-3">
            <h1 className="text-3xl md:text-4xl font-heading text-ghostWhite">เข้าใจดวงของทั้งสองคน</h1>

            {/* Value Proposition */}
            <div className="bg-darkPurple/20 border border-royalPurple/30 rounded-xl p-4 md:p-6 space-y-3">
              <h3 className="text-lg md:text-xl font-heading text-amethyst">
                ค้นพบความลับของความสัมพันธ์
              </h3>
              <ul className="text-left space-y-2 text-ashGray text-sm md:text-base">
                <li className="flex items-start gap-2">
                  <span className="text-amethyst mt-1 flex-shrink-0">✨</span>
                  <span>วิเคราะห์ธาตุและดาวประจำวันเกิดของทั้งสองคน</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amethyst mt-1 flex-shrink-0">💡</span>
                  <span>รับคำแนะนำเฉพาะตัวสำหรับความสัมพันธ์</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amethyst mt-1 flex-shrink-0">🎯</span>
                  <span>เข้าใจจุดแข็งและสิ่งที่ควรระวัง</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/30 rounded-xl p-4"
          >
            <p className="text-red-400 text-center text-sm md:text-base">{error}</p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">กรอกข้อมูลคู่ของเจ้า</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm text-ashGray mb-2">ชื่อ</label>
                <Input
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  placeholder="ชื่อคู่ของเจ้า"
                  className="text-base"
                />
              </div>

              <div>
                <label className="block text-sm text-ashGray mb-3">
                  วันเกิด
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {/* Day */}
                  <div>
                    <label className="block text-xs text-ashGray/70 mb-2 text-center">
                      วัน
                    </label>
                    <select
                      value={day}
                      onChange={(e) => setDay(e.target.value)}
                      className="w-full h-12 bg-charcoal border border-darkPurple rounded-lg text-center text-base text-ghostWhite focus:ring-2 focus:ring-royalPurple focus:border-transparent transition-all cursor-pointer hover:border-royalPurple/50"
                    >
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Month */}
                  <div>
                    <label className="block text-xs text-ashGray/70 mb-2 text-center">
                      เดือน
                    </label>
                    <select
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                      className="w-full h-12 bg-charcoal border border-darkPurple rounded-lg text-center text-sm text-ghostWhite focus:ring-2 focus:ring-royalPurple focus:border-transparent transition-all cursor-pointer hover:border-royalPurple/50"
                    >
                      {THAI_MONTHS.map((m, i) => (
                        <option key={i} value={i + 1}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Year (Buddhist Era) */}
                  <div>
                    <label className="block text-xs text-ashGray/70 mb-2 text-center">
                      พ.ศ.
                    </label>
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full h-12 bg-charcoal border border-darkPurple rounded-lg text-center text-base text-ghostWhite focus:ring-2 focus:ring-royalPurple focus:border-transparent transition-all cursor-pointer hover:border-royalPurple/50"
                    >
                      {Array.from({ length: 80 }, (_, i) => currentYear - i).map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <p className="text-xs text-ashGray/60 mt-2 text-center">
                  ตัวอย่าง: 15 มิถุนายน 2540
                </p>
              </div>

              <Button
                onClick={handleCalculate}
                size="lg"
                className="w-full"
                disabled={!partnerName.trim() || calculating}
              >
                {calculating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    กำลังคำนวณ...
                  </>
                ) : (
                  'คำนวณความเข้ากัน'
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
