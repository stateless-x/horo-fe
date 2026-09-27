'use client';

import { useEffect, useState } from 'react';
import { Button, Input } from '@/lib-packages/ui';
import { MBTI_TYPES, RELATIONSHIP_LABELS, RELATIONSHIP_TYPES, THAI_TIME_PERIODS } from '@/lib-packages/shared';
import type { DevGenerateResponse } from '@/lib-packages/shared/types/dev-tools';
import { api, type ApiError } from '@/lib/api';
import type { DevField, DevFormValues, DevGeneratorConfig, DevVariantValues } from './types';

/** Same budget as the real compatibility POST: a v3 reading plus a repair must fit. */
const DEV_GENERATE_TIMEOUT_MS = 270_000;

type RunResult =
  | { variants: DevVariantValues; response: DevGenerateResponse<unknown, unknown> }
  | { variants: DevVariantValues; error: string };

const selectClass =
  'flex h-11 w-full rounded-md border border-inkMuted/30 bg-surface px-4 text-base text-ink focus:outline-none focus:ring-2 focus:ring-accentBright focus:border-transparent';

function emptyValues(fields: ReadonlyArray<DevField>): DevFormValues {
  return Object.fromEntries(fields.map((field) => [field.key, '']));
}

function defaultVariants(config: DevGeneratorConfig): DevVariantValues {
  return Object.fromEntries(config.variants.map((variant) => [variant.key, variant.options[0].value]));
}

function describeError(error: unknown): string {
  const failure = error as ApiError;
  const parts = [
    failure.status ? `HTTP ${failure.status}` : null,
    failure.body?.error,
    failure.body?.detail ?? failure.message,
  ];
  return parts.filter(Boolean).join(' · ');
}

function FieldInput({ field, value, onChange }: { field: DevField; value: string; onChange: (value: string) => void }) {
  const id = `dev-field-${field.key}`;
  const label = (
    <label htmlFor={id} className="text-sm text-inkMuted">
      {field.label}
      {field.required ? ' *' : ''}
    </label>
  );

  let control;
  switch (field.type) {
    case 'text':
      control = <Input id={id} value={value} onChange={(event) => onChange(event.target.value)} />;
      break;
    case 'date':
      control = <Input id={id} type="date" value={value} onChange={(event) => onChange(event.target.value)} />;
      break;
    case 'hour':
      control = (
        <select id={id} className={selectClass} value={value} onChange={(event) => onChange(event.target.value)}>
          <option value="">ไม่ทราบ</option>
          {Array.from({ length: 24 }, (_, hour) => (
            <option key={hour} value={String(hour)}>
              {String(hour).padStart(2, '0')}:00
            </option>
          ))}
        </select>
      );
      break;
    case 'thaiPeriod':
      control = (
        <select id={id} className={selectClass} value={value} onChange={(event) => onChange(event.target.value)}>
          <option value="">ไม่ทราบ</option>
          {THAI_TIME_PERIODS.map((period) => (
            <option key={period.name} value={period.name}>
              {period.label}
            </option>
          ))}
        </select>
      );
      break;
    case 'gender':
      control = (
        <select id={id} className={selectClass} value={value} onChange={(event) => onChange(event.target.value)}>
          <option value="">เลือก</option>
          <option value="female">หญิง</option>
          <option value="male">ชาย</option>
        </select>
      );
      break;
    case 'mbti':
      control = (
        <select id={id} className={selectClass} value={value} onChange={(event) => onChange(event.target.value)}>
          <option value="">ไม่ระบุ</option>
          {MBTI_TYPES.map((type) => (
            <option key={type.code} value={type.code}>
              {type.code} {type.nameTh}
            </option>
          ))}
        </select>
      );
      break;
    case 'relationship':
      control = (
        <select id={id} className={selectClass} value={value} onChange={(event) => onChange(event.target.value)}>
          <option value="">เลือก</option>
          {RELATIONSHIP_TYPES.map((type) => (
            <option key={type} value={type}>
              {RELATIONSHIP_LABELS[type]}
            </option>
          ))}
        </select>
      );
      break;
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label}
      {control}
    </div>
  );
}

function RunPanel({
  config,
  run,
  variants,
  setVariant,
}: {
  config: DevGeneratorConfig;
  run: RunResult;
  variants: DevVariantValues;
  setVariant: (key: string, value: string) => void;
}) {
  const heading = config.variants
    .filter((variant) => !config.presentationVariants?.includes(variant.key))
    .map((variant) => variant.options.find((option) => option.value === run.variants[variant.key])?.label)
    .filter(Boolean)
    .join(' · ');

  if ('error' in run) {
    return (
      <div className="space-y-2">
        {heading && <p className="font-heading text-sm text-inkMuted">{heading}</p>}
        <p role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-ink">
          {run.error}
        </p>
      </div>
    );
  }

  const { response } = run;
  // Presentation-only variants follow the live selection; the rest stay as generated.
  const renderVariants = { ...run.variants };
  for (const key of config.presentationVariants ?? []) renderVariants[key] = variants[key];

  return (
    <div className="min-w-0 space-y-4">
      {heading && <p className="font-heading text-sm text-inkMuted">{heading}</p>}
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 rounded-xl border border-edge bg-surface2 p-4 font-mono text-xs text-inkMuted sm:grid-cols-3">
        <div><dt className="inline">calc </dt><dd className="inline text-ink">{response.timings.calcMs} ms</dd></div>
        <div><dt className="inline">llm </dt><dd className="inline text-ink">{(response.timings.llmMs / 1000).toFixed(1)} s</dd></div>
        <div><dt className="inline">total </dt><dd className="inline text-ink">{(response.timings.totalMs / 1000).toFixed(1)} s</dd></div>
        <div><dt className="inline">model calls </dt><dd className="inline text-ink">{response.modelCalls}</dd></div>
        <div><dt className="inline">prompt </dt><dd className="inline text-ink">{response.promptChars} chars</dd></div>
        <div><dt className="inline">output </dt><dd className="inline text-ink">{response.outputChars} chars</dd></div>
      </dl>
      {config.renderResult(response, renderVariants, setVariant)}
      <details className="rounded-xl border border-edge bg-surface2">
        <summary className="min-h-11 cursor-pointer px-4 py-2.5 font-heading text-sm text-ink">JSON ที่ได้</summary>
        <pre className="max-h-96 overflow-auto border-t border-edge p-4 text-xs text-inkMuted">
          {JSON.stringify(response.content, null, 2)}
        </pre>
      </details>
      <details className="rounded-xl border border-edge bg-surface2">
        <summary className="min-h-11 cursor-pointer px-4 py-2.5 font-heading text-sm text-ink">prompt ที่ส่ง</summary>
        <pre className="max-h-96 overflow-auto whitespace-pre-wrap border-t border-edge p-4 text-xs text-inkMuted">
          {response.prompt}
        </pre>
      </details>
    </div>
  );
}

