import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from '@/lib-packages/ui';
import { THAI_MONTHS, MBTI_TYPES, type RelationshipType, RELATIONSHIP_TYPES, RELATIONSHIP_LABELS } from '@/lib-packages/shared';
import { Loader2, Moon } from 'lucide-react';
import { RELATIONSHIP_CONFIG, type RelationshipConfig } from '@/features/compatibility/relationship-config';

interface CompatibilityFormProps {
  config: RelationshipConfig;
  relationshipType: RelationshipType;
  onRelationshipTypeChange: (type: RelationshipType) => void;
  partnerName: string;
  onPartnerNameChange: (name: string) => void;
  day: string;
  onDayChange: (day: string) => void;
  month: string;
  onMonthChange: (month: string) => void;
  year: string;
  onYearChange: (year: string) => void;
  partnerMbti: string;
  onPartnerMbtiChange: (mbti: string) => void;
  currentYear: number;
  error: string;
  calculating: boolean;
  isRateLimited: boolean;
  rateLimitCountdown: number;
  rateLimitInfo: { remaining: number; resetAt: string; retryAfter: number } | null;
  onCalculate: () => void;
}

export function CompatibilityForm({
  config,
  relationshipType,
  onRelationshipTypeChange,
  partnerName,
  onPartnerNameChange,
  day,
  onDayChange,
  month,
  onMonthChange,
  year,
  onYearChange,
  partnerMbti,
  onPartnerMbtiChange,
  currentYear,
  error,
  calculating,
  isRateLimited,
  rateLimitCountdown,
  rateLimitInfo,
  onCalculate,
}: CompatibilityFormProps) {
  return (
    <>
      {/* Relationship Type Selector */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}>
        <label className="block text-sm md:text-base text-inkMuted mb-3">เลือกประเภทความสัมพันธ์</label>
        <div className="flex flex-wrap gap-2">
          {RELATIONSHIP_TYPES.map((type) => {
            const typeConfig = RELATIONSHIP_CONFIG[type];
            const Icon = typeConfig.icon;
            const isSelected = relationshipType === type;

            return (
              <motion.button
                key={type}
                onClick={() => onRelationshipTypeChange(type)}
                className={`inline-flex items-center gap-1.5 px-4 h-11 rounded-full text-sm md:text-base font-medium transition-all border ${
                  isSelected
                    ? `${typeConfig.accentBg} ${typeConfig.accentBorder} ${typeConfig.accent}`
                    : 'bg-surface border-surface2/50 text-inkMuted hover:border-accent/50'
                }`}
                whileTap={{ scale: 0.95 }}
                {...(type === 'talking' ? {
                  initial: { boxShadow: '0 0 0 0 rgba(236, 72, 153, 0)' },
                  animate: isSelected ? {} : {
                    boxShadow: [
                      '0 0 0 0 rgba(236, 72, 153, 0)',
                      '0 0 8px 2px rgba(236, 72, 153, 0.3)',
                      '0 0 0 0 rgba(236, 72, 153, 0)',
                    ],
                  },
                  transition: { duration: 2, repeat: 1, delay: 0.5 },
                } : {})}
              >
                <Icon className="w-4 h-4" />
                {RELATIONSHIP_LABELS[type]}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Error Display */}
      <AnimatePresence>
        {error && !isRateLimited && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-danger/10 border border-danger/30 rounded-xl p-4"
          >
            <p className="text-danger text-center text-base md:text-lg">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rate Limit Card */}
      <AnimatePresence>
        {isRateLimited && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="bg-gradient-to-br from-surface2 to-surface border-accentBright/30">
              <CardContent className="pt-6">
                <div className="text-center space-y-3">
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Moon className="w-10 h-10 text-accentBright mx-auto" />
                  </motion.div>
                  <p className="text-ink font-medium text-base md:text-lg">พลังดวงดาวต้องการเวลาฟื้นฟู</p>
                  <p className="text-inkMuted text-sm md:text-base">
                    {rateLimitCountdown > 3600
                      ? 'เจ้าส่องดวงครบ 5 ครั้งในวันนี้แล้ว'
                      : 'เจ้าได้ส่องดวงครบ 5 ครั้งในชั่วโมงนี้แล้ว'}
                  </p>
                  <p className="text-accentBright text-sm md:text-base">
                    {rateLimitCountdown > 3600
                      ? `กลับมาใหม่พรุ่งนี้นะ`
                      : `ดวงดาวจะพร้อมอีกครั้งใน ${Math.ceil(rateLimitCountdown / 60)} นาที`}
                  </p>
                  <div className="w-full bg-surface rounded-full h-1 overflow-hidden" role="progressbar" aria-label="เวลาที่เหลือก่อนส่องดวงได้อีกครั้ง">
                    <motion.div
                      className="h-full bg-accentBright/60 rounded-full"
                      initial={{ width: '100%' }}
                      animate={{ width: '0%' }}
                      transition={{ duration: rateLimitCountdown, ease: 'linear' }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Form */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardHeader>
            <AnimatePresence mode="wait">
              <motion.div
                key={relationshipType}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <CardTitle className="text-lg md:text-xl">{config.cardTitle}</CardTitle>
              </motion.div>
            </AnimatePresence>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm md:text-base text-inkMuted mb-2">ชื่อ</label>
              <AnimatePresence mode="wait">
                <motion.div
                  key={relationshipType}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Input
                    value={partnerName}
                    onChange={(e) => onPartnerNameChange(e.target.value)}
                    placeholder={config.placeholder}
                    className="text-base"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            <div>
              <label className="block text-sm md:text-base text-inkMuted mb-3">วันเกิด</label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs md:text-sm text-inkMuted/70 mb-2 text-center">วัน</label>
                  <select
                    value={day}
                    onChange={(e) => onDayChange(e.target.value)}
                    className="w-full h-12 bg-overlay border border-inkMuted/30 rounded-lg text-center text-base text-ink focus:ring-2 focus:ring-accentBright focus:border-transparent transition-all cursor-pointer hover:border-accentBright/50"
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs md:text-sm text-inkMuted/70 mb-2 text-center">เดือน</label>
                  <select
                    value={month}
                    onChange={(e) => onMonthChange(e.target.value)}
                    className="w-full h-12 bg-overlay border border-inkMuted/30 rounded-lg text-center text-sm text-ink focus:ring-2 focus:ring-accentBright focus:border-transparent transition-all cursor-pointer hover:border-accentBright/50"
                  >
                    {THAI_MONTHS.map((m, i) => (
                      <option key={i} value={i + 1}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs md:text-sm text-inkMuted/70 mb-2 text-center">พ.ศ.</label>
                  <select
                    value={year}
                    onChange={(e) => onYearChange(e.target.value)}
                    className="w-full h-12 bg-overlay border border-inkMuted/30 rounded-lg text-center text-base text-ink focus:ring-2 focus:ring-accentBright focus:border-transparent transition-all cursor-pointer hover:border-accentBright/50"
                  >
                    {Array.from({ length: 80 }, (_, i) => currentYear - i).map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="text-xs md:text-sm text-inkMuted/60 mt-2 text-center">ตัวอย่าง: 15 มิถุนายน 2540</p>
            </div>

            <div>
              <label className="block text-sm md:text-base text-inkMuted mb-2">MBTI (ถ้ารู้)</label>
              <select
                value={partnerMbti}
                onChange={(e) => onPartnerMbtiChange(e.target.value)}
                className="w-full h-12 bg-overlay border border-inkMuted/30 rounded-lg text-center text-base text-ink focus:ring-2 focus:ring-accentBright focus:border-transparent transition-all cursor-pointer hover:border-accentBright/50"
              >
                <option value="">ไม่ระบุ</option>
                {MBTI_TYPES.map((m) => (
                  <option key={m.code} value={m.code}>{m.code} — {m.nameTh}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${relationshipType}-cta`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Button
                    onClick={onCalculate}
                    size="lg"
                    className="w-full"
                    disabled={!partnerName.trim() || calculating || isRateLimited}
                  >
                    {isRateLimited ? (
                      <>
                        <Moon className="w-5 h-5 mr-2" />
                        ดวงดาวกำลังฟื้นฟู...
                      </>
                    ) : calculating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        กำลังคำนวณ...
                      </>
                    ) : (
                      config.cta
                    )}
                  </Button>
                </motion.div>
              </AnimatePresence>

              {/* Explain why the CTA is unavailable instead of a silently dimmed button */}
              {!partnerName.trim() && !calculating && !isRateLimited && (
                <p className="text-inkMuted text-xs md:text-sm text-center">กรอกชื่อก่อน แล้วปุ่มส่องดวงจะพร้อมใช้</p>
              )}

              {/* Low remaining warning */}
              {rateLimitInfo && rateLimitInfo.remaining <= 2 && rateLimitInfo.remaining > 0 && !isRateLimited && (
                <p className="text-warn text-xs md:text-sm text-center">ส่องดวงได้อีก {rateLimitInfo.remaining} ครั้งในวันนี้</p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
}
