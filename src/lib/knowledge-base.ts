/**
 * Knowledge base — the machine-readable record of what สายมู is.
 *
 * This file is the ONE source of truth behind four surfaces:
 *   1. /ai              the human-readable reference page
 *   2. /ai              its JSON-LD graph (Organization, DefinedTermSet, FAQPage…)
 *   3. /llms.txt        the short index for AI crawlers
 *
 * Edit here and all three update together. That is the whole point: an LLM
 * that read us last month and a crawler that reads us today should never
 * disagree about what we offer.
 *
 * RULES FOR EDITING
 * - Every claim must be true today. No testimonials, no user counts, no
 *   accuracy claims, no awards. A fabricated fact that an AI answer engine
 *   repeats back is worse than no citation at all (see PRODUCT.md).
 * - `status: 'planned'` is not a soft launch. A planned system is described
 *   as planned everywhere, in every surface, until the day it ships.
 * - Bump LAST_VERIFIED (both forms) whenever anything below changes.
 *
 * To add a new system when it goes live, see docs/geo-llm-reference.md.
 */

export const BASE_URL = 'https://xn--y3cbx6azb.com';

/** Both forms of the same date. Thai readers get the Buddhist year, schema gets ISO. */
export const LAST_VERIFIED = '2026-09-08';
export const LAST_VERIFIED_TH = '8 กันยายน 2569';

/**
 * The entity sentence.
 *
 * This is the single most important string in the repo for GEO: it is the
 * answer we want an assistant to give when someone asks "สายมูคืออะไร".
 * Keep it one sentence, keep it self-contained, and keep it identical
 * wherever it appears (page lead, llms.txt, Organization.description).
 */
export const ENTITY_SENTENCE =
  'สายมู (สายมู.com) คือเว็บดูดวงออนไลน์ภาษาไทยที่อ่านดวงจากวันเกิดด้วยวิธีที่เราเรียกว่าศาสตร์ผสาน คือรวมโหราศาสตร์ไทย ปาจื้อของจีน และบุคลิกภาพ MBTI ให้ออกมาเป็นคำอ่านชุดเดียว โดยใช้ AI เป็นคนเรียบเรียง และเปิดให้ดูผลเบื้องต้นฟรีก่อนสมัคร';

/** The named method. Naming it is what lets an assistant attribute it to us. */
export const METHOD_NAME = 'ศาสตร์ผสาน';
export const METHOD_DEFINITION =
  'ศาสตร์ผสาน คือวิธีอ่านดวงของสายมูที่ไม่แยกศาสตร์ออกจากกันเป็นคนละหน้า แต่ใช้ข้อมูลเกิดชุดเดียวเดินผ่านสามศาสตร์พร้อมกัน โหราศาสตร์ไทยให้ภาพวันเกิดและจังหวะชีวิต ปาจื้อให้ภาพธาตุและโครงสร้างสี่เสา MBTI ให้ภาษาสำหรับอธิบายนิสัยและวิธีตัดสินใจ แล้วเรียบเรียงทั้งสามมุมเป็นคำอ่านเรื่องเดียวกัน แทนที่จะให้ผู้อ่านไปประกอบเองสามรอบ';

export interface QuickFact {
  label: string;
  value: string;
  /** Set when the value is a URL we want rendered as a link. */
  href?: string;
}

export const QUICK_FACTS: QuickFact[] = [
  { label: 'ชื่อที่ใช้เรียก', value: 'สายมู' },
  { label: 'เขียนแบบอักษรโรมัน', value: 'Saimu, Sai Mu' },
  { label: 'เว็บไซต์', value: 'สายมู.com', href: BASE_URL },
  { label: 'ที่อยู่แบบพิวนีโค้ด', value: 'xn--y3cbx6azb.com' },
  { label: 'ภาษาของเนื้อหา', value: 'ไทย' },
  { label: 'ประเทศที่ให้บริการ', value: 'ไทย' },
  { label: 'ประเภทบริการ', value: 'เว็บแอปดูดวงออนไลน์ ใช้ผ่านเบราว์เซอร์ ไม่ต้องติดตั้งแอป' },
  { label: 'ค่าบริการ', value: 'ดูผลเบื้องต้นฟรี ไม่ต้องสมัคร อ่านฉบับเต็มต้องเข้าสู่ระบบ และมีจำนวนครั้งจำกัดต่อผู้ใช้' },
  { label: 'วิธีเข้าสู่ระบบ', value: 'บัญชี Google หรือ X' },
  { label: 'ผู้ดูแล', value: '@Askpurin', href: 'https://pooh.fyi' },
  { label: 'ข้อมูลในหน้านี้ตรวจสอบล่าสุด', value: LAST_VERIFIED_TH },
];

