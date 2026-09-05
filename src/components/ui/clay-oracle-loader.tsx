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
  const src = mounted && shouldReduceMotion === false
    ? '/assets/clay/little-oracle-loader-v1.webp'
    : '/assets/clay/little-oracle-loader-poster-v1.webp';

  return (
    <Image
      src={src}
      alt={alt}
      width={1024}
      height={1024}
      sizes="(min-width: 640px) 256px, 224px"
      priority
      // Load-bearing, not an oversight: Next's optimizer re-encodes, which
      // flattens the animated WebP to a single frame. Do not remove.
      unoptimized
      className={className}
    />
  );
}
