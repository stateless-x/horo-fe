import Image from 'next/image';

const ELEMENT_ASSETS = {
  wood: '/assets/clay/elements/wood.webp',
  fire: '/assets/clay/elements/fire.webp',
  earth: '/assets/clay/elements/earth.webp',
  metal: '/assets/clay/elements/metal.webp',
  water: '/assets/clay/elements/water.webp',
} as const;

export type ClayElement = keyof typeof ELEMENT_ASSETS;

interface ElementClayImageProps {
  element: ClayElement;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

export function ElementClayImage({
  element,
  alt,
  className = '',
  priority = false,
  sizes = '(min-width: 768px) 160px, 112px',
}: ElementClayImageProps) {
  return (
    <Image
      src={ELEMENT_ASSETS[element]}
      alt={alt}
      width={1024}
      height={1024}
      sizes={sizes}
      priority={priority}
      className={`object-contain ${className}`}
    />
  );
}
