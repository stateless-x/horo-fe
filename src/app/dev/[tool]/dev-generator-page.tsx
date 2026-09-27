'use client';

import Link from 'next/link';
import { DevGenerator } from '@/components/dev/dev-generator';
import { findDevGenerator } from '@/components/dev/generators';

/**
 * Looks the config up on the client: a config carries render functions, which
 * cannot cross from a server component as props.
 */
export function DevGeneratorPage({ toolId }: { toolId: string }) {
  const config = findDevGenerator(toolId);
  if (!config) throw new Error(`Unknown dev generator: ${toolId}`);
  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <Link href="/dev" className="inline-flex min-h-11 items-center text-sm text-accentBright hover:text-ink">
        กลับไปหน้ารวมเครื่องมือ
      </Link>
      <DevGenerator config={config} />
    </main>
  );
}
