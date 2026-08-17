import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { placesVisible } from '../src/lib/map/places-visible.ts';
import { PLACES_MIN_ZOOM } from '../src/lib/map/places-min-zoom.ts';

describe('placesVisible', () => {
  test('needs the layer switched on', () => {
    assert.equal(placesVisible(false, PLACES_MIN_ZOOM + 4), false);
    assert.equal(placesVisible(false, 3), false);
  });

  test('needs the camera at or past the threshold', () => {
    assert.equal(placesVisible(true, PLACES_MIN_ZOOM), true);
    assert.equal(placesVisible(true, PLACES_MIN_ZOOM + 0.01), true);
    assert.equal(placesVisible(true, PLACES_MIN_ZOOM - 0.01), false);
  });

  test('stays off at the overview zooms that used to pull whole regions', () => {
    // 8.94 is the camera that measured 15.6 MB across four shards on production.
    for (const zoom of [4.9, 6, 8.94, 9.99]) {
      assert.equal(placesVisible(true, zoom), false, `zoom ${zoom}`);
    }
  });
});
