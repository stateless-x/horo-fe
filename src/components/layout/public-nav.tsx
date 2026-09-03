'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { SITE_SECTIONS } from '@/lib/site-sections';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const NAV_LINKS = SITE_SECTIONS;

export function PublicNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <header className="border-b border-edge sticky top-0 z-20 backdrop-blur bg-ground/80">
      <div className="max-w-5xl mx-auto px-4 py-3">
        {/* Main row: Logo | (nav on md+) | CTA */}
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="font-heading text-accentBright text-lg shrink-0">
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
                    ? 'bg-accent/20 text-accentBright'
                    : 'text-inkMuted hover:text-ink hover:bg-edgeSoft'
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            ))}
          </nav>

          <ThemeToggle />

          {/* CTA — always visible */}
          {session ? (
            <Link
              href="/dashboard"
              className="shrink-0 px-4 py-2 bg-accent hover:bg-accentBright text-accentInk font-heading text-sm rounded-lg transition-colors"
            >
              กลับสู่ดวงของเจ้า →
            </Link>
          ) : (
            <Link
              href="/fortune"
              className="shrink-0 px-4 py-2 bg-accent hover:bg-accentBright text-accentInk font-heading text-sm rounded-lg transition-colors"
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
                  ? 'bg-accent/20 text-accentBright'
                  : 'text-inkMuted hover:text-ink hover:bg-edgeSoft'
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
