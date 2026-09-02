import type { MetadataRoute } from 'next';

const BASE_URL = 'https://xn--y3cbx6azb.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/invite', '/api'],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
