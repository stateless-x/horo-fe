'use client';

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { createPortal } from 'react-dom';
import { z } from 'zod';
import { FlaskConical, PanelBottom, PanelRight, X } from 'lucide-react';
import { DevGenerator } from './dev-generator';
import { DEV_GENERATORS } from './generators';

const STORAGE_KEY = 'horo-devtools';
const MIN_HEIGHT = 200;
const MIN_WIDTH = 360;

const PrefsSchema = z.object({
  open: z.boolean(),
  dock: z.enum(['bottom', 'right']),
  height: z.number().min(MIN_HEIGHT),
  width: z.number().min(MIN_WIDTH),
  tab: z.string(),
});
type Prefs = z.infer<typeof PrefsSchema>;

const DEFAULT_PREFS: Prefs = {
  open: false,
  dock: 'bottom',
  height: 420,
  width: 640,
  tab: DEV_GENERATORS[0].id,
};

/**
 * Stored preferences, or the defaults when there are none or they no longer
 * parse (an older shape, or hand-edited). Storage can also be unavailable
 * (private mode, blocked site data); the panel then just doesn't remember.
 */
function readPrefs(): Prefs {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    // Storage blocked: start from the defaults every time.
    return DEFAULT_PREFS;
  }
  if (raw === null) return DEFAULT_PREFS;
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    // Not JSON (hand-edited or another tool's key): start over.
    return DEFAULT_PREFS;
  }
  const parsed = PrefsSchema.safeParse(json);
  if (!parsed.success) return DEFAULT_PREFS;
  const knownTab = DEV_GENERATORS.some((generator) => generator.id === parsed.data.tab);
  return knownTab ? parsed.data : { ...parsed.data, tab: DEFAULT_PREFS.tab };
}

function writePrefs(prefs: Prefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Storage unavailable: the panel still works, it just forgets on reload.
  }
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/**
 * Alt+Shift+D. Ctrl/Cmd+Shift+D is Chrome's bookmark-all-tabs; Alt+Shift+D is
 * not taken by Chrome, Safari or macOS (on a Mac, Option+Shift+D only types a
 * character, which is why the match is on `code`, not `key`).
 */
const DEVTOOLS_SHORTCUT = 'Alt+Shift+D';

export function isDevtoolsShortcut(event: Pick<KeyboardEvent, 'altKey' | 'shiftKey' | 'ctrlKey' | 'metaKey' | 'code'>): boolean {
  return event.altKey && event.shiftKey && !event.ctrlKey && !event.metaKey && event.code === 'KeyD';
}

/** Never steal a keystroke from someone typing. */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

/**
 * horo devtools: a floating toggle that opens a docked panel with one tab per
 * dev generator. Dev builds only (see devtools-loader.tsx). Rendered into a
 * portal on <body> as a fixed overlay, so it never moves the page under it.
 * Alt+Shift+D (Option+Shift+D on a Mac) toggles it; see DEVTOOLS_SHORTCUT.
 */
