import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { googleMapsUrl } from '../src/lib/favorites/google-maps.ts';
import type { RouteDay, RouteStop } from '../src/lib/favorites/build-route.ts';

const stop = (id: string, g?: readonly [number, number]): RouteStop => ({
  id,
  t: id,
  s: '2026-07-10',
  c: ['other'],
  u: 'https://x',
  ...(g === undefined ? {} : { g }),
});
const day = (stops: readonly RouteStop[]): RouteDay => ({ day: '2026-07-10', stops, legs: [] });

describe('googleMapsUrl', () => {
  test('two located stops → a directions URL in the travel mode, no waypoints', () => {
    const url = googleMapsUrl(day([stop('a', [44.4, 8.93]), stop('b', [44.41, 8.94])]), 'walking');
    assert.ok(url !== undefined);
    const params = new URL(url).searchParams;
    assert.equal(params.get('travelmode'), 'walking');
    assert.equal(params.get('origin'), '44.4,8.93');
    assert.equal(params.get('destination'), '44.41,8.94');
    assert.equal(params.has('waypoints'), false);
  });

  test('middle stops become waypoints', () => {
    const url = googleMapsUrl(day([stop('a', [1, 1]), stop('b', [2, 2]), stop('c', [3, 3])]), 'driving');
    const params = new URL(url ?? '').searchParams;
    assert.equal(params.get('origin'), '1,1');
    assert.equal(params.get('destination'), '3,3');
    assert.equal(params.get('waypoints'), '2,2');
  });

  test('the base and final point bracket the stops', () => {
    const url = googleMapsUrl(day([stop('a', [2, 2])]), 'transit', { base: { lat: 1, lng: 1 }, final: { lat: 3, lng: 3 } });
    const params = new URL(url ?? '').searchParams;
    assert.equal(params.get('origin'), '1,1');
    assert.equal(params.get('destination'), '3,3');
    assert.equal(params.get('waypoints'), '2,2');
  });

  test('coordless stops are skipped; fewer than two points → undefined', () => {
    assert.equal(googleMapsUrl(day([stop('a'), stop('b', [2, 2])]), 'walking'), undefined);
  });
});
