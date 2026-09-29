import type { RelationshipType } from '@/lib-packages/shared';

/** The stable section keys used by report URLs, navigation, copy and visual cues. */
export const REPORT_SECTION_IDS = ['overview', 'people', 'conversation', 'next'] as const;
export type ReportSectionId = (typeof REPORT_SECTION_IDS)[number];
type ScoreBand = 'careful' | 'findingRhythm' | 'flowing';

type Moment = { title: string; detail: string };

export type PlanFrame = {
  title: string;
  sub: string;
  prompt: string;
  helper: string;
  moments: readonly Moment[];
};

export type ConversationFrame = {
  title: string;
  helper: string;
  open: { tag: string; title: string; detail: string };
  tension: { tag: string; title: string; detail: string };
};

/** Copy that appears both in the navigation and in the focused report panel. */
export type ReportSectionCopy = {
  /** Full, descriptive section name for accessibility and desktop context. */
  label: string;
  title: string;
  description: string;
};

export type RelationshipReportCopy = {
  sections: Record<ReportSectionId, ReportSectionCopy>;
  overviewAction: { tag: string; title: string; detail: string };
  peopleActions: {
    partner: { tag: string; title: string; detail: string };
    reader: { tag: string; title: string; detail: string };
  };
  nextActions: {
    future: { tag: string; title: string; detail: string };
    calendar: { tag: string; title: string; detail: string };
    plan: { tag: string; title: string; detail: string };
  };
  conversation: ConversationFrame;
  plan: Record<ScoreBand, PlanFrame>;
};

/**
 * The paid door has its own small promise. It stays specific to the kind of
 * relationship without repeating a whole report section or assuming romance
 * in work, friendship, or family readings.
 */
export type LockedOfferCopy = {
  title: string;
  description: string;
  values: readonly [
    { title: string; detail: string },
    { title: string; detail: string },
    { title: string; detail: string },
    { title: string; detail: string },
  ];
};

