import Image from 'next/image';
import { FORTUNE_CATEGORY_CONFIG, type FortuneCategoryKey } from '@/lib/fortune-category-config';

interface CategoryClayImageProps {
  category: FortuneCategoryKey;
  alt?: string;
  className?: string;
  sizes?: string;
}

/**
 * Clay category render (480×480 transparent WebP). Decorative by default —
 * these images sit beside their text label, so alt stays empty unless the
 * image is the only carrier of meaning.
 */
export function CategoryClayImage({
  category,
  alt = '',
  className = '',
  sizes = '48px',
}: CategoryClayImageProps) {
  return (
    <Image
      src={FORTUNE_CATEGORY_CONFIG[category].clayAsset}
      alt={alt}
      width={480}
      height={480}
      sizes={sizes}
      className={`object-contain ${className}`}
    />
  );
}
