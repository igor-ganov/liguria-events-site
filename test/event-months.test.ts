// 975 of the 1 552 URLs in the generated sitemap were calendar months, back to
// November 2024 — one page per region per locale, each listing nothing, offered
// to a crawler that fetches a dozen pages a day. A month that has already
// passed has an archive; it does not need a calendar.
import { describe, expect, test } from 'bun:test';
import { eventMonths } from '../src/lib/calendar/event-months.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';

const on = (start: string, end?: string): CompactEvent => ({
  id: `${start}${end ?? ''}`,
  t: 'Sagra',
  s: start,
  e: end,
  c: ['food'],
  u: 'https://source/1',
});

const TODAY = '2026-09-27';

describe('eventMonths', () => {
  test('starts one month back, however old the oldest event is', () => {
    expect(eventMonths([on('2024-11-02'), on('2026-10-04')], TODAY).at(0)).toBe('2026-08');
  });

  test('and runs one month past the last of them', () => {
    expect(eventMonths([on('2026-10-04'), on('2026-11-30')], TODAY).at(-1)).toBe('2026-12');
  });

  // Something in the corpus runs until 2029. Following it built 804 month pages.
  test('but no further ahead than the horizon, whatever the corpus announces', () => {
    expect(eventMonths([on('2029-06-01')], TODAY).at(-1)).toBe('2026-12');
  });

  test('covers every month in between, with no gaps', () => {
    expect(eventMonths([on('2026-10-01')], TODAY)).toEqual([
      '2026-08',
      '2026-09',
      '2026-10',
      '2026-11',
    ]);
  });

  test('a region whose events are all finished still has this month', () => {
    expect(eventMonths([on('2024-11-02')], TODAY)).toContain('2026-09');
  });

  test('and a region with no events at all is not left without a calendar', () => {
    expect(eventMonths([], TODAY)).toContain('2026-09');
  });

  test('a long event is counted by where it ends', () => {
    expect(eventMonths([on('2026-09-01', '2026-10-31')], TODAY).at(-1)).toBe('2026-11');
  });
});
