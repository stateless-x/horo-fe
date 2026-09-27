'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { Button } from '@/lib-packages/ui';
import { RELATIONSHIP_LABELS, RELATIONSHIP_TYPES } from '@/lib-packages/shared';
import { api } from '@/lib/api';
import { useSession } from '@/lib/auth-client';
import { FieldInput, StatusPill, controlClass, describeError, type Status } from './dev-generator';
import type { DevField } from './types';

/**
 * "สร้างใหม่ให้ผู้ใช้นี้": the panel's main action. horo-be's
 * POST /api/dev/regenerate/* rewrites one reading of the signed-in user in the
 * local database (it refuses any other database), then the panel refreshes the
 * real page's query and goes there, so the result shows in the real UI.
 */

/** Same budget as the real compatibility POST: the full report plus its repair must fit. */
const REGENERATE_TIMEOUT_MS = 270_000;
const DEV_LOGIN_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/dev/login`;

function useRegenerate() {
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [error, setError] = useState('');
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (status.kind !== 'running') return;
    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, [status.kind]);

  /** Posts to a regenerate endpoint; resolves to the response, or null after showing the error. */
  async function run(endpoint: string, body: unknown): Promise<unknown> {
    const startedAt = Date.now();
    setNow(startedAt);
    setError('');
    setStatus({ kind: 'running', startedAt });
    try {
      const response = await api.post<unknown>(endpoint, body, { timeout: REGENERATE_TIMEOUT_MS });
      setStatus({ kind: 'done', seconds: (Date.now() - startedAt) / 1000 });
      return response;
    } catch (failure) {
      setStatus({ kind: 'error', seconds: (Date.now() - startedAt) / 1000 });
      setError(describeError(failure));
      return null;
    }
  }

  return { status, now, error, running: status.kind === 'running', run };
}

/** Layout shared by every regenerate tab: who, the controls, one button, status and error. */
function RegenerateShell({
  description,
  children,
  canRun,
  onRun,
  regen,
  note,
}: {
  description: string;
  children?: ReactNode;
  canRun: boolean;
  onRun: () => void;
  regen: ReturnType<typeof useRegenerate>;
  note: string;
}) {
  const { data: session, isPending } = useSession();
  const signedIn = !!session?.user;

  return (
    <form
      className="mx-auto flex h-full max-w-xl flex-col gap-3 overflow-y-auto p-3"
      onSubmit={(event) => {
        event.preventDefault();
        onRun();
      }}
    >
      <p className="text-inkMuted">
        {isPending ? '...' : signedIn ? <>ผู้ใช้: <span className="text-ink">{session.user.name}</span> · </> : null}
        {description}
      </p>
      {!isPending && !signedIn && (
        <p role="alert" className="text-ink">
          ยังไม่ได้เข้าสู่ระบบ:{' '}
          <a className="text-accentBright underline" href={DEV_LOGIN_URL}>
            เข้าด้วยผู้ใช้ dev
          </a>
        </p>
      )}
      {children}
      <Button type="submit" disabled={!signedIn || !canRun || regen.running} className="h-8 w-full px-3 text-xs">
        {regen.running ? 'กำลังสร้าง...' : 'สร้างใหม่ให้ผู้ใช้นี้'}
      </Button>
      <div className="flex min-w-0 items-center gap-2">
        <StatusPill status={regen.status} now={regen.now} />
        {regen.status.kind === 'done' && note && <span className="min-w-0 break-words text-inkMuted">{note}</span>}
      </div>
      {regen.error && (
        <p role="alert" className="whitespace-pre-wrap break-words text-red-700 dark:text-red-400">
          {regen.error}
        </p>
      )}
    </form>
  );
}

/** Refreshes a real page's data and goes there, so the new reading is on screen. */
function useShowOnPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  return async (queryKey: string[], path: string) => {
    await queryClient.invalidateQueries({ queryKey });
    if (pathname !== path) router.push(path);
  };
}

// --- ดวงวันนี้ / ดวงเดือน ---

const READINGS = {
  daily: {
    endpoint: '/api/dev/regenerate/daily',
    description: 'ลบดวงวันนี้ของผู้ใช้นี้ แล้วให้ระบบจริงเขียนใหม่',
    queryKey: ['fortune', 'daily'],
    path: '/dashboard/today',
  },
  chart: {
    endpoint: '/api/dev/regenerate/chart',
    description: 'ลบดวงเดือนนี้ของผู้ใช้นี้ แล้วให้ระบบจริงเขียนใหม่',
    queryKey: ['fortune', 'chart'],
    path: '/dashboard/fortune',
  },
} as const;

export function RegenerateReading({ reading }: { reading: keyof typeof READINGS }) {
  const config = READINGS[reading];
  const regen = useRegenerate();
  const showOnPage = useShowOnPage();

  return (
    <RegenerateShell
      description={config.description}
      canRun
      regen={regen}
      note={`แสดงที่ ${config.path}`}
      onRun={async () => {
        if (await regen.run(config.endpoint, {})) await showOnPage([...config.queryKey], config.path);
      }}
    />
  );
}

// --- ดวงคู่ ---

const HistorySchema = z.object({
  data: z.array(
    z.object({
      id: z.string(),
      partnerName: z.string(),
      relationshipType: z.enum(RELATIONSHIP_TYPES),
      score: z.number(),
    }),
  ),
});

const ResultSchema = z.object({
  partnerName: z.string(),
  score: z.number(),
  partnerMbti: z.string().nullable(),
  qualityFlags: z.array(z.string()),
});

const KINDS = [
  { value: 'full', label: 'ฉบับเต็ม' },
  { value: 'classic', label: 'แบบเดิม' },
] as const;
type Kind = (typeof KINDS)[number]['value'];

const NEW_PARTNER = 'new';
const NEW_FIELDS: ReadonlyArray<DevField> = [
  { key: 'newName', label: 'ชื่อ', type: 'text', group: 'คนใหม่', required: true },
  { key: 'newBirthDate', label: 'วันเกิด', type: 'date', group: 'คนใหม่', required: true },
  { key: 'newMbti', label: 'MBTI', type: 'mbti', group: 'คนใหม่' },
  { key: 'newRelationship', label: 'ความสัมพันธ์', type: 'relationship', group: 'คนใหม่', required: true },
];

export function RegenerateCompatibility() {
  const regen = useRegenerate();
  const showOnPage = useShowOnPage();
  const { data: session } = useSession();
  // Under ['compatibility'], so the invalidation after a regeneration refreshes it too.
  const history = useQuery({
    queryKey: ['compatibility', 'devtools-history'],
    queryFn: async () =>
      HistorySchema.parse(await api.get<unknown>('/api/fortune/compatibility/history?limit=50')).data,
    enabled: !!session?.user,
  });
  const rows = history.data ?? [];

  // '' = follow the latest row; the choice sticks once made.
  const [picked, setPicked] = useState('');
  const target = picked || rows[0]?.id || NEW_PARTNER;
  const [kind, setKind] = useState<Kind>('full');
  const [values, setValues] = useState<Record<string, string>>({ newName: '', newBirthDate: '', newMbti: '', newRelationship: 'romantic' });
  const [note, setNote] = useState('');

  const isNew = target === NEW_PARTNER;
  const missing = isNew && NEW_FIELDS.some((field) => field.required && values[field.key] === '');

  async function onRun() {
    const body = {
      kind,
      target: isNew
        ? {
            type: 'new',
            name: values.newName,
            birthDate: values.newBirthDate,
            mbti: values.newMbti || undefined,
            relationshipType: values.newRelationship,
          }
        : { type: 'row', id: target },
    };
    const response = await regen.run('/api/dev/regenerate/compatibility', body);
    if (!response) return;
    const result = ResultSchema.parse(response);
    const flags = result.qualityFlags.length ? ` · quality flags ${result.qualityFlags.length}` : '';
    setNote(`${result.partnerName} ${result.score} · MBTI ${result.partnerMbti ?? 'ไม่ระบุ'}${flags} · เปิดจากประวัติ`);
    if (result.qualityFlags.length) console.warn('[horo devtools] quality flags', result.qualityFlags);
    await showOnPage(['compatibility'], '/dashboard/compatibility');
  }

  return (
    <RegenerateShell
      description="เขียนดวงคู่ใหม่ทับแถวเดิมในประวัติ"
      canRun={!missing}
      regen={regen}
      note={note}
      onRun={() => void onRun()}
    >
      <div className="flex min-w-0 flex-col gap-0.5">
        <label htmlFor="dev-regen-target" className="text-inkMuted">
          ดวงคู่
        </label>
        <select id="dev-regen-target" className={controlClass} value={target} onChange={(event) => setPicked(event.target.value)}>
          {rows.map((row) => (
            <option key={row.id} value={row.id}>
              {row.partnerName} · {RELATIONSHIP_LABELS[row.relationshipType]} · {row.score}
            </option>
          ))}
          <option value={NEW_PARTNER}>+ คนใหม่</option>
        </select>
      </div>

      {isNew && (
        <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
          {NEW_FIELDS.map((field) => (
            <FieldInput
              key={field.key}
              field={field}
              value={values[field.key]}
              onChange={(value) => setValues((current) => ({ ...current, [field.key]: value }))}
            />
          ))}
        </div>
      )}
      <p className="text-inkMuted">
        {isNew
          ? 'วันเกิดและความสัมพันธ์ตรงกับแถวเดิม = เขียนทับแถวนั้น'
          : 'MBTI อีกฝ่ายใช้ค่าจากฉบับเต็มเดิม (แบบเดิมไม่มีเก็บไว้) · อยากกำหนดเอง เลือก + คนใหม่'}
      </p>

      <div className="flex gap-1" role="group" aria-label="เนื้อหา">
        {KINDS.map((option) => (
          <Button
            key={option.value}
            type="button"
            variant={kind === option.value ? 'default' : 'soft'}
            aria-pressed={kind === option.value}
            className="h-7 flex-1 px-2 text-xs"
            onClick={() => setKind(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </RegenerateShell>
  );
}
