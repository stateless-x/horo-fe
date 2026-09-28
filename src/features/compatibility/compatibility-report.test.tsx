import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RELATIONSHIP_TYPES, shapeCompatibilityView } from '@/lib-packages/shared/types/compatibility';
import type { CompatibilityV4Content, RelationshipType } from '@/lib-packages/shared/types/compatibility';
import { CompatibilityReading } from './compatibility-reading';
import { compatibilityTalismanBand } from './report/compatibility-talisman';
import { REPORT_SECTION_IDS, planFrameFor, relationshipReportCopy } from './report/report-copy';
import { relationshipReportVisuals } from './report/report-visuals';

const chapter = (key: CompatibilityV4Content['chapters'][number]['key'], title: string) => ({
  key,
  title,
  summary: `สรุปเรื่อง${title}`,
  pullQuote: `คำคมเรื่อง${title}`,
  detail: `รายละเอียดเรื่อง${title}`,
  move: `สิ่งที่ลองทำเรื่อง${title}`,
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

// The door reads the มู wallet through React Query; on the server render it is still loading.
const render = (view: 'teaser' | 'full', onUnlock?: () => void, partnerName = 'ต้น', relationshipType: RelationshipType = 'romantic') =>
  renderToStaticMarkup(
    <QueryClientProvider client={new QueryClient()}>
      <CompatibilityReading
        score={72}
        analysis=""
        structuredContent={shapeCompatibilityView(content, view)}
        relationshipType={relationshipType}
        readerName="มิ้นท์"
        partnerName={partnerName}
        onUnlock={onUnlock}
      />
    </QueryClientProvider>,
  );

describe('CompatibilityReport', () => {
  test('every score band receives its own equally complete talisman state', () => {
    expect(compatibilityTalismanBand(0).label).toBe('จังหวะต่างกัน');
    expect(compatibilityTalismanBand(39).src).toContain('different-rhythms');
    expect(compatibilityTalismanBand(40).label).toBe('ค่อย ๆ จูนกัน');
    expect(compatibilityTalismanBand(60).label).toBe('เข้ากันได้ดี');
    expect(compatibilityTalismanBand(80).label).toBe('จังหวะร่วมเด่น');
    expect(compatibilityTalismanBand(100).src).toContain('shared-momentum');
  });

  test('the teaser shows the cover, bars, questions and the locked door, and holds no paid text', () => {
    const html = render('teaser', () => {});
    expect(html).toContain('คู่ไฟหลอมทอง');
    expect(html).toContain('balanced-fit.webp');
    expect(html).toContain('เข้ากันได้ดี');
    expect(html).toContain('aria-label="ความเข้ากัน 72 จาก 100"');
    expect(html).toContain('มิ้นท์');
    expect(html).toContain('เจ้าวันทองหยาง');
    expect(html).not.toContain('INFP');
    expect(html).not.toContain('ESTJ');
    expect(html).toContain(content.cover.verdict);
    for (const dimension of content.dimensions) expect(html).toContain(`${dimension.score}<span class="sr-only">จาก 100`);
    for (const hint of content.cover.lockedHints) expect(html).toContain(hint.text);
    // No balance or price until the wallet loads: never a made-up number.
    expect(html).toContain('เปิดคำตอบทั้งหมด');
    expect(html).toContain('ฉบับเต็มช่วยให้เห็นทั้งใจเขา จุดที่ติด และก้าวต่อไป');
    for (const paid of [content.overview.story, 'บรรทัดเคมี', 'รายละเอียดเรื่อง', 'คำคมเรื่อง', 'ข้อความเดือนตุลา', 'ขั้นแรก', 'มะเมีย']) {
      expect(html).not.toContain(paid);
    }
    expect(html).not.toContain('ฉบับเต็มนี้เก็บอยู่ในประวัติ');
  });

  test('the full view has the edition mark, meanings, six chapters with their kits, moon-phase months and the plan', () => {
    const html = render('full');
    expect(html).toContain('ฉบับเต็ม');
    expect(html).toContain(content.overview.story);
    expect(html).toContain('บรรทัดความไว้ใจ');
    // The two conversation chapters name their action; the other four keep
    // the neutral detail label. Anchor to the chevron so fixture prose cannot
    // inflate the count.
    expect(html.match(/>(?:รายละเอียด|ดูวิธีเริ่มคุย|ดูวิธีกลับมาคุย)<svg/g)).toHaveLength(6);
    expect(html).toContain('คำคมเรื่องแรงดึงดูด');
    // The attraction chapter's computed basis: both spouse palaces.
    expect(html).toContain('มะเมีย (ม้า)');
    expect(html).toContain('มีทองหยินซ่อนอยู่');
    expect(html).toContain('ประโยคพร้อมส่ง');
    expect(html).toContain('สัญญาณว่าควรชะลอ');
    expect(html).toContain('ก้าวต่อไปเหมาะกับเดือนตุลาคม 2569');
    // Month states explain the next move in words, never only through color or a repeated symbol.
    for (const word of ['คุยเรื่องสำคัญได้', 'ไปทีละเรื่อง', 'เลี่ยงการตัดสินใจใหญ่']) expect(html).toContain(word);
    expect(html).toContain('ข้อความเดือนธันวา');
    expect(html).toContain('ต่อยอดสิ่งที่เข้ากัน');
    expect(html).toContain('การ์ดคู่สำหรับแชร์');
    // Each tab opens with a useful decision rather than a second introduction.
    for (const prompt of ['อยากเห็นมุมไหนของคู่นี้', 'อยากเข้าใจใครก่อน', 'ตอนนี้อยากทำอะไรต่อ']) expect(html).toContain(prompt);
    for (const action of ['ดู 4 มิติของคู่นี้', 'เขาเป็นคนแบบไหน', 'เริ่มอะไรได้บ้าง']) expect(html).toContain(action);
    for (const asset of ['next-signal.webp', 'next-timing.webp', 'next-step.webp']) expect(html).toContain(asset);
    expect(html).not.toContain('เปิดคำตอบทั้งหมด');
    // Owner rule: no purple text inside the report (fills, focus rings and controls may stay purple).
    expect(html).not.toMatch(/(?<![\w-])text-accent(Bright|Soft)\b/);
  });

  test('the full view groups the reading into four focused sections instead of one long contents rail', () => {
    const html = render('full');
    expect(html).toContain('role="tablist"');
    expect(html).toContain('aria-label="ส่วนของคำตอบฉบับเต็ม"');
    expect(html).toContain('snap-x snap-mandatory');
    expect(html).toContain('เลื่อนดู');
    for (const label of ['ทำไมถึงใช่', 'อ่านนิสัยเขา', 'คุยให้เข้าใจกัน', 'ไปต่อยังไงดี']) expect(html).toContain(`aria-label="${label}"`);
    expect(html).toContain('id="report-tab-overview"');
    expect(html).toContain('id="report-panel-next"');
    expect(html).toContain('อ่านราว 11 นาที · แบ่งเป็น 4 ส่วน เลือกทีละเรื่องได้เลย');
    expect(html).toContain('two-mirrors.webp');
    expect(html).toContain('talking.webp');
    expect(html).toContain('listening.webp');
    expect(html).toContain('ตอนนี้คุณอยู่ตรงไหน');
    expect(html).toContain('มีเรื่องอยากคุย');
    expect(html).toContain('เริ่มรู้สึกตึง');
    expect(html).toContain('reconnect.webp');
    expect(html).toContain('ดูวิธีเริ่มคุย');
    expect(html).toContain('ดูวิธีกลับมาคุย');
  });

  test('sections, not chapters: no บท and no chapter numbers, and hints name their section', () => {
    // บท as the unit word (a bare /บท/ also hits คำตอบทั้งหมด and ครบทุก).
    const unitWord = /บทที่|บทนี้|บทนั้น|บทของ|ในบท|ทุกบท|\d\s*บท/;
    const teaser = render('teaser', () => {});
    const full = render('full');
    for (const html of [teaser, full]) expect(html).not.toMatch(unitWord);
    expect(teaser).toContain('คำตอบอยู่ในส่วน ‘อ่านนิสัยเขา’ ของฉบับเต็ม');
    expect(teaser).toContain('คำตอบอยู่ในส่วน ‘คุยให้เข้าใจกัน’ ของฉบับเต็ม');
    expect(teaser).not.toContain('จ่ายครั้งเดียว');
    expect(full).toContain('เหมาะกับก้าวต่อไป ดู ‘สิ่งที่ทำให้อยู่ยาว’');
    // No numbered chapter badge beside a chapter title.
    expect(full).not.toMatch(/tabular-nums">\d<\/span>/);
  });

  test('a Latin partner name is spaced from the Thai around it; a Thai name is not', () => {
    expect(render('full', undefined, 'Ice')).toContain('ฉบับเต็มของคุณกับ Ice</h2>');
    expect(render('teaser', () => {}, 'Ice')).toContain('เรื่องที่คุณน่าจะเคยเจอกับ Ice');
    expect(render('full')).toContain('ฉบับเต็มของคุณกับต้น</h2>');
    expect(render('full', undefined, 'Ice')).toContain('วังคู่ครองของ Ice');
  });

  test('the locked offer summarizes value without repeating a lock for every chapter', () => {
    const html = render('teaser', () => {});
    for (const value of ['เข้าใจว่าเขารู้สึกยังไง', 'รู้ว่าควรคุยเรื่องไหน', 'เห็นจังหวะ 3 เดือนข้างหน้า', 'มีแนวทางที่เลือกลองได้จริง']) expect(html).toContain(value);
    expect(html).not.toContain('ตัวตนของต้นในความสัมพันธ์นี้');
  });

  test('the share card carries free fields only', () => {
    const html = render('full');
    const card = html.slice(html.indexOf('การ์ดแชร์'), html.indexOf('ดูดวงคู่ของคุณ'));
    expect(card).toContain('คู่ไฟหลอมทอง');
    expect(card).toContain('balanced-fit.webp');
    expect(card).toContain('เข้ากันได้ดี');
    for (const paid of ['สรุปเรื่อง', 'คำคมเรื่อง', content.cover.verdict, content.cover.lockedHints[0].text]) expect(card).not.toContain(paid);
  });

  test('relationship context, not one romance template, names every report section and its next step', () => {
    expect(relationshipReportCopy('talking').sections.next.title).toBe('ค่อย ๆ ดูใจกันต่อไหม');
    expect(relationshipReportCopy('friend').sections.next.label).toBe('ดูแลมิตรภาพ');
    expect(relationshipReportCopy('boss').sections.people.label).toBe('สไตล์หัวหน้า');
    expect(relationshipReportCopy('coworker').sections.conversation.title).toBe('อยากให้งานลื่นขึ้น เริ่มคุยยังไงดี');
    expect(relationshipReportCopy('family').sections.next.title).toBe('อยู่ด้วยกันให้สบายใจขึ้น');
    expect(planFrameFor('romantic', 35).title).toBe('ค่อย ๆ หาจังหวะที่สบายใจ');
    expect(planFrameFor('romantic', 55).title).toBe('ค่อย ๆ จูนจังหวะกัน');
    expect(planFrameFor('romantic', 72).title).toBe('ต่อยอดสิ่งที่เข้ากัน');
    expect(planFrameFor('boss', 72).title).toBe('ต่อยอดจังหวะงานที่เข้ากัน');

    const family = render('full', undefined, 'แม่', 'family');
    for (const visibleCopy of ['ทำไมถึงเป็นแบบนี้', 'นิสัยเขา นิสัยเรา', 'คุยกันให้ใจเย็น', 'อยู่ด้วยกันยังไงดี', 'ต่อยอดพื้นที่ปลอดภัยในบ้าน']) {
      expect(family).toContain(visibleCopy);
    }
    expect(family).toContain('family.webp');
    expect(family).not.toContain('next-signal.webp');
    const boss = render('full', undefined, 'หัวหน้า', 'boss');
    for (const visibleCopy of ['ทำงานกับหัวหน้าไหวไหม', 'สไตล์หัวหน้า', 'คุยงานให้เข้าใจ', 'ทำงานต่อยังไงดี', 'ต่อยอดจังหวะงานที่เข้ากัน']) {
      expect(boss).toContain(visibleCopy);
    }
    expect(boss).toContain('career.webp');
    expect(boss).toContain('coworker.webp');
    expect(boss).not.toContain('next-signal.webp');
  });

  test('each context assigns imagery by relationship meaning, not a default romance treatment', () => {
    expect(relationshipReportVisuals('friend').sections.people).toContain('relationships/friend.webp');
    expect(relationshipReportVisuals('family').conversation.open).toContain('categories/family.webp');
    expect(relationshipReportVisuals('coworker').sections.people).toContain('relationships/coworker.webp');
    expect(relationshipReportVisuals('boss').next.future.tone).toBe('accent');
    expect(relationshipReportVisuals('romantic').next.future.tone).toBe('romance');
  });

  test('every compatibility type has complete natural-language labels for the swipeable tab rail', () => {
    for (const relationshipType of RELATIONSHIP_TYPES) {
      const sections = relationshipReportCopy(relationshipType).sections;
      for (const id of REPORT_SECTION_IDS) {
        const { label } = sections[id];
        expect(label.trim()).not.toBe('');
        expect(label).not.toContain('…');
      }
    }
    expect(relationshipReportCopy('friend').sections.people.label).toBe('นิสัยเราสองคน');
    expect(relationshipReportCopy('family').sections.people.label).toBe('นิสัยเขา นิสัยเรา');
    expect(relationshipReportCopy('boss').sections.people.label).toBe('สไตล์หัวหน้า');
  });
});
