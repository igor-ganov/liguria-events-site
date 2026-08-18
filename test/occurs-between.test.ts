import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { coversDay } from '../src/lib/events/covers-day.ts';
import { isContainer } from '../src/lib/events/is-container.ts';
import { isUpcoming } from '../src/lib/events/is-upcoming.ts';
import { occursBetween } from '../src/lib/events/occurs-between.ts';
import { sessionDates } from '../src/lib/events/session-dates.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';

const ev = (o: Partial<CompactEvent> & Pick<CompactEvent, 'id'>): CompactEvent => ({
  t: 'Event',
  s: '2026-08-05',
  c: ['music'],
  u: 'https://x',
  ...o,
});

// A three-evening festival advertised as running all August.
const festival = ev({
  id: 'f',
  s: '2026-08-01',
  e: '2026-08-31',
  k: true,
  p: [{ date: '2026-08-20' }, { date: '2026-08-05' }, { date: '2026-08-12' }],
});

// An exhibition open every day of the same window.
const exhibition = ev({ id: 'x', s: '2026-08-01', e: '2026-08-31' });

describe('isContainer', () => {
  test('needs both the flag and a programme to stand on', () => {
    assert.equal(isContainer(festival), true);
    assert.equal(isContainer(exhibition), false);
    // Flag without a programme: fall back to the span rather than hide it.
    assert.equal(isContainer(ev({ id: 'b', k: true })), false);
    assert.equal(isContainer(ev({ id: 'c', k: true, p: [] })), false);
  });
});

describe('sessionDates', () => {
  test('ascending, whatever order the programme arrived in', () => {
    assert.deepEqual(sessionDates(festival), ['2026-08-05', '2026-08-12', '2026-08-20']);
  });
  test('empty without a programme', () => {
    assert.deepEqual(sessionDates(exhibition), []);
  });
});

describe('occursBetween', () => {
  test('a container is absent from the empty days between its sessions', () => {
    assert.equal(occursBetween('2026-08-13', '2026-08-13')(festival), false);
    assert.equal(occursBetween('2026-08-06', '2026-08-11')(festival), false);
  });

  test('a container is present on a programmed day and on a window containing one', () => {
    assert.equal(occursBetween('2026-08-12', '2026-08-12')(festival), true);
    assert.equal(occursBetween('2026-08-13', '2026-08-25')(festival), true);
  });

  test('a standalone event covers its whole run, gaps and all', () => {
    assert.equal(occursBetween('2026-08-13', '2026-08-13')(exhibition), true);
    assert.equal(occursBetween('2026-09-01', '2026-09-30')(exhibition), false);
  });

  test('open-ended bounds: an empty side means "no limit" for both kinds', () => {
    assert.equal(occursBetween('2026-08-21', '')(festival), false); // nothing left
    assert.equal(occursBetween('2026-08-20', '')(festival), true);
    assert.equal(occursBetween('', '2026-08-04')(festival), false); // nothing yet
    assert.equal(occursBetween('', '')(festival), true);
    assert.equal(occursBetween('2026-08-21', '')(exhibition), true);
  });

  test('a container with no programme falls back to its span, so it never vanishes', () => {
    const broken = ev({ id: 'b', s: '2026-08-01', e: '2026-08-31', k: true });
    assert.equal(occursBetween('2026-08-13', '2026-08-13')(broken), true);
  });
});

describe('coversDay / isUpcoming follow the same rule', () => {
  test('coversDay skips a container\'s empty day, keeps a standalone run', () => {
    assert.equal(coversDay('2026-08-13')(festival), false);
    assert.equal(coversDay('2026-08-12')(festival), true);
    assert.equal(coversDay('2026-08-13')(exhibition), true);
  });

  test('a container is over once its last session passes, not once its run ends', () => {
    assert.equal(isUpcoming('2026-08-21')(festival), false); // 10 days of run left
    assert.equal(isUpcoming('2026-08-21')(exhibition), true);
    assert.equal(isUpcoming('2026-08-20')(festival), true);
  });
});
