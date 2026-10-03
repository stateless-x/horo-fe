import type { CompatibilityV4Shaped } from '@/lib-packages/shared/types/compatibility';
import { type RelationshipType } from '@/lib-packages/shared';

// --- Constants ---

export const RELATIONSHIP_CONFIG: Record<RelationshipType, {
  accent: string;
  accentBg: string;
  accentBorder: string;
  cardTitle: string;
  placeholder: string;
  cta: string;
}> = {
  talking: {
    accent: 'text-pink-600 dark:text-pink-400',
    accentBg: 'bg-pink-500/15',
    accentBorder: 'border-pink-400/50',
    cardTitle: 'คนที่คุยอยู่ ชื่ออะไรนะ',
    placeholder: 'ชื่อคนที่คุณคุยอยู่',
    cta: 'ส่องดวงคนคุย',
  },
  romantic: {
    accent: 'text-pink-600 dark:text-pink-400',
    accentBg: 'bg-pink-500/15',
    accentBorder: 'border-pink-400/50',
    cardTitle: 'มาดูดวงคนรักกัน',
    placeholder: 'ชื่อคนรักของคุณ',
    cta: 'ส่องดวงคู่รัก',
  },
  boss: {
    accent: 'text-accentBright',
    accentBg: 'bg-accent/15',
    accentBorder: 'border-accentBright/50',
    cardTitle: 'ทำงานกับหัวหน้า เข้าขากันแค่ไหน',
    placeholder: 'ชื่อหัวหน้าของคุณ',
    cta: 'ส่องดวงหัวหน้า',
  },
  coworker: {
    accent: 'text-accentBright',
    accentBg: 'bg-accent/15',
    accentBorder: 'border-accentBright/50',
    cardTitle: 'เลือกเพื่อนร่วมงานมาดูดวงด้วยกัน',
    placeholder: 'ชื่อเพื่อนร่วมงาน',
    cta: 'ส่องดวงเพื่อนร่วมงาน',
  },
  friend: {
    accent: 'text-accentBright',
    accentBg: 'bg-accent/15',
    accentBorder: 'border-accentBright/50',
    cardTitle: 'เพื่อนคนไหนที่อยากดูดวงด้วย',
    placeholder: 'ชื่อเพื่อนของคุณ',
    cta: 'ส่องดวงเพื่อน',
  },
  family: {
    accent: 'text-accentBright',
    accentBg: 'bg-accent/15',
    accentBorder: 'border-accentBright/50',
    cardTitle: 'วันนี้อยากรู้จักใครในบ้านมากขึ้น',
    placeholder: 'ชื่อคนในครอบครัว',
    cta: 'ส่องดวงครอบครัว',
  },
};

export type RelationshipConfig = (typeof RELATIONSHIP_CONFIG)[RelationshipType];

// --- Types ---

/** GET/POST /api/fortune/compatibility(/:id)(/unlock): the canon report, teaser or full. */
export interface CompatibilityResult {
  id: string;
  profileAId: string;
  partnerName: string;
  partnerBirthDate: string;
  relationshipType: string;
  score: number;
  contentVersion: 4;
  /** The teaser view while `locked`, else the full view. */
  structuredContent: CompatibilityV4Shaped;
  /** The paid detail is not written yet; POST /compatibility/:id/unlock writes it. */
  locked: boolean;
  userElement?: string;
  userDayMaster?: string;
  partnerElement?: string;
  partnerDayMaster?: string;
  shareToken?: string;
  cached?: boolean;
  createdAt: string;
}

export interface HistoryItem {
  id: string;
  partnerName: string;
  partnerBirthDate: string;
  relationshipType: string;
  score: number;
  /** Absent on older API responses; only an explicit true displays the lock. */
  locked?: boolean;
  userElement?: string;
  partnerElement?: string;
  createdAt: string;
}

export interface HistoryResponse {
  data: HistoryItem[];
  nextCursor: string | null;
  total: number;
}

// --- Element Translation ---

export const ELEMENT_NAMES_THAI: Record<string, string> = {
  wood: 'ไม้',
  fire: 'ไฟ',
  earth: 'ดิน',
  metal: 'ทอง',
  water: 'น้ำ',
};

export function toThaiElement(element: string | undefined): string {
  if (!element) return '';
  return ELEMENT_NAMES_THAI[element.toLowerCase()] || element;
}
