import type { Metadata } from 'next';
import Link from 'next/link';
import { PublicNav } from '@/components/layout/public-nav';
import { AdUnit } from '@/components/ads/ad-unit';
import { MonthTabs } from '@/components/calendar/month-tabs';

// ─── Thai day-of-week data (mirrors backend DAY_DATA) ───────────────────────

type ThaiDay =
  | 'sunday' | 'monday' | 'tuesday'
  | 'wednesday_day' | 'wednesday_night'
  | 'thursday' | 'friday' | 'saturday';

interface DayProfile {
  thaiName: string;
  color: string;
  colorHex: string;
  planet: string;
  luckyNumber: number;
  luckyDirection: string;
}

const DAY_PROFILES: Record<ThaiDay, DayProfile> = {
  sunday:          { thaiName: 'อาทิตย์', color: 'แดง',   colorHex: '#ef4444', planet: 'ดวงอาทิตย์',   luckyNumber: 9, luckyDirection: 'ทิศตะวันออก' },
  monday:          { thaiName: 'จันทร์',  color: 'เหลือง', colorHex: '#eab308', planet: 'ดวงจันทร์',    luckyNumber: 2, luckyDirection: 'ทิศตะวันออก' },
  tuesday:         { thaiName: 'อังคาร', color: 'ชมพู',   colorHex: '#ec4899', planet: 'ดวงอังคาร',    luckyNumber: 8, luckyDirection: 'ทิศตะวันออกเฉียงเหนือ' },
  wednesday_day:   { thaiName: 'พุธ',    color: 'เขียว',  colorHex: '#22c55e', planet: 'ดวงพุธ',       luckyNumber: 5, luckyDirection: 'ทิศใต้' },
  wednesday_night: { thaiName: 'พุธ',    color: 'เทา',    colorHex: '#71717a', planet: 'ดวงราหู',      luckyNumber: 4, luckyDirection: 'ทิศตะวันตก' },
  thursday:        { thaiName: 'พฤหัส',  color: 'ส้ม',    colorHex: '#f97316', planet: 'ดวงพฤหัสบดี',  luckyNumber: 3, luckyDirection: 'ทิศตะวันตก' },
  friday:          { thaiName: 'ศุกร์',  color: 'ฟ้า',    colorHex: '#38bdf8', planet: 'ดวงศุกร์',     luckyNumber: 6, luckyDirection: 'ทิศเหนือ' },
  saturday:        { thaiName: 'เสาร์',  color: 'ม่วง',   colorHex: '#a855f7', planet: 'ดวงเสาร์',     luckyNumber: 7, luckyDirection: 'ทิศตะวันตกเฉียงใต้' },
};

function getThaiDay(date: Date): ThaiDay {
  const dow = date.getDay();
  if (dow === 3) return 'wednesday_day'; // calendar page: always day
  return (['sunday','monday','tuesday','wednesday_day','thursday','friday','saturday'] as ThaiDay[])[dow];
}

// ─── Thai holidays 2025–2026 (static) ────────────────────────────────────────

const THAI_HOLIDAYS: Record<string, string> = {
  // 2025
  '2025-01-01': 'วันขึ้นปีใหม่',
  '2025-02-12': 'วันมาฆบูชา',
  '2025-04-06': 'วันจักรี',
  '2025-04-13': 'วันสงกรานต์',
  '2025-04-14': 'วันสงกรานต์',
  '2025-04-15': 'วันสงกรานต์',
  '2025-05-01': 'วันแรงงานแห่งชาติ',
  '2025-05-05': 'วันฉัตรมงคล',
  '2025-05-11': 'วันวิสาขบูชา',
  '2025-06-03': 'วันเฉลิมพระชนมพรรษา ราชินี',
  '2025-07-10': 'วันอาสาฬหบูชา',
  '2025-07-11': 'วันเข้าพรรษา',
  '2025-07-28': 'วันเฉลิมพระชนมพรรษา ร.10',
  '2025-08-12': 'วันแม่แห่งชาติ',
  '2025-10-13': 'วันนวมินทรมหาราช',
  '2025-10-23': 'วันปิยมหาราช',
  '2025-12-05': 'วันพ่อแห่งชาติ',
  '2025-12-10': 'วันรัฐธรรมนูญ',
  '2025-12-31': 'วันสิ้นปี',
  // 2026
  '2026-01-01': 'วันขึ้นปีใหม่',
  '2026-03-03': 'วันมาฆบูชา',
  '2026-04-06': 'วันจักรี',
  '2026-04-13': 'วันสงกรานต์',
  '2026-04-14': 'วันสงกรานต์',
  '2026-04-15': 'วันสงกรานต์',
  '2026-05-01': 'วันแรงงานแห่งชาติ',
  '2026-05-05': 'วันฉัตรมงคล',
  '2026-05-31': 'วันวิสาขบูชา',
  '2026-06-03': 'วันเฉลิมพระชนมพรรษา ราชินี',
  '2026-07-28': 'วันเฉลิมพระชนมพรรษา ร.10',
  '2026-07-29': 'วันอาสาฬหบูชา',
  '2026-07-30': 'วันเข้าพรรษา',
  '2026-08-12': 'วันแม่แห่งชาติ',
  '2026-10-13': 'วันนวมินทรมหาราช',
  '2026-10-23': 'วันปิยมหาราช',
  '2026-12-05': 'วันพ่อแห่งชาติ',
  '2026-12-10': 'วันรัฐธรรมนูญ',
  '2026-12-31': 'วันสิ้นปี',
};

