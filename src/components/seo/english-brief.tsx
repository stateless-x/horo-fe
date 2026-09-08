/**
 * The English block for machine readers.
 *
 * Why a <details> and not a hidden div: everything inside ships in the
 * server-rendered HTML, so crawlers and answer engines read the whole thing,
 * while a Thai reader sees one quiet summary line they can ignore or open.
 * Google indexes collapsed content normally. An off-screen or display:none
 * version of this same text would be cloaking — do not "optimise" it that way.
 *
 * `lang="en"` is load-bearing: the document is lang="th", and without the
 * override both screen readers and language classifiers mis-handle this block.
 */
export function EnglishBrief({
  title,
  paragraphs,
  facts,
}: {
  title: string;
  paragraphs: readonly string[];
  facts?: readonly string[];
}) {
  return (
    <details
      lang="en"
      className="group mt-16 rounded-xl border border-edge bg-surface2/20 open:bg-surface2/30 transition-colors"
    >
      <summary className="cursor-pointer list-none flex items-center justify-between gap-4 px-5 py-4 font-oracle text-sm text-inkMuted hover:text-ink">
        <span>{title}</span>
        <svg
          className="w-4 h-4 shrink-0 text-accentBright transition-transform group-open:rotate-90"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </summary>

      <div className="px-5 pb-5 space-y-4 text-sm leading-relaxed text-ink/80">
        {paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 48)}>{paragraph}</p>
        ))}

        {facts && facts.length > 0 ? (
          <ul className="space-y-2 pl-5 list-disc marker:text-accentBright">
            {facts.map((fact) => (
              <li key={fact.slice(0, 48)}>{fact}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </details>
  );
}
