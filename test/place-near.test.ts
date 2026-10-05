// The place a position turns into, with the city list the page actually
// carries. Coordinates are real: Genova's old port, Milano's Duomo, a point in
// the Tyrrhenian Sea two hundred kilometres west of Rome.
import { describe, expect, test } from 'bun:test';
import { placeNear } from '../src/lib/region/place-near.ts';
import type { LocatedCity } from '../src/lib/region/here-target.ts';

const CITIES: readonly LocatedCity[] = [
  { region: 'liguria', city: 'genova', lat: 44.4056, lng: 8.9463 },
  { region: 'lombardia', city: 'milano', lat: 45.4642, lng: 9.19 },
  { region: 'lazio', city: 'roma', lat: 41.9028, lng: 12.4964 },
];

describe('placeNear', () => {
  test('a reader standing in a town we cover is woken about the town', () => {
    expect(placeNear(CITIES, [44.41, 8.93])).toBe('city:genova');
    expect(placeNear(CITIES, [45.46, 9.19])).toBe('city:milano');
  });

  test('a town an hour away is still their town', () => {
    // Savona, 45 km down the coast from Genova and not in the list.
    expect(placeNear(CITIES, [44.3089, 8.4772])).toBe('city:genova');
  });

  test('too far from anywhere we cover falls back to the region', () => {
    // Out at sea off Civitavecchia: the nearest listed town is 200 km away.
    expect(placeNear(CITIES, [41.9, 10.1])).toBe('region:toscana');
  });

  test('a page with no city rows still knows the region', () => {
    expect(placeNear([], [45.07, 7.68])).toBe('region:piemonte');
  });
});
