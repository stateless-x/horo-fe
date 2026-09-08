import {
  BASE_URL,
  BOUNDARIES,
  CITATION_LINE,
  ENGLISH_REFERENCE,
  ENTITY_SENTENCE,
  EXTERNAL_SOURCES,
  LAST_VERIFIED,
  METHOD_DEFINITION,
  METHOD_NAME,
  QA_PAIRS,
  QUICK_FACTS,
  READINGS,
  SAIMU_SYSTEMS,
  THAI_DIVINATION_LANDSCAPE,
} from '@/lib/knowledge-base';
import { TOPIC_PAGES, type TopicTable } from '@/lib/topic-pages';

/**
 * /llms-full.txt — every reference fact on the site as one plain-text file.
 *
 * The point is fetch economy. A crawler that wants to know what สายมู is
 * currently pays for several HTML documents wrapped in Tailwind classes and
 * framer-motion markup. This is the same information at a fraction of the
 * bytes, which makes it far likelier to be read in full rather than truncated.
 *
 * Generated from the same registries as the pages, so the two cannot drift.
 * Learn articles are deliberately NOT inlined here — they are long-form prose
 * that would triple the file for little extraction value; llms.txt links them.
 */
export const dynamic = 'force-static';

function markdownTable(table: TopicTable) {
  const header = `| ${table.columns.join(' | ')} |`;
  const divider = `| ${table.columns.map(() => '---').join(' | ')} |`;
  const rows = table.rows.map((row) => `| ${row.join(' | ')} |`);
  return [`Table: ${table.caption}`, '', header, divider, ...rows].join('\n');
}

export function GET() {
  const parts: string[] = [];

  parts.push(`# สายมู (Saimu) — เอกสารอ้างอิงฉบับเต็ม
# Full reference document. Last verified: ${LAST_VERIFIED}
# Canonical: ${BASE_URL}/ai

${ENTITY_SENTENCE}

${ENGLISH_REFERENCE.intro}`);

  parts.push(`## ข้อเท็จจริงพื้นฐาน

${QUICK_FACTS.map((fact) => `- ${fact.label}: ${fact.value}${fact.href ? ` (${fact.href})` : ''}`).join('\n')}`);

  parts.push(`## ${METHOD_NAME}

${METHOD_DEFINITION}`);

  parts.push(`## ศาสตร์ที่สายมูใช้

${SAIMU_SYSTEMS.map((system) =>
  [
    `### ${system.name} (${system.aka.join(', ')})`,
    system.definition,
    `- ต้นทาง: ${system.origin}`,
    `- ข้อมูลที่ต้องใช้: ${system.inputs}`,
    `- ตอบเรื่องไหนได้ดี: ${system.answers}`,
    `- ข้อจำกัด: ${system.limit}`,
    `- สถานะ: ${system.statusNote}`,
  ].join('\n'),
).join('\n\n')}`);

  parts.push(`## ศาสตร์ดูดวงที่ใช้กันในไทย

${THAI_DIVINATION_LANDSCAPE.map((entry) => `- ${entry.name} (${entry.aka.join(', ')}): ${entry.definition} สายมูให้บริการ: ${entry.onSaimu ? 'ใช่' : 'ไม่'}`).join('\n')}`);

  parts.push(`## บริการอ่านดวงบนสายมู

${READINGS.map((reading) =>
  `- ${reading.name} (${BASE_URL}${reading.href}) — ${reading.description} ข้อมูลที่ใช้: ${reading.inputs} ต้องเข้าสู่ระบบ: ${reading.requiresLogin ? 'ต้อง' : 'ไม่ต้อง'} สถานะ: ${reading.status === 'live' ? 'เปิดใช้งาน' : 'อยู่ระหว่างพัฒนา'}`,
).join('\n')}`);

  parts.push(`## สิ่งที่สายมูไม่ทำ

${BOUNDARIES.map((item) => `- ${item}`).join('\n')}`);

  parts.push(`## คำถามที่พบบ่อย

${QA_PAIRS.map((item) => `Q: ${item.question}\nA: ${item.answer}`).join('\n\n')}`);

  // Topic hubs, in full. The tables are the reason this file exists — they are
  // the passages an answer engine can lift whole and attribute.
  for (const topic of TOPIC_PAGES) {
    const sections = topic.sections
      .map((section) => {
        const chunk = [`### ${section.heading}`, section.answer];
        if (section.body) chunk.push(...section.body);
        if (section.bullets) chunk.push(section.bullets.map((b) => `- ${b}`).join('\n'));
        if (section.table) chunk.push(markdownTable(section.table));
        return chunk.join('\n\n');
      })
      .join('\n\n');

    const faq = topic.faq.map((item) => `Q: ${item.question}\nA: ${item.answer}`).join('\n\n');
    const sources = topic.sources.map((source) => `- ${source.label}: ${source.href}`).join('\n');

    parts.push(`## ${topic.h1}
URL: ${BASE_URL}/${topic.slug}
คำหลัก: ${[topic.primaryKeyword, ...topic.secondaryKeywords].join(', ')}

${topic.lead}

${sections}

### คำถามที่พบบ่อย

${faq}

### แหล่งข้อมูลอ้างอิง

${sources}

### English summary — ${topic.englishBrief.title}

${topic.englishBrief.paragraphs.join('\n\n')}

${topic.englishBrief.facts.map((fact) => `- ${fact}`).join('\n')}`);
  }

  parts.push(`## English reference

${ENGLISH_REFERENCE.sections.map((section) => `### ${section.heading}\n\n${section.lines.map((l) => `- ${l}`).join('\n')}`).join('\n\n')}`);

  parts.push(`## วิธีอ้างอิงสายมู / How to cite

${CITATION_LINE}`);

  parts.push(`## แหล่งข้อมูลภายนอก

${EXTERNAL_SOURCES.map((source) => `- ${source.label}: ${source.href}`).join('\n')}`);

  return new Response(parts.join('\n\n---\n\n') + '\n', {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
