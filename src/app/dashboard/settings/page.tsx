'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Calendar, Clock, LogOut, Save, Edit2, X, Brain } from 'lucide-react';
import { useSession, signOut } from '@/lib/auth-client';
import { api } from '@/lib/api';
import { Button, Input, Card } from '@/lib-packages/ui';
import { THAI_TIME_PERIODS, THAI_MONTHS, BE_OFFSET, toGregorianYear, toBuddhistYear, MBTI_GROUPS, getMbtiInfo } from '@/lib-packages/shared';
import type { Gender } from '@/lib-packages/shared';

/**
 * Settings Page - Redesigned with View/Edit Mode
 *
 * Features:
 * - Clean view mode by default (read-only display)
 * - Edit mode with grouped form sections
 * - Save/Cancel actions in edit mode
 * - Separate logout section with destructive styling
 * - Mobile-first responsive design
 * - Consistent with Horo design system
 */
export default function SettingsPage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);

  // Form state (current/saved values)
  const [displayName, setDisplayName] = useState('');
  const [day, setDay] = useState(1);
  const [month, setMonth] = useState(0);
  const [year, setYear] = useState(2540);
  const [gender, setGender] = useState<Gender>('male');
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<number | null>(null);
  const [isTimeUnknown, setIsTimeUnknown] = useState(false);
  const [mbtiType, setMbtiType] = useState<string | null>(null);

  // Saved values for cancel operation
  const [savedValues, setSavedValues] = useState({
    displayName: '',
    day: 1,
    month: 0,
    year: 2540,
    gender: 'male' as Gender,
    selectedTimePeriod: null as number | null,
    isTimeUnknown: false,
    mbtiType: null as string | null,
  });

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
            mbtiType: string | null;
          } | null;
        }>('/api/fortune/user-profile');

        // Set display name
        const name = response.user.displayName || response.user.name;
        setDisplayName(name);

        // Set birth profile data if exists
        let profileData = {
          displayName: name,
          day: 1,
          month: 0,
          year: 2540,
          gender: 'male' as Gender,
          selectedTimePeriod: null as number | null,
          isTimeUnknown: false,
          mbtiType: null as string | null,
        };

        if (response.profile) {
          const profile = response.profile;
          const birthDate = new Date(profile.birthDate);
          const dayValue = birthDate.getUTCDate();
          const monthValue = birthDate.getUTCMonth();
          const yearValue = toBuddhistYear(birthDate.getUTCFullYear());
          const genderValue = profile.gender as Gender;
          const isTimeUnknownValue = profile.isTimeUnknown;

          const mbtiValue = profile.mbtiType || null;

          setDay(dayValue);
          setMonth(monthValue);
          setYear(yearValue);
          setGender(genderValue);
          setIsTimeUnknown(isTimeUnknownValue);
          setMbtiType(mbtiValue);

          // Find matching time period
          let timePeriodValue: number | null = null;
          if (!profile.isTimeUnknown && profile.birthHour !== null) {
            const periodIndex = THAI_TIME_PERIODS.findIndex(
              (p) => p.chineseHour === profile.birthHour
            );
            if (periodIndex >= 0) {
              setSelectedTimePeriod(periodIndex);
              timePeriodValue = periodIndex;
            }
          }

          profileData = {
            displayName: name,
            day: dayValue,
            month: monthValue,
            year: yearValue,
            gender: genderValue,
            selectedTimePeriod: timePeriodValue,
            isTimeUnknown: isTimeUnknownValue,
            mbtiType: mbtiValue,
          };
        }

        setSavedValues(profileData);
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
    if (isEditMode) {
      centerSelectedOption(dayRef.current);
      centerSelectedOption(monthRef.current);
      centerSelectedOption(yearRef.current);
    }
  }, [day, month, year, isEditMode]);

  const handleEdit = () => {
    setIsEditMode(true);
    setSaveMessage(null);
  };

  const handleCancel = () => {
    // Restore saved values
    setDisplayName(savedValues.displayName);
    setDay(savedValues.day);
    setMonth(savedValues.month);
    setYear(savedValues.year);
    setGender(savedValues.gender);
    setSelectedTimePeriod(savedValues.selectedTimePeriod);
    setIsTimeUnknown(savedValues.isTimeUnknown);
    setMbtiType(savedValues.mbtiType);
    setIsEditMode(false);
    setSaveMessage(null);
  };

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
      const birthDate = new Date(Date.UTC(gregorianYear, month, day));

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
      const result = await api.post<{ success: boolean; profileId: string; fortuneRegenerated: boolean }>('/api/fortune/update-profile', {
        name: displayName.trim(),
        birthDate: birthDate.toISOString(),
        gender,
        birthTime,
        mbtiType: mbtiType || undefined,
      });

      // Signal fortune page to show "regenerating" indicator if LLM data changed
      if (result.fortuneRegenerated) {
        sessionStorage.setItem('fortune-profile-updated', '1');
      }

      // Save current values as new saved values
      setSavedValues({
        displayName: displayName.trim(),
        day,
        month,
        year,
        gender,
        selectedTimePeriod,
        isTimeUnknown,
        mbtiType,
      });

      setSaveMessage({ type: 'success', text: result.fortuneRegenerated ? 'บันทึกข้อมูลเรียบร้อย ดวงจะอัปเดตใหม่เมื่อกลับไปหน้าดวงชะตา' : 'บันทึกข้อมูลเรียบร้อยแล้ว' });
      setIsEditMode(false);

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

  // Helper to get time period display text
  const getTimePeriodText = () => {
    if (isTimeUnknown) {
      return 'ไม่ทราบเวลาเกิด';
    }
    if (selectedTimePeriod !== null) {
      const period = THAI_TIME_PERIODS[selectedTimePeriod];
      return `${period.displayName} (${period.timeRange})`;
    }
    return '-';
  };

  return (
    <div className="min-h-screen bg-voidBlack pb-4">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-voidBlack/80 backdrop-blur-sm border-b border-darkPurple">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-heading text-ghostWhite">ตั้งค่า</h1>
          </div>

          {/* Edit button in header when in view mode */}
          {!isEditMode && (
            <Button
              onClick={handleEdit}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Edit2 size={16} />
              แก้ไข
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Save Message */}
        <AnimatePresence>
          {saveMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-4 rounded-lg border ${
                saveMessage.type === 'success'
                  ? 'bg-green-900/20 border-green-500/30 text-green-400'
                  : 'bg-red-900/20 border-red-500/30 text-red-400'
              }`}
            >
              {saveMessage.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Profile Information Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-heading text-ghostWhite">ข้อมูลส่วนตัว</h2>
              {isEditMode && (
                <span className="text-xs text-royalPurple bg-royalPurple/10 px-3 py-1 rounded-full">
                  กำลังแก้ไข
                </span>
              )}
            </div>

            {/* Display Name */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="text-royalPurple" size={18} />
                <label className="text-sm font-medium text-ashGray">ชื่อที่แสดง</label>
              </div>
              {isEditMode ? (
                <Input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="ชื่อของคุณ"
                  className="text-base"
                  maxLength={50}
                />
              ) : (
                <p className="text-base text-ghostWhite pl-6">{displayName || '-'}</p>
              )}
            </div>

            {/* Gender */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="text-royalPurple" size={18} />
                <label className="text-sm font-medium text-ashGray">เพศ</label>
              </div>
              {isEditMode ? (
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
              ) : (
                <p className="text-base text-ghostWhite pl-6">
                  {gender === 'male' ? 'ผู้ชาย' : 'ผู้หญิง'}
                </p>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Birth Information Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="p-6 space-y-6">
            <h2 className="text-lg font-heading text-ghostWhite">ข้อมูลการเกิด</h2>

            {/* Birth Date */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="text-royalPurple" size={18} />
                <label className="text-sm font-medium text-ashGray">วันเกิด</label>
              </div>
              {isEditMode ? (
                <div className="flex gap-3">
                  {/* Day */}
                  <div className="flex-1">
                    <label className="block text-xs text-ashGray mb-2 text-center">วัน</label>
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
                    <label className="block text-xs text-ashGray mb-2 text-center">เดือน</label>
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
                    <label className="block text-xs text-ashGray mb-2 text-center">พ.ศ.</label>
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
              ) : (
                <p className="text-base text-ghostWhite pl-6">
                  {day} {THAI_MONTHS[month]} {year}
                </p>
              )}
            </div>

            {/* Birth Time */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="text-royalPurple" size={18} />
                <label className="text-sm font-medium text-ashGray">เวลาเกิด</label>
              </div>
              {isEditMode ? (
                <div className="space-y-4">
                  {/* Unknown checkbox */}
                  <label className="flex items-center gap-3 cursor-pointer pl-6">
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
                          <p className="text-sm font-heading text-ghostWhite">{period.displayName}</p>
                          <p className="text-xs text-ashGray">{period.timeRange}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-base text-ghostWhite pl-6">{getTimePeriodText()}</p>
              )}
            </div>

            {/* MBTI */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Brain className="text-royalPurple" size={18} />
                <label className="text-sm font-medium text-ashGray">MBTI</label>
              </div>
              {isEditMode ? (
                <div className="space-y-4">
                  {/* Clear MBTI button */}
                  {mbtiType && (
                    <button
                      onClick={() => setMbtiType(null)}
                      className="text-sm text-ashGray hover:text-red-400 transition-colors pl-6"
                    >
                      ✕ ล้างค่า MBTI
                    </button>
                  )}

                  {/* MBTI groups grid */}
                  {MBTI_GROUPS.map((group) => (
                    <div key={group.key} className="space-y-2">
                      <p className="text-xs text-ashGray pl-6">{group.nameTh} ({group.nameEn})</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {group.types.map((type) => (
                          <button
                            key={type.code}
                            onClick={() => setMbtiType(type.code)}
                            className={`p-3 rounded-lg border transition-all ${
                              mbtiType === type.code
                                ? 'border-royalPurple bg-royalPurple/10 text-ghostWhite'
                                : 'border-darkPurple bg-deepNight text-ashGray hover:border-royalPurple/50'
                            }`}
                          >
                            <p className="text-sm font-heading text-ghostWhite">{type.code}</p>
                            <p className="text-xs text-ashGray">{type.nameTh}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-base text-ghostWhite pl-6">
                  {mbtiType ? `${mbtiType} (${getMbtiInfo(mbtiType)?.nameTh || ''})` : 'ไม่ได้ระบุ'}
                </p>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        {isEditMode ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <Button
              onClick={handleSave}
              size="lg"
              className="flex-1 flex items-center justify-center gap-2"
              disabled={isSaving}
            >
              <Save size={20} />
              {isSaving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              size="lg"
              className="flex items-center justify-center gap-2"
              disabled={isSaving}
            >
              <X size={20} />
              ยกเลิก
            </Button>
          </motion.div>
        ) : (
          /* Logout Section - Only visible in view mode */
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="p-6 space-y-4">
              <h2 className="text-lg font-heading text-ghostWhite">บัญชี</h2>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="lg"
                className="w-full flex items-center justify-center gap-2 text-red-400 border-red-400/30 hover:bg-red-900/20 hover:border-red-400/50"
              >
                <LogOut size={20} />
                ออกจากระบบ
              </Button>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
