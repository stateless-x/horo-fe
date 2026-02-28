'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from '@/lib-packages/ui';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { ShareSheet } from '@/components/share/share-sheet';
import { THAI_MONTHS, BE_OFFSET, toGregorianYear } from '@/lib-packages/shared';

/**
 * Compatibility / ดูดวงคู่ (VIRAL FEATURE)
 *
 * Features:
 * - Enter partner's birth data OR send invite link
 * - Compatibility analysis
 * - Generate shareable card
 * - Invite flow: User A shares → User B enters data → both see result → User B becomes new user
 *
 * Protected route - requires authentication
 */
export default function CompatibilityPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const router = useRouter();
  const [partnerName, setPartnerName] = useState('');
  const [hasResult, setHasResult] = useState(false);
  const [shareSheetOpen, setShareSheetOpen] = useState(false);

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

  const handleCalculate = () => {
    // Mock calculation
    setHasResult(true);
  };

  if (hasResult) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-2"
          >
            <h1 className="text-4xl font-heading text-ghostWhite">ดวงคู่ของเจ้า</h1>
            <p className="text-ashGray">ความเข้ากันได้ระหว่างเจ้าและ {partnerName}</p>
          </motion.div>

          {/* Compatibility Score */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-darkPurple to-deepNight">
              <CardContent className="py-12 text-center space-y-4">
                <p className="text-sm text-ashGray">คะแนนความเข้ากัน</p>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                  className="text-7xl font-heading text-amethyst"
                >
                  75
                </motion.div>
                <p className="text-xl text-ghostWhite">ความเข้ากันได้ระดับดี</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>จุดเด่น</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 mt-1">✓</span>
                    <p className="text-ghostWhite/90 leading-relaxed">
                      องค์ประกอบธาตุสนับสนุนซึ่งกันและกัน ทำให้มีความเข้าใจที่ดี
                    </p>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 mt-1">✓</span>
                    <p className="text-ghostWhite/90 leading-relaxed">
                      ทั้งสองมีเป้าหมายในชีวิตที่คล้ายกัน
                    </p>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 mt-1">✓</span>
                    <p className="text-ghostWhite/90 leading-relaxed">
                      สามารถเติมเต็มจุดอ่อนของกันและกันได้ดี
                    </p>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>สิ่งที่ควรระวัง</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-yellow-500 mt-1">!</span>
                    <p className="text-ghostWhite/90 leading-relaxed">
                      อาจมีความขัดแย้งเรื่องการตัดสินใจบางครั้ง
                    </p>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-yellow-500 mt-1">!</span>
                    <p className="text-ghostWhite/90 leading-relaxed">
                      ควรให้พื้นที่ส่วนตัวแก่กัน
                    </p>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Share Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Button
              size="lg"
              className="w-full"
              onClick={() => setShareSheetOpen(true)}
            >
              แชร์ผลดูดวงคู่
            </Button>
          </motion.div>

          {/* Share Sheet */}
          <ShareSheet
            isOpen={shareSheetOpen}
            onClose={() => setShareSheetOpen(false)}
            shareData={{
              type: 'compatibility',
              userName: session?.user?.name || 'เจ้า',
              partnerName: partnerName,
              score: 75,
              url: typeof window !== 'undefined' ? window.location.href : '',
            }}
          />
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
          <h1 className="text-4xl font-heading text-ghostWhite">ดูดวงคู่</h1>
          <p className="text-ashGray leading-relaxed">
            ระบบจะวิเคราะห์ธาตุ เสาชะตา และดาวประจำวันเกิดของทั้งสองคน
            <br />
            เพื่อดูว่าดวงเข้ากันแค่ไหน พร้อมคำแนะนำสำหรับความสัมพันธ์
          </p>
        </motion.div>

        {/* Invite Flow - PRIMARY */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-darkPurple/30 to-deepNight border-royalPurple/30">
            <CardHeader>
              <CardTitle className="text-center">วิธีที่แนะนำ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step-by-step visual */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-royalPurple/20 border border-royalPurple flex items-center justify-center text-sm font-heading text-royalPurple">
                    1
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-ghostWhite/90 leading-relaxed">
                      เจ้าส่งลิงก์เชิญให้คู่ของเจ้า
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-royalPurple/20 border border-royalPurple flex items-center justify-center text-sm font-heading text-royalPurple">
                    2
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-ghostWhite/90 leading-relaxed">
                      คู่ของเจ้ากรอกวันเกิดผ่านลิงก์
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-royalPurple/20 border border-royalPurple flex items-center justify-center text-sm font-heading text-royalPurple">
                    3
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-ghostWhite/90 leading-relaxed">
                      ทั้งสองคนเห็นผลพร้อมกัน!
                    </p>
                  </div>
                </div>
              </div>

              <Button size="lg" className="w-full">
                ส่งลิงก์เชิญให้คู่ของเจ้า
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="relative"
        >
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-darkPurple" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-voidBlack text-ashGray">หรือกรอกข้อมูลเอง</span>
          </div>
        </motion.div>

        {/* Manual Form - SECONDARY */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลคู่ของเจ้า</CardTitle>
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
                disabled={!partnerName}
              >
                คำนวณความเข้ากัน
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
