import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { isDefined } from '../src/lib/is-defined.ts';
import { bothCoords } from '../src/lib/favorites/both-coords.ts';
import { dayOfStop } from '../src/lib/favorites/day-of-stop.ts';
import { dayWithLegs } from '../src/lib/favorites/day-with-legs.ts';
import { groupStopsByDay } from '../src/lib/favorites/group-stops-by-day.ts';
import { haversineMeters } from '../src/lib/favorites/haversine-meters.ts';
import { isTight } from '../src/lib/favorites/is-tight.ts';
import { legBetween } from '../src/lib/favorites/leg-between.ts';
import { minutesForMeters } from '../src/lib/favorites/minutes-for-meters.ts';
import { minutesOf } from '../src/lib/favorites/minutes-of.ts';
import { orderDay } from '../src/lib/favorites/order-day.ts';
import { stopsInRange } from '../src/lib/favorites/stops-in-range.ts';
import { travelMinutesBetween } from '../src/lib/favorites/travel-minutes-between.ts';
import type { RouteStop } from '../src/lib/favorites/route-types.ts';

const stop = (o: Partial<RouteStop> & Pick<RouteStop, 'id' | 's'>): RouteStop => ({
  t: o.id,
  c: ['other'],
  u: 'https://x',
  ...o,
});

const GENOA: readonly [number, number] = [44.4, 8.94];
const NERVI: readonly [number, number] = [44.383, 9.036];

describe('isDefined', () => {
  test('narrows undefined out of a list, keeping falsy values', () => {
    assert.deepEqual([0, undefined, '', false, undefined].filter(isDefined), [0, '', false]);
  });
});

describe('haversineMeters', () => {
  test('is zero for a point against itself', () => {
    assert.equal(haversineMeters(GENOA, GENOA), 0);
  });

  test('measures a known short hop and is symmetric', () => {
    const there = haversineMeters(GENOA, NERVI);
    assert.ok(there > 7000 && there < 9000, `unexpected ${there} m`);
    assert.equal(haversineMeters(NERVI, GENOA), there);
  });
});

describe('minutesForMeters', () => {
  test('scales with the mode: walking is slowest, driving fastest', () => {
    assert.ok(minutesForMeters(9000, 'walking') > minutesForMeters(9000, 'transit'));
    assert.ok(minutesForMeters(9000, 'transit') > minutesForMeters(9000, 'driving'));
  });

  test('never reports less than a minute, even for no distance', () => {
    assert.equal(minutesForMeters(0, 'walking'), 1);
    assert.equal(minutesForMeters(1, 'driving'), 1);
  });
});

describe('travelMinutesBetween', () => {
  test('is the mode estimate over the great-circle distance', () => {
    assert.equal(
      travelMinutesBetween(GENOA, NERVI, 'walking'),
      minutesForMeters(haversineMeters(GENOA, NERVI), 'walking'),
    );
  });

  test('a zero-distance hop still costs the one-minute floor', () => {
    assert.equal(travelMinutesBetween(GENOA, GENOA, 'transit'), 1);
  });
});

describe('minutesOf', () => {
  test('reads an HH:MM clock time as minutes since midnight', () => {
    assert.equal(minutesOf('00:00'), 0);
    assert.equal(minutesOf('09:05'), 545);
    assert.equal(minutesOf('23:59'), 1439);
  });

  test('rejects an absent, empty or malformed time', () => {
    assert.equal(minutesOf(undefined), undefined);
    assert.equal(minutesOf(''), undefined);
    assert.equal(minutesOf('24:00'), undefined);
    assert.equal(minutesOf('9:05'), undefined);
    assert.equal(minutesOf('evening'), undefined);
  });
});

describe('isTight', () => {
  const from = stop({ id: 'a', s: '2026-07-10', h: '10:00' });
  const to = stop({ id: 'b', s: '2026-07-10', h: '10:20' });

  test('true only when departure plus travel overshoots the next start', () => {
    assert.equal(isTight(from, to, 30), true);
    assert.equal(isTight(from, to, 20), false); // arrives exactly on time
    assert.equal(isTight(from, to, 5), false);
  });

  test('an untimed stop on either end is never tight', () => {
    assert.equal(isTight(stop({ id: 'a', s: '2026-07-10' }), to, 600), false);
    assert.equal(isTight(from, stop({ id: 'b', s: '2026-07-10' }), 600), false);
  });
});

describe('bothCoords', () => {
  const placed = stop({ id: 'a', s: '2026-07-10', g: GENOA });
  const nowhere = stop({ id: 'b', s: '2026-07-10' });

  test('yields the pair when both stops are placed', () => {
    assert.deepEqual(bothCoords(placed, stop({ id: 'c', s: '2026-07-10', g: NERVI })), [
      { a: GENOA, b: NERVI },
    ]);
  });

  test('yields nothing when either end lacks coordinates', () => {
    assert.deepEqual(bothCoords(placed, nowhere), []);
    assert.deepEqual(bothCoords(nowhere, placed), []);
    assert.deepEqual(bothCoords(nowhere, nowhere), []);
  });
});

describe('legBetween', () => {
  test('measures the hop, links directions and flags a tight connection', () => {
    const leg = legBetween(
      stop({ id: 'a', s: '2026-07-10', g: GENOA, h: '10:00' }),
      stop({ id: 'b', s: '2026-07-10', g: NERVI, h: '10:05' }),
      'walking',
    );
    assert.ok(leg.meters > 7000);
    assert.equal(leg.minutes, minutesForMeters(leg.meters, 'walking'));
    assert.ok(leg.mapsUrl.includes('travelmode=walking'));
    assert.equal(leg.tight, true);
  });

  test('a stop without coordinates gives a 0 m leg with no directions link', () => {
    const leg = legBetween(
      stop({ id: 'a', s: '2026-07-10', g: GENOA }),
      stop({ id: 'b', s: '2026-07-10' }),
      'driving',
    );
    assert.deepEqual({ ...leg }, { meters: 0, minutes: 1, mapsUrl: '', tight: false });
  });
});

