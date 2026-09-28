import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { GuidanceColumns } from './fortune-guidance';

describe('GuidanceColumns', () => {
  test('frames advice as a next move and a pause, without a punitive do and do not pattern', () => {
    const html = renderToStaticMarkup(
      <GuidanceColumns
        positiveItems={['ทักเพื่อนที่ไว้ใจสักคน']}
        negativeItems={['ยังไม่ต้องรีบตอบเรื่องใหญ่']}
        positiveLabel="ลองเริ่มจากตรงนี้"
        negativeLabel="เรื่องนี้พักไว้ก่อน"
      />,
    );

    expect(html).toContain('ลองเริ่มจากตรงนี้');
    expect(html).toContain('เรื่องนี้พักไว้ก่อน');
    expect(html).toContain('ทักเพื่อนที่ไว้ใจสักคน');
    expect(html).toContain('ยังไม่ต้องรีบตอบเรื่องใหญ่');
    expect(html).not.toContain('ทำ และเลี่ยง');
    expect(html).not.toContain('เก็บไว้ในใจ');
  });

  test('does not render an empty decision lane', () => {
    const html = renderToStaticMarkup(
      <GuidanceColumns positiveItems={['เริ่มจากเรื่องเดียว']} negativeItems={[]} positiveLabel="เริ่มจากตรงนี้" negativeLabel="พักก่อน" />,
    );

    expect(html).toContain('เริ่มจากตรงนี้');
    expect(html).not.toContain('พักก่อน');
  });
});
