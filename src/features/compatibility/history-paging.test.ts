import { describe, expect, test } from 'bun:test';
import { HISTORY_PAGE_SIZE, HISTORY_PREVIEW_LIMIT, selectHistoryPage } from './history-paging';
import { historyItems } from './history-test-fixtures';

const first = { data: historyItems('a', HISTORY_PAGE_SIZE) };
const second = { data: historyItems('b', HISTORY_PAGE_SIZE) };
const third = { data: historyItems('c', 5) };

describe('selectHistoryPage', () => {
  test('the dashboard preview is three rows', () => {
    expect(HISTORY_PREVIEW_LIMIT).toBe(3);
  });

  test('shows the requested loaded page, not the pages before it', () => {
    const pages = [first, second, third];
    expect(selectHistoryPage(pages, 45, false, 1).items).toBe(first.data);
    expect(selectHistoryPage(pages, 45, false, 2).items).toBe(second.data);
    expect(selectHistoryPage(pages, 45, false, 3)).toEqual({ current: 3, pageCount: 3, items: third.data, needsFetch: false });
  });

  test('asks for the next cursor page when the requested page is not loaded yet', () => {
    expect(selectHistoryPage([first], 45, true, 2)).toEqual({ current: 2, pageCount: 3, items: undefined, needsFetch: true });
    expect(selectHistoryPage([first], 45, true, 3).needsFetch).toBe(true);
  });

  test('clamps a page past the end to the last page', () => {
    expect(selectHistoryPage([first, second, third], 45, false, 9)).toMatchObject({ current: 3, items: third.data });
    expect(selectHistoryPage([first], 45, true, 9)).toMatchObject({ current: 3, needsFetch: true });
  });

  test('trusts the cursor over a stale total', () => {
    // total said one page, but a cursor came back: there is at least one more.
    expect(selectHistoryPage([first], 20, true, 2)).toMatchObject({ current: 2, pageCount: 2, needsFetch: true });
    // total said three pages, but the cursor ran out after two.
    expect(selectHistoryPage([first, second], 45, false, 3)).toMatchObject({ current: 2, pageCount: 2, items: second.data });
  });

  test('an empty history is one empty page', () => {
    expect(selectHistoryPage([{ data: [] }], 0, false, 1)).toEqual({ current: 1, pageCount: 1, items: [], needsFetch: false });
  });
});
