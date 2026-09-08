import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { ArticleParagraph, LearnArticle } from '@/lib/learn-articles';

const BASE_URL = 'https://xn--y3cbx6azb.com';

function Paragraph({ segments }: { segments: ArticleParagraph }) {
  return (
    <p>
      {segments.map((segment, index) =>
        segment.href ? (
          <a
            key={`${segment.text}-${index}`}
            href={segment.href}
            target={segment.href.startsWith('/') ? undefined : '_blank'}
            rel={segment.href.startsWith('/') ? undefined : 'noopener noreferrer'}
            className="text-accentBright underline decoration-accentBright/40 underline-offset-4 hover:text-accentSoft"
          >
            {segment.text}
          </a>
        ) : (
          <span key={`${segment.text}-${index}`}>{segment.text}</span>
        ),
      )}
    </p>
  );
}

function ArticleSchema({ article }: { article: LearnArticle }) {
  const url = `${BASE_URL}/learn/${article.slug}`;
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${url}#article`,
    headline: article.title,
    description: article.description,
    inLanguage: 'th',
    mainEntityOfPage: url,
    author: { '@type': 'Organization', name: 'สายมู' },
    publisher: { '@type': 'Organization', name: 'สายมู' },
    datePublished: '2026-09-08',
    dateModified: '2026-09-08',
  };
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'หน้าหลัก', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'คลังความรู้', item: `${BASE_URL}/learn` },
      { '@type': 'ListItem', position: 3, name: article.title, item: url },
    ],
  };
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: article.faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </>
  );
}

export function LearnArticlePage({ article }: { article: LearnArticle }) {
  return (
    <div className="min-h-screen bg-ground">
      <main className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <nav aria-label="เส้นทางหน้านี้" className="mb-10 text-sm font-oracle text-inkMuted">
          <Link href="/" className="hover:text-ink">หน้าหลัก</Link>
          <span className="mx-2" aria-hidden="true">/</span>
          <Link href="/learn" className="hover:text-ink">คลังความรู้</Link>
          <span className="mx-2" aria-hidden="true">/</span>
          <span className="text-ink">{article.eyebrow}</span>
        </nav>

        <header className="mb-12">
          <h1 className="text-4xl md:text-6xl leading-tight font-heading text-ink mb-6">{article.title}</h1>
          <p className="max-w-3xl text-lg md:text-xl leading-relaxed font-oracle text-inkMuted">{article.summary}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-oracle text-inkMuted/75">
            <span>เขียนโดย สายมู</span>
            <span>อัปเดต 8 กันยายน 2569</span>
          </div>
        </header>

        <div className="space-y-12 text-ink/85 font-oracle text-base md:text-lg leading-[1.9]">
          {article.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-2xl md:text-3xl font-heading text-ink mb-5">{section.heading}</h2>
              <div className="space-y-4">
                {section.paragraphs.map((segments, index) => (
                  <Paragraph key={`${section.heading}-paragraph-${index}`} segments={segments} />
                ))}
              </div>
              {section.bullets ? (
                <ul className="mt-5 space-y-3 pl-6 list-disc marker:text-accentBright">
                  {section.bullets.map((segments, index) => (
                    <li key={`${section.heading}-bullet-${index}`}>
                      <Paragraph segments={segments} />
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>

        <section className="mt-16 pt-10 border-t border-edge" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="text-2xl md:text-3xl font-heading text-ink mb-6">คำถามที่พบบ่อย</h2>
          <div className="space-y-6 font-oracle text-ink/85 leading-[1.9]">
            {article.faq.map((item) => (
              <div key={item.question} className="glass-card p-5 md:p-6">
                <h3 className="font-heading text-lg text-ink mb-2">{item.question}</h3>
                <p>{item.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 pt-10 border-t border-edge" aria-labelledby="sources-heading">
          <h2 id="sources-heading" className="text-xl md:text-2xl font-heading text-ink mb-4">แหล่งข้อมูลที่อ่านต่อ</h2>
          <ul className="space-y-2 font-oracle text-sm md:text-base text-inkMuted">
            {article.sources.map((source) => (
              <li key={source.href}>
                <a href={source.href} target="_blank" rel="noopener noreferrer" className="text-accentBright underline decoration-accentBright/40 underline-offset-4 hover:text-accentSoft">
                  {source.label}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-16 pt-10 border-t border-edge" aria-labelledby="related-heading">
          <h2 id="related-heading" className="text-xl md:text-2xl font-heading text-ink mb-4">อ่านเรื่องใกล้กัน</h2>
          <div className="flex flex-wrap gap-3">
            {article.relatedSlugs.map((slug) => (
              <Link key={slug} href={`/learn/${slug}`} className="min-h-11 inline-flex items-center rounded-full border border-edge px-4 py-2 text-sm font-oracle text-accentBright hover:bg-edgeSoft">
                {slug === 'bazi' ? 'พื้นฐานปาจื้อ' : slug === 'thai-astrology' ? 'โหราศาสตร์ไทย' : slug === 'mbti' ? 'MBTI' : 'มูเตลู'}
              </Link>
            ))}
          </div>
        </section>
        <div className="mt-12 border-t border-edge pt-8">
          <p className="font-oracle leading-relaxed text-inkMuted">รู้จักที่มาแล้ว ถ้าอยากลองอ่านดวงของตัวเอง เริ่มจากวันเกิดได้เลย</p>
          <Link href="/fortune" className="mt-4 inline-flex min-h-11 items-center gap-2 font-heading text-accentBright underline underline-offset-4">
            ลองดูดวงของคุณฟรี <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </main>
      <ArticleSchema article={article} />
    </div>
  );
}

export function LearnIndexPage({ articles }: { articles: LearnArticle[] }) {
  return (
    <div className="min-h-screen bg-ground">
      <main className="max-w-6xl mx-auto px-6 py-12 md:py-20">
        <header className="max-w-3xl mb-12">
          <h1 className="text-4xl md:text-6xl leading-tight font-heading text-ink mb-5">คลังความรู้เรื่องดวงและการรู้จักตัวเอง</h1>
          <p className="text-lg leading-relaxed font-oracle text-inkMuted">บทความอ่านง่ายสำหรับทำความเข้าใจปาจื้อ โหราศาสตร์ไทย MBTI และมูเตลู ใช้เป็นมุมมองประกอบชีวิต แล้วเลือกทางที่เหมาะกับคุณ</p>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          {articles.map((article) => (
            <article key={article.slug} className="glass-card p-6 md:p-8 flex flex-col">
              <h2 className="text-2xl font-heading text-ink mb-4">{article.title}</h2>
              <p className="font-oracle leading-relaxed text-inkMuted mb-7">{article.description}</p>
              <Link href={`/learn/${article.slug}`} className="mt-auto min-h-11 inline-flex w-fit items-center rounded-lg bg-accent px-5 py-3 font-heading text-accentInk hover:bg-accentBright transition-colors">
                {article.slug === 'bazi' ? 'อ่านพื้นฐานปาจื้อ' : article.slug === 'thai-astrology' ? 'อ่านโหราศาสตร์ไทย' : article.slug === 'mbti' ? 'อ่านเรื่อง MBTI' : 'อ่านที่มามูเตลู'}
                <ArrowRight className="ml-2 size-4" aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
