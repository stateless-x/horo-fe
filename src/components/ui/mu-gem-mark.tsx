import type { SVGProps } from 'react';

interface MuGemMarkProps extends SVGProps<SVGSVGElement> {
  title?: string;
}

/**
 * The compact “มู” mark: a cut gemstone whose inner facets form a soft M.
 * It is intentionally text-free so it remains legible at wallet-icon size.
 */
export function MuGemMark({ title, className = 'size-5', ...props }: MuGemMarkProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      {...props}
    >
      {title && <title>{title}</title>}
      <path d="M8.5 16.5 16 7.5h16l7.5 9L24 41 8.5 16.5Z" fill="currentColor" fillOpacity=".13" />
      <path d="M8.5 16.5 16 7.5h16l7.5 9L24 41 8.5 16.5Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="m9 16.5 9.5 7.2L24 16l5.5 7.7 9.5-7.2M16 7.5l8 8.5 8-8.5M18.5 23.7 24 41l5.5-17.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M24 3.5c.35 2.55 1.35 4.05 4.2 4.75-2.85.7-3.85 2.2-4.2 4.75-.35-2.55-1.35-4.05-4.2-4.75 2.85-.7 3.85-2.2 4.2-4.75Z" fill="currentColor" />
    </svg>
  );
}
