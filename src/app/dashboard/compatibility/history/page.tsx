import { CompatibilityHistoryPage } from '@/features/compatibility/compatibility-history-page';
import { parseHistoryPage, parseHistoryType } from '@/features/compatibility/compatibility-routes';

interface CompatibilityHistoryRouteProps {
  searchParams: Promise<{ page?: string | string[]; type?: string | string[] }>;
}

/** Every compatibility check the reader has made, paged; `?type=` filters by relationship. */
export default async function CompatibilityHistoryRoute({ searchParams }: CompatibilityHistoryRouteProps) {
  const query = await searchParams;
  const page = Array.isArray(query.page) ? query.page[0] : query.page;
  const type = Array.isArray(query.type) ? query.type[0] : query.type;

  return <CompatibilityHistoryPage page={parseHistoryPage(page)} type={parseHistoryType(type)} />;
}
