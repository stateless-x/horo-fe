import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { shapeCompatibilityView } from '@/lib-packages/shared/types/compatibility-v3';
import type { CompatibilityV4Content } from '@/lib-packages/shared/types/compatibility-v4';
import { CompatibilityReading } from './compatibility-reading';

const chapter = (key: CompatibilityV4Content['chapters'][number]['key'], title: string) => ({
  key,
  title,
  summary: `สรุปบท${title}`,
  detail: `รายละเอียดบท${title}`,
  move: `สิ่งที่ลองทำในบท${title}`,
});

const content: CompatibilityV4Content = {
  contentVersion: 4,
  generatedOn: '2026-09-27',
  archetype: { key: 'generating-combine', name: 'คู่เติมเต็ม', tagline: 'คนหนึ่งหนุน อีกคนเติบโต' },
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

const render = (view: 'teaser' | 'full', onUnlock?: () => void) =>
  renderToStaticMarkup(
    <CompatibilityReading
      score={72}
      analysis=""
      structuredContent={shapeCompatibilityView(content, view)}
      relationshipType="romantic"
      readerName="มิ้นท์"
      partnerName="ต้น"
      onUnlock={onUnlock}
    />,
  );

describe('CompatibilityReport', () => {
  test('the teaser shows the cover and score bars, locks the meanings, and holds no paid text', () => {
    const html = render('teaser', () => {});
    expect(html).toContain('มิ้นท์ กับ ต้น');
    expect(html).toContain('คู่เติมเต็ม');
    expect(html).toContain(content.cover.verdict);
    for (const dimension of content.dimensions) expect(html).toContain(`>${dimension.score}<`);
    for (const hint of content.cover.lockedHints) expect(html).toContain(hint.text);
    expect(html).toContain('อ่านรายงานฉบับเต็ม');
    expect(html).not.toContain(content.overview.story);
    expect(html).not.toContain('บรรทัดเคมี');
    expect(html).not.toContain('รายละเอียดบท');
    expect(html).not.toContain('ข้อความเดือนตุลา');
    expect(html).not.toContain('ขั้นแรก');
  });

  test('the full view has the overview, six chapters, the calendar with labels in words, and the plan', () => {
    const html = render('full');
    expect(html).toContain(content.overview.story);
    expect(html).toContain('บรรทัดความไว้ใจ');
    expect(html.match(/อ่านเจาะลึก/g)).toHaveLength(6);
    expect(html).toContain('ประโยคที่ส่งได้เลย');
    expect(html).toContain('สัญญาณว่าควรชะลอ');
    // The month state is a word and an icon, not only a color.
    for (const word of ['ดี', 'กลาง', 'ระวัง']) expect(html).toContain(`</svg>${word}</p>`);
    expect(html).toContain('ข้อความเดือนธันวา');
    expect(html).toContain('วันที่ 3');
    expect(html).not.toContain('ในรายงานฉบับเต็ม');
  });
});
