import { z } from 'zod';
import { THAI_TIME_PERIODS, type BirthProfile } from '@/lib-packages/shared';
import { COMPATIBILITY_DEV_FIXTURES } from '@/lib-packages/shared/types/dev-tools';
import { completedTeaser } from '@/lib/teaser-result';
import { TeaserResultCard } from '@/components/onboarding/teaser-result-card';
import type { DevGeneratorConfig } from '../types';

const noop = () => {};

/** The same birthTime the onboarding picker sends for a chosen period. */
function birthTimeFor(periodName: string): BirthProfile['birthTime'] {
  if (periodName === '') return undefined;
  const period = THAI_TIME_PERIODS.find((entry) => entry.name === periodName);
  if (!period) throw new Error(`Unknown Thai time period: ${periodName}`);
  return { period: period.name, chineseHour: period.chineseHour, isUnknown: false };
}

export const teaserGenerator: DevGeneratorConfig = {
  id: 'teaser',
  title: 'ดวงแรกก่อนสมัคร (teaser)',
  description: 'สร้างการ์ดดวงแรกของ onboarding จากชื่อ วันเกิด เพศ และ MBTI',
  endpoint: '/api/dev/generate/teaser',
  fields: [
    { key: 'name', label: 'ชื่อ', type: 'text', group: 'ผู้มาเยือน', required: true },
    { key: 'birthDate', label: 'วันเกิด', type: 'date', group: 'ผู้มาเยือน', required: true },
    { key: 'birthPeriod', label: 'ช่วงเวลาเกิด', type: 'thaiPeriod', group: 'ผู้มาเยือน' },
    { key: 'gender', label: 'เพศ', type: 'gender', group: 'ผู้มาเยือน', required: true },
    { key: 'mbti', label: 'MBTI', type: 'mbti', group: 'ผู้มาเยือน' },
  ],
  // The compatibility fixtures' readers, so both tools share one set of synthetic people.
  presets: COMPATIBILITY_DEV_FIXTURES.map((fixture, index) => ({
    id: fixture.id,
    label: `ผู้ทดสอบ ${index + 1}${fixture.reader.mbti ? ` ${fixture.reader.mbti}` : ''}`,
    values: {
      name: `ผู้ทดสอบ ${index + 1}`,
      birthDate: fixture.reader.birthDate,
      birthPeriod: '',
      gender: fixture.reader.gender,
      mbti: fixture.reader.mbti ?? '',
    },
  })),
  variants: [],
  summary: (values) => `${values.name} · ${values.birthDate}`,
  buildRequest: (values): BirthProfile => ({
    name: values.name,
    // Same shape onboarding sends: an ISO datetime at UTC midnight.
    birthDate: `${values.birthDate}T00:00:00.000Z`,
    gender: z.enum(['male', 'female']).parse(values.gender),
    birthTime: birthTimeFor(values.birthPeriod),
    mbtiType: values.mbti === '' ? undefined : values.mbti,
  }),
  renderResult: (response) => {
    const result = completedTeaser(response.output);
    if (!result) throw new Error('The teaser response is not a complete teaser');
    return (
      <div className="flex justify-center rounded-2xl border border-edge bg-ground px-4 py-8">
        <TeaserResultCard result={result} onBack={noop} onShare={noop} onPrimaryCta={noop} onCompatCta={noop} />
      </div>
    );
  },
};
