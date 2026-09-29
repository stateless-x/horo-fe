import Image from 'next/image';

/** The exported มู gem files (`public/assets/currency/mu-gem-clay-{size}.webp`) the UI picks from. */
const FILE_SIZES = [48, 64, 96, 128, 256] as const;

/**
 * The file for a gem shown at `displayPx` CSS pixels: at least 2× for sharp
 * phones, capped at 256. 24 → 48, 32 → 64, 48 → 96, 64 → 128, 96–128 → 256.
 */
export function currencyFileSize(displayPx: number): (typeof FILE_SIZES)[number] {
  return FILE_SIZES.find((size) => size >= displayPx * 2) ?? 256;
}

/**
 * The มู currency gem (clay render, transparent WebP). Always decorative: it
 * sits beside a visible "มู" label, so alt stays empty. Never the
 * generation-credit card. object-contain, no crop, tint or glow.
 */
export function CurrencyImage({ size, className = '' }: { size: number; className?: string }) {
  const file = currencyFileSize(size);
  return (
    <Image
      src={`/assets/currency/mu-gem-clay-${file}.webp`}
      alt=""
      width={size}
      height={size}
      // The file is already picked for the display size; the optimizer would only re-encode it.
      unoptimized
      className={`shrink-0 object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
