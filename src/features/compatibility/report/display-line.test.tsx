import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { DisplayLine } from './report-kit';

const render = (text: string) => renderToStaticMarkup(<DisplayLine text={text} />);

describe('DisplayLine', () => {
  test('a long Thai phrase breaks only between sense groups, never inside พริบตา', () => {
    // คู่ไฟต่อไฟ: at 375 px the first phrase used to wrap as "…ในพริบ | ตา".
    const html = render('จุดประกายให้กันได้ในพริบตา ขอแค่มีช่วงที่ลดไฟลงบ้าง');
    expect(html).toContain('<span class="whitespace-nowrap">ในพริบตา</span>');
    expect(html).toContain('<span class="whitespace-nowrap">จุดประกาย</span><wbr/><span class="whitespace-nowrap">ให้กันได้</span><wbr/>');
    expect(html).toContain('<span class="whitespace-nowrap">ขอแค่มีช่วง</span><wbr/><span class="whitespace-nowrap">ที่ลดไฟลงบ้าง</span>');
    // Every visible character is inside a no-wrap group: the only break points are the <wbr/>s and the space.
    const outside = html.replace(/<span class="whitespace-nowrap">[^<]*<\/span>/g, '').replace(/<wbr\/>/g, '');
    expect(outside).toBe(' ');
  });

  test('a phrase of up to 16 graphemes stays whole', () => {
    expect(render('ความร้อนที่ขัดเกลา ให้คมขึ้น')).toBe(
      '<span class="whitespace-nowrap">ความร้อนที่ขัดเกลา</span> <span class="whitespace-nowrap">ให้คมขึ้น</span>',
    );
  });
});
