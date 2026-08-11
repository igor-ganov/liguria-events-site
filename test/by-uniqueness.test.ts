import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { byUniqueness } from '../src/lib/events/by-uniqueness.ts';
import { spanMs } from '../src/lib/events/event-span.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';

const ev = (o: Partial<CompactEvent> & Pick<CompactEvent, 'id' | 's'>): CompactEvent => ({
  t: 'T',
  c: ['other'],
  u: 'https://x',
  ...o,
});

describe('by-uniqueness (the feed curation)', () => {
  test('span is 0 for a one-day event, positive for a run', () => {
    assert.equal(spanMs(ev({ id: 'a', s: '2026-07-10' })), 0);
    assert.equal(spanMs(ev({ id: 'a', s: '2026-07-10', e: '2026-07-10' })), 0);
    assert.ok(spanMs(ev({ id: 'a', s: '2026-07-10', e: '2026-07-20' })) > 0);
  });

  test('short, time-pinned events sort above long runs', () => {
    const concert = ev({ id: 'c', s: '2026-07-10' }); // one night
    const expo = ev({ id: 'x', s: '2026-07-01', e: '2026-07-31' }); // month-long
    const market = ev({ id: 'm', s: '2026-07-10', e: '2026-07-11' }); // a weekend
    assert.deepEqual([expo, concert, market].toSorted(byUniqueness).map((e) => e.id), ['c', 'm', 'x']);
  });

  test('equal spans keep their incoming order — a stable tie-break', () => {
    const a = ev({ id: 'a', s: '2026-07-10' });
    const b = ev({ id: 'b', s: '2026-07-11' });
    assert.deepEqual([a, b].toSorted(byUniqueness).map((e) => e.id), ['a', 'b']);
    assert.deepEqual([b, a].toSorted(byUniqueness).map((e) => e.id), ['b', 'a']);
  });
});
