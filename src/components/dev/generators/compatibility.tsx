import { z } from 'zod';
import { RELATIONSHIP_TYPES } from '@/lib-packages/shared';
import { CompatibilityStructuredContentSchema } from '@/lib-packages/shared/types/reading';
import {
  COMPATIBILITY_VIEWS,
  CompatibilityV3ContentSchema,
  shapeCompatibilityView,
} from '@/lib-packages/shared/types/compatibility-v3';
import {
  COMPATIBILITY_DEV_FIXTURES,
  type DevCompatibilityRequest,
} from '@/lib-packages/shared/types/dev-tools';
import { CompatibilityReading } from '@/features/compatibility/compatibility-reading';
import type { DevGeneratorConfig } from '../types';

const OutputSchema = z.object({ score: z.number(), relationshipType: z.enum(RELATIONSHIP_TYPES) });
const ContentSchema = z.union([CompatibilityStructuredContentSchema, CompatibilityV3ContentSchema]);

const optional = (value: string) => (value === '' ? undefined : value);

export const compatibilityGenerator: DevGeneratorConfig = {
  id: 'compatibility',
  title: 'ดวงคู่',
  description: 'สร้างดวงคู่จากวันเกิดสองคน เลือก v2 หรือ v3 และดูแบบ teaser หรือฉบับเต็ม',
  endpoint: '/api/dev/generate/compatibility',
  fields: [
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
  variants: [
    { key: 'version', label: 'เวอร์ชัน', options: [{ value: 'v3', label: 'v3' }, { value: 'v2', label: 'v2' }] },
    { key: 'view', label: 'มุมมอง (v3)', options: [{ value: 'full', label: 'ฉบับเต็ม' }, { value: 'teaser', label: 'teaser' }] },
  ],
  compareVariant: 'version',
  presentationVariants: ['view'],
  buildRequest: (values, variants): DevCompatibilityRequest => ({
    reader: {
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
    version: z.enum(['v2', 'v3']).parse(variants.version),
    view: z.enum(COMPATIBILITY_VIEWS).parse(variants.view),
  }),
  renderResult: (response, variants, setVariant) => {
    const output = OutputSchema.parse(response.output);
    const content = ContentSchema.parse(response.content);
    // v3: re-shape the stored reading for the current view, the same way the
    // server does, so switching views never needs another generation.
    const structuredContent =
      content.contentVersion === 3
        ? shapeCompatibilityView(content, z.enum(COMPATIBILITY_VIEWS).parse(variants.view))
        : content;
    return (
      <CompatibilityReading
        score={output.score}
        analysis={JSON.stringify(content)}
        structuredContent={structuredContent}
        relationshipType={output.relationshipType}
        // Prepared, not enforced: in the dev tool the unlock just opens the full view.
        onUnlock={() => setVariant('view', 'full')}
      />
    );
  },
};
