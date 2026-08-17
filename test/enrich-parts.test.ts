import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { isDefined } from '../src/lib/is-defined.ts';
import { applyRoutedLeg } from '../src/lib/favorites/apply-routed-leg.ts';
import { enrichLeg } from '../src/lib/favorites/enrich-leg.ts';
import { legKey } from '../src/lib/favorites/leg-key.ts';
import { legSegments } from '../src/lib/favorites/leg-segments.ts';
import { minutesFromSec } from '../src/lib/favorites/minutes-from-sec.ts';
import { pendingLegPairs } from '../src/lib/favorites/pending-leg-pairs.ts';
import { planLeg } from '../src/lib/favorites/plan-leg.ts';
import { routedFromBest } from '../src/lib/favorites/routed-from-best.ts';
import type { Planner, RoutedLeg } from '../src/lib/favorites/planner-types.ts';
import type { Leg, RouteDay, RouteStop } from '../src/lib/favorites/route-types.ts';
import type { BestLeg, Place } from 'italian-transport-core';

const stop = (id: string, g?: readonly [number, number], h?: string): RouteStop => ({
  id,
  t: id,
  s: '2026-01-01',
  u: '',
  c: ['other'],
  ...([g].filter(isDefined).map((coords) => ({ g: coords })).at(0) ?? {}),
  ...([h].filter(isDefined).map((time) => ({ h: time })).at(0) ?? {}),
});

const estimate: Leg = { meters: 100, minutes: 2, mapsUrl: 'https://maps', tight: false };

const hop = (mode: string, durationSec: number, line?: string, to = ''): BestLeg['legs'][number] => ({
  mode,
  ...([line].filter(isDefined).map((name) => ({ line: name })).at(0) ?? {}),
  from: { name: 'A', lat: 44.4, lon: 8.9 },
  to: { name: to, lat: 44.41, lon: 8.94 },
  startTime: '',
  endTime: '',
  durationSec,
  geometry: [],
  approximated: false,
  intermediateStops: [],
});

const best: BestLeg = {
  mode: 'transit',
  durationSec: 1800,
  meters: 2500,
  transfers: 1,
  geometry: [[8.9, 44.4], [8.94, 44.41]],
  legs: [hop('walk', 240), hop('bus', 1200, '20', 'De Ferrari'), hop('walk', 180)],
};

const day = (stops: readonly RouteStop[]): RouteDay => ({
  day: '2026-01-01',
  stops,
  legs: stops.slice(1).map(() => estimate),
});

describe('minutesFromSec', () => {
  test('rounds seconds to whole minutes', () => {
    assert.equal(minutesFromSec(1800), 30);
    assert.equal(minutesFromSec(150), 3); // 2.5 → 3
  });

  test('never reports less than a minute', () => {
    assert.equal(minutesFromSec(0), 1);
    assert.equal(minutesFromSec(10), 1);
  });
});

describe('legSegments', () => {
  test('keeps mode, line, destination and minutes for every part', () => {
    assert.deepEqual(legSegments(best), [
      { mode: 'walk', minutes: 4 },
      { mode: 'bus', line: '20', to: 'De Ferrari', minutes: 20 },
      { mode: 'walk', minutes: 3 },
    ]);
  });

  test('omits an absent line/destination rather than carrying undefined', () => {
    const [segment] = legSegments({ ...best, legs: [hop('walk', 60)] });
    assert.deepEqual(Object.keys(segment ?? {}), ['mode', 'minutes']);
  });

  test('a planner answer with no parts has no segments', () => {
    assert.deepEqual(legSegments({ ...best, legs: [] }), []);
  });
});

describe('routedFromBest', () => {
  test('reduces the planner answer to the cacheable fields', () => {
    assert.deepEqual(routedFromBest(best), {
      meters: 2500,
      minutes: 30,
      geometry: best.geometry,
      transfers: 1,
      segments: legSegments(best),
    });
  });
});

