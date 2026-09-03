import { ImageIcon } from 'lucide-react';

interface MediaPlaceholderProps {
  /** Aspect ratio as "w/h", e.g. "16/9". Holds the final layout box. */
  aspect: string;
  /** Asset spec shown on the frame, e.g. "1600×900 · WebP" */
  spec: string;
  /** What the image should depict — guidance for sourcing the asset */
  label: string;
  /**
   * Compact variant for small in-card slots: shows only the icon + spec,
   * keeps the full label as the accessible name.
   */
  compact?: boolean;
  /**
   * Icon-only variant for icon-scale slots (e.g. a 56–72px category badge):
   * shows only the icon, no spec text — the spec still belongs in the
   * accessible name/title so the asset commission stays documented.
   */
  iconOnly?: boolean;
  /**
   * Drops the border/rounded-2xl/background so the placeholder can act as a
   * card's full-bleed media area — the parent card supplies the border and
   * clips the corners via its own overflow-hidden + rounded-2xl.
   */
  flush?: boolean;
  /** Optional hue for the ambient orb (e.g. an element color); defaults to royal purple */
  glowColor?: string;
  className?: string;
}

/**
 * MediaPlaceholder — stands in for an image slot until the real asset lands.
 *
 * Occupies the exact final layout box (fixed aspect ratio, fluid width) so the
 * composition is real before the art is. Replace with next/image using the
 * same aspect ratio and the printed spec as the export size. Illustrative
 * assets follow DESIGN.md's Clay Cast Rule: soft 3D clay renders on
 * transparent ground.
 */
export function MediaPlaceholder({
  aspect,
  spec,
  label,
  compact = false,
  iconOnly = false,
  flush = false,
  glowColor,
  className = '',
}: MediaPlaceholderProps) {
  return (
    <div
      role="img"
      aria-label={label}
      title={`${label} — ${spec}`}
      className={`relative overflow-hidden ${flush ? '' : 'rounded-2xl border border-white/10'} bg-deepNight ${className}`}
      style={{ aspectRatio: aspect }}
    >
      {/* Ambient orb — element-tinted when the asset belongs to a ธาตุ */}
      <div
        className="absolute -top-1/4 -right-1/4 w-2/3 h-2/3 rounded-full blur-3xl"
        style={{ backgroundColor: glowColor ? `${glowColor}26` : 'rgba(107,33,168,0.15)' }}
      />
      <div className={`absolute inset-0 flex flex-col items-center justify-center text-center ${iconOnly ? '' : compact ? 'gap-1 px-2' : 'gap-2 px-6'}`}>
        <ImageIcon className={iconOnly ? 'w-5 h-5 text-amethyst/50' : compact ? 'w-4 h-4 text-amethyst/50' : 'w-6 h-6 text-amethyst/50'} aria-hidden />
        {!compact && !iconOnly && (
          <p className="text-ashGray text-sm leading-relaxed max-w-[36ch]">{label}</p>
        )}
        {!iconOnly && (
          <p className="font-mono text-xs tracking-wider text-ashGray/60">{spec}</p>
        )}
      </div>
    </div>
  );
}
