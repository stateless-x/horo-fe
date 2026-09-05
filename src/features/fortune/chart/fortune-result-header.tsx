'use client';

import { Share2 } from 'lucide-react';
import { ElementClayImage, type ClayElement } from '@/components/ui/element-clay-image';

interface FortuneResultHeaderProps {
  userName: string;
  birthDateFormatted: string;
  currentAge: string;
  personalityTraits: string[];
  element: ClayElement;
  elementName: string;
  corePersonality: string;
  onShare: () => void;
}

export function FortuneResultHeader({
  userName,
  birthDateFormatted,
  currentAge,
  personalityTraits,
  element,
  elementName,
  corePersonality,
  onShare,
}: FortuneResultHeaderProps) {
  return (
    <section className="overflow-hidden rounded-3xl border border-edge bg-surface px-5 py-6 shadow-[0_18px_50px_rgba(107,33,168,0.08)] sm:px-8 sm:py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-thai text-sm text-inkMuted">คำทำนายของเจ้าพร้อมแล้ว</p>
          <h1 className="mt-1 font-heading text-3xl font-bold text-ink sm:text-4xl">
            ดวงของ {userName}
          </h1>
          <p className="mt-2 font-thai text-sm text-inkMuted">
            {birthDateFormatted} · อายุ {currentAge}
          </p>
        </div>
        <button
          type="button"
          onClick={onShare}
          className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg border border-edge bg-surface2 text-inkMuted transition-colors hover:text-accentBright focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright"
          aria-label="แชร์คำทำนาย"
        >
          <Share2 className="size-5" aria-hidden="true" />
        </button>
      </div>

      <div className="my-6 h-px bg-edge" />

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <ElementClayImage
          element={element}
          alt={`โมเดลดินปั้น ${elementName}`}
          sizes="(min-width: 640px) 112px, 88px"
          priority
          className="size-24 self-center sm:size-28"
        />
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <p className="font-thai text-sm text-inkMuted">พลังหลักของเจ้า</p>
          <h2
            className="mt-1 font-heading text-2xl font-semibold"
            style={{ color: `var(--el-${element})` }}
          >
            {elementName}
          </h2>
          <p className="mt-2 max-w-[68ch] font-oracle text-base leading-relaxed text-ink sm:text-lg">
            {corePersonality}
          </p>
          <ul className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start" aria-label="ลักษณะเด่น">
            {personalityTraits.slice(0, 3).map((trait, index) => (
              <li key={`${trait}-${index}`} className="rounded-full bg-accent/10 px-3 py-1 text-sm text-accentBright">
                {trait}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