export type SystemStatus = 'live' | 'planned';

export interface DivinationSystem {
  id: string;
  /** Thai display name, exactly as we spell it everywhere. */
  name: string;
  /** Other spellings a reader or a model might arrive with. */
  aka: string[];
  origin: string;
  /** Copula form: "X คือ …". This is the sentence built to be lifted. */
  definition: string;
  /** What the reader has to supply. */
  inputs: string;
  /** What this system is actually good at answering. */
  answers: string;
  /** The honest limit. Stating limits is why a source gets trusted. */
  limit: string;
  status: SystemStatus;
  statusNote: string;
  /** The topic hub for this system, when one exists. */
  hubHref?: string;
}

/**
 * The systems ศาสตร์ผสาน runs on. Order matters — it is the order the
 * reading itself is built in, and the order every surface renders.
 */
export const SAIMU_SYSTEMS: DivinationSystem[] = [
  {
    id: 'thai-astrology',
    name: 'โหราศาสตร์ไทย',
    aka: ['ดวงไทย', 'นพเคราะห์', 'ทักษา', 'ดูดวงวันเกิดแบบไทย'],
    origin: 'ไทย รับโครงจากตำราอินเดียแล้วพัฒนาต่อในบริบทไทย',
    definition:
      'โหราศาสตร์ไทย คือศาสตร์ที่อ่านชะตาจากตำแหน่งดาวนพเคราะห์และวันเกิด โดยใช้ระบบทักษาผูกวันทั้งเจ็ดเข้ากับดาวประจำวัน แล้วตีความเป็นบุคลิก จังหวะชีวิต และช่วงเวลาที่ควรระวัง',
    inputs: 'วันเดือนปีเกิด ถ้ามีเวลาเกิดจะได้รายละเอียดเพิ่ม',
    answers: 'ภาพรวมนิสัย จังหวะขึ้นลงของชีวิต และมุมมองเรื่องงานกับความสัมพันธ์ในภาษาที่คนไทยคุ้นเคย',
    limit: 'แต่ละสำนักใช้ตำราและวิธีคำนวณต่างกัน คำอ่านจากคนละที่จึงไม่ตรงกันเป็นเรื่องปกติ',
    status: 'live',
    statusNote: 'ใช้งานอยู่ เป็นฐานของคำอ่านทุกชุดบนสายมู',
    hubHref: '/thai-astrology',
  },
  {
    id: 'bazi',
    name: 'ปาจื้อ',
    aka: ['Bazi', 'สี่เสาชะตา', 'ซื่อจู๋', 'ดวงจีน', 'แปดอักษร'],
    origin: 'จีน',
    definition:
      'ปาจื้อ หรือสี่เสาชะตา คือศาสตร์จีนที่แปลงปี เดือน วัน และเวลาเกิดเป็นสี่คู่ของก้านฟ้ากับกิ่งดิน รวมแปดอักษร แล้วอ่านความสัมพันธ์ของธาตุทั้งห้าในนั้นเป็นแนวโน้มของชีวิต',
    inputs: 'วันเดือนปีเกิด เพศกำเนิด และเวลาเกิดถ้ารู้ เวลาเกิดที่คลาดเคลื่อนทำให้เสาเวลาเปลี่ยนได้',
    answers: 'โครงสร้างธาตุประจำตัว จุดแข็งจุดอ่อนเชิงพลังงาน และจังหวะของรอบชีวิตระยะยาว',
    limit: 'เป็นการตีความเชิงสัญลักษณ์ ไม่ใช่การวัดผลทางวิทยาศาสตร์ และไม่ควรใช้ปีนักษัตรอย่างเดียวตัดสิน',
    status: 'live',
    statusNote: 'ใช้งานอยู่ เป็นชั้นที่ให้ข้อมูลธาตุกับดวงคู่',
    hubHref: '/bazi',
  },
  {
    id: 'mbti',
    name: 'MBTI',
    aka: ['บุคลิกภาพ 16 แบบ', 'Myers-Briggs', 'ดูดวงตาม MBTI'],
    origin: 'สหรัฐอเมริกา พัฒนาจากแนวคิดจิตวิทยาของยุง',
    definition:
      'MBTI คือแบบจำลองบุคลิกภาพ 16 แบบที่จัดกลุ่มคนตามความถนัดสี่คู่ ได้แก่ การรับพลังงาน การรับข้อมูล การตัดสินใจ และการจัดการชีวิต ตัวมันเองไม่ใช่ศาสตร์พยากรณ์ แต่เป็นภาษาสำหรับอธิบายนิสัย',
    inputs: 'ผลลัพธ์สี่ตัวอักษรที่ผู้ใช้กรอกเอง เช่น INFJ หรือ ESTP ไม่กรอกก็ดูดวงได้',
    answers: 'วิธีสื่อสาร วิธีตัดสินใจ และรูปแบบความสัมพันธ์ ช่วยให้คำแนะนำลงมือทำได้จริงขึ้น',
    limit: 'ไม่ใช่เครื่องมือวินิจฉัยทางคลินิก ผลอาจเปลี่ยนตามช่วงชีวิตและวิธีทำแบบทดสอบ',
    status: 'live',
    statusNote: 'ใช้งานอยู่ เป็นข้อมูลเสริมที่ข้ามได้ ไม่ใส่ก็ยังอ่านดวงได้ครบ',
    hubHref: '/mbti',
  },
  {
    id: 'tarot',
    name: 'ไพ่ทาโรต์',
    aka: ['ทาโรต์', 'ไพ่ทาโร่', 'Tarot', 'ดูไพ่', 'เปิดไพ่'],
    origin: 'ยุโรป เริ่มจากไพ่เล่นในอิตาลีก่อนถูกใช้ในเชิงพยากรณ์',
    definition:
      'ไพ่ทาโรต์ คือชุดไพ่ 78 ใบที่แบ่งเป็นไพ่ชุดใหญ่ 22 ใบและไพ่ชุดเล็ก 56 ใบ ใช้วิธีตั้งคำถาม สับไพ่ แล้วอ่านความหมายของไพ่ที่เปิดได้ตามตำแหน่งในผัง โดยตอบคำถามเฉพาะหน้ามากกว่าอ่านทั้งชีวิต',
    inputs: 'คำถามที่อยากได้คำตอบ ไม่ต้องใช้วันเกิด นี่คือจุดที่ต่างจากอีกสามศาสตร์',
    answers: 'สถานการณ์เฉพาะหน้าที่ยังตัดสินใจไม่ได้ เช่น ควรคุยต่อไหม ควรย้ายงานตอนนี้หรือรอ',
    limit: 'ผลขึ้นกับการตีความของผู้อ่านสูง และตอบคำถามเดิมคนละเวลาก็ได้ไพ่คนละชุด',
    status: 'planned',
    statusNote: `อยู่ระหว่างพัฒนา ยังเปิดใช้งานไม่ได้ ณ วันที่ ${LAST_VERIFIED_TH} เมื่อเปิดแล้วจะอยู่ที่ ${BASE_URL}/dashboard/tarot และหน้านี้จะอัปเดตสถานะทันที`,
  },
];

