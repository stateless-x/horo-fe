'use client';

import { useRouter } from 'next/navigation';

const THAI_MONTHS_SHORT = [
  'ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.',
  'ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.',
];

interface MonthTabsProps {
  /** Currently displayed month, e.g. "2026-04" */
  selectedYearMonth: string;
  /** Actual today's month, e.g. "2026-04" */
  currentYearMonth: string;
}

/**
 * Horizontal scrollable month tabs for the calendar page.
 * Shows 12 months (current month ± some range).
 * Navigates via ?m=YYYY-MM URL param so the server re-renders with the
 * correct month (stays SEO-friendly and no client data fetching needed).
 */
export function MonthTabs({ selectedYearMonth, currentYearMonth }: MonthTabsProps) {
  const router = useRouter();

  // Build 12 tabs: 2 months before today through 9 months after
  const tabs: { yearMonth: string; label: string; beYear: number }[] = [];
  const [curY, curM] = currentYearMonth.split('-').map(Number);

  for (let offset = -2; offset <= 9; offset++) {
    const d = new Date(curY, curM - 1 + offset, 1);
    const y = d.getFullYear();
    const mo = d.getMonth(); // 0-indexed
    const ym = `${y}-${String(mo + 1).padStart(2, '0')}`;
    tabs.push({ yearMonth: ym, label: THAI_MONTHS_SHORT[mo], beYear: y + 543 });
  }

  return (
    <div className="w-full overflow-x-auto -mx-4 px-4 scrollbar-hide">
      <div className="flex gap-1.5 min-w-max pb-1">
        {tabs.map(({ yearMonth, label, beYear }) => {
          const isSelected = yearMonth === selectedYearMonth;
          const isToday = yearMonth === currentYearMonth;
          return (
            <button
              key={yearMonth}
              onClick={() => {
                const params = yearMonth === currentYearMonth ? '' : `?m=${yearMonth}`;
                router.push(`/calendar${params}`);
              }}
              className={`
                relative flex flex-col items-center px-3 py-2 rounded-xl border transition-all text-center min-w-[52px]
                ${isSelected
                  ? 'bg-accent/30 border-accentBright/60 text-accentBright'
                  : 'bg-white/3 border-white/8 text-inkMuted hover:text-ink hover:border-white/20 hover:bg-white/8'
                }
              `}
            >
              {isToday && (
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-accentBright" />
              )}
              <span className="font-oracle text-xs leading-tight">{label}</span>
              <span className="font-oracle text-[10px] opacity-60 leading-none">{beYear}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
