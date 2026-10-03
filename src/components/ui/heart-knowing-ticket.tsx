import Image from 'next/image';

type TicketSize = 96 | 160 | 256 | 384;

const SOURCES: Record<TicketSize, { src: string; width: number; height: number }> = {
  96: { src: '/assets/tickets/heart-knowing-ticket-256.webp', width: 256, height: 171 },
  160: { src: '/assets/tickets/heart-knowing-ticket-512.webp', width: 512, height: 342 },
  256: { src: '/assets/tickets/heart-knowing-ticket-512.webp', width: 512, height: 342 },
  384: { src: '/assets/tickets/heart-knowing-ticket-1024.webp', width: 1024, height: 683 },
};

/**
 * Decorative illustration for the compatibility-only ตั๋วรู้ใจ item.
 * The surrounding UI always supplies its label and amount, so this asset
 * deliberately contains no text and remains usable across Thai copy changes.
 */
export function HeartKnowingTicket({ size = 160, className = '' }: { size?: TicketSize; className?: string }) {
  const source = SOURCES[size];

  return (
    <Image
      alt=""
      aria-hidden="true"
      src={source.src}
      width={source.width}
      height={source.height}
      sizes={`${size}px`}
      className={`h-auto object-contain ${className || 'w-full'}`}
    />
  );
}
