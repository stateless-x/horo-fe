import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { shapeCompatibilityView } from '@/lib-packages/shared/types/compatibility-v3';
import type { CompatibilityV4Content } from '@/lib-packages/shared/types/compatibility-v4';
import { CompatibilityReading } from './compatibility-reading';

const chapter = (key: CompatibilityV4Content['chapters'][number]['key'], title: string) => ({
  key,
  title,
  summary: `สรุปบท${title}`,
  pullQuote: `คำคมบท${title}`,
  detail: `รายละเอียดบท${title}`,
  move: `สิ่งที่ลองทำในบท${title}`,
});

const content: CompatibilityV4Content = {
  contentVersion: 4,
  generatedOn: '2026-09-27',
  archetype: { key: 'fire-metal', name: 'คู่ไฟหลอมทอง', tagline: 'ความร้อนที่ขัดเกลาให้คมขึ้น ขอแค่อย่าร้อนเกินจนเสียรูป' },
  people: {
    reader: { element: 'metal', yinYang: 'yang', mbti: 'INFP' },
    partner: { element: 'fire', yinYang: 'yin', mbti: 'ESTJ' },
  },
  palace: {
    reader: { naksat: 'มะเมีย', animal: 'ม้า', hidden: { element: 'fire', yinYang: 'yin' } },
    partner: { naksat: 'ระกา', animal: 'ไก่', hidden: { element: 'metal', yinYang: 'yin' } },
  },
  readingMinutes: 11,
  dimensions: [
    { key: 'chemistry', label: 'เคมี', score: 82, basis: ['dayBranch', 'element'] },
    { key: 'communication', label: 'การสื่อสาร', score: 64, basis: ['element', 'dayBranch'] },
    { key: 'trust', label: 'ความไว้ใจ', score: 71, basis: ['dayBranch', 'yearBranch', 'element'] },
    { key: 'rhythm', label: 'จังหวะชีวิต', score: 43, basis: ['yearBranch', 'element'] },
  ],
  cover: {
    verdict: 'ต้นกับคุณดึงกันด้วยความต่างที่ต้องคุยให้ชัด',
    lockedHints: [
      { text: 'ทำไมต้นถึงเงียบเมื่อแผนเปลี่ยน', chapter: 'partner' },
      { text: 'สิ่งที่คุณเก็บไว้จนเรื่องเล็กกลายเป็นเรื่องใหญ่', chapter: 'you' },
      { text: 'ประโยคไหนที่ทำให้ต้นฟังคุณ', chapter: 'communication' },
    ],
  },
  overview: {
    story: 'เรื่องของคู่นี้ในย่อหน้าเดียว',
    dimensionLines: { chemistry: 'บรรทัดเคมี', communication: 'บรรทัดการสื่อสาร', trust: 'บรรทัดความไว้ใจ', rhythm: 'บรรทัดจังหวะ' },
  },
  chapters: [
    chapter('attraction', 'แรงดึงดูด'),
    chapter('partner', 'ตัวตนของต้นในความสัมพันธ์นี้'),
    chapter('you', 'ตัวคุณในความสัมพันธ์นี้'),
    { ...chapter('communication', 'การสื่อสาร'), pairs: [{ do: 'ทำหนึ่ง', avoid: 'เลี่ยงหนึ่ง' }], lines: ['ประโยคหนึ่ง'] },
    { ...chapter('friction', 'จุดเสียดทานและวิธีคืนดี'), scenarios: [{ scenario: 'ถ้าเกิดเรื่องหนึ่ง', repair: 'คืนดีหนึ่ง' }] },
    {
      ...chapter('future', 'สิ่งที่ทำให้อยู่ยาว'),
      goSignals: ['สัญญาณไปต่อ'],
      slowSignals: ['สัญญาณชะลอ'],
      nextStep: { month: '2026-10', step: 'ขั้นต่อไปเดือนตุลา' },
    },
  ],
  calendar: [
    { month: '2026-10', label: 'good', text: 'ข้อความเดือนตุลา' },
    { month: '2026-11', label: 'mixed', text: 'ข้อความเดือนพฤศจิกา' },
    { month: '2026-12', label: 'caution', text: 'ข้อความเดือนธันวา' },
  ],
  plan: [
    { day: 1, action: 'ขั้นแรก', conversationStarter: 'พูดแรก', watchFor: 'สังเกตแรก' },
    { day: 3, action: 'ขั้นสอง', conversationStarter: 'พูดสอง', watchFor: 'สังเกตสอง' },
    { day: 6, action: 'ขั้นสาม', conversationStarter: 'พูดสาม', watchFor: 'สังเกตสาม' },
  ],
  insights: [],
};

