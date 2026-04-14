/**
 * Share utilities for fortune sharing across multiple platforms
 */

export type SharePlatform = 'line' | 'facebook' | 'twitter' | 'copy';

/** Canonical site URL (Thai domain) */
export const SITE_URL = 'https://สายมู.com';

export interface ShareData {
  url: string;
  userName: string;
  element?: string;
  luckyColor?: string;
  luckyNumber?: number;
}

/**
 * Gen Z-friendly share phrases - fun, relatable, shareable
 * Organized by vibe for easy browsing
 */
export const SHARE_PHRASES = [
  // ===== โดนใจ / Called out =====
  'โดนทายแม่นจนขนลุก 👁️👄👁️',
  'รู้สึก called out มากแม่ 💀',
  'เขียนถึงัยังกะรู้จักกัน 😭',
  'ทำไมรู้จักเราดีกว่าเราอีก 🫠',

  // ===== ตลก / Chaotic =====
  'ดวงบอกให้พัก แต่เงินในบัญชีไม่ยอม 💸',
  'ดวงดี แต่โสด ยังไงก็ไม่เข้าใจ 🥲',
  'เปิดดวงมาเจอความจริงที่ไม่พร้อมรับ 🫣',
  'ดวงบอกให้รักตัวเอง ก็รักอยู่แล้วแต่ตังไม่มี 😮‍💨',

  // ===== Flex / บอกโลก =====
  'ฉันธาตุ{element}นะยะ ✨',
  'ธาตุ{element} มีใครเหมือนกันบ้าง 🙋‍♀️',
  'สีมงคลคือ{luckyColor} วันนี้ใส่ถูกสีมะ 👀',

  // ===== ชวนเพื่อน =====
  'ลองมาดูดวงกัน ฟรีด้วย ✨',
  'ใครยังไม่ได้ดู รีบมา 🔮',
] as const;

/**
 * Compatibility share phrases - for relationship readings
 */
export const COMPATIBILITY_SHARE_PHRASES = [
  // ===== ลุ้นผล =====
  'เช็คดวงคู่แล้ว... ไม่กล้าบอกผล 😳',
  'ผลออกมาแล้ว จะกล้าส่งให้เค้าดูมัย 🫣',
  'ธาตุ{userElement} × ธาตุ{partnerElement} ลุ้นมาก 👀',

  // ===== ชวนเช็ค =====
  'ใครมีคนคุยอยู่ ลองมาเช็คดวงกัน 💕',
  'อยากรู้ว่าเข้ากันไหม มาดูเลย 🔮',
  'ดูดวงคู่กัน แม่นมากจริงๆ ✨',
] as const;

/**
 * Get a random share phrase, with variable substitution
 */
export function getRandomSharePhrase(data: ShareData): string {
  const phrase = SHARE_PHRASES[Math.floor(Math.random() * SHARE_PHRASES.length)];
  return phrase
    .replace('{element}', data.element || 'ลึกลับ')
    .replace('{luckyColor}', data.luckyColor || 'ลับ')
    .replace('{luckyNumber}', String(data.luckyNumber || '??'));
}

/**
 * Get a random compatibility share phrase
 */
export function getRandomCompatibilityPhrase(data: CompatibilityShareData): string {
  const phrase = COMPATIBILITY_SHARE_PHRASES[Math.floor(Math.random() * COMPATIBILITY_SHARE_PHRASES.length)];
  return phrase
    .replace('{partnerName}', data.partnerName)
    .replace('{userElement}', data.userElement)
    .replace('{partnerElement}', data.partnerElement);
}

export interface CompatibilityShareData {
  url: string;
  partnerName: string;
  relationshipLabel: string;
  userElement: string;
  partnerElement: string;
}

/**
 * Generate platform-specific share text for fortune readings
 * Now uses fun Gen Z-friendly phrases!
 */
export function generateShareText(
  platform: SharePlatform,
  data: ShareData,
  customPhrase?: string
): string {
  const { element, url } = data;

  // Use custom phrase if provided, otherwise generate a fun one
  const phrase = customPhrase || getRandomSharePhrase(data);

  switch (platform) {
    case 'line':
      return `${phrase}

🔮 ธาตุ${element || 'ลึกลับ'} | สายมู.com`;

    case 'facebook':
      return phrase;

    case 'twitter':
      return `${phrase}

🔮 ธาตุ${element || 'ลึกลับ'} | #สายมู #ดูดวง`;

    case 'copy':
      return url;

    default:
      return '';
  }
}

/**
 * Generate platform-specific share text for compatibility results
 * Now uses fun Gen Z-friendly phrases!
 */
export function generateCompatibilityShareText(
  platform: SharePlatform,
  data: CompatibilityShareData,
  customPhrase?: string
): string {
  const { userElement, partnerElement, url } = data;

  // Use custom phrase if provided, otherwise generate a fun one
  const phrase = customPhrase || getRandomCompatibilityPhrase(data);

  switch (platform) {
    case 'line':
      return `${phrase}

💕 ธาตุ${userElement} × ธาตุ${partnerElement} | สายมู.com`;

    case 'facebook':
      return phrase;

    case 'twitter':
      return `${phrase}

💕 ธาตุ${userElement} × ธาตุ${partnerElement} | #สายมู #ดวงคู่`;

    case 'copy':
      return url;

    default:
      return '';
  }
}

/**
 * Get platform-specific share URL
 */
export function getShareUrl(
  platform: SharePlatform,
  text: string,
  url: string
): string {
  const encodedText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(url);

  switch (platform) {
    case 'line':
      // LINE share URL for web
      return `https://social-plugins.line.me/lineit/share?url=${encodedUrl}&text=${encodedText}`;

    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;

    case 'twitter':
      return `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;

    default:
      return '';
  }
}

/**
 * Get LINE deep link for mobile app
 */
export function getLineDeepLink(text: string): string {
  return `line://msg/text/${encodeURIComponent(text)}`;
}

/**
 * Check if device is mobile
 */
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Track share event (placeholder for analytics)
 */
export function trackShareEvent(platform: SharePlatform, type: string): void {
  // TODO: Implement analytics tracking
  if (typeof window !== 'undefined') {
    console.log(`[Share] Platform: ${platform}, Type: ${type}`);
  }
}
