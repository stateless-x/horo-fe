"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Heart, Calendar, Orbit } from "lucide-react";

interface FooterContext {
  shareCta: string | null;
  shareEnabled: boolean;
  crossLinks: Array<{
    label: string;
    href: string;
    icon: React.ElementType;
  }>;
}

const FOOTER_CONTEXT: Record<string, FooterContext> = {
  "/dashboard/fortune": {
    shareCta: "ชอบดวงชะตาของเจ้าหรือเปล่า? แชร์ให้เพื่อนได้เลย!",
    shareEnabled: true,
    crossLinks: [
      {
        label: "ส่องดวงความสัมพันธ์",
        href: "/dashboard/compatibility",
        icon: Heart,
      },
      // { label: "ดูดวงรายวัน", href: "/dashboard/today", icon: Calendar },
    ],
  },
  "/dashboard/today": {
    shareCta: "แชร์ดวงวันนี้ให้เพื่อน!",
    shareEnabled: true,
    crossLinks: [
      { label: "ดูดวงแบบเต็ม", href: "/dashboard/fortune", icon: Orbit },
      {
        label: "ส่องดวงความสัมพันธ์",
        href: "/dashboard/compatibility",
        icon: Heart,
      },
    ],
  },
  "/dashboard": {
    shareCta: "แชร์ดวงวันนี้ให้เพื่อน!",
    shareEnabled: true,
    crossLinks: [
      { label: "ดูดวงแบบเต็ม", href: "/dashboard/fortune", icon: Orbit },
      {
        label: "ส่องดวงความสัมพันธ์",
        href: "/dashboard/compatibility",
        icon: Heart,
      },
    ],
  },
  "/dashboard/compatibility": {
    shareCta: "แชร์ผลดวงความสัมพันธ์ให้คนพิเศษ!",
    shareEnabled: true,
    crossLinks: [
      { label: "ดูดวงแบบเต็ม", href: "/dashboard/fortune", icon: Orbit },
      // { label: 'ดูดวงรายวัน', href: '/dashboard/today', icon: Calendar },
    ],
  },
};

const DEFAULT_CONTEXT: FooterContext = {
  shareCta: null,
  shareEnabled: false,
  crossLinks: [],
};

function PlatformIcon({
  platform,
}: {
  platform: "line" | "facebook" | "twitter";
}) {
  const colors = {
    line: "#00B900",
    facebook: "#1877F2",
    twitter: "#FFFFFF",
  };

  const icons = {
    line: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
      </svg>
    ),
    facebook: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    twitter: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  };

  return <span style={{ color: colors[platform] }}>{icons[platform]}</span>;
}

export function Footer() {
  const pathname = usePathname();
  const context = FOOTER_CONTEXT[pathname] || DEFAULT_CONTEXT;
  const isFortuneOrCompatibilityPage =
    pathname === "/dashboard/fortune" ||
    pathname === "/dashboard/compatibility";

  return (
    <footer
      className={`w-full border-t border-darkPurple/30 bg-deepNight/50 backdrop-blur-sm mt-16 ${
        isFortuneOrCompatibilityPage ? "pb-28" : ""
      }`}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Share CTA block */}
        {context.shareEnabled && context.shareCta && (
          <div className="bg-gradient-to-r from-royalPurple/10 to-amethyst/10 border border-amethyst/20 rounded-xl p-6 mb-6">
            <p className="font-heading text-lg text-ghostWhite font-medium text-center mb-4">
              {context.shareCta}
            </p>

            {/* Compact share buttons */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  const url = window.location.href;
                  const text = encodeURIComponent("มาดูดวงชะตาของฉันกันเถอะ!");
                  const encodedUrl = encodeURIComponent(url);
                  window.open(
                    `https://social-plugins.line.me/lineit/share?url=${encodedUrl}&text=${text}`,
                    "_blank",
                    "width=600,height=400",
                  );
                }}
                className="w-11 h-11 flex items-center justify-center bg-charcoal border border-darkPurple/50 rounded-lg transition-all duration-200 hover:border-royalPurple/50 hover:bg-darkPurple/20"
              >
                <PlatformIcon platform="line" />
              </button>

              <button
                onClick={() => {
                  const url = window.location.href;
                  const text = encodeURIComponent("มาดูดวงของเจ้ากันเถอะ!");
                  const encodedUrl = encodeURIComponent(url);
                  window.open(
                    `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${text}`,
                    "_blank",
                    "width=600,height=400",
                  );
                }}
                className="w-11 h-11 flex items-center justify-center bg-charcoal border border-darkPurple/50 rounded-lg transition-all duration-200 hover:border-royalPurple/50 hover:bg-darkPurple/20"
              >
                <PlatformIcon platform="facebook" />
              </button>

              <button
                onClick={() => {
                  const url = window.location.href;
                  const text = encodeURIComponent(
                    `มาดูดวงของเจ้ากันเถอะ! ${url}`,
                  );
                  window.open(
                    `https://twitter.com/intent/tweet?text=${text}`,
                    "_blank",
                    "width=600,height=400",
                  );
                }}
                className="w-11 h-11 flex items-center justify-center bg-charcoal border border-darkPurple/50 rounded-lg transition-all duration-200 hover:border-royalPurple/50 hover:bg-darkPurple/20"
              >
                <PlatformIcon platform="twitter" />
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                }}
                className="px-4 h-11 flex items-center justify-center gap-2 bg-charcoal border border-darkPurple/50 rounded-lg transition-all duration-200 hover:border-royalPurple/50 hover:bg-darkPurple/20"
              >
                <svg
                  className="w-4 h-4 text-ghostWhite"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
                <span className="font-heading text-base text-ghostWhite">
                  คัดลอกลิงก์
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Cross-promotion links */}
        {/* {context.crossLinks.length > 0 && (
          <div className="mb-6">
            <h4 className="font-heading text-base text-ghostWhite font-medium text-center mb-4">
              ลองฟีเจอร์อื่น
            </h4>
            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
              {context.crossLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="bg-charcoal border border-darkPurple/50 rounded-xl p-4 flex items-center gap-3 transition-all duration-200 hover:border-royalPurple/50 hover:bg-darkPurple/20"
                  >
                    <Icon className="text-lavenderGlow w-6 h-6" />
                    <span className="font-heading text-base text-ghostWhite">
                      {link.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )} */}

        {/* Attribution */}
        <div className="flex flex-col items-center justify-center gap-2 text-sm text-ashGray">
          <a
            href="https://x.com/askpurin"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-1 transition-colors duration-200"
          >
            <span className="flex items-center gap-1.5">
              Made with <span className="text-amethyst">&#10024;</span> by
              <span className="font-medium text-amethyst group-hover:text-lavenderGlow transition-colors duration-200">
                @Askpurin
              </span>
            </span>
            <span className="text-xs text-ashGray/50 group-hover:text-amethyst/80 transition-colors duration-200">
              ชอบก็มาติดตามกันได้นะ &#128156;
            </span>
          </a>
          <span className="text-xs text-ashGray/40">v 0.0.1</span>
        </div>
      </div>
    </footer>
  );
}
