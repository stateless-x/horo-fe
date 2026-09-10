import type { Metadata } from 'next';
import Link from 'next/link';
import { Compass } from 'lucide-react';
import { TOPIC_PAGES } from '@/lib/topic-pages';

/**
 * 404 page.
 *
 * Deliberately does NOT redirect to the homepage. Next.js serves this with a
 * real HTTP 404, which is what tells Google and the AI crawlers that a URL is
 * gone; answering 200 with homepage content instead is a soft 404, and it
 * would turn every dead or mistyped URL into a duplicate of `/` in the index —
 * directly against the topic-hub work this site's SEO rests on. A 404 also
 * keeps genuine routing bugs visible instead of silently bouncing users home.
 *
 * `robots: { index: false, follow: true }` is required, not redundant. Next.js
 * emits its own `noindex` for a not-found render, but the root layout's
 * `index, follow` still renders alongside it — dropping this left the page
 * with two contradictory robots tags. Setting it here makes the second tag
 * agree with the first, and `follow` keeps the topic links below crawlable.
 *
 * Topic links are generated from TOPIC_PAGES, so a new topic appears here the
 * same way it appears in the footer, the sitemap and llms.txt — no hand-edit.
 */
export const metadata: Metadata = {
  title: 'ไม่พบหน้านี้',
  description: 'ไม่พบหน้าที่ค้นหา กลับไปหน้าแรกหรือเลือกอ่านเรื่องดวงที่สนใจได้',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  const topics = TOPIC_PAGES.filter((topic) => topic.status === 'live');

  return (
    <main className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-lg flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-6 flex size-16 items-center justify-center rounded-full border border-edge bg-surface">
        <Compass className="size-8 text-accentSoft" aria-hidden="true" />
      </div>

      <p className="font-thai text-sm text-inkMuted">404</p>

      <h1 className="mt-2 font-heading text-2xl text-ink">
        ไม่พบหน้าที่หาอยู่
      </h1>

      <p className="mt-3 font-thai text-sm leading-relaxed text-inkMuted">
        หน้านี้อาจถูกย้ายหรือลบไปแล้ว ลองกลับไปหน้าแรก
        หรือเลือกอ่านเรื่องที่สนใจด้านล่างได้เลย
      </p>

      <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/"
          className="min-h-11 rounded-lg bg-accent px-6 py-2.5 font-heading text-sm text-accentInk transition-colors duration-200 hover:bg-accentBright focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright"
        >
          กลับหน้าแรก
        </Link>
        <Link
          href="/fortune"
          className="min-h-11 rounded-lg border border-accent/50 px-6 py-2.5 font-heading text-sm text-inkMuted transition-colors duration-200 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright"
        >
          ดูดวงฟรี
        </Link>
      </div>

      {topics.length > 0 && (
        <nav aria-label="เรื่องที่น่าสนใจ" className="mt-10 w-full border-t border-edge/60 pt-6">
          <h2 className="mb-3 font-heading text-sm font-medium text-ink">
            ศาสตร์ที่สายมูใช้
          </h2>
          <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 font-thai text-sm text-inkMuted">
            {topics.map((topic) => (
              <li key={topic.slug}>
                <Link
                  href={`/${topic.slug}`}
                  className="transition-colors duration-200 hover:text-accentBright"
                >
                  {topic.navLabel}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </main>
  );
}
