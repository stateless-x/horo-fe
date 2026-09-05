import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AdUnit } from '@/components/ads/ad-unit';
import { MonthTabs } from '@/components/calendar/month-tabs';
import { CALENDAR_MIN_YEAR, CALENDAR_MAX_YEAR, isValidMonthParam } from '@/lib/calendar-range';
import {
  DAY_PROFILES,
  getThaiDay,
  THAI_HOLIDAYS,
  WAN_PHRA_DATES,
  WAN_KHON_DATES,
  toISODate,
  getBangkokNow,
  THAI_MONTHS,
  THAI_MONTHS_SHORT,
  WEEKDAY_NAMES,
  buildCalendar,
  parseMonthParam,
  type CalendarDay,
} from '@/lib/calendar-data';

/**
 * One static page per month, e.g. /calendar/2026-09.
 *
 * Previously this lived at /calendar?m=YYYY-MM, which forced the route
 * dynamic (awaiting searchParams does that in Next 15) so every crawl of the
 * ~108 sitemap URLs re-rendered on the server. As a path segment the months
 * prerender via generateStaticParams instead.
 *
 * revalidate keeps the current-month page's "วันนี้" strip fresh; the other
 * months contain no today-dependent content (see isCurrentMonth below).
 */
export const revalidate = 3600;

// Any month outside the generated set 404s rather than rendering.
export const dynamicParams = false;

export function generateStaticParams(): { yearMonth: string }[] {
  const params: { yearMonth: string }[] = [];
  for (let year = CALENDAR_MIN_YEAR; year <= CALENDAR_MAX_YEAR; year++) {
    for (let month = 1; month <= 12; month++) {
      params.push({ yearMonth: `${year}-${String(month).padStart(2, '0')}` });
    }
  }
  return params;
}

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: Promise<{ yearMonth: string }> }
): Promise<Metadata> {
  const { yearMonth } = await params;
  if (!isValidMonthParam(yearMonth)) return {};
  const { year, month } = parseMonthParam(yearMonth);
  const monthName = THAI_MONTHS[month];
  const beYear = year + 543;

  return {
    // No "| สายมู" suffix here: the root layout's title.template already
    // appends "| สายมู - ดูดวงออนไลน์", and having both produced an 87-char
    // title with the brand twice, well past Google's ~60-char display limit.
    title: `ปฏิทินไทย ${monthName} ${beYear} วันพระ วันโกน ฤกษ์ดี`,
    description: `ปฏิทินไทยพุทธศักราช ${beYear} เดือน${monthName}วันพระ วันโกน ทำบุญ ตัดผม ฤกษ์ดี ขึ้นบ้านใหม่ แต่งงาน เปิดกิจการ สีประจำวัน เลขมงคล ดาวประจำวัน และวันหยุดราชการ ตามหลักโหราศาสตร์ไทยสำหรับสายมูและสายบุญ`,
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
    // Each month is its own static URL, so it canonicalizes to itself.
    alternates: {
      canonical: `/calendar/${yearMonth}`,
    },
    openGraph: {
      title: `ปฏิทินไทย ${monthName} ${beYear} | วันพระ วันโกน ฤกษ์ดี สายมู`,
      description: `วันพระ วันโกน ตัดผมมงคล ฤกษ์ดี ขึ้นบ้านใหม่ แต่งงาน สีประจำวัน เลขมงคล และวันหยุดราชการ เดือน${monthName} ${beYear}ปฏิทินไทยสำหรับสายมูและสายบุญ`,
      type: 'website',
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'สายมู - ปฏิทินไทย ดูดวงออนไลน์ฟรี',
          type: 'image/jpeg',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      images: ['/og-image.jpg'],
    },
  };
}

// ─── Page (Server Componentfully static, no auth required) ────────────────

