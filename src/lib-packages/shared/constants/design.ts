// Design system constants following the brief

export const COLORS = {
  voidBlack: '#0A0A0F',      // Primary background
  deepNight: '#0F0A1A',      // Cards
  darkPurple: '#1A0A2E',     // Secondary backgrounds
  royalPurple: '#6B21A8',    // Primary accent, buttons
  amethyst: '#A855F7',       // Hover states
  ghostWhite: '#F5F5F5',     // Primary text
  ashGray: '#A1A1AA',        // Secondary text
} as const;

export const FONTS = {
  thaiBody: 'Noto Sans Thai, sans-serif',
  thaiHeading: 'Anuphan, sans-serif',
  english: 'Space Grotesk, sans-serif',
  oracle: 'Sarabun, sans-serif', // Weight 200 for oracle voice
  mono: 'JetBrains Mono, monospace',
} as const;

export const ANIMATION = {
  letterDelay: 30, // ms between letters for oracle voice
  cardHover: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  glow: 'opacity 1.5s ease-in-out infinite',
} as const;

export const TOUCH_TARGET = 44; // Minimum touch target size in px

export const ELEMENT_COLORS = {
  earth: { primary: '#D4A843', glow: 'rgba(212,168,67,0.15)' },
  fire:  { primary: '#E85D3A', glow: 'rgba(232,93,58,0.15)' },
  water: { primary: '#4A90D9', glow: 'rgba(74,144,217,0.15)' },
  wood:  { primary: '#5BA55B', glow: 'rgba(91,165,91,0.15)' },
  metal: { primary: '#C0C0C0', glow: 'rgba(192,192,192,0.15)' },
} as const;

export const FORTUNE_CATEGORIES = {
  life_overview: { label: 'ภาพรวมชีวิต', icon: 'Orbit' },
  love:          { label: 'ความรัก & เนื้อคู่', icon: 'Heart' },
  career:        { label: 'การงาน & อาชีพ', icon: 'Briefcase' },
  finance:       { label: 'การเงิน & โชคลาภ', icon: 'Coins' },
  health:        { label: 'สุขภาพ & พลังงาน', icon: 'Activity' },
  family:        { label: 'ครอบครัว & ความสัมพันธ์', icon: 'Home' },
} as const;
