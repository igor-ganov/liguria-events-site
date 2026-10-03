// Geolocate area check for the map "where am I" button.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { inMapArea } from '../src/lib/map/in-map-area.ts';

describe('inMapArea', () => {
  // The basemap is a country-wide extract; the Liguria extract on top of it only
  // adds detail at high zoom. The bbox here was Liguria's, so "find me" told a
  // reader in Milan they were outside a map that can draw Milan perfectly well.
  test('accepts Genoa', () => assert.equal(inMapArea(8.93, 44.41), true));
  test('accepts western Liguria', () => assert.equal(inMapArea(8.4, 44.2), true));
  test('accepts Milan, Rome, Palermo and Bolzano', () => {
    assert.equal(inMapArea(9.19, 45.46), true);
    assert.equal(inMapArea(12.5, 41.9), true);
    assert.equal(inMapArea(13.36, 38.12), true);
    assert.equal(inMapArea(11.35, 46.5), true);
  });
  // A rectangle around Italy takes in a strip of its neighbours — Nice is west
  // of Ventimiglia, and no box holds one without the other. The extract has
  // tiles a little past the border, so centring there is not blank either.
  test('rejects what is nowhere near it', () => {
    assert.equal(inMapArea(37.6, 55.75), false);
    assert.equal(inMapArea(2.35, 48.86), false);
    assert.equal(inMapArea(13.4, 52.5), false);
  });
});
