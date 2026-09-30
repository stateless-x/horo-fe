import type { RelationshipType } from '@/lib-packages/shared';
import type { ReportSectionId } from './report-copy';

/**
 * The small paid-door promise is deliberately separate from generated report
 * prose. It lets every relationship type keep its own useful next step while
 * the payment state only changes the CTA treatment.
 */
export type UnlockPresentationState = 'balance' | 'short' | 'generating';

type UnlockPresentationCopy = {
  headline: string;
  support: string;
  outcomes: readonly [string, string, string];
};

export type UnlockPresentation = UnlockPresentationCopy & {
  artSection: ReportSectionId;
  ctaKind: 'spend' | 'topUp' | 'waiting';
  status: string | null;
};

const COPY: Record<RelationshipType, UnlockPresentationCopy> = {
  romantic: {
    headline: 'เข้าใจเขา เข้าใจเรา แล้วคุยกันได้ง่ายขึ้น',
    support: 'คำอ่านนี้ช่วยเห็นทั้งจุดที่เข้ากัน และเรื่องที่ควรค่อย ๆ คุยกัน',
    outcomes: ['เห็นว่าต่างคนต่างต้องการอะไรเวลาอยู่ด้วยกัน', 'รู้ว่าจะเริ่มคุยเรื่องค้างใจแบบไหน', 'เลือกจังหวะดูแลความสัมพันธ์ที่พอดีกับคู่นี้'],
  },
  talking: {
    headline: 'รู้จังหวะว่าจะคุยต่อยังไง โดยไม่ต้องรีบ',
    support: 'คำอ่านนี้ช่วยให้รู้จักกันเพิ่มขึ้น โดยยังเป็นตัวเองได้ทั้งคู่',
    outcomes: ['เห็นว่าแต่ละคนค่อย ๆ เปิดใจแบบไหน', 'มีทางชวนคุยต่อโดยไม่กดดันกัน', 'รู้จังหวะที่เหมาะจะค่อย ๆ ขยับความสัมพันธ์'],
  },
  friend: {
    headline: 'รักษาความเป็นเพื่อน โดยไม่ต้องฝืนกัน',
    support: 'คำอ่านนี้ช่วยให้เห็นพื้นที่ที่ต่างคนต่างต้องการ และวิธีอยู่ข้างกันแบบสบายใจ',
    outcomes: ['เข้าใจความต่างที่ทำให้เป็นเพื่อนกันได้ดี', 'รู้วิธีคุยเรื่องค้างใจให้นุ่มลง', 'เลือกจังหวะดูแลมิตรภาพโดยไม่ต้องฝืนเหมือนเดิม'],
  },
  boss: {
    headline: 'เข้าใจสไตล์เขา แล้วทำงานให้ลงตัวขึ้น',
    support: 'คำอ่านนี้ช่วยให้เห็นวิธีคิดเรื่องงาน และจังหวะคุยที่ทำให้ร่วมงานกันง่ายขึ้น',
    outcomes: ['เห็นสิ่งที่หัวหน้าให้ความสำคัญเวลาเลือกทางเดิน', 'รู้วิธีเสนอความเห็นให้ชัดและสุภาพ', 'เลือกจังหวะจัดการเรื่องงานที่ยังไม่ลงตัว'],
  },
  coworker: {
    headline: 'คุยงานให้ชัด แล้วทำงานด้วยกันให้ลื่นขึ้น',
    support: 'คำอ่านนี้ช่วยให้เห็นสไตล์ที่ต่างกัน แล้วปรับงานเข้าหากันโดยไม่ต้องเดา',
    outcomes: ['เห็นว่าแต่ละคนถนัดและให้ความสำคัญกับอะไร', 'รู้วิธีคุยเรื่องงานที่ยังไม่ลงตัว', 'เลือกจังหวะแบ่งงานและเดินต่อให้เข้ากัน'],
  },
  family: {
    headline: 'เข้าใจกันมากขึ้น โดยยังมีพื้นที่ของตัวเอง',
    support: 'คำอ่านนี้ช่วยให้เห็นสิ่งที่แต่ละคนต้องการ แล้วคุยกันอย่างสบายใจกว่าเดิม',
    outcomes: ['เข้าใจว่าความใส่ใจแบบไหนทำให้แต่ละคนสบายใจ', 'รู้วิธีพูดเรื่องค้างใจโดยไม่กดดันกัน', 'เลือกจังหวะอยู่ใกล้หรือให้พื้นที่กันได้พอดี'],
  },
};

/** Stable adapter for the report door. Future coupon support adds one state here, not conditionals throughout the UI. */
export function unlockPresentation(
  type: RelationshipType | undefined,
  intent: ReportSectionId | undefined,
  state: UnlockPresentationState,
): UnlockPresentation {
  const copy = COPY[type ?? 'romantic'];
  const artSection = intent ?? 'overview';
  if (state === 'short') return { ...copy, artSection, ctaKind: 'topUp', status: null };
  if (state === 'generating') return { ...copy, artSection, ctaKind: 'waiting', status: 'กำลังเตรียมคำตอบให้คุณ' };
  return { ...copy, artSection, ctaKind: 'spend', status: null };
}
