'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Button } from '@/lib-packages/ui';
import { MBTI_TYPES, RELATIONSHIP_LABELS, RELATIONSHIP_TYPES, THAI_TIME_PERIODS } from '@/lib-packages/shared';
import type { DevGenerateResponse } from '@/lib-packages/shared/types/dev-tools';
import { api, type ApiError } from '@/lib/api';
import type { DevField, DevFormValues, DevGeneratorConfig, DevVariantValues } from './types';

/** Same budget as the real compatibility POST: a v3 reading plus a repair must fit. */
const DEV_GENERATE_TIMEOUT_MS = 270_000;

const RESULT_TABS = ['rendered', 'json', 'prompt', 'timing'] as const;
type ResultTab = (typeof RESULT_TABS)[number];
const RESULT_TAB_LABELS: Record<ResultTab, string> = {
  rendered: 'Rendered',
  json: 'JSON',
  prompt: 'Prompt',
  timing: 'Timing',
};

type RunResult =
  | { variants: DevVariantValues; response: DevGenerateResponse<unknown, unknown> }
  | { variants: DevVariantValues; error: string };

export type Status =
  | { kind: 'idle' }
  | { kind: 'running'; startedAt: number }
  | { kind: 'done'; seconds: number }
  | { kind: 'error'; seconds: number };

export const controlClass =
  'h-8 w-full rounded border border-inkMuted/30 bg-surface px-2 font-sans text-xs text-ink focus:outline-none focus:ring-2 focus:ring-accentBright';

function emptyValues(fields: ReadonlyArray<DevField>): DevFormValues {
  return Object.fromEntries(fields.map((field) => [field.key, '']));
}

function defaultVariants(config: DevGeneratorConfig): DevVariantValues {
  return Object.fromEntries(config.variants.map((variant) => [variant.key, variant.options[0].value]));
}

export function describeError(error: unknown): string {
  const failure = error as ApiError;
  const parts = [
    failure.status ? `HTTP ${failure.status}` : null,
    failure.body?.error,
    failure.body?.detail ?? failure.message,
  ];
  return parts.filter(Boolean).join(' · ');
}

export function FieldInput({ field, value, onChange }: { field: DevField; value: string; onChange: (value: string) => void }) {
  const id = `dev-field-${field.key}`;
  const select = (options: ReactNode, empty: string) => (
    <select id={id} className={controlClass} value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="">{empty}</option>
      {options}
    </select>
  );

  let control;
  switch (field.type) {
    case 'text':
      control = <input id={id} className={controlClass} value={value} onChange={(event) => onChange(event.target.value)} />;
      break;
    case 'date':
      control = (
        <input id={id} type="date" className={controlClass} value={value} onChange={(event) => onChange(event.target.value)} />
      );
      break;
    case 'hour':
      control = select(
        Array.from({ length: 24 }, (_, hour) => (
          <option key={hour} value={String(hour)}>
            {String(hour).padStart(2, '0')}:00
          </option>
        )),
        'ไม่ทราบ',
      );
      break;
    case 'thaiPeriod':
      control = select(
        THAI_TIME_PERIODS.map((period) => (
          <option key={period.name} value={period.name}>
            {period.label}
          </option>
        )),
        'ไม่ทราบ',
      );
      break;
    case 'gender':
      control = select(
        [
          <option key="female" value="female">หญิง</option>,
          <option key="male" value="male">ชาย</option>,
        ],
        'เลือก',
      );
      break;
    case 'mbti':
      control = select(
        MBTI_TYPES.map((type) => (
          <option key={type.code} value={type.code}>
            {type.code} {type.nameTh}
          </option>
        )),
        'ไม่ระบุ',
      );
      break;
    case 'relationship':
      control = select(
        RELATIONSHIP_TYPES.map((type) => (
          <option key={type} value={type}>
            {RELATIONSHIP_LABELS[type]}
          </option>
        )),
        'เลือก',
      );
      break;
  }

  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <label htmlFor={id} className="text-inkMuted">
        {field.label}
        {field.required ? ' *' : ''}
      </label>
      {control}
    </div>
  );
}