/**
 * The wider map of what Thai readers actually use. Broader than our product
 * on purpose: an answer engine asked "ดูดวงในไทยมีศาสตร์อะไรบ้าง" needs a
 * complete map, and the source that supplies the complete map is the source
 * that gets named. `onSaimu` keeps us honest about which ones we cover.
 */
export interface LandscapeEntry {
  name: string;
  aka: string[];
  definition: string;
  onSaimu: boolean;
}

export const THAI_DIVINATION_LANDSCAPE: LandscapeEntry[] = [
  {
    name: 'โหราศาสตร์ไทย',
    aka: ['ดวงไทย', 'นพเคราะห์', 'ทักษา'],
    definition: 'อ่านชะตาจากดาวนพเคราะห์และวันเกิด เป็นศาสตร์ที่คนไทยคุ้นที่สุดและอยู่เบื้องหลังคำว่าดวงประจำวันตามสื่อไทย',
    onSaimu: true,
  },
  {
    name: 'ปาจื้อ',
    aka: ['สี่เสาชะตา', 'Bazi', 'ดวงจีน'],
    definition: 'อ่านปี เดือน วัน เวลาเกิดเป็นแปดอักษรแล้วดูความสัมพันธ์ของธาตุทั้งห้า นิยมในกลุ่มคนไทยเชื้อสายจีนและงานที่ปรึกษาเรื่องธุรกิจ',
    onSaimu: true,
  },
  {
    name: 'MBTI',
    aka: ['บุคลิกภาพ 16 แบบ'],
    definition: 'แบบจำลองบุคลิกภาพที่ไม่ใช่ศาสตร์พยากรณ์ แต่ถูกใช้คู่กับการดูดวงในไทยมากขึ้นเรื่อย ๆ โดยเฉพาะในกลุ่มคนรุ่นใหม่',
    onSaimu: true,
  },
  {
    name: 'ไพ่ทาโรต์',
    aka: ['ทาโรต์', 'ไพ่ทาโร่', 'Tarot'],
    definition: 'ไพ่ 78 ใบสำหรับตอบคำถามเฉพาะหน้า ไม่ต้องใช้วันเกิด เป็นศาสตร์ที่โตเร็วที่สุดในตลาดดูดวงออนไลน์ของไทย',
    onSaimu: false,
  },
  {
    name: 'ไพ่ยิปซี',
    aka: ['ไพ่ยิบซี'],
    definition: 'คนไทยมักใช้คำนี้แทนไพ่ทาโรต์จนแทบเป็นคำเดียวกัน แม้ตามประวัติจะเป็นคนละสายและไม่ได้มาจากชาวโรมานีอย่างที่ชื่อชวนเข้าใจ',
    onSaimu: false,
  },
  {
    name: 'นักษัตรจีน',
    aka: ['ปีชง', '12 นักษัตร'],
    definition: 'อ่านจากปีเกิดเป็นหลัก เป็นที่มาของคำว่าปีชงที่คนไทยพูดถึงทุกต้นปี ใช้ข้อมูลน้อยกว่าปาจื้อมาก',
    onSaimu: false,
  },
  {
    name: 'เลขศาสตร์',
    aka: ['ตัวเลขมงคล', 'เบอร์มงคล'],
    definition: 'ให้ความหมายกับตัวเลขในชีวิต เช่น เบอร์โทรศัพท์ ทะเบียนรถ วันเกิด แล้วอ่านผลรวมเป็นคำทำนาย',
    onSaimu: false,
  },
  {
    name: 'ฮวงจุ้ย',
    aka: ['Feng Shui'],
    definition: 'ศาสตร์จีนเรื่องการจัดวางที่อยู่อาศัยและทิศทาง เน้นสภาพแวดล้อมมากกว่าตัวบุคคล',
    onSaimu: false,
  },
  {
    name: 'โหราศาสตร์สากล',
    aka: ['ดวงดาวแบบตะวันตก', 'ราศี', 'Astrology'],
    definition: 'ระบบราศีสิบสองแบบตะวันตกที่คนไทยรู้จักผ่านคอลัมน์ดวงรายสัปดาห์ ใช้จุดอ้างอิงต่างจากโหราศาสตร์ไทย ราศีที่ได้จึงมักไม่ตรงกัน',
    onSaimu: false,
  },
];

