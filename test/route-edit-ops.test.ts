import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import {
  addStopToDay,
  addableEvents,
  moveStopToDay,
  moveTargetDays,
  removeStop,
  reorderStop,
} from '../src/components/favorites/route-edit-ops.ts';
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
