import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/lib-packages/ui';
import { useOnboardingStore } from '@/stores/onboarding';
import { useFortuneStore } from '@/stores/fortune';
import { useFortuneShare } from '@/hooks/use-fortune-share';
import type { FortuneReading } from '@/hooks/use-fortune-generation';
import {
  Sparkles,
  Heart,
  Briefcase,
  TrendingUp,
  Shield,
  Calendar,
  Compass,
  Star,
  Moon,
  Sun,
  ChevronDown,
  Share2,
  Home,
  RefreshCw
} from 'lucide-react';
import { useState } from 'react';

interface FortuneContentProps {
  fortuneReading: FortuneReading;
  userName?: string;
}

// Element mapping for Thai users
const ELEMENT_MAP: Record<string, { thai: string; color: string; icon: any; meaning: string }> = {
  Wood: {
    thai: 'ไม้',
    color: 'text-green-400',
    icon: '🌳',
    meaning: 'มีความคิดสร้างสรรค์ ชอบการเติบโต และมีความยืดหยุ่น'
  },
  Fire: {
    thai: 'ไฟ',
    color: 'text-red-400',
    icon: '🔥',
    meaning: 'มีความหลงใหล กล้าหาญ และเป็นผู้นำโดยธรรมชาติ'
  },
  Earth: {
    thai: 'ดิน',
    color: 'text-yellow-400',
    icon: '⛰️',
    meaning: 'มั่นคง เชื่อถือได้ และเป็นคนที่พึ่งพาได้'
  },
  Metal: {
    thai: 'โลหะ',
    color: 'text-gray-300',
    icon: '⚔️',
    meaning: 'มีความมุ่งมั่น เด็ดขาด และชอบความสมบูรณ์แบบ'
  },
  Water: {
    thai: 'น้ำ',
    color: 'text-blue-400',
    icon: '💧',
    meaning: 'มีปัญญา ยืดหยุ่น และเข้าใจความรู้สึกของผู้อื่น'
  }
};

// Planet meanings for Thai users
const PLANET_MEANINGS: Record<string, string> = {
  'ดวงอาทิตย์': 'ผู้นำ มีเสน่ห์ และชอบเป็นจุดสนใจ',
  'ดวงจันทร์': 'อ่อนโยน เข้าอกเข้าใจ และมีจิตใจละเอียดอ่อน',
  'ดาวอังคาร': 'กล้าหาญ มีพลัง และชอบการแข่งขัน',
  'ดาวพุธ': 'ฉลาด คล่องแคล่ว และสื่อสารเก่ง',
  'ดาวพฤหัส': 'โชคดี ใจกว้าง และมองโลกในแง่ดี',
  'ดาวศุกร์': 'รักสวยรักงาม มีเสน่ห์ และชอบความสุข',
  'ดาวเสาร์': 'มีวินัย อดทน และรับผิดชอบ',
  'ดาวราหู': 'ลึกลับ มีพลังแฝง และชอบการเปลี่ยนแปลง',
  'ดาวเกตุ': 'มีจิตวิญญาณสูง ชอบค้นหาความจริง'
};

/**
 * Fortune Content Component - Redesigned for better UX
 */
