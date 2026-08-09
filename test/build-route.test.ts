import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { buildRoute, eventAvailableOn, mapsDirUrl, poiToStop, routeFromGroups } from '../src/lib/favorites/build-route.ts';
import { eventDuration } from '../src/lib/favorites/event-duration.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';
import type { FavPoi } from '../src/lib/favorites/fav-pois.ts';

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

  test('range: from drops earlier events, to drops later ones', () => {
    const before = ev({ id: 'b', t: 'Before', s: '2026-07-05', g: [44.4, 8.9] });
    const inside = ev({ id: 'i', t: 'In', s: '2026-07-11', g: [44.4, 8.9] });
    const after = ev({ id: 'a', t: 'After', s: '2026-07-20', g: [44.4, 8.9] });
    const ids = buildRoute([before, inside, after], 'walking', { from: '2026-07-10', to: '2026-07-15' })
      .flatMap((d) => d.stops.map((s) => s.id));
    assert.deepEqual(ids, ['i']);
  });

  test('range: an ongoing multi-day event is placed on the trip start, not its own start', () => {
    const ongoing = ev({ id: 'o', t: 'Run', s: '2026-07-08', e: '2026-07-12', g: [44.4, 8.9] });
    const route = buildRoute([ongoing], 'walking', { from: '2026-07-10', to: '2026-07-15' });
    assert.equal(route[0]?.day, '2026-07-10'); // clamped to `from`
    assert.equal(route[0]?.stops[0]?.id, 'o');
  });

  test('range without `to` keeps everything from `from` onward', () => {
    const a = ev({ id: 'a', t: 'A', s: '2026-07-10' });
    const b = ev({ id: 'b', t: 'B', s: '2026-07-25' });
    assert.equal(buildRoute([a, b], 'walking', { from: '2026-07-01' }).length, 2);
  });
});

describe('routeFromGroups', () => {
  const a = ev({ id: 'a', t: 'A', s: '2026-07-10', h: '21:00', g: [44.4, 8.94] });
  const b = ev({ id: 'b', t: 'B', s: '2026-07-10', h: '18:00', g: [44.41, 8.93] });
  const c = ev({ id: 'c', t: 'C', s: '2026-07-11', g: [44.4, 8.95] });
  const byId = new Map<string, CompactEvent>([a, b, c].map((e) => [e.id, e]));

  test('honours the saved order verbatim — no automatic re-ordering', () => {
    // buildRoute would sort b(18:00) before a(21:00); the editor may have put a
    // first, and that manual order must survive.
    const route = routeFromGroups([{ day: '2026-07-10', ids: ['a', 'b'] }], 'walking', byId);
    assert.deepEqual(route[0]?.stops.map((s) => s.id), ['a', 'b']);
    assert.equal(route[0]?.legs.length, 1);
    assert.ok((route[0]?.legs[0]?.meters ?? 0) > 0);
  });

  test('keeps the saved day grouping and drops ids no longer in the corpus', () => {
    const route = routeFromGroups(
      [
        { day: '2026-07-10', ids: ['b'] },
        { day: '2026-07-11', ids: ['gone', 'c'] },
      ],
      'walking',
      byId,
    );
    assert.deepEqual(route.map((d) => d.day), ['2026-07-10', '2026-07-11']);
    assert.deepEqual(route[1]?.stops.map((s) => s.id), ['c']); // 'gone' filtered out
  });

  test('a day left empty after filtering is dropped', () => {
    const route = routeFromGroups([{ day: '2026-07-10', ids: ['gone'] }], 'walking', byId);
    assert.equal(route.length, 0);
  });
});

describe('poiToStop', () => {
  const poi: FavPoi = {
    id: 'wd:Q1048820', kind: 'landmark', region: 'liguria', name: 'Castello di Campo Ligure',
    lat: 44.5369, lng: 8.7, cat: 'castle', url: '/it/landmark/liguria/castello--x/',
  };

  test('resolves a POI to a stop: coords, own link, 60-min default, available any day', () => {
    const stop = poiToStop(poi);
    assert.deepEqual(stop.g, [44.5369, 8.7]);
    assert.equal(stop.t, 'Castello di Campo Ligure');
    assert.equal(stop.href, '/it/landmark/liguria/castello--x/');
    assert.equal(eventDuration(stop, undefined), 60); // default attendance for a POI
    assert.equal(eventAvailableOn(stop, '2026-07-10'), true);
    assert.equal(eventAvailableOn(stop, '2030-01-01'), true); // no date → any day
  });

  test('a POI routes with events, its legs computed from coordinates', () => {
    const event = ev({ id: 'e', t: 'E', s: '2026-07-10', g: [44.41, 8.93], h: '10:00' });
    const route = routeFromGroups(
      [{ day: '2026-07-10', ids: ['e', 'wd:Q1048820'] }],
      'walking',
      new Map([['e', event], ['wd:Q1048820', poiToStop(poi)]]),
    );
    assert.deepEqual(route[0]?.stops.map((s) => s.id), ['e', 'wd:Q1048820']);
    assert.ok((route[0]?.legs[0]?.meters ?? 0) > 0); // real distance between the two coords
  });
});
