import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import { BASE_URL, LAST_VERIFIED, LAST_VERIFIED_TH } from '@/lib/knowledge-base';
import { getTopicPage, topicUrl, type TopicPage, type TopicTable } from '@/lib/topic-pages';
import { EnglishBrief } from '@/components/seo/english-brief';

/**
 * One renderer for every topic hub. Adding a topic never touches this file —
 * see src/lib/topic-pages.ts.
 *
 * Structured data note: the graph below references the site-wide Organization
 * by @id (`${BASE_URL}/#organization`) instead of restating it. Repeating a
 * slightly different Organization on every page is how a site ends up with
 * several competing entities in an engine's knowledge graph rather than one
 * strong one. The canonical definition lives in components/seo/seo-sections.tsx.
 */

function TopicSchema({ topic }: { topic: TopicPage }) {
  const url = topicUrl(topic.slug);

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${url}#article`,
    headline: topic.h1,
    description: topic.description,
    inLanguage: 'th',
    mainEntityOfPage: url,
    about: { '@id': `${url}#term` },
    keywords: [topic.primaryKeyword, ...topic.secondaryKeywords].join(', '),
    author: { '@id': `${BASE_URL}/#organization` },
    publisher: { '@id': `${BASE_URL}/#organization` },
    datePublished: LAST_VERIFIED,
    dateModified: LAST_VERIFIED,
  };

  // DefinedTerm is what lets an engine treat "ปาจื้อ" as a concept this page
  // authoritatively defines, rather than as a keyword the page happens to use.
  const termSchema = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    '@id': `${url}#term`,
    name: topic.primaryKeyword,
    alternateName: topic.secondaryKeywords,
    description: topic.definition,
    inDefinedTermSet: `${BASE_URL}/ai#systems`,
    url,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'หน้าหลัก', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: topic.h1, item: url },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${url}#faq`,
    mainEntity: topic.faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };

  return (
    <>
      {[articleSchema, termSchema, breadcrumbSchema, faqSchema].map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}

/** Tables scroll inside their own box; the page body never scrolls sideways. */
function DataTable({ table }: { table: TopicTable }) {
  return (
    <figure className="mt-6">
      <div className="overflow-x-auto rounded-xl border border-edge">
        <table className="w-full min-w-[32rem] border-collapse text-left text-sm md:text-base">
          <caption className="sr-only">{table.caption}</caption>
          <thead>
            <tr className="bg-surface2/40">
              {table.columns.map((column) => (
                <th key={column} scope="col" className="px-4 py-3 font-heading font-medium text-ink whitespace-nowrap">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row) => (
              <tr key={row.join('|')} className="border-t border-edge/70 align-top">
                {row.map((cell, index) => (
                  <td
                    key={`${row[0]}-${index}`}
                    className={index === 0 ? 'px-4 py-3 font-medium text-ink whitespace-nowrap' : 'px-4 py-3 text-ink/80'}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <figcaption className="mt-2 text-xs font-oracle text-inkMuted">{table.caption}</figcaption>
    </figure>
  );
}

export function TopicPageView({ topic }: { topic: TopicPage }) {
  const related = topic.relatedSlugs
    .map((slug) => getTopicPage(slug))
    .filter((item): item is TopicPage => Boolean(item));

  return (
    <div className="min-h-screen bg-ground">
      <TopicSchema topic={topic} />

      <main className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <nav aria-label="เส้นทางหน้านี้" className="mb-10 text-sm font-oracle text-inkMuted">
          <Link href="/" className="hover:text-ink">หน้าหลัก</Link>
          <span className="mx-2" aria-hidden="true">/</span>
          <span className="text-ink">{topic.eyebrow}</span>
        </nav>

        <header className="mb-12">
          <h1 className="text-4xl md:text-6xl leading-tight font-heading text-ink mb-6">{topic.h1}</h1>
          {/* The lead is the passage an answer engine lifts. It has to make
              sense with nothing around it. */}
          <p className="max-w-3xl text-lg md:text-xl leading-relaxed font-oracle text-inkMuted">{topic.lead}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-oracle text-inkMuted/75">
            <span>เรียบเรียงโดย สายมู</span>
            <span>ตรวจสอบล่าสุด {LAST_VERIFIED_TH}</span>
          </div>
        </header>

        <div className="space-y-14 text-ink/85 font-oracle text-base md:text-lg leading-[1.9]">
          {topic.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-2xl md:text-3xl font-heading text-ink mb-5">{section.heading}</h2>
              <p className="font-medium text-ink">{section.answer}</p>
              {section.body ? (
                <div className="mt-4 space-y-4">
                  {section.body.map((paragraph) => (
                    <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                  ))}
                </div>
              ) : null}
              {section.bullets ? (
                <ul className="mt-5 space-y-3 pl-6 list-disc marker:text-accentBright">
                  {section.bullets.map((bullet) => (
                    <li key={bullet.slice(0, 40)}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
              {section.table ? <DataTable table={section.table} /> : null}
            </section>
          ))}
        </div>

        <section className="mt-16 rounded-2xl border border-accentBright/30 bg-accent/10 p-6 md:p-8">
          <h2 className="font-heading text-xl md:text-2xl text-ink mb-2">{topic.cta.label}</h2>
          <p className="font-oracle text-inkMuted mb-5">{topic.cta.note}</p>
          <Link
            href={topic.cta.href}
            className="inline-flex items-center gap-2 px-5 py-3 bg-accent hover:bg-accentBright text-accentInk font-heading text-sm font-medium rounded-lg transition-colors shadow-md shadow-accent/20 dark:shadow-accent/30"
          >
            {topic.cta.label}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>

        <section className="mt-16 pt-10 border-t border-edge" aria-labelledby="topic-faq">
          <h2 id="topic-faq" className="text-2xl md:text-3xl font-heading text-ink mb-6">คำถามที่พบบ่อย</h2>
          <div className="space-y-6 font-oracle text-ink/85 leading-[1.9]">
            {topic.faq.map((item) => (
              <div key={item.question} className="glass-card p-5 md:p-6">
                <h3 className="font-heading text-lg text-ink mb-2">{item.question}</h3>
                <p>{item.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {topic.learnHref ? (
          <section className="mt-16 pt-10 border-t border-edge" aria-labelledby="topic-learn">
            <h2 id="topic-learn" className="text-xl md:text-2xl font-heading text-ink mb-4">อยากอ่านพื้นฐานแบบไม่มีตาราง</h2>
            <Link
              href={topic.learnHref}
              className="inline-flex items-center gap-2 font-oracle text-accentBright hover:text-accentSoft"
            >
              <BookOpen className="w-4 h-4" />
              {topic.learnLabel ?? 'อ่านบทความในคลังความรู้'}
            </Link>
          </section>
        ) : null}

        {topic.sources.length > 0 ? (
          <section className="mt-12" aria-labelledby="topic-sources">
            <h2 id="topic-sources" className="text-xl md:text-2xl font-heading text-ink mb-4">แหล่งข้อมูลอ้างอิง</h2>
            <ul className="space-y-2 font-oracle text-sm md:text-base text-inkMuted">
              {topic.sources.map((source) => (
                <li key={source.href}>
                  <a
                    href={source.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accentBright underline decoration-accentBright/40 underline-offset-4 hover:text-accentSoft"
                  >
                    {source.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {related.length > 0 ? (
          <section className="mt-12" aria-labelledby="topic-related">
            <h2 id="topic-related" className="text-xl md:text-2xl font-heading text-ink mb-4">อ่านศาสตร์อื่นต่อ</h2>
            <ul className="space-y-2 font-oracle text-sm md:text-base">
              {related.map((item) => (
                <li key={item.slug}>
                  <Link href={`/${item.slug}`} className="text-accentBright underline decoration-accentBright/40 underline-offset-4 hover:text-accentSoft">
                    {item.h1}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/ai" className="text-accentBright underline decoration-accentBright/40 underline-offset-4 hover:text-accentSoft">
                  ข้อมูลอ้างอิงของสายมูฉบับเครื่องอ่านได้
                </Link>
              </li>
            </ul>
          </section>
        ) : null}

        <EnglishBrief
          title={topic.englishBrief.title}
          paragraphs={topic.englishBrief.paragraphs}
          facts={topic.englishBrief.facts}
        />
      </main>
    </div>
  );
}
