import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { BASE_URL } from '@/lib/knowledge-base';
import { TOPIC_PAGES, topicUrl } from '@/lib/topic-pages';

/**
 * /learn is an index and nothing more.
 *
 * It used to host a /learn/<slug> explainer per topic. Those were removed on
 * 2026-09-08 because each one competed with its own topic hub for the same
 * query while carrying less material. This page now lists the hubs and owns
 * no topic content of its own, so it cannot cannibalise them: it answers a
 * browse intent ("what does this site cover"), not a topic intent.
 *
 * Keep it that way. Anything worth writing about a topic belongs in that
 * topic's entry in src/lib/topic-pages.ts.
 */
export function LearnIndexPage() {
  const hubs = TOPIC_PAGES.filter((topic) => topic.status === 'live');

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${BASE_URL}/learn#collection`,
    name: 'คลังความรู้เรื่องดวงและการรู้จักตัวเอง',
    inLanguage: 'th',
    publisher: { '@id': `${BASE_URL}/#organization` },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: hubs.map((topic, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: topic.h1,
        url: topicUrl(topic.slug),
      })),
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'หน้าหลัก', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'คลังความรู้', item: `${BASE_URL}/learn` },
    ],
  };

  return (
    <div className="min-h-screen bg-ground">
      <main className="max-w-6xl mx-auto px-6 py-12 md:py-20">
        <header className="max-w-3xl mb-12">
          <h1 className="text-4xl md:text-6xl leading-tight font-heading text-ink mb-5">
            คลังความรู้เรื่องดวงและการรู้จักตัวเอง
          </h1>
          <p className="text-lg leading-relaxed font-oracle text-inkMuted">
            คู่มือภาษาไทยของแต่ละศาสตร์ที่สายมูใช้ อ่านได้ตั้งแต่คำอธิบายพื้นฐานไปจนถึงตารางที่ต้องเปิดหาบ่อย
            ทุกหน้ารวมข้อจำกัดของศาสตร์นั้นไว้ด้วย เพื่อให้ใช้เป็นมุมมองประกอบชีวิตโดยไม่ยึดคำทำนายจนเกินไป
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          {hubs.map((topic) => (
            <article key={topic.slug} className="glass-card p-6 md:p-8 flex flex-col">
              <p className="font-oracle text-sm text-inkMuted mb-2">{topic.eyebrow}</p>
              <h2 className="text-2xl font-heading text-ink mb-4">{topic.h1}</h2>
              <p className="font-oracle leading-relaxed text-inkMuted mb-7">{topic.description}</p>
              <Link
                href={`/${topic.slug}`}
                className="mt-auto min-h-11 inline-flex w-fit items-center rounded-lg bg-accent px-5 py-3 font-heading text-accentInk hover:bg-accentBright transition-colors"
              >
                อ่านคู่มือ{topic.navLabel}
                <ArrowRight className="ml-2 size-4" aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </main>

      {[itemListSchema, breadcrumbSchema].map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </div>
  );
}
