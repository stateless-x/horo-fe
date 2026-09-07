import { type RelationshipType } from '@/lib-packages/shared';
import type { CompatibilityStructuredContent } from '@/lib-packages/shared/types/reading';
import {
  Heart, MessageCircleHeart, Crown, Users, Laugh, Home,
} from 'lucide-react';

// --- Constants ---

export const RELATIONSHIP_CONFIG: Record<RelationshipType, {
  icon: typeof Heart;
  accent: string;
  accentBg: string;
  accentBorder: string;
  cardTitle: string;
  placeholder: string;
  cta: string;
  resultTitle: (name: string) => string;
  loadingSteps: string[];
}> = {
  talking: {
    icon: MessageCircleHeart,
    accent: 'text-pink-600 dark:text-pink-400',
    accentBg: 'bg-pink-500/15',
    accentBorder: 'border-pink-400/50',
    cardTitle: 'คนที่คุยอยู่ ชื่ออะไรนะ',
    placeholder: 'ชื่อคนที่คุณคุยอยู่',
    cta: 'ส่องดวงคนคุย',
    resultTitle: (name: string) => `ดวงระหว่างคุณกับ ${name}`,
    loadingSteps: ['กำลังดูเคมีของทั้งคู่...', 'อ่านสัญญาณดวงดาว...', 'กำลังเรียบเรียงเรื่องราวของคู่นี้...'],
  },
  romantic: {
    icon: Heart,
    accent: 'text-pink-600 dark:text-pink-400',
    accentBg: 'bg-pink-500/15',
    accentBorder: 'border-pink-400/50',
    cardTitle: 'มาดูดวงคนรักกัน',
    placeholder: 'ชื่อคนรักของคุณ',
    cta: 'ส่องดวงคู่รัก',
    resultTitle: (name: string) => `ดวงรักระหว่างคุณกับ ${name}`,
    loadingSteps: ['วิเคราะห์ธาตุของทั้งสองคน...', 'เปรียบเทียบดาวประจำวัน...', 'กำลังเรียบเรียงเรื่องราวของคู่นี้...'],
  },
  boss: {
    icon: Crown,
    accent: 'text-accentBright',
    accentBg: 'bg-accent/15',
    accentBorder: 'border-accentBright/50',
    cardTitle: 'ทำงานกับหัวหน้า เข้าขากันแค่ไหน',
    placeholder: 'ชื่อหัวหน้าของคุณ',
    cta: 'ส่องดวงหัวหน้า',
    resultTitle: (name: string) => `ดวงการงานกับ ${name}`,
    loadingSteps: ['วิเคราะห์สไตล์การทำงาน...', 'เปรียบเทียบพลังงานการงาน...', 'กำลังเรียบเรียงเรื่องราวของคู่นี้...'],
  },
  coworker: {
    icon: Users,
    accent: 'text-accentBright',
    accentBg: 'bg-accent/15',
    accentBorder: 'border-accentBright/50',
    cardTitle: 'เลือกเพื่อนร่วมงานมาดูดวงด้วยกัน',
    placeholder: 'ชื่อเพื่อนร่วมงาน',
    cta: 'ส่องดวงเพื่อนร่วมงาน',
    resultTitle: (name: string) => `ดวงการงานกับ ${name}`,
    loadingSteps: ['วิเคราะห์สไตล์การทำงาน...', 'เปรียบเทียบจุดแข็งของทีม...', 'กำลังเรียบเรียงเรื่องราวของคู่นี้...'],
  },
  friend: {
    icon: Laugh,
    accent: 'text-accentBright',
    accentBg: 'bg-accent/15',
    accentBorder: 'border-accentBright/50',
    cardTitle: 'เพื่อนคนไหนที่อยากดูดวงด้วย',
    placeholder: 'ชื่อเพื่อนของคุณ',
    cta: 'ส่องดวงเพื่อน',
    resultTitle: (name: string) => `ดวงมิตรภาพกับ ${name}`,
    loadingSteps: ['วิเคราะห์พลังงานมิตรภาพ...', 'เปรียบเทียบธาตุของสองคน...', 'กำลังเรียบเรียงเรื่องราวของคู่นี้...'],
  },
  family: {
    icon: Home,
    accent: 'text-accentBright',
    accentBg: 'bg-accent/15',
    accentBorder: 'border-accentBright/50',
    cardTitle: 'วันนี้อยากรู้จักใครในบ้านมากขึ้น',
    placeholder: 'ชื่อคนในครอบครัว',
    cta: 'ส่องดวงครอบครัว',
    resultTitle: (name: string) => `ดวงครอบครัวกับ ${name}`,
    loadingSteps: ['วิเคราะห์สายสัมพันธ์ครอบครัว...', 'เปรียบเทียบธาตุของสองคน...', 'กำลังเรียบเรียงเรื่องราวของคู่นี้...'],
  },
};

export type RelationshipConfig = (typeof RELATIONSHIP_CONFIG)[RelationshipType];

// --- Types ---

export interface CompatibilityResult {
  id: string;
  profileAId: string;
  partnerName: string;
  partnerBirthDate: string;
  relationshipType: string;
  score: number;
  analysis: string;
  contentVersion?: number;
  structuredContent?: CompatibilityStructuredContent | null;
  strengths?: string[];
  challenges?: string[];
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
