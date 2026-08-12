import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { axisRange, buildDaySchedule, minutesOfTime, snapMinutes, timeOfMinutes } from '../src/lib/favorites/day-schedule.ts';
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
  test('unpinned stops flow: the first opens the day, each next follows the previous', () => {
    const a = ev({ id: 'a', t: 'A', s: '2026-07-10' });
    const b = ev({ id: 'b', t: 'B', s: '2026-07-10' });
    const items = buildDaySchedule([a, b], 'walking', {}, { a: 60, b: 60 }, {}, DAY_START);
    assert.deepEqual(items.map((i) => i.startMin), [DAY_START, DAY_START + 60]);
    assert.deepEqual(items.map((i) => i.offSchedule), [false, false]);
  });

  test('a pin later than the flow opens a gap; the next flows after it', () => {
    const a = ev({ id: 'a', t: 'A', s: '2026-07-10' });
    const b = ev({ id: 'b', t: 'B', s: '2026-07-10' });
    const items = buildDaySchedule([a, b], 'walking', { a: '11:00' }, { a: 60, b: 60 }, {}, DAY_START);
    assert.deepEqual(items.map((i) => [i.startMin, i.endMin]), [[660, 720], [720, 780]]);
  });

  test('a pin is a minimum, never an overlap: a too-early pin is clamped to the flow', () => {
    const a = ev({ id: 'a', t: 'A', s: '2026-07-10' });
    const b = ev({ id: 'b', t: 'B', s: '2026-07-10' });
    // b wants 09:00 but a occupies 09:00–10:00, so b is clamped to 10:00 (no overlap).
    const items = buildDaySchedule([a, b], 'walking', { b: '09:00' }, { a: 60, b: 60 }, {}, DAY_START);
    assert.deepEqual(items.map((i) => i.startMin), [540, 600]);
  });

  test('travel is measured from the last LOCATED stop, skipping a location-less one (a break)', () => {
    const a = ev({ id: 'a', t: 'A', s: '2026-07-10', g: [44.3, 8.5] });
    const brk = ev({ id: 'n', t: 'Break', s: '2026-07-10' }); // no coords
    const c = ev({ id: 'c', t: 'C', s: '2026-07-10', g: [44.6, 9.2] });
    const items = buildDaySchedule([a, brk, c], 'walking', {}, { a: 60, n: 60, c: 60 }, {}, DAY_START);
    assert.equal(items[1]!.travelMin, 0); // nothing to travel to a location-less stop
    assert.equal(items[2]!.travelMin > 0, true); // c still pays the walk from a
  });

  test('a pause after a stop pushes the next start', () => {
    const a = ev({ id: 'a', t: 'A', s: '2026-07-10' });
    const b = ev({ id: 'b', t: 'B', s: '2026-07-10' });
    const items = buildDaySchedule([a, b], 'walking', {}, { a: 60, b: 60 }, { a: 60 }, DAY_START);
    assert.deepEqual(items.map((i) => i.startMin), [DAY_START, DAY_START + 120]); // 60 visit + 60 pause
  });

  test('travel between placed events pushes the next start', () => {
    const a = ev({ id: 'a', t: 'A', s: '2026-07-10', g: [44.3, 8.5] });
    const b = ev({ id: 'b', t: 'B', s: '2026-07-10', g: [44.6, 9.2] });
    const items = buildDaySchedule([a, b], 'walking', {}, { a: 60, b: 60 }, {}, DAY_START);
    assert.equal(items[1]!.travelMin > 0, true);
    assert.equal(items[1]!.startMin, items[0]!.endMin + items[1]!.travelMin);
  });

  test('a fixed-time stop scheduled before it opens is off-schedule', () => {
    const concert = ev({ id: 'c', t: 'C', s: '2026-07-10', h: '12:00', du: 120 });
    const items = buildDaySchedule([concert], 'walking', {}, {}, {}, DAY_START);
    assert.equal(items[0]!.offSchedule, true);
  });

  test('inside its official window it is on-schedule; overrunning the close is off', () => {
    const concert = ev({ id: 'c', t: 'C', s: '2026-07-10', h: '09:00', du: 120 });
    const ok = buildDaySchedule([concert], 'walking', {}, { c: 90 }, {}, DAY_START);
    assert.equal(ok[0]!.offSchedule, false);
    const over = buildDaySchedule([concert], 'walking', {}, { c: 180 }, {}, DAY_START);
    assert.equal(over[0]!.offSchedule, true);
  });

  test('a stop without a fixed time is never off-schedule', () => {
    const poi = ev({ id: 'p', t: 'P', s: '2026-07-10' });
    const items = buildDaySchedule([poi], 'walking', {}, { p: 600 }, {}, DAY_START);
    assert.equal(items[0]!.offSchedule, false);
  });
});

const stop = (id: string, startMin: number, endMin: number): ScheduledStop => ({
  id,
  startMin,
  endMin,
  travelMin: 0,
  offSchedule: false,
});

describe('timeline layout', () => {
  test('axisRange snaps to whole hours around the stops and the day start', () => {
    const items = [stop('a', 635, 700)];
    assert.deepEqual(axisRange(items, 9 * 60), { start: 9 * 60, end: 12 * 60 });
  });
});
