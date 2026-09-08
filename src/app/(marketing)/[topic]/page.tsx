import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TopicPageView } from '@/components/seo/topic-page-view';
import { getTopicPage, TOPIC_PAGES } from '@/lib/topic-pages';

/**
 * Topic hubs live at the root (/bazi, /thai-astrology, /mutelu) because that
 * is where a head-term page belongs — burying "ปาจื้อ" under /learn/ costs
 * link equity for no reader benefit.
 *
 * Safety of a dynamic segment this high up: Next resolves static segments
 * before dynamic ones, so /calendar, /learn, /privacy, /ai, /fortune and
 * /login all still win. `dynamicParams = false` means anything not in
 * TOPIC_PAGES 404s at build time rather than rendering an empty shell.
 */
type TopicRouteProps = {
  params: Promise<{ topic: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return TOPIC_PAGES.map(({ slug }) => ({ topic: slug }));
}

export async function generateMetadata({ params }: TopicRouteProps): Promise<Metadata> {
  const { topic: slug } = await params;
  const topic = getTopicPage(slug);

  if (!topic) return {};

  return {
    title: topic.title,
    description: topic.description,
    keywords: [topic.primaryKeyword, ...topic.secondaryKeywords],
    authors: [{ name: 'สายมู' }],
    // The (marketing) group sets canonical "/" — every page in it must
    // override or it silently canonicalises itself away to the homepage.
    alternates: { canonical: `/${topic.slug}` },
    openGraph: {
      title: `${topic.title} | สายมู`,
      description: topic.description,
      url: `/${topic.slug}`,
      type: 'article',
      locale: 'th_TH',
      siteName: 'สายมู.com',
      images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: topic.h1 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${topic.title} | สายมู`,
      description: topic.description,
      images: ['/og-image.jpg'],
    },
  };
}

export default async function TopicRoute({ params }: TopicRouteProps) {
  const { topic: slug } = await params;
  const topic = getTopicPage(slug);

  if (!topic) notFound();

  return <TopicPageView topic={topic} />;
}