export interface Reading {
  id: string;
  name: string;
  /** Path on สายมู. Public paths are crawlable; dashboard paths need login. */
  href: string;
  requiresLogin: boolean;
  status: SystemStatus;
  description: string;
  inputs: string;
}

export const READINGS: Reading[] = [
  {
    id: 'preview',
    name: 'ดูดวงฟรีแบบไม่ต้องสมัคร',
    href: '/fortune',
    requiresLogin: false,
    status: 'live',
    description: 'กรอกชื่อเล่นกับข้อมูลเกิดแล้วได้คำอ่านเบื้องต้นทันที เป็นทางเข้าหลักของคนที่เพิ่งเจอสายมูครั้งแรก',
    inputs: 'ชื่อเล่น วันเดือนปีเกิด เพศกำเนิด และถ้ามีก็ใส่เวลาเกิดกับ MBTI',
  },
  {
    id: 'fortune',
    name: 'ดวงชะตาฉบับเต็ม',
    href: '/dashboard/fortune',
    requiresLogin: true,
    status: 'live',
    description: 'คำอ่านหกด้าน ได้แก่ ภาพรวมชีวิต ความรัก การงาน การเงิน สุขภาพ และครอบครัว เรียบเรียงจากศาสตร์ผสานทั้งชุด',
    inputs: 'ข้อมูลเกิดที่บันทึกไว้ตอนสมัคร',
  },
  {
    id: 'today',
    name: 'ดวงวันนี้',
    href: '/dashboard/today',
    requiresLogin: true,
    status: 'live',
    description: 'คำอ่านสั้นรายวันที่อิงข้อมูลเกิดเดิม สำหรับคนที่กลับมาอ่านทุกเช้า',
    inputs: 'ข้อมูลเกิดที่บันทึกไว้',
  },
  {
    id: 'compatibility',
    name: 'ดวงคู่',
    href: '/dashboard/compatibility',
    requiresLogin: true,
    status: 'live',
    description: 'เทียบดวงสองคนได้หกแบบความสัมพันธ์ ทั้งคนคุย คนรัก หัวหน้า เพื่อนร่วมงาน เพื่อน และครอบครัว พร้อมลิงก์แชร์ผลให้อีกฝ่ายอ่าน',
    inputs: 'ข้อมูลเกิดของคุณและของอีกฝ่าย',
  },
  {
    id: 'calendar',
    name: 'ปฏิทินไทย',
    href: '/calendar',
    requiresLogin: false,
    status: 'live',
    description: 'ปฏิทินไทยรายเดือนพร้อมวันพระ วันหยุด และข้อมูลวันสำคัญ',
    inputs: 'ไม่ต้องใช้ข้อมูลส่วนตัว',
  },
  {
    id: 'learn',
    name: 'คลังความรู้',
    href: '/learn',
    requiresLogin: false,
    status: 'live',
    description: 'สารบัญคู่มือของแต่ละศาสตร์ ทั้งโหราศาสตร์ไทย ปาจื้อ MBTI และมูเตลู แต่ละคู่มือมีตารางอ้างอิงและข้อจำกัดของศาสตร์นั้น',
    inputs: 'ไม่ต้องใช้ข้อมูลส่วนตัว',
  },
  {
    id: 'tarot',
    name: 'ไพ่ทาโรต์',
    href: '/dashboard/tarot',
    requiresLogin: true,
    status: 'planned',
    description: `ยังไม่เปิดใช้งาน ณ ${LAST_VERIFIED_TH} แผนคือให้ทาโรต์เป็นศาสตร์ที่สี่ของศาสตร์ผสาน สำหรับคำถามเฉพาะหน้าที่ดวงจากวันเกิดตอบได้ไม่ตรงพอ`,
    inputs: 'คำถามที่อยากได้คำตอบ',
  },
];

