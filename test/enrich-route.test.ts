import { test } from 'bun:test';
import assert from 'node:assert/strict';
import { isDefined } from '../src/lib/is-defined.ts';
import { applyLegCache, enrichDays, fillLegCache, legKey, type Planner, type RoutedLeg } from '../src/lib/favorites/enrich-route.ts';
import type { Leg, RouteDay, RouteStop } from '../src/lib/favorites/build-route.ts';
import type { BestLeg } from 'italian-transport-core';

const stop = (id: string, g?: readonly [number, number], h?: string): RouteStop => ({
  id,
  t: id,
  s: '2026-01-01',
  u: '',
  c: ['other'],
  du: 60,
  ...([g].filter(isDefined).map((coords) => ({ g: coords })).at(0) ?? {}),
  ...([h].filter(isDefined).map((time) => ({ h: time })).at(0) ?? {}),
});

const estimate: Leg = { meters: 100, minutes: 2, mapsUrl: 'https://maps', tight: false };

const day = (stops: readonly RouteStop[]): RouteDay => ({
  day: '2026-01-01',
  stops,
  legs: stops.slice(1).map(() => estimate),
});

const best: BestLeg = {
  mode: 'transit',
  durationSec: 1800,
  meters: 2500,
  transfers: 1,
  geometry: [
    [8.9, 44.4],
    [8.94, 44.41],
  ],
  legs: [
    { mode: 'walk', from: { name: 'A', lat: 44.4, lon: 8.9 }, to: { name: 'Stop', lat: 44.4, lon: 8.91 }, startTime: '', endTime: '', durationSec: 240, geometry: [], approximated: false, intermediateStops: [] },
    { mode: 'bus', line: '20', from: { name: 'Stop', lat: 44.4, lon: 8.91 }, to: { name: 'De Ferrari', lat: 44.41, lon: 8.93 }, startTime: '', endTime: '', durationSec: 1200, geometry: [], approximated: false, intermediateStops: [] },
    { mode: 'walk', from: { name: 'De Ferrari', lat: 44.41, lon: 8.93 }, to: { name: 'B', lat: 44.41, lon: 8.94 }, startTime: '', endTime: '', durationSec: 180, geometry: [], approximated: false, intermediateStops: [] },
  ],
};

const planner: Planner = async () => best;
const noService: Planner = async () => undefined;

test('enrichDays upgrades a leg to real routing (time, distance, geometry)', async () => {
  const [d] = await enrichDays([day([stop('a', [44.4, 8.9]), stop('b', [44.41, 8.94])])], 'transit', planner);
  const leg = d!.legs[0]!;
  assert.equal(leg.real, true);
  assert.equal(leg.minutes, 30); // 1800s → 30 min
  assert.equal(leg.meters, 2500);
  assert.equal(leg.transfers, 1);
  assert.equal(leg.geometry?.length, 2);
  // Compact multimodal breakdown: walk → bus 20 (De Ferrari) → walk.
  assert.equal(leg.segments?.length, 3);
  assert.equal(leg.segments?.[1]?.mode, 'bus');
  assert.equal(leg.segments?.[1]?.line, '20');
  assert.equal(leg.segments?.[1]?.to, 'De Ferrari');
  assert.equal(leg.segments?.[1]?.minutes, 20); // 1200s → 20 min
});

test('legs the planner cannot serve keep their straight-line estimate', async () => {
  const [d] = await enrichDays([day([stop('a', [44.4, 8.9]), stop('b', [44.41, 8.94])])], 'driving', noService);
  assert.equal(d!.legs[0]!.real, undefined);
  assert.equal(d!.legs[0]!.minutes, 2);
});

test('a stop without coordinates keeps the estimate (no lookup)', async () => {
  const [d] = await enrichDays([day([stop('a'), stop('b', [44.41, 8.94])])], 'transit', planner);
  assert.equal(d!.legs[0]!.real, undefined);
});

test('tight is recomputed from the real travel time vs the next fixed start', async () => {
  // Depart 10:00, next stop fixed at 10:20, real leg is 30 min → overshoots.
  const d = day([stop('a', [44.4, 8.9], '10:00'), stop('b', [44.41, 8.94], '10:20')]);
  const [e] = await enrichDays([d], 'transit', planner);
  assert.equal(e!.legs[0]!.tight, true);
});

test('applyLegCache applies cached real routing and recomputes tight', () => {
  const cache = new Map<string, RoutedLeg | undefined>();
  cache.set(legKey('a', 'b', 'transit'), { meters: 2500, minutes: 30, geometry: [[8.9, 44.4]], transfers: 1, segments: [{ mode: 'bus', line: '20', to: 'De Ferrari', minutes: 20 }] });
  const d = day([stop('a', [44.4, 8.9], '10:00'), stop('b', [44.41, 8.94], '10:20')]);
  const [out] = applyLegCache([d], 'transit', cache);
  const leg = out!.legs[0]!;
  assert.equal(leg.real, true);
  assert.equal(leg.minutes, 30);
  assert.equal(leg.meters, 2500);
  assert.equal(leg.tight, true); // 10:00 + 30 min > 10:20
});

test('fillLegCache fetches each missing pair once, then reuses the cache', async () => {
  let calls = 0;
  const plan: Planner = async () => {
    calls += 1;
    return best;
  };
  const cache = new Map<string, RoutedLeg | undefined>();
  const d = day([stop('a', [44.4, 8.9]), stop('b', [44.41, 8.94])]);
  const added1 = await fillLegCache([d], 'transit', cache, plan);
  const added2 = await fillLegCache([d], 'transit', cache, plan);
  assert.equal(added1, true);
  assert.equal(added2, false); // cached — no refetch
  assert.equal(calls, 1);
});

test('fillLegCache records an unavailable pair so it is not refetched', async () => {
  let calls = 0;
  const plan: Planner = async () => {
    calls += 1;
    return undefined;
  };
  const cache = new Map<string, RoutedLeg | undefined>();
  const d = day([stop('a', [44.4, 8.9]), stop('b', [44.41, 8.94])]);
  await fillLegCache([d], 'driving', cache, plan);
  await fillLegCache([d], 'driving', cache, plan);
  assert.equal(calls, 1); // undefined result cached, not retried
  const [out] = applyLegCache([d], 'driving', cache);
  assert.equal(out!.legs[0]!.real, undefined); // still the estimate
});