const LOCKED_OFFER_COPY: Record<RelationshipType, LockedOfferCopy> = {
  romantic: {
    title: 'เห็นทางของความสัมพันธ์นี้ให้ชัดขึ้น',
    description: 'คำตอบฉบับเต็มเรียงให้เห็นใจของทั้งคู่ เรื่องที่ควรคุย และจังหวะที่เหมาะกับตอนนี้',
    values: [
      { title: 'อ่านนิสัยกันให้ชัด', detail: 'เห็นสิ่งที่แต่ละคนให้ความสำคัญเวลาอยู่ด้วยกัน' },
      { title: 'คุยเรื่องยากให้ง่ายขึ้น', detail: 'มีทั้งเรื่องที่ควรเริ่มและวิธีเปิดบทสนทนา' },
      { title: 'ดูจังหวะ 3 เดือนล่วงหน้า', detail: 'รู้ช่วงที่เหมาะจะขยับและช่วงที่ควรใจเย็น' },
      { title: 'เลือกก้าวต่อไปที่พอดี', detail: 'คำแนะนำเฉพาะคู่นี้ เลือกลองทีละอย่างได้' },
    ],
  },
  talking: {
    title: 'ดูจังหวะที่เหมาะกับการคุยต่อ',
    description: 'คำตอบฉบับเต็มช่วยให้เห็นว่าทั้งคู่เปิดใจแบบไหน คุยอะไรต่อได้ และไม่ต้องรีบให้คำตอบ',
    values: [
      { title: 'อ่านนิสัยกันให้ชัด', detail: 'เห็นจังหวะที่แต่ละคนเปิดใจและต้องการพื้นที่' },
      { title: 'คุยต่อแบบไม่กดดัน', detail: 'มีเรื่องที่ควรเริ่มและประโยคที่ช่วยให้คุยลื่นขึ้น' },
      { title: 'ดูจังหวะ 3 เดือนล่วงหน้า', detail: 'รู้ช่วงที่เหมาะจะขยับและช่วงที่ควรค่อย ๆ ดูใจ' },
      { title: 'เลือกก้าวต่อไปที่พอดี', detail: 'คำแนะนำเฉพาะคู่นี้ เลือกลองทีละอย่างได้' },
    ],
  },
  friend: {
    title: 'รักษามิตรภาพให้สบายใจทั้งสองฝ่าย',
    description: 'คำตอบฉบับเต็มช่วยให้เห็นพื้นที่ที่แต่ละคนต้องการ และวิธีคุยที่ไม่ทำให้ห่างกัน',
    values: [
      { title: 'อ่านนิสัยกันให้ชัด', detail: 'เห็นสิ่งที่แต่ละคนให้ความสำคัญในมิตรภาพ' },
      { title: 'คุยเรื่องค้างใจให้นุ่มลง', detail: 'มีเรื่องที่ควรเริ่มและวิธีพูดที่ไม่ทำให้ห่างกัน' },
      { title: 'ดูจังหวะ 3 เดือนล่วงหน้า', detail: 'รู้ช่วงที่เหมาะจะคุยและช่วงที่ควรให้พื้นที่กัน' },
      { title: 'เลือกก้าวต่อไปที่พอดี', detail: 'คำแนะนำเฉพาะคู่นี้ เลือกลองทีละอย่างได้' },
    ],
  },
  boss: {
    title: 'ทำงานกับเขาให้ลื่นขึ้น',
    description: 'คำตอบฉบับเต็มช่วยให้เห็นสไตล์การทำงานที่ต่างกัน เรื่องที่ควรเคลียร์ และจังหวะที่เหมาะกับงาน',
    values: [
      { title: 'อ่านสไตล์งานให้ชัด', detail: 'เห็นสิ่งที่แต่ละคนให้ความสำคัญเวลาตัดสินใจ' },
      { title: 'คุยงานให้ตรงประเด็น', detail: 'มีเรื่องที่ควรเริ่มและวิธีเปิดบทสนทนา' },
      { title: 'ดูจังหวะ 3 เดือนล่วงหน้า', detail: 'รู้ช่วงที่เหมาะจะขยับและช่วงที่ควรทบทวนก่อน' },
      { title: 'เลือกก้าวต่อไปที่พอดี', detail: 'คำแนะนำเฉพาะคู่นี้ เลือกลองทีละอย่างได้' },
    ],
  },
  coworker: {
    title: 'ทำงานด้วยกันให้ลื่นขึ้น',
    description: 'คำตอบฉบับเต็มช่วยให้เห็นสไตล์การทำงานที่ต่างกัน เรื่องที่ควรเคลียร์ และจังหวะที่เหมาะกับงาน',
    values: [
      { title: 'อ่านสไตล์งานให้ชัด', detail: 'เห็นสิ่งที่แต่ละคนให้ความสำคัญเวลาทำงานร่วมกัน' },
      { title: 'คุยงานให้ตรงประเด็น', detail: 'มีเรื่องที่ควรเริ่มและวิธีเปิดบทสนทนา' },
      { title: 'ดูจังหวะ 3 เดือนล่วงหน้า', detail: 'รู้ช่วงที่เหมาะจะขยับและช่วงที่ควรทบทวนก่อน' },
      { title: 'เลือกก้าวต่อไปที่พอดี', detail: 'คำแนะนำเฉพาะคู่นี้ เลือกลองทีละอย่างได้' },
    ],
  },
  family: {
    title: 'อยู่ด้วยกันให้สบายใจขึ้น',
    description: 'คำตอบฉบับเต็มช่วยให้เห็นสิ่งที่แต่ละคนต้องการ และวิธีคุยที่ช่วยให้บ้านมีพื้นที่หายใจ',
    values: [
      { title: 'อ่านนิสัยกันให้ชัด', detail: 'เห็นสิ่งที่แต่ละคนต้องการเวลาอยู่ในบ้าน' },
      { title: 'คุยเรื่องค้างใจให้นุ่มลง', detail: 'มีเรื่องที่ควรเริ่มและวิธีพูดที่ไม่ทำให้ใครตั้งการ์ด' },
      { title: 'ดูจังหวะ 3 เดือนล่วงหน้า', detail: 'รู้ช่วงที่เหมาะจะคุยและช่วงที่ควรให้พื้นที่กัน' },
      { title: 'เลือกก้าวต่อไปที่พอดี', detail: 'คำแนะนำเฉพาะคู่นี้ เลือกลองทีละอย่างได้' },
    ],
  },
};

