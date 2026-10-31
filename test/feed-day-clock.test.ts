// A feed day reads by the clock: what happens AT a time is listed in the order
// of its hours, and what is simply on all day follows as its own part, where an
// hour would mislead.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { byDayOrder } from '../src/lib/events/by-day-order.ts';
import { feedDayGroups } from '../src/lib/events/feed-day-groups.ts';
import { isTimedOn } from '../src/lib/events/is-timed-on.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';

const DAY = '2026-10-31';

const event = (over: Partial<CompactEvent> & Pick<CompactEvent, 'id'>): CompactEvent => ({
  t: 'Evento',
  s: DAY,
  c: ['other'],
  u: 'https://example.test',
  ...over,
});

describe('isTimedOn', () => {
  test('a one-day event with an hour happens at that hour', () => {
    assert.equal(isTimedOn(DAY)(event({ id: 'a', h: '21:00' })), true);
  });

  test('a short run that opens that day still happens at its hour', () => {
    assert.equal(isTimedOn(DAY)(event({ id: 'a', h: '18:00', e: '2026-11-01' })), true);
  });

  test('an event without an hour is on all day', () => {
    assert.equal(isTimedOn(DAY)(event({ id: 'a' })), false);
  });

  test('a long run is on all day, whatever hour it opened at', () => {
    assert.equal(isTimedOn(DAY)(event({ id: 'a', h: '10:00', e: '2026-12-31' })), false);
  });

  test('a run that began before the day is on all day: its hour was another day', () => {
    assert.equal(isTimedOn(DAY)(event({ id: 'a', h: '18:00', s: '2026-10-30', e: '2026-11-01' })), false);
  });
});

describe('byDayOrder', () => {
  const ids = (events: readonly CompactEvent[]): readonly string[] =>
    [...events].sort(byDayOrder(DAY)).map(({ id }) => id);

  test('the timed events come first, in the order of their hours', () => {
    const late = event({ id: 'late', h: '21:00' });
    const early = event({ id: 'early', h: '09:30' });
    const expo = event({ id: 'expo', h: '08:00', e: '2027-01-31' });
    const open = event({ id: 'open' });
    assert.deepEqual(ids([expo, late, open, early]), ['early', 'late', 'open', 'expo']);
  });

  test('an event made here wins a tie at the same hour', () => {
    const crawled = event({ id: 'crawled', h: '21:00' });
    const made = event({ id: 'made', h: '21:00', pl: true });
    assert.deepEqual(ids([crawled, made]), ['made', 'crawled']);
  });

  test('the all-day part keeps the curation: made here, then the shorter run', () => {
    const month = event({ id: 'month', e: '2026-11-30' });
    const week = event({ id: 'week', e: '2026-11-06' });
    const made = event({ id: 'made', e: '2026-12-31', pl: true });
    assert.deepEqual(ids([month, week, made]), ['made', 'week', 'month']);
  });

  test('equal keys keep their incoming order', () => {
    const first = event({ id: 'first', h: '20:00' });
    const second = event({ id: 'second', h: '20:00' });
    assert.deepEqual(ids([first, second]), ['first', 'second']);
  });
});

describe('feedDayGroups', () => {
  test('each day is ordered by the clock', () => {
    const groups = feedDayGroups(DAY)([
      event({ id: 'expo', s: '2026-10-01', e: '2026-12-31', h: '10:00' }),
      event({ id: 'night', h: '21:30' }),
      event({ id: 'noon', h: '12:00' }),
    ]);
    assert.deepEqual(groups[0]?.[1].map(({ id }) => id), ['noon', 'night', 'expo']);
  });
});
