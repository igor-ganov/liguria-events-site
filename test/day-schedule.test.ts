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

describe('buildDaySchedule (a strict sequence: order is the itinerary)', () => {
  test('the first stop opens the day; each next follows the previous', () => {
    const a = ev({ id: 'a', t: 'A', s: '2026-07-10' });
    const b = ev({ id: 'b', t: 'B', s: '2026-07-10' });
    const items = buildDaySchedule([a, b], 'walking', { a: 60, b: 60 }, DAY_START);
    assert.deepEqual(items.map((i) => i.startMin), [DAY_START, DAY_START + 60]);
    assert.deepEqual(items.map((i) => i.offSchedule), [false, false]); // no fixed time → flexible
  });

  test('travel between placed events pushes the next start', () => {
    const a = ev({ id: 'a', t: 'A', s: '2026-07-10', g: [44.3, 8.5] });
    const b = ev({ id: 'b', t: 'B', s: '2026-07-10', g: [44.6, 9.2] }); // far → real travel
    const items = buildDaySchedule([a, b], 'walking', { a: 60, b: 60 }, DAY_START);
    assert.equal(items[1]!.travelMin > 0, true);
    assert.equal(items[1]!.startMin, items[0]!.endMin + items[1]!.travelMin);
  });

  test('a fixed-time stop scheduled before it opens is off-schedule', () => {
    // Day opens 09:00; a 12:00 concert placed first is scheduled at 09:00 —
    // before its window [12:00, 14:00], so it sticks out → red.
    const concert = ev({ id: 'c', t: 'C', s: '2026-07-10', h: '12:00', du: 120 });
    const items = buildDaySchedule([concert], 'walking', {}, DAY_START);
    assert.equal(items[0]!.offSchedule, true);
  });

  test('inside its official window it is on-schedule; overrunning the close is off', () => {
    // Runs 09:00–11:00 (du 120). Day opens 09:00 so the block starts 09:00.
    const concert = ev({ id: 'c', t: 'C', s: '2026-07-10', h: '09:00', du: 120 });
    const ok = buildDaySchedule([concert], 'walking', { c: 90 }, DAY_START); // 09:00–10:30, inside
    assert.equal(ok[0]!.offSchedule, false);
    const over = buildDaySchedule([concert], 'walking', { c: 180 }, DAY_START); // 09:00–12:00, past close
    assert.equal(over[0]!.offSchedule, true);
  });

  test('a stop without a fixed time is never off-schedule', () => {
    const poi = ev({ id: 'p', t: 'P', s: '2026-07-10' }); // no h → flexible
    const items = buildDaySchedule([poi], 'walking', { p: 600 }, DAY_START); // even a 10h visit
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
    const items = [stop('a', 635, 700)]; // 10:35–11:40
    assert.deepEqual(axisRange(items, 9 * 60), { start: 9 * 60, end: 12 * 60 }); // 09:00 → 12:00
  });
});
