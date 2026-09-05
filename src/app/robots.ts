import type { MetadataRoute } from 'next';

const BASE_URL = 'https://xn--y3cbx6azb.com';

/**
 * Private areas. Note /compatibility is deliberately NOT listed: those are
 * per-token share links, and their layout sets robots noindex. Disallowing
 * them here would stop crawlers fetching the page at all, which means they
 * would never read the noindex — a shared link could then still surface as a
 * bare URL in results. Letting them be crawled so the noindex is actually
 * seen is the stronger guarantee for a URL people paste around.
 */
const PRIVATE_PATHS = ['/dashboard', '/invite', '/api'];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Search engines and AI/answer engines alike. We *want* LLM crawlers
      // (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, CCBot…) reading
      // the public pages — being quoted in an AI answer with สายมู.com
      // attached is distribution, not leakage. They are covered by this
      // wildcard rule; no AI crawler is blocked anywhere in this file.
      {
        userAgent: '*',
        allow: '/',
        disallow: PRIVATE_PATHS,
      },
    ],
    host: BASE_URL,
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