// ─── วันพระ & วันโกน ─────────────────────────────────────────────────────────
// วันพระ = Buddhist holy days (lunar quarters: 8th/15th waxing/waning)
// วันโกน = the day before every วันพระ — auspicious for haircuts/nail cuts
const WAN_PHRA_DATES = new Set([
  // 2025
  '2025-01-06','2025-01-13','2025-01-21','2025-01-29',
  '2025-02-05','2025-02-12','2025-02-20','2025-02-27',
  '2025-03-06','2025-03-14','2025-03-22','2025-03-29',
  '2025-04-05','2025-04-13','2025-04-20','2025-04-27',
  '2025-05-04','2025-05-11','2025-05-20','2025-05-27',
  '2025-06-03','2025-06-11','2025-06-18','2025-06-25',
  '2025-07-02','2025-07-10','2025-07-17','2025-07-25',
  '2025-08-01','2025-08-09','2025-08-16','2025-08-23','2025-08-31',
  '2025-09-07','2025-09-15','2025-09-22','2025-09-29',
  '2025-10-06','2025-10-14','2025-10-21','2025-10-29',
  '2025-11-05','2025-11-12','2025-11-20','2025-11-28',
  '2025-12-04','2025-12-12','2025-12-19','2025-12-27',
  // 2026
  '2026-01-03','2026-01-11','2026-01-18','2026-01-26',
  '2026-02-02','2026-02-10','2026-02-17','2026-02-25',
  '2026-03-03','2026-03-11','2026-03-18','2026-03-26',
  '2026-04-02','2026-04-09','2026-04-17','2026-04-25',
  '2026-05-02','2026-05-09','2026-05-16','2026-05-24','2026-05-31',
  '2026-06-07','2026-06-15','2026-06-22','2026-06-29',
  '2026-07-07','2026-07-14','2026-07-22','2026-07-29',
  '2026-08-05','2026-08-13','2026-08-20','2026-08-28',
  '2026-09-04','2026-09-12','2026-09-19','2026-09-26',
  '2026-10-04','2026-10-11','2026-10-18','2026-10-26',
  '2026-11-02','2026-11-09','2026-11-16','2026-11-25',
  '2026-12-02','2026-12-09','2026-12-16','2026-12-24','2026-12-31',
]);

// วันโกน = day before each วันพระ (derived — no need for a separate static set)
function buildWanKhonSet(): Set<string> {
  const result = new Set<string>();
  for (const iso of WAN_PHRA_DATES) {
    const d = new Date(iso);
    d.setDate(d.getDate() - 1);
    result.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  }
  return result;
}
const WAN_KHON_DATES = buildWanKhonSet();

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toISODate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getBangkokNow(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }));
}

const THAI_MONTHS = [
  'มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน',
  'กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม',
];
const THAI_MONTHS_SHORT = [
  'ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.',
  'ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.',
];
const WEEKDAY_NAMES = ['อา.','จ.','อ.','พ.','พฤ.','ศ.','ส.'];

interface CalendarDay {
  date: Date;
  iso: string;
  dayNum: number;
  thaiDay: ThaiDay;
  profile: DayProfile;
  isToday: boolean;
  isHoliday: boolean;
  holidayName?: string;
  isWanPhra: boolean;
  isWanKhon: boolean;
  isCurrentMonth: boolean;
}