// The door reads the ละอองดาว wallet through React Query; on the server render it is still loading.
const render = (view: 'teaser' | 'full', onUnlock?: () => void) =>
  renderToStaticMarkup(
    <QueryClientProvider client={new QueryClient()}>
      <CompatibilityReading
        score={72}
        analysis=""
        structuredContent={shapeCompatibilityView(content, view)}
        relationshipType="romantic"
        readerName="มิ้นท์"
        partnerName="ต้น"
        onUnlock={onUnlock}
      />
    </QueryClientProvider>,
  );

describe('CompatibilityReport', () => {
  test('the teaser shows the cover, bars, questions and the locked door, and holds no paid text', () => {
    const html = render('teaser', () => {});
    expect(html).toContain('คู่ไฟหลอมทอง');
    // The reading's kind, above the archetype.
    expect(html).toMatch(/ดวงคู่ · ความรัก\s*<\/p><h1/);
    expect(html).toContain('มิ้นท์');
    expect(html).toContain('เจ้าวันทองหยาง');
    expect(html).toContain(content.cover.verdict);
    for (const dimension of content.dimensions) expect(html).toContain(`${dimension.score}<span class="sr-only">จาก 100`);
    for (const hint of content.cover.lockedHints) expect(html).toContain(hint.text);
    // No balance or price until the wallet loads: never a made-up number.
    expect(html).toContain('ปลดล็อกด้วยละอองดาว');
    expect(html).toContain('อ่านราว <b class="font-semibold text-ink">11 นาที</b>');
    for (const paid of [content.overview.story, 'บรรทัดเคมี', 'รายละเอียดบท', 'คำคมบท', 'ข้อความเดือนตุลา', 'ขั้นแรก', 'มะเมีย']) {
      expect(html).not.toContain(paid);
    }
    // No seal before the report is open.
    expect(html).not.toContain('ฉบับเต็ม · ดวงคู่ · สายมู');
  });

  test('the full view has the seal, meanings, six chapters with their kits, moon-phase months and the plan', () => {
    const html = render('full');
    expect(html).toContain('ฉบับเต็ม · ดวงคู่ · สายมู');
    expect(html).toContain(content.overview.story);
    expect(html).toContain('บรรทัดความไว้ใจ');
    expect(html.match(/อ่านเจาะลึก/g)).toHaveLength(6);
    expect(html).toContain('คำคมบทแรงดึงดูด');
    // The attraction chapter's computed basis: both spouse palaces.
    expect(html).toContain('มะเมีย (ม้า)');
    expect(html).toContain('มีทองหยินซ่อนอยู่');
    expect(html).toContain('ประโยคพร้อมส่ง');
    expect(html).toContain('สัญญาณว่าควรชะลอ');
    expect(html).toContain('ก้าวต่อไปเหมาะกับเดือนตุลาคม 2569');
    // Month states are a word beside a moon glyph, not only a color.
    for (const word of ['ดี', 'กลาง', 'ระวัง']) expect(html).toContain(`>${word}</span>`);
    expect(html).toContain('ข้อความเดือนธันวา');
    expect(html).toContain('วันที่ <span class="font-mono">3</span>');
    expect(html).toContain('การ์ดคู่สำหรับแชร์');
    expect(html).not.toContain('ปลดล็อกด้วยละอองดาว');
    // Owner rule: no purple text inside the report (fills, focus rings and controls may stay purple).
    expect(html).not.toMatch(/(?<![\w-])text-accent(Bright|Soft)\b/);
  });

  test('the share card carries free fields only', () => {
    const html = render('full');
    const card = html.slice(html.indexOf('การ์ดแชร์'), html.indexOf('ดูดวงคู่ของคุณ'));
    expect(card).toContain('คู่ไฟหลอมทอง');
    for (const paid of ['สรุปบท', 'คำคมบท', content.cover.verdict, content.cover.lockedHints[0].text]) expect(card).not.toContain(paid);
  });
});
