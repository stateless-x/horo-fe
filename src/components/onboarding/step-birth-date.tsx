'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/lib-packages/ui';
import { useOnboardingStore } from '@/stores/onboarding';
import { THAI_MONTHS, BE_OFFSET, toGregorianYear } from '@/lib-packages/shared';
import { StepHeading } from './step-heading';

// Same select recipe as the compatibility form and settings, so a date is
// entered the same way everywhere in the product.
// appearance-none so the chevron can sit inside the field with real
// right-hand room; the native arrow ignores padding and hugs the border.
const SELECT_CLASS =
  'w-full h-12 appearance-none bg-overlay border border-inkMuted/30 rounded-lg pl-7 pr-7 text-center text-base text-ink focus:outline-none focus:ring-2 focus:ring-accentBright focus:border-transparent transition-all cursor-pointer hover:border-accentBright/50';

function DateSelect({ id, value, onChange, children }: {
  id: string;
  value: number;
  onChange: (value: number) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select id={id} value={value} onChange={(e) => onChange(parseInt(e.target.value))} className={SELECT_CLASS}>
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-inkMuted"
        aria-hidden="true"
      />
    </div>
  );
}

/**
 * Step 3: Birth Date
 *
 * "วันเกิดของคุณคือวันไหน"
 * - Three native selects (day, month, พ.ศ. year); the OS picker does the
 *   scrolling, which is the one thing a fake wheel kept getting wrong
 * - Store as ISO internally, show Buddhist Era to users
 */
export function StepBirthDate() {
  const { updateProfile, nextStep, prevStep } = useOnboardingStore();

  const currentYear = new Date().getFullYear() + BE_OFFSET;
  const [day, setDay] = useState(1);
  const [month, setMonth] = useState(0);
  const [year, setYear] = useState(currentYear - 25); // Default to 25 years old

  // Number of days in the selected month/year (BE -> Gregorian for leap-year math)
  const daysInMonth = new Date(Date.UTC(toGregorianYear(year), month + 1, 0)).getUTCDate();

  // Clamp day if it exceeds the selected month's max (e.g. 31 Feb rolling over)
  useEffect(() => {
    if (day > daysInMonth) {
      setDay(daysInMonth);
    }
  }, [daysInMonth, day]);

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
        <StepHeading
          title="วันเกิดของคุณคือวันไหน"
          description="เลือกวัน เดือน และปี พ.ศ. ที่เกิด แล้วมาดูว่าดวงเล่าอะไรบ้าง"
        />

        <fieldset className="space-y-6">
          <legend className="sr-only">วันเกิด (พุทธศักราช)</legend>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="birth-day" className="block text-sm text-inkMuted mb-2 text-center">
                วัน
              </label>
              <DateSelect id="birth-day" value={day} onChange={setDay}>
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </DateSelect>
            </div>

            <div>
              <label htmlFor="birth-month" className="block text-sm text-inkMuted mb-2 text-center">
                เดือน
              </label>
              <DateSelect id="birth-month" value={month} onChange={setMonth}>
                {THAI_MONTHS.map((m, i) => (
                  <option key={i} value={i}>
                    {m}
                  </option>
                ))}
              </DateSelect>
            </div>

            <div>
              <label htmlFor="birth-year" className="block text-sm text-inkMuted mb-2 text-center">
                พ.ศ.
              </label>
              <DateSelect id="birth-year" value={year} onChange={setYear}>
                {Array.from({ length: 70 }, (_, i) => currentYear - i).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </DateSelect>
            </div>
          </div>

          {/* Read the choice back in full so a slip in one column is caught here,
              not on the reading. */}
          <p className="text-center text-sm text-inkMuted" aria-live="polite">
            เกิดวันที่ {day} {THAI_MONTHS[month]} {year}
          </p>

          <div className="flex gap-3">
            <Button type="button" variant="soft" size="lg" onClick={prevStep} className="shrink-0 px-5">
              ย้อนกลับ
            </Button>
            <Button type="button" onClick={handleSubmit} size="lg" className="flex-1">
              ถัดไป
            </Button>
          </div>
        </fieldset>
      </div>
    </motion.div>
  );
}
