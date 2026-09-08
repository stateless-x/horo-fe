import type { NextConfig } from 'next';

/**
 * /learn/<slug> explainers were folded into the topic hubs on 2026-09-08
 * (see src/lib/topic-pages.ts). The pages were live for about an hour, so
 * these redirects are cheap insurance for anything that crawled them in
 * that window rather than a load-bearing migration.
 */
const LEARN_SLUGS = ['bazi', 'thai-astrology', 'mbti', 'mutelu'] as const;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  async redirects() {
    return LEARN_SLUGS.map((slug) => ({
      source: `/learn/${slug}`,
      destination: `/${slug}`,
      permanent: true,
    }));
  },
};

export default nextConfig;
