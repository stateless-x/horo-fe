'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from '@/lib-packages/ui';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { THAI_MONTHS, BE_OFFSET, toGregorianYear } from '@/lib-packages/shared';
import { Loader2 } from 'lucide-react';

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
  const [day, setDay] = useState(1);
  const [month, setMonth] = useState(0);
  const [year, setYear] = useState(currentYear - 25);

  const dayRef = useRef<HTMLSelectElement>(null);
  const monthRef = useRef<HTMLSelectElement>(null);
  const yearRef = useRef<HTMLSelectElement>(null);

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!session && !sessionLoading) {
      router.push('/login');
    }
  }, [session, sessionLoading, router]);

  // Center the selected option in the viewport
  const centerSelectedOption = (selectElement: HTMLSelectElement | null) => {
    if (!selectElement) return;

    const selectedOption = selectElement.options[selectElement.selectedIndex];
    if (!selectedOption) return;

    const optionHeight = selectedOption.offsetHeight;
    const selectHeight = selectElement.clientHeight;
    const scrollTo = selectedOption.offsetTop - (selectHeight / 2) + (optionHeight / 2);

    selectElement.scrollTop = scrollTo;
  };

  // Center options when values change
  useEffect(() => {
    centerSelectedOption(dayRef.current);
    centerSelectedOption(monthRef.current);
    centerSelectedOption(yearRef.current);
  }, [day, month, year]);

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
    if (!partnerName.trim()) {
      setError('กรุณากรอกชื่อคู่ของเจ้า');
      return;
    }

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
      const gregorianYear = toGregorianYear(year);
      const birthDate = new Date(gregorianYear, month, day);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fortune/compatibility`, {
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
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 max-w-md"
        >
          <div className="relative">
            <div className="w-24 h-24 mx-auto">
              <div className="absolute inset-0 border-4 border-royalPurple/30 rounded-full" />
              <div className="absolute inset-0 border-4 border-t-royalPurple rounded-full animate-spin" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-heading text-ghostWhite">กำลังคำนวณ...</h2>
            <motion.p
              key={calculationStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-lg text-ashGray font-oracle"
            >
              {calculationStep}
            </motion.p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (hasResult && compatibilityResult) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-2"
          >
            <h1 className="text-4xl font-heading text-ghostWhite">เข้าใจดวงของทั้งสองคน</h1>
            <p className="text-ashGray">ความสัมพันธ์ระหว่างเจ้าและ {partnerName}</p>
          </motion.div>

          {/* Element Interaction */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
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
                      transition={{ delay: 0.4, type: 'spring' }}
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
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Complementary Strengths */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-xl">✨</span>
                  <span>พลังที่เติมเต็มกัน</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-400 mt-1 text-lg">●</span>
                    <div>
                      <p className="text-ghostWhite font-medium mb-1">
                        ธาตุสนับสนุนกัน
                      </p>
                      <p className="text-ashGray leading-relaxed">
                        องค์ประกอบธาตุของทั้งสองคนช่วยเสริมพลังให้กัน ทำให้เกิดความเข้าใจที่ดี
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-400 mt-1 text-lg">●</span>
                    <div>
                      <p className="text-ghostWhite font-medium mb-1">
                        จุดแข็งเสริมจุดอ่อน
                      </p>
                      <p className="text-ashGray leading-relaxed">
                        จุดแข็งของคนหนึ่งช่วยเติมเต็มจุดที่อีกคนต้องการการสนับสนุน
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-400 mt-1 text-lg">●</span>
                    <div>
                      <p className="text-ghostWhite font-medium mb-1">
                        เป้าหมายที่สอดคล้อง
                      </p>
                      <p className="text-ashGray leading-relaxed">
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
                <CardTitle className="flex items-center gap-2">
                  <span className="text-xl">💭</span>
                  <span>สิ่งที่ควรเข้าใจ</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1 text-lg">●</span>
                    <div>
                      <p className="text-ghostWhite font-medium mb-1">
                        วิธีตัดสินใจที่แตกต่าง
                      </p>
                      <p className="text-ashGray leading-relaxed">
                        ทั้งสองคนอาจมีวิธีคิดและตัดสินใจที่ไม่เหมือนกัน ซึ่งเป็นเรื่องปกติ
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1 text-lg">●</span>
                    <div>
                      <p className="text-ghostWhite font-medium mb-1">
                        ความต้องการพื้นที่ส่วนตัว
                      </p>
                      <p className="text-ashGray leading-relaxed">
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
                <CardTitle className="flex items-center gap-2">
                  <span className="text-xl">💡</span>
                  <span>คำแนะนำ</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-amethyst">→</span>
                    <p className="text-ghostWhite/90 leading-relaxed">
                      สื่อสารอย่างตรงไปตรงมา เปิดใจรับฟังความคิดเห็นของกัน
                    </p>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-amethyst">→</span>
                    <p className="text-ghostWhite/90 leading-relaxed">
                      ยอมรับและเคารพความแตกต่างของกัน
                    </p>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-amethyst">→</span>
                    <p className="text-ghostWhite/90 leading-relaxed">
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
            transition={{ delay: 0.6 }}
          >
            <Button
              size="lg"
              variant="outline"
              className="w-full"
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
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-heading text-ghostWhite">เข้าใจดวงของทั้งสองคน</h1>

          {/* Value Proposition */}
          <div className="bg-darkPurple/20 border border-royalPurple/30 rounded-xl p-6 space-y-4">
            <h3 className="text-xl font-heading text-amethyst">
              ค้นพบความลับของความสัมพันธ์
            </h3>
            <ul className="text-left space-y-2 text-ashGray text-base">
              <li className="flex items-start gap-2">
                <span className="text-amethyst mt-1">✨</span>
                <span>วิเคราะห์ธาตุและดาวประจำวันเกิดของทั้งสองคน</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amethyst mt-1">💡</span>
                <span>รับคำแนะนำเฉพาะตัวสำหรับความสัมพันธ์</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amethyst mt-1">🎯</span>
                <span>เข้าใจจุดแข็งและสิ่งที่ควรระวัง</span>
              </li>
            </ul>
          </div>

        </motion.div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/30 rounded-xl p-4"
          >
            <p className="text-red-400 text-center">{error}</p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>กรอกข้อมูลคู่ของเจ้า</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm text-ashGray mb-2">ชื่อ</label>
                <Input
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  placeholder="ชื่อคู่ของเจ้า"
                />
              </div>

              <div>
                <label className="block text-sm text-ashGray mb-2">
                  วันเกิด
                </label>
                {/* Date Picker Wheels */}
                <div className="flex gap-3">
                  {/* Day */}
                  <div className="flex-1 relative">
                    <label className="block text-xs text-ashGray/70 mb-1 text-center">
                      วัน
                    </label>
                    <div className="relative">
                      {/* Center highlight overlay */}
                      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-10 bg-royalPurple/10 border-y border-royalPurple/30 pointer-events-none z-10" />
                      <select
                        ref={dayRef}
                        value={day}
                        onChange={(e) => setDay(parseInt(e.target.value))}
                        className="w-full h-40 bg-deepNight border border-darkPurple rounded-lg text-center text-base text-ghostWhite focus:ring-2 focus:ring-royalPurple focus:border-transparent overflow-y-auto scroll-smooth relative z-0"
                        size={5}
                      >
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                          <option key={d} value={d} className="py-1.5">
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Month */}
                  <div className="flex-1 relative">
                    <label className="block text-xs text-ashGray/70 mb-1 text-center">
                      เดือน
                    </label>
                    <div className="relative">
                      {/* Center highlight overlay */}
                      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-10 bg-royalPurple/10 border-y border-royalPurple/30 pointer-events-none z-10" />
                      <select
                        ref={monthRef}
                        value={month}
                        onChange={(e) => setMonth(parseInt(e.target.value))}
                        className="w-full h-40 bg-deepNight border border-darkPurple rounded-lg text-center text-base text-ghostWhite focus:ring-2 focus:ring-royalPurple focus:border-transparent overflow-y-auto scroll-smooth relative z-0"
                        size={5}
                      >
                        {THAI_MONTHS.map((m, i) => (
                          <option key={i} value={i} className="py-1.5">
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Year (Buddhist Era) */}
                  <div className="flex-1 relative">
                    <label className="block text-xs text-ashGray/70 mb-1 text-center">
                      พ.ศ.
                    </label>
                    <div className="relative">
                      {/* Center highlight overlay */}
                      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-10 bg-royalPurple/10 border-y border-royalPurple/30 pointer-events-none z-10" />
                      <select
                        ref={yearRef}
                        value={year}
                        onChange={(e) => setYear(parseInt(e.target.value))}
                        className="w-full h-40 bg-deepNight border border-darkPurple rounded-lg text-center text-base text-ghostWhite focus:ring-2 focus:ring-royalPurple focus:border-transparent overflow-y-auto scroll-smooth relative z-0"
                        size={5}
                      >
                        {Array.from({ length: 70 }, (_, i) => currentYear - i).map((y) => (
                          <option key={y} value={y} className="py-1.5">
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleCalculate}
                size="lg"
                className="w-full"
                disabled={!partnerName || calculating}
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