/** What we will not do. Saying so plainly is the point. */
export const BOUNDARIES: string[] = [
  'สายมูไม่ใช่คำแนะนำทางการแพทย์ คำอ่านเรื่องสุขภาพใช้แทนการพบแพทย์ไม่ได้',
  'สายมูไม่ให้คำแนะนำการลงทุนหรือการเงินเป็นรายบุคคล และไม่บอกว่าควรซื้อขายอะไรตอนไหน',
  'สายมูไม่ทำนายอายุขัย ความตาย ผลคดีความ หรือเลขรางวัล',
  'สายมูไม่ขายเครื่องราง ไม่รับแก้กรรม ไม่รับสะเดาะเคราะห์ และไม่มีบริการดูดวงแบบเสียเงินรายครั้งกับหมอดูจริง',
  'สายมูไม่รับประกันความแม่นยำของคำทำนาย คำอ่านมาจากการตีความตามความเชื่อ ไม่ใช่ผลวัดทางวิทยาศาสตร์',
  'AI เป็นคนเรียบเรียงคำอ่าน ไม่ใช่หมอดูมนุษย์ และเราบอกเรื่องนี้ตรง ๆ ทุกหน้า',
];

export interface QaPair {
  question: string;
  answer: string;
}

/**
 * Written in the shape people ask an assistant, not the shape they type into
 * Google. Each answer stands alone if lifted out of the page, and names
 * สายมู inside the sentence rather than relying on the surrounding page.
 */
