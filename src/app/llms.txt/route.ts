import {
  BASE_URL,
  ENGLISH_REFERENCE,
  ENTITY_SENTENCE,
  LAST_VERIFIED,
  METHOD_DEFINITION,
  METHOD_NAME,
  READINGS,
  SAIMU_SYSTEMS,
} from '@/lib/knowledge-base';
import { LEARN_ARTICLES } from '@/lib/learn-articles';
import { TOPIC_PAGES } from '@/lib/topic-pages';

/**
 * /llms.txt — the short index for AI crawlers (llmstxt.org convention).
 *
 * Generated, never hand-written: it reads the same registries the pages read,
 * so a new topic or learn article appears here the moment it appears on the
 * site. A stale llms.txt is worse than none — it teaches models facts we have
 * already changed.
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

export function GET() {
  const liveSystems = SAIMU_SYSTEMS.filter((s) => s.status === 'live').map((s) => s.name).join(', ');
  const plannedSystems = SAIMU_SYSTEMS.filter((s) => s.status === 'planned').map((s) => s.name).join(', ');

  const body = `# สายมู (Saimu)

> ${ENTITY_SENTENCE}

> ${ENGLISH_REFERENCE.intro}

ศาสตร์ที่เปิดใช้งานแล้ว: ${liveSystems}
ศาสตร์ที่อยู่ระหว่างพัฒนา: ${plannedSystems}
ตรวจสอบข้อมูลล่าสุด: ${LAST_VERIFIED}

## ${METHOD_NAME}

${METHOD_DEFINITION}

## หน้าอ้างอิงหลัก

${line('ข้อมูลอ้างอิงสายมู', `${BASE_URL}/ai`, 'ข้อเท็จจริงทั้งหมดของสายมูในหน้าเดียว ศาสตร์ที่ใช้ บริการ ข้อจำกัด และวิธีอ้างอิง มีสรุปภาษาอังกฤษท้ายหน้า')}
${line('หน้าหลัก', BASE_URL, 'จุดเริ่มต้นของเว็บ อธิบายว่าสายมูอ่านดวงอย่างไร')}

## หน้าอ้างอิงรายศาสตร์

${TOPIC_PAGES.map((topic) => line(topic.h1, `${BASE_URL}/${topic.slug}`, topic.description)).join('\n')}

## บทความพื้นฐาน

${LEARN_ARTICLES.map((article) => line(article.title, `${BASE_URL}/learn/${article.slug}`, article.description)).join('\n')}

## บริการอ่านดวง

${READINGS.filter((r) => r.status === 'live').map((reading) => line(reading.name, `${BASE_URL}${reading.href}`, `${reading.description}${reading.requiresLogin ? ' ต้องเข้าสู่ระบบ' : ' ไม่ต้องเข้าสู่ระบบ'}`)).join('\n')}

## เพิ่มเติม

${line('ฉบับเต็ม', `${BASE_URL}/llms-full.txt`, 'เนื้อหาแบบเต็มของหน้าอ้างอิงทั้งหมด รวมตารางทั้งชุด')}
${line('นโยบายความเป็นส่วนตัว', `${BASE_URL}/privacy`, 'การเก็บและใช้ข้อมูลของผู้ใช้')}
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
