'use client';

interface DonationButtonProps {
  children: React.ReactNode;
  variant?: 'default' | 'subtle';
  onClick?: () => void;
}

export function DonationButton({ children, variant = 'default', onClick }: DonationButtonProps) {
  const className = variant === 'subtle'
    ? 'inline-flex items-center justify-center gap-2 px-5 py-2 text-sm font-medium rounded-xl transition-all duration-200 bg-accent/20 text-lavender border border-accent/30 hover:bg-accent/40 hover:border-accentBright/50 cursor-pointer'
    : 'inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium rounded-xl transition-all duration-200 bg-gradient-to-r from-accent to-accentBright text-accentInk shadow-md shadow-accent/30 hover:shadow-lg hover:shadow-accentBright/30 cursor-pointer';

  return (
    <button
      type="button"
      onClick={onClick}
      className={className}
    >
      {children}
    </button>
  );
}