function buildCalendar(year: number, month: number, todayIso: string): CalendarDay[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // pad start to Sunday
  const startPad = firstDay.getDay();
  // pad end to Saturday
  const endPad = 6 - lastDay.getDay();

  const days: CalendarDay[] = [];

  for (let i = -startPad; i <= lastDay.getDate() - 1 + endPad; i++) {
    const date = new Date(year, month, 1 + i);
    const iso = toISODate(date);
    const thaiDay = getThaiDay(date);
    days.push({
      date,
      iso,
      dayNum: date.getDate(),
      thaiDay,
      profile: DAY_PROFILES[thaiDay],
      isToday: iso === todayIso,
      isHoliday: iso in THAI_HOLIDAYS,
      holidayName: THAI_HOLIDAYS[iso],
      isWanPhra: WAN_PHRA_DATES.has(iso),
      isWanKhon: WAN_KHON_DATES.has(iso),
      isCurrentMonth: date.getMonth() === month,
    });
  }
  return days;
}

// ─── Helpers: parse ?m=YYYY-MM param ─────────────────────────────────────────

function parseMonthParam(m: string | undefined): { year: number; month: number } {
  if (m && /^\d{4}-\d{2}$/.test(m)) {
    const [y, mo] = m.split('-').map(Number);
    if (y >= 2024 && y <= 2030 && mo >= 1 && mo <= 12) {
      return { year: y, month: mo - 1 };
    }
  }
  const now = getBangkokNow();
  return { year: now.getFullYear(), month: now.getMonth() };
}

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata(
  { searchParams }: { searchParams: Promise<{ m?: string }> }
): Promise<Metadata> {
  const { m } = await searchParams;
  const { year, month } = parseMonthParam(m);
  const monthName = THAI_MONTHS[month];
  const beYear = year + 543;

  return {
    title: `ปฏิทินไทย ${monthName} ${beYear} | วันพระ วันโกน สีประจำวัน ฤกษ์ดี | สายมู`,
    description: `ปฏิทินไทยพุทธศักราช ${beYear} เดือน${monthName} — วันพระ วันโกน ทำบุญ ตัดผม ฤกษ์ดี ขึ้นบ้านใหม่ แต่งงาน เปิดกิจการ สีประจำวัน เลขมงคล ดาวประจำวัน และวันหยุดราชการ ตามหลักโหราศาสตร์ไทยสำหรับสายมูและสายบุญ`,
    keywords: [
      'ปฏิทินไทย', `ปฏิทิน ${beYear}`, `ปฏิทิน ${monthName} ${beYear}`,
      'วันพระ', `วันพระ ${monthName} ${beYear}`, `วันพระ ${beYear}`,
      'วันพระดูยังไง', 'วันพระเดือนนี้', 'วันพระเดือนหน้า',
      'วันโกน', `วันโกน ${monthName} ${beYear}`, 'วันโกนคืออะไร',
      'วันโกน ตัดผม', 'ตัดผมวันไหนดี', 'ตัดผมมงคล', 'ตัดเล็บมงคล',
      'สีประจำวัน', 'สีมงคล', 'สีมงคลประจำวัน', 'ดาวประจำวัน', 'นพเคราะห์',
      'เลขมงคล', 'ทิศมงคล', 'วันหยุดราชการ', `วันหยุด ${beYear}`,
      'โหราศาสตร์ไทย', 'ปฏิทินพุทธศักราช', `เดือน${monthName}`,
      'ฤกษ์ดี', 'ฤกษ์มงคล', 'วันมงคล', 'เลือกวันมงคล',
      'ขึ้นบ้านใหม่', 'แต่งงาน', 'เปิดกิจการ', 'เดินทางมงคล',
      'ทำบุญ', 'ตักบาตร', 'ถวายสังฆทาน', 'สวดมนต์',
      'บรรพบุรุษ', 'อุทิศส่วนกุศล', 'วิญญาณ', 'เสริมดวง', 'แก้เคราะห์',
      'สายบุญ', 'สายมู', 'ดูดวง', 'ดูดวงฟรี', 'ดวงชะตา',
      'บุญ', 'กรรม', 'ชะตา', 'ปฏิทินมงคล', 'ปฏิทินสายมู',
    ],
    alternates: { canonical: '/calendar' },
    openGraph: {
      title: `ปฏิทินไทย ${monthName} ${beYear} | วันพระ วันโกน ฤกษ์ดี สายมู`,
      description: `วันพระ วันโกน ตัดผมมงคล ฤกษ์ดี ขึ้นบ้านใหม่ แต่งงาน สีประจำวัน เลขมงคล และวันหยุดราชการ เดือน${monthName} ${beYear} — ปฏิทินไทยสำหรับสายมูและสายบุญ`,
      type: 'website',
    },
  };
}

// ─── Page (Server Component — fully static, no auth required) ────────────────

