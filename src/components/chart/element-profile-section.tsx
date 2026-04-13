import { AlertTriangle } from "lucide-react";
import type { ElementProfile } from "@/lib-packages/shared/types/astrology";
import { ELEMENT_COLORS } from "@/lib-packages/shared/constants/design";
import { InfoTooltip } from "@/components/ui/info-tooltip";

interface ElementProfileSectionProps {
  elementProfile: ElementProfile;
}

export function ElementProfileSection({
  elementProfile,
}: ElementProfileSectionProps) {
  const elementColor = ELEMENT_COLORS[elementProfile.primaryElement];

  const elementNames: Record<string, string> = {
    earth: "ธาตุดิน",
    fire: "ธาตุไฟ",
    water: "ธาตุน้ำ",
    wood: "ธาตุไม้",
    metal: "ธาตุทอง",
  };

  return (
    <div
      className="rounded-2xl border border-darkPurple/50 p-8"
      style={{
        background: `linear-gradient(to bottom, ${elementColor.glow}, rgb(15, 10, 26))`,
      }}
    >
      {/* Element visual placeholder - you can add illustrations here */}
      <div className="flex justify-center mb-6">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: elementColor.glow,
            boxShadow: `0 0 40px ${elementColor.glow}`,
          }}
        >
          <div
            className="w-16 h-16 rounded-full"
            style={{ backgroundColor: elementColor.primary }}
          />
        </div>
      </div>

      {/* Element name and description */}
      <div className="text-center mb-8">
        <p className="font-thai text-ghostWhite text-base mb-2">
          ธาตุประจำตัวของเจ้าคือ
          <InfoTooltip text="ธาตุหลักที่กำหนดบุคลิกและชะตาของเจ้า คำนวณจากวันเดือนปีเกิดตามหลัก Bazi (ซื่อจู๋)" />
        </p>
        <h2
          className="font-heading text-3xl font-bold mb-3"
          style={{ color: elementColor.primary }}
        >
          {elementNames[elementProfile.primaryElement]}
        </h2>
        <p className="font-oracle text-ghostWhite text-base leading-relaxed">
          {elementProfile.corePersonality}
        </p>
      </div>

      {/* Three info columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Strengths */}
        <div className="bg-charcoal border border-darkPurple/50 rounded-lg p-4">
          <h3 className="text-lavenderGlow font-heading font-medium text-base mb-3">
            จุดแข็ง
          </h3>
          <ul className="space-y-1.5">
            {elementProfile.strengths.map((strength, index) => (
              <li key={index} className="text-ghostWhite font-thai text-base">
                {strength}
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="bg-charcoal border border-darkPurple/50 rounded-lg p-4">
          <h3 className="text-lavenderGlow font-heading font-medium text-base mb-3">
            จุดอ่อน
          </h3>
          <ul className="space-y-1.5">
            {elementProfile.weaknesses.map((weakness, index) => (
              <li key={index} className="text-ghostWhite font-thai text-base">
                {weakness}
              </li>
            ))}
          </ul>
        </div>

        {/* Compatible elements */}
        <div className="bg-charcoal border border-darkPurple/50 rounded-lg p-4">
          <h3 className="text-lavenderGlow font-heading font-medium text-base mb-3">
            เข้ากันดี
          </h3>
          <ul className="space-y-1.5">
            {elementProfile.compatibleElements.map((element, index) => (
              <li key={index} className="text-ghostWhite font-thai text-base">
                {elementNames[element]}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Conflict warning */}
      <div className="bg-darkPurple/20 border border-amber-400/20 rounded-lg p-4 flex items-start gap-3">
        <AlertTriangle className="text-amber-400 w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-ashGray font-thai text-base">
            <span className="text-amber-400 font-medium">ระวังธาตุ:</span>{" "}
            {elementNames[elementProfile.conflictingElement]} (ข่มธาตุของเจ้า)
          </p>
        </div>
      </div>
    </div>
  );
}
