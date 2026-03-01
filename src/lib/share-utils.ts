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

export interface CompatibilityShareData {
  url: string;
  partnerName: string;
  relationshipLabel: string;
  userElement: string;
  partnerElement: string;
}

/**
 * Generate platform-specific share text for fortune readings
 */
export function generateShareText(
  platform: SharePlatform,
  data: ShareData
): string {
  const { userName, element, luckyColor, luckyNumber, url } = data;

  switch (platform) {
    case 'line':
      return `ดวงชะตาของ ${userName}
ธาตุ${element}${luckyColor ? ` | สี${luckyColor}` : ''}${luckyNumber ? ` | เลข ${luckyNumber}` : ''}
ดูดวงของเจ้าได้ที่ ${url}`;

    case 'facebook':
      return `มาดูดวงของเจ้ากันเถอะ! ฉันเป็นธาตุ${element}`;

    case 'twitter':
      const attributes = [];
      if (luckyColor) attributes.push(`สีมงคล: ${luckyColor}`);
      if (luckyNumber) attributes.push(`เลขมงคล: ${luckyNumber}`);

      return `ดวงชะตาของฉัน: ธาตุ${element}
${attributes.join(' | ')}

มาดูดวงของเจ้ากันเถอะ! ${url}`;

    case 'copy':
      return url;

    default:
      return '';
  }
}

/**
 * Generate platform-specific share text for compatibility results
 */
export function generateCompatibilityShareText(
  platform: SharePlatform,
  data: CompatibilityShareData
): string {
  const { partnerName, relationshipLabel, userElement, partnerElement, url } = data;

  switch (platform) {
    case 'line':
      return `ดวง${relationshipLabel}ของฉันกับ ${partnerName}
ธาตุ${userElement} × ธาตุ${partnerElement}

มาส่องดวงความสัมพันธ์กัน! ${url}`;

    case 'facebook':
      return `ส่องดวง${relationshipLabel}กับ ${partnerName} — ธาตุ${userElement} × ธาตุ${partnerElement}`;

    case 'twitter':
      return `เช็คดวง${relationshipLabel}กับ ${partnerName} มาแล้ว 🔮
ธาตุ${userElement} × ธาตุ${partnerElement}

ใครอยากรู้ว่าดวงเข้ากันไหม ลองมาเช็คกัน!
${url}`;

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