export default async function CalendarMonthPage(
  { params }: { params: Promise<{ yearMonth: string }> }
) {
  const { yearMonth } = await params;
  // Out-of-range or malformed months are a real 404, not a silent fallback
  // to the current month — otherwise every junk URL would render a page and
  // become indexable duplicate content.
  if (!isValidMonthParam(yearMonth)) notFound();

  const now = getBangkokNow();
  const todayIso = toISODate(now);
  const { year, month } = parseMonthParam(yearMonth);
  const beYear = year + 543;
  const monthName = THAI_MONTHS[month];
  const todayProfile = DAY_PROFILES[getThaiDay(now)];
  const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  // The "วันนี้" strip and the isToday grid highlight only make sense on the
  // month that actually contains today. On the other 107 months they would
  // assert "today is X" on a page about a different month, so they are
  // omitted there rather than rendered with stale build-time values.
  const isCurrentMonth = yearMonth === currentYearMonth;

  const days = buildCalendar(year, month, isCurrentMonth ? todayIso : '');
  const weeks: CalendarDay[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  // Days with holidays this month
  const monthHolidays = days.filter(d => d.isCurrentMonth && d.isHoliday);
  const monthWanPhra = days.filter(d => d.isCurrentMonth && d.isWanPhra);
  const monthWanKhon = days.filter(d => d.isCurrentMonth && d.isWanKhon);

  return (
    <div className="min-h-screen bg-ground text-ink">

      <main className="max-w-5xl mx-auto px-4 py-10 space-y-10">

        {/* ── Hero ── */}
        <section className="text-center space-y-3">
          <p className="text-inkMuted font-oracle text-sm tracking-widest uppercase">โหราศาสตร์ไทย · สายมู · สายบุญ</p>
          <h1 className="text-3xl md:text-5xl font-heading bg-gradient-to-br from-ink via-accentFaint to-accentSoft bg-clip-text text-transparent">
            ปฏิทินไทย {monthName} {beYear}
          </h1>
          <p className="text-accentFaint/90 font-oracle text-sm md:text-base">
            วันพระ · วันโกน · สีประจำวัน · ฤกษ์ดี · วันหยุดราชการ
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-1">
            {['ตัดผมมงคล','ทำบุญ','ขึ้นบ้านใหม่','แต่งงาน','เปิดกิจการ','เสริมดวง'].map(tag => (
              <span key={tag} className="text-xs font-oracle text-inkMuted/70 bg-edgeSoft border border-edge rounded-full px-3 py-1">
                {tag}
              </span>
            ))}
          </div>
          <p className="text-inkMuted/50 font-oracle text-xs">
            {monthName} {year} &middot; พ.ศ. {beYear}
          </p>
        </section>

        {/* ── Month tabs ── */}
        <MonthTabs
          selectedYearMonth={`${year}-${String(month + 1).padStart(2, '0')}`}
          currentYearMonth={currentYearMonth}
        />

        {/* ── Today highlight strip ── */}
        {isCurrentMonth && (
          <section
            className="rounded-2xl p-5 md:p-6 border border-edge"
            style={{ background: 'linear-gradient(135deg, rgba(107,33,168,0.15), var(--glass-to))' }}
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-inkMuted font-oracle text-xs mb-1 uppercase tracking-wider">วันนี้</p>
                  <p className="font-heading text-ink text-2xl md:text-3xl">
                    {WEEKDAY_NAMES[now.getDay()].replace('.','')}{' '}
                    {now.getDate()} {THAI_MONTHS_SHORT[now.getMonth()]} {now.getFullYear() + 543}
                  </p>
                </div>
                <div className="flex flex-col gap-1.5 items-end shrink-0">
                  {WAN_PHRA_DATES.has(todayIso) && (
                    <span className="px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-700 dark:text-amber-300 font-oracle text-xs text-center font-medium">
                      วันพระทำบุญ ตักบาตร
                    </span>
                  )}
                  {WAN_KHON_DATES.has(todayIso) && (
                    <span className="px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/35 text-emerald-700 dark:text-emerald-400 font-oracle text-xs text-center font-medium">
                      วันโกนตัดผมมงคล
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2.5 bg-edgeSoft rounded-xl px-3 py-2.5">
                  <span className="w-5 h-5 rounded-full flex-shrink-0 border border-edge" style={{ background: todayProfile.colorHex }} />
                  <div>
                    <p className="font-oracle text-[10px] text-inkMuted/70 leading-none mb-0.5">สีมงคลวันนี้</p>
                    <p className="font-heading text-ink text-sm leading-none">{todayProfile.color}</p>
                  </div>
                </div>
                <div className="bg-edgeSoft rounded-xl px-3 py-2.5">
                  <p className="font-oracle text-[10px] text-inkMuted/70 leading-none mb-0.5">ดาวประจำวัน</p>
                  <p className="font-heading text-ink text-sm leading-none">{todayProfile.planet}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── Calendar grid ── */}
        <section aria-label={`ปฏิทิน${monthName} ${beYear}`}>
          <div className="rounded-2xl border border-edge overflow-hidden"
            style={{ background: 'linear-gradient(180deg, color-mix(in srgb, var(--surface2) 70%, transparent), var(--glass-to))' }}>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 border-b border-edge">
              {['อา.','จ.','อ.','พ.','พฤ.','ศ.','ส.'].map((d, i) => (
                <div
                  key={d}
                  className={`py-3 text-center font-oracle text-xs font-semibold tracking-wide
                    ${i === 0 ? 'text-red-600 dark:text-red-400' : i === 6 ? 'text-blue-400' : 'text-inkMuted'}`}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Weeks */}
            {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 border-b border-edge last:border-0">
                {week.map((day) => (
                  <div
                    key={day.iso}
                    className={`
                      relative min-h-[80px] md:min-h-[100px] p-1.5 md:p-2.5 border-r border-edge last:border-0
                      flex flex-col gap-1
                      ${!day.isCurrentMonth ? 'opacity-15' : ''}
                      ${day.isToday ? 'bg-accent/25 ring-1 ring-inset ring-accentBright/60' : ''}
                      ${day.isWanPhra && day.isCurrentMonth && !day.isToday ? 'bg-amber-500/8' : ''}
                      ${day.isWanKhon && day.isCurrentMonth && !day.isToday && !day.isWanPhra ? 'bg-emerald-500/8' : ''}
                      ${day.isHoliday && day.isCurrentMonth && !day.isToday ? 'bg-red-500/5' : ''}
                    `}
                  >
                    {/* Date number + color dot */}
                    <div className="flex items-start justify-between">
                      <span
                        className={`font-heading text-base md:text-lg leading-none
                          ${day.isToday ? 'text-accentBright font-bold' : day.isHoliday && day.isCurrentMonth ? 'text-red-600 dark:text-red-400 font-bold' : day.isWanPhra && day.isCurrentMonth ? 'text-amber-700 dark:text-amber-300 font-bold' : 'text-ink'}`}
                      >
                        {day.dayNum}
                      </span>
                      {day.isCurrentMonth && (
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5 border border-edge"
                          style={{ background: day.profile.colorHex }}
                          title={`สี${day.profile.color}`}
                        />
                      )}
                    </div>

                    {/* วันพระ label */}
                    {day.isWanPhra && day.isCurrentMonth && (
                      <span className="text-[11px] md:text-xs font-oracle text-amber-700 dark:text-amber-300 leading-none font-semibold">
                        วันพระ
                      </span>
                    )}

                    {/* วันโกน label */}
                    {day.isWanKhon && day.isCurrentMonth && !day.isWanPhra && (
                      <span className="text-[11px] md:text-xs font-oracle text-emerald-700 dark:text-emerald-400 leading-none font-semibold">
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
          <div className="mt-4 flex flex-wrap gap-4 text-xs font-oracle text-inkMuted">
            {/* Only the current month's grid highlights a day as today, so
                the legend entry would otherwise point at nothing. */}
            {isCurrentMonth && (
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-accent/50 border border-accentBright/50 inline-block" />
                วันนี้
              </span>
            )}
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
              <span className="w-3 h-3 rounded-full inline-block border border-edge" style={{ background: '#a855f7' }} />
              สีมงคลประจำวัน
            </span>
          </div>
        </section>

        {/* ── Ad unit: after calendar grid, before holiday/วันพระ info ── */}
        <AdUnit slot="REPLACE_WITH_SLOT_1" format="auto" />

        {/* ── Two-column: วันหยุด + วันพระ ── */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* วันหยุดราชการ */}
          <section className="rounded-2xl border border-edge p-5"
            style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--surface2) 55%, transparent), var(--glass-to))' }}>
            <h2 className="font-heading text-ink text-lg mb-4">
              วันหยุดราชการ {monthName}
            </h2>
            {monthHolidays.length === 0 ? (
              <p className="text-inkMuted font-oracle text-sm">ไม่มีวันหยุดราชการในเดือนนี้</p>
            ) : (
              <ul className="space-y-2">
                {monthHolidays.map(d => (
                  <li key={d.iso} className="flex items-center gap-3">
                    <span className="font-heading text-2xl text-red-600 dark:text-red-400/80 w-8 text-center leading-none">{d.dayNum}</span>
                    <div>
                      <p className="font-oracle text-ink text-sm">{d.holidayName}</p>
                      <p className="text-inkMuted text-xs font-oracle">
                        {WEEKDAY_NAMES[d.date.getDay()]} {d.dayNum} {THAI_MONTHS_SHORT[month]} {beYear}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* วันพระ + วันโกน */}
          <section className="rounded-2xl border border-edge p-5 space-y-5"
            style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--surface2) 55%, transparent), var(--glass-to))' }}>

            {/* วันพระ */}
            <div>
              <h2 className="font-heading text-amber-700 dark:text-amber-300 text-lg mb-1">วันพระ {monthName}</h2>
              <p className="text-inkMuted/70 font-oracle text-xs mb-3">ทำบุญ · ตักบาตร · ถือศีล · สวดมนต์</p>
              <div className="flex flex-wrap gap-2">
                {monthWanPhra.map(d => (
                  <div
                    key={d.iso}
                    className="flex flex-col items-center bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2 min-w-[52px]"
                  >
                    <span className="font-oracle text-xs text-amber-700 dark:text-amber-300/70">{WEEKDAY_NAMES[d.date.getDay()]}</span>
                    <span className="font-heading text-amber-200 text-lg leading-none">{d.dayNum}</span>
                  </div>
                ))}
                {monthWanPhra.length === 0 && (
                  <p className="text-inkMuted font-oracle text-sm">ไม่พบข้อมูลวันพระในเดือนนี้</p>
                )}
              </div>
            </div>

            {/* วันโกน */}
            <div className="border-t border-edge pt-4">
              <h2 className="font-heading text-emerald-700 dark:text-emerald-400 text-lg mb-1">วันโกน {monthName}</h2>
              <p className="text-inkMuted/70 font-oracle text-xs mb-3">ตัดผม · ตัดเล็บ · โกนหัว</p>
              <div className="flex flex-wrap gap-2">
                {monthWanKhon.map(d => (
                  <div
                    key={d.iso}
                    className="flex flex-col items-center bg-emerald-500/10 border border-emerald-500/25 rounded-xl px-3 py-2 min-w-[52px]"
                  >
                    <span className="font-oracle text-xs text-emerald-700 dark:text-emerald-400/70">{WEEKDAY_NAMES[d.date.getDay()]}</span>
                    <span className="font-heading text-emerald-300 text-lg leading-none">{d.dayNum}</span>
                  </div>
                ))}
                {monthWanKhon.length === 0 && (
                  <p className="text-inkMuted font-oracle text-sm">ไม่พบข้อมูลวันโกนในเดือนนี้</p>
                )}
              </div>
              <p className="mt-3 text-inkMuted/60 font-oracle text-xs">
                วันโกน คือวันก่อนวันพระ ๑ วันนิยมตัดผม ตัดเล็บ และโกนหัวเพื่อเสริมสิริมงคล
              </p>
            </div>

          </section>
        </div>

        {/* ── CTA ── */}
        <section className="rounded-2xl border border-accentBright/25 p-8 text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(107,33,168,0.15), var(--glass-to))' }}>
          <div className="absolute inset-0 bg-accent/5 blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-4 max-w-lg mx-auto">
            <p className="text-accentBright font-oracle text-sm">✦ ดูดวงเฉพาะบุคคล ✦</p>
            <h2 className="font-heading text-ink text-2xl md:text-3xl">
              รู้สีประจำวัน ยังไม่พอ<br/>
              <span className="text-accentSoft">รู้ดวงชะตาของตัวเองด้วย</span>
            </h2>
            <p className="text-inkMuted font-oracle text-sm leading-relaxed">
              สายมูผสาน Bazi (สี่เสาชะตา) × โหราศาสตร์ไทย × MBTI
              วิเคราะห์ดวงประจำวัน ดวงความรัก การเงิน และอาชีพ
              เฉพาะสำหรับวันเกิดและบุคลิกภาพของเจ้าโดยเฉพาะ
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link href="/fortune">
                <div className="relative inline-block w-full sm:w-auto">
                  <div className="absolute inset-0 bg-accent rounded-lg blur-lg opacity-50" />
                  <button className="relative w-full sm:w-auto px-8 py-3.5 bg-accent hover:bg-accentBright text-accentInk font-heading rounded-lg transition-colors shadow-md shadow-accent/20 dark:shadow-accent/30 hover:shadow-lg hover:shadow-accentBright/20 dark:hover:shadow-accentBright/30">
                    ดูดวงฟรีเลย
                  </button>
                </div>
              </Link>
              <Link href="/login">
                <button className="w-full sm:w-auto px-8 py-3.5 border-2 border-accentBright/60 hover:border-accentBright text-accentBright hover:text-ink hover:bg-accentBright/10 dark:hover:bg-accentBright/15 font-heading rounded-lg transition-colors">
                  เข้าสู่ระบบ
                </button>
              </Link>
            </div>
            <p className="text-inkMuted/50 font-oracle text-xs">ฟรี ไม่ต้องสมัครสมาชิกก่อน</p>
          </div>
        </section>

        {/* ── Ad unit: after CTA, before SEO article ── */}
        <AdUnit slot="REPLACE_WITH_SLOT_2" format="auto" />

        {/* ── SEO article ── */}
        <article className="border-t border-edge pt-10 space-y-8">
          <h2 className="font-heading text-ink text-2xl">
            วันพระ วันโกน และความเชื่อไทยที่สืบทอดมาพันปี
          </h2>

          <div className="grid md:grid-cols-2 gap-8">

            {/* วันพระ */}
            <div className="space-y-3">
              <h3 className="font-heading text-amber-700 dark:text-amber-300 text-lg">วันพระวันที่บุญหนักที่สุด</h3>
              <p className="text-inkMuted font-oracle text-sm leading-relaxed">
                วันพระ ตรงกับวันขึ้นและแรม ๘ ค่ำ และ ๑๕ ค่ำ ของทุกเดือนตามจันทรคติ
                ความเชื่อไทยโบราณระบุชัดว่า <strong className="text-ink/90">บุญที่ทำในวันพระ มีน้ำหนักกว่าวันธรรมดาหลายเท่า</strong>
                เพราะพลังงานศักดิ์สิทธิ์ของจักรวาลเปิดรับเต็มที่
              </p>
              <p className="text-inkMuted font-oracle text-sm leading-relaxed">
                ชาวพุทธสายบุญไม่พลาดวันนี้ตักบาตร ไปวัด ถวายสังฆทาน สมาทานศีล
                เชื่อว่าบุญที่สะสมในวันพระจะ<strong className="text-ink/90">เสริมดวงชะตา ต่ออายุ และส่งผลดีถึงชาติหน้า</strong>
                รวมถึงช่วยอุทิศส่วนกุศลไปยัง<strong className="text-ink/90">ดวงวิญญาณบรรพบุรุษ</strong>
                ที่คอยดูแลลูกหลานอยู่อีกด้านหนึ่ง
              </p>
              <p className="text-inkMuted font-oracle text-sm leading-relaxed">
                คนดวงตก เคราะห์หนัก หรือต้องการ<strong className="text-ink/90">แก้เคราะห์กรรม</strong>
                โหรและอาจารย์มักแนะนำให้ถือศีลและทำบุญวันพระติดต่อกันหลายครั้ง
                เพื่อสะสางกรรมเก่าและเปิดทางให้โชคลาภเข้ามา
              </p>
            </div>

            {/* วันโกน */}
            <div className="space-y-3">
              <h3 className="font-heading text-emerald-700 dark:text-emerald-400 text-lg">วันโกนคืนที่วิญญาณพลัดหลง</h3>
              <p className="text-inkMuted font-oracle text-sm leading-relaxed">
                วันโกน คือวันก่อนวันพระ ๑ วัน ชื่อมาจากธรรมเนียมที่<strong className="text-ink/90">พระภิกษุสงฆ์โกนผม โกนคิ้ว</strong>เตรียมตัวก่อนวันพระ
                ในคืนนั้น ความเชื่อไทยโบราณกล่าวว่า
                <strong className="text-ink/90"> วิญญาณและสิ่งที่ล่องลอยในอากาศยังไม่ได้รับบุญ</strong>
                พลังงานยังขุ่นมัว ไม่นิ่งไม่เหมาะทำกิจมงคล แต่เหมาะกับการ "ตัด"
              </p>
              <p className="text-inkMuted font-oracle text-sm leading-relaxed">
                <strong className="text-ink/90">ตัดผม ตัดเล็บ หรือโกนหัวในวันโกน</strong>
                คือการตัดเคราะห์ ตัดทุกข์ ตัดสิ่งไม่ดีที่สะสมออกจากร่างกายและดวงชะตา
                พลังงานวันโกนเหมาะกับการชำระล้าง ทิ้งสิ่งเก่า เปิดรับสิ่งใหม่
              </p>
              <p className="text-inkMuted font-oracle text-sm leading-relaxed">
                ตรงกันข้าม<strong className="text-ink/90">ห้ามตัดผมในวันพระ</strong>
                เชื่อว่าจะตัดบุญตัดโชค ตัดสายสัมพันธ์กับสิ่งดีที่กำลังจะเข้ามา
                นี่คือเหตุผลที่สายมูทุกคนดูปฏิทินก่อนนัดตัดผมทุกครั้ง
              </p>
            </div>

            {/* ฤกษ์ดี */}
            <div className="space-y-3">
              <h3 className="font-heading text-ink text-lg">ฤกษ์ดีเลือกวันให้ชีวิตเดินหน้า</h3>
              <p className="text-inkMuted font-oracle text-sm leading-relaxed">
                ฤกษ์ดีคือการเลือกวันเวลาที่พลังงานของจักรวาลเปิดรับ
                สอดคล้องกับ<strong className="text-ink/90">ดวงชะตาของเจ้าของงาน</strong>
                สำหรับกิจการสำคัญ เช่น <strong className="text-ink/90">แต่งงาน ขึ้นบ้านใหม่ เปิดกิจการ ออกเดินทาง</strong>
              </p>
              <p className="text-inkMuted font-oracle text-sm leading-relaxed">
                ความเชื่อไทยโบราณบอกว่า วันที่เลือกถูก สิ่งที่ทำจะราบรื่น
                แม้จะเจอุปสรรค ก็ผ่านได้ง่าย
                วันที่เลือกผิด แม้ความพร้อมจะครบ ก็มักพบสะดุดโดยไม่รู้สาเหตุ
              </p>
            </div>

            {/* บรรพบุรุษ */}
            <div className="space-y-3">
              <h3 className="font-heading text-ink text-lg">บรรพบุรุษ วิญญาณ และบุญที่ส่งถึงกัน</h3>
              <p className="text-inkMuted font-oracle text-sm leading-relaxed">
                คนไทยเชื่อมั่นว่า<strong className="text-ink/90">วิญญาณบรรพบุรุษยังอยู่ใกล้ลูกหลาน</strong>
                คอยดูแล คอยปกป้อง และคอยรับบุญที่ลูกหลานอุทิศให้
                การทำบุญในวันพระ สวดมนต์ และกรวดน้ำอุทิศส่วนกุศล
                ไม่ใช่แค่เรื่องศาสนาแต่คือการ<strong className="text-ink/90">ส่งพลังงานกลับไปให้ผู้ที่จากไป</strong>
              </p>
              <p className="text-inkMuted font-oracle text-sm leading-relaxed">
                ผีบรรพบุรุษที่ได้รับบุญ จะเสริมดวงลูกหลาน ป้องกันภัยพิบัติ
                และเปิดทางให้โชคลาภไหลเข้ามา
                นี่คือรากฐานความเชื่อที่ทำให้<strong className="text-ink/90">สายบุญไม่เคยขาดวันพระ</strong>
              </p>
            </div>

            {/* สีประจำวัน */}
            <div className="space-y-3">
              <h3 className="font-heading text-ink text-lg">สีประจำวันพลังนพเคราะห์ที่สวมใส่ได้</h3>
              <p className="text-inkMuted font-oracle text-sm leading-relaxed">
                ระบบ<strong className="text-ink/90">นพเคราะห์</strong>ในโหราศาสตร์ไทยผูกดาวแต่ละดวงไว้กับแต่ละวัน
                ดาวแต่ละดวงมีสี พลังงาน และอิทธิพลต่อดวงชะตาต่างกัน
                การสวมสีมงคลของวันเกิด หรือสีของวันนั้นๆ
                ช่วย<strong className="text-ink/90">ดึงพลังงานดาวมาเสริมบารมี</strong> ป้องกันเคราะห์กรรม
                และทำให้การงานในวันนั้นราบรื่นขึ้น
              </p>
            </div>

            {/* วันพระดูยังไง */}
            <div className="space-y-3">
              <h3 className="font-heading text-ink text-lg">วันพระดูยังไงอ่านปฏิทินให้เป็น</h3>
              <p className="text-inkMuted font-oracle text-sm leading-relaxed">
                วันพระในปฏิทินไทยจะระบุ "๘ ค่ำ" หรือ "๑๕ ค่ำ" ใต้วันที่
                ปฏิทินสากลทั่วไปไม่มีข้อมูลนี้ ต้องใช้<strong className="text-ink/90">ปฏิทินจันทรคติ</strong>โดยเฉพาะ
                ในปฏิทินนี้ วันพระจะแสดงสีเหลืองอำพัน วันโกนสีเขียว
                ให้เห็นชัดทุกเดือน ไม่ต้องนับเองให้ปวดหัว
              </p>
              <p className="text-inkMuted font-oracle text-sm leading-relaxed">
                <strong className="text-ink/90">หลักง่ายๆ</strong>ก่อนนัดตัดผม ดูวันโกน
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
