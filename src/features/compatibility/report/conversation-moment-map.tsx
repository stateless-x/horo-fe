import Image from 'next/image';
import { HeartHandshake, MessageCircleMore } from 'lucide-react';

type ConversationMoment = 'communication' | 'friction';

interface ConversationMomentMapProps {
  onChoose: (moment: ConversationMoment) => void;
}

/**
 * Two practical starting points for a reader who has reached the conversation
 * section. These are buttons, not decorative cards: a choice opens and lands
 * on the matching detailed guide below.
 */
export function ConversationMomentMap({ onChoose }: ConversationMomentMapProps) {
  return (
    <section aria-labelledby="conversation-moment-map" className="border-y border-edge py-4 sm:py-5">
      <div className="flex items-baseline justify-between gap-3">
        <h3 id="conversation-moment-map" className="font-heading text-lg font-semibold leading-snug text-ink">
          ตอนนี้คุณอยู่ตรงไหน
        </h3>
        <p className="shrink-0 text-xs leading-relaxed text-inkMuted">เลือกแล้วดูวิธีต่อได้เลย</p>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:gap-4">
        <button
          type="button"
          onClick={() => onChoose('communication')}
          className="group relative min-h-[142px] overflow-clip rounded-2xl border border-edge bg-surface px-3 pb-3 pt-4 text-left transition-[background-color,border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-accentBright/30 hover:bg-surface2/55 hover:shadow-[0_12px_24px_rgba(107,33,168,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright active:translate-y-0 sm:min-h-[154px] sm:px-4"
        >
          <Image
            src="/assets/clay/relationships/talking.webp"
            alt=""
            width={480}
            height={480}
            sizes="(min-width: 640px) 72px, 58px"
            className="absolute right-1.5 top-1.5 size-[58px] object-contain transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none sm:right-3 sm:top-2 sm:size-[72px]"
          />
          <span className="inline-flex items-center gap-1.5 font-heading text-xs font-medium text-romanceText">
            <MessageCircleMore className="size-3.5" aria-hidden="true" />
            มีเรื่องอยากคุย
          </span>
          <span className="mt-7 block max-w-[14ch] font-heading text-base font-semibold leading-snug text-ink sm:mt-8 sm:text-lg">
            เริ่มคุยตอนใจยังเปิด
          </span>
          <span className="mt-1 block max-w-[17ch] text-xs leading-relaxed text-inkMuted sm:text-sm">
            หยิบประโยคแรกที่ไม่ทำให้อีกฝ่ายตั้งการ์ด
          </span>
        </button>

        <button
          type="button"
          onClick={() => onChoose('friction')}
          className="group relative min-h-[142px] overflow-clip rounded-2xl border border-romance/20 bg-romance/[0.045] px-3 pb-3 pt-4 text-left transition-[background-color,border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-romance/35 hover:bg-romance/[0.08] hover:shadow-[0_12px_24px_rgba(232,93,117,0.11)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright active:translate-y-0 sm:min-h-[154px] sm:px-4"
        >
          <Image
            src="/assets/clay/relationships/reconnect.webp"
            alt=""
            width={1254}
            height={1254}
            sizes="(min-width: 640px) 86px, 68px"
            className="absolute -right-1 top-0.5 size-[68px] object-contain transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none sm:right-1 sm:size-[86px]"
          />
          <span className="inline-flex items-center gap-1.5 font-heading text-xs font-medium text-romanceText">
            <HeartHandshake className="size-3.5" aria-hidden="true" />
            เริ่มรู้สึกตึง
          </span>
          <span className="mt-7 block max-w-[14ch] font-heading text-base font-semibold leading-snug text-ink sm:mt-8 sm:text-lg">
            ลดแรงก่อน แล้วค่อยคุย
          </span>
          <span className="mt-1 block max-w-[17ch] text-xs leading-relaxed text-inkMuted sm:text-sm">
            ดูวิธีกลับมาคุย โดยไม่ต้องรีบหาคนผิด
          </span>
        </button>
      </div>
    </section>
  );
}