export function FortuneContent({ fortuneReading, userName }: FortuneContentProps) {
  const router = useRouter();
  const { teaserResult } = useOnboardingStore();
  const { narrativeChunks } = useFortuneStore();
  const { handleShare, shareStatus } = useFortuneShare();
  const [expandedSections, setExpandedSections] = useState<string[]>(['summary']);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Parse narrative into sections
  const parseNarrative = (narrative: string) => {
    // Split by common Thai fortune telling sections
    const sections = [
      { id: 'overall', title: 'ภาพรวมชีวิต', icon: Sparkles, content: '' },
      { id: 'love', title: 'ความรัก', icon: Heart, content: '' },
      { id: 'career', title: 'การงาน', icon: Briefcase, content: '' },
      { id: 'wealth', title: 'การเงิน', icon: TrendingUp, content: '' },
      { id: 'health', title: 'สุขภาพ', icon: Shield, content: '' }
    ];

    // Simple heuristic to split content - in production, use AI to properly categorize
    const paragraphs = narrative.split(/[。\n\n]/);
    const contentPerSection = Math.ceil(paragraphs.length / sections.length);

    sections.forEach((section, idx) => {
      const start = idx * contentPerSection;
      const end = start + contentPerSection;
      section.content = paragraphs.slice(start, end).join(' ').trim();
    });

    return sections.filter(s => s.content);
  };

  const narrativeSections = parseNarrative(narrativeChunks.join(' '));

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleRegenerate = async () => {
    const confirmMessage = `คุณแน่ใจหรือไม่ว่าต้องการสร้างดวงใหม่?\n\nการสร้างดวงใหม่จะเปลี่ยนคำทำนายทั้งหมดของคุณ\n\nหมายเหตุ: ฟีเจอร์นี้สำหรับทดสอบเท่านั้น และจะถูกปิดในอนาคต`;

    if (!confirm(confirmMessage)) {
      return;
    }

    setIsRegenerating(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/fortune/chart/regenerate`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate fortune');
      }

      // Reload the page to fetch new data
      window.location.reload();
    } catch (error) {
      console.error('Regenerate error:', error);
      alert('เกิดข้อผิดพลาดในการสร้างดวงใหม่ กรุณาลองอีกครั้ง');
      setIsRegenerating(false);
    }
  };

  // Get element info safely
  const elementInfo = ELEMENT_MAP[fortuneReading.baziChart.element] || ELEMENT_MAP['Earth'];

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-royalPurple/20 rounded-full"
            whileHover={{ scale: 1.05 }}
          >
            <Sparkles className="w-4 h-4 text-amethyst" />
            <span className="text-sm text-amethyst">คำทำนายของคุณพร้อมแล้ว</span>
          </motion.div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading text-ghostWhite">
            ดวงชะตาของ{userName || 'คุณ'}
          </h1>

          <p className="text-ashGray text-sm md:text-base">
            วันที่ {new Date().toLocaleDateString('th-TH', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </motion.div>

        {/* Element Summary - Main Focus */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-darkPurple via-deepNight to-darkPurple border-royalPurple/50 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-royalPurple/10 to-transparent" />
            <CardContent className="relative pt-8 pb-8">
              <div className="text-center space-y-6">
                {/* Element Icon */}
                <motion.div
                  className="text-6xl md:text-7xl"
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 2
                  }}
                >
                  {elementInfo.icon}
                </motion.div>

                {/* Element Title */}
                <div className="space-y-2">
                  <p className="text-xs md:text-sm text-ashGray uppercase tracking-wider">
                    ธาตุประจำตัวของคุณคือ
                  </p>
                  <h2 className={`text-4xl md:text-5xl font-heading ${elementInfo.color}`}>
                    ธาตุ{elementInfo.thai}
                  </h2>
                </div>

                {/* Element Meaning */}
                <div className="max-w-md mx-auto">
                  <p className="text-ghostWhite/90 text-base md:text-lg leading-relaxed">
                    {elementInfo.meaning}
                  </p>
                </div>

                {/* Lucky Info */}
                {(teaserResult.luckyColor || teaserResult.luckyNumber) && (
                  <div className="flex gap-8 justify-center pt-4">
                    {teaserResult.luckyColor && (
                      <motion.div
                        className="text-center"
                        whileHover={{ scale: 1.1 }}
                      >
                        <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-br from-amethyst to-royalPurple flex items-center justify-center">
                          <Star className="w-8 h-8 text-ghostWhite" />
                        </div>
                        <p className="text-xs text-ashGray mb-1">สีมงคล</p>
                        <p className="text-lg font-heading text-ghostWhite">{teaserResult.luckyColor}</p>
                      </motion.div>
                    )}
                    {teaserResult.luckyNumber && (
                      <motion.div
                        className="text-center"
                        whileHover={{ scale: 1.1 }}
                      >
                        <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-br from-amethyst to-royalPurple flex items-center justify-center">
                          <span className="text-2xl font-bold text-ghostWhite">{teaserResult.luckyNumber}</span>
                        </div>
                        <p className="text-xs text-ashGray mb-1">เลขมงคล</p>
                        <p className="text-lg font-heading text-ghostWhite">เลข {teaserResult.luckyNumber}</p>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Thai Astrology - Made Meaningful */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-darkPurple/50 bg-deepNight/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                <Moon className="w-5 h-5 text-amethyst" />
                ดาวประจำวันเกิดของคุณ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Birth Day & Planet */}
                <div className="text-center">
                  <p className="text-3xl md:text-4xl font-heading text-amethyst mb-2">
                    {fortuneReading.thaiAstrology.planet}
                  </p>
                  <p className="text-ghostWhite/80 text-base">
                    ผู้เกิดวัน{fortuneReading.thaiAstrology.day}
                  </p>
                  {PLANET_MEANINGS[fortuneReading.thaiAstrology.planet] && (
                    <p className="text-ashGray mt-3 text-sm md:text-base leading-relaxed max-w-md mx-auto">
                      {PLANET_MEANINGS[fortuneReading.thaiAstrology.planet]}
                    </p>
                  )}
                </div>

                {/* Lucky Attributes Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <motion.div
                    className="bg-darkPurple/30 rounded-lg p-4 text-center"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Compass className="w-6 h-6 text-amethyst mx-auto mb-2" />
                    <p className="text-xs text-ashGray mb-1">ทิศมงคล</p>
                    <p className="text-ghostWhite font-medium">
                      {fortuneReading.thaiAstrology.luckyDirection}
                    </p>
                  </motion.div>

                  <motion.div
                    className="bg-darkPurple/30 rounded-lg p-4 text-center"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="w-6 h-6 rounded-full mx-auto mb-2"
                         style={{ backgroundColor: fortuneReading.thaiAstrology.color }} />
                    <p className="text-xs text-ashGray mb-1">สีประจำวัน</p>
                    <p className="text-ghostWhite font-medium">
                      {fortuneReading.thaiAstrology.color}
                    </p>
                  </motion.div>

                  <motion.div
                    className="bg-darkPurple/30 rounded-lg p-4 text-center col-span-2 md:col-span-1"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Calendar className="w-6 h-6 text-amethyst mx-auto mb-2" />
                    <p className="text-xs text-ashGray mb-1">เลขประจำวัน</p>
                    <p className="text-ghostWhite font-medium text-lg">
                      {fortuneReading.thaiAstrology.luckyNumber}
                    </p>
                  </motion.div>
                </div>

                {/* Personality Insight */}
                {fortuneReading.thaiAstrology.personality && (
                  <div className="bg-gradient-to-r from-royalPurple/20 to-amethyst/20 rounded-lg p-4">
                    <p className="text-xs text-amethyst uppercase tracking-wider mb-2">
                      บุคลิกภาพของคุณ
                    </p>
                    <p className="text-ghostWhite/90 leading-relaxed">
                      {fortuneReading.thaiAstrology.personality}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Four Pillars - Simplified */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-darkPurple/50 bg-deepNight/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                <Sun className="w-5 h-5 text-amethyst" />
                เสาชะตาทั้งสี่ของคุณ
              </CardTitle>
              <p className="text-xs text-ashGray mt-1">
                แต่ละเสาบอกถึงช่วงชีวิตและอิทธิพลต่างๆ ที่ส่งผลต่อคุณ
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  {
                    label: 'เสาปี',
                    pillar: fortuneReading.baziChart.yearPillar,
                    meaning: 'บรรพบุรุษ & สังคม',
                    icon: '👥'
                  },
                  {
                    label: 'เสาเดือน',
                    pillar: fortuneReading.baziChart.monthPillar,
                    meaning: 'พ่อแม่ & การงาน',
                    icon: '💼'
                  },
                  {
                    label: 'เสาวัน',
                    pillar: fortuneReading.baziChart.dayPillar,
                    meaning: 'ตัวคุณ & คู่ครอง',
                    icon: '❤️'
                  },
                  {
                    label: 'เสาชั่วโมง',
                    pillar: fortuneReading.baziChart.hourPillar,
                    meaning: 'ลูกหลาน & อนาคต',
                    icon: '🌟'
                  },
                ].map((item, idx) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + idx * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className="bg-gradient-to-b from-darkPurple/50 to-darkPurple/30 rounded-lg p-4 text-center space-y-2"
                  >
                    <div className="text-2xl">{item.icon}</div>
                    <p className="text-xs text-amethyst font-medium">{item.label}</p>
                    {item.pillar ? (
                      <div className="space-y-1">
                        <div className="bg-voidBlack/50 rounded px-2 py-1">
                          <p className="text-xs text-ghostWhite/60">
                            {item.pillar.stem} {item.pillar.branch}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-ashGray/50 italic">ไม่ทราบ</p>
                    )}
                    <p className="text-xs text-ashGray">{item.meaning}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Narrative Sections - Interactive */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <div className="text-center mb-6">
            <h3 className="text-xl md:text-2xl font-heading text-ghostWhite mb-2">
              คำทำนายโดยละเอียด
            </h3>
            <p className="text-sm text-ashGray">
              แตะเพื่อดูรายละเอียดแต่ละด้าน
            </p>
          </div>

          {narrativeSections.map((section, idx) => {
            const Icon = section.icon;
            const isExpanded = expandedSections.includes(section.id);

            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + idx * 0.1 }}
              >
                <Card
                  className="border-darkPurple/50 bg-deepNight/50 backdrop-blur cursor-pointer overflow-hidden"
                  onClick={() => toggleSection(section.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amethyst to-royalPurple flex items-center justify-center">
                          <Icon className="w-5 h-5 text-ghostWhite" />
                        </div>
                        <h4 className="text-lg font-heading text-ghostWhite">
                          {section.title}
                        </h4>
                      </div>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown className="w-5 h-5 text-ashGray" />
                      </motion.div>
                    </div>
                  </CardHeader>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <CardContent className="pt-0">
                          <div className="border-t border-darkPurple/30 pt-4">
                            <p className="text-ghostWhite/90 leading-loose whitespace-pre-wrap">
                              {section.content || 'กำลังประมวลผล...'}
                            </p>
                          </div>
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-3 pt-6"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/dashboard')}
            className="flex-1 py-4 bg-gradient-to-r from-royalPurple to-amethyst hover:from-amethyst hover:to-royalPurple text-ghostWhite rounded-lg transition-all font-heading text-base flex items-center justify-center gap-2 shadow-lg"
          >
            <Home className="w-5 h-5" />
            ไปยังแดชบอร์ด
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="flex-1 py-4 border-2 border-yellow-500/50 hover:border-yellow-400 hover:bg-yellow-500/10 text-ghostWhite rounded-lg transition-all font-heading text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <motion.div
              animate={{ rotate: isRegenerating ? 360 : 0 }}
              transition={{ duration: 1, repeat: isRegenerating ? Infinity : 0, ease: 'linear' }}
            >
              <RefreshCw className="w-5 h-5" />
            </motion.div>
            {isRegenerating ? 'กำลังสร้างดวงใหม่...' : 'สร้างดวงใหม่'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleShare(fortuneReading)}
            className="flex-1 py-4 border-2 border-royalPurple hover:border-amethyst hover:bg-royalPurple/20 text-ghostWhite rounded-lg transition-all font-heading text-base relative flex items-center justify-center gap-2"
          >
            {shareStatus === 'copied' ? (
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                คัดลอกลิงก์แล้ว!
              </span>
            ) : (
              <>
                <Share2 className="w-5 h-5" />
                แชร์ดวงชะตา
              </>
            )}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}