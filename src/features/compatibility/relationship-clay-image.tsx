import Image from 'next/image';
import { RelationshipTypeSchema, type RelationshipType } from '@/lib-packages/shared';

const RELATIONSHIP_ASSETS: Record<RelationshipType, string> = {
  romantic: '/assets/clay/categories/love.webp',
  talking: '/assets/clay/relationships/talking.webp',
  friend: '/assets/clay/relationships/friend.webp',
  boss: '/assets/clay/categories/career.webp',
  coworker: '/assets/clay/relationships/coworker.webp',
  family: '/assets/clay/categories/family.webp',
};

/** The adjacent relationship label supplies the accessible name. */
export function RelationshipClayImage({
  relationshipType,
  className = 'size-12',
  sizes = '48px',
}: { relationshipType?: string; className?: string; sizes?: string }) {
  const parsed = RelationshipTypeSchema.safeParse(relationshipType);
  const src = parsed.success
    ? RELATIONSHIP_ASSETS[parsed.data]
    : '/assets/clay/little-oracle-mark-v1.webp';
  return <Image src={src} alt="" width={480} height={480} sizes={sizes} className={`shrink-0 object-contain ${className}`} />;
}