/**
 * The one dev generator UI. Everything specific to a generator comes from its
 * config; this component never knows which generator it is running.
 */
export function DevGenerator({ config }: { config: DevGeneratorConfig }) {
  const [values, setValues] = useState<DevFormValues>(() => emptyValues(config.fields));
  const [variants, setVariants] = useState<DevVariantValues>(() => defaultVariants(config));
  const [compare, setCompare] = useState(false);
  const [runs, setRuns] = useState<RunResult[]>([]);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (startedAt === null) return;
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 250);
    return () => clearInterval(timer);
  }, [startedAt]);

  const setVariant = (key: string, value: string) => setVariants((current) => ({ ...current, [key]: value }));
  const missing = config.fields.filter((field) => field.required && values[field.key] === '');
  const running = startedAt !== null;
  const compareOptions = config.compareVariant
    ? config.variants.find((variant) => variant.key === config.compareVariant)?.options ?? []
    : [];

  async function generate() {
    const compareKey = config.compareVariant;
    const runVariants =
      compare && compareKey
        ? compareOptions.map((option) => ({ ...variants, [compareKey]: option.value }))
        : [variants];
    setRuns([]);
    setElapsed(0);
    setStartedAt(Date.now());
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
    setRuns(results);
    setStartedAt(null);
  }

  const groups = [...new Set(config.fields.map((field) => field.group))];

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="font-mono text-xs text-inkMuted">dev tool · ไม่บันทึกอะไรลงฐานข้อมูล</p>
        <h1 className="font-heading text-2xl font-semibold text-ink">{config.title}</h1>
        <p className="max-w-[65ch] text-inkMuted">{config.description}</p>
      </header>

      {config.presets.length > 0 && (
        <section aria-labelledby="dev-presets" className="space-y-3">
          <h2 id="dev-presets" className="font-heading text-sm font-semibold text-ink">ชุดข้อมูลตัวอย่าง</h2>
          <div className="flex flex-wrap gap-2">
            {config.presets.map((preset) => (
              <Button key={preset.id} variant="soft" size="sm" onClick={() => setValues({ ...emptyValues(config.fields), ...preset.values })}>
                {preset.label}
              </Button>
            ))}
          </div>
        </section>
      )}

      <form
        className="space-y-6"
        onSubmit={(event) => {
          event.preventDefault();
          void generate();
        }}
      >
        <div className="grid gap-6 md:grid-cols-2">
          {groups.map((group) => (
            <fieldset key={group} className="space-y-3 rounded-2xl border border-edge bg-surface p-5">
              <legend className="px-1 font-heading text-sm font-semibold text-ink">{group}</legend>
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
            </fieldset>
          ))}
        </div>

        <div className="flex flex-wrap items-end gap-6">
          {config.variants.map((variant) => {
            const locked = compare && variant.key === config.compareVariant;
            return (
              <div key={variant.key} className="space-y-1.5">
                <p className="text-sm text-inkMuted">{variant.label}</p>
                <div className="flex gap-2" role="group" aria-label={variant.label}>
                  {variant.options.map((option) => (
                    <Button
                      key={option.value}
                      type="button"
                      size="sm"
                      variant={variants[variant.key] === option.value && !locked ? 'default' : 'soft'}
                      aria-pressed={variants[variant.key] === option.value && !locked}
                      disabled={locked}
                      onClick={() => setVariant(variant.key, option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            );
          })}
          {config.compareVariant && (
            <label className="flex min-h-11 items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                className="size-4 accent-accent"
                checked={compare}
                onChange={(event) => setCompare(event.target.checked)}
              />
              เทียบทุก{config.variants.find((variant) => variant.key === config.compareVariant)?.label}
            </label>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Button type="submit" size="lg" disabled={running || missing.length > 0}>
            {running ? `กำลังสร้าง... ${elapsed} วินาที` : 'สร้าง'}
          </Button>
          {missing.length > 0 && !running && (
            <p className="text-sm text-inkMuted">ยังขาด: {missing.map((field) => `${field.group} ${field.label}`).join(', ')}</p>
          )}
        </div>
      </form>

      {runs.length > 0 && (
        <section aria-label="ผลลัพธ์" className={`grid gap-8 ${runs.length > 1 ? 'xl:grid-cols-2' : ''}`}>
          {runs.map((run, index) => (
            <RunPanel key={index} config={config} run={run} variants={variants} setVariant={setVariant} />
          ))}
        </section>
      )}
    </div>
  );
}
