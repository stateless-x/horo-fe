import type { ReactNode } from 'react';
import type { DevGenerateResponse } from '@/lib-packages/shared/types/dev-tools';

/**
 * A dev generator is a config object, not a page. DevGenerator owns the form,
 * the request, timings, errors, raw JSON and compare mode; a config only says
 * which fields to ask for, how to turn them into a request body, and which
 * real product component renders the result.
 */

/** Only the field types the generators actually need. */
export type DevFieldType = 'text' | 'date' | 'hour' | 'thaiPeriod' | 'gender' | 'mbti' | 'relationship';

export interface DevField {
  key: string;
  label: string;
  type: DevFieldType;
  /** Fields sharing a group render under one heading, e.g. "คุณ" and "อีกฝ่าย". */
  group: string;
  /**
   * Required fields block the generate button while empty. `hour` is a 0-23
   * clock hour; `thaiPeriod` is the onboarding birth-time picker's list.
   */
  required?: boolean;
}

/** Every value is the raw input string; '' means empty. buildRequest converts. */
export type DevFormValues = Record<string, string>;

export interface DevVariant {
  key: string;
  label: string;
  options: ReadonlyArray<{ value: string; label: string }>;
}

export type DevVariantValues = Record<string, string>;

export interface DevPreset {
  id: string;
  label: string;
  values: DevFormValues;
}

export interface DevGeneratorConfig {
  id: string;
  title: string;
  description: string;
  /** Backend path, e.g. /api/dev/generate/compatibility. */
  endpoint: string;
  fields: ReadonlyArray<DevField>;
  presets: ReadonlyArray<DevPreset>;
  variants: ReadonlyArray<DevVariant>;
  /** One line describing the last request, shown in place of the form after a generation. */
  summary: (values: DevFormValues, variants: DevVariantValues) => string;
  /** Maps form values and chosen variants to the endpoint's request body. */
  buildRequest: (values: DevFormValues, variants: DevVariantValues) => unknown;
  /** The variant compare mode runs once per option, side by side. Omit to disable compare. */
  compareVariant?: string;
  /**
   * Renders one response with the real product component. `variants` is the
   * current selection, so a variant that only changes presentation (a view)
   * re-renders the stored response without a new request. `setVariant` lets
   * the result drive the form, e.g. the locked card's unlock button opening
   * the full view.
   */
  renderResult: (
    response: DevGenerateResponse<unknown, unknown>,
    variants: DevVariantValues,
    setVariant: (key: string, value: string) => void,
  ) => ReactNode;
  /** Variants that change only presentation; switching them never asks for a new generation. */
  presentationVariants?: ReadonlyArray<string>;
}