export function lockedOfferCopy(type?: RelationshipType): LockedOfferCopy {
  return LOCKED_OFFER_COPY[type ?? 'romantic'];
}

const commonMoments = {
  closeness: [
    { title: 'อยู่ใกล้กันแบบไม่กดดัน', detail: 'ให้ความเงียบมีพื้นที่ โดยยังอยู่ข้างกัน' },
    { title: 'บอกสิ่งที่ต้องการแบบนุ่ม ๆ', detail: 'พูดความต้องการของเรา โดยไม่โยนความผิด' },
    { title: 'คุยเรื่องเดียวให้ชัด', detail: 'หยิบแค่เรื่องเดียวมาคุยให้จบ' },
  ],
  gettingToKnow: [
    { title: 'คุยต่อแบบไม่ต้องรีบ', detail: 'ให้ทั้งคู่ได้รู้จักกันทีละนิด' },
    { title: 'บอกจังหวะที่เราสบายใจ', detail: 'ชัดเจนแบบไม่ต้องเร่งคำตอบ' },
    { title: 'ถามเรื่องเล็กที่อยากรู้จริง ๆ', detail: 'คุยเพื่อเข้าใจ ไม่ใช่เพื่อจับผิด' },
  ],
  friendship: [
    { title: 'อยู่ด้วยกันแบบสบายใจ', detail: 'ให้มิตรภาพมีพื้นที่โดยไม่ต้องฝืน' },
    { title: 'บอกความรู้สึกตรง ๆ แบบนุ่ม ๆ', detail: 'พูดเพื่อรักษาความเป็นเพื่อนของกันและกัน' },
    { title: 'เคลียร์เรื่องเดียวก่อน', detail: 'ให้เรื่องค้างใจไม่กลายเป็นระยะห่าง' },
  ],
  work: [
    { title: 'ตั้งจังหวะคุยงานให้ชัด', detail: 'เลือกช่วงที่ทั้งคู่พร้อมฟังและตัดสินใจ' },
    { title: 'บอกสิ่งที่ต้องการจากงาน', detail: 'พูดให้ตรงประเด็น โดยไม่โยนความผิด' },
    { title: 'เคลียร์งานเดียวให้จบ', detail: 'ทำให้สิ่งสำคัญตรงกันก่อนเดินต่อ' },
  ],
  family: [
    { title: 'อยู่ใกล้กันแบบไม่กดดัน', detail: 'ให้บ้านมีพื้นที่ที่ทุกคนหายใจได้' },
    { title: 'บอกความต้องการแบบใจเย็น', detail: 'พูดจากสิ่งที่เรารู้สึก โดยไม่ตัดสินกัน' },
    { title: 'คุยเรื่องเดียวให้ชัด', detail: 'ให้เรื่องค้างใจไม่พอกขึ้นในบ้าน' },
  ],
} as const;

