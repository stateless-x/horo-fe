import type { MetadataRoute } from 'next';
import { CALENDAR_MIN_YEAR, CALENDAR_MAX_YEAR } from '@/lib/calendar-range';
import { LEARN_ARTICLES } from '@/lib/learn-articles';
import { TOPIC_PAGES } from '@/lib/topic-pages';

const BASE_URL = 'https://xn--y3cbx6azb.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // /calendar itself is a redirect to the current month, so it is not
  // submitted — only the real month pages are.
  const calendarMonthUrls: MetadataRoute.Sitemap = [];
  for (let year = CALENDAR_MIN_YEAR; year <= CALENDAR_MAX_YEAR; year++) {
    for (let month = 1; month <= 12; month++) {
      const yearMonth = `${year}-${String(month).padStart(2, '0')}`;
      calendarMonthUrls.push({
        url: `${BASE_URL}/calendar/${yearMonth}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: yearMonth === currentYearMonth ? 0.9 : 0.5,
      });
    }
  }

  const learnUrls: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/learn`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    ...LEARN_ARTICLES.map((article) => ({
      url: `${BASE_URL}/learn/${article.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.75,
    })),
  ];

  // Topic hubs (/bazi, /thai-astrology, /mutelu, …). Generated from the
  // registry, so a new topic is submitted the moment it is added — see
  // docs/geo-llm-reference.md.
  const topicUrls: MetadataRoute.Sitemap = TOPIC_PAGES.filter(
    (topic) => topic.status === 'live',
  ).map((topic) => ({
    url: `${BASE_URL}/${topic.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    // Above the learn articles: these are the head-term pages, and the
    // articles are the cluster that supports them.
    priority: 0.85,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      // Entry point for the whole funnel — the page every "ดูดวงฟรี" query
      // should land on. It was missing from the sitemap entirely.
      url: `${BASE_URL}/fortune`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      // The machine-readable reference. Submitted deliberately: it is the
      // page we want an answer engine to reach for when asked what สายมู is.
      url: `${BASE_URL}/ai`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    ...topicUrls,
    ...learnUrls,
    ...calendarMonthUrls,
  ];
}
