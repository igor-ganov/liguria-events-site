import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { cityCentroids } from '../src/lib/region/city-centroids.ts';
import { hereTarget } from '../src/lib/region/here-target.ts';
import { keyboardInset } from '../src/lib/dom/keyboard-inset.ts';
import { nearestOf } from '../src/lib/geo/nearest-of.ts';
import { placeKey } from '../src/lib/region/place-key.ts';
import { regionAt } from '../src/lib/region/region-at.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';
import type { LocatedCity } from '../src/lib/region/here-target.ts';

const GENOA: readonly [number, number] = [44.4074, 8.934];
const TURIN: readonly [number, number] = [45.0703, 7.6869];
const PALERMO: readonly [number, number] = [38.1157, 13.3615];

const ev = (over: Partial<CompactEvent> & Pick<CompactEvent, 'id'>): CompactEvent => ({
  t: 'Event',
  s: '2026-08-05',
  c: ['music'],
  u: 'https://x',
  ...over,
});

describe('keyboardInset', () => {
  test('the keyboard height is what the layout viewport hides', () => {
    // Android Chrome: the layout viewport keeps its full height, the visual one
    // shrinks to what is left above the keyboard.
    assert.equal(keyboardInset({ layoutHeight: 900, visualHeight: 520, offsetTop: 0 }), 380);
  });

  test('a viewport scrolled up by the browser counts against the inset', () => {
    assert.equal(keyboardInset({ layoutHeight: 900, visualHeight: 520, offsetTop: 100 }), 280);
  });

  test('no keyboard, no inset — and never a negative one', () => {
    assert.equal(keyboardInset({ layoutHeight: 900, visualHeight: 900, offsetTop: 0 }), 0);
    assert.equal(keyboardInset({ layoutHeight: 900, visualHeight: 940, offsetTop: 0 }), 0);
  });

  test('sub-pixel jitter is rounded away, or every scroll frame relayouts', () => {
    assert.equal(keyboardInset({ layoutHeight: 900.4, visualHeight: 520.2, offsetTop: 0 }), 380);
  });
});

describe('nearestOf', () => {
  const cities = [
    { name: 'genova', lat: 44.4074, lng: 8.934 },
    { name: 'torino', lat: 45.0703, lng: 7.6869 },
  ];

  test('the closest item, with the distance it sits at', () => {
    const hit = nearestOf(cities, [44.41, 8.93]).at(0);
    assert.equal(hit?.item.name, 'genova');
    assert.ok((hit?.meters ?? Infinity) < 1000);
  });

  test('an empty list yields nothing rather than a guard at the call site', () => {
    assert.deepEqual(nearestOf([], GENOA), []);
  });
});

describe('regionAt', () => {
  test('a point inside a region box is that region', () => {
    assert.equal(regionAt(GENOA), 'liguria');
    assert.equal(regionAt(TURIN), 'piemonte');
    assert.equal(regionAt(PALERMO), 'sicilia');
  });

  test('the boxes overlap on the borders — the closer centre settles it', () => {
    // Genoa sits inside both the Liguria and the Piemonte box (they are drawn
    // generously so a border venue is never dropped).
    assert.equal(regionAt(GENOA), 'liguria');
  });

  test('a point outside every box still resolves, to the nearest region', () => {
    // Zurich, north of the Alps: no box contains it, and the nearest region
    // CENTRE is Valle d'Aosta's — not Lombardia's, which is wider and so sits
    // further east than its western edge suggests.
    assert.equal(regionAt([47.5, 8.5]), 'valle-d-aosta');
    assert.equal(regionAt([36.0, 12.0]), 'sicilia'); // open sea south of Sicily
  });
});

describe('cityCentroids', () => {
  test('a city is the mean of the events held in it', () => {
    const points = cityCentroids([
      ev({ id: 'a', ct: 'genova', rg: 'liguria', g: [44.40, 8.93] }),
      ev({ id: 'b', ct: 'genova', rg: 'liguria', g: [44.42, 8.95] }),
    ]);
    assert.deepEqual(points.get(placeKey('liguria', 'genova')), { lat: 44.41, lng: 8.94 });
  });

  test('events without coordinates or without a city are not points', () => {
    const points = cityCentroids([
      ev({ id: 'a', ct: 'genova', rg: 'liguria' }),
      ev({ id: 'b', rg: 'liguria', g: [44.4, 8.9] }),
    ]);
    assert.equal(points.size, 0);
  });
});

describe('hereTarget', () => {
  const cities: readonly LocatedCity[] = [
    { region: 'liguria', city: 'genova', lat: 44.4074, lng: 8.934 },
    { region: 'piemonte', city: 'torino', lat: 45.0703, lng: 7.6869 },
  ];

  test('"my region" answers from the region boxes, so it works anywhere', () => {
    assert.deepEqual(hereTarget('region', cities, PALERMO), { region: 'sicilia' });
    assert.deepEqual(hereTarget('region', [], TURIN), { region: 'piemonte' });
  });

  test('"my city" picks the nearest city that actually has events', () => {
    assert.deepEqual(hereTarget('city', cities, [44.42, 8.9]), {
      region: 'liguria',
      city: 'genova',
    });
  });

  test('a city 800 km away is not the visitor\'s city — fall back to the region', () => {
    // Palermo: nothing we cover is nearby, so "my city" must not teleport them
    // to Genoa.
    assert.deepEqual(hereTarget('city', cities, PALERMO), { region: 'sicilia' });
  });

  test('with no located cities at all, "my city" still names the region', () => {
    assert.deepEqual(hereTarget('city', [], GENOA), { region: 'liguria' });
  });
});
