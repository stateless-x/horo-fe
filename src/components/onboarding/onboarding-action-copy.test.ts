import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const onboardingDir = import.meta.dir;
const read = (file: string) => readFileSync(join(onboardingDir, file), 'utf8');

describe('onboarding action copy', () => {
  test('uses one concise label for backward navigation', () => {
    const stepsWithBack = [
      'step-name.tsx',
      'step-birth-date.tsx',
      'step-gender.tsx',
      'step-birth-time.tsx',
      'step-mbti.tsx',
      'step-teaser.tsx',
      'step-auth.tsx',
    ];

    for (const step of stepsWithBack) {
      expect(read(step)).not.toContain('ย้อนกลับ');
      expect(read(step)).toMatch(/>\s*กลับ\s*<\/Button>/);
    }
  });

  test('keeps choice and skip actions short but explicit', () => {
    expect(read('step-welcome.tsx')).toMatch(/>\s*ข้าม\s*<\/button>/);
    expect(read('step-returning.tsx')).toContain('ยังไม่เคย');
    expect(read('step-returning.tsx')).toMatch(/>\s*เคยแล้ว\s*<\/Button>/);
    expect(read('step-birth-time.tsx')).toContain('ไม่ทราบเวลาเกิด');
    expect(read('step-mbti.tsx')).toContain('ไม่รู้ MBTI');
    expect(read('step-auth.tsx')).toContain('เข้าสู่ระบบด้วย Google');
    expect(read('step-auth.tsx')).toContain('เข้าสู่ระบบด้วย X');
  });
});
