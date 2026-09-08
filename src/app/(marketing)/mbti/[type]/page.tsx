import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MbtiTypeView } from '@/components/seo/mbti-type-view';
import { getMbtiType, MBTI_TYPES } from '@/lib/mbti-types';

/**
 * /mbti/<type> — one page per MBTI type.
 *
 * Route note: this static `mbti` segment sits beside the dynamic `[topic]`
 * segment. Next resolves static before dynamic, but `mbti/` holds only
 * `[type]/`, so `/mbti` itself has no page here and still falls through to
 * `(marketing)/[topic]`, which renders the hub. Adding a `page.tsx` directly
 * in this folder would take `/mbti` away from the hub — don't.
 */
type MbtiTypeRouteProps = {
  params: Promise<{ type: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return MBTI_TYPES.map(({ slug }) => ({ type: slug }));
}

export async function generateMetadata({ params }: MbtiTypeRouteProps): Promise<Metadata> {
  const { type: slug } = await params;
  const type = getMbtiType(slug);

  if (!type) return {};

  return {
    title: type.title,
    description: type.description,
    keywords: [`${type.code} นิสัย`, `${type.code} คือ`, `${type.code} ดวง`, `MBTI ${type.code}`],
    alternates: { canonical: `/mbti/${type.slug}` },
    openGraph: {
      title: `${type.title} | สายมู`,
      description: type.description,
      url: `/mbti/${type.slug}`,
      type: 'article',
      images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: type.h1 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${type.title} | สายมู`,
      description: type.description,
      images: ['/og-image.jpg'],
    },
  };
}

export default async function MbtiTypeRoute({ params }: MbtiTypeRouteProps) {
  const { type: slug } = await params;
  const type = getMbtiType(slug);

  if (!type) notFound();

  return <MbtiTypeView type={type} />;
}