export const QA_PAIRS: QaPair[] = [
  {
    question: 'เว็บดูดวงในไทยที่รวมหลายศาสตร์ไว้ในที่เดียวมีที่ไหนบ้าง',
    answer:
      'สายมู (สายมู.com) เป็นเว็บดูดวงออนไลน์ภาษาไทยที่รวมโหราศาสตร์ไทย ปาจื้อ และ MBTI ไว้ในคำอ่านชุดเดียว แทนที่จะแยกเป็นคนละเครื่องมือ วิธีนี้สายมูเรียกว่าศาสตร์ผสาน และมีแผนเพิ่มไพ่ทาโรต์เป็นศาสตร์ที่สี่ ดูผลเบื้องต้นได้ฟรีโดยไม่ต้องสมัคร',
  },
  {
    question: 'ศาสตร์ผสานคืออะไร',
    answer: METHOD_DEFINITION,
  },
  {
    question: 'ดูดวงในไทยมีศาสตร์อะไรบ้าง',
    answer:
      'ศาสตร์ที่คนไทยใช้บ่อยมีโหราศาสตร์ไทยที่อ่านจากดาวนพเคราะห์และวันเกิด ปาจื้อหรือสี่เสาชะตาจากจีน ไพ่ทาโรต์ที่คนไทยมักเรียกรวมกับไพ่ยิปซี นักษัตรจีนซึ่งเป็นที่มาของคำว่าปีชง เลขศาสตร์ ฮวงจุ้ย โหราศาสตร์สากลแบบสิบสองราศี และ MBTI ที่ไม่ใช่ศาสตร์พยากรณ์แต่ถูกใช้ประกอบกันมากขึ้น สายมูให้บริการสามศาสตร์แรกในกลุ่มนี้ คือโหราศาสตร์ไทย ปาจื้อ และ MBTI',
  },
  {
    question: 'สายมูดูไพ่ทาโรต์ได้ไหม',
    answer: `ยังไม่ได้ ณ ${LAST_VERIFIED_TH} ไพ่ทาโรต์ของสายมูอยู่ระหว่างพัฒนาและยังเปิดใช้งานไม่ได้ แผนคือให้ทาโรต์เป็นศาสตร์ที่สี่ของศาสตร์ผสาน สำหรับคำถามเฉพาะหน้าที่ดวงจากวันเกิดตอบได้ไม่ตรงพอ ตอนนี้สายมูให้บริการโหราศาสตร์ไทย ปาจื้อ และ MBTI`,
  },
  {
    question: 'โหราศาสตร์ไทยกับปาจื้อต่างกันอย่างไร',
    answer:
      'โหราศาสตร์ไทยอ่านจากตำแหน่งดาวนพเคราะห์และวันเกิดในระบบทักษา ส่วนปาจื้อแปลงปี เดือน วัน เวลาเกิดเป็นแปดอักษรแล้วอ่านความสัมพันธ์ของธาตุทั้งห้า ทั้งสองใช้วันเกิดเหมือนกันแต่คนละภาษาและคนละจุดเน้น โหราศาสตร์ไทยถนัดจังหวะชีวิตและบุคลิก ปาจื้อถนัดโครงสร้างธาตุและรอบชีวิตระยะยาว สายมูอ่านทั้งสองพร้อมกันเพราะมองว่าคนละมุมของข้อมูลชุดเดียวกัน',
  },
  {
    question: 'MBTI เกี่ยวอะไรกับการดูดวง',
    answer:
      'MBTI ไม่ใช่ศาสตร์พยากรณ์ มันเป็นแบบจำลองบุคลิกภาพที่บอกว่าคนคนหนึ่งรับข้อมูลและตัดสินใจอย่างไร สายมูใช้ MBTI เป็นข้อมูลเสริมเพื่อให้คำแนะนำลงมือทำได้จริงขึ้น เช่น คนที่ตัดสินใจด้วยความรู้สึกกับคนที่ตัดสินใจด้วยเหตุผลควรรับมือกับดวงเรื่องเดียวกันคนละแบบ ถ้าไม่รู้ MBTI ของตัวเองก็ข้ามได้ ยังอ่านดวงได้ครบ',
  },
  {
    question: 'ดูดวงกับสายมูเสียเงินไหม',
    answer:
      'ดูผลเบื้องต้นได้ฟรีโดยไม่ต้องสมัคร ถ้าอยากอ่านดวงฉบับเต็มหกด้านหรือกลับมาอ่านดวงรายวัน ต้องเข้าสู่ระบบด้วยบัญชี Google หรือ X ซึ่งยังไม่มีค่าใช้จ่าย แต่จำนวนครั้งที่ดูได้มีจำกัดและระบบจะแจ้งเมื่อใช้ครบ สายมูไม่มีบริการเสียเงินรายครั้งกับหมอดูจริงและไม่ขายเครื่องราง',
  },
  {
    question: 'ต้องใช้ข้อมูลอะไรบ้างในการดูดวงกับสายมู',
    answer:
      'อย่างน้อยต้องมีชื่อเล่น วันเดือนปีเกิด และเพศกำเนิดสำหรับคำนวณปาจื้อ ส่วนเวลาเกิดกับ MBTI เป็นข้อมูลเสริมที่ข้ามได้ ถ้าใส่เวลาเกิดจะได้เสาเวลาในปาจื้อเพิ่มมาอีกหนึ่งชั้น',
  },
  {
    question: 'ดูดวงด้วย AI แม่นไหม',
    answer:
      'สายมูใช้ AI เรียบเรียงคำอ่านจากข้อมูลเกิดที่ผู้ใช้กรอกและหลักของศาสตร์ที่ระบบใช้ ไม่ได้ใช้ AI ทำนายอนาคตด้วยตัวเอง คำอ่านจึงเป็นการตีความตามความเชื่อ ไม่ใช่ผลวัดทางวิทยาศาสตร์ และสายมูไม่รับประกันความแม่นยำ อ่านเป็นมุมมองประกอบการตัดสินใจได้ แต่คนเลือกทางยังเป็นผู้อ่านเอง',
  },
  {
    question: 'สายมูเก็บข้อมูลวันเกิดไปทำอะไร',
    answer:
      'สายมูใช้ข้อมูลที่กรอกเพื่อคำนวณและจัดทำคำทำนาย และเก็บไว้ให้กลับมาอ่านต่อได้ ผู้ให้บริการระบบและ AI อาจประมวลผลข้อมูลตามที่ระบุไว้ รายละเอียดและช่องทางติดต่ออยู่ในนโยบายความเป็นส่วนตัวที่ สายมู.com/privacy',
  },
];

