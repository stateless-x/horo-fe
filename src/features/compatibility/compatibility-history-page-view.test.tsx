import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import type { RelationshipType } from '@/lib-packages/shared';
import { CompatibilityHistoryPageView, type HistoryPageStatus } from './compatibility-history-page-view';
import { HISTORY_PAGE_SIZE, selectHistoryPage } from './history-paging';
import { historyItems } from './history-test-fixtures';

const noop = () => {};
const pages = [
  { data: historyItems('a', HISTORY_PAGE_SIZE) },
  { data: historyItems('b', HISTORY_PAGE_SIZE) },
  { data: historyItems('c', 5) },
];
const TOTAL = 45;

/** Renders the view the way the container does: the selected page of the loaded pages. */
function renderPage(page: number, type?: RelationshipType) {
  const selection = selectHistoryPage(pages, TOTAL, false, page);
  return renderToStaticMarkup(
    <CompatibilityHistoryPageView
      type={type}
      status="ready"
      total={TOTAL}
      items={selection.items ?? []}
      page={selection.current}
      pageCount={selection.pageCount}
      onRetry={noop}
      onViewHistory={noop}
    />,
  );
}

function renderState(status: HistoryPageStatus, type?: RelationshipType) {
  return renderToStaticMarkup(
    <CompatibilityHistoryPageView
      type={type}
      status={status}
      total={0}
      items={[]}
      page={1}
      pageCount={1}
      onRetry={noop}
      onViewHistory={noop}
    />,
  );
}

const hrefs = (html: string) => [...html.matchAll(/href="([^"]+)"/g)].map((match) => match[1].replaceAll('&amp;', '&'));

describe('CompatibilityHistoryPageView', () => {
  test('lists one page of rows with the total', () => {
    const html = renderPage(1);

    expect(html).toContain('ดวงคู่ที่เคยดู');
    expect(html).toContain('ทั้งหมด 45 ครั้ง');
    expect(html.match(/<button/g)).toHaveLength(HISTORY_PAGE_SIZE);
    expect(html).toContain('>a-1<');
    expect(html).toContain('>a-20<');
    expect(html).toContain('หน้า 1 / 3');
  });

  test('page 1 disables ก่อนหน้า and links ถัดไป to page 2', () => {
    const html = renderPage(1);

    expect(html).toMatch(/<span aria-disabled="true"[^>]*>.*?ก่อนหน้า<\/span>/);
    expect(hrefs(html)).toContain('/dashboard/compatibility/history?page=2');
    expect(hrefs(html)).not.toContain('/dashboard/compatibility/history?page=0');
  });

  test('moving a page replaces the rows instead of appending them', () => {
    const second = renderPage(2);

    expect(second).toContain('>b-1<');
    expect(second).not.toContain('>a-1<');
    expect(second.match(/<button/g)).toHaveLength(HISTORY_PAGE_SIZE);
    expect(second).toContain('หน้า 2 / 3');
    const pager = hrefs(second.split('aria-label="เปลี่ยนหน้า"')[1]);
    expect(pager).toEqual(['/dashboard/compatibility/history', '/dashboard/compatibility/history?page=3']);
    expect(second).not.toContain('aria-disabled');
  });

  test('the last page shows the remainder and disables ถัดไป', () => {
    const last = renderPage(3);

    expect(last.match(/<button/g)).toHaveLength(5);
    expect(last).toContain('>c-5<');
    expect(last).toMatch(/<span aria-disabled="true"[^>]*>ถัดไป/);
    expect(hrefs(last)).toContain('/dashboard/compatibility/history?page=2');
  });

  test('keeps the filter in the pager and marks it current', () => {
    const html = renderPage(1, 'boss');

    expect(html).toContain('หัวหน้า 45 ครั้ง');
    expect(hrefs(html)).toContain('/dashboard/compatibility/history?type=boss&page=2');
    expect(html).toMatch(/aria-current="page"[^>]*>หัวหน้า</);
  });

  test('hides the pager when everything fits on one page', () => {
    const html = renderToStaticMarkup(
      <CompatibilityHistoryPageView
        status="ready"
        total={4}
        items={historyItems('d', 4)}
        page={1}
        pageCount={1}
        onRetry={noop}
        onViewHistory={noop}
      />,
    );

    expect(html.match(/<button/g)).toHaveLength(4);
    expect(html).not.toContain('ถัดไป');
  });

  test('empty history invites a first check', () => {
    const html = renderState('ready');

    expect(html).toContain('ดวงคู่ครั้งแรก เริ่มที่ใครดี');
    expect(html).toContain('เริ่มดูดวงคู่');
    expect(html).not.toContain('<button');
  });

  test('an empty filter says which type has none', () => {
    const html = renderState('ready', 'family');

    expect(html).toContain('ยังไม่เคยดูดวงคู่แบบครอบครัว');
    expect(html).not.toContain('ดวงคู่ครั้งแรก');
  });

  test('loading and error states replace the list', () => {
    expect(renderState('loading')).toContain('animate-spin');
    const error = renderState('error');
    expect(error).toContain('โหลดดวงคู่ที่เคยดูไม่สำเร็จ');
    expect(error).toContain('ลองอีกครั้ง');
  });
});
