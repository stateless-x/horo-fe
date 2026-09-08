import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

import { TrackedCtaLink } from '@/components/tracked-cta-link';
import { FORTUNE_CATEGORY_CONFIG } from '@/lib/fortune-category-config';
import type { FortuneCategoryKey } from '@/lib-packages/shared';

/**
 * The monthly-reading invitation on /dashboard/today.
 *
 * What it points at: /dashboard/fortune is the month's reading —
 * "คำทำนายประจำเดือน{month} พ.ศ. {year}", regenerated at the Bangkok month
 * boundary — sitting on the Bazi chart (เสาชะตา) computed once from birth and
 * never regenerated. The copy carries both halves: only the narrative renews.
 * Promising "ดวงทั้งชีวิต" would be a straight lie about the destination.
 *
 * The copy names no month on purpose. A month-stamped headline reads as
 * mail-merge, and it forces this component to hold clock state and a
 * mount guard against a hydration mismatch on the month boundary — for a line
 * that got worse, not better. "เดือนนี้" is true in every month, so this stays
 * a server component with no state at all.
 *
 * Thai register follows the seo-writer Thai playbook: knowledgeable friend,
 * not institution. Short sentences, no ที่-relative-clause chains (the English
 * calque), benefit before mechanism, Bazi left in Latin script because that is
 * how Thai readers search and how the rest of the app spells it.
 *
 * Deliberately NOT a <ReadNext> card. ReadNext is the restrained end-of-panel
 * block offering a lateral move between things of equal weight; this is the one
 * place in the app that has to move a daily reader onto the monthly chart, so
 * it gets band scale, a full sentence of reasoning, and a single button.
 *
 * Placed after the daily six-area accordion: the reader has just opened a
 * category and got two lines about today, so "แล้วทั้งเดือนล่ะ" is the live
 * thought, and the six chips map onto the six they were just tapping.
 *
 * The chips use the lucide fallback rather than the clay renders: at chip scale
 * clay reads as mud, and DESIGN.md reserves the icon set for exactly this
 * "tiny or text-only" case.
 *
 * The button is a <TrackedCtaLink>, so the click records
 * `cta_clicked{cta:'today_monthly_chart'}`. Only that link is a client
 * component — this band stays server-rendered and ships no JS of its own.
 */
export function MonthlyChartPromo() {
  const categoryKeys = Object.keys(FORTUNE_CATEGORY_CONFIG) as FortuneCategoryKey[];

  return (
    <section
      className="relative mt-12 overflow-hidden rounded-3xl border border-edge bg-surface px-5 py-8 shadow-xl shadow-accent/10 md:px-10 md:py-11"
      aria-labelledby="monthly-chart-promo-title"
    >
      <div
        className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-accentBright/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-28 right-0 size-64 rounded-full bg-accent/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative grid items-center gap-6 md:grid-cols-[1fr_12rem] md:gap-10">
        <div className="order-2 md:order-1">
          <p className="font-heading text-sm tracking-wide text-accentBright">ดวงรายเดือน</p>

          <h2
            id="monthly-chart-promo-title"
            className="mt-2 max-w-[22ch] text-balance font-heading text-3xl font-semibold leading-tight text-ink md:text-4xl"
          >
            รู้ล่วงหน้าทั้งเดือน ช่วงไหนควรลุย ช่วงไหนควรระวัง
          </h2>

          <p className="mt-4 max-w-[46ch] text-base leading-relaxed text-inkMuted md:text-lg">
            ดวงวันนี้บอกได้แค่วันเดียว ดวงรายเดือนมองยาวกว่านั้น
            อ่านจากเสาชะตา Bazi ของคุณ แล้วเล่าให้ฟังครบทั้ง 6 ด้าน
          </p>

          <ul className="mt-6 flex flex-wrap gap-2" aria-label="หัวข้อที่อ่านได้ในดวงรายเดือน">
            {categoryKeys.map((key) => {
              const { label, icon: Icon } = FORTUNE_CATEGORY_CONFIG[key];
              return (
                <li
                  key={key}
                  className="flex items-center gap-1.5 rounded-full border border-edge bg-surface2/55 px-3 py-1.5 text-sm text-ink"
                >
                  <Icon className="size-3.5 text-accentBright" aria-hidden="true" />
                  {label}
                </li>
              );
            })}
          </ul>

          <TrackedCtaLink
            cta="today_monthly_chart"
            surface="today"
            href="/dashboard/fortune"
            className="mt-7 flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-accent px-8 font-heading text-lg text-accentInk shadow-lg shadow-accent/30 transition-all hover:bg-accentBright active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright focus-visible:ring-offset-2 focus-visible:ring-offset-ground sm:w-auto"
          >
            ดูดวงเดือนนี้
            <ArrowRight className="size-5" aria-hidden="true" />
          </TrackedCtaLink>

          <p className="mt-3 text-sm text-inkMuted">
            คำทำนายใหม่ทุกต้นเดือน · ดูแผนผังเสาชะตาของคุณได้ในหน้าเดียวกัน
          </p>
        </div>

        <div className="order-1 mx-auto w-32 md:order-2 md:w-full">
          <Image
            src="/assets/clay/categories/life-overview.webp"
            alt=""
            width={480}
            height={480}
            sizes="(min-width: 768px) 192px, 128px"
            className="h-auto w-full animate-float-1 object-contain motion-reduce:animate-none"
          />
        </div>
      </div>
    </section>
  );
}
