import { CompatibilityResultPage as CompatibilityResultScreen } from '@/features/compatibility/compatibility-result-page';

interface CompatibilityResultPageProps {
  params: Promise<{ id: string }>;
}

/** Canonical, authenticated URL for one generated compatibility report. */
export default async function CompatibilityResultPage({ params }: CompatibilityResultPageProps) {
  const { id } = await params;
  return <CompatibilityResultScreen resultId={id} />;
}
