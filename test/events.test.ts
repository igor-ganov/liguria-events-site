// Domain lib (AC-1.2, AC-3.x, AC-5.1 — every pure function tested).
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { Effect } from 'effect';
import { coversDay } from '../src/lib/events/covers-day.ts';
import { decodeEventsPayload } from '../src/lib/events/decode-events.ts';
import { filterByCategories } from '../src/lib/events/filter-by-categories.ts';
import { filterFreeOnly } from '../src/lib/events/filter-free-only.ts';
import { formatWhen } from '../src/lib/events/format-when.ts';
import { groupByDay } from '../src/lib/events/group-by-day.ts';
import { isUpcoming } from '../src/lib/events/is-upcoming.ts';
import { maxIso } from '../src/lib/events/max-iso.ts';
import { sortByStart } from '../src/lib/events/sort-by-start.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';

const make = (overrides: Partial<CompactEvent> & Pick<CompactEvent, 'id' | 's'>): CompactEvent => ({
  t: `Event ${overrides.id}`,
  c: 'other',
  u: 'https://example.org',
  ...overrides,
});

describe('decodeEventsPayload', () => {
  test('accepts the worker shape and rejects junk', () => {
    const ok = Effect.runSync(
      decodeEventsPayload({ generatedAt: 'x', events: [make({ id: 'a', s: '2026-07-04' })] }),
    );
    assert.equal(ok.events.length, 1);
    assert.throws(() => Effect.runSync(decodeEventsPayload({ events: [{ bad: 1 }] })));
  });
});

describe('coversDay / isUpcoming / maxIso', () => {
  const span = make({ id: 'a', s: '2026-07-01', e: '2026-07-10' });
  test('covers inside range, not outside', () => {
    assert.equal(coversDay('2026-07-05')(span), true);
    assert.equal(coversDay('2026-07-11')(span), false);
  });
  test('upcoming while running', () => {
    assert.equal(isUpcoming('2026-07-10')(span), true);
    assert.equal(isUpcoming('2026-07-11')(span), false);
  });
  test('maxIso picks the later date', () => {
    assert.equal(maxIso('2026-07-01', '2026-07-02'), '2026-07-02');
    assert.equal(maxIso('2026-07-02', '2026-07-01'), '2026-07-02');
  });
});

describe('filters', () => {
  const events = [make({ id: 'm', s: '2026-07-04', c: 'music', f: true }), make({ id: 'o', s: '2026-07-05' })];
  test('empty selection keeps all; selection narrows', () => {
    assert.equal(filterByCategories(new Set())(events).length, 2);
    assert.deepEqual(
      filterByCategories(new Set(['music'] as const))(events).map((event) => event.id),
      ['m'],
    );
  });
  test('free-only off keeps all, on narrows', () => {
    assert.equal(filterFreeOnly(false)(events).length, 2);
    assert.deepEqual(filterFreeOnly(true)(events).map((event) => event.id), ['m']);
  });
});

describe('sortByStart / groupByDay', () => {
  test('sorts by date then title', () => {
    const sorted = sortByStart([
      make({ id: 'b', s: '2026-07-05', t: 'B' }),
      make({ id: 'a', s: '2026-07-04', t: 'Z' }),
      make({ id: 'c', s: '2026-07-05', t: 'A' }),
    ]);
    assert.deepEqual(sorted.map((event) => event.id), ['a', 'c', 'b']);
  });
  test('groups ascending; running events land under today; past drop', () => {
    const groups = groupByDay('2026-07-04')([
      make({ id: 'run', s: '2026-07-01', e: '2026-07-10' }),
      make({ id: 'past', s: '2026-06-01' }),
      make({ id: 'later', s: '2026-07-06' }),
    ]);
    assert.deepEqual([...groups.keys()], ['2026-07-04', '2026-07-06']);
    assert.deepEqual(groups.get('2026-07-04')?.map((event) => event.id), ['run']);
  });
});

describe('long-running split (AC-2.3 revised)', () => {
  const short = make({ id: 'short', s: '2026-07-04', e: '2026-07-06' });
  const long = make({ id: 'long', s: '2026-02-01', e: '2026-12-31' });
  const single = make({ id: 'single', s: '2026-07-05' });

  test('spanDays / isLongRunning boundary at 3 days', async () => {
    const { spanDays } = await import('../src/lib/events/span-days.ts');
    const { isLongRunning } = await import('../src/lib/events/is-long-running.ts');
    assert.equal(spanDays(short), 3);
    assert.equal(isLongRunning(short), false);
    assert.equal(isLongRunning(long), true);
    assert.equal(spanDays(single), 1);
  });

  test('dayCellEvents: short on covered days, long only on start day', async () => {
    const { dayCellEvents } = await import('../src/lib/events/day-cell-events.ts');
    const events = [short, long, single];
    assert.deepEqual(dayCellEvents('2026-07-05')(events).map((event) => event.id), ['short', 'single']);
    assert.deepEqual(dayCellEvents('2026-02-01')(events).map((event) => event.id), ['long']);
    assert.deepEqual(dayCellEvents('2026-07-10')(events), []);
  });

  test('ongoingInMonth: long events overlapping the month, sorted', async () => {
    const { ongoingInMonth } = await import('../src/lib/events/ongoing-in-month.ts');
    assert.deepEqual(ongoingInMonth('2026-07')([short, long, single]).map((event) => event.id), ['long']);
    assert.deepEqual(ongoingInMonth('2027-01')([long]), []);
  });
});

describe('formatWhen', () => {
  test('joins known parts only', () => {
    assert.equal(
      formatWhen(make({ id: 'a', s: '2026-07-04', e: '2026-07-05', h: '21:00', v: 'Porto Antico' })),
      '04.07–05.07 · 21:00 · Porto Antico',
    );
    assert.equal(formatWhen(make({ id: 'a', s: '2026-07-04' })), '04.07');
  });
});