export default async function CalendarPage(
  { searchParams }: { searchParams: Promise<{ m?: string }> }
) {
  const { m } = await searchParams;
  const now = getBangkokNow();
  const todayIso = toISODate(now);
  const { year, month } = parseMonthParam(m);
  const beYear = year + 543;
  const monthName = THAI_MONTHS[month];
  const todayProfile = DAY_PROFILES[getThaiDay(now)];
  const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const days = buildCalendar(year, month, todayIso);
  const weeks: CalendarDay[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  // Days with holidays this month
  const monthHolidays = days.filter(d => d.isCurrentMonth && d.isHoliday);
  const monthWanPhra = days.filter(d => d.isCurrentMonth && d.isWanPhra);
  const monthWanKhon = days.filter(d => d.isCurrentMonth && d.isWanKhon);

  return (
    <div className="min-h-screen bg-voidBlack text-ghostWhite">

      <PublicNav />

      <main className="max-w-5xl mx-auto px-4 py-10 space-y-10">

        {/* ── Hero ── */}
        <section className="text-center space-y-3">
          <p className="text-ashGray font-oracle text-sm tracking-widest uppercase">โหราศาสตร์ไทย · สายมู · สายบุญ</p>
          <h1 className="text-3xl md:text-5xl font-heading bg-gradient-to-br from-ghostWhite via-paleOrchid to-lavenderGlow bg-clip-text text-transparent">
            ปฏิทินไทย {monthName} {beYear}
          </h1>
          <p className="text-paleOrchid/90 font-oracle text-sm md:text-base">
            วันพระ · วันโกน · สีประจำวัน · ฤกษ์ดี · วันหยุดราชการ
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-1">
            {['ตัดผมมงคล','ทำบุญ','ขึ้นบ้านใหม่','แต่งงาน','เปิดกิจการ','เสริมดวง'].map(tag => (
              <span key={tag} className="text-xs font-oracle text-ashGray/70 bg-white/5 border border-white/10 rounded-full px-3 py-1">
                {tag}
              </span>
            ))}
          </div>
          <p className="text-ashGray/50 font-oracle text-xs">
            {monthName} {year} &middot; พ.ศ. {beYear}
          </p>
        </section>

        {/* ── Month tabs ── */}
        <MonthTabs
          selectedYearMonth={`${year}-${String(month + 1).padStart(2, '0')}`}
          currentYearMonth={currentYearMonth}
        />

        {/* ── Today highlight strip ── */}
        <section
          className="rounded-2xl p-5 md:p-6 border border-white/10 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8"
          style={{ background: 'linear-gradient(135deg, rgba(107,33,168,0.15), rgba(15,10,26,0.8))' }}
        >
          <div>
            <p className="text-ashGray font-oracle text-xs mb-1">วันนี้</p>
            <p className="font-heading text-ghostWhite text-xl md:text-2xl">
              {WEEKDAY_NAMES[now.getDay()].replace('.','')}{' '}
              {now.getDate()} {THAI_MONTHS_SHORT[month]} {beYear}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Color */}
            <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2">
              <span
                className="w-4 h-4 rounded-full flex-shrink-0 border border-white/20"
                style={{ background: todayProfile.colorHex }}
              />
              <span className="font-oracle text-sm text-ghostWhite">สีประจำวัน: <strong>{todayProfile.color}</strong></span>
            </div>
            {/* Planet */}
            <div className="bg-white/5 rounded-xl px-3 py-2 font-oracle text-sm text-ghostWhite">
              ดาว: <strong>{todayProfile.planet}</strong>
            </div>
            {/* Lucky number */}
            <div className="bg-white/5 rounded-xl px-3 py-2 font-oracle text-sm text-ghostWhite">
              เลขมงคล: <strong className="text-amethyst">{todayProfile.luckyNumber}</strong>
            </div>
            {/* Direction */}
            <div className="bg-white/5 rounded-xl px-3 py-2 font-oracle text-sm text-ghostWhite">
              ทิศมงคล: <strong>{todayProfile.luckyDirection}</strong>
            </div>
          </div>

          <div className="flex flex-col gap-1 ml-auto shrink-0">
            {WAN_PHRA_DATES.has(todayIso) && (
              <span className="px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-oracle text-xs text-center">
                🙏 วันพระ — ทำบุญ ตักบาตร
              </span>
            )}
            {WAN_KHON_DATES.has(todayIso) && (
              <span className="px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/35 text-emerald-400 font-oracle text-xs text-center">
                ✂️ วันโกน — ตัดผมมงคล
              </span>
            )}
          </div>
        </section>

        {/* ── Calendar grid ── */}
        <section aria-label={`ปฏิทิน${monthName} ${beYear}`}>
          <div className="rounded-2xl border border-white/10 overflow-hidden"
            style={{ background: 'linear-gradient(180deg, rgba(26,10,46,0.6), rgba(10,10,15,0.8))' }}>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 border-b border-white/10">
              {['อา.','จ.','อ.','พ.','พฤ.','ศ.','ส.'].map((d, i) => (
                <div
                  key={d}
                  className={`py-3 text-center font-oracle text-xs font-medium
                    ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-ashGray'}`}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Weeks */}
            {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 border-b border-white/5 last:border-0">
                {week.map((day) => (
                  <div
                    key={day.iso}
                    className={`
                      relative min-h-[72px] md:min-h-[90px] p-1.5 md:p-2 border-r border-white/5 last:border-0
                      flex flex-col gap-0.5
                      ${!day.isCurrentMonth ? 'opacity-20' : ''}
                      ${day.isToday ? 'bg-royalPurple/20 ring-1 ring-inset ring-amethyst/50' : ''}
                      ${day.isWanPhra && day.isCurrentMonth && !day.isToday ? 'bg-amber-500/5' : ''}
                      ${day.isWanKhon && day.isCurrentMonth && !day.isToday && !day.isWanPhra ? 'bg-emerald-500/5' : ''}
                      ${day.isHoliday && day.isCurrentMonth && !day.isToday ? 'bg-red-500/5' : ''}
                    `}
                  >
                    {/* Date number */}
                    <div className="flex items-start justify-between">
                      <span
                        className={`font-heading text-sm md:text-base leading-none
                          ${day.isToday ? 'text-amethyst font-bold' : day.isHoliday && day.isCurrentMonth ? 'text-red-400 font-bold' : day.isWanPhra && day.isCurrentMonth ? 'text-amber-300 font-bold' : 'text-ghostWhite'}`}
                      >
                        {day.dayNum}
                      </span>
                      {/* Color dot */}
                      {day.isCurrentMonth && (
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5 border border-white/10"
                          style={{ background: day.profile.colorHex }}
                          title={`สี${day.profile.color}`}
                        />
                      )}
                    </div>

                    {/* วันพระ badge — prominent */}
                    {day.isWanPhra && day.isCurrentMonth && (
                      <span className="text-[10px] font-oracle text-amber-300 leading-none font-medium">🙏 วันพระ</span>
                    )}

                    {/* วันโกน badge */}
                    {day.isWanKhon && day.isCurrentMonth && !day.isWanPhra && (
                      <span className="text-[10px] font-oracle text-emerald-400 leading-none">✂️ วันโกน</span>
                    )}

                    {/* Holiday name */}
                    {day.isHoliday && day.isCurrentMonth && (
                      <span className="text-[9px] md:text-[10px] font-oracle text-red-300 leading-tight line-clamp-2">
                        {day.holidayName}
                      </span>
                    )}

                    {/* Lucky number - small */}
                    {day.isCurrentMonth && (
                      <span className="mt-auto text-[9px] font-oracle text-ashGray/50 leading-none">
                        เลข {day.profile.luckyNumber}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-3 flex flex-wrap gap-4 text-xs font-oracle text-ashGray">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-royalPurple/50 border border-amethyst/50 inline-block" />
              วันนี้
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-amber-500/10 border border-amber-500/40 inline-block" />
              วันพระ — ทำบุญ ตักบาตร
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-500/10 border border-emerald-500/30 inline-block" />
              วันโกน — ตัดผม ตัดเล็บมงคล
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
              วันหยุดราชการ
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full inline-block border border-white/20" style={{ background: '#a855f7' }} />
              จุดสีมงคลประจำวัน
            </span>
          </div>
        </section>

        {/* ── Ad unit: after calendar grid, before holiday/วันพระ info ── */}
        <AdUnit slot="REPLACE_WITH_SLOT_1" format="auto" />

        {/* ── Two-column: วันหยุด + วันพระ ── */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* วันหยุดราชการ */}
          <section className="rounded-2xl border border-white/10 p-5"
            style={{ background: 'linear-gradient(135deg, rgba(26,10,46,0.5), rgba(10,10,15,0.6))' }}>
            <h2 className="font-heading text-ghostWhite text-lg mb-4 flex items-center gap-2">
              <span className="text-red-400">⚑</span> วันหยุดราชการ {monthName}
            </h2>
            {monthHolidays.length === 0 ? (
              <p className="text-ashGray font-oracle text-sm">ไม่มีวันหยุดราชการในเดือนนี้</p>
            ) : (
              <ul className="space-y-2">
                {monthHolidays.map(d => (
                  <li key={d.iso} className="flex items-center gap-3">
                    <span className="font-heading text-2xl text-red-400/80 w-8 text-center leading-none">{d.dayNum}</span>
                    <div>
                      <p className="font-oracle text-ghostWhite text-sm">{d.holidayName}</p>
                      <p className="text-ashGray text-xs font-oracle">
                        {WEEKDAY_NAMES[d.date.getDay()]} {d.dayNum} {THAI_MONTHS_SHORT[month]} {beYear}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* วันพระ + วันโกน */}
          <section className="rounded-2xl border border-white/10 p-5 space-y-5"
            style={{ background: 'linear-gradient(135deg, rgba(26,10,46,0.5), rgba(10,10,15,0.6))' }}>

            {/* วันพระ */}
            <div>
              <h2 className="font-heading text-ghostWhite text-lg mb-1 flex items-center gap-2">
                <span className="text-amber-300">🙏</span> วันพระ {monthName}
              </h2>
              <p className="text-ashGray/70 font-oracle text-xs mb-3">ทำบุญ · ตักบาตร · ถือศีล · สวดมนต์</p>
              <div className="flex flex-wrap gap-2">
                {monthWanPhra.map(d => (
                  <div
                    key={d.iso}
                    className="flex flex-col items-center bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2 min-w-[52px]"
                  >
                    <span className="font-oracle text-xs text-amber-300/70">{WEEKDAY_NAMES[d.date.getDay()]}</span>
                    <span className="font-heading text-amber-200 text-lg leading-none">{d.dayNum}</span>
                  </div>
                ))}
                {monthWanPhra.length === 0 && (
                  <p className="text-ashGray font-oracle text-sm">ไม่พบข้อมูลวันพระในเดือนนี้</p>
                )}
              </div>
            </div>

            {/* วันโกน */}
            <div className="border-t border-white/5 pt-4">
              <h2 className="font-heading text-ghostWhite text-lg mb-1 flex items-center gap-2">
                <span className="text-emerald-400">✂️</span> วันโกน {monthName}
              </h2>
              <p className="text-ashGray/70 font-oracle text-xs mb-3">ตัดผมมงคล · ตัดเล็บ · โกนหัว · เสริมดวง</p>
              <div className="flex flex-wrap gap-2">
                {monthWanKhon.map(d => (
                  <div
                    key={d.iso}
                    className="flex flex-col items-center bg-emerald-500/10 border border-emerald-500/25 rounded-xl px-3 py-2 min-w-[52px]"
                  >
                    <span className="font-oracle text-xs text-emerald-400/70">{WEEKDAY_NAMES[d.date.getDay()]}</span>
                    <span className="font-heading text-emerald-300 text-lg leading-none">{d.dayNum}</span>
                  </div>
                ))}
                {monthWanKhon.length === 0 && (
                  <p className="text-ashGray font-oracle text-sm">ไม่พบข้อมูลวันโกนในเดือนนี้</p>
                )}
              </div>
              <p className="mt-3 text-ashGray/60 font-oracle text-xs">
                วันโกน คือวันก่อนวันพระ ๑ วัน — นิยมตัดผม ตัดเล็บ และโกนหัวเพื่อเสริมสิริมงคล
              </p>
            </div>

          </section>
        </div>

        {/* ── Day color reference table ── */}
        <section>
          <h2 className="font-heading text-ghostWhite text-xl mb-1">สีประจำวันตามโหราศาสตร์ไทย</h2>
          <p className="text-ashGray font-oracle text-sm mb-5">
            โหราศาสตร์ไทยกำหนดสีมงคล ดาวประจำ และทิศมงคลให้แก่แต่ละวันในสัปดาห์
            การสวมใส่สีประจำวันเกิดหรือวันนั้นๆ ช่วยเสริมดวงชะตาตามหลักโบราณ
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {(Object.entries(DAY_PROFILES) as [ThaiDay, DayProfile][])
              .filter(([k]) => k !== 'wednesday_night')
              .map(([key, p]) => (
              <div
                key={key}
                className="rounded-xl border border-white/10 p-3 flex flex-col items-center gap-2 text-center"
                style={{ background: `${p.colorHex}10` }}
              >
                <span
                  className="w-8 h-8 rounded-full border-2 border-white/20 flex-shrink-0"
                  style={{ background: p.colorHex }}
                />
                <p className="font-heading text-ghostWhite text-sm">วัน{p.thaiName}</p>
                <p className="font-oracle text-xs text-ashGray">{p.color}</p>
                <p className="font-oracle text-xs text-ashGray/70">{p.planet}</p>
                <p className="font-heading text-amethyst text-sm">เลข {p.luckyNumber}</p>
                <p className="font-oracle text-[10px] text-ashGray/60">{p.luckyDirection}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="rounded-2xl border border-amethyst/25 p-8 text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(107,33,168,0.15), rgba(15,10,26,0.9))' }}>
          <div className="absolute inset-0 bg-royalPurple/5 blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-4 max-w-lg mx-auto">
            <p className="text-amethyst font-oracle text-sm">✦ ดูดวงเฉพาะบุคคล ✦</p>
            <h2 className="font-heading text-ghostWhite text-2xl md:text-3xl">
              รู้สีประจำวัน ยังไม่พอ<br/>
              <span className="text-lavenderGlow">รู้ดวงชะตาของตัวเองด้วย</span>
            </h2>
            <p className="text-ashGray font-oracle text-sm leading-relaxed">
              สายมูผสาน Bazi (สี่เสาชะตา) × โหราศาสตร์ไทย × MBTI
              วิเคราะห์ดวงประจำวัน ดวงความรัก การเงิน และอาชีพ
              เฉพาะสำหรับวันเกิดและบุคลิกภาพของเจ้าโดยเฉพาะ
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link href="/fortune">
                <div className="relative inline-block w-full sm:w-auto">
                  <div className="absolute inset-0 bg-royalPurple rounded-lg blur-lg opacity-50" />
                  <button className="relative w-full sm:w-auto px-8 py-3.5 bg-royalPurple hover:bg-amethyst text-ghostWhite font-heading rounded-lg transition-colors shadow-lg shadow-royalPurple/30">
                    ดูดวงฟรีเลย
                  </button>
                </div>
              </Link>
              <Link href="/login">
                <button className="w-full sm:w-auto px-8 py-3.5 border border-amethyst/40 hover:border-amethyst text-amethyst hover:text-ghostWhite hover:bg-amethyst/10 font-heading rounded-lg transition-colors">
                  เข้าสู่ระบบ
                </button>
              </Link>
            </div>
            <p className="text-ashGray/50 font-oracle text-xs">ฟรี ไม่ต้องสมัครสมาชิกก่อน</p>
          </div>
        </section>

        {/* ── Ad unit: after CTA, before SEO article ── */}
        <AdUnit slot="REPLACE_WITH_SLOT_2" format="auto" />

        {/* ── SEO content — Thai beliefs, keywords for สายมู สายบุญ ── */}
        <article className="border-t border-white/5 pt-8 space-y-6">
          <h2 className="font-heading text-ghostWhite text-xl">ปฏิทินไทย วันพระ วันโกน และความเชื่อไทยโบราณ</h2>
          <div className="grid md:grid-cols-2 gap-6 text-ashGray font-oracle text-sm leading-relaxed">

            <div className="space-y-3">
              <h3 className="text-ghostWhite font-heading text-base">วันพระ — วันแห่งบุญและสิริมงคล</h3>
              <p>
                วันพระ (วันอุโบสถ) ตรงกับวันขึ้นและแรม ๘ ค่ำ และ ๑๕ ค่ำ ตามปฏิทินจันทรคติ
                ถือเป็นวันศักดิ์สิทธิ์ที่<strong className="text-ghostWhite/80"> บรรพบุรุษ</strong>สืบทอดมาตั้งแต่โบราณกาล
                ชาวพุทธนิยมไปวัด ทำบุญตักบาตร ฟังธรรม สมาทานศีล และถวายสังฆทานในวันนี้
                เชื่อกันว่าการทำบุญในวันพระช่วย<strong className="text-ghostWhite/80">เสริมดวงชะตา</strong>
                ต่ออายุ และอุทิศส่วนกุศลแก่<strong className="text-ghostWhite/80">ดวงวิญญาณบรรพบุรุษ</strong>ได้อย่างทรงพลัง
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-ghostWhite font-heading text-base">วันโกน — มงคลแห่งการตัดและต่ออายุ</h3>
              <p>
                วันโกน คือวันก่อนวันพระ ๑ วัน ตามความเชื่อไทยโบราณ
                การ<strong className="text-ghostWhite/80">ตัดผม ตัดเล็บ</strong>ในวันโกนช่วยตัดเคราะห์ตัดทุกข์
                ชำระสิ่งไม่ดีออกจากชะตา และเปิดทางให้พลังงานดีๆ ไหลเข้ามาแทน
                หากตัดผมวันพระจะเป็นการ "ตัดบุญ" ตัดโชคลาภ
                ดังนั้น<strong className="text-ghostWhite/80">สายมูและสายบุญ</strong>จึงนิยมตัดผมในวันโกนโดยเฉพาะ
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-ghostWhite font-heading text-base">สีประจำวัน — พลังนพเคราะห์แห่งดวงชะตา</h3>
              <p>
                สีประจำวันในโหราศาสตร์ไทยมาจากระบบ<strong className="text-ghostWhite/80">นพเคราะห์</strong> (ดาวทั้งเก้า)
                ที่ปกครองแต่ละวันในสัปดาห์ ดาวแต่ละดวงมีพลังงาน สี และอิทธิพลต่อ<strong className="text-ghostWhite/80">ดวงชะตา</strong>ผู้เกิดในวันนั้น
                การสวมใส่สีมงคลประจำวันเกิดเสริมบารมี ป้องกันภัยอันตราย
                และดึงดูดโชคลาภตามคติความเชื่อที่สืบต่อมาจาก<strong className="text-ghostWhite/80">บรรพบุรุษ</strong>ไทย
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-ghostWhite font-heading text-base">ฤกษ์ดี — เวลาแห่งพลังงานจักรวาล</h3>
              <p>
                ฤกษ์ดีคือการเลือกวันและเวลาที่<strong className="text-ghostWhite/80">พลังงานจักรวาล</strong>เป็นมงคล
                สำหรับกิจการสำคัญ เช่น <strong className="text-ghostWhite/80">แต่งงาน ขึ้นบ้านใหม่ เปิดกิจการ</strong> ออกเดินทาง หรือเซ็นสัญญา
                ตามความเชื่อไทย วันที่มีพลังงานสอดคล้องกับ<strong className="text-ghostWhite/80">ดวงชะตาของเจ้าของ</strong>
                จะทำให้กิจการสำเร็จลุล่วง ราบรื่น และนำความเจริญรุ่งเรืองมาสู่
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-ghostWhite font-heading text-base">บรรพบุรุษ วิญญาณ และการทำบุญ</h3>
              <p>
                ความเชื่อไทยโบราณเชื่อว่า<strong className="text-ghostWhite/80">ดวงวิญญาณบรรพบุรุษ</strong>ยังคงดูแลปกป้องลูกหลาน
                การทำบุญในวันพระ ตักบาตร ถวายสังฆทาน หรือสวดมนต์อุทิศส่วนกุศล
                จะช่วยให้<strong className="text-ghostWhite/80">ผีบรรพบุรุษ</strong>ได้รับบุญและคอยเสริมดวงให้ลูกหลานมีโชคดี
                คนที่ดวงตกหรือมีเคราะห์ มักได้รับคำแนะนำให้ทำบุญในวันพระ
                เพื่อเสริมบารมีและแก้เคราะห์กรรม
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-ghostWhite font-heading text-base">ปฏิทินไทย — เครื่องมือดูดวงสายมู</h3>
              <p>
                ปฏิทินไทยพุทธศักราชเป็นเครื่องมือสำคัญของ<strong className="text-ghostWhite/80">สายมูและสายบุญ</strong>
                รู้จักวันพระ วันโกน สีมงคล เลขมงคล ดาวประจำวัน และทิศมงคล
                ช่วยให้วางแผนชีวิตสอดคล้องกับ<strong className="text-ghostWhite/80">พลังงานจักรวาลและชะตาดวง</strong>
                ตามหลักโหราศาสตร์ไทยที่สืบทอดมาจากบรรพบุรุษหลายร้อยปี
                รวมถึงช่วยเลือก<strong className="text-ghostWhite/80">ฤกษ์ดีดูดวง</strong>เพื่อชีวิตที่ดีขึ้น
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-ghostWhite font-heading text-base">เลขมงคล — ตัวเลขแห่งดวงชะตา</h3>
              <p>
                เลขมงคลประจำวันสอดคล้องกับพลังงานของดาวนพเคราะห์ที่ปกครองวันนั้น
                ใช้สำหรับเลือก<strong className="text-ghostWhite/80">วันมงคล</strong> ตั้งชื่อลูก กำหนดฤกษ์ หรือเสริมโชคในกิจการ
                เช่น วันอาทิตย์ — เลข ๙ วันจันทร์ — เลข ๒ วันอังคาร — เลข ๘
                เลขเหล่านี้มีพลังดึงดูดพลังงานบวกตามคติ<strong className="text-ghostWhite/80">โหราศาสตร์ไทยโบราณ</strong>
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-ghostWhite font-heading text-base">พุทธศักราช — เวลาแห่งธรรมะ</h3>
              <p>
                พุทธศักราช (พ.ศ.) นับจากปีที่พระพุทธเจ้าเสด็จดับขันธปรินิพพาน
                บวกเพิ่มจากคริสต์ศักราช ๕๔๓ ปี เช่น ค.ศ. {year} = พ.ศ. {beYear}
                ประเทศไทยใช้พุทธศักราชเป็นปฏิทินทางราชการ สะท้อนความเชื่อและ<strong className="text-ghostWhite/80">จิตวิญญาณของชาติ</strong>
                ที่ผูกพันกับพระพุทธศาสนามาตั้งแต่โบราณกาล
              </p>
            </div>

          </div>
        </article>

      </main>

    </div>
  );
}