describe('applyRoutedLeg', () => {
  const routed: RoutedLeg = {
    meters: 2500,
    minutes: 30,
    geometry: [[8.9, 44.4]],
    transfers: 1,
    segments: [{ mode: 'bus', minutes: 20 }],
  };

  test('replaces the estimate and marks the leg as real', () => {
    const leg = applyRoutedLeg(estimate, stop('a'), stop('b'), routed);
    assert.equal(leg.real, true);
    assert.equal(leg.meters, 2500);
    assert.equal(leg.minutes, 30);
    assert.equal(leg.transfers, 1);
    assert.deepEqual(leg.segments, routed.segments);
  });

  test('keeps the fields routing does not own, such as the maps link', () => {
    assert.equal(applyRoutedLeg(estimate, stop('a'), stop('b'), routed).mapsUrl, 'https://maps');
  });

  test('recomputes tight from the real travel time', () => {
    const tightened = applyRoutedLeg(estimate, stop('a', undefined, '10:00'), stop('b', undefined, '10:20'), routed);
    assert.equal(tightened.tight, true);
    const roomy = applyRoutedLeg(estimate, stop('a', undefined, '10:00'), stop('b', undefined, '11:00'), routed);
    assert.equal(roomy.tight, false);
  });
});

describe('planLeg', () => {
  test('asks the planner with both endpoints and reduces the answer', async () => {
    const seen: Place[] = [];
    const plan: Planner = async (from, to) => {
      seen.push(from, to);
      return best;
    };
    const routed = await planLeg(plan, stop('a', [44.4, 8.9]), stop('b', [44.41, 8.94]), 'transit');
    assert.deepEqual(routed, routedFromBest(best));
    assert.deepEqual(seen, [
      { name: 'a', lat: 44.4, lon: 8.9 },
      { name: 'b', lat: 44.41, lon: 8.94 },
    ]);
  });

  test('never calls the planner when a stop has no coordinates', async () => {
    let calls = 0;
    const plan: Planner = async () => {
      calls += 1;
      return best;
    };
    assert.equal(await planLeg(plan, stop('a'), stop('b', [44.41, 8.94]), 'transit'), undefined);
    assert.equal(calls, 0);
  });

  test('a pair the planner cannot serve resolves to undefined', async () => {
    const plan: Planner = async () => undefined;
    assert.equal(await planLeg(plan, stop('a', [44.4, 8.9]), stop('b', [44.41, 8.94]), 'driving'), undefined);
  });
});

describe('enrichLeg', () => {
  const plan: Planner = async () => best;

  test('upgrades the leg when routing is available', async () => {
    const leg = await enrichLeg(estimate, stop('a', [44.4, 8.9]), stop('b', [44.41, 8.94]), 'transit', plan);
    assert.equal(leg.real, true);
    assert.equal(leg.minutes, 30);
  });

  test('returns the estimate untouched when routing is not available', async () => {
    const leg = await enrichLeg(estimate, stop('a', [44.4, 8.9]), stop('b', [44.41, 8.94]), 'driving', async () => undefined);
    assert.equal(leg, estimate);
  });
});

describe('pendingLegPairs', () => {
  const a = stop('a', [44.4, 8.9]);
  const b = stop('b', [44.41, 8.94]);
  const c = stop('c', [44.42, 8.95]);

  test('keys every uncached pair of the route', () => {
    const pending = pendingLegPairs([day([a, b, c])], 'transit', new Map());
    assert.deepEqual([...pending.keys()].toSorted(), [
      legKey('a', 'b', 'transit'),
      legKey('b', 'c', 'transit'),
    ]);
    assert.equal(pending.get(legKey('a', 'b', 'transit'))?.to.id, 'b');
  });

  test('skips pairs already in the cache, including known-unavailable ones', () => {
    const cache = new Map<string, RoutedLeg | undefined>([[legKey('a', 'b', 'transit'), undefined]]);
    const pending = pendingLegPairs([day([a, b, c])], 'transit', cache);
    assert.deepEqual([...pending.keys()], [legKey('b', 'c', 'transit')]);
  });

  test('a repeated pair is looked up once', () => {
    const pending = pendingLegPairs([day([a, b]), day([a, b])], 'walking', new Map());
    assert.equal(pending.size, 1);
    assert.equal(pending.get(legKey('a', 'b', 'walking'))?.from, a);
  });

  test('the mode is part of the key, so switching mode re-plans', () => {
    const cache = new Map<string, RoutedLeg | undefined>([[legKey('a', 'b', 'walking'), undefined]]);
    assert.deepEqual([...pendingLegPairs([day([a, b])], 'transit', cache).keys()], [
      legKey('a', 'b', 'transit'),
    ]);
  });

  test('a route with no legs has nothing pending', () => {
    assert.equal(pendingLegPairs([day([a])], 'transit', new Map()).size, 0);
  });
});
