import { z } from 'zod';
import { RELATIONSHIP_LABELS, RELATIONSHIP_TYPES } from '@/lib-packages/shared';
import {
  COMPATIBILITY_VIEWS,
  shapeCompatibilityView,
  CompatibilityV4ContentSchema,
} from '@/lib-packages/shared/types/compatibility';
import {
  COMPATIBILITY_DEV_FIXTURES,
  type DevCompatibilityRequest,
} from '@/lib-packages/shared/types/dev-tools';
import { CompatibilityReading } from '@/features/compatibility/compatibility-reading';
import type { DevGeneratorConfig } from '../types';

const OutputSchema = z.object({
  score: z.number(),
  relationshipType: z.enum(RELATIONSHIP_TYPES),
  readerName: z.string().nullable(),
  partnerName: z.string(),
  qualityFlags: z.array(z.string()).optional(),
});
const ContentSchema = CompatibilityV4ContentSchema;
const VIEW_OPTIONS = [
  { value: 'full', label: 'ทั้งหมด' },
  { value: 'teaser', label: 'ส่วนฟรี' },
];
const labelOf = (options: ReadonlyArray<{ value: string; label: string }>, value: string) =>
  options.find((option) => option.value === value)?.label;

const optional = (value: string) => (value === '' ? undefined : value);

export const compatibilityGenerator: DevGeneratorConfig = {
  id: 'compatibility',
  title: 'ดวงคู่',
  description: 'ลองสร้างดวงคู่จากวันเกิดสองคน (ไม่บันทึก) เลือกเนื้อหา แล้วดูทั้งหมดหรือเฉพาะส่วนฟรี',
  endpoint: '/api/dev/generate/compatibility',
  fields: [
    { key: 'readerName', label: 'ชื่อ (แสดงบนรายงานเท่านั้น)', type: 'text', group: 'คุณ' },
    { key: 'readerBirthDate', label: 'วันเกิด', type: 'date', group: 'คุณ', required: true },
    { key: 'readerBirthHour', label: 'ชั่วโมงเกิด', type: 'hour', group: 'คุณ' },
    { key: 'readerGender', label: 'เพศ', type: 'gender', group: 'คุณ', required: true },
    { key: 'readerMbti', label: 'MBTI', type: 'mbti', group: 'คุณ' },
    { key: 'partnerName', label: 'ชื่อ', type: 'text', group: 'อีกฝ่าย', required: true },
    { key: 'partnerBirthDate', label: 'วันเกิด', type: 'date', group: 'อีกฝ่าย', required: true },
    { key: 'partnerMbti', label: 'MBTI', type: 'mbti', group: 'อีกฝ่าย' },
    { key: 'relationshipType', label: 'ความสัมพันธ์', type: 'relationship', group: 'ความสัมพันธ์', required: true },
  ],
  presets: COMPATIBILITY_DEV_FIXTURES.map((fixture) => ({
    id: fixture.id,
    label: fixture.label,
    values: {
      readerBirthDate: fixture.reader.birthDate,
      readerBirthHour: fixture.reader.birthHour === undefined ? '' : String(fixture.reader.birthHour),
      readerGender: fixture.reader.gender,
      readerMbti: fixture.reader.mbti ?? '',
      partnerName: fixture.partner.name,
      partnerBirthDate: fixture.partner.birthDate,
      partnerMbti: fixture.partner.mbti ?? '',
      relationshipType: fixture.relationshipType,
    },
  })),
  variants: [{ key: 'view', label: 'มุมมอง', options: VIEW_OPTIONS }],
  presentationVariants: ['view'],
  buildRequest: (values, variants): DevCompatibilityRequest => ({
    reader: {
      name: optional(values.readerName),
      birthDate: values.readerBirthDate,
      birthHour: values.readerBirthHour === '' ? undefined : Number(values.readerBirthHour),
      gender: z.enum(['male', 'female']).parse(values.readerGender),
      mbti: optional(values.readerMbti),
    },
    partner: {
      name: values.partnerName,
      birthDate: values.partnerBirthDate,
      mbti: optional(values.partnerMbti),
    },
    relationshipType: z.enum(RELATIONSHIP_TYPES).parse(values.relationshipType),
    view: z.enum(COMPATIBILITY_VIEWS).parse(variants.view),
  }),
  summary: (values, variants) =>
    [
      RELATIONSHIP_LABELS[z.enum(RELATIONSHIP_TYPES).parse(values.relationshipType)],
      values.partnerName,
      labelOf(VIEW_OPTIONS, variants.view),
    ]
      .filter(Boolean)
      .join(' · '),
  renderResult: (response, variants, setVariant) => {
    const output = OutputSchema.parse(response.output);
    const content = ContentSchema.parse(response.content);
    const view = z.enum(COMPATIBILITY_VIEWS).parse(variants.view);
    // Re-shape the stored reading for the current view, the same way the
    // server does, so switching views never needs another generation.
    const structuredContent = shapeCompatibilityView(content, view);
    return (
      <>
        {output.qualityFlags && output.qualityFlags.length > 0 && (
          <details className="mb-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 font-mono text-xs text-ink">
            <summary className="cursor-pointer">quality flags ({output.qualityFlags.length})</summary>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {output.qualityFlags.map((flag, index) => (
                <li key={index}>{flag}</li>
              ))}
            </ul>
          </details>
        )}
        <CompatibilityReading
          score={output.score}
          analysis={JSON.stringify(content)}
          structuredContent={structuredContent}
          relationshipType={output.relationshipType}
          readerName={output.readerName}
          partnerName={output.partnerName}
          // Prepared, not enforced: in the dev tool the unlock just opens the full view.
          onUnlock={() => setVariant('view', 'full')}
        />
      </>
    );
  },
};
