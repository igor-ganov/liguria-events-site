import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import {
  addStopToDay,
  addableEvents,
  dropEmptyDays,
  moveStopToDay,
  moveStopToIndex,
  moveTargetDays,
  removeStop,
  reorderStop,
} from '../src/components/favorites/route-edit-ops.ts';
import { insertAtIndex } from '../src/components/favorites/insert-at-index.ts';
import { swapInDay } from '../src/components/favorites/swap-in-day.ts';
import type { DayGroup } from '../src/lib/favorites/build-route.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';

const ev = (o: Partial<CompactEvent> & Pick<CompactEvent, 'id' | 't' | 's'>): CompactEvent => ({
  c: ['other'],
  u: 'https://x',
  ...o,
});

const a = ev({ id: 'a', t: 'A', s: '2026-07-10' }); // single-day, 10 Jul
const b = ev({ id: 'b', t: 'B', s: '2026-07-10' }); // single-day, 10 Jul
const m = ev({ id: 'm', t: 'M', s: '2026-07-10', e: '2026-07-12' }); // multi-day 10–12
const x = ev({ id: 'x', t: 'X', s: '2026-07-11' }); // single-day, 11 Jul — a favourite
const byId = new Map<string, CompactEvent>([a, b, m, x].map((e) => [e.id, e]));

const groups: readonly DayGroup[] = [
  { day: '2026-07-10', ids: ['a', 'm'] },
  { day: '2026-07-11', ids: ['b'] },
];

describe('route edit operations', () => {
  test('removeStop removes the id and drops a day left empty', () => {
    assert.deepEqual(removeStop(groups, 'b', '2026-07-11'), [{ day: '2026-07-10', ids: ['a', 'm'] }]);
  });

  test('reorderStop swaps within a day and is a no-op at the bounds', () => {
    assert.deepEqual(reorderStop(groups, 'm', '2026-07-10', -1)[0]?.ids, ['m', 'a']);
    assert.deepEqual(reorderStop(groups, 'a', '2026-07-10', -1)[0]?.ids, ['a', 'm']); // already first
  });

  test('moveStopToDay moves a multi-day event between days', () => {
    const moved = moveStopToDay(groups, 'm', '2026-07-10', '2026-07-11');
    assert.deepEqual(moved.find((g) => g.day === '2026-07-10')?.ids, ['a']);
    assert.deepEqual(moved.find((g) => g.day === '2026-07-11')?.ids, ['b', 'm']);
  });

  test('moveTargetDays offers only other days the event is available on', () => {
    assert.deepEqual(moveTargetDays(groups, m, '2026-07-10'), ['2026-07-11']); // multi-day covers 11th
    assert.deepEqual(moveTargetDays(groups, a, '2026-07-10'), []); // single-day can't move
  });

  test('addableEvents lists favourites available that day and not already placed', () => {
    const favs = new Set(['x', 'a']); // a is already in the route
    assert.deepEqual(addableEvents(groups, favs, byId, '2026-07-11').map((e) => e.id), ['x']);
    assert.deepEqual(addableEvents(groups, favs, byId, '2026-07-10').map((e) => e.id), []); // x isn't on the 10th
  });

  test('addStopToDay appends to the chosen day', () => {
    assert.deepEqual(addStopToDay(groups, 'x', '2026-07-11')[1]?.ids, ['b', 'x']);
  });
});

describe('dropEmptyDays', () => {
  test('keeps the days that still hold a stop', () => {
    assert.deepEqual(dropEmptyDays(groups), groups);
  });

  test('drops every day left without a stop', () => {
    const thinned = dropEmptyDays([
      { day: '2026-07-10', ids: [] },
      { day: '2026-07-11', ids: ['b'] },
      { day: '2026-07-12', ids: [] },
    ]);
    assert.deepEqual(thinned, [{ day: '2026-07-11', ids: ['b'] }]);
  });

  test('an empty route stays empty', () => {
    assert.deepEqual(dropEmptyDays([]), []);
  });
});

describe('swapInDay', () => {
  const day: DayGroup = { day: '2026-07-10', ids: ['a', 'b', 'c'] };

  test('swaps with the neighbour above and below', () => {
    assert.deepEqual(swapInDay(day, 'b', -1).ids, ['b', 'a', 'c']);
    assert.deepEqual(swapInDay(day, 'b', 1).ids, ['a', 'c', 'b']);
  });

  test('is a no-op past either end', () => {
    assert.equal(swapInDay(day, 'a', -1), day);
    assert.equal(swapInDay(day, 'c', 1), day);
  });

  test('is a no-op for a stop that is not on the day', () => {
    assert.equal(swapInDay(day, 'zzz', 1), day);
  });

  test('leaves the other fields of the day alone', () => {
    assert.equal(swapInDay(day, 'a', 1).day, '2026-07-10');
  });
});

describe('insertAtIndex', () => {
  const day: DayGroup = { day: '2026-07-10', ids: ['a', 'b', 'c'] };

  test('re-seats the stop at the given index', () => {
    assert.deepEqual(insertAtIndex(day, 'c', 0).ids, ['c', 'a', 'b']);
    assert.deepEqual(insertAtIndex(day, 'a', 1).ids, ['b', 'a', 'c']);
  });

  test('clamps below zero and past the end, so a drop past the last stop appends', () => {
    assert.deepEqual(insertAtIndex(day, 'c', -5).ids, ['c', 'a', 'b']);
    assert.deepEqual(insertAtIndex(day, 'a', 99).ids, ['b', 'c', 'a']);
  });

  test('rounds a fractional index, the pixel-derived value the drag commits', () => {
    assert.deepEqual(insertAtIndex(day, 'a', 1.6).ids, ['b', 'c', 'a']);
    assert.deepEqual(insertAtIndex(day, 'a', 1.4).ids, ['b', 'a', 'c']);
  });

  test('a day the stop is not on comes back untouched', () => {
    assert.equal(insertAtIndex(day, 'zzz', 0), day);
  });
});

describe('moveStopToIndex', () => {
  test('reorders only the day the stop was dragged on', () => {
    const moved = moveStopToIndex(groups, 'm', '2026-07-10', 0);
    assert.deepEqual(moved[0]?.ids, ['m', 'a']);
    assert.equal(moved[1], groups[1]);
  });

  test('a day name that matches nothing leaves the route alone', () => {
    assert.deepEqual(moveStopToIndex(groups, 'a', '2026-07-31', 0), groups);
  });
});

describe('branch-free guards keep the former conditional behaviour', () => {
  test('removeStop ignores a day that does not hold the id', () => {
    assert.deepEqual(removeStop(groups, 'zzz', '2026-07-10'), groups);
  });

  test('removeStop only touches the named day', () => {
    assert.deepEqual(removeStop(groups, 'a', '2026-07-11'), groups);
  });

  test('moving a stop onto the day it is already on removes it rather than duplicating', () => {
    assert.deepEqual(moveStopToDay(groups, 'b', '2026-07-11', '2026-07-11'), [
      { day: '2026-07-10', ids: ['a', 'm'] },
    ]);
  });

  test('addStopToDay ignores a day that is not in the route', () => {
    assert.deepEqual(addStopToDay(groups, 'x', '2026-07-31'), groups);
  });
});
