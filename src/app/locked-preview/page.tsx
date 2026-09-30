'use client';

import { CompatibilityReport } from '@/features/compatibility/compatibility-report';
import { CompatibilityHistoryList } from '@/features/compatibility/compatibility-history';
import { useState } from 'react';
import { RELATIONSHIP_LABELS, RELATIONSHIP_TYPES, type CompatibilityV4Teaser, type RelationshipType } from '@/lib-packages/shared/types/compatibility';

const content: CompatibilityV4Teaser = {
  contentVersion: 4,
  generatedOn: '2026-09-29',
  archetype: { key: 'fire-metal', name: 'คู่ไฟหลอมทอง', tagline: 'ต่างกัน แต่เติมสิ่งที่อีกคนไม่มีได้' },
  people: { reader: { element: 'metal', yinYang: 'yang' }, partner: { element: 'fire', yinYang: 'yin' } },
  readingMinutes: 11,
  dimensions: [
    { key: 'chemistry', label: 'เคมี', score: 82 },
    { key: 'communication', label: 'การสื่อสาร', score: 64 },
    { key: 'trust', label: 'ความไว้ใจ', score: 71 },
    { key: 'rhythm', label: 'จังหวะชีวิต', score: 43 },
  ],
  cover: {
    verdict: 'คุณกับต้นมีมุมที่เติมกันได้ดี แค่ต้องให้พื้นที่กับวิธีคิดที่ต่างกัน',
    lockedHints: [
      { text: 'ต้นเงียบเพราะอยากมีพื้นที่ หรือมีอะไรค้างใจ', chapter: 'partner' },
      { text: 'จะบอกความรู้สึกยังไงให้ต้นเข้าใจ โดยไม่ต้องเดา', chapter: 'communication' },
      { text: 'อะไรช่วยให้คุณสองคนอยู่ด้วยกันได้สบายใจขึ้น', chapter: 'friction' },
    ],
  },
};

export default function LockedPreviewPage() {
  const [type, setType] = useState<RelationshipType>('romantic');
  const [historySelection, setHistorySelection] = useState<string | null>(null);
  if (process.env.NODE_ENV !== 'development') return null;
  const work = type === 'boss' || type === 'coworker';
  const previewContent: CompatibilityV4Teaser = work ? {
    ...content,
    cover: {
      verdict: 'คุณกับต้นช่วยเติมกันเรื่องงานได้ แต่มีวิธีคิดและตัดสินใจต่างกัน ลองคุยให้ชัดว่าแต่ละคนคาดหวังอะไร',
      lockedHints: [
        { text: 'ต้นให้ความสำคัญกับอะไรเวลาตัดสินใจเรื่องงาน', chapter: 'partner' },
        { text: 'จะคุยเรื่องที่เห็นต่างยังไงให้ชัดและสุภาพ', chapter: 'communication' },
        { text: 'อะไรช่วยให้ทำงานด้วยกันได้สบายใจขึ้น', chapter: 'friction' },
      ],
    },
  } : content;
  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <p className="mb-3 text-sm text-inkMuted">พรีวิวหน้าล็อก · ข้อมูลตัวอย่าง ไม่ใช่คำอ่านจากดวงจริง</p>
      <fieldset className="mb-8">
        <legend className="mb-3 font-heading font-semibold text-ink">เลือกประเภทที่อยากดู</legend>
        <div className="flex flex-wrap gap-2">
          {RELATIONSHIP_TYPES.map((value) => (
            <label key={value} className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm ${type === value ? 'border-accentBright bg-accentBright/10 text-ink' : 'border-edge bg-surface text-inkMuted'}`}>
              <input type="radio" name="preview-type" value={value} checked={type === value} onChange={() => setType(value)} className="accent-accentBright" />
              {RELATIONSHIP_LABELS[value]}
            </label>
          ))}
        </div>
        <a href="#report-unlock-section" className="mt-4 inline-block rounded-lg py-2 text-sm text-ink underline underline-offset-4">ดูพรีวิวฉบับเต็มด้านล่าง</a>
      </fieldset>
      <section id="history-preview" className="mb-12 max-w-2xl scroll-mt-6" aria-labelledby="history-preview-title">
        <h1 id="history-preview-title" className="font-heading text-xl font-semibold text-ink">ดวงคู่ที่เคยดู</h1>
        <p className="mb-4 mt-2 text-sm text-inkMuted">ตัวอย่างการ์ดพรีวิวและฉบับเต็ม ไม่ได้บันทึกในประวัติจริง</p>
        <CompatibilityHistoryList
          items={[
            { id: 'preview-locked', partnerName: 'ต้น', partnerBirthDate: '1996-01-01', relationshipType: type, score: 72, locked: true, createdAt: '2026-09-29T10:00:00.000Z' },
            { id: 'preview-full', partnerName: 'มายด์', partnerBirthDate: '1996-01-01', relationshipType: type, score: 78, locked: false, createdAt: '2026-09-28T10:00:00.000Z' },
          ]}
          onViewHistory={(id) => {
            setHistorySelection(id);
            if (id === 'preview-locked') document.getElementById('report-unlock-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
        />
        {historySelection === 'preview-full' && <p role="status" className="mt-3 text-sm text-inkMuted">การ์ดฉบับเต็มจะเปิดรายงานที่อ่านได้ครบโดยไม่ต้องปลดล็อกอีก นี่เป็นตัวอย่างหน้าตาการ์ดเท่านั้น</p>}
      </section>
      <CompatibilityReport key={type} score={72} content={previewContent} relationshipType={type} readerName="คุณ" partnerName="ต้น" onUnlock={() => {}} />
    </main>
  );
}
