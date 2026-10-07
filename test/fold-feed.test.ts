// A region's feed is every upcoming day, and almost nobody reads past the
// first few. The page now renders the nearest days and keeps the rest folded
// away until somebody asks for them. This is where the fold falls.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { foldFeed } from '../src/lib/events/fold-feed.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';
import type { DayGroup } from '../src/lib/events/feed-day-groups.ts';

const events = (count: number): readonly CompactEvent[] =>
  Array.from({ length: count }, (_, index) => ({ id: `e${index}`, t: 'x', s: '2026-11-01', c: [], u: '' }));
const day = (date: string, count: number): DayGroup => [date, events(count)];
const days = (folded: readonly DayGroup[]): readonly string[] => folded.map(([date]) => date);

describe('where a feed is folded', () => {
  const groups = [day('2026-11-01', 10), day('2026-11-02', 10), day('2026-11-03', 10), day('2026-11-04', 10)];
  test('after the day that brings the count to the minimum, never inside a day', () => {
    const { head, tail } = foldFeed(groups, 15);
    assert.deepEqual([days(head), days(tail)], [['2026-11-01', '2026-11-02'], ['2026-11-03', '2026-11-04']]);
  });
  test('a first day that is already enough stands alone', () => {
    assert.deepEqual(days(foldFeed(groups, 10).head), ['2026-11-01']);
  });
  test('a feed shorter than the minimum is not folded at all', () => {
    const { head, tail } = foldFeed(groups, 100);
    assert.deepEqual([head.length, tail.length], [4, 0]);
  });
  test('an empty feed folds into nothing and nothing', () => {
    assert.deepEqual(foldFeed([], 24), { head: [], tail: [] });
  });
  test('nothing is lost and nothing is repeated', () => {
    const { head, tail } = foldFeed(groups, 15);
    assert.deepEqual([...head, ...tail], groups);
  });
});
