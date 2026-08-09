import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import {
  assignLanes,
  axisRange,
  buildDaySchedule,
  minutesOfTime,
  snapMinutes,
  timeOfMinutes,
} from '../src/lib/favorites/day-schedule.ts';
import type { ScheduledStop } from '../src/lib/favorites/day-schedule.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';

const ev = (o: Partial<CompactEvent> & Pick<CompactEvent, 'id' | 't' | 's'>): CompactEvent => ({
  c: ['other'],
  u: 'https://x',
  ...o,
});

const DAY_START = 9 * 60; // 09:00

describe('time helpers', () => {
  test('minutesOfTime / timeOfMinutes round-trip; snap rounds to 15', () => {
    assert.equal(minutesOfTime('10:30'), 630);
    assert.equal(minutesOfTime('bad'), undefined);
    assert.equal(timeOfMinutes(630), '10:30');
    assert.equal(snapMinutes(632), 630);
    assert.equal(snapMinutes(638), 645);
  });
});

describe('buildDaySchedule', () => {
  test('honours fixed start times (override first, else corpus h)', () => {
    const a = ev({ id: 'a', t: 'A', s: '2026-07-10', h: '10:00' });
    const b = ev({ id: 'b', t: 'B', s: '2026-07-10', h: '12:00' });
    const items = buildDaySchedule([a, b], 'walking', { a: '11:00' }, { a: 60, b: 60 }, DAY_START);
    assert.deepEqual(
      items.map((i) => [i.startMin, i.endMin]),
      [[660, 720], [720, 780]], // a moved to 11:00 by override; b at 12:00
    );
    assert.deepEqual(items.map((i) => i.overlap), [false, false]);
  });

  test('auto-fills from the day start when no time is known', () => {
    const a = ev({ id: 'a', t: 'A', s: '2026-07-10' });
    const b = ev({ id: 'b', t: 'B', s: '2026-07-10' });
    const items = buildDaySchedule([a, b], 'walking', {}, { a: 60, b: 60 }, DAY_START);
    assert.deepEqual(items.map((i) => i.startMin), [DAY_START, DAY_START + 60]);
  });

  test('travel between placed events pushes the next auto-start', () => {
    const a = ev({ id: 'a', t: 'A', s: '2026-07-10', g: [44.3, 8.5] });
    const b = ev({ id: 'b', t: 'B', s: '2026-07-10', g: [44.6, 9.2] }); // far → real travel
    const items = buildDaySchedule([a, b], 'walking', {}, { a: 60, b: 60 }, DAY_START);
    assert.equal(items[1]!.travelMin > 0, true);
    assert.equal(items[1]!.startMin, items[0]!.endMin + items[1]!.travelMin);
  });

  test('overlap flags both blocks when one starts before the previous ends', () => {
    const a = ev({ id: 'a', t: 'A', s: '2026-07-10', h: '10:00' });
    const b = ev({ id: 'b', t: 'B', s: '2026-07-10', h: '11:00' });
    const items = buildDaySchedule([a, b], 'walking', {}, { a: 120, b: 60 }, DAY_START); // a ends 12:00 > b start 11:00
    assert.deepEqual(items.map((i) => i.overlap), [true, true]);
  });
});

const stop = (id: string, startMin: number, endMin: number): ScheduledStop => ({
  id,
  startMin,
  endMin,
  travelMin: 0,
  overlap: false,
});

describe('timeline layout', () => {
  test('assignLanes puts overlapping blocks in separate lanes, stacks disjoint ones', () => {
    const a = stop('a', 600, 720); // 10:00–12:00
    const b = stop('b', 660, 780); // 11:00–13:00 overlaps a
    const c = stop('c', 800, 860); // 13:20–14:20 disjoint → reuses lane 0
    const { lane, count } = assignLanes([a, b, c]);
    assert.equal(count, 2);
    assert.equal(lane['a'], 0);
    assert.equal(lane['b'], 1);
    assert.equal(lane['c'], 0);
  });

  test('axisRange snaps to whole hours around the stops and the day start', () => {
    const items = [stop('a', 635, 700)]; // 10:35–11:40
    assert.deepEqual(axisRange(items, 9 * 60), { start: 9 * 60, end: 12 * 60 }); // 09:00 → 12:00
  });
});
