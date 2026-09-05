'use client';

import Image from 'next/image';

interface ClayOracleLoaderProps {
  className?: string;
  alt?: string;
}

/**
 * The waiting mascot.
 *
 * Deliberately a STILL image with CSS motion, not a frame animation. The six
 * generated source poses (assets/clay-masters/loader/) differ from each other
 * by 13-20% RMSE — they are independent renders, not a motion cycle — so
 * stepping them popped at any frame rate, and cross-fading between them ghosted
 * because the body shifts as well as the orb. Both were tried and rejected.
 *
 * A single rest pose floating in CSS reads as calm and runs at 60fps for zero
 * bytes, matching the today hero (little-oracle-master-v1 + animate-float-1)
 * and DESIGN.md's "motion is ambient — never busy". 22KB, down from 431KB.
 *
 * Reduced motion is handled by motion-reduce:animate-none — the image itself is
 * already static, so nothing needs to swap.
 */
export function ClayOracleLoader({
  className = 'h-auto w-56 sm:w-64',
  alt = '',
}: ClayOracleLoaderProps) {
  return (
    <div className="animate-drift motion-reduce:animate-none">
      <Image
        src="/assets/clay/little-oracle-loader-still-v1.webp"
        alt={alt}
        width={512}
        height={512}
        sizes="(min-width: 640px) 256px, 224px"
        priority
        className={className}
      />
    </div>
  );
}
