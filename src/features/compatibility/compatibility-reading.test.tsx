import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import type { RelationshipType } from '@/lib-packages/shared';
import type { CompatibilityStructuredContent } from '@/lib-packages/shared/types/reading';
import { CompatibilityReading } from './compatibility-reading';

const savedV2Content: CompatibilityStructuredContent = {
  contentVersion: 2,
  scoreExplanation: 'คะแนนนี้สะท้อนทั้งจุดร่วมและจุดที่ต้องปรับจังหวะ',
  verdict: 'ความสัมพันธ์ไปต่อได้เมื่อคุยความต้องการให้ชัด',
  chemistry: 'ทั้งคู่ช่วยเปิดมุมมองใหม่ให้กัน',
  caution: 'ถ้ารีบสรุปจากความเงียบ อาจเข้าใจกันคลาดเคลื่อน',
  advice: 'ใช้คำถามที่ตอบได้ตรง ๆ เพื่อเปิดพื้นที่ให้อีกฝ่าย',
};

const newContent: CompatibilityStructuredContent = {
  ...savedV2Content,
  nextSteps: {
    action: 'เย็นวันศุกร์ ลองชวนคุยเรื่องเวลาที่สะดวกติดต่อกัน',
    conversationStarter: 'เราอยากคุยกันให้ลงตัวขึ้น เธอสะดวกคุยช่วงไหนบ้าง',
    watchFor: 'อีกฝ่ายบอกช่วงเวลาที่สะดวกหรือเสนอทางเลือกอื่นที่ชัดเจน',
  },
};

function renderReading(content: CompatibilityStructuredContent, relationshipType?: RelationshipType) {
  return renderToStaticMarkup(
    <CompatibilityReading
      score={72}
      analysis={JSON.stringify(content)}
      structuredContent={content}
      relationshipType={relationshipType}
    />,
  );
}

describe('CompatibilityReading next steps', () => {
  test('keeps saved v2 content compact when next steps are absent', () => {
    const html = renderReading(savedV2Content, 'romantic');

    expect(html).not.toContain('ลองทำต่อจากนี้');
    expect(html).not.toContain('<details');
  });

  test.each([
    ['romantic', 'จังหวะความรัก'],
    ['talking', 'จังหวะที่คุยกัน'],
    ['friend', 'จังหวะของมิตรภาพ'],
    ['boss', 'จังหวะทำงานร่วมกัน'],
    ['coworker', 'เรื่องที่ควรแบ่งให้ชัด'],
    ['family', 'วิธีวางขอบเขตด้วยความเคารพ'],
  ] as const)('renders focused %s headings with collapsed supporting guidance', (relationshipType, heading) => {
    const html = renderReading(newContent, relationshipType);

    expect(html).toContain(heading);
    expect(html).toContain('ลองทำต่อจากนี้');
    expect(html).toContain(newContent.nextSteps!.action);
    expect(html).toContain(newContent.nextSteps!.conversationStarter);
    expect(html).toContain(newContent.nextSteps!.watchFor);
    expect(html).toContain('<details');
    expect(html).not.toContain('<details open');
  });
});