export function StatusPill({ status, now }: { status: Status; now: number }) {
  const [label, tone] =
    status.kind === 'idle'
      ? ['idle', 'bg-edge text-inkMuted']
      : status.kind === 'running'
        ? [`running ${Math.floor((now - status.startedAt) / 1000)}s`, 'bg-accent/15 text-accentBright']
        : status.kind === 'done'
          ? [`done ${status.seconds.toFixed(1)}s`, 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400']
          : [`error ${status.seconds.toFixed(1)}s`, 'bg-red-500/15 text-red-700 dark:text-red-400'];
  return (
    <span role="status" className={`shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 font-semibold ${tone}`}>
      {label}
    </span>
  );
}

interface RunTabProps {
  config: DevGeneratorConfig;
  run: RunResult;
  tab: ResultTab;
  variants: DevVariantValues;
  setVariant: (key: string, value: string) => void;
}

function RunView({ config, run, tab, variants, setVariant }: RunTabProps) {
  const heading = config.variants
    .filter((variant) => !config.presentationVariants?.includes(variant.key))
    .map((variant) => variant.options.find((option) => option.value === run.variants[variant.key])?.label)
    .filter(Boolean)
    .join(' · ');

  let body: ReactNode;
  if ('error' in run) {
    body = (
      <p role="alert" className="whitespace-pre-wrap rounded border border-red-500/40 bg-red-500/10 p-2 text-ink">
        {run.error}
      </p>
    );
  } else if (tab === 'json') {
    body = <pre className="whitespace-pre-wrap break-words text-inkMuted">{JSON.stringify(run.response.content, null, 2)}</pre>;
  } else if (tab === 'prompt') {
    body = <pre className="whitespace-pre-wrap break-words text-inkMuted">{run.response.prompt}</pre>;
  } else if (tab === 'timing') {
    const { timings, modelCalls, promptChars, outputChars } = run.response;
    const rows: Array<[string, string]> = [
      ['calc', `${timings.calcMs} ms`],
      ['llm', `${(timings.llmMs / 1000).toFixed(2)} s`],
      ['total (server)', `${(timings.totalMs / 1000).toFixed(2)} s`],
      ['model calls', String(modelCalls)],
      ['prompt', `${promptChars} chars`],
      ['output', `${outputChars} chars`],
    ];
    body = (
      <table className="text-left">
        <tbody>
          {rows.map(([name, value]) => (
            <tr key={name}>
              <th scope="row" className="py-0.5 pr-6 font-normal text-inkMuted">
                {name}
              </th>
              <td className="py-0.5 text-ink">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  } else {
    // Presentation-only variants follow the live selection; the rest stay as generated.
    const renderVariants = { ...run.variants };
    for (const key of config.presentationVariants ?? []) renderVariants[key] = variants[key];
    // The real product component, at reading width and in the page's own type scale.
    body = <div className="mx-auto max-w-3xl font-sans text-base">{config.renderResult(run.response, renderVariants, setVariant)}</div>;
  }

  return (
    <div className="min-w-0 space-y-2">
      {heading && <p className="font-semibold text-inkMuted">{heading}</p>}
      {body}
    </div>
  );
}

/**
 * The one dev generator UI, shown in a devtools tab. Everything specific to a
 * generator comes from its config; this component never knows which one it is.
 * Left: presets, form, variants, generate. Right: status and the result as
 * Rendered / JSON / Prompt / Timing.
 */
export function DevGenerator({ config }: { config: DevGeneratorConfig }) {
  const [values, setValues] = useState<DevFormValues>(() => emptyValues(config.fields));
  const [variants, setVariants] = useState<DevVariantValues>(() => defaultVariants(config));
  const [compare, setCompare] = useState(false);
  const [runs, setRuns] = useState<RunResult[]>([]);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [tab, setTab] = useState<ResultTab>('rendered');
  const [now, setNow] = useState(() => Date.now());
  // After a generation the form folds into one summary line, so the result is
  // what the panel shows, even when the form stacks above it on a phone.
  const [formOpen, setFormOpen] = useState(true);
  const [summary, setSummary] = useState('');
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status.kind !== 'running') return;
    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, [status.kind]);

  const setVariant = (key: string, value: string) => setVariants((current) => ({ ...current, [key]: value }));
  const missing = config.fields.filter((field) => field.required && values[field.key] === '');
  const running = status.kind === 'running';
  const compareKey = config.compareVariant;
  const compareOptions = compareKey ? config.variants.find((variant) => variant.key === compareKey)?.options ?? [] : [];

  async function generate() {
    const runVariants =
      compare && compareKey ? compareOptions.map((option) => ({ ...variants, [compareKey]: option.value })) : [variants];
    const startedAt = Date.now();
    setRuns([]);
    setNow(startedAt);
    setStatus({ kind: 'running', startedAt });
    const results = await Promise.all(
      runVariants.map(async (variantValues): Promise<RunResult> => {
        try {
          const response = await api.post<DevGenerateResponse<unknown, unknown>>(
            config.endpoint,
            config.buildRequest(values, variantValues),
            { timeout: DEV_GENERATE_TIMEOUT_MS },
          );
          return { variants: variantValues, response };
        } catch (error) {
          return { variants: variantValues, error: describeError(error) };
        }
      }),
    );
    const seconds = (Date.now() - startedAt) / 1000;
    setRuns(results);
    setStatus(results.some((run) => 'error' in run) ? { kind: 'error', seconds } : { kind: 'done', seconds });
    if (results.some((run) => 'response' in run)) {
      setSummary(config.summary(values, variants));
      setFormOpen(false);
    }
  }

  // Once the result is on screen, bring it into view inside the panel.
  useEffect(() => {
    if (!formOpen && runs.length > 0) resultRef.current?.scrollIntoView({ block: 'start' });
  }, [formOpen, runs]);

  const groups = [...new Set(config.fields.map((field) => field.group))];

  return (
    <div className="grid h-full grid-cols-1 overflow-y-auto @3xl:grid-cols-[minmax(18rem,22rem)_1fr] @3xl:overflow-hidden">
      {!formOpen && (
        <div className="flex items-center gap-2 border-b border-edge p-3 @3xl:border-r @3xl:border-b-0">
          <p className="min-w-0 flex-1 truncate text-ink">{summary}</p>
          <Button type="button" variant="soft" className="h-7 shrink-0 px-2 text-xs" onClick={() => setFormOpen(true)}>
            แก้ไข
          </Button>
        </div>
      )}
      <form
        hidden={!formOpen}
        className="space-y-3 border-edge p-3 @3xl:overflow-y-auto @3xl:border-r"
        onSubmit={(event) => {
          event.preventDefault();
          void generate();
        }}
      >
        <p className="text-inkMuted">{config.description}</p>

        {config.presets.length > 0 && (
          <div className="flex flex-wrap gap-1" role="group" aria-label="ชุดข้อมูลตัวอย่าง">
            {config.presets.map((preset) => (
              <Button
                key={preset.id}
                type="button"
                variant="soft"
                className="h-7 px-2 text-xs"
                onClick={() => setValues({ ...emptyValues(config.fields), ...preset.values })}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        )}

        {groups.map((group) => (
          <fieldset key={group} className="space-y-1.5">
            <legend className="font-semibold text-ink">{group}</legend>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
              {config.fields
                .filter((field) => field.group === group)
                .map((field) => (
                  <FieldInput
                    key={field.key}
                    field={field}
                    value={values[field.key]}
                    onChange={(value) => setValues((current) => ({ ...current, [field.key]: value }))}
                  />
                ))}
            </div>
          </fieldset>
        ))}

        {config.variants.map((variant) => {
          const locked = compare && variant.key === compareKey;
          return (
            <div key={variant.key} className="flex items-center gap-2">
              <span className="w-24 shrink-0 text-inkMuted">{variant.label}</span>
              <div className="flex gap-1" role="group" aria-label={variant.label}>
                {variant.options.map((option) => {
                  const selected = variants[variant.key] === option.value && !locked;
                  return (
                    <Button
                      key={option.value}
                      type="button"
                      variant={selected ? 'default' : 'soft'}
                      aria-pressed={selected}
                      disabled={locked}
                      className="h-7 px-2 text-xs"
                      onClick={() => setVariant(variant.key, option.value)}
                    >
                      {option.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {compareKey && (
          <label className="flex items-center gap-2 text-ink">
            <input
              type="checkbox"
              className="size-3.5 accent-accent"
              checked={compare}
              onChange={(event) => setCompare(event.target.checked)}
            />
            เทียบทุก{config.variants.find((variant) => variant.key === compareKey)?.label}
          </label>
        )}

        <Button type="submit" disabled={running || missing.length > 0} className="h-8 w-full px-3 text-xs">
          {running ? 'กำลังสร้าง...' : 'สร้าง'}
        </Button>
        {missing.length > 0 && !running && (
          <p className="text-inkMuted">ยังขาด: {missing.map((field) => `${field.group} ${field.label}`).join(', ')}</p>
        )}
      </form>

      <div ref={resultRef} className="flex min-h-0 min-w-0 flex-col">
        <div className="flex shrink-0 items-center gap-2 border-b border-edge px-3 py-1.5">
          <StatusPill status={status} now={now} />
          <div className="flex gap-1" role="tablist" aria-label="มุมมองผลลัพธ์">
            {RESULT_TABS.map((resultTab) => (
              <button
                key={resultTab}
                type="button"
                role="tab"
                aria-selected={tab === resultTab}
                onClick={() => setTab(resultTab)}
                className={`rounded px-2 py-1 ${
                  tab === resultTab ? 'bg-accent/15 text-accentBright' : 'text-inkMuted hover:text-ink'
                }`}
              >
                {RESULT_TAB_LABELS[resultTab]}
              </button>
            ))}
          </div>
        </div>
        <div role="tabpanel" className="min-h-0 flex-1 overflow-auto p-3">
          {runs.length === 0 ? (
            <p className="text-inkMuted">
              {running ? 'รอผลจาก DeepSeek...' : 'เลือกชุดข้อมูลหรือกรอกฟอร์ม แล้วกด สร้าง'}
            </p>
          ) : (
            <div className={`grid gap-4 ${runs.length > 1 ? '@5xl:grid-cols-2' : ''}`}>
              {runs.map((run, index) => (
                <RunView key={index} config={config} run={run} tab={tab} variants={variants} setVariant={setVariant} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
