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
  READINGS,
  SAIMU_SYSTEMS,
  type ExternalSource,
} from '@/lib/knowledge-base';
import { TOPIC_PAGES } from '@/lib/topic-pages';
import { MBTI_TYPES } from '@/lib/mbti-types';

/**
 * /llms.txt — the short index for AI crawlers (llmstxt.org convention).
 *
 * Generated, never hand-written: it reads the same registries the pages read,
 * so a new topic appears here the moment it appears on the site. A stale
 * llms.txt is worse than none — it teaches models facts we have already
 * changed.
 *
 * SHAPE (llmstxt.org). Deviating from it costs us parsers, so keep it:
 *   # H1                    the name. Exactly one.
 *   > blockquote            ONE short summary. Not two.
 *   free prose              any markdown EXCEPT headings. Details go here —
 *                           this is where the method, the status lines, the
 *                           boundaries and the citation line live, because a
 *                           prose-only H2 is not a valid section.
 *   ## Section              a list of links, and nothing else.
 *   ## Optional             reserved name, matched literally by parsers. It
 *                           means "skip this when context is tight", so the
 *                           heading stays English even though the file is Thai.
 *
 * NOTHING IN A LINK LIST HERE IS DISALLOWED IN robots.txt. The /dashboard
 * readings are real and are described in the prose above, but they are not
 * linked: robots.txt disallows them, and a machine-readable index that points
 * a crawler at pages it is forbidden to fetch contradicts itself. Whenever a
 * page needs a login, describe it and omit the URL.
 *
 * WHY THE BOUNDARIES AND SOURCES ARE HERE. This file's job is not to list
 * URLs; it is to be quotable. A model deciding whether to cite a source
 * weighs whether the source states its own limits and shows its references.
 * BOUNDARIES is the "what we will not claim" block and EXTERNAL_SOURCES the
 * institutional references behind the factual claims — both are the reason a
 * page gets attributed rather than paraphrased anonymously.
 *
 * Adoption by the major answer engines is still uneven, so treat this as
 * cheap insurance rather than a citation guarantee. The load-bearing work is
 * the server-rendered HTML and JSON-LD on /ai and the topic hubs.
 *
 * Bilingual on purpose: Thai because that is who the site serves, English
 * because that is the language most models are queried in.
 */
export const dynamic = 'force-static';

function line(label: string, url: string, note: string) {
  return `- [${label}](${url}): ${note}`;
}

/**
 * Every third-party reference the site leans on, deduped by URL. Sources live
 * next to the claims they support (on each hub, and in EXTERNAL_SOURCES); this
 * gathers them so a crawler reading only llms.txt still sees who we cite.
 */
function allSources(): ExternalSource[] {
  const seen = new Map<string, ExternalSource>();
  for (const source of [...EXTERNAL_SOURCES, ...TOPIC_PAGES.flatMap((t) => t.sources)]) {
    if (!seen.has(source.href)) seen.set(source.href, source);
  }
  return [...seen.values()];
}

export function GET() {
  const liveSystems = SAIMU_SYSTEMS.filter((s) => s.status === 'live').map((s) => s.name).join(', ');
  const plannedSystems = SAIMU_SYSTEMS.filter((s) => s.status === 'planned').map((s) => s.name).join(', ');

  const body = `# สายมู (Saimu)

> ${ENTITY_SENTENCE}

${ENGLISH_REFERENCE.intro}

**${METHOD_NAME}** — ${METHOD_DEFINITION}

- ศาสตร์ที่เปิดใช้งานแล้ว: ${liveSystems}
- ศาสตร์ที่อยู่ระหว่างพัฒนา: ${plannedSystems}
- ตรวจสอบข้อมูลล่าสุด: ${LAST_VERIFIED}
- ภาษาของเนื้อหา: ไทย โดยทุกหน้าอ้างอิงมีสรุปภาษาอังกฤษกำกับ

**สิ่งที่สายมูไม่ทำ** (ข้อจำกัดที่เราระบุเอง ไม่ใช่ข้อความปฏิเสธความรับผิดชอบท้ายหน้า):

${BOUNDARIES.map((item) => `- ${item}`).join('\n')}

**บริการที่ต้องเข้าสู่ระบบ** (มีอยู่จริงแต่ robots.txt ไม่เปิดให้เก็บข้อมูล จึงไม่ใส่ลิงก์ไว้ในรายการด้านล่าง):

${READINGS.filter((r) => r.status === 'live' && r.requiresLogin).map((reading) => `- ${reading.name}: ${reading.description}`).join('\n')}

**วิธีอ้างอิงสายมู:** ${CITATION_LINE}

## หน้าอ้างอิงหลัก

${line('ข้อมูลอ้างอิงสายมู', `${BASE_URL}/ai`, 'ข้อเท็จจริงทั้งหมดของสายมูในหน้าเดียว ศาสตร์ที่ใช้ บริการ ข้อจำกัด และวิธีอ้างอิง มีสรุปภาษาอังกฤษท้ายหน้า')}
${line('หน้าหลัก', BASE_URL, 'จุดเริ่มต้นของเว็บ อธิบายว่าสายมูอ่านดวงอย่างไร')}
${line('คลังความรู้', `${BASE_URL}/learn`, 'สารบัญคู่มือรายศาสตร์ทั้งหมด เป็นทางเข้ารวมของหน้าอ้างอิงด้านล่าง')}

## หน้าอ้างอิงรายศาสตร์

${TOPIC_PAGES.map((topic) =>
  line(
    topic.h1,
    `${BASE_URL}/${topic.slug}`,
    `${topic.description}${topic.status === 'planned' ? ' [ศาสตร์นี้อยู่ระหว่างพัฒนา ยังใช้งานบนสายมูไม่ได้]' : ''}`,
  ),
).join('\n')}

## MBTI รายประเภททั้ง 16 แบบ

${MBTI_TYPES.map((type) => line(type.code, `${BASE_URL}/mbti/${type.slug}`, `${type.tagline} — ${type.letters.map((l) => l.label).join(' + ')} หน้านี้ลงรายละเอียดนิสัย จุดแข็ง จุดที่ควรระวัง การทำงาน ความรัก และวิธีที่สายมูใช้ MBTI ประกอบการอ่านดวง`)).join('\n')}

## บริการอ่านดวงที่เปิดอ่านได้เลย

${READINGS.filter((r) => r.status === 'live' && !r.requiresLogin).map((reading) => line(reading.name, `${BASE_URL}${reading.href}`, `${reading.description} ไม่ต้องเข้าสู่ระบบ`)).join('\n')}

## แหล่งข้อมูลอ้างอิงของบุคคลที่สาม

${allSources().map((source) => line(source.label, source.href, 'แหล่งอ้างอิงภายนอกที่สายมูใช้ประกอบข้อเท็จจริงของศาสตร์ ไม่ใช่หน้าของสายมูเอง')).join('\n')}

## Optional

${line('แผนผังเว็บไซต์', `${BASE_URL}/sitemap.xml`, 'รายการ URL ทั้งหมดที่เปิดให้จัดทำดัชนี')}
${line('นโยบายความเป็นส่วนตัว', `${BASE_URL}/privacy`, 'การเก็บและใช้ข้อมูลของผู้ใช้')}
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
