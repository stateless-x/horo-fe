import type { MetadataRoute } from 'next';
import { CALENDAR_MIN_YEAR, CALENDAR_MAX_YEAR } from '@/lib/calendar-range';
import { TOPIC_PAGES } from '@/lib/topic-pages';
import { MBTI_TYPES } from '@/lib/mbti-types';

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

  // /learn is an index of the topic hubs and has no children of its own.
  const learnUrls: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/learn`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
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
    // The canonical page for each concept, and the highest-priority pages
    // on the site after the homepage.
    priority: 0.9,
  }));

  // The 16 MBTI type pages. Generated from the registry, so the set stays
  // complete without anyone maintaining a list here.
  const mbtiTypeUrls: MetadataRoute.Sitemap = MBTI_TYPES.map((type) => ({
    url: `${BASE_URL}/mbti/${type.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    // Below the hubs: each answers one narrow query rather than a head term.
    priority: 0.7,
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
      // Business-inquiry page: ad sales and contract work. Low crawl
      // priority, but it is the page a brand searching for us should find.
      url: `${BASE_URL}/contact`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.4,
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
    ...mbtiTypeUrls,
    ...learnUrls,
    ...calendarMonthUrls,
  ];
}
