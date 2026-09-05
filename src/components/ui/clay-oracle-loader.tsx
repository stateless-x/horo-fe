'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useReducedMotion } from 'framer-motion';

interface ClayOracleLoaderProps {
  className?: string;
  alt?: string;
}

export function ClayOracleLoader({
  className = 'h-auto w-56 sm:w-64',
  alt = '',
}: ClayOracleLoaderProps) {
  const shouldReduceMotion = useReducedMotion();
  // useReducedMotion() is null on the server but resolved on the client's first
  // render, so choosing src from it directly causes a hydration mismatch.
  // Render the static poster on both, then swap to the animation after mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isAnimating = mounted && shouldReduceMotion === false;
  const src = isAnimating
    ? '/assets/clay/little-oracle-loader-v3.webp'
    : '/assets/clay/little-oracle-loader-poster-v1.webp';

  return (
    // The frames carry the orb conjuring; this wrapper carries the hover.
    // Compositing the float in CSS runs it at 60fps for zero bytes, instead of
    // paying for more frames to make a 14fps drift look continuous.
    <div className={isAnimating ? 'animate-drift motion-reduce:animate-none' : undefined}>
      <Image
        src={src}
        alt={alt}
        width={512}
        height={512}
        sizes="(min-width: 640px) 256px, 224px"
        priority
        // Load-bearing, not an oversight: Next's optimizer re-encodes, which
        // flattens the animated WebP to a single frame. Do not remove.
        unoptimized
        className={className}
      />
    </div>
  );
}
