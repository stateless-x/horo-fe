import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  shapeCompatibilityView,
  type CompatibilityV3Content,
} from '@/lib-packages/shared/types/compatibility-v3';
import { CompatibilityReading } from './compatibility-reading';

const content: CompatibilityV3Content = {
  contentVersion: 3,
  scoreExplanation: 'ความเข้ากันได้ดี มีจุดที่ต้องปรับจังหวะ',
  teaser: {
    verdict: 'คู่นี้ไปได้ดีเมื่อคุยกันตรง ๆ',
    hook: 'ไฟของคุณกับดินของอีกฝ่ายเติมกัน แต่เร็วช้าไม่เท่ากัน',
    lockedHints: [
      { text: 'อีกฝ่ายมักแสดงความใส่ใจแบบไหน', section: 'understandingPartner' },
      { text: 'จุดบอดของคุณที่ทำให้เรื่องค้าง', section: 'yourSide' },
      { text: 'ถ้าคุณเงียบไป อีกฝ่ายมักทำอย่างไร', section: 'friction' },
    ],
  },
  detail: {
    dynamic: 'รายละเอียดภาพรวมเฉพาะฉบับเต็ม',
    understandingPartner: 'รายละเอียดอีกฝ่าย',
    yourSide: 'รายละเอียดของคุณ',
    communication: [
      { do: 'ทำข้อหนึ่ง', avoid: 'เลี่ยงข้อหนึ่ง' },
      { do: 'ทำข้อสอง', avoid: 'เลี่ยงข้อสอง' },
      { do: 'ทำข้อสาม', avoid: 'เลี่ยงข้อสาม' },
    ],
    friction: [
      { scenario: 'ถ้าเรื่องแรกเกิดขึ้น', repair: 'ซ่อมเรื่องแรก' },
      { scenario: 'ถ้าเรื่องที่สองเกิดขึ้น', repair: 'ซ่อมเรื่องที่สอง' },
    ],
    timing: { advice: 'คุยวันอาทิตย์', basis: ['p1ThaiDay', 'p2Planet'] },
    longTerm: 'รายละเอียดระยะยาว',
    nextSteps: { action: 'ลงมือทำ', conversationStarter: 'ประโยคชวนคุย', watchFor: 'สิ่งที่สังเกต' },
  },
};

const render = (view: 'teaser' | 'full', onUnlock?: () => void) =>
  renderToStaticMarkup(
    <CompatibilityReading
      score={82}
      analysis={JSON.stringify(content)}
      structuredContent={shapeCompatibilityView(content, view)}
      relationshipType="family"
      onUnlock={onUnlock}
    />,
  );

describe('CompatibilityReading v3', () => {
  test('the teaser view shows the verdict, hook and locked hints, and no detail text', () => {
    const html = render('teaser');
    expect(html).toContain(content.teaser.verdict);
    expect(html).toContain(content.teaser.hook);
    for (const hint of content.teaser.lockedHints) expect(html).toContain(hint.text);
    expect(html).not.toContain(content.detail.dynamic);
    expect(html).not.toContain(content.detail.nextSteps.action);
  });

  test('the unlock button appears only when an unlock handler is given', () => {
    expect(render('teaser')).not.toContain('อ่านดวงคู่ฉบับเต็ม');
    expect(render('teaser', () => {})).toContain('อ่านดวงคู่ฉบับเต็ม');
  });

  test('the full view shows every section and no locked card', () => {
    const html = render('full');
    expect(html).toContain(content.detail.dynamic);
    expect(html).toContain(content.detail.communication[2].avoid);
    expect(html).toContain(content.detail.friction[1].repair);
    expect(html).toContain('วันเกิดของคุณ · ดาวประจำวันเกิดของอีกฝ่าย');
    expect(html).toContain(content.detail.nextSteps.watchFor);
    expect(html).not.toContain('ในดวงคู่ฉบับเต็ม');
  });
});