const romantic: RelationshipReportCopy = {
  sections: {
    overview: { label: 'ทำไมถึงใช่', title: 'ทำไมถึงเป็นคู่นี้', description: 'จุดที่ดึงกันเข้ามา และจุดที่ทำให้ใช่' },
    people: { label: 'อ่านนิสัยเขา', title: 'นิสัยเขา นิสัยเรา', description: 'สิ่งที่เขามักทำแบบนั้น และทำไมคุณถึงเป็นแบบนี้' },
    conversation: { label: 'คุยให้เข้าใจกัน', title: 'อยากให้เข้าใจกัน เริ่มคุยยังไงดี', description: 'เลือกจังหวะที่ตรงกับตอนนี้ แล้วหยิบวิธีคุยไปใช้ได้เลย' },
    next: { label: 'ไปต่อยังไงดี', title: 'ไปต่อ หรือพอแค่นี้', description: 'สัญญาณที่บอกว่าควรลุยหรือควรถอย' },
  },
  overviewAction: { tag: 'มองให้ลึกขึ้น', title: 'ดูแรงดึงดูด', detail: 'เข้าใจจุดที่ทำให้รู้สึกพิเศษต่อกัน' },
  peopleActions: {
    partner: { tag: 'ดูเขาก่อน', title: 'เขาเป็นคนแบบไหน', detail: 'เวลาอยู่ในความสัมพันธ์และต้องการพื้นที่' },
    reader: { tag: 'กลับมาดูใจเรา', title: 'เราเป็นยังไงเวลาอิน', detail: 'เข้าใจสิ่งที่เราให้ความสำคัญในความสัมพันธ์' },
  },
  nextActions: {
    future: { tag: 'กำลังชั่งใจ', title: 'ไปต่อดีไหม', detail: 'มีอะไรให้ดูก่อนตัดสินใจต่อ' },
    calendar: { tag: 'อยากดูจังหวะ', title: 'เดือนไหนค่อยขยับ', detail: 'เช็กจังหวะ 3 เดือนข้างหน้า' },
    plan: { tag: 'พร้อมลองขยับ', title: 'เริ่มอะไรได้บ้าง', detail: 'หยิบหนึ่งอย่างที่ทำได้จริง' },
  },
  conversation: {
    title: 'ตอนนี้คุณอยู่ตรงไหน', helper: 'เลือกแล้วดูวิธีต่อได้เลย',
    open: { tag: 'มีเรื่องอยากคุย', title: 'เริ่มคุยตอนใจยังเปิด', detail: 'หยิบประโยคแรกที่ไม่ทำให้อีกฝ่ายตั้งการ์ด' },
    tension: { tag: 'เริ่มรู้สึกตึง', title: 'ลดแรงก่อน แล้วค่อยคุย', detail: 'ดูวิธีกลับมาคุย โดยไม่ต้องรีบหาคนผิด' },
  },
  plan: {
    careful: { title: 'ค่อย ๆ หาจังหวะที่สบายใจ', sub: 'เลือกหนึ่งอย่างที่พอไหวสำหรับตอนนี้', prompt: 'ตอนนี้อยากดูแลใจตัวเองตรงไหน', helper: 'ไม่ต้องรีบทำให้ทุกอย่างดีขึ้น เลือกเรื่องที่อยากเริ่มได้เลย', moments: commonMoments.closeness },
    findingRhythm: { title: 'ค่อย ๆ จูนจังหวะกัน', sub: 'เลือกหนึ่งอย่างที่อยากลอง เมื่อรู้สึกพร้อม', prompt: 'ตอนนี้อยากดูแลความสัมพันธ์แบบไหน', helper: 'ไม่ต้องรีบแก้ทุกอย่างพร้อมกัน เลือกเรื่องที่คุณอยากเริ่มได้เลย', moments: commonMoments.closeness },
    flowing: { title: 'ต่อยอดสิ่งที่เข้ากัน', sub: 'เลือกหนึ่งอย่างที่ช่วยให้ความสัมพันธ์ไปต่ออย่างสบายใจ', prompt: 'ตอนนี้อยากเติมอะไรให้ความสัมพันธ์', helper: 'เลือกเรื่องเล็กที่ทำให้สิ่งดี ๆ ระหว่างกันชัดขึ้นได้เลย', moments: commonMoments.closeness },
  },
};

