/**
 * Dev-only hub for the generator tools. A server component on purpose:
 * `notFound()` is only authoritative on the server, so this 404s in a
 * production build (the same gate as /loader-preview). `force-dynamic` keeps
 * the check per request instead of baked in at build time.
 */
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DEV_GENERATORS } from '@/components/dev/generators';

export const dynamic = 'force-dynamic';

export default function DevHubPage() {
  if (process.env.NODE_ENV === 'production') notFound();

  return (
    <main className="mx-auto max-w-4xl space-y-8 px-4 py-10">
      <header className="space-y-2">
        <p className="font-mono text-xs text-inkMuted">dev tools · localhost only</p>
        <h1 className="font-heading text-2xl font-semibold text-ink">เครื่องมือสร้างดวง</h1>
        <p className="max-w-[65ch] text-inkMuted">
          เรียก calculator, prompt และ DeepSeek จริงจากข้อมูลในฟอร์ม ไม่อ่านหรือเขียนฐานข้อมูล ไม่ใช้ quota
        </p>
      </header>
      <ul className="grid gap-4 sm:grid-cols-2">
        {DEV_GENERATORS.map((generator) => (
          <li key={generator.id}>
            <Link
              href={`/dev/${generator.id}`}
              className="block min-h-11 rounded-2xl border border-edge bg-surface p-5 transition-colors hover:bg-surface2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright"
            >
              <span className="font-heading text-lg font-semibold text-ink">{generator.title}</span>
              <span className="mt-1 block text-sm text-inkMuted">{generator.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
