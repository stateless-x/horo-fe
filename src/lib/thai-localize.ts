/**
 * Localize raw English astrology values that older generated payloads carry
 * (e.g. luckyDay "saturday", luckyColor "ม่วง (Purple)"). New payloads should
 * arrive fully Thai; these helpers keep legacy readings presentable.
 */

const DAY_NAMES_THAI: Record<string, string> = {
  sunday: 'วันอาทิตย์',
  monday: 'วันจันทร์',
  tuesday: 'วันอังคาร',
  wednesday: 'วันพุธ',
  // Thai astrology splits Wednesday into day/night births (shared ThaiDay schema)
  wednesday_day: 'วันพุธกลางวัน',
  wednesday_night: 'วันพุธกลางคืน',
  thursday: 'วันพฤหัสบดี',
  friday: 'วันศุกร์',
  saturday: 'วันเสาร์',
};

const COLOR_NAMES_THAI: Record<string, string> = {
  purple: 'ม่วง',
  violet: 'ม่วง',
  red: 'แดง',
  orange: 'ส้ม',
  yellow: 'เหลือง',
  gold: 'ทอง',
  green: 'เขียว',
  blue: 'น้ำเงิน',
  navy: 'กรมท่า',
  pink: 'ชมพู',
  white: 'ขาว',
  black: 'ดำ',
  grey: 'เทา',
  gray: 'เทา',
  silver: 'เงิน',
  brown: 'น้ำตาล',
  cream: 'ครีม',
};

/** "saturday" → "วันเสาร์"; already-Thai values pass through untouched. */
export function localizeDayName(value: string): string {
  return DAY_NAMES_THAI[value.trim().toLowerCase()] ?? value;
}

/**
 * "ม่วง (Purple)" → "ม่วง"; "Purple" → "ม่วง"; already-Thai values pass through.
 * Lists separated by commas or "และ" are localized per part and rejoined with
 * their original separators.
 */
export function localizeColorName(value: string): string {
  // Split on comma or และ while keeping the separators so joins stay natural.
  const parts = value.split(/(,\s*|\s+และ\s+)/);
  return parts
    .map((part, index) => {
      const isSeparator = index % 2 === 1;
      if (isSeparator) return part;
      const stripped = part.replace(/\s*\([A-Za-z\s]+\)\s*/g, ' ').trim();
      const mapped = COLOR_NAMES_THAI[stripped.toLowerCase()];
      return mapped ?? (stripped.length > 0 ? stripped : part.trim());
    })
    .join('');
}
