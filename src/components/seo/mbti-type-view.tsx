import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { BASE_URL, LAST_VERIFIED, LAST_VERIFIED_TH } from '@/lib/knowledge-base';
import {
  MBTI_TYPES,
  MBTI_TYPE_CAUTION,
  mbtiTypeUrl,
  type MbtiType,
} from '@/lib/mbti-types';

/**
 * One renderer for all 16 type pages. Adding or editing a type never touches
 * this file — see src/lib/mbti-types.ts.
 *
 * Structured data references the site-wide Organization by @id rather than
 * restating it, same as the topic hubs, so all seventeen MBTI pages resolve to
 * one entity instead of seventeen slightly different ones.
 */
function TypeSchema({ type }: { type: MbtiType }) {
  const url = mbtiTypeUrl(type.slug);

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${url}#article`,
    headline: type.h1,
    description: type.description,
    inLanguage: 'th',
    mainEntityOfPage: url,
    about: { '@id': `${url}#term` },
    keywords: [`${type.code} นิสัย`, `${type.code} คือ`, `${type.code} ดวง`, 'MBTI'].join(', '),
    isPartOf: { '@id': `${BASE_URL}/mbti#article` },
    author: { '@id': `${BASE_URL}/#organization` },
    publisher: { '@id': `${BASE_URL}/#organization` },
    datePublished: LAST_VERIFIED,
    dateModified: LAST_VERIFIED,
  };

  // Each type is a concept this page defines, gathered into the same set the
  // topic hubs point at, so the sixteen read as one vocabulary.
  const termSchema = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    '@id': `${url}#term`,
    name: type.code,
    alternateName: [`MBTI ${type.code}`, `${type.code} นิสัย`],
    description: type.lead,
    inDefinedTermSet: `${BASE_URL}/ai#systems`,
    url,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'หน้าหลัก', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'MBTI', item: `${BASE_URL}/mbti` },
      { '@type': 'ListItem', position: 3, name: type.code, item: url },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${url}#faq`,
    mainEntity: type.faq.map((item) => ({
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

function Section({
  id,
  heading,
  children,
}: {
  id: string;
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12" aria-labelledby={id}>
      <h2 id={id} className="mb-4 text-xl font-heading text-ink md:text-2xl">
        {heading}
      </h2>
      {children}
    </section>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 font-oracle leading-[1.9] text-ink/85">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span className="mt-[0.7em] size-1.5 shrink-0 rounded-full bg-accentBright" aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function MbtiTypeView({ type }: { type: MbtiType }) {
  // Neighbours in the 16, so every type page has outgoing links to siblings
  // and no page in the set is more than a click or two from any other.
  const index = MBTI_TYPES.findIndex((t) => t.slug === type.slug);
  const siblings = [
    MBTI_TYPES[(index + 1) % MBTI_TYPES.length],
    MBTI_TYPES[(index + 2) % MBTI_TYPES.length],
    MBTI_TYPES[(index + 3) % MBTI_TYPES.length],
  ];

  return (
    <div className="min-h-screen bg-ground">
      <TypeSchema type={type} />

      <main className="mx-auto max-w-4xl px-6 py-12 md:py-20">
        <nav aria-label="เส้นทางหน้านี้" className="mb-10 font-oracle text-sm text-inkMuted">
          <Link href="/" className="hover:text-ink">หน้าหลัก</Link>
          <span className="mx-2" aria-hidden="true">/</span>
          <Link href="/mbti" className="hover:text-ink">MBTI</Link>
          <span className="mx-2" aria-hidden="true">/</span>
          <span className="text-ink">{type.code}</span>
        </nav>

        <header className="mb-12">
          <p className="mb-3 font-oracle text-sm text-accentBright">{type.tagline}</p>
          <h1 className="mb-6 text-4xl font-heading leading-tight text-ink md:text-6xl">
            {type.h1}
          </h1>
          {/* The lead is the passage an answer engine lifts for "<CODE> คือ".
              It has to make sense with nothing around it. */}
          <p className="max-w-3xl font-oracle text-lg leading-relaxed text-inkMuted md:text-xl">
            {type.lead}
          </p>
        </header>

        <Section id="letters" heading={`${type.code} มาจากตัวอักษรอะไรบ้าง`}>
          <div className="overflow-x-auto rounded-xl border border-edge">
            <table className="w-full min-w-[28rem] border-collapse text-left text-sm md:text-base">
              <caption className="sr-only">ความหมายของตัวอักษรทั้งสี่ใน {type.code}</caption>
              <thead>
                <tr className="bg-surface2/40">
                  <th scope="col" className="whitespace-nowrap px-4 py-3 font-heading font-medium text-ink">ตัวอักษร</th>
                  <th scope="col" className="whitespace-nowrap px-4 py-3 font-heading font-medium text-ink">ชื่อเต็ม</th>
                  <th scope="col" className="px-4 py-3 font-heading font-medium text-ink">หมายถึง</th>
                </tr>
              </thead>
              <tbody>
                {type.letters.map((letter) => (
                  <tr key={letter.letter} className="border-t border-edge/70 align-top">
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-ink">{letter.letter}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink/80">{letter.label}</td>
                    <td className="px-4 py-3 text-ink/80">{letter.meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section id="traits" heading={`${type.code} นิสัยเป็นแบบไหน`}>
          <Bullets items={type.traits} />
        </Section>

        <Section id="strengths" heading={`จุดแข็งของ ${type.code}`}>
          <Bullets items={type.strengths} />
        </Section>

        <Section id="watch-outs" heading={`จุดที่ ${type.code} ควรระวัง`}>
          <Bullets items={type.watchOuts} />
        </Section>

        <Section id="work" heading={`${type.code} กับการทำงาน`}>
          <p className="font-oracle leading-[1.9] text-ink/85">{type.atWork}</p>
        </Section>

        <Section id="love" heading={`${type.code} กับความรัก`}>
          <p className="font-oracle leading-[1.9] text-ink/85">{type.inLove}</p>
        </Section>

        <Section id="communication" heading={`วิธีคุยกับ ${type.code}`}>
          <p className="font-oracle leading-[1.9] text-ink/85">{type.communication}</p>
        </Section>

        <Section id="fortune" heading={`${type.code} กับการดูดวง สายมูใช้ยังไง`}>
          <p className="font-oracle leading-[1.9] text-ink/85">{type.withFortune}</p>
        </Section>

        <Section id="faq" heading={`คำถามที่พบบ่อยเรื่อง ${type.code}`}>
          <div className="space-y-6 font-oracle leading-[1.9] text-ink/85">
            {type.faq.map((item) => (
              <div key={item.question} className="glass-card p-5 md:p-6">
                <h3 className="mb-2 font-heading text-lg text-ink">{item.question}</h3>
                <p>{item.answer}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* The limitation renders on every one of the sixteen pages, from one
            constant. A type page without it reads as a horoscope for your
            personality, which is exactly what MBTI is not. */}
        <section className="mt-12 rounded-xl border border-edge bg-surface2/20 p-5 md:p-6" aria-labelledby="caution">
          <h2 id="caution" className="mb-3 font-heading text-lg text-ink">
            อ่านผล {type.code} อย่างไรไม่ให้ตีกรอบตัวเอง
          </h2>
          <p className="font-oracle text-sm leading-[1.9] text-inkMuted md:text-base">
            {MBTI_TYPE_CAUTION}
          </p>
        </section>

        <section className="mt-12" aria-labelledby="siblings">
          <h2 id="siblings" className="mb-4 text-xl font-heading text-ink md:text-2xl">
            อ่าน MBTI แบบอื่นต่อ
          </h2>
          <div className="flex flex-wrap gap-3">
            {siblings.map((sibling) => (
              <Link
                key={sibling.slug}
                href={`/mbti/${sibling.slug}`}
                className="inline-flex min-h-11 items-center rounded-full border border-edge px-4 py-2 font-oracle text-sm text-accentBright hover:bg-edgeSoft"
              >
                {sibling.code}
              </Link>
            ))}
            <Link
              href="/mbti"
              className="inline-flex min-h-11 items-center rounded-full border border-edge px-4 py-2 font-oracle text-sm text-accentBright hover:bg-edgeSoft"
            >
              ดูครบทั้ง 16 แบบ
            </Link>
          </div>
        </section>

        <section className="mt-12 rounded-xl border border-accentBright/20 bg-gradient-to-r from-accent/10 to-accentBright/10 p-6" aria-labelledby="cta">
          <h2 id="cta" className="mb-2 font-heading text-lg text-ink">
            อยากอ่านดวงที่เข้ากับวิธีคิดแบบ {type.code}
          </h2>
          <p className="mb-4 font-oracle text-sm leading-[1.9] text-inkMuted">
            คำอ่านหลักบนสายมูใช้แค่วันเกิด ถ้าใส่ MBTI เพิ่ม คำแนะนำจะถูกเรียบเรียงให้ตรงกับวิธีตัดสินใจของคุณมากขึ้น ไม่ใส่ก็อ่านได้ครบ
          </p>
          <Link
            href="/fortune"
            className="inline-flex min-h-11 items-center rounded-lg bg-accent px-5 py-3 font-heading text-accentInk transition-colors hover:bg-accentBright"
          >
            ดูดวงกับสายมูฟรี
            <ArrowRight className="ml-2 size-4" aria-hidden="true" />
          </Link>
        </section>

        <p className="mt-10 font-oracle text-xs text-inkMuted/70">
          ตรวจสอบข้อมูลล่าสุด {LAST_VERIFIED_TH}
        </p>
      </main>
    </div>
  );
}
