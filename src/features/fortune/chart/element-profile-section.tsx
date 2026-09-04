import { AlertTriangle } from "lucide-react";
import type { ElementProfile } from "@/lib-packages/shared/types/astrology";
import { ELEMENT_COLORS } from "@/lib-packages/shared/constants/design";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { ElementClayImage } from "@/components/ui/element-clay-image";

interface ElementProfileSectionProps {
  elementProfile: ElementProfile;
}

export function ElementProfileSection({
  elementProfile,
}: ElementProfileSectionProps) {
  const elementColor = ELEMENT_COLORS[elementProfile.primaryElement];
  const elementTextColor = `var(--el-${elementProfile.primaryElement})`;

  const elementNames: Record<string, string> = {
    earth: "ธาตุดิน",
    fire: "ธาตุไฟ",
    water: "ธาตุน้ำ",
    wood: "ธาตุไม้",
    metal: "ธาตุทอง",
  };

  return (
    <div className="glass-card relative rounded-2xl p-8 overflow-hidden">
      {/* Element-tinted glow orb */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/3 w-72 h-72 rounded-full blur-3xl opacity-20 -z-10"
        style={{ backgroundColor: elementColor.primary }}
      />

      {/* Element visual */}
      <div className="flex justify-center mb-6">
        <div
          className="relative w-36 h-36 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: elementColor.glow,
            boxShadow: `0 16px 36px ${elementColor.glow}`,
          }}
        >
          <ElementClayImage
            element={elementProfile.primaryElement}
            alt={`โมเดลดินปั้น ${elementNames[elementProfile.primaryElement]}`}
            sizes="144px"
            priority
            className="h-full w-full scale-110 drop-shadow-[0_12px_18px_rgba(107,33,168,0.14)]"
          />
        </div>
      </div>

      {/* Element name and description */}
      <div className="text-center mb-8">
        <p className="font-thai text-ink text-base mb-2">
          ธาตุประจำตัวของเจ้าคือ
          <InfoTooltip text="ธาตุหลักที่กำหนดบุคลิกและชะตาของเจ้า คำนวณจากวันเดือนปีเกิดตามหลัก Bazi (ซื่อจู๋)" />
        </p>
        <h2
          className="font-heading text-3xl font-bold mb-3"
          style={{ color: elementTextColor }}
        >
          {elementNames[elementProfile.primaryElement]}
        </h2>
        <p className="font-oracle text-ink text-base leading-relaxed max-w-[68ch] mx-auto text-left">
          {elementProfile.corePersonality}
        </p>
      </div>

      {/* Three info columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Strengths */}
        <div className="bg-overlay border border-edge rounded-lg p-4">
          <h3 className="text-accentSoft font-heading font-medium text-base mb-3">
            จุดแข็ง
          </h3>
          <ul className="space-y-1.5">
            {elementProfile.strengths.map((strength, index) => (
              <li key={index} className="text-ink font-thai text-base">
                {strength}
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="bg-overlay border border-edge rounded-lg p-4">
          <h3 className="text-accentSoft font-heading font-medium text-base mb-3">
            จุดอ่อน
          </h3>
          <ul className="space-y-1.5">
            {elementProfile.weaknesses.map((weakness, index) => (
              <li key={index} className="text-ink font-thai text-base">
                {weakness}
              </li>
            ))}
          </ul>
        </div>

        {/* Compatible elements */}
        <div className="bg-overlay border border-edge rounded-lg p-4">
          <h3 className="text-accentSoft font-heading font-medium text-base mb-3">
            เข้ากันดี
          </h3>
          <ul className="space-y-1.5">
            {elementProfile.compatibleElements.map((element, index) => (
              <li key={index} className="text-ink font-thai text-base">
                {elementNames[element]}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Conflict warning */}
      <div className="bg-warn/10 border border-warn/30 rounded-lg p-4 flex items-start gap-3">
        <AlertTriangle className="text-warn w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-inkMuted font-thai text-base">
            <span className="text-warn font-medium">ระวังธาตุ:</span>{" "}
            {elementNames[elementProfile.conflictingElement]} (ข่มธาตุของเจ้า)
          </p>
        </div>
      </div>
    </div>
  );
}
