interface HeroSectionProps {
  personalityTraits: string[];
  birthDateFormatted: string;
  currentAge: number;
  userName: string;
  elementAccent?: string;
}

export function HeroSection({
  personalityTraits,
  birthDateFormatted,
  currentAge,
  userName,
  elementAccent,
}: HeroSectionProps) {
  return (
    <div className="bg-gradient-to-b from-darkPurple/30 to-voidBlack rounded-2xl p-8 text-center relative">
      {/* "คำทำนายพร้อมแล้ว" badge */}
      <div className="inline-flex items-center justify-center mb-6">
        <div className="bg-royalPurple/20 border border-amethyst/30 text-lavenderGlow rounded-full px-4 py-1 text-[13px] font-heading font-medium animate-glow">
          คำทำนายของเจ้าพร้อมแล้ว
        </div>
      </div>

      {/* User name */}
      <h1 className="font-heading text-ghostWhite font-semibold text-3xl md:text-4xl mb-2">
        ดวงชะตาของ {userName}
      </h1>

      {/* Birth date and age */}
      <p className="font-thai text-ashGray text-sm md:text-base mb-6">
        {birthDateFormatted} · อายุ {currentAge} ปี
      </p>

      {/* Personality traits badge */}
      <div
        className="inline-block border rounded-lg px-6 py-3"
        style={{
          backgroundColor: elementAccent
            ? `${elementAccent}1a` // 10% opacity
            : "rgb(26, 10, 46, 0.3)", // darkPurple/30
          borderColor: elementAccent
            ? `${elementAccent}80` // 50% opacity
            : "rgb(26, 10, 46, 0.5)", // darkPurple/50
        }}
      >
        <p className="text-paleOrchid font-thai text-sm">
          <span className="font-heading font-medium text-lavenderGlow">
            บุคลิกภาพ:
          </span>{" "}
          {personalityTraits.join(" · ")}
        </p>
      </div>

      {/* Optional radial glow behind name */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amethyst/10 rounded-full blur-3xl -z-10 pointer-events-none" />
    </div>
  );
}
