import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { roundedRating } from '../src/lib/places/rounded-rating.ts';

describe('roundedRating', () => {
  test('rounds to one decimal place', () => {
    assert.equal(roundedRating(4.26), 4.3);
    assert.equal(roundedRating(3.44), 3.4);
  });

  test('keeps a whole rating whole', () => {
    assert.equal(roundedRating(5), 5);
  });

  test('no reviews means no average', () => {
    assert.equal(roundedRating(undefined), 0);
    assert.equal(roundedRating(0), 0);
  });
});
