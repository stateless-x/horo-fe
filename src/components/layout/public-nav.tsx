'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar } from 'lucide-react';

const NAV_LINKS = [
  { href: '/calendar', label: 'ปฏิทินไทย', icon: Calendar },
];

export function PublicNav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-white/5 sticky top-0 z-20 backdrop-blur bg-voidBlack/80">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="font-heading text-amethyst text-lg shrink-0">
          สายมู
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
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

        {/* CTA */}
        <Link
          href="/fortune"
          className="shrink-0 px-4 py-2 bg-royalPurple hover:bg-amethyst text-ghostWhite font-heading text-sm rounded-lg transition-colors"
        >
          ดูดวงของเจ้า →
        </Link>
      </div>
    </header>
  );
}
