import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';
import type {
  BirthStarDetail,
  FortuneReadingCategory,
  Recommendations,
} from '@/lib-packages/shared/types/astrology';
import { localizeColorName, localizeDayName } from '@/lib/thai-localize';
import { GuidanceColumns } from '@/features/fortune/chart/fortune-guidance';

interface FortuneOverviewSectionProps {
  fortuneReadings: FortuneReadingCategory[];
  recommendations: Recommendations;
  birthStar: BirthStarDetail;
  onOpenReadings: () => void;
}

const THAI_MONTHS = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
];

function getReadingSummary(reading: string, maxLength = 320) {
  if (reading.length <= maxLength) return reading;
  const shortened = reading.slice(0, maxLength);
  const lastBreak = shortened.lastIndexOf(' ');
  return `${shortened.slice(0, lastBreak > maxLength * 0.7 ? lastBreak : maxLength).trim()}…`;
}

export function FortuneOverviewSection({
  fortuneReadings,
  recommendations,
  birthStar,
  onOpenReadings,
}: FortuneOverviewSectionProps) {
  const lifeReading = fortuneReadings.find((reading) => reading.key === 'life_overview') ?? fortuneReadings[0];
  const currentMonth = THAI_MONTHS[new Date().getMonth()];
  const monthHighlight = recommendations.monthlyHighlights.find((item) => item.month.includes(currentMonth))
    ?? recommendations.monthlyHighlights[0];

  return (
    <section aria-labelledby="result-overview-title">
      <div className="mb-8">
        <h2 id="result-overview-title" className="font-heading text-2xl font-semibold text-ink sm:text-3xl">
          เริ่มจากตรงนี้
        </h2>
        <p className="mt-2 font-thai text-inkMuted">สรุปสิ่งสำคัญที่ควรรู้ก่อน ใช้เวลาอ่านประมาณ 1 นาที</p>
      </div>

      {lifeReading && (
        <div className="border-b border-edge pb-8">
          <p className="font-oracle text-lg font-light leading-[1.8] text-ink sm:text-xl">
            {getReadingSummary(lifeReading.reading)}
          </p>
          {lifeReading.reading.length > 320 && (
            <button
              type="button"
              onClick={onOpenReadings}
              className="mt-3 flex min-h-11 items-center gap-1 font-heading text-accentBright transition-colors hover:text-accentSoft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright rounded"
            >
              อ่านต่อในคำทำนายฉบับเต็ม
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>
      )}

      {monthHighlight && (
        <div className="border-b border-edge py-8">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-1 size-5 shrink-0 text-accentBright" aria-hidden="true" />
            <div>
              <p className="font-thai text-sm text-inkMuted">สิ่งที่ควรโฟกัสใน {monthHighlight.month}</p>
              <h3 className="mt-1 font-heading text-xl font-semibold text-ink">{monthHighlight.note}</h3>
              <p className="mt-2 max-w-[68ch] font-thai leading-relaxed text-inkMuted">
                {monthHighlight.description}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="border-b border-edge py-8">
        <div className="flex items-center gap-4">
          <Image
            src="/assets/clay/chart-scroll-oracle.webp"
            alt=""
            width={1254}
            height={1254}
            sizes="72px"
            className="size-16 shrink-0 object-contain sm:size-[72px]"
          />
          <div>
            <h3 className="font-heading text-xl font-semibold text-ink">แนวทางที่หยิบไปใช้ได้</h3>
            <p className="mt-1 font-thai text-sm text-inkMuted">เก็บไว้เป็นเข็มทิศ ไม่ต้องทำทุกอย่างในคราวเดียว</p>
          </div>
        </div>
        <GuidanceColumns
          positiveItems={recommendations.dos.slice(0, 2)}
          negativeItems={recommendations.donts.slice(0, 2)}
          positiveLabel="เริ่มจากสิ่งนี้"
          negativeLabel="พักเรื่องนี้ไว้ก่อน"
          className="mt-6"
        />
      </div>

      <div className="py-8">
        <h3 className="font-heading text-lg font-semibold text-ink">ตัวช่วยเล็ก ๆ ของเจ้า</h3>
        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
          <div><dt className="text-sm text-inkMuted">สีมงคล</dt><dd className="mt-1 font-heading text-ink">{localizeColorName(birthStar.luckyColor)}</dd></div>
          <div><dt className="text-sm text-inkMuted">เลขมงคล</dt><dd className="mt-1 font-heading text-ink">{birthStar.luckyNumber}</dd></div>
          <div><dt className="text-sm text-inkMuted">ทิศมงคล</dt><dd className="mt-1 font-heading text-ink">{birthStar.luckyDirection}</dd></div>
          <div><dt className="text-sm text-inkMuted">วันมงคล</dt><dd className="mt-1 font-heading text-ink">{localizeDayName(birthStar.luckyDay)}</dd></div>
        </dl>
      </div>

      <button
        type="button"
        onClick={onOpenReadings}
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 font-heading font-semibold text-accentInk transition-colors hover:bg-accentBright focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright focus-visible:ring-offset-2 focus-visible:ring-offset-ground sm:w-auto"
      >
        อ่านคำทำนายทั้ง 6 ด้าน
        <ArrowRight className="size-5" aria-hidden="true" />
      </button>
    </section>
  );
}
