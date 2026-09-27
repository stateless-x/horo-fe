import { Share2, Users } from 'lucide-react';
import { ElementClayImage } from '@/components/ui/element-clay-image';
import { Button } from '@/lib-packages/ui';
import type { CompatibilityV4Teaser } from '@/lib-packages/shared/types/compatibility-v4';
import { DisplayLine, ELEMENT_TH, elementText, SectionHeading } from './report-kit';

interface ShareCardProps {
  content: Pick<CompatibilityV4Teaser, 'archetype' | 'people'>;
  score: number;
  readerName: string;
  partnerName: string;
  relationshipLabel: string;
  onShare?: () => void;
  onNewCheck?: () => void;
}

/**
 * ShareCard: the pair's card for sharing. Free fields only (names, elements,
 * score, archetype, tagline, relationship), never report text. It is always
 * the Midnight Room: a data-theme="dark" island, so the tokens resolve dark.
 */
export function ShareCard({ content, score, readerName, partnerName, relationshipLabel, onShare, onNewCheck }: ShareCardProps) {
  const people = [
    { name: readerName, person: content.people.reader },
    { name: partnerName, person: content.people.partner },
  ];
  return (
    <section aria-labelledby="report-share">
      <SectionHeading
        id="report-share"
        title={<span className="text-xl">การ์ดคู่สำหรับแชร์</span>}
        sub="การ์ดนี้มีแค่ชื่อ ธาตุ คะแนน และฉายาของคู่ ไม่มีเนื้อหาจากฉบับเต็ม แชร์ได้สบายใจ"
      />
      <div
        data-theme="dark"
        role="img"
        aria-label={`การ์ดแชร์ ${content.archetype.name} ความเข้ากัน ${score} จาก 100`}
        className="relative mx-auto mt-4 flex aspect-[4/5] w-full max-w-[320px] flex-col overflow-hidden rounded-[20px] border border-edge bg-[radial-gradient(120%_70%_at_50%_0%,color-mix(in_srgb,var(--accent)_42%,var(--ground))_0%,var(--surface)_55%,var(--ground)_100%)] px-[18px] pb-4 pt-[18px] text-ink shadow-[0_24px_48px_-24px_rgba(107,33,168,0.55)]"
      >
        <div className="flex items-center justify-between text-xs">
          <span className="font-heading text-base font-bold text-accentSoft">สายมู</span>
          <span className="font-heading font-semibold text-romanceText">{relationshipLabel}</span>
        </div>
        <div className="mt-auto grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-x-1">
          {people.map(({ name, person }, i) => (
            <div key={i} className={`flex min-w-0 flex-col items-center text-center ${i === 1 ? 'col-start-3' : ''}`}>
              <ElementClayImage element={person.element} alt="" sizes="62px" className="size-[62px]" />
              <span className="mt-1 max-w-full truncate font-heading text-[0.9375rem] font-semibold">{name}</span>
              <b className="text-xs font-semibold" style={elementText(person.element)}>
                ธาตุ{ELEMENT_TH[person.element]}
              </b>
            </div>
          ))}
          <div className="col-start-2 row-start-1 -mt-3.5 grid size-[92px] place-items-center">
            <div className="flex size-[70px] flex-col items-center justify-center rounded-full border border-romance/45 bg-surface shadow-[0_10px_28px_-10px_rgba(232,93,117,0.5)]">
              <span className="font-heading text-[1.75rem] font-bold leading-none tabular-nums">{score}</span>
              <span className="mt-0.5 text-[0.625rem] text-inkMuted">ความเข้ากัน</span>
            </div>
          </div>
        </div>
        <p className="mt-[18px] text-center font-heading text-[1.75rem] font-bold leading-tight">{content.archetype.name}</p>
        <p className="mt-1 text-balance text-center font-oracle text-[0.9375rem] leading-normal text-accentFaint">
          <DisplayLine text={content.archetype.tagline} />
        </p>
        <div className="mt-auto flex justify-between border-t border-edge pt-2.5 text-[0.6875rem] text-inkMuted">
          <span>ดูดวงคู่ของคุณ</span>
          <span>สายมู.com</span>
        </div>
      </div>
      <div className="mx-auto mt-4 grid max-w-[320px] gap-2.5">
        {onShare && (
          <Button type="button" onClick={onShare} className="w-full gap-2 font-heading">
            <Share2 className="size-4" aria-hidden="true" />
            แชร์การ์ดนี้
          </Button>
        )}
        {onNewCheck && (
          <Button type="button" variant="outline" onClick={onNewCheck} className="w-full gap-2 font-heading">
            <Users className="size-4" aria-hidden="true" />
            ดูดวงคู่กับคนอื่น
          </Button>
        )}
      </div>
    </section>
  );
}
