import Image from 'next/image';

const TALISMAN_BANDS = [
  {
    max: 39,
    label: 'จังหวะต่างกัน',
    note: 'ต้องใช้ความเข้าใจมากขึ้น',
    headline: 'ต่างกันเยอะ แต่ยังเข้าใจกันได้',
    src: '/assets/clay/compatibility-talismans/different-rhythms.webp',
  },
  {
    max: 59,
    label: 'ค่อย ๆ จูนกัน',
    note: 'มีพื้นที่ให้เรียนรู้กัน',
    headline: 'มีใจให้กัน แค่ต้องจูนบางเรื่อง',
    src: '/assets/clay/compatibility-talismans/finding-rhythm.webp',
  },
  {
    max: 79,
    label: 'เข้ากันได้ดี',
    note: 'สมดุลที่ต่อยอดได้',
    headline: 'ไปต่อได้สวย ถ้ารักษาจังหวะนี้ไว้',
    src: '/assets/clay/compatibility-talismans/balanced-fit.webp',
  },
  {
    max: 100,
    label: 'จังหวะร่วมเด่น',
    note: 'จังหวะร่วมที่ส่งเสริมกัน',
    headline: 'เข้ากันเป็นธรรมชาติ และโตไปด้วยกันได้',
    src: '/assets/clay/compatibility-talismans/shared-momentum.webp',
  },
] as const;

export type CompatibilityTalismanBand = (typeof TALISMAN_BANDS)[number];

export function compatibilityTalismanBand(score: number): CompatibilityTalismanBand {
  const bounded = Math.max(0, Math.min(100, score));
  return TALISMAN_BANDS.find((band) => bounded <= band.max) ?? TALISMAN_BANDS.at(-1)!;
}

export function CompatibilityTalisman({ score, priority = false }: { score: number; priority?: boolean }) {
  const band = compatibilityTalismanBand(score);

  return (
    <div className="relative mx-auto w-full max-w-[188px] sm:max-w-[224px] lg:max-w-[240px]">
      <span
        aria-hidden="true"
        className="absolute inset-[15%] rounded-full bg-romance/20 blur-2xl dark:bg-romance/15"
      />
      <Image
        src={band.src}
        alt={`เครื่องรางดวงคู่ ${band.label}`}
        width={768}
        height={768}
        sizes="(min-width: 1024px) 240px, (min-width: 640px) 224px, 188px"
        priority={priority}
        className="relative aspect-square w-full object-contain drop-shadow-[0_18px_26px_rgba(107,33,168,0.18)]"
      />
    </div>
  );
}
