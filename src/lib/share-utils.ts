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
 */
export const SHARE_PHRASES = [
  // Self-discovery vibes
  'ในที่สุดก็เข้าใจว่าทำไมชีวิตเป็นแบบนี้ 🫠',
  'โดนทายแม่นจนขนลุก 👁️👄👁️',
  'อ่านแล้วรู้สึก called out มาก 💀',
  'ดวงบอกว่าฉันเป็นคนดี แต่ดวงโกหกได้ไหมนะ 🤔',
  'พอดีว่างก็เลยมาดูดวง แล้วก็ไม่ผิดหวัง ✨',

  // Chaotic/funny
  'ดวงบอกให้พัก แต่เงินในบัญชีไม่ยอม 💸',
  'เช็คดวงก่อนตัดสินใจอะไรทุกอย่างในชีวิต 🔮',
  'ดวงดีขนาดนี้ ทำไมยังโสดอยู่ 🥲',
  'แม่นจนน่ากลัว ใครทำเว็บนี้มาจับมือหน่อย 🤝',

  // Flex/brag
  'ธาตุฉันคือ {element} ยอมรับซะ 💅',
  'สีมงคลวันนี้คือ {luckyColor} ใครใส่สีนี้มาหาได้เลย 👀',
  'เลขมงคล {luckyNumber} ใครจะซื้อหวยตามก็เชิญ 🎰',

  // Invite friends
  'มาดูดวงด้วยกันไหม ฟรีด้วยนะ 🌙',
  'ส่งต่อให้เพื่อนที่ชอบดูดวง tag เลย ✨',
] as const;

/**
 * Compatibility share phrases
 */
export const COMPATIBILITY_SHARE_PHRASES = [
  'เช็คดวงคู่แล้ว... ไม่กล้าบอกผล 😳',
  'ดวงคู่ออกมาแล้ว ใครอยากรู้ว่าเข้ากันไหม 👀',
  'AI วิเคราะห์ความสัมพันธ์ให้แล้ว แม่นมาก 🔮',
  'เช็คดวงกับ {partnerName} แล้ว ผลคือ... 💕',
  'ธาตุ{userElement} × ธาตุ{partnerElement} จะเป็นยังไงนะ 🤔',
  'ใครมีคนคุยอยู่ ลองมาเช็คดวงกัน 💘',
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
