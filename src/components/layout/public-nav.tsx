'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { SITE_SECTIONS } from '@/lib/site-sections';

const NAV_LINKS = SITE_SECTIONS;

export function PublicNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <header className="border-b border-white/5 sticky top-0 z-20 backdrop-blur bg-voidBlack/80">
      <div className="max-w-5xl mx-auto px-4 py-3">
        {/* Main row: Logo | (nav on md+) | CTA */}
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="font-heading text-amethyst text-lg shrink-0">
            สายมู
          </Link>

          {/* Nav links — hidden on small screens, shown on md+ */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-oracle text-sm transition-colors
                  ${pathname === href
                    ? 'bg-royalPurple/20 text-amethyst'
                    : 'text-ashGray hover:text-ghostWhite hover:bg-white/5'
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            ))}
          </nav>

          {/* CTA — always visible */}
          {session ? (
            <Link
              href="/dashboard"
              className="shrink-0 px-4 py-2 bg-royalPurple hover:bg-amethyst text-ghostWhite font-heading text-sm rounded-lg transition-colors"
            >
              กลับสู่ดวงของเจ้า →
            </Link>
          ) : (
            <Link
              href="/fortune"
              className="shrink-0 px-4 py-2 bg-royalPurple hover:bg-amethyst text-ghostWhite font-heading text-sm rounded-lg transition-colors"
            >
              เริ่มดูดวงฟรี →
            </Link>
          )}
        </div>

        {/* Nav links on mobile — shown below the main row on small screens */}
        <nav className="flex md:hidden items-center gap-1 mt-2 flex-wrap">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-oracle text-sm transition-colors
                ${pathname === href
                  ? 'bg-royalPurple/20 text-amethyst'
                  : 'text-ashGray hover:text-ghostWhite hover:bg-white/5'
                }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
