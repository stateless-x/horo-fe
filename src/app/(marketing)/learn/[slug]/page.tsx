import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LearnArticlePage } from '@/components/learn/learn-content';
import { getLearnArticle, LEARN_ARTICLES } from '@/lib/learn-articles';

type LearnArticleRouteProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return LEARN_ARTICLES.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: LearnArticleRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getLearnArticle(slug);

  if (!article) return {};

  return {
    title: article.title,
    description: article.description,
    authors: [{ name: 'สายมู' }],
    alternates: { canonical: `/learn/${article.slug}` },
    openGraph: {
      title: `${article.title} | สายมู`,
      description: article.description,
      url: `/learn/${article.slug}`,
      type: 'article',
      publishedTime: '2026-09-08',
      modifiedTime: '2026-09-08',
      authors: ['สายมู'],
      images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: article.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${article.title} | สายมู`,
      description: article.description,
      images: ['/og-image.jpg'],
    },
  };
}

export default async function LearnArticleRoute({ params }: LearnArticleRouteProps) {
  const { slug } = await params;
  const article = getLearnArticle(slug);

  if (!article) notFound();

  return <LearnArticlePage article={article} />;
}
