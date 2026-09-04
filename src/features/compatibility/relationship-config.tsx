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
    cardTitle: 'กรอกข้อมูลคนที่เจ้าคุยอยู่',
    placeholder: 'ชื่อคนที่เจ้าคุยอยู่',
    cta: 'ส่องดวงคนคุย',
    resultTitle: (name: string) => `ดวงระหว่างเจ้ากับ ${name}`,
    loadingSteps: ['วิเคราะห์ไวบ์ระหว่างสองคน...', 'อ่านสัญญาณดวงดาว...', 'ประมวลผลความสัมพันธ์...'],
  },
  romantic: {
    icon: Heart,
    accent: 'text-pink-600 dark:text-pink-400',
    accentBg: 'bg-pink-500/15',
    accentBorder: 'border-pink-400/50',
    cardTitle: 'กรอกข้อมูลคนรักของเจ้า',
    placeholder: 'ชื่อคนรักของเจ้า',
    cta: 'ส่องดวงคู่รัก',
    resultTitle: (name: string) => `ดวงรักระหว่างเจ้ากับ ${name}`,
    loadingSteps: ['วิเคราะห์ธาตุของทั้งสองคน...', 'เปรียบเทียบดาวประจำวัน...', 'ประมวลผลความสัมพันธ์...'],
  },
  boss: {
    icon: Crown,
    accent: 'text-accentBright',
    accentBg: 'bg-accent/15',
    accentBorder: 'border-accentBright/50',
    cardTitle: 'กรอกข้อมูลหัวหน้าของเจ้า',
    placeholder: 'ชื่อหัวหน้าของเจ้า',
    cta: 'ส่องดวงหัวหน้า',
    resultTitle: (name: string) => `ดวงการงานกับ ${name}`,
    loadingSteps: ['วิเคราะห์สไตล์การทำงาน...', 'เปรียบเทียบพลังงานการงาน...', 'ประมวลผลความสัมพันธ์...'],
  },
  coworker: {
    icon: Users,
    accent: 'text-accentBright',
    accentBg: 'bg-accent/15',
    accentBorder: 'border-accentBright/50',
    cardTitle: 'กรอกข้อมูลเพื่อนร่วมงาน',
    placeholder: 'ชื่อเพื่อนร่วมงาน',
    cta: 'ส่องดวงเพื่อนร่วมงาน',
    resultTitle: (name: string) => `ดวงการงานกับ ${name}`,
    loadingSteps: ['วิเคราะห์สไตล์การทำงาน...', 'เปรียบเทียบจุดแข็งของทีม...', 'ประมวลผลความสัมพันธ์...'],
  },
  friend: {
    icon: Laugh,
    accent: 'text-accentBright',
    accentBg: 'bg-accent/15',
    accentBorder: 'border-accentBright/50',
    cardTitle: 'กรอกข้อมูลเพื่อนของเจ้า',
    placeholder: 'ชื่อเพื่อนของเจ้า',
    cta: 'ส่องดวงเพื่อน',
    resultTitle: (name: string) => `ดวงมิตรภาพกับ ${name}`,
    loadingSteps: ['วิเคราะห์พลังงานมิตรภาพ...', 'เปรียบเทียบธาตุของสองคน...', 'ประมวลผลความสัมพันธ์...'],
  },
  family: {
    icon: Home,
    accent: 'text-accentBright',
    accentBg: 'bg-accent/15',
    accentBorder: 'border-accentBright/50',
    cardTitle: 'กรอกข้อมูลสมาชิกในครอบครัว',
    placeholder: 'ชื่อคนในครอบครัว',
    cta: 'ส่องดวงครอบครัว',
    resultTitle: (name: string) => `ดวงครอบครัวกับ ${name}`,
    loadingSteps: ['วิเคราะห์สายสัมพันธ์ครอบครัว...', 'เปรียบเทียบธาตุของสองคน...', 'ประมวลผลความสัมพันธ์...'],
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