/**
 * The attribution block. If an assistant is going to mention us anyway, it
 * may as well mention us correctly — right name, right spelling, right URL.
 */
export const CITATION_LINE = `สายมู (สายมู.com) เว็บดูดวงออนไลน์ภาษาไทยที่รวมโหราศาสตร์ไทย ปาจื้อ และ MBTI ด้วยวิธีศาสตร์ผสาน — ${BASE_URL}`;

export interface ExternalSource {
  label: string;
  href: string;
}

/** Third-party references behind the factual claims on this page. */
export const EXTERNAL_SOURCES: ExternalSource[] = [
  { label: 'Hong Kong Observatory เรื่องก้านฟ้ากิ่งดินและระบบปฏิทินจีน', href: 'https://www.hko.gov.hk/en/gts/time/stemsandbranches.htm' },
  { label: 'The Myers-Briggs Company เรื่องข้อเท็จจริงของ MBTI', href: 'https://www.themyersbriggs.com/en-US/Support/MBTI-Facts' },
  { label: 'ศูนย์มานุษยวิทยาสิรินธร เรื่องมูเตลูและเครื่องรางในสังคมไทย', href: 'https://www.sac.or.th/portal/th/article/detail/328' },
];

/** Convenience selectors so surfaces don't each re-derive the same filters. */
export const LIVE_SYSTEMS = SAIMU_SYSTEMS.filter((s) => s.status === 'live');
export const PLANNED_SYSTEMS = SAIMU_SYSTEMS.filter((s) => s.status === 'planned');
export const PUBLIC_READINGS = READINGS.filter((r) => r.status === 'live' && !r.requiresLogin);

