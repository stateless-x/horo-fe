import { redirect } from 'next/navigation';
import { CompatibilityDashboard } from '@/features/compatibility/compatibility-dashboard';
import { compatibilityResultPath } from '@/features/compatibility/compatibility-routes';

interface CompatibilityPageProps {
  searchParams: Promise<{ id?: string | string[]; section?: string | string[] }>;
}

/** The index owns creation and history; legacy ?id= links redirect to the canonical result URL. */
export default async function CompatibilityPage({ searchParams }: CompatibilityPageProps) {
  const query = await searchParams;
  const id = Array.isArray(query.id) ? query.id[0] : query.id;
  const section = Array.isArray(query.section) ? query.section[0] : query.section;

  if (id) redirect(compatibilityResultPath(id, section));

  return <CompatibilityDashboard />;
}
