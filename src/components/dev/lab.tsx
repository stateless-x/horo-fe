'use client';

import { useState } from 'react';
import { DevGenerator } from './dev-generator';
import { DEV_GENERATORS } from './generators';

/**
 * ทดลอง: the stateless preview generators (nothing is saved), one sub-tab each.
 * Every generator stays mounted so a running generation survives switching.
 */
export function DevLab() {
  const [active, setActive] = useState(DEV_GENERATORS[0].id);

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center gap-1 border-b border-edge px-2 py-1" role="group" aria-label="ทดลอง">
        <span className="px-1 text-inkMuted">ไม่บันทึก:</span>
        {DEV_GENERATORS.map((generator) => (
          <button
            key={generator.id}
            type="button"
            aria-pressed={generator.id === active}
            onClick={() => setActive(generator.id)}
            className={`rounded px-2 py-1 ${
              generator.id === active ? 'bg-accent/15 text-accentBright' : 'text-inkMuted hover:text-ink'
            }`}
          >
            {generator.title}
          </button>
        ))}
      </div>
      {DEV_GENERATORS.map((generator) => (
        <div key={generator.id} hidden={generator.id !== active} className="min-h-0 flex-1">
          <DevGenerator config={generator} />
        </div>
      ))}
    </div>
  );
}