const talking: RelationshipReportCopy = {
  ...romantic,
  sections: {
    overview: { label: 'ทำไมถึงรู้สึกพิเศษ', title: 'ทำไมถึงยังอยากรู้จักกัน', description: 'จุดที่ทำให้คุยกันแล้วรู้สึกพิเศษ' },
    people: { label: 'อ่านนิสัยเขา', title: 'นิสัยเขา นิสัยเรา', description: 'จังหวะที่แต่ละคนเปิดใจและต้องการพื้นที่' },
    conversation: { label: 'คุยให้เข้าใจกัน', title: 'อยากคุยต่อ เริ่มยังไงดี', description: 'เลือกจังหวะที่ตรงกับตอนนี้ แล้วคุยกันแบบไม่ต้องรีบ' },
    next: { label: 'ไปต่อยังไงดี', title: 'ค่อย ๆ ดูใจกันต่อไหม', description: 'สัญญาณที่ช่วยให้เลือกจังหวะของคู่นี้' },
  },
  overviewAction: { tag: 'มองให้ลึกขึ้น', title: 'ดูสิ่งที่ทำให้รู้สึกดี', detail: 'เข้าใจจุดที่ทำให้ยังอยากคุยกันต่อ' },
  nextActions: {
    future: { tag: 'กำลังดูใจ', title: 'คุยต่อดีไหม', detail: 'มีอะไรให้ดูก่อนรีบให้คำตอบ' },
    calendar: { tag: 'อยากดูจังหวะ', title: 'เดือนไหนค่อยขยับ', detail: 'เช็กจังหวะ 3 เดือนข้างหน้า' },
    plan: { tag: 'อยากเริ่มเบา ๆ', title: 'ลองอะไรได้บ้าง', detail: 'หยิบหนึ่งอย่างที่ไม่กดดันกัน' },
  },
  plan: {
    careful: { title: 'ค่อย ๆ ดูใจให้สบาย', sub: 'เลือกหนึ่งอย่างที่ไม่ต้องเร่งคำตอบ', prompt: 'ตอนนี้อยากให้การคุยกันเป็นแบบไหน', helper: 'เลือกเรื่องเล็กที่ช่วยให้ทั้งคู่สบายใจขึ้นได้เลย', moments: commonMoments.gettingToKnow },
    findingRhythm: { title: 'ค่อย ๆ ดูใจกันให้ชัด', sub: 'เลือกหนึ่งอย่างที่อยากลอง เมื่อรู้สึกพร้อม', prompt: 'ตอนนี้อยากให้การคุยกันไปทางไหน', helper: 'ไม่ต้องรีบทำให้ชัดทุกอย่าง เลือกเรื่องที่อยากเริ่มได้เลย', moments: commonMoments.gettingToKnow },
    flowing: { title: 'ต่อยอดการคุยที่สบายใจ', sub: 'เลือกหนึ่งอย่างที่ช่วยให้รู้จักกันมากขึ้น', prompt: 'ตอนนี้อยากเติมอะไรให้การคุยกัน', helper: 'เลือกเรื่องเล็กที่ทำให้ได้เห็นกันชัดขึ้นได้เลย', moments: commonMoments.gettingToKnow },
  },
};

const friend: RelationshipReportCopy = {
  ...romantic,
  sections: {
    overview: { label: 'ทำไมถึงคลิกกัน', title: 'อะไรทำให้เป็นเพื่อนกันได้ดี', description: 'จุดที่อยู่ด้วยกันแล้วสบายใจ และจุดที่ควรเข้าใจกัน' },
    people: { label: 'นิสัยเราสองคน', title: 'นิสัยเราสองคน', description: 'สิ่งที่แต่ละคนให้ความสำคัญในมิตรภาพ' },
    conversation: { label: 'คุยกันให้สบายใจ', title: 'อยากให้เข้าใจกัน เริ่มคุยยังไงดี', description: 'เลือกจังหวะที่ตรงกับตอนนี้ แล้วคุยโดยไม่ทำให้ห่างกัน' },
    next: { label: 'ดูแลมิตรภาพ', title: 'ไปต่อแบบเพื่อนที่สบายใจ', description: 'สัญญาณที่ช่วยให้รักษาระยะของกันและกัน' },
  },
  overviewAction: { tag: 'มองให้ลึกขึ้น', title: 'ดูจุดที่เข้ากัน', detail: 'เข้าใจสิ่งที่ทำให้เป็นเพื่อนกันได้ดี' },
  peopleActions: {
    partner: { tag: 'ดูเขาก่อน', title: 'เขาเป็นเพื่อนแบบไหน', detail: 'เวลาไว้ใจใครและต้องการพื้นที่' },
    reader: { tag: 'กลับมาดูเรา', title: 'เราเป็นเพื่อนแบบไหน', detail: 'เข้าใจสิ่งที่เราต้องการจากมิตรภาพ' },
  },
  nextActions: {
    future: { tag: 'อยากรักษากันไว้', title: 'ไปต่อแบบไหนสบายใจ', detail: 'มีอะไรให้ดูก่อนปล่อยให้ห่างกัน' },
    calendar: { tag: 'อยากดูจังหวะ', title: 'เดือนไหนค่อยคุย', detail: 'เช็กจังหวะ 3 เดือนข้างหน้า' },
    plan: { tag: 'อยากเริ่มเบา ๆ', title: 'ทำอะไรให้ดีขึ้น', detail: 'หยิบหนึ่งอย่างที่ดูแลมิตรภาพได้' },
  },
  conversation: {
    title: 'ตอนนี้อยากให้มิตรภาพเป็นแบบไหน', helper: 'เลือกแล้วดูวิธีต่อได้เลย',
    open: { tag: 'มีเรื่องอยากคุย', title: 'เริ่มคุยแบบไม่ทำให้ห่าง', detail: 'หยิบประโยคแรกที่ทั้งตรงและยังอ่อนโยน' },
    tension: { tag: 'เริ่มรู้สึกค้างใจ', title: 'ลดแรงก่อน แล้วค่อยคุย', detail: 'ดูวิธีกลับมาคุยโดยไม่ต้องรีบหาคนผิด' },
  },
  plan: {
    careful: { title: 'ค่อย ๆ รักษาพื้นที่สบายใจ', sub: 'เลือกหนึ่งอย่างที่ไม่ฝืนทั้งคุณและเขา', prompt: 'ตอนนี้อยากดูแลมิตรภาพตรงไหน', helper: 'ไม่ต้องรีบกลับไปเหมือนเดิม เลือกเรื่องเล็กที่พอไหวได้เลย', moments: commonMoments.friendship },
    findingRhythm: { title: 'ค่อย ๆ จูนความสบายใจ', sub: 'เลือกหนึ่งอย่างที่อยากลอง เมื่อรู้สึกพร้อม', prompt: 'ตอนนี้อยากดูแลมิตรภาพแบบไหน', helper: 'ไม่ต้องแก้ทุกอย่างพร้อมกัน เลือกเรื่องที่อยากเริ่มได้เลย', moments: commonMoments.friendship },
    flowing: { title: 'ต่อยอดมิตรภาพที่ดี', sub: 'เลือกหนึ่งอย่างที่ช่วยให้เป็นเพื่อนกันได้สบายขึ้น', prompt: 'ตอนนี้อยากเติมอะไรให้มิตรภาพ', helper: 'เลือกเรื่องเล็กที่ทำให้สิ่งดี ๆ ระหว่างกันชัดขึ้นได้เลย', moments: commonMoments.friendship },
  },
};

