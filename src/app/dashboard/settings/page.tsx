'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Calendar, Clock, LogOut, Save } from 'lucide-react';
import { useSession, signOut } from '@/lib/auth-client';
import { api } from '@/lib/api';
import { Button, Input, Card } from '@/lib-packages/ui';
import { THAI_TIME_PERIODS, THAI_MONTHS, BE_OFFSET, toGregorianYear, toBuddhistYear } from '@/lib-packages/shared';
import type { Gender } from '@/lib-packages/shared';

/**
 * Settings Page
 *
 * Allows users to:
 * - Edit display name
 * - Edit birth date
 * - Edit gender
 * - Edit birth time (with unknown option)
 * - Logout
 *
 * Design: Dark theme with purple accents, mobile-first
 */
export default function SettingsPage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [day, setDay] = useState(1);
  const [month, setMonth] = useState(0);
  const [year, setYear] = useState(2540);
  const [gender, setGender] = useState<Gender>('male');
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<number | null>(null);
  const [isTimeUnknown, setIsTimeUnknown] = useState(false);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Refs for date pickers
  const dayRef = useRef<HTMLSelectElement>(null);
  const monthRef = useRef<HTMLSelectElement>(null);
  const yearRef = useRef<HTMLSelectElement>(null);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!sessionLoading && !session) {
      router.push('/login');
    }
  }, [session, sessionLoading, router]);

  // Fetch user profile data
  useEffect(() => {
    if (!session) return;

    const fetchProfile = async () => {
      try {
        setIsLoading(true);

        // Fetch birth profile
        const response = await api.get<{
          user: { displayName: string | null; name: string };
          profile: {
            birthDate: string;
            gender: string;
            birthHour: number | null;
            birthTimePeriod: string | null;
            isTimeUnknown: boolean;
          } | null;
        }>('/api/fortune/user-profile');

        // Set display name
        setDisplayName(response.user.displayName || response.user.name);

        // Set birth profile data if exists
        if (response.profile) {
          const profile = response.profile; // Store in const for TypeScript null check
          const birthDate = new Date(profile.birthDate);
          setDay(birthDate.getDate());
          setMonth(birthDate.getMonth());
          setYear(toBuddhistYear(birthDate.getFullYear()));
          setGender(profile.gender as Gender);
          setIsTimeUnknown(profile.isTimeUnknown);

          // Find matching time period
          if (!profile.isTimeUnknown && profile.birthHour !== null) {
            const periodIndex = THAI_TIME_PERIODS.findIndex(
              (p) => p.chineseHour === profile.birthHour
            );
            if (periodIndex >= 0) {
              setSelectedTimePeriod(periodIndex);
            }
          }
        }
      } catch (error) {
        console.error('[Settings] Failed to fetch profile:', error);
        setSaveMessage({ type: 'error', text: 'ไม่สามารถโหลดข้อมูลโปรไฟล์ได้' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [session]);

  // Center selected option in scrollable selects
  const centerSelectedOption = (selectElement: HTMLSelectElement | null) => {
    if (!selectElement) return;
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    if (!selectedOption) return;
    const optionHeight = selectedOption.offsetHeight;
    const selectHeight = selectElement.clientHeight;
    const scrollTo = selectedOption.offsetTop - selectHeight / 2 + optionHeight / 2;
    selectElement.scrollTop = scrollTo;
  };

  useEffect(() => {
    centerSelectedOption(dayRef.current);
    centerSelectedOption(monthRef.current);
    centerSelectedOption(yearRef.current);
  }, [day, month, year]);

  const handleSave = async () => {
    if (!displayName.trim()) {
      setSaveMessage({ type: 'error', text: 'กรุณากรอกชื่อของคุณ' });
      return;
    }

    try {
      setIsSaving(true);
      setSaveMessage(null);

      // Convert Buddhist Era to Gregorian
      const gregorianYear = toGregorianYear(year);
      const birthDate = new Date(gregorianYear, month, day);

      // Prepare birth time data
      let birthTime;
      if (isTimeUnknown) {
        birthTime = {
          period: 'unknown',
          chineseHour: 0,
          isUnknown: true,
        };
      } else if (selectedTimePeriod !== null) {
        const period = THAI_TIME_PERIODS[selectedTimePeriod];
        birthTime = {
          period: period.name,
          chineseHour: period.chineseHour,
          isUnknown: false,
        };
      } else {
        setSaveMessage({ type: 'error', text: 'กรุณาเลือกช่วงเวลาเกิด หรือเลือก "ไม่ทราบ"' });
        return;
      }

      // Call update endpoint
      await api.post('/api/fortune/update-profile', {
        name: displayName.trim(),
        birthDate: birthDate.toISOString(),
        gender,
        birthTime,
      });

      setSaveMessage({ type: 'success', text: 'บันทึกข้อมูลเรียบร้อยแล้ว' });

      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('[Settings] Failed to save:', error);
      setSaveMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('[Settings] Logout failed:', error);
    }
  };

  if (sessionLoading || isLoading) {
    return (
      <div className="min-h-screen bg-voidBlack flex items-center justify-center">
        <div className="text-ashGray">กำลังโหลด...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const currentYear = new Date().getFullYear() + BE_OFFSET;

  return (
    <div className="min-h-screen bg-voidBlack pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-voidBlack/80 backdrop-blur-sm border-b border-darkPurple">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard/fortune')}
            className="text-ashGray hover:text-ghostWhite transition-colors"
            aria-label="Back to fortune"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-heading text-ghostWhite">ตั้งค่า</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Display Name */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <User className="text-royalPurple" size={20} />
              <h2 className="text-lg font-heading text-ghostWhite">ชื่อที่แสดง</h2>
            </div>
            <Input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="ชื่อของคุณ"
              className="text-base"
              maxLength={50}
            />
          </Card>
        </motion.div>

        {/* Birth Date */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="text-royalPurple" size={20} />
              <h2 className="text-lg font-heading text-ghostWhite">วันเกิด</h2>
            </div>
            <div className="flex gap-3">
              {/* Day */}
              <div className="flex-1">
                <label className="block text-sm text-ashGray mb-2 text-center">วัน</label>
                <div className="relative">
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-10 bg-royalPurple/10 border-y border-royalPurple/30 pointer-events-none z-10" />
                  <select
                    ref={dayRef}
                    value={day}
                    onChange={(e) => setDay(parseInt(e.target.value))}
                    className="w-full h-40 bg-deepNight border border-darkPurple rounded-lg text-center text-base text-ghostWhite focus:ring-2 focus:ring-royalPurple focus:border-transparent overflow-y-auto scroll-smooth relative z-0"
                    size={5}
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d} className="py-2">
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Month */}
              <div className="flex-1">
                <label className="block text-sm text-ashGray mb-2 text-center">เดือน</label>
                <div className="relative">
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-10 bg-royalPurple/10 border-y border-royalPurple/30 pointer-events-none z-10" />
                  <select
                    ref={monthRef}
                    value={month}
                    onChange={(e) => setMonth(parseInt(e.target.value))}
                    className="w-full h-40 bg-deepNight border border-darkPurple rounded-lg text-center text-base text-ghostWhite focus:ring-2 focus:ring-royalPurple focus:border-transparent overflow-y-auto scroll-smooth relative z-0"
                    size={5}
                  >
                    {THAI_MONTHS.map((m, i) => (
                      <option key={i} value={i} className="py-2">
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Year */}
              <div className="flex-1">
                <label className="block text-sm text-ashGray mb-2 text-center">พ.ศ.</label>
                <div className="relative">
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-10 bg-royalPurple/10 border-y border-royalPurple/30 pointer-events-none z-10" />
                  <select
                    ref={yearRef}
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    className="w-full h-40 bg-deepNight border border-darkPurple rounded-lg text-center text-base text-ghostWhite focus:ring-2 focus:ring-royalPurple focus:border-transparent overflow-y-auto scroll-smooth relative z-0"
                    size={5}
                  >
                    {Array.from({ length: 70 }, (_, i) => currentYear - i).map((y) => (
                      <option key={y} value={y} className="py-2">
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Gender */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <User className="text-royalPurple" size={20} />
              <h2 className="text-lg font-heading text-ghostWhite">เพศ</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setGender('male')}
                className={`p-4 rounded-lg border transition-all ${
                  gender === 'male'
                    ? 'border-royalPurple bg-royalPurple/10 text-ghostWhite'
                    : 'border-darkPurple bg-deepNight text-ashGray hover:border-royalPurple/50'
                }`}
              >
                <p className="text-base font-heading">ผู้ชาย</p>
              </button>
              <button
                onClick={() => setGender('female')}
                className={`p-4 rounded-lg border transition-all ${
                  gender === 'female'
                    ? 'border-royalPurple bg-royalPurple/10 text-ghostWhite'
                    : 'border-darkPurple bg-deepNight text-ashGray hover:border-royalPurple/50'
                }`}
              >
                <p className="text-base font-heading">ผู้หญิง</p>
              </button>
            </div>
          </Card>
        </motion.div>

        {/* Birth Time */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Clock className="text-royalPurple" size={20} />
              <h2 className="text-lg font-heading text-ghostWhite">เวลาเกิด</h2>
            </div>

            {/* Unknown checkbox */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isTimeUnknown}
                onChange={(e) => {
                  setIsTimeUnknown(e.target.checked);
                  if (e.target.checked) {
                    setSelectedTimePeriod(null);
                  }
                }}
                className="w-5 h-5 rounded border-darkPurple bg-deepNight text-royalPurple focus:ring-2 focus:ring-royalPurple"
              />
              <span className="text-sm text-ashGray">ไม่ทราบเวลาเกิด</span>
            </label>

            {/* Time period grid */}
            {!isTimeUnknown && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {THAI_TIME_PERIODS.map((period, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedTimePeriod(index)}
                    className={`p-3 rounded-lg border transition-all ${
                      selectedTimePeriod === index
                        ? 'border-royalPurple bg-royalPurple/10 text-ghostWhite'
                        : 'border-darkPurple bg-deepNight text-ashGray hover:border-royalPurple/50'
                    }`}
                  >
                    <p className="text-sm font-heading text-ghostWhite">{period.name}</p>
                    <p className="text-xs text-ashGray">{period.label}</p>
                  </button>
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Save Message */}
        {saveMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg border ${
              saveMessage.type === 'success'
                ? 'bg-green-900/20 border-green-500/30 text-green-400'
                : 'bg-red-900/20 border-red-500/30 text-red-400'
            }`}
          >
            {saveMessage.text}
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="space-y-3"
        >
          <Button
            onClick={handleSave}
            size="lg"
            className="w-full flex items-center justify-center gap-2"
            disabled={isSaving}
          >
            <Save size={20} />
            {isSaving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
          </Button>

          <Button
            onClick={handleLogout}
            variant="outline"
            size="lg"
            className="w-full flex items-center justify-center gap-2 text-red-400 border-red-400/30 hover:bg-red-900/20 hover:border-red-400/50"
          >
            <LogOut size={20} />
            ออกจากระบบ
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
