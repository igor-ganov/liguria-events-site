import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { buildRoute, mapsDirUrl } from '../src/lib/favorites/build-route.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';

const ev = (o: Partial<CompactEvent> & Pick<CompactEvent, 'id' | 't' | 's'>): CompactEvent => ({
  c: ['other'],
  u: 'https://x',
  ...o,
});

describe('buildRoute', () => {
  test('groups by day; timed stops go in time order, untimed appended', () => {
    const a = ev({ id: 'a', t: 'A', s: '2026-07-10', h: '21:00', g: [44.4, 8.94] });
    const b = ev({ id: 'b', t: 'B', s: '2026-07-10', h: '18:00', g: [44.41, 8.93] });
    const c = ev({ id: 'c', t: 'C', s: '2026-07-11', g: [44.4, 8.95] });
    const route = buildRoute([a, b, c], 'walking');
    assert.equal(route.length, 2);
    assert.deepEqual(route[0]?.stops.map((s) => s.id), ['b', 'a']); // 18:00 before 21:00
    assert.equal(route[0]?.legs.length, 1);
    assert.ok((route[0]?.legs[0]?.meters ?? 0) > 0);
  });

  test('flags a tight leg when travel overshoots the next start time', () => {
    const a = ev({ id: 'a', t: 'A', s: '2026-07-10', h: '20:00', g: [44.3, 8.5] });
    const b = ev({ id: 'b', t: 'B', s: '2026-07-10', h: '20:05', g: [44.4, 9.0] });
    const route = buildRoute([a, b], 'walking');
    assert.equal(route[0]?.legs[0]?.tight, true);
  });

  test('mapsDirUrl carries origin, destination and mode', () => {
    const url = mapsDirUrl([1, 2], [3, 4], 'transit');
    assert.ok(url.includes('origin=1,2') && url.includes('destination=3,4') && url.includes('travelmode=transit'));
  });
});