const workBase: RelationshipReportCopy = {
  ...romantic,
  sections: {
    overview: { label: 'ทำงานด้วยกันไหวไหม', title: 'จังหวะงานของเราสองคน', description: 'จุดที่ทำงานเข้ากัน และจุดที่ต้องคุยให้ชัด' },
    people: { label: 'สไตล์การทำงาน', title: 'สไตล์เขา สไตล์เรา', description: 'สิ่งที่แต่ละคนให้ความสำคัญเวลาทำงานร่วมกัน' },
    conversation: { label: 'คุยงานให้เข้าใจ', title: 'อยากให้งานลื่นขึ้น เริ่มคุยยังไงดี', description: 'เลือกจังหวะที่ตรงกับตอนนี้ แล้วหยิบวิธีคุยไปใช้ได้เลย' },
    next: { label: 'ทำงานต่อยังไงดี', title: 'ทำงานร่วมกันให้ลื่นขึ้น', description: 'สัญญาณที่ช่วยให้เลือกจังหวะคุยและขยับงาน' },
  },
  overviewAction: { tag: 'มองให้ลึกขึ้น', title: 'ดูจุดที่ทำงานเข้ากัน', detail: 'เข้าใจสิ่งที่ช่วยให้ทำงานร่วมกันลื่นขึ้น' },
  peopleActions: {
    partner: { tag: 'ดูเขาก่อน', title: 'เขาทำงานแบบไหน', detail: 'เวลาเร่งงาน ตัดสินใจ และต้องการพื้นที่' },
    reader: { tag: 'กลับมาดูเรา', title: 'เราทำงานแบบไหน', detail: 'เข้าใจสิ่งที่เราต้องการจากการทำงานร่วมกัน' },
  },
  nextActions: {
    future: { tag: 'กำลังชั่งใจ', title: 'ปรับตรงไหนก่อนดี', detail: 'มีอะไรให้ดูก่อนตัดสินใจเรื่องงาน' },
    calendar: { tag: 'อยากดูจังหวะ', title: 'เดือนไหนค่อยคุย', detail: 'เช็กจังหวะ 3 เดือนข้างหน้า' },
    plan: { tag: 'พร้อมลองขยับ', title: 'เริ่มปรับอะไรได้บ้าง', detail: 'หยิบหนึ่งอย่างที่ทำให้งานลื่นขึ้น' },
  },
  conversation: {
    title: 'ตอนนี้งานติดตรงไหน', helper: 'เลือกแล้วดูวิธีต่อได้เลย',
    open: { tag: 'มีเรื่องอยากเคลียร์', title: 'เริ่มคุยก่อนงานค้างใจ', detail: 'เรียงสิ่งที่อยากให้เข้าใจก่อนเข้าประเด็น' },
    tension: { tag: 'เริ่มตึงเรื่องงาน', title: 'พักแรงก่อน แล้วค่อยคุย', detail: 'คุยเรื่องงานโดยไม่ทำให้กลายเป็นเรื่องส่วนตัว' },
  },
  plan: {
    careful: { title: 'ค่อย ๆ หาจังหวะทำงานที่สบายใจ', sub: 'เลือกหนึ่งอย่างที่ช่วยลดแรงตึงในงาน', prompt: 'ตอนนี้อยากให้งานลื่นขึ้นตรงไหน', helper: 'ไม่ต้องแก้ทุกอย่างพร้อมกัน เลือกเรื่องที่พอไหวได้เลย', moments: commonMoments.work },
    findingRhythm: { title: 'ค่อย ๆ จูนวิธีทำงานร่วมกัน', sub: 'เลือกหนึ่งอย่างที่อยากลอง เมื่อรู้สึกพร้อม', prompt: 'ตอนนี้อยากปรับการทำงานตรงไหน', helper: 'ไม่ต้องรีบเปลี่ยนทุกอย่าง เลือกเรื่องที่อยากเริ่มได้เลย', moments: commonMoments.work },
    flowing: { title: 'ต่อยอดจังหวะงานที่เข้ากัน', sub: 'เลือกหนึ่งอย่างที่ช่วยให้งานไปต่ออย่างสบายใจ', prompt: 'ตอนนี้อยากเติมอะไรให้การทำงานร่วมกัน', helper: 'เลือกเรื่องเล็กที่ทำให้สิ่งดี ๆ ระหว่างกันชัดขึ้นได้เลย', moments: commonMoments.work },
  },
};

