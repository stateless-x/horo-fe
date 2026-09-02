'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/lib-packages/ui';
import { useOnboardingStore } from '@/stores/onboarding';
import { THAI_MONTHS, BE_OFFSET, toGregorianYear } from '@/lib-packages/shared';

/**
 * Step 3: Birth Date
 *
 * "อยากรู้ดวงชะตาของเจ้างั้นรึ บอกวันเกิดของเจ้ามาสิ"
 * - Custom date picker (3 scroll wheels: day 1-31, month ม.ค.-ธ.ค., year 2500-2569 BE)
 * - NOT native HTML date picker
 * - Store as ISO internally, show Buddhist Era to users
 */
export function StepBirthDate() {
  const { updateProfile, nextStep, prevStep } = useOnboardingStore();

  const currentYear = new Date().getFullYear() + BE_OFFSET;
  const [day, setDay] = useState(1);
  const [month, setMonth] = useState(0);
  const [year, setYear] = useState(currentYear - 25); // Default to 25 years old

  const dayRef = useRef<HTMLSelectElement>(null);
  const monthRef = useRef<HTMLSelectElement>(null);
  const yearRef = useRef<HTMLSelectElement>(null);

  // Number of days in the selected month/year (BE -> Gregorian for leap-year math)
  const daysInMonth = new Date(Date.UTC(toGregorianYear(year), month + 1, 0)).getUTCDate();

  // Clamp day if it exceeds the selected month's max (e.g. 31 Feb rolling over)
  useEffect(() => {
    if (day > daysInMonth) {
      setDay(daysInMonth);
    }
  }, [daysInMonth, day]);

  // Center the selected option in the viewport
  const centerSelectedOption = (selectElement: HTMLSelectElement | null) => {
    if (!selectElement) return;

    const selectedOption = selectElement.options[selectElement.selectedIndex];
    if (!selectedOption) return;

    // Calculate the scroll position to center the selected option
    const optionHeight = selectedOption.offsetHeight;
    const selectHeight = selectElement.clientHeight;
    const scrollTo = selectedOption.offsetTop - (selectHeight / 2) + (optionHeight / 2);

    selectElement.scrollTop = scrollTo;
  };

  // Center options on mount and when values change
  useEffect(() => {
    centerSelectedOption(dayRef.current);
    centerSelectedOption(monthRef.current);
    centerSelectedOption(yearRef.current);
  }, [day, month, year]);

  const handleSubmit = () => {
    // Convert Buddhist Era to Gregorian
    const gregorianYear = toGregorianYear(year);
    // Use UTC to prevent timezone conversion issues (store as UTC midnight)
    const date = new Date(Date.UTC(gregorianYear, month, day));

    updateProfile({
      birthDate: date.toISOString(),
    });

    nextStep();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen flex items-center justify-center p-6"
    >
      <div className="w-full max-w-md space-y-8">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl md:text-3xl text-center text-ghostWhite font-heading leading-relaxed"
        >
          อยากรู้ดวงชะตาของเจ้างั้นรึ
          <br />
          บอกวันเกิดของเจ้ามาสิ
        </motion.h1>

        <div className="space-y-6">
          {/* Date Picker Wheels */}
          <div className="flex gap-4 justify-center">
            {/* Day */}
            <div className="flex-1 relative">
              <label className="block text-sm text-ashGray mb-2 text-center">
                วัน
              </label>
              <div className="relative">
                {/* Center highlight overlay */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-10 bg-royalPurple/10 border-y border-royalPurple/30 pointer-events-none z-10" />
                <select
                  ref={dayRef}
                  value={day}
                  onChange={(e) => setDay(parseInt(e.target.value))}
                  className="w-full h-48 bg-deepNight border border-darkPurple rounded-lg text-center text-lg text-ghostWhite focus:ring-2 focus:ring-royalPurple focus:border-transparent overflow-y-auto scroll-smooth relative z-0"
                  size={7}
                >
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d} className="py-2">
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Month */}
            <div className="flex-1 relative">
              <label className="block text-sm text-ashGray mb-2 text-center">
                เดือน
              </label>
              <div className="relative">
                {/* Center highlight overlay */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-10 bg-royalPurple/10 border-y border-royalPurple/30 pointer-events-none z-10" />
                <select
                  ref={monthRef}
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value))}
                  className="w-full h-48 bg-deepNight border border-darkPurple rounded-lg text-center text-lg text-ghostWhite focus:ring-2 focus:ring-royalPurple focus:border-transparent overflow-y-auto scroll-smooth relative z-0"
                  size={7}
                >
                  {THAI_MONTHS.map((m, i) => (
                    <option key={i} value={i} className="py-2">
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Year (Buddhist Era) */}
            <div className="flex-1 relative">
              <label className="block text-sm text-ashGray mb-2 text-center">
                พ.ศ.
              </label>
              <div className="relative">
                {/* Center highlight overlay */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-10 bg-royalPurple/10 border-y border-royalPurple/30 pointer-events-none z-10" />
                <select
                  ref={yearRef}
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  className="w-full h-48 bg-deepNight border border-darkPurple rounded-lg text-center text-lg text-ghostWhite focus:ring-2 focus:ring-royalPurple focus:border-transparent overflow-y-auto scroll-smooth relative z-0"
                  size={7}
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

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={prevStep}
              className="w-full"
            >
              ย้อนกลับ
            </Button>
            <Button onClick={handleSubmit} size="lg" className="w-full">
              ถัดไป
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
