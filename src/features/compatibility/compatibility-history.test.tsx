import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { CompatibilityHistory, CompatibilityHistoryList } from './compatibility-history';
import { compatibilityHistoryPath } from './compatibility-routes';
import { historyItems } from './history-test-fixtures';

const noop = () => {};

function renderSection(itemCount: number, totalHistory: number, state: { isLoading?: boolean; isError?: boolean } = {}) {
  return renderToStaticMarkup(
    <CompatibilityHistory
      items={historyItems('p', itemCount)}
      totalHistory={totalHistory}
      isLoading={state.isLoading ?? false}
      isError={state.isError ?? false}
      onRetry={noop}
      onViewHistory={noop}
      seeAllHref={compatibilityHistoryPath()}
    />,
  );
}

describe('CompatibilityHistory (dashboard preview)', () => {
  test('marks only locked previews, without hiding their history navigation', () => {
    const items = historyItems('p', 3);
    items[0].locked = true;
    items[1].locked = false;
    const html = renderToStaticMarkup(<CompatibilityHistoryList items={items} onViewHistory={noop} />);
    expect(html).toContain('class="sr-only">ยังไม่เปิดฉบับเต็ม');
    expect(html.match(/lucide-lock-keyhole/g)).toHaveLength(1);
    expect(html.match(/<button/g)).toHaveLength(3);
    expect(html).toContain('class="sr-only">อ่านฉบับเต็มได้');
    expect(html).not.toContain('ไฟ x น้ำ');
  });

  test('shows the three newest rows and links to the full history when there are more', () => {
    const html = renderSection(3, 12);

    expect(html.match(/<button/g)).toHaveLength(3);
    expect(html).toContain('>p-3<');
    expect(html).toContain('12 ครั้ง');
    expect(html).toContain('href="/dashboard/compatibility/history"');
    expect(html).toContain('ดูทั้งหมด');
    expect(html).not.toContain('โหลดเพิ่ม');
  });

  test('drops the link when every check is already on screen', () => {
    const html = renderSection(3, 3);

    expect(html.match(/<button/g)).toHaveLength(3);
    expect(html).not.toContain('ดูทั้งหมด');
  });

  test('invites a first check when there is no history', () => {
    const html = renderSection(0, 0);

    expect(html).toContain('ดวงคู่ครั้งแรก เริ่มที่ใครดี');
    expect(html).not.toContain('ดูทั้งหมด');
  });

  test('says the load failed instead of pretending the history is empty', () => {
    const html = renderSection(0, 0, { isError: true });

    expect(html).toContain('โหลดดวงคู่ที่เคยดูไม่สำเร็จ');
    expect(html).toContain('ลองอีกครั้ง');
    expect(html).not.toContain('ดวงคู่ครั้งแรก');
  });
});
