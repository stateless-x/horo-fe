import type { Metadata } from 'next';

// Route group exists only to scope the homepage canonical to "/" without
// leaking it into every other route (Next merges parent `alternates` into
// child metadata unless the child overrides it — see root layout.tsx).
export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
