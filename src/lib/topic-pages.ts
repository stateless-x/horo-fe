import { BASE_URL, LAST_VERIFIED, LAST_VERIFIED_TH, type ExternalSource, type QaPair } from '@/lib/knowledge-base';

/**
 * Topic pages — the pillar layer of the content model.
 *
 * THREE LAYERS, THREE JOBS. Keep them apart or they eat each other in search:
 *
 *   /learn/<slug>   explainer. Wins "<หัวข้อ>คืออะไร". Prose, no tables.
 *   /<slug>         THIS FILE. Reference hub. Wins "ดูดวง<หัวข้อ>" and the
 *                   lookup queries ("ทักษาวันเกิด", "ห้าธาตุปาจื้อ").
 *                   Tables, not prose — tables are what an answer engine
 *                   lifts whole and attributes.
 *   /ai             the machine-readable record of what สายมู itself is.
 *
 * Each hub links down to its explainer and the explainer links back up, so
 * Google sees a cluster with one obvious head rather than two pages arguing
 * over the same query.
 *
 * ADDING A TOPIC (e.g. tarot when it ships):
 *   1. Append a TopicPage below. That alone gives you the route
 *      (app/(marketing)/[topic]), the sitemap entry, the footer link, and
 *      the llms.txt entry — all four read this array.
 *   2. Set `status: 'planned'` until the feature is live, and say so in the
 *      copy. A planned page that reads as shipped is how a site loses trust
 *      with both readers and answer engines.
 *
 * WRITING RULES (these are what make the page citable, not decoration):
 *   - `answer` under every heading stands alone. Assume it gets quoted with
 *     nothing around it.
 *   - Name สายมู inside any sentence making a claim we own. Extraction drops
 *     the surrounding context, so an unnamed claim becomes anonymous.
 *   - Facts that are ours are ours; facts that are the tradition's get a
 *     source in `sources`. Never invent a statistic, a ranking, or a review.
 */

export interface TopicTable {
  caption: string;
  columns: string[];
  rows: string[][];
}

export interface TopicSection {
  /** Question-shaped wherever the query is question-shaped. */
  heading: string;
  /** The featured-snippet block: 40–55 words, self-contained. */
  answer: string;
  body?: string[];
  bullets?: string[];
  table?: TopicTable;
}

export interface TopicPage {
  slug: string;
  status: 'live' | 'planned';
  eyebrow: string;
  /** Short label for the footer reference row. Two or three words, no verb. */
  navLabel: string;
  /** <title>. Brand suffix is appended by the metadata template. */
  title: string;
  h1: string;
  description: string;
  /** The lead paragraph. First thing a crawler and a skimmer both read. */
  lead: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  /**
   * English abstract for AI crawlers and non-Thai researchers.
   *
   * Rendered inside a collapsed <details lang="en"> at the foot of the page:
   * present in the server HTML, so machines read all of it, while a Thai
   * reader sees one quiet summary line. Collapsed is not hidden — never
   * swap this for display:none or an off-screen div, which is cloaking.
   * Every brief must be unique to its page; a repeated block across pages
   * is boilerplate and gets discounted.
   */
  englishBrief: { title: string; paragraphs: string[]; facts: string[] };
  /** Copula form, for the DefinedTerm node in JSON-LD. */
  definition: string;
  sections: TopicSection[];
  faq: QaPair[];
  sources: ExternalSource[];
  /** The deeper explainer this hub sits above. */
  learnHref?: string;
  learnLabel?: string;
  relatedSlugs: string[];
  cta: { label: string; href: string; note: string };
}

const HKO_SOURCE = 'https://www.hko.gov.hk/en/gts/time/stemsandbranches.htm';
const FINEARTS_SOURCE =
  'https://www.finearts.go.th/performing/view/17107-%E0%B9%82%E0%B8%AB%E0%B8%A3%E0%B8%B2%E0%B8%A8%E0%B8%B2%E0%B8%AA%E0%B8%95%E0%B8%A3%E0%B9%8C%E0%B9%80%E0%B8%9A%E0%B8%B7%E0%B9%89%E0%B8%AD%E0%B8%87%E0%B8%95%E0%B9%89%E0%B8%99%E0%B9%81%E0%B8%A5%E0%B8%B0%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B9%83%E0%B8%8A%E0%B9%89%E0%B8%A4%E0%B8%81%E0%B8%A9%E0%B9%8C';
const SAC_SOURCE = 'https://www.sac.or.th/portal/th/article/detail/328';
const THAIRATH_SOURCE = 'https://www.thairath.co.th/horoscope/belief/2355760';
const MBTI_FACTS_SOURCE = 'https://www.themyersbriggs.com/en-US/Support/MBTI-Facts';