describe('dayWithLegs', () => {
  test('keeps the stop order and puts one leg between each pair', () => {
    const day = dayWithLegs(
      '2026-07-10',
      [
        stop({ id: 'a', s: '2026-07-10', g: GENOA }),
        stop({ id: 'b', s: '2026-07-10', g: NERVI }),
        stop({ id: 'c', s: '2026-07-10', g: GENOA }),
      ],
      'walking',
    );
    assert.deepEqual(day.stops.map((s) => s.id), ['a', 'b', 'c']);
    assert.equal(day.legs.length, 2);
    assert.equal(day.day, '2026-07-10');
  });

  test('a single stop has no legs', () => {
    assert.deepEqual(dayWithLegs('2026-07-10', [stop({ id: 'a', s: '2026-07-10' })], 'walking').legs, []);
  });
});

describe('orderDay', () => {
  test('timed stops lead in clock order, untimed follow', () => {
    const ordered = orderDay([
      stop({ id: 'late', s: '2026-07-10', h: '21:00', g: GENOA }),
      stop({ id: 'free', s: '2026-07-10', g: NERVI }),
      stop({ id: 'early', s: '2026-07-10', h: '18:00', g: NERVI }),
    ]);
    assert.deepEqual(ordered.map((s) => s.id), ['early', 'late', 'free']);
  });

  test('untimed stops chain to the nearest next point, not input order', () => {
    const far = stop({ id: 'far', s: '2026-07-10', g: [45.07, 7.69] }); // Turin
    const near = stop({ id: 'near', s: '2026-07-10', g: NERVI });
    const anchor = stop({ id: 'anchor', s: '2026-07-10', h: '09:00', g: GENOA });
    assert.deepEqual(orderDay([anchor, far, near]).map((s) => s.id), ['anchor', 'near', 'far']);
  });

  test('with no placed anchor the untimed pool keeps its given order', () => {
    const ordered = orderDay([
      stop({ id: 'x', s: '2026-07-10' }),
      stop({ id: 'y', s: '2026-07-10', g: NERVI }),
    ]);
    assert.deepEqual(ordered.map((s) => s.id), ['x', 'y']);
  });

  test('an empty day stays empty', () => {
    assert.deepEqual(orderDay([]), []);
  });
});

describe('dayOfStop', () => {
  const ongoing = stop({ id: 'o', s: '2026-07-08', e: '2026-07-12' });

  test('without a trip window a stop sits on its own start day', () => {
    assert.equal(dayOfStop(ongoing, undefined), '2026-07-08');
  });

  test('an already-running stop is clamped to the trip start', () => {
    assert.equal(dayOfStop(ongoing, { from: '2026-07-10' }), '2026-07-10');
  });

  test('a stop starting after the trip start keeps its own day', () => {
    assert.equal(dayOfStop(stop({ id: 'l', s: '2026-07-14' }), { from: '2026-07-10' }), '2026-07-14');
  });
});

describe('stopsInRange', () => {
  const before = stop({ id: 'before', s: '2026-07-05' });
  const inside = stop({ id: 'inside', s: '2026-07-11' });
  const after = stop({ id: 'after', s: '2026-07-20' });
  const ongoing = stop({ id: 'ongoing', s: '2026-07-01', e: '2026-07-12' });

  test('without a window every stop is kept', () => {
    assert.equal(stopsInRange([before, inside, after], undefined).length, 3);
  });

  test('keeps only the stops whose span overlaps the window', () => {
    const ids = stopsInRange([before, inside, after, ongoing], {
      from: '2026-07-10',
      to: '2026-07-15',
    }).map((s) => s.id);
    assert.deepEqual(ids, ['inside', 'ongoing']);
  });

  test('an open-ended window keeps everything from `from` onward', () => {
    const ids = stopsInRange([before, inside, after], { from: '2026-07-10' }).map((s) => s.id);
    assert.deepEqual(ids, ['inside', 'after']);
  });

  test('boundary days are inside the window', () => {
    const ids = stopsInRange([stop({ id: 'edge', s: '2026-07-10' })], {
      from: '2026-07-10',
      to: '2026-07-10',
    }).map((s) => s.id);
    assert.deepEqual(ids, ['edge']);
  });
});

describe('groupStopsByDay', () => {
  test('buckets stops per day, preserving input order inside a day', () => {
    const grouped = groupStopsByDay(
      [
        stop({ id: 'a', s: '2026-07-11' }),
        stop({ id: 'b', s: '2026-07-10' }),
        stop({ id: 'c', s: '2026-07-11' }),
      ],
      undefined,
    );
    assert.deepEqual([...grouped.keys()], ['2026-07-11', '2026-07-10']);
    assert.deepEqual(grouped.get('2026-07-11')?.map((s) => s.id), ['a', 'c']);
  });

  test('a trip window pulls ongoing stops onto the trip start day', () => {
    const grouped = groupStopsByDay(
      [stop({ id: 'o', s: '2026-07-01', e: '2026-07-12' }), stop({ id: 'n', s: '2026-07-11' })],
      { from: '2026-07-10' },
    );
    assert.deepEqual(grouped.get('2026-07-10')?.map((s) => s.id), ['o']);
    assert.deepEqual(grouped.get('2026-07-11')?.map((s) => s.id), ['n']);
  });

  test('no stops, no days', () => {
    assert.equal(groupStopsByDay([], undefined).size, 0);
  });
});
