import { AlertTriangle, Sparkles, Shield, Heart } from "lucide-react";
import type { ElementProfile } from "@/lib-packages/shared/types/astrology";
import { ELEMENT_COLORS } from "@/lib-packages/shared/constants/design";

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
    <div className="relative">
      {/* Ambient glow background */}
      <div
        className="absolute inset-0 rounded-3xl md:rounded-[32px] blur-2xl md:blur-3xl opacity-15 md:opacity-20"
        style={{ backgroundColor: elementColor.primary }}
      />

      {/* Main container with glassmorphism */}
      <div
        className="relative rounded-3xl md:rounded-[32px] border border-white/10 p-5 sm:p-8 md:p-10 overflow-hidden backdrop-blur-sm"
        style={{
          background: `linear-gradient(135deg, ${elementColor.glow}15, rgba(15, 10, 26, 0.8))`,
        }}
      >
        {/* Decorative gradient orbs - smaller on mobile */}
        <div
          className="absolute -top-16 -right-16 md:-top-24 md:-right-24 w-32 h-32 md:w-48 md:h-48 rounded-full blur-2xl md:blur-3xl opacity-15 md:opacity-20"
          style={{ backgroundColor: elementColor.primary }}
        />
        <div
          className="absolute -bottom-16 -left-16 md:-bottom-24 md:-left-24 w-32 h-32 md:w-48 md:h-48 rounded-full blur-2xl md:blur-3xl opacity-10"
          style={{ backgroundColor: elementColor.accent }}
        />

        {/* Element visual with animated rings - responsive sizing */}
        <div className="flex justify-center mb-6 md:mb-8 relative">
          {/* Outer pulsing ring */}
          <div
            className="absolute w-24 h-24 md:w-32 md:h-32 rounded-full animate-pulse"
            style={{
              background: `radial-gradient(circle, ${elementColor.glow}40, transparent)`,
            }}
          />

          {/* Middle ring */}
          <div
            className="absolute w-20 h-20 md:w-28 md:h-28 rounded-full border-2 opacity-30"
            style={{
              borderColor: elementColor.primary,
              animation: "spin 20s linear infinite",
            }}
          />

          {/* Main element orb */}
          <div
            className="relative w-16 h-16 md:w-24 md:h-24 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95 md:hover:scale-110 cursor-pointer group touch-manipulation"
            style={{
              backgroundColor: elementColor.glow,
              boxShadow: `0 0 40px ${elementColor.glow}, 0 0 60px ${elementColor.glow}40`,
            }}
          >
            <div
              className="w-12 h-12 md:w-16 md:h-16 rounded-full transition-all duration-300 group-active:scale-110 md:group-hover:w-20 md:group-hover:h-20"
              style={{ backgroundColor: elementColor.primary }}
            >
              <div
                className="w-full h-full rounded-full opacity-50"
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${elementColor.accent}, transparent)`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Element name and description with better spacing */}
        <div className="text-center mb-8 md:mb-10 relative z-10 px-2">
          <p className="font-thai text-ghostWhite/80 text-base md:text-lg mb-2 md:mb-3">
            ธาตุประจำตัวของเจ้าคือ
          </p>
          <h2
            className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold mb-3 md:mb-4 transition-all duration-300 active:scale-95 md:hover:scale-105 inline-block cursor-default touch-manipulation"
            style={{
              color: elementColor.primary,
              textShadow: `0 0 20px ${elementColor.glow}`,
            }}
          >
            {elementNames[elementProfile.primaryElement]}
          </h2>
          <p className="font-oracle text-ghostWhite text-base md:text-lg leading-relaxed md:leading-relaxed max-w-2xl mx-auto">
            {elementProfile.corePersonality}
          </p>
        </div>

        {/* Three info columns with glassmorphism cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Strengths */}
          <div
            className="group relative rounded-xl md:rounded-2xl p-5 md:p-6 transition-all duration-300 active:scale-95 md:hover:scale-105 md:hover:-translate-y-1 cursor-default touch-manipulation"
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
            }}
          >
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <Sparkles
                className="w-4 h-4 md:w-5 md:h-5 transition-colors duration-300 flex-shrink-0"
                style={{ color: elementColor.accent }}
              />
              <h3
                className="font-heading font-medium text-base md:text-lg transition-colors duration-300"
                style={{ color: elementColor.accent }}
              >
                จุดแข็ง
              </h3>
            </div>
            <ul className="space-y-2 md:space-y-2.5">
              {elementProfile.strengths.map((strength, index) => (
                <li
                  key={index}
                  className="text-ghostWhite font-thai text-sm md:text-base flex items-start gap-2 transition-all duration-300 md:hover:translate-x-1 leading-relaxed"
                >
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                    style={{ backgroundColor: elementColor.primary }}
                  />
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses */}
          <div
            className="group relative rounded-xl md:rounded-2xl p-5 md:p-6 transition-all duration-300 active:scale-95 md:hover:scale-105 md:hover:-translate-y-1 cursor-default touch-manipulation"
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
            }}
          >
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <Shield
                className="w-4 h-4 md:w-5 md:h-5 transition-colors duration-300 flex-shrink-0"
                style={{ color: elementColor.accent }}
              />
              <h3
                className="font-heading font-medium text-base md:text-lg transition-colors duration-300"
                style={{ color: elementColor.accent }}
              >
                จุดอ่อน
              </h3>
            </div>
            <ul className="space-y-2 md:space-y-2.5">
              {elementProfile.weaknesses.map((weakness, index) => (
                <li
                  key={index}
                  className="text-ghostWhite font-thai text-sm md:text-base flex items-start gap-2 transition-all duration-300 md:hover:translate-x-1 leading-relaxed"
                >
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                    style={{ backgroundColor: elementColor.primary }}
                  />
                  <span>{weakness}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Compatible elements */}
          <div
            className="group relative rounded-xl md:rounded-2xl p-5 md:p-6 transition-all duration-300 active:scale-95 md:hover:scale-105 md:hover:-translate-y-1 cursor-default touch-manipulation"
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
            }}
          >
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <Heart
                className="w-4 h-4 md:w-5 md:h-5 transition-colors duration-300 flex-shrink-0"
                style={{ color: elementColor.accent }}
              />
              <h3
                className="font-heading font-medium text-base md:text-lg transition-colors duration-300"
                style={{ color: elementColor.accent }}
              >
                ธาตุที่เข้ากัน
              </h3>
            </div>
            <ul className="space-y-2 md:space-y-2.5">
              {elementProfile.compatibleElements.map((element, index) => (
                <li
                  key={index}
                  className="text-ghostWhite font-thai text-sm md:text-base flex items-start gap-2 transition-all duration-300 md:hover:translate-x-1 leading-relaxed"
                >
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                    style={{ backgroundColor: elementColor.primary }}
                  />
                  <span>{elementNames[element]}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Conflict warning with improved styling */}
        <div
          className="relative rounded-xl md:rounded-2xl p-4 md:p-5 flex items-start gap-3 md:gap-4 transition-all duration-300 active:scale-95 md:hover:scale-[1.02] cursor-default overflow-hidden touch-manipulation"
          style={{
            background: "rgba(251, 191, 36, 0.05)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(251, 191, 36, 0.2)",
            boxShadow: "0 4px 20px rgba(251, 191, 36, 0.1)",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-amber-400/5 to-transparent" />
          <AlertTriangle className="text-amber-400 w-5 h-5 md:w-6 md:h-6 flex-shrink-0 mt-0.5 relative z-10 animate-pulse" />
          <div className="relative z-10">
            <p className="text-ghostWhite font-thai text-sm md:text-base lg:text-lg leading-relaxed">
              <span className="text-amber-400 font-medium">ระวังธาตุ:</span>{" "}
              <span className="font-semibold">{elementNames[elementProfile.conflictingElement]}</span>
              {" "}
              <span className="text-ashGray">(ธาตุนี้ข่มธาตุของเจ้า)</span>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