export const TOPIC_PAGES: TopicPage[] = [
  /* ------------------------------------------------------------------ */
  {
    slug: 'thai-astrology',
    status: 'live',
    eyebrow: 'ศาสตร์ที่สายมูใช้',
    navLabel: 'โหราศาสตร์ไทย',
    title: 'ดูดวงโหราศาสตร์ไทย นพเคราะห์ ทักษา และวันเกิดทั้งเจ็ด',
    h1: 'โหราศาสตร์ไทย อ่านดวงจากวันเกิดแบบที่คนไทยใช้กันมาก่อน',
    description:
      'คู่มือโหราศาสตร์ไทยฉบับเปิดอ่านได้ทันที รวมตารางดาวนพเคราะห์ทั้งเก้า ทักษาแปดตำแหน่ง และดาวประจำวันเกิดทั้งเจ็ด พร้อมวิธีอ่านดวงตัวเองจากวันเกิดกับสายมู',
    lead: 'โหราศาสตร์ไทยคือศาสตร์ที่อ่านชะตาจากดาวนพเคราะห์เก้าดวงและวันเกิดในระบบทักษา เป็นภาษาที่อยู่เบื้องหลังคำว่าดวงประจำวัน สีมงคลประจำวัน และวันชง ที่คนไทยได้ยินจนชิน หน้านี้รวมตารางที่ต้องเปิดหาบ่อยไว้ในที่เดียว แล้วบอกวิธีอ่านดวงของตัวเองจากข้อมูลที่คุณมีอยู่แล้ว คือวันเกิด',
    englishBrief: {
      title: 'Thai astrology (โหราศาสตร์ไทย) — reference summary in English',
      paragraphs: [
        'Thai astrology is a divination system that reads a person\'s character and life timing from the nine Navagraha planets and the day of the week they were born, arranged in an eight-position framework called Thaksa. It is the tradition behind everyday Thai practices such as lucky colours of the day, auspicious date selection, and the daily horoscope columns in Thai media.',
        'Unlike Western astrology, which works from the twelve zodiac signs, and unlike Chinese Bazi, which converts a birth moment into eight characters of the five elements, Thai astrology can begin with a single input: the weekday of birth. Wednesday is split into daytime and night-time, governed by Mercury and Rahu respectively.',
        'Saimu (สายมู, สายมู.com / xn--y3cbx6azb.com) uses Thai astrology as the first layer of a combined method it calls ศาสตร์ผสาน — Sart Phasan, meaning "merged disciplines" — reading one set of birth data through Thai astrology, Chinese Bazi and MBTI to produce a single interpretation rather than three separate outputs.',
      ],
      facts: [
        'Nine Navagraha: Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu.',
        'Eight Thaksa positions: Boriwan, Ayu, Det, Si, Mula, Utsaha, Montri, Kalakini.',
        'Minimum input: day of the week of birth. Birth time is optional.',
        'Wednesday-born readers must know whether they were born before or after sunset; it changes the ruling planet from Mercury to Rahu.',
        'Available free without an account at https://xn--y3cbx6azb.com/fortune (สายมู.com/fortune).',
      ],
    },
    primaryKeyword: 'โหราศาสตร์ไทย',
    secondaryKeywords: ['ดูดวงโหราศาสตร์ไทย', 'นพเคราะห์', 'ทักษา', 'ดาวประจำวันเกิด', 'สีมงคลประจำวัน', 'ดูดวงวันเกิด'],
    definition:
      'โหราศาสตร์ไทย คือระบบพยากรณ์ที่ใช้ดาวนพเคราะห์เก้าดวงและวันเกิดทั้งเจ็ดในโครงทักษา เพื่ออ่านบุคลิก จังหวะชีวิต และช่วงเวลาที่ควรระวังของแต่ละคน',
    sections: [
      {
        heading: 'โหราศาสตร์ไทยต่างจากดูดวงแบบอื่นตรงไหน',
        answer:
          'โหราศาสตร์ไทยอ่านจากดาวนพเคราะห์เก้าดวงและวันเกิดในระบบทักษา ต่างจากโหราศาสตร์สากลที่อ่านจากสิบสองราศี และต่างจากปาจื้อที่แปลงวันเวลาเกิดเป็นแปดอักษรของธาตุ จุดเด่นคือใช้ข้อมูลน้อยที่สุด แค่รู้ว่าเกิดวันอะไรก็เริ่มอ่านได้แล้ว',
        body: [
          'ความน้อยของข้อมูลคือเหตุผลที่ศาสตร์นี้ฝังอยู่ในชีวิตประจำวันคนไทยได้ลึกกว่าศาสตร์อื่น เพราะทุกคนรู้วันเกิดตัวเอง สีเสื้อประจำวัน การเลือกวันมงคล ไปจนถึงคำว่าเลขมงคล ล้วนต่อยอดมาจากโครงเดียวกันนี้',
          'ข้อแลกเปลี่ยนคือความละเอียด ยิ่งข้อมูลน้อยคำอ่านยิ่งกว้าง สายมูจึงไม่ใช้โหราศาสตร์ไทยเดี่ยว ๆ แต่วางเป็นชั้นแรกแล้วให้ปาจื้อเติมโครงสร้างธาตุ และให้ MBTI เติมเรื่องวิธีตัดสินใจ',
        ],
      },
      {
        heading: 'ดาวนพเคราะห์ทั้งเก้ามีอะไรบ้าง',
        answer:
          'นพเคราะห์คือดาวเก้าดวงในโหราศาสตร์ไทย ได้แก่ อาทิตย์ จันทร์ อังคาร พุธ พฤหัสบดี ศุกร์ เสาร์ ราหู และเกตุ แต่ละดวงมีเลขประจำตัวและความหมายเชิงบุคลิกที่ใช้ตีความต่อในดวงชะตา',
        table: {
          caption: 'ดาวนพเคราะห์ทั้งเก้าและความหมายที่ใช้ตีความ',
          columns: ['เลข', 'ดาว', 'ความหมายที่มักใช้อ่าน'],
          rows: [
            ['1', 'อาทิตย์', 'ตัวตน อำนาจ ความมั่นใจ การเป็นที่จับตา'],
            ['2', 'จันทร์', 'อารมณ์ ความอ่อนโยน การดูแลคนอื่น'],
            ['3', 'อังคาร', 'พลัง การลงมือ ความกล้า และความใจร้อน'],
            ['4', 'พุธ', 'การพูด การเจรจา ไหวพริบ การค้าขาย'],
            ['5', 'พฤหัสบดี', 'ความรู้ ครูบาอาจารย์ หลักการ และที่พึ่ง'],
            ['6', 'ศุกร์', 'ความรัก ศิลปะ ความสวยงาม การเข้าสังคม'],
            ['7', 'เสาร์', 'ความอดทน งานหนัก อุปสรรค และบทเรียนระยะยาว'],
            ['8', 'ราหู', 'ความเปลี่ยนแปลงกะทันหัน สิ่งที่มองไม่เห็น ของนอกกรอบ'],
            ['9', 'เกตุ', 'สิ่งเร้นลับ วาสนาเก่า และเรื่องที่อธิบายไม่ได้'],
          ],
        },
        body: [
          'ราหูกับเกตุไม่ใช่ดาวจริงในทางดาราศาสตร์ แต่เป็นจุดตัดของวงโคจร ตำราไทยยังนับเป็นนพเคราะห์เพราะใช้ตีความเรื่องเหตุไม่คาดฝันได้ดี',
        ],
      },
      {
        heading: 'เกิดวันไหนมีดาวประจำวันอะไร',
        answer:
          'โหราศาสตร์ไทยผูกวันทั้งเจ็ดเข้ากับดาวประจำวัน คือ อาทิตย์–อาทิตย์ จันทร์–จันทร์ อังคาร–อังคาร พุธกลางวัน–พุธ พุธกลางคืน–ราหู พฤหัสบดี–พฤหัสบดี ศุกร์–ศุกร์ และเสาร์–เสาร์ ดาวประจำวันเกิดเป็นจุดตั้งต้นของการอ่านดวงทั้งผัง',
        table: {
          caption: 'ดาวประจำวันเกิดและสีที่ความเชื่อไทยถือว่าเป็นสีประจำวัน',
          columns: ['วันเกิด', 'ดาวประจำวัน', 'สีประจำวันตามความเชื่อ'],
          rows: [
            ['อาทิตย์', 'อาทิตย์', 'แดง'],
            ['จันทร์', 'จันทร์', 'เหลือง ครีม'],
            ['อังคาร', 'อังคาร', 'ชมพู'],
            ['พุธ กลางวัน', 'พุธ', 'เขียว'],
            ['พุธ กลางคืน', 'ราหู', 'เทา ดำ'],
            ['พฤหัสบดี', 'พฤหัสบดี', 'ส้ม แสด'],
            ['ศุกร์', 'ศุกร์', 'ฟ้า'],
            ['เสาร์', 'เสาร์', 'ม่วง ดำ'],
          ],
        },
        body: [
          'วันพุธถูกแบ่งเป็นกลางวันกับกลางคืน โดยนับหลังพระอาทิตย์ตกเป็นพุธกลางคืนซึ่งใช้ราหูเป็นดาวประจำวัน นี่คือเหตุผลที่คนเกิดวันพุธบางคนอ่านดวงแล้วรู้สึกว่าไม่ตรง เพราะใช้ผิดครึ่งวัน',
          'สีประจำวันเป็นความเชื่อเรื่องกำลังใจ ไม่ใช่กฎที่การันตีผล ใส่แล้วรู้สึกดีก็เป็นประโยชน์ในตัวมันเองแล้ว',
        ],
      },
      {
        heading: 'ทักษาแปดตำแหน่งอ่านอะไรได้บ้าง',
        answer:
          'ทักษาคือการวางดาวแปดตำแหน่งรอบวันเกิด แต่ละตำแหน่งบอกคนละเรื่องของชีวิต ตั้งแต่บริวารและอายุ ไปจนถึงกาลกิณีซึ่งเป็นตำแหน่งที่ตำราแนะนำให้ระวัง ตำแหน่งเหล่านี้คือที่มาของคำว่าสีกาลกิณีที่คนไทยเลี่ยงกัน',
        table: {
          caption: 'ทักษาแปดตำแหน่งและเรื่องที่แต่ละตำแหน่งดูแล',
          columns: ['ตำแหน่ง', 'ใช้อ่านเรื่อง'],
          rows: [
            ['บริวาร', 'คนรอบตัว ลูกน้อง ครอบครัว คนที่พึ่งพาเรา'],
            ['อายุ', 'สุขภาพ พลังชีวิต และความมั่นคงของร่างกาย'],
            ['เดช', 'อำนาจ บารมี ชื่อเสียง และการเป็นที่ยอมรับ'],
            ['ศรี', 'ทรัพย์สิน โชคลาภ และสิ่งที่เข้ามาเสริมชีวิต'],
            ['มูละ', 'ฐานทุน มรดก และรากที่ตั้งตัวได้'],
            ['อุตสาหะ', 'ความพยายาม การงาน และผลจากการลงแรง'],
            ['มนตรี', 'ผู้ใหญ่ที่อุปถัมภ์ คนช่วยเหลือ และที่พึ่ง'],
            ['กาลกิณี', 'จุดที่ตำราแนะนำให้ระวัง ทั้งเรื่องคน สี และการตัดสินใจ'],
          ],
        },
        body: [
          'คำแนะนำที่ใช้ได้จริงคืออย่าเพิ่งไปเริ่มที่กาลกิณี คนส่วนใหญ่เปิดตำราแล้ววิ่งไปหาข้อเสียก่อน ทั้งที่ตำแหน่งอย่างอุตสาหะกับมนตรีบอกเรื่องที่ลงมือทำต่อได้มากกว่า',
        ],
      },
      {
        heading: 'เริ่มอ่านดวงตัวเองจากวันเกิดอย่างไร',
        answer:
          'เริ่มจากยืนยันว่าเกิดวันอะไรจริง ๆ ตามปฏิทินไทย ถ้าเกิดวันพุธให้เช็กด้วยว่าก่อนหรือหลังพระอาทิตย์ตก จากนั้นดูดาวประจำวันของตัวเอง แล้วค่อยอ่านทีละตำแหน่งของทักษา อย่าอ่านรวดเดียวทั้งผัง',
        bullets: [
          'ยืนยันวันเกิดตามปฏิทินไทย คนที่เกิดหลังเที่ยงคืนมักจำวันคลาดกันหนึ่งวัน',
          'คนเกิดวันพุธ เช็กว่าก่อนหรือหลังพระอาทิตย์ตก เพราะเปลี่ยนดาวประจำวันทั้งดวง',
          'เลือกหนึ่งเรื่องที่อยากทบทวนก่อน เช่น การงาน แล้วอ่านเฉพาะตำแหน่งที่เกี่ยวข้อง',
          'จดสิ่งที่เกิดขึ้นจริงในเดือนที่ผ่านมา แล้วค่อยเทียบกับคำอ่านอย่างมีระยะห่าง',
          'ถ้ารู้เวลาเกิดด้วย เก็บไว้ใช้กับปาจื้อ เพราะโหราศาสตร์ไทยใช้เวลาเกิดน้อยกว่า',
        ],
      },
      {
        heading: 'สายมูใช้โหราศาสตร์ไทยอย่างไร',
        answer:
          'สายมูใช้โหราศาสตร์ไทยเป็นชั้นแรกของวิธีที่เราเรียกว่าศาสตร์ผสาน คือใช้วันเกิดตั้งภาพบุคลิกและจังหวะชีวิตก่อน แล้วให้ปาจื้อเติมโครงสร้างธาตุ และให้ MBTI เติมเรื่องวิธีตัดสินใจ ทั้งหมดออกมาเป็นคำอ่านชุดเดียว ไม่ใช่สามผลแยกกัน',
        body: [
          'เหตุผลที่ไม่ปล่อยให้อ่านทีละศาสตร์เอง เพราะคนส่วนใหญ่ที่เปิดเว็บดูดวงไม่ได้อยากเป็นนักโหราศาสตร์ เขาอยากได้คำตอบเรื่องเดียวที่ค้างอยู่ในใจ การให้ผลสามชุดแล้วบอกให้ไปประกอบเองคือการโยนงานกลับไปให้คนอ่าน',
        ],
      },
    ],
    faq: [
      {
        question: 'ไม่รู้เวลาเกิด ดูดวงโหราศาสตร์ไทยได้ไหม',
        answer:
          'ได้ โหราศาสตร์ไทยเริ่มอ่านจากวันเกิดเป็นหลัก เวลาเกิดช่วยเพิ่มความละเอียดแต่ไม่ใช่เงื่อนไขบังคับ ข้อยกเว้นคือคนเกิดวันพุธที่ควรรู้อย่างน้อยว่าก่อนหรือหลังพระอาทิตย์ตก เพราะเปลี่ยนดาวประจำวันจากพุธเป็นราหู ที่สายมูจึงเปิดให้ข้ามช่องเวลาเกิดได้',
      },
      {
        question: 'โหราศาสตร์ไทยกับโหราศาสตร์สากลใช้ด้วยกันได้ไหม',
        answer:
          'ใช้ด้วยกันได้ แต่ต้องรู้ว่าเป็นคนละระบบพิกัด โหราศาสตร์ไทยอ่านจากนพเคราะห์และวันเกิด ส่วนโหราศาสตร์สากลอ่านจากสิบสองราศีโดยใช้จุดอ้างอิงต่างกัน ราศีที่ได้จากสองระบบจึงมักไม่ตรงกัน และนั่นไม่ได้แปลว่าฝ่ายใดผิด',
      },
      {
        question: 'สีกาลกิณีคืออะไร ห้ามใส่จริงไหม',
        answer:
          'สีกาลกิณีคือสีที่ผูกกับตำแหน่งกาลกิณีในทักษาของวันเกิดนั้น ตำราแนะนำให้เลี่ยง แต่เป็นความเชื่อเรื่องกำลังใจ ไม่ใช่ข้อห้ามที่มีผลพิสูจน์ได้ ถ้าใส่แล้วสบายใจก็ใส่ได้ สายมูไม่แนะนำให้ใครทิ้งเสื้อผ้าเพราะเรื่องนี้',
      },
      {
        question: 'ดูดวงโหราศาสตร์ไทยฟรีได้ที่ไหน',
        answer:
          'สายมู (สายมู.com) เปิดให้ดูดวงจากวันเกิดฟรีโดยไม่ต้องสมัคร คำอ่านเบื้องต้นใช้โหราศาสตร์ไทยเป็นชั้นแรกร่วมกับปาจื้อและ MBTI ถ้าอยากอ่านฉบับเต็มหกด้านจึงค่อยเข้าสู่ระบบ',
      },
    ],
    sources: [
      { label: 'กรมศิลปากร เรื่องโหราศาสตร์เบื้องต้นและการใช้ฤกษ์', href: FINEARTS_SOURCE },
      { label: 'ศูนย์มานุษยวิทยาสิรินธร เรื่องความเชื่อและเครื่องรางในสังคมไทย', href: SAC_SOURCE },
    ],
    learnHref: '/learn/thai-astrology',
    learnLabel: 'โหราศาสตร์ไทยคืออะไร ฉบับอ่านพื้นฐาน',
    relatedSlugs: ['bazi', 'mutelu'],
    cta: {
      label: 'ดูดวงจากวันเกิดฟรี',
      href: '/fortune',
      note: 'กรอกวันเกิดแล้วอ่านผลเบื้องต้นได้เลย ไม่ต้องสมัคร',
    },
  },

  /* ------------------------------------------------------------------ */
  {
    slug: 'bazi',
    status: 'live',
    eyebrow: 'ศาสตร์ที่สายมูใช้',
    navLabel: 'ปาจื้อ Bazi',
    title: 'ดูดวงปาจื้อ Bazi สี่เสาชะตา ห้าธาตุ และตารางก้านฟ้ากิ่งดิน',
    h1: 'ปาจื้อ Bazi อ่านดวงจีนจากสี่เสาชะตาและธาตุทั้งห้า',
    description:
      'คู่มือปาจื้อหรือสี่เสาชะตาฉบับเปิดใช้งานจริง รวมตารางก้านฟ้าสิบตัว กิ่งดินสิบสองตัว วงจรธาตุสร้างและข่ม พร้อมวิธีอ่านดวงตัวเองและข้อควรระวังเรื่องเวลาเกิด',
    lead: 'ปาจื้อคือศาสตร์จีนที่แปลงปี เดือน วัน และเวลาเกิดของคุณเป็นสี่เสา รวมแปดอักษร แล้วอ่านความสัมพันธ์ของธาตุทั้งห้าในนั้น หน้านี้รวมตารางที่ต้องเปิดหาบ่อยที่สุดของศาสตร์นี้ไว้ครบ ทั้งก้านฟ้าสิบตัว กิ่งดินสิบสองตัว และวงจรธาตุ พร้อมข้อควรระวังเรื่องเวลาเกิดที่ทำให้คนอ่านดวงผิดเสามากที่สุด',
    englishBrief: {
      title: 'Bazi / Four Pillars of Destiny (ปาจื้อ) — reference summary in English',
      paragraphs: [
        'Bazi, also called the Four Pillars of Destiny, is a Chinese system that converts the year, month, day and hour of birth into four pairs of a Heavenly Stem and an Earthly Branch — eight characters in total, which is what the name Bazi means. Interpretation works from how the five elements inside those eight characters generate and control one another.',
        'The most common misunderstanding is treating Bazi as equivalent to the Chinese zodiac. The zodiac animal is only the Earthly Branch of the year pillar, one character out of eight. A person\'s day-master element comes from the Heavenly Stem of the day pillar, not from the birth year.',
        'Saimu (สายมู, สายมู.com / xn--y3cbx6azb.com) computes Bazi from the birth data a reader supplies and explains the result in Thai, using it as the layer that supplies elemental structure inside its combined method, ศาสตร์ผสาน (Sart Phasan). Bazi element relationships are also the basis of every compatibility reading on the site.',
      ],
      facts: [
        'Ten Heavenly Stems: Jia, Yi, Bing, Ding, Wu, Ji, Geng, Xin, Ren, Gui — two per element, yang then yin.',
        'Twelve Earthly Branches map to the twelve zodiac animals; note that Thai names them slightly differently (the dragon branch is called ngu yai, great serpent, in Thai).',
        'Generating cycle: Wood feeds Fire, Fire feeds Earth, Earth feeds Metal, Metal feeds Water, Water feeds Wood.',
        'Controlling cycle: Wood controls Earth, Earth controls Water, Water controls Fire, Fire controls Metal, Metal controls Wood.',
        'The day is divided into twelve two-hour periods, so an inaccurate birth time changes the hour pillar entirely.',
      ],
    },
    primaryKeyword: 'ปาจื้อ',
    secondaryKeywords: ['ดูดวงปาจื้อ', 'Bazi', 'สี่เสาชะตา', 'ห้าธาตุ', 'ก้านฟ้ากิ่งดิน', 'ดวงจีน', 'ธาตุประจำตัว'],
    definition:
      'ปาจื้อ หรือสี่เสาชะตา คือศาสตร์จีนที่แปลงปี เดือน วัน และเวลาเกิดเป็นสี่คู่ของก้านฟ้ากับกิ่งดิน รวมแปดอักษร แล้วอ่านความสัมพันธ์ของธาตุทั้งห้าในนั้นเป็นแนวโน้มของชีวิต',
    sections: [
      {
        heading: 'ปาจื้อทำงานอย่างไร',
        answer:
          'ปาจื้อแปลงเวลาเกิดของคุณเป็นตาราง ปี เดือน วัน และเวลา คือสี่เสา แต่ละเสามีสองอักษร ได้แก่ ก้านฟ้าหนึ่งตัวและกิ่งดินหนึ่งตัว รวมแปดอักษรจึงเรียกว่าปาจื้อ การอ่านคือดูว่าธาตุในแปดอักษรนั้นเสริมหรือข่มกันอย่างไร',
        body: [
          'จุดที่คนเข้าใจผิดบ่อยที่สุดคือคิดว่าปาจื้อเท่ากับปีนักษัตร ปีนักษัตรเป็นแค่กิ่งดินของเสาปี หนึ่งในแปดอักษร การอ่านจากปีเกิดอย่างเดียวจึงเหมือนตัดสินหนังจากโปสเตอร์',
          'ข้อมูลของ Hong Kong Observatory อธิบายว่าก้านฟ้ามีสิบตัวและกิ่งดินมีสิบสองตัว หมุนคู่กันครบรอบที่หกสิบ ซึ่งเป็นที่มาของรอบหกสิบปีในปฏิทินจีน',
        ],
      },
      {
        heading: 'สี่เสาชะตาแต่ละเสาอ่านอะไร',
        answer:
          'เสาปีอ่านรากครอบครัวและภาพที่คนนอกเห็น เสาเดือนอ่านสภาพแวดล้อมตอนเติบโตและจังหวะการงาน เสาวันเป็นแกนกลางที่ใช้อธิบายตัวตนและความสัมพันธ์ ส่วนเสาเวลาอ่านความตั้งใจระยะยาวและช่วงปลายของชีวิต',
        table: {
          caption: 'สี่เสาและหน้าที่เชิงสัญลักษณ์ของแต่ละเสา',
          columns: ['เสา', 'มาจาก', 'ใช้อ่านเรื่อง'],
          rows: [
            ['เสาปี', 'ปีเกิด', 'รากครอบครัว บรรพบุรุษ ภาพที่คนภายนอกสัมผัส'],
            ['เสาเดือน', 'เดือนเกิด', 'สภาพแวดล้อมช่วงเติบโต การงาน และพี่น้อง'],
            ['เสาวัน', 'วันเกิด', 'ตัวตน คู่ครอง และแกนหลักของการตีความทั้งผัง'],
            ['เสาเวลา', 'เวลาเกิด', 'ความตั้งใจระยะยาว ลูกหลาน และช่วงปลายชีวิต'],
          ],
        },
        body: [
          'ก้านฟ้าของเสาวันเรียกว่าธาตุประจำตัว เป็นจุดอ้างอิงที่ตำราส่วนใหญ่ใช้ตอบคำถามว่าคุณเป็นคนธาตุอะไร ไม่ใช่ธาตุของปีเกิดอย่างที่หลายคนเข้าใจ',
        ],
      },
      {
        heading: 'ก้านฟ้าสิบตัวมีอะไรบ้าง',
        answer:
          'ก้านฟ้ามีสิบตัว จับคู่กับธาตุทั้งห้า ธาตุละสองตัวเป็นหยางกับหยิน เรียงจากไม้ ไฟ ดิน ทอง และน้ำ ก้านฟ้าของเสาวันคือธาตุประจำตัวของเจ้าชะตา',
        table: {
          caption: 'ก้านฟ้าสิบตัว ธาตุ และขั้ว',
          columns: ['ลำดับ', 'ก้านฟ้า', 'ธาตุ', 'ขั้ว'],
          rows: [
            ['1', 'เจี่ย 甲', 'ไม้', 'หยาง'],
            ['2', 'อี่ 乙', 'ไม้', 'หยิน'],
            ['3', 'ปิ่ง 丙', 'ไฟ', 'หยาง'],
            ['4', 'ติง 丁', 'ไฟ', 'หยิน'],
            ['5', 'อู้ 戊', 'ดิน', 'หยาง'],
            ['6', 'จี่ 己', 'ดิน', 'หยิน'],
            ['7', 'เกิง 庚', 'ทอง', 'หยาง'],
            ['8', 'ซิน 辛', 'ทอง', 'หยิน'],
            ['9', 'เหริน 壬', 'น้ำ', 'หยาง'],
            ['10', 'กุ่ย 癸', 'น้ำ', 'หยิน'],
          ],
        },
      },
      {
        heading: 'กิ่งดินสิบสองตัวตรงกับนักษัตรอะไร',
        answer:
          'กิ่งดินสิบสองตัวตรงกับสิบสองนักษัตรที่คนไทยรู้จัก เริ่มจากชวดที่เป็นหนู ไปจนถึงกุนที่เป็นหมู ข้อควรรู้คือชื่อไทยบางตัวไม่ตรงกับสัตว์จีน โดยเฉพาะมะโรงที่ไทยเรียกงูใหญ่แต่จีนคือมังกร',
        table: {
          caption: 'กิ่งดินสิบสองตัว นักษัตรไทย และสัตว์ตามธรรมเนียมจีน',
          columns: ['ลำดับ', 'กิ่งดิน', 'นักษัตรไทย', 'สัตว์ตามจีน'],
          rows: [
            ['1', 'จื่อ 子', 'ชวด', 'หนู'],
            ['2', 'โฉ่ว 丑', 'ฉลู', 'วัว'],
            ['3', 'อิ๋น 寅', 'ขาล', 'เสือ'],
            ['4', 'เหม่า 卯', 'เถาะ', 'กระต่าย'],
            ['5', 'เฉิน 辰', 'มะโรง', 'มังกร'],
            ['6', 'ซื่อ 巳', 'มะเส็ง', 'งู'],
            ['7', 'อู่ 午', 'มะเมีย', 'ม้า'],
            ['8', 'เว่ย 未', 'มะแม', 'แพะ'],
            ['9', 'เซิน 申', 'วอก', 'ลิง'],
            ['10', 'โหย่ว 酉', 'ระกา', 'ไก่'],
            ['11', 'ซวี 戌', 'จอ', 'หมา'],
            ['12', 'ไฮ่ 亥', 'กุน', 'หมู'],
          ],
        },
        body: [
          'ปีนักษัตรจีนไม่ได้เปลี่ยนวันที่ 1 มกราคม แต่เปลี่ยนตามปฏิทินจันทรคติหรือตามจุดเริ่มฤดูใบไม้ผลิ แล้วแต่สำนัก คนที่เกิดเดือนมกราคมกับกุมภาพันธ์จึงมักได้นักษัตรไม่ตรงกับที่เข้าใจมาตลอด',
        ],
      },
      {
        heading: 'ธาตุทั้งห้าเสริมและข่มกันอย่างไร',
        answer:
          'ธาตุทั้งห้ามีสองวงจรหลัก วงจรเสริมคือไม้ให้ไฟ ไฟให้ดิน ดินให้ทอง ทองให้น้ำ และน้ำให้ไม้ ส่วนวงจรข่มคือไม้ข่มดิน ดินข่มน้ำ น้ำข่มไฟ ไฟข่มทอง และทองข่มไม้ การอ่านปาจื้อคือดูว่าธาตุในผังของคุณตกอยู่ในความสัมพันธ์แบบไหน',
        table: {
          caption: 'วงจรเสริมและวงจรข่มของธาตุทั้งห้า',
          columns: ['ธาตุ', 'เสริมธาตุ', 'ถูกเสริมโดย', 'ข่มธาตุ', 'ถูกข่มโดย'],
          rows: [
            ['ไม้', 'ไฟ', 'น้ำ', 'ดิน', 'ทอง'],
            ['ไฟ', 'ดิน', 'ไม้', 'ทอง', 'น้ำ'],
            ['ดิน', 'ทอง', 'ไฟ', 'น้ำ', 'ไม้'],
            ['ทอง', 'น้ำ', 'ดิน', 'ไม้', 'ไฟ'],
            ['น้ำ', 'ไม้', 'ทอง', 'ไฟ', 'ดิน'],
          ],
        },
        body: [
          'คำว่าข่มฟังดูน่ากลัวกว่าที่เป็นจริง ในการอ่านจริงธาตุที่ข่มมักหมายถึงแรงกดดันที่ทำให้เกิดรูปร่าง เช่น ทองข่มไม้คือมีดที่แต่งต้นไม้ให้เป็นทรง ไม่ใช่การทำลาย',
          'สายมูใช้ความสัมพันธ์ชุดนี้เป็นฐานของดวงคู่ เพราะเมื่อเทียบสองคนก็คือเทียบว่าธาตุเด่นของแต่ละฝ่ายอยู่ในวงจรเสริมหรือวงจรข่มกัน',
        ],
      },
      {
        heading: 'เวลาเกิดสำคัญแค่ไหนกับปาจื้อ',
        answer:
          'เวลาเกิดกำหนดเสาที่สี่ทั้งเสา ถ้าจำเวลาผิดเกินหนึ่งชั่วโมงก็มีโอกาสได้เสาเวลาคนละตัว เพราะปาจื้อแบ่งวันเป็นสิบสองยามละสองชั่วโมง ไม่รู้เวลาเกิดก็ยังอ่านสามเสาแรกได้ แต่ต้องรู้ว่าอ่านไม่ครบผัง',
        bullets: [
          'ปาจื้อแบ่งวันเป็นสิบสองยาม ยามละสองชั่วโมง เวลาเกิดคาบเกี่ยวจึงเปลี่ยนเสาได้',
          'ตรวจว่าระบบที่ใช้คำนวณแปลงเป็นเขตเวลาอะไร เวลาไทยกับเวลามาตรฐานจีนต่างกันหนึ่งชั่วโมง',
          'ใบเกิดหรือสมุดบันทึกของโรงพยาบาลแม่นกว่าความจำของผู้ใหญ่ในบ้าน',
          'ถ้าไม่รู้เวลาจริง ๆ ให้ข้ามไป อย่าเดา เพราะเสาเวลาที่ผิดแย่กว่าเสาเวลาที่ว่าง',
        ],
      },
      {
        heading: 'สายมูใช้ปาจื้ออย่างไร',
        answer:
          'สายมูใช้ปาจื้อเป็นชั้นที่ให้โครงสร้างธาตุในวิธีศาสตร์ผสาน คือใช้ข้อมูลเกิดชุดเดียวกับที่โหราศาสตร์ไทยใช้ แล้วอ่านต่อเป็นธาตุประจำตัวและความสัมพันธ์ของธาตุ ซึ่งเป็นฐานของคำอ่านดวงคู่ทั้งหมดบนสายมู',
        body: [
          'ที่สายมูขอเพศกำเนิดตอนกรอกข้อมูล ก็เพราะปาจื้อใช้ข้อมูลนี้ในการคำนวณทิศทางของรอบชีวิต ไม่ได้เก็บไว้เพื่ออย่างอื่น',
        ],
      },
    ],
    faq: [
      {
        question: 'ปาจื้อกับปีนักษัตรต่างกันอย่างไร',
        answer:
          'ปีนักษัตรคือกิ่งดินของเสาปี ซึ่งเป็นเพียงหนึ่งในแปดอักษรของปาจื้อ การอ่านจากปีนักษัตรอย่างเดียวจึงใช้ข้อมูลไม่ถึงหนึ่งในแปดของผังทั้งหมด ปาจื้อเต็มรูปแบบอ่านทั้งปี เดือน วัน และเวลาเกิดพร้อมกัน',
      },
      {
        question: 'ธาตุประจำตัวดูจากอะไร',
        answer:
          'ดูจากก้านฟ้าของเสาวัน ไม่ใช่จากปีเกิด ตำราปาจื้อส่วนใหญ่ใช้ก้านฟ้าเสาวันเป็นจุดอ้างอิงหลักในการอธิบายตัวตน คนที่บอกว่าตัวเองธาตุไฟเพราะเกิดปีนั้นปีนี้ มักกำลังพูดถึงคนละอย่างกับธาตุประจำตัวในปาจื้อ',
      },
      {
        question: 'ไม่รู้เวลาเกิด ดูปาจื้อได้ไหม',
        answer:
          'ได้ แต่ได้ไม่ครบ ปาจื้อที่ไม่มีเวลาเกิดจะอ่านได้สามเสาจากสี่เสา ยังเห็นธาตุประจำตัวและโครงสร้างส่วนใหญ่ สายมูจึงเปิดให้ข้ามช่องเวลาเกิดได้ และไม่แนะนำให้เดาเวลาเพื่อให้ผังครบ',
      },
      {
        question: 'ปาจื้อกับฮวงจุ้ยเป็นเรื่องเดียวกันไหม',
        answer:
          'ไม่ใช่ ทั้งสองใช้ภาษาธาตุทั้งห้าเหมือนกันจึงฟังดูใกล้กัน แต่ปาจื้ออ่านคนจากเวลาเกิด ส่วนฮวงจุ้ยอ่านสถานที่และการจัดวาง คนหนึ่งคนมีปาจื้อผังเดียวตลอดชีวิต แต่ฮวงจุ้ยเปลี่ยนได้ทุกครั้งที่ย้ายบ้าน',
      },
      {
        question: 'ดูดวงปาจื้อฟรีภาษาไทยได้ที่ไหน',
        answer:
          'สายมู (สายมู.com) คำนวณปาจื้อจากข้อมูลเกิดและอธิบายผลเป็นภาษาไทย โดยอ่านร่วมกับโหราศาสตร์ไทยและ MBTI ในวิธีที่เรียกว่าศาสตร์ผสาน ดูผลเบื้องต้นได้ฟรีโดยไม่ต้องสมัคร',
      },
    ],
    sources: [
      { label: 'Hong Kong Observatory เรื่องก้านฟ้ากิ่งดินและรอบหกสิบปี', href: HKO_SOURCE },
    ],
    learnHref: '/learn/bazi',
    learnLabel: 'ปาจื้อคืออะไร ฉบับอ่านพื้นฐาน',
    relatedSlugs: ['thai-astrology', 'mutelu'],
    cta: {
      label: 'คำนวณปาจื้อจากวันเกิดฟรี',
      href: '/fortune',
      note: 'ใส่วันเกิดและเวลาเกิดถ้ามี แล้วอ่านผลเบื้องต้นได้ทันที',
    },
  },

  /* ------------------------------------------------------------------ */
  {
    slug: 'mutelu',
    status: 'live',
    eyebrow: 'วัฒนธรรมความเชื่อไทย',
    navLabel: 'มูเตลู',
    title: 'มูเตลูและสายมู ความเชื่อไทยยุคใหม่ที่อยู่ในชีวิตประจำวัน',
    h1: 'มูเตลูและสายมู ความเชื่อไทยยุคใหม่ที่ไม่ได้อยู่แค่ในวัด',
    description:
      'มูเตลูคืออะไร สายมูแปลว่าอะไร รวมที่มาของคำ รูปแบบการมูที่คนไทยทำจริง วิธีมูแบบไม่ให้กระทบการเงินและสุขภาพ พร้อมที่มาของชื่อเว็บดูดวงสายมู',
    lead: 'มูเตลูคือคำเรียกรวมความเชื่อเรื่องการเสริมดวงในไทยยุคนี้ ตั้งแต่ดูดวง ไหว้ขอพร พกเครื่องราง ไปจนถึงเลือกสีเสื้อประจำวัน ส่วนสายมูคือคนที่สนใจเรื่องพวกนี้เป็นปกติ หน้านี้อธิบายที่มาของทั้งสองคำ รูปแบบที่คนไทยทำจริง และเส้นแบ่งระหว่างความเชื่อที่ช่วยกับความเชื่อที่เริ่มกินชีวิต',
    englishBrief: {
      title: 'Mutelu and Sai Mu (มูเตลู, สายมู) — reference summary in English',
      paragraphs: [
        'Mutelu is the contemporary Thai umbrella term for luck-related belief practice: fortune telling, making merit and offerings, carrying amulets or charm stones, and choosing auspicious colours, numbers and dates. Sai mu, literally "the mutelu type", is what Thai people call someone who follows these practices as a normal part of life. The label is affectionate rather than pejorative, and many Thais apply it to themselves.',
        'The word entered Thai from the title of an Indonesian film released in Thailand in the 1980s, originally carrying connotations of black magic. Its meaning has broadened considerably; today it covers opening a horoscope app as readily as visiting a temple.',
        'Saimu (สายมู, สายมู.com / xn--y3cbx6azb.com) takes its name from that term. It is a Thai-language online fortune-telling site that combines Thai astrology, Chinese Bazi and MBTI into a single reading. It states plainly on every page that readings are composed by AI following the rules of those traditions, not by a human fortune teller, and it makes no accuracy guarantee. It sells no amulets and offers no karma-clearing or misfortune-removal services.',
      ],
      facts: [
        'Mutelu = umbrella term for Thai luck belief practice; sai mu = a person who follows it.',
        'Common forms: horoscope reading, temple and shrine offerings, amulets, lucky colours of the day, auspicious date selection.',
        'Most mutelu practice costs nothing — wearing the day\'s lucky colour is the most common form.',
        'Saimu\'s stated boundaries: no medical advice, no personalised financial advice, no predictions of death or legal outcomes, no amulet sales, no accuracy guarantee.',
      ],
    },
    primaryKeyword: 'มูเตลู',
    secondaryKeywords: ['สายมู', 'มูเตลูคืออะไร', 'สายมูแปลว่า', 'ความเชื่อไทย', 'เสริมดวง', 'ขอพร'],
    definition:
      'มูเตลู คือคำเรียกรวมความเชื่อเรื่องการเสริมดวงและสิ่งศักดิ์สิทธิ์ในไทยปัจจุบัน ครอบคลุมตั้งแต่การดูดวง การไหว้ขอพร การพกเครื่องราง ไปจนถึงการเลือกสีและตัวเลขมงคล',
    sections: [
      {
        heading: 'คำว่ามูเตลูมาจากไหน',
        answer:
          'ที่มาที่ถูกอ้างถึงบ่อยที่สุดคือภาพยนตร์อินโดนีเซียเรื่องหนึ่งที่เข้าฉายในไทยช่วงปลายทศวรรษ 2520 โดยใช้คำว่ามูเตลูในชื่อไทย คำนี้ติดปากคนไทยในความหมายของไสยศาสตร์ แล้วค่อย ๆ กลายเป็นคำกลาง ๆ ที่ใช้เรียกความเชื่อเรื่องเสริมดวงทั้งหมดในปัจจุบัน',
        body: [
          'ความหมายของคำเปลี่ยนไปมากตามยุค เดิมมีกลิ่นของไสยศาสตร์และของขลัง ทุกวันนี้คนใช้คำนี้กับการไปไหว้พระ ดูดวงออนไลน์ หรือเปลี่ยนวอลเปเปอร์มือถือได้พอ ๆ กัน',
          'ส่วนคำว่าสายมูมาจาก สาย ที่แปลว่าคนประเภทหนึ่ง บวกกับ มู ที่ตัดมาจากมูเตลู รวมแล้วแปลว่าคนที่สนใจเรื่องเสริมดวงเป็นปกติ คำนี้ไม่ได้มีน้ำเสียงลบ คนไทยจำนวนมากเรียกตัวเองแบบนี้อย่างสนุก ๆ',
        ],
      },
      {
        heading: 'คนไทยมูแบบไหนกันบ้าง',
        answer:
          'การมูของคนไทยกระจายตัวมากกว่าที่ภาพจำบอก มีตั้งแต่การดูดวงออนไลน์ การไหว้ขอพรตามวัดและศาลเจ้า การพกเครื่องรางหรือสร้อยหิน การเลือกสีเสื้อและเลขมงคล ไปจนถึงการเลือกวันเริ่มงานสำคัญ',
        bullets: [
          'ดูดวง ทั้งจากวันเกิด ไพ่ และแอปหรือเว็บดูดวงออนไลน์',
          'ไหว้ขอพร ที่วัด ศาลเจ้า หรือมูตามเทพที่กำลังเป็นที่พูดถึง',
          'พกของ ตั้งแต่พระเครื่อง สร้อยหิน ไปจนถึงของที่ระลึกที่มีความหมายส่วนตัว',
          'เลือกสีและตัวเลข สีเสื้อประจำวัน เบอร์โทร ทะเบียนรถ',
          'เลือกฤกษ์ วันเซ็นสัญญา วันย้ายบ้าน วันเปิดร้าน',
        ],
        body: [
          'สิ่งที่คนนอกมักมองข้ามคือการมูส่วนใหญ่ไม่ได้ใช้เงิน คนจำนวนมากมูด้วยการใส่เสื้อสีที่ชอบในวันสัมภาษณ์งาน ซึ่งมีต้นทุนเป็นศูนย์และได้ผลจริงในแง่ความมั่นใจ',
        ],
      },
      {
        heading: 'ทำไมมูเตลูยังอยู่ในชีวิตคนไทยรุ่นใหม่',
        answer:
          'เพราะความเชื่อให้ภาษาสำหรับพูดถึงความหวังในเวลาที่อนาคตไม่แน่นอน คนรุ่นใหม่ที่เจอเศรษฐกิจผันผวนและงานที่ไม่มั่นคงไม่ได้เลิกมู แต่ย้ายรูปแบบไปอยู่บนมือถือ ทั้งเว็บดูดวง วอลเปเปอร์มงคล และการไลฟ์ขอพร',
        body: [
          'อีกเหตุผลคือการมูเป็นเรื่องทางสังคมพอ ๆ กับเรื่องส่วนตัว การชวนเพื่อนไปไหว้ การส่งผลดูดวงให้กันอ่าน หรือการเทียบ MBTI กัน ล้วนเป็นวิธีคุยเรื่องความรู้สึกโดยไม่ต้องพูดตรง ๆ',
          'นี่คือเหตุผลที่สายมูออกแบบให้ผลดูดวงแชร์ต่อได้ ไม่ใช่เพราะอยากได้ยอดแชร์ แต่เพราะการอ่านดวงของคนไทยเป็นกิจกรรมที่ทำด้วยกันมาตั้งแต่ต้น',
        ],
      },
      {
        heading: 'มูอย่างไรไม่ให้กระทบชีวิตจริง',
        answer:
          'ตั้งงบให้ชัดและไม่กู้เงินเพื่อความเชื่อ อ่านเงื่อนไขของพิธีหรือสินค้าให้ครบก่อนจ่าย และอย่าใช้ความเชื่อแทนการรักษา กฎหมาย หรือคำแนะนำทางการเงิน ถือสิ่งมูเป็นกำลังใจ แล้วลงมือทำในส่วนที่ควบคุมได้เอง',
        bullets: [
          'ตั้งงบก่อนเสมอ และไม่กู้ยืมเพื่อทำบุญหรือซื้อของมงคล',
          'ถามให้ชัดว่าต้องจ่ายเท่าไร ต้องทำอะไรต่อ และถ้าไม่ได้ผลจะรับมืออย่างไร',
          'ระวังคนที่ขายความกลัว คำว่าไม่ทำแล้วจะซวยคือสัญญาณเตือน',
          'อย่าเลื่อนการพบแพทย์หรือการปรึกษาทนายเพราะรอฤกษ์',
          'ถ้าเริ่มนอนไม่หลับเพราะกลัวคำทำนาย นั่นคือจุดที่ควรพักจากการมู',
        ],
      },
      {
        heading: 'ชื่อสายมูมาจากอะไร',
        answer:
          'สายมู (สายมู.com) ตั้งชื่อตามคำที่คนไทยใช้เรียกตัวเองอยู่แล้ว เพราะเว็บนี้ทำมาเพื่อคนที่สนใจเรื่องดวงเป็นปกติ ไม่ใช่เพื่อคนที่อยากได้คำพยากรณ์แบบขลัง ๆ สายมูเป็นเว็บดูดวงออนไลน์ภาษาไทยที่รวมโหราศาสตร์ไทย ปาจื้อ และ MBTI ไว้ในคำอ่านชุดเดียว',
        body: [
          'จุดยืนของสายมูคือความเชื่อควรอยู่ข้างชีวิต ไม่ใช่อยู่เหนือชีวิต เราจึงบอกตรง ๆ ทุกหน้าว่าคำอ่านมาจาก AI ที่เรียบเรียงตามหลักของศาสตร์ ไม่ใช่หมอดูมนุษย์ และไม่รับประกันความแม่นยำ',
          'สายมูไม่ขายเครื่องราง ไม่รับแก้กรรม และไม่มีบริการสะเดาะเคราะห์ ถ้าคุณกำลังมองหาสิ่งเหล่านั้น เว็บนี้ไม่ใช่ที่ที่ถูก',
        ],
      },
    ],
    faq: [
      {
        question: 'มูเตลูแปลว่าอะไร',
        answer:
          'ในภาษาไทยปัจจุบัน มูเตลูเป็นคำเรียกรวมความเชื่อเรื่องเสริมดวง โหราศาสตร์ ของขลัง และสิ่งศักดิ์สิทธิ์ ความหมายกว้างขึ้นมากจากเดิมที่มีกลิ่นไสยศาสตร์ ทุกวันนี้ครอบคลุมถึงการดูดวงออนไลน์และการเลือกสีมงคลด้วย',
      },
      {
        question: 'สายมูแปลว่าอะไร',
        answer:
          'สายมูแปลว่าคนที่สนใจเรื่องมูเตลูเป็นปกติ มาจากคำว่า สาย ที่แปลว่าคนประเภทหนึ่ง บวกกับ มู ที่ตัดมาจากมูเตลู เป็นคำที่คนไทยจำนวนมากใช้เรียกตัวเองอย่างสนุก ๆ ไม่ได้มีน้ำเสียงลบ และยังเป็นชื่อของเว็บดูดวง สายมู.com ด้วย',
      },
      {
        question: 'เป็นสายมูต้องบูชาของขลังไหม',
        answer:
          'ไม่จำเป็น สายมูจำนวนมากไม่มีของขลังสักชิ้น การดูดวง การทำบุญ การเลือกสีเสื้อ หรือการตั้งใจไหว้ในใจก็นับเป็นการมูทั้งหมด ความเชื่อไม่ได้มีรูปแบบเดียวและไม่ควรใช้ตัดสินกัน',
      },
      {
        question: 'มูแล้วจะสมหวังแน่นอนไหม',
        answer:
          'ไม่มีหลักประกัน ความเชื่อช่วยเรื่องกำลังใจและช่วยให้ตั้งหลักได้ แต่ผลลัพธ์ยังขึ้นกับการลงมือทำ ข้อมูล และเงื่อนไขจริงของชีวิต ใครก็ตามที่รับประกันผลแลกกับเงิน คือสัญญาณที่ควรถอยออกมา',
      },
    ],
    sources: [
      { label: 'ศูนย์มานุษยวิทยาสิรินธร เรื่องมูเตลูและเครื่องราง', href: SAC_SOURCE },
      { label: 'ไทยรัฐ เรื่องที่มาของคำว่ามูเตลู', href: THAIRATH_SOURCE },
      { label: 'The Myers-Briggs Company เรื่องข้อเท็จจริงของ MBTI', href: MBTI_FACTS_SOURCE },
    ],
    learnHref: '/learn/mutelu',
    learnLabel: 'มูเตลูคืออะไร ฉบับอ่านพื้นฐาน',
    relatedSlugs: ['thai-astrology', 'bazi'],
    cta: {
      label: 'ลองดูดวงกับสายมูฟรี',
      href: '/fortune',
      note: 'ไม่ต้องสมัคร ไม่ขายของมงคล อ่านเป็นมุมมองประกอบการตัดสินใจ',
    },
  },
];

export function getTopicPage(slug: string) {
  return TOPIC_PAGES.find((topic) => topic.slug === slug);
}

export const TOPIC_SLUGS = TOPIC_PAGES.map((topic) => topic.slug);

/** Shared by the page, the sitemap, and the JSON-LD. */
export function topicUrl(slug: string) {
  return `${BASE_URL}/${slug}`;
}

export { LAST_VERIFIED, LAST_VERIFIED_TH };
