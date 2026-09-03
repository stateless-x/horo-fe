import { ImageIcon } from 'lucide-react';

interface MediaPlaceholderProps {
  /** Aspect ratio as "w/h", e.g. "16/9". Holds the final layout box. */
  aspect: string;
  /** Asset spec shown on the frame, e.g. "1600×900 · WebP" */
  spec: string;
  /** What the image should depict — guidance for sourcing the asset */
  label: string;
  className?: string;
}

/**
 * MediaPlaceholder — stands in for an image slot until the real asset lands.
 *
 * Occupies the exact final layout box (fixed aspect ratio, fluid width) so the
 * composition is real before the art is. Replace with next/image using the
 * same aspect ratio and the printed spec as the export size.
 */
export function MediaPlaceholder({ aspect, spec, label, className = '' }: MediaPlaceholderProps) {
  return (
    <div
      role="img"
      aria-label={label}
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-deepNight ${className}`}
      style={{ aspectRatio: aspect }}
    >
      {/* Faint amethyst orb — keeps the slot on the purple ladder */}
      <div className="absolute -top-1/4 -right-1/4 w-2/3 h-2/3 rounded-full bg-royalPurple/15 blur-3xl" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
        <ImageIcon className="w-6 h-6 text-amethyst/50" aria-hidden />
        <p className="text-ashGray text-sm leading-relaxed max-w-[36ch]">{label}</p>
        <p className="font-mono text-xs tracking-wider text-ashGray/60">{spec}</p>
      </div>
    </div>
  );
}