export function HoroDevtools() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [mounted, setMounted] = useState(false);
  const resizing = useRef(false);

  // Read storage after mount: the first client render must match the server's (nothing).
  useEffect(() => {
    setPrefs(readPrefs());
    setMounted(true);
  }, []);

  const update = useCallback((patch: Partial<Prefs>) => {
    setPrefs((current) => {
      const next = { ...current, ...patch };
      writePrefs(next);
      return next;
    });
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isDevtoolsShortcut(event) && !isTypingTarget(event.target)) {
        event.preventDefault();
        setPrefs((current) => {
          const next = { ...current, open: !current.open };
          writePrefs(next);
          return next;
        });
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const startResize = (event: ReactPointerEvent) => {
    event.preventDefault();
    resizing.current = true;
    // Size follows the pointer in state only; it is written to storage once, on release.
    const onMove = (move: PointerEvent) => {
      if (!resizing.current) return;
      setPrefs((current) =>
        current.dock === 'bottom'
          ? { ...current, height: clamp(window.innerHeight - move.clientY, MIN_HEIGHT, window.innerHeight - 40) }
          : { ...current, width: clamp(window.innerWidth - move.clientX, MIN_WIDTH, window.innerWidth - 40) },
      );
    };
    const onUp = () => {
      resizing.current = false;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      setPrefs((current) => {
        writePrefs(current);
        return current;
      });
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  if (!mounted) return null;

  const bottom = prefs.dock === 'bottom';
  // Stored sizes can outgrow a smaller window; the panel never exceeds the viewport.
  const panelStyle = bottom
    ? { height: `min(${prefs.height}px, calc(100vh - 2.5rem))` }
    : { width: `min(${prefs.width}px, 100vw)` };

  return createPortal(
    <div data-horo-devtools="" className="font-mono text-xs leading-snug text-ink">
      {!prefs.open && (
        <button
          type="button"
          onClick={() => update({ open: true })}
          aria-label={`เปิด horo devtools (${DEVTOOLS_SHORTCUT})`}
          title={`horo devtools · ${DEVTOOLS_SHORTCUT} (Mac: ⌥⇧D)`}
          className="fixed bottom-4 left-16 z-[2147483000] flex size-11 items-center justify-center rounded-full border border-edge bg-surface text-accentBright shadow-[0_8px_24px_rgba(107,33,168,0.25)] transition-colors hover:bg-surface2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright"
        >
          <FlaskConical className="size-5" aria-hidden="true" />
        </button>
      )}

      {prefs.open && (
        <section
          aria-label="horo devtools"
          style={panelStyle}
          className={`fixed z-[2147483000] flex flex-col bg-surface shadow-[0_-12px_40px_rgba(107,33,168,0.18)] ${
            bottom ? 'inset-x-0 bottom-0 border-t border-edge' : 'inset-y-0 right-0 border-l border-edge'
          }`}
        >
          <div
            role="separator"
            aria-orientation={bottom ? 'horizontal' : 'vertical'}
            aria-label="ลากเพื่อปรับขนาด"
            onPointerDown={startResize}
            className={`absolute z-10 bg-transparent hover:bg-accentBright/40 ${
              bottom ? 'inset-x-0 -top-1 h-2 cursor-ns-resize' : 'inset-y-0 -left-1 w-2 cursor-ew-resize'
            }`}
          />

          <header className="flex shrink-0 items-center gap-2 border-b border-edge bg-surface2 px-2">
            <span className="flex items-center gap-1.5 px-1 font-semibold text-accentBright">
              <FlaskConical className="size-3.5" aria-hidden="true" />
              horo devtools
            </span>
            <nav aria-label="เครื่องมือ" className="flex min-w-0 flex-1 overflow-x-auto">
              {DEV_GENERATORS.map((generator) => {
                const active = generator.id === prefs.tab;
                return (
                  <button
                    key={generator.id}
                    type="button"
                    aria-current={active ? 'page' : undefined}
                    onClick={() => update({ tab: generator.id })}
                    className={`shrink-0 border-b-2 px-3 py-2 ${
                      active ? 'border-accentBright text-ink' : 'border-transparent text-inkMuted hover:text-ink'
                    }`}
                  >
                    {generator.title}
                  </button>
                );
              })}
            </nav>
            <button
              type="button"
              onClick={() => update({ dock: bottom ? 'right' : 'bottom' })}
              aria-label={bottom ? 'ย้ายไปด้านขวา' : 'ย้ายไปด้านล่าง'}
              title={bottom ? 'ย้ายไปด้านขวา' : 'ย้ายไปด้านล่าง'}
              className="flex size-8 items-center justify-center rounded text-inkMuted hover:bg-edge hover:text-ink"
            >
              {bottom ? <PanelRight className="size-4" aria-hidden="true" /> : <PanelBottom className="size-4" aria-hidden="true" />}
            </button>
            <button
              type="button"
              onClick={() => update({ open: false })}
              aria-label="ปิด horo devtools"
              title={`ปิด (${DEVTOOLS_SHORTCUT})`}
              className="flex size-8 items-center justify-center rounded text-inkMuted hover:bg-edge hover:text-ink"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </header>

          {/* Every generator stays mounted so a running generation and its
              result survive switching tabs. */}
          <div className="@container min-h-0 flex-1">
            {DEV_GENERATORS.map((generator) => (
              <div key={generator.id} hidden={generator.id !== prefs.tab} className="h-full">
                <DevGenerator config={generator} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>,
    document.body,
  );
}
