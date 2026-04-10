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
// วันพระ = Buddhist holy days (ขึ้น/แรม ๘ ค่ำ และ ๑๕ ค่ำ — or ๑๔ ค่ำ in เดือนขาด)
// Dates verified against myhora.com and kapook.com for each year.
// วันโกน = the day before every วันพระ (derived dynamically below)
//
// Years 2570–2575 (CE 2027–2032) are included but only shown when year matches.
const WAN_PHRA_DATES = new Set([
  // ── พ.ศ. 2568 / CE 2025 — source: kapook.com / myhora.com ──
  '2025-01-06','2025-01-13','2025-01-21','2025-01-28',
  '2025-02-05','2025-02-12','2025-02-20','2025-02-26',
  '2025-03-06','2025-03-13','2025-03-21','2025-03-28',
  '2025-04-05','2025-04-12','2025-04-20','2025-04-26',
  '2025-05-04','2025-05-11','2025-05-19','2025-05-26',
  '2025-06-03','2025-06-10','2025-06-18','2025-06-25',
  '2025-07-03','2025-07-10','2025-07-18','2025-07-25',
  '2025-08-02','2025-08-09','2025-08-17','2025-08-23','2025-08-31',
  '2025-09-07','2025-09-15','2025-09-22','2025-09-30',
  '2025-10-07','2025-10-15','2025-10-21','2025-10-29',
  '2025-11-05','2025-11-13','2025-11-20','2025-11-28',
  '2025-12-05','2025-12-13','2025-12-19','2025-12-27',
  // ── พ.ศ. 2569 / CE 2026 — source: myhora.com ──
  '2026-01-03','2026-01-11','2026-01-18','2026-01-26',
  '2026-02-02','2026-02-10','2026-02-16','2026-02-24',
  '2026-03-03','2026-03-11','2026-03-18','2026-03-26',
  '2026-04-02','2026-04-10','2026-04-16','2026-04-24',
  '2026-05-01','2026-05-09','2026-05-16','2026-05-24','2026-05-31',
  '2026-06-08','2026-06-14','2026-06-22','2026-06-29',
  '2026-07-07','2026-07-14','2026-07-22','2026-07-29',
  '2026-08-06','2026-08-13','2026-08-21','2026-08-28',
  '2026-09-05','2026-09-11','2026-09-19','2026-09-26',
  '2026-10-04','2026-10-11','2026-10-19','2026-10-26',
  '2026-11-03','2026-11-09','2026-11-17','2026-11-24',
  '2026-12-02','2026-12-09','2026-12-17','2026-12-24',
  // ── พ.ศ. 2570 / CE 2027 — source: myhora.com ──
  '2027-01-01','2027-01-07','2027-01-15','2027-01-22','2027-01-30',
  '2027-02-06','2027-02-14','2027-02-21',
  '2027-03-01','2027-03-07','2027-03-15','2027-03-22','2027-03-30',
  '2027-04-06','2027-04-14','2027-04-21','2027-04-29',
  '2027-05-05','2027-05-13','2027-05-20','2027-05-28',
  '2027-06-04','2027-06-12','2027-06-19','2027-06-27',
  '2027-07-03','2027-07-11','2027-07-18','2027-07-26',
  '2027-08-02','2027-08-10','2027-08-17','2027-08-25','2027-08-31',
  '2027-09-08','2027-09-15','2027-09-23','2027-09-30',
  '2027-10-08','2027-10-15','2027-10-23','2027-10-29',
  '2027-11-06','2027-11-13','2027-11-21','2027-11-28',
  '2027-12-06','2027-12-13','2027-12-21','2027-12-27',
  // ── พ.ศ. 2571 / CE 2028 — source: myhora.com ──
  '2028-01-04','2028-01-11','2028-01-18','2028-01-25',
  '2028-02-03','2028-02-10','2028-02-17','2028-02-24',
  '2028-03-02','2028-03-09','2028-03-17','2028-03-24',
  '2028-04-01','2028-04-08','2028-04-16','2028-04-23',
  '2028-05-01','2028-05-08','2028-05-15','2028-05-23','2028-05-31',
  '2028-06-07','2028-06-14','2028-06-21','2028-06-29',
  '2028-07-06','2028-07-13','2028-07-20','2028-07-28',
  '2028-08-05','2028-08-12','2028-08-19','2028-08-27',
  '2028-09-03','2028-09-10','2028-09-18','2028-09-26',
  '2028-10-02','2028-10-10','2028-10-18','2028-10-25',
  '2028-11-01','2028-11-09','2028-11-16','2028-11-24',
  '2028-12-08','2028-12-15','2028-12-23','2028-12-30',
  // ── พ.ศ. 2572 / CE 2029 — source: myhora.com ──
  '2029-01-07','2029-01-14','2029-01-21','2029-01-28',
  '2029-02-05','2029-02-12','2029-02-19','2029-02-26',
  '2029-03-06','2029-03-13','2029-03-21','2029-03-28',
  '2029-04-05','2029-04-12','2029-04-19','2029-04-26',
  '2029-05-04','2029-05-11','2029-05-19','2029-05-26',
  '2029-06-03','2029-06-10','2029-06-17','2029-06-24',
  '2029-07-02','2029-07-09','2029-07-17','2029-07-24','2029-07-31',
  '2029-08-01','2029-08-08','2029-08-16','2029-08-23','2029-08-30',
  '2029-09-06','2029-09-14','2029-09-21','2029-09-30',
  '2029-10-06','2029-10-14','2029-10-21','2029-10-29',
  '2029-11-04','2029-11-12','2029-11-19','2029-11-27',
  '2029-12-04','2029-12-12','2029-12-20','2029-12-27',
  // ── พ.ศ. 2573 / CE 2030 — source: myhora.com ──
  '2030-01-10','2030-01-17','2030-01-25',
  '2030-02-01','2030-02-09','2030-02-17','2030-02-24',
  '2030-03-02','2030-03-10','2030-03-17','2030-03-25',
  '2030-04-01','2030-04-09','2030-04-16','2030-04-24',
  '2030-05-01','2030-05-08','2030-05-15','2030-05-23','2030-05-31',
  '2030-06-07','2030-06-15','2030-06-22','2030-06-29',
  '2030-07-06','2030-07-13','2030-07-21','2030-07-28',
  '2030-08-05','2030-08-12','2030-08-20','2030-08-27',
  '2030-09-03','2030-09-10','2030-09-18','2030-09-25',
  '2030-10-03','2030-10-10','2030-10-18','2030-10-25',
  '2030-11-01','2030-11-08','2030-11-16','2030-11-23',
  '2030-12-01','2030-12-08','2030-12-16','2030-12-23','2030-12-31',
  // ── พ.ศ. 2574 / CE 2031 — source: myhora.com ──
  '2031-01-07','2031-01-15','2031-01-22','2031-01-29',
  '2031-02-06','2031-02-13','2031-02-20','2031-02-27',
  '2031-03-07','2031-03-15','2031-03-22','2031-03-29',
  '2031-04-05','2031-04-13','2031-04-20','2031-04-27',
  '2031-05-05','2031-05-12','2031-05-19','2031-05-27',
  '2031-06-04','2031-06-12','2031-06-19','2031-06-26',
  '2031-07-03','2031-07-11','2031-07-18','2031-07-25',
  '2031-08-02','2031-08-09','2031-08-17','2031-08-24',
  '2031-09-01','2031-09-09','2031-09-15','2031-09-22','2031-09-29',
  '2031-10-08','2031-10-15','2031-10-23','2031-10-30',
  '2031-11-07','2031-11-14','2031-11-21','2031-11-28',
  '2031-12-06','2031-12-13','2031-12-21','2031-12-28',
  // ── พ.ศ. 2575 / CE 2032 — source: myhora.com ──
  '2032-01-05','2032-01-10','2032-01-18','2032-01-25',
  '2032-02-02','2032-02-09','2032-02-17','2032-02-24',
  '2032-03-03','2032-03-10','2032-03-17','2032-03-24',
  '2032-04-01','2032-04-08','2032-04-16','2032-04-23',
  '2032-05-01','2032-05-07','2032-05-15','2032-05-22','2032-05-30',
  '2032-06-06','2032-06-14','2032-06-29',
  '2032-07-06','2032-07-14','2032-07-21','2032-07-29',
  '2032-08-05','2032-08-13','2032-08-20','2032-08-28',
  '2032-09-03','2032-09-11','2032-09-18','2032-09-26',
  '2032-10-03','2032-10-11','2032-10-18','2032-10-26',
  '2032-11-01','2032-11-09','2032-11-16','2032-11-24',
  '2032-12-09','2032-12-16','2032-12-24','2032-12-30',
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
    if (y >= 2024 && y <= 2032 && mo >= 1 && mo <= 12) {
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
          className="rounded-2xl p-5 md:p-6 border border-white/10"
          style={{ background: 'linear-gradient(135deg, rgba(107,33,168,0.15), rgba(15,10,26,0.8))' }}
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-ashGray font-oracle text-xs mb-1 uppercase tracking-wider">วันนี้</p>
                <p className="font-heading text-ghostWhite text-2xl md:text-3xl">
                  {WEEKDAY_NAMES[now.getDay()].replace('.','')}{' '}
                  {now.getDate()} {THAI_MONTHS_SHORT[now.getMonth()]} {now.getFullYear() + 543}
                </p>
              </div>
              <div className="flex flex-col gap-1.5 items-end shrink-0">
                {WAN_PHRA_DATES.has(todayIso) && (
                  <span className="px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-oracle text-xs text-center font-medium">
                    วันพระ — ทำบุญ ตักบาตร
                  </span>
                )}
                {WAN_KHON_DATES.has(todayIso) && (
                  <span className="px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/35 text-emerald-400 font-oracle text-xs text-center font-medium">
                    วันโกน — ตัดผมมงคล
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2.5 bg-white/5 rounded-xl px-3 py-2.5">
                <span className="w-5 h-5 rounded-full flex-shrink-0 border border-white/20" style={{ background: todayProfile.colorHex }} />
                <div>
                  <p className="font-oracle text-[10px] text-ashGray/70 leading-none mb-0.5">สีมงคลวันนี้</p>
                  <p className="font-heading text-ghostWhite text-sm leading-none">{todayProfile.color}</p>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl px-3 py-2.5">
                <p className="font-oracle text-[10px] text-ashGray/70 leading-none mb-0.5">ดาวประจำวัน</p>
                <p className="font-heading text-ghostWhite text-sm leading-none">{todayProfile.planet}</p>
              </div>
            </div>
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
                  className={`py-3 text-center font-oracle text-xs font-semibold tracking-wide
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
                      relative min-h-[80px] md:min-h-[100px] p-1.5 md:p-2.5 border-r border-white/5 last:border-0
                      flex flex-col gap-1
                      ${!day.isCurrentMonth ? 'opacity-15' : ''}
                      ${day.isToday ? 'bg-royalPurple/25 ring-1 ring-inset ring-amethyst/60' : ''}
                      ${day.isWanPhra && day.isCurrentMonth && !day.isToday ? 'bg-amber-500/8' : ''}
                      ${day.isWanKhon && day.isCurrentMonth && !day.isToday && !day.isWanPhra ? 'bg-emerald-500/8' : ''}
                      ${day.isHoliday && day.isCurrentMonth && !day.isToday ? 'bg-red-500/5' : ''}
                    `}
                  >
                    {/* Date number + color dot */}
                    <div className="flex items-start justify-between">
                      <span
                        className={`font-heading text-base md:text-lg leading-none
                          ${day.isToday ? 'text-amethyst font-bold' : day.isHoliday && day.isCurrentMonth ? 'text-red-400 font-bold' : day.isWanPhra && day.isCurrentMonth ? 'text-amber-300 font-bold' : 'text-ghostWhite'}`}
                      >
                        {day.dayNum}
                      </span>
                      {day.isCurrentMonth && (
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5 border border-white/10"
                          style={{ background: day.profile.colorHex }}
                          title={`สี${day.profile.color}`}
                        />
                      )}
                    </div>

                    {/* วันพระ label */}
                    {day.isWanPhra && day.isCurrentMonth && (
                      <span className="text-[11px] md:text-xs font-oracle text-amber-300 leading-none font-semibold">
                        วันพระ
                      </span>
                    )}

                    {/* วันโกน label */}
                    {day.isWanKhon && day.isCurrentMonth && !day.isWanPhra && (
                      <span className="text-[11px] md:text-xs font-oracle text-emerald-400 leading-none font-semibold">
                        วันโกน
                      </span>
                    )}

                    {/* Holiday name */}
                    {day.isHoliday && day.isCurrentMonth && (
                      <span className="text-[10px] md:text-[11px] font-oracle text-red-300 leading-tight line-clamp-2">
                        {day.holidayName}
                      </span>
                    )}

                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 text-xs font-oracle text-ashGray">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-royalPurple/50 border border-amethyst/50 inline-block" />
              วันนี้
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-amber-500/10 border border-amber-500/40 inline-block" />
              วันพระ
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-emerald-500/10 border border-emerald-500/30 inline-block" />
              วันโกน
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-red-500/10 border border-red-400/40 inline-block" />
              วันหยุดราชการ
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full inline-block border border-white/20" style={{ background: '#a855f7' }} />
              สีมงคลประจำวัน
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
            <h2 className="font-heading text-ghostWhite text-lg mb-4">
              วันหยุดราชการ {monthName}
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
              <h2 className="font-heading text-amber-300 text-lg mb-1">วันพระ {monthName}</h2>
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
              <h2 className="font-heading text-emerald-400 text-lg mb-1">วันโกน {monthName}</h2>
              <p className="text-ashGray/70 font-oracle text-xs mb-3">ตัดผม · ตัดเล็บ · โกนหัว</p>
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

        {/* ── SEO article ── */}
        <article className="border-t border-white/5 pt-10 space-y-8">
          <h2 className="font-heading text-ghostWhite text-2xl">
            วันพระ วันโกน และความเชื่อไทยที่สืบทอดมาพันปี
          </h2>

          <div className="grid md:grid-cols-2 gap-8">

            {/* วันพระ */}
            <div className="space-y-3">
              <h3 className="font-heading text-amber-300 text-lg">วันพระ — วันที่บุญหนักที่สุด</h3>
              <p className="text-ashGray font-oracle text-sm leading-relaxed">
                วันพระ ตรงกับวันขึ้นและแรม ๘ ค่ำ และ ๑๕ ค่ำ ของทุกเดือนตามจันทรคติ
                ความเชื่อไทยโบราณระบุชัดว่า <strong className="text-ghostWhite/90">บุญที่ทำในวันพระ มีน้ำหนักกว่าวันธรรมดาหลายเท่า</strong>
                เพราะพลังงานศักดิ์สิทธิ์ของจักรวาลเปิดรับเต็มที่
              </p>
              <p className="text-ashGray font-oracle text-sm leading-relaxed">
                ชาวพุทธสายบุญไม่พลาดวันนี้ — ตักบาตร ไปวัด ถวายสังฆทาน สมาทานศีล
                เชื่อว่าบุญที่สะสมในวันพระจะ<strong className="text-ghostWhite/90">เสริมดวงชะตา ต่ออายุ และส่งผลดีถึงชาติหน้า</strong>
                รวมถึงช่วยอุทิศส่วนกุศลไปยัง<strong className="text-ghostWhite/90">ดวงวิญญาณบรรพบุรุษ</strong>
                ที่คอยดูแลลูกหลานอยู่อีกด้านหนึ่ง
              </p>
              <p className="text-ashGray font-oracle text-sm leading-relaxed">
                คนดวงตก เคราะห์หนัก หรือต้องการ<strong className="text-ghostWhite/90">แก้เคราะห์กรรม</strong>
                โหรและอาจารย์มักแนะนำให้ถือศีลและทำบุญวันพระติดต่อกันหลายครั้ง
                เพื่อสะสางกรรมเก่าและเปิดทางให้โชคลาภเข้ามา
              </p>
            </div>

            {/* วันโกน */}
            <div className="space-y-3">
              <h3 className="font-heading text-emerald-400 text-lg">วันโกน — คืนที่วิญญาณพลัดหลง</h3>
              <p className="text-ashGray font-oracle text-sm leading-relaxed">
                วันโกน คือวันก่อนวันพระ ๑ วัน ชื่อมาจากธรรมเนียมที่<strong className="text-ghostWhite/90">พระภิกษุสงฆ์โกนผม โกนคิ้ว</strong>เตรียมตัวก่อนวันพระ
                ในคืนนั้น ความเชื่อไทยโบราณกล่าวว่า
                <strong className="text-ghostWhite/90"> วิญญาณและสิ่งที่ล่องลอยในอากาศยังไม่ได้รับบุญ</strong>
                พลังงานยังขุ่นมัว ไม่นิ่ง — ไม่เหมาะทำกิจมงคล แต่เหมาะกับการ "ตัด"
              </p>
              <p className="text-ashGray font-oracle text-sm leading-relaxed">
                <strong className="text-ghostWhite/90">ตัดผม ตัดเล็บ หรือโกนหัวในวันโกน</strong>
                คือการตัดเคราะห์ ตัดทุกข์ ตัดสิ่งไม่ดีที่สะสมออกจากร่างกายและดวงชะตา
                พลังงานวันโกนเหมาะกับการชำระล้าง ทิ้งสิ่งเก่า เปิดรับสิ่งใหม่
              </p>
              <p className="text-ashGray font-oracle text-sm leading-relaxed">
                ตรงกันข้าม — <strong className="text-ghostWhite/90">ห้ามตัดผมในวันพระ</strong>
                เชื่อว่าจะตัดบุญตัดโชค ตัดสายสัมพันธ์กับสิ่งดีที่กำลังจะเข้ามา
                นี่คือเหตุผลที่สายมูทุกคนดูปฏิทินก่อนนัดตัดผมทุกครั้ง
              </p>
            </div>

            {/* ฤกษ์ดี */}
            <div className="space-y-3">
              <h3 className="font-heading text-ghostWhite text-lg">ฤกษ์ดี — เลือกวันให้ชีวิตเดินหน้า</h3>
              <p className="text-ashGray font-oracle text-sm leading-relaxed">
                ฤกษ์ดีคือการเลือกวันเวลาที่พลังงานของจักรวาลเปิดรับ
                สอดคล้องกับ<strong className="text-ghostWhite/90">ดวงชะตาของเจ้าของงาน</strong>
                สำหรับกิจการสำคัญ เช่น <strong className="text-ghostWhite/90">แต่งงาน ขึ้นบ้านใหม่ เปิดกิจการ ออกเดินทาง</strong>
              </p>
              <p className="text-ashGray font-oracle text-sm leading-relaxed">
                ความเชื่อไทยโบราณบอกว่า วันที่เลือกถูก สิ่งที่ทำจะราบรื่น
                แม้จะเจอุปสรรค ก็ผ่านได้ง่าย
                วันที่เลือกผิด แม้ความพร้อมจะครบ ก็มักพบสะดุดโดยไม่รู้สาเหตุ
              </p>
            </div>

            {/* บรรพบุรุษ */}
            <div className="space-y-3">
              <h3 className="font-heading text-ghostWhite text-lg">บรรพบุรุษ วิญญาณ และบุญที่ส่งถึงกัน</h3>
              <p className="text-ashGray font-oracle text-sm leading-relaxed">
                คนไทยเชื่อมั่นว่า<strong className="text-ghostWhite/90">วิญญาณบรรพบุรุษยังอยู่ใกล้ลูกหลาน</strong>
                คอยดูแล คอยปกป้อง และคอยรับบุญที่ลูกหลานอุทิศให้
                การทำบุญในวันพระ สวดมนต์ และกรวดน้ำอุทิศส่วนกุศล
                ไม่ใช่แค่เรื่องศาสนา — แต่คือการ<strong className="text-ghostWhite/90">ส่งพลังงานกลับไปให้ผู้ที่จากไป</strong>
              </p>
              <p className="text-ashGray font-oracle text-sm leading-relaxed">
                ผีบรรพบุรุษที่ได้รับบุญ จะเสริมดวงลูกหลาน ป้องกันภัยพิบัติ
                และเปิดทางให้โชคลาภไหลเข้ามา
                นี่คือรากฐานความเชื่อที่ทำให้<strong className="text-ghostWhite/90">สายบุญไม่เคยขาดวันพระ</strong>
              </p>
            </div>

            {/* สีประจำวัน */}
            <div className="space-y-3">
              <h3 className="font-heading text-ghostWhite text-lg">สีประจำวัน — พลังนพเคราะห์ที่สวมใส่ได้</h3>
              <p className="text-ashGray font-oracle text-sm leading-relaxed">
                ระบบ<strong className="text-ghostWhite/90">นพเคราะห์</strong>ในโหราศาสตร์ไทยผูกดาวแต่ละดวงไว้กับแต่ละวัน
                ดาวแต่ละดวงมีสี พลังงาน และอิทธิพลต่อดวงชะตาต่างกัน
                การสวมสีมงคลของวันเกิด หรือสีของวันนั้นๆ
                ช่วย<strong className="text-ghostWhite/90">ดึงพลังงานดาวมาเสริมบารมี</strong> ป้องกันเคราะห์กรรม
                และทำให้การงานในวันนั้นราบรื่นขึ้น
              </p>
            </div>

            {/* วันพระดูยังไง */}
            <div className="space-y-3">
              <h3 className="font-heading text-ghostWhite text-lg">วันพระดูยังไง — อ่านปฏิทินให้เป็น</h3>
              <p className="text-ashGray font-oracle text-sm leading-relaxed">
                วันพระในปฏิทินไทยจะระบุ "๘ ค่ำ" หรือ "๑๕ ค่ำ" ใต้วันที่
                ปฏิทินสากลทั่วไปไม่มีข้อมูลนี้ ต้องใช้<strong className="text-ghostWhite/90">ปฏิทินจันทรคติ</strong>โดยเฉพาะ
                ในปฏิทินนี้ วันพระจะแสดงสีเหลืองอำพัน วันโกนสีเขียว
                ให้เห็นชัดทุกเดือน ไม่ต้องนับเองให้ปวดหัว
              </p>
              <p className="text-ashGray font-oracle text-sm leading-relaxed">
                <strong className="text-ghostWhite/90">หลักง่ายๆ</strong> — ก่อนนัดตัดผม ดูวันโกน
                ก่อนทำบุญใหญ่ ดูวันพระ
                ก่อนเริ่มกิจการ ดูฤกษ์ดีและสีมงคลของวันนั้น
              </p>
            </div>

          </div>
        </article>

      </main>

    </div>
  );
}
