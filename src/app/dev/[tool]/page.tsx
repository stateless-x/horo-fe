/**
 * One route for every dev generator: /dev/<generator id>. Server-gated like
 * the hub, and 404s for an id the registry does not know.
 */
import { notFound } from 'next/navigation';
import { findDevGenerator } from '@/components/dev/generators';
import { DevGeneratorPage } from './dev-generator-page';

export const dynamic = 'force-dynamic';

export default async function DevToolPage({ params }: { params: Promise<{ tool: string }> }) {
  if (process.env.NODE_ENV === 'production') notFound();
  const { tool } = await params;
  if (!findDevGenerator(tool)) notFound();
  return <DevGeneratorPage toolId={tool} />;
}
