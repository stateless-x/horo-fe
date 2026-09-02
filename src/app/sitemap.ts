import type { MetadataRoute } from 'next';
import { CALENDAR_MIN_YEAR, CALENDAR_MAX_YEAR } from '@/lib/calendar-range';

const BASE_URL = 'https://xn--y3cbx6azb.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const calendarMonthUrls: MetadataRoute.Sitemap = [];
  for (let year = CALENDAR_MIN_YEAR; year <= CALENDAR_MAX_YEAR; year++) {
    for (let month = 1; month <= 12; month++) {
      const yearMonth = `${year}-${String(month).padStart(2, '0')}`;
      calendarMonthUrls.push({
        url: `${BASE_URL}/calendar?m=${yearMonth}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: yearMonth === currentYearMonth ? 0.9 : 0.5,
      });
    }
  }

  return [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/calendar`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    ...calendarMonthUrls,
  ];
}