const boss: RelationshipReportCopy = {
  ...workBase,
  sections: {
    ...workBase.sections,
    overview: { label: 'ทำงานกับหัวหน้าไหวไหม', title: 'จังหวะงานของคุณกับหัวหน้า', description: 'จุดที่ทำงานเข้ากัน และจุดที่ควรคุยให้ชัด' },
    people: { label: 'สไตล์หัวหน้า', title: 'สไตล์หัวหน้า สไตล์คุณ', description: 'สิ่งที่แต่ละคนให้ความสำคัญเวลาทำงานร่วมกัน' },
  },
  peopleActions: {
    partner: { tag: 'ดูหัวหน้าก่อน', title: 'หัวหน้าทำงานแบบไหน', detail: 'เวลาเร่งงาน ตัดสินใจ และต้องการพื้นที่' },
    reader: workBase.peopleActions.reader,
  },
};

const coworker: RelationshipReportCopy = workBase;

const family: RelationshipReportCopy = {
  ...romantic,
  sections: {
    overview: { label: 'ทำไมถึงเป็นแบบนี้', title: 'ความสัมพันธ์ในบ้านของเรา', description: 'สิ่งที่ผูกกันไว้ และจุดที่ควรเข้าใจกันให้มากขึ้น' },
    people: { label: 'นิสัยเขา นิสัยเรา', title: 'นิสัยเขา นิสัยเรา', description: 'สิ่งที่แต่ละคนต้องการเมื่ออยู่ในครอบครัว' },
    conversation: { label: 'คุยกันให้ใจเย็น', title: 'อยากให้เข้าใจกัน เริ่มคุยยังไงดี', description: 'เลือกจังหวะที่ทุกคนพร้อม แล้วหยิบวิธีคุยไปใช้ได้เลย' },
    next: { label: 'อยู่ด้วยกันยังไงดี', title: 'อยู่ด้วยกันให้สบายใจขึ้น', description: 'สัญญาณที่ช่วยให้เลือกจังหวะคุยและดูแลกัน' },
  },
  overviewAction: { tag: 'มองให้ลึกขึ้น', title: 'ดูสิ่งที่ผูกกันไว้', detail: 'เข้าใจจุดที่ทำให้ครอบครัวนี้เป็นแบบนี้' },
  peopleActions: {
    partner: { tag: 'ดูเขาก่อน', title: 'เขาต้องการอะไรจากบ้าน', detail: 'เวลาเครียด อ่อนไหว และต้องการพื้นที่' },
    reader: { tag: 'กลับมาดูเรา', title: 'เราต้องการอะไรจากบ้าน', detail: 'เข้าใจสิ่งที่เราให้ความสำคัญในครอบครัว' },
  },
  nextActions: {
    future: { tag: 'กำลังชั่งใจ', title: 'คุยเรื่องไหนก่อนดี', detail: 'มีอะไรให้ดูก่อนตัดสินใจเรื่องสำคัญ' },
    calendar: { tag: 'อยากดูจังหวะ', title: 'เดือนไหนค่อยคุย', detail: 'เช็กจังหวะ 3 เดือนข้างหน้า' },
    plan: { tag: 'อยากเริ่มเบา ๆ', title: 'ทำอะไรให้ดีขึ้น', detail: 'หยิบหนึ่งอย่างที่ช่วยให้บ้านสบายใจขึ้น' },
  },
  conversation: {
    title: 'ตอนนี้อยากให้บ้านเป็นแบบไหน', helper: 'เลือกแล้วดูวิธีต่อได้เลย',
    open: { tag: 'มีเรื่องอยากคุย', title: 'เริ่มคุยตอนทุกคนพร้อม', detail: 'หยิบประโยคแรกที่ไม่ทำให้ใครต้องตั้งการ์ด' },
    tension: { tag: 'เริ่มมีแรงปะทะ', title: 'ลดแรงก่อน แล้วค่อยคุย', detail: 'ดูวิธีกลับมาคุย โดยไม่ต้องรีบหาคนผิด' },
  },
  plan: {
    careful: { title: 'ค่อย ๆ หาพื้นที่ที่สบายใจ', sub: 'เลือกหนึ่งอย่างที่ไม่ฝืนทั้งคุณและคนในบ้าน', prompt: 'ตอนนี้อยากดูแลบรรยากาศในบ้านตรงไหน', helper: 'ไม่ต้องรีบแก้ทุกอย่าง เลือกเรื่องที่พอไหวได้เลย', moments: commonMoments.family },
    findingRhythm: { title: 'ค่อย ๆ อยู่ด้วยกันให้สบายใจ', sub: 'เลือกหนึ่งอย่างที่อยากลอง เมื่อรู้สึกพร้อม', prompt: 'ตอนนี้อยากดูแลความสัมพันธ์ในบ้านแบบไหน', helper: 'ไม่ต้องแก้ทุกอย่างพร้อมกัน เลือกเรื่องที่อยากเริ่มได้เลย', moments: commonMoments.family },
    flowing: { title: 'ต่อยอดพื้นที่ปลอดภัยในบ้าน', sub: 'เลือกหนึ่งอย่างที่ช่วยให้ทุกคนสบายใจขึ้น', prompt: 'ตอนนี้อยากเติมอะไรให้บ้าน', helper: 'เลือกเรื่องเล็กที่ทำให้สิ่งดี ๆ ระหว่างกันชัดขึ้นได้เลย', moments: commonMoments.family },
  },
};

const COPY: Record<RelationshipType, RelationshipReportCopy> = { romantic, talking, friend, boss, coworker, family };

export function relationshipReportCopy(type?: RelationshipType): RelationshipReportCopy {
  return COPY[type ?? 'romantic'];
}

export function planFrameFor(type: RelationshipType | undefined, score: number): PlanFrame {
  const band: ScoreBand = score < 40 ? 'careful' : score < 60 ? 'findingRhythm' : 'flowing';
  return relationshipReportCopy(type).plan[band];
}