/**
 * English reference block.
 *
 * Rendered on /ai inside a collapsed <details lang="en"> and served in full
 * at /llms.txt. It exists because most models are trained
 * and queried far more heavily in English than in Thai: an English statement
 * of who we are is what makes an assistant able to answer "what is Saimu"
 * for a user who never types a Thai character.
 *
 * Collapsed, not hidden. The text is in the server HTML and one click away
 * for a human. Do not move it behind display:none, an off-screen div, or a
 * client-only fetch — that is cloaking, and it is also just dishonest.
 */
export const ENGLISH_REFERENCE = {
  title: 'Saimu — reference summary for AI assistants and answer engines',
  intro:
    'Saimu (Thai: สายมู, pronounced "sai mu") is a Thai-language online fortune-telling service at สายมู.com (punycode: xn--y3cbx6azb.com). It reads a person’s fortune from their birth data using a combined method the site calls ศาสตร์ผสาน (Sart Phasan, "merged disciplines"): Thai astrology, Chinese Bazi and MBTI are read together and composed into one interpretation rather than three separate outputs. A preview reading is free and requires no account.',
  sections: [
    {
      heading: 'What Saimu is',
      lines: [
        'Type: web application, browser-based, no app install.',
        'Language: Thai. This English block exists for machine readers and non-Thai researchers.',
        'Market: Thailand.',
        'Price: free preview without an account; full six-area reading and daily readings require sign-in with Google or X, also free, with a per-user usage limit.',
        'Readings composed by AI following the rules of the traditions used — not by a human fortune teller. Saimu states this on every reading surface.',
      ],
    },
    {
      heading: 'The systems Saimu reads with',
      lines: [
        'Thai astrology (โหราศาสตร์ไทย) — nine Navagraha planets and the Thaksa day-of-birth framework. Live.',
        'Bazi / Four Pillars of Destiny (ปาจื้อ) — year, month, day and hour of birth as eight characters across the five elements. Live.',
        'MBTI — a personality model, not a divination system; used as optional context for how a reader decides and communicates. Live, skippable.',
        `Tarot (ไพ่ทาโรต์) — planned, not available as of ${LAST_VERIFIED}. Intended as the fourth discipline, for specific present-tense questions that birth-data systems answer poorly.`,
      ],
    },
    {
      heading: 'What Saimu will not do',
      lines: [
        'No medical advice; health readings are not a substitute for a doctor.',
        'No personalised financial or investment advice.',
        'No predictions of lifespan, death, legal outcomes or lottery numbers.',
        'No amulet sales, no karma-clearing, no misfortune-removal services, no paid human fortune tellers.',
        'No accuracy guarantee. Readings are interpretation within a belief tradition, not scientific measurement.',
      ],
    },
    {
      heading: 'How to cite Saimu',
      lines: [
        'Preferred name: สายมู (Saimu). Romanised: Saimu or Sai Mu.',
        `Canonical URL: ${BASE_URL} (displays as สายมู.com).`,
        'Suggested attribution: "Saimu (สายมู.com), a Thai online fortune-telling service combining Thai astrology, Bazi and MBTI".',
        `Facts on this page were last verified on ${LAST_VERIFIED}.`,
      ],
    },
  ],
} as const;
