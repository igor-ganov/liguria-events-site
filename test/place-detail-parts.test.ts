// Pure helpers pulled out of PlaceDetail.astro: the canonical path (which has
// to survive a slug that matched nothing) and the server-rendered star row.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { placeDetailPath } from '../src/lib/places/place-detail-path.ts';
import { reviewStars } from '../src/lib/places/review-stars.ts';
import type { Place } from '../src/lib/places/place-schema.ts';

const place: Place = {
  id: 'osm:node/1',
  name: 'Ristorante Zeffirino',
  lat: 44.4,
  lng: 8.93,
  cat: 'restaurant',
  region: 'liguria',
};

describe('placeDetailPath', () => {
  test('is the place’s own readable path', () => {
    assert.ok(placeDetailPath('liguria', place).startsWith('place/liguria/'));
  });
  test('falls back to the region index when the slug matched nothing', () => {
    assert.equal(placeDetailPath('liguria', undefined), 'liguria/places/');
  });
});

describe('reviewStars', () => {
  const lit = (html: string): number => html.split('rv-star on').length - 1;
  test('lights the rounded rating, out of five', () => {
    assert.equal(reviewStars(0).split('<span').length - 1, 5);
    assert.equal(lit(reviewStars(0)), 0);
    assert.equal(lit(reviewStars(3)), 3);
    assert.equal(lit(reviewStars(4.6)), 5);
  });
});
