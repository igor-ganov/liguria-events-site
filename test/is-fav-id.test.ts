import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { isFavId } from '../src/lib/favorites/is-fav-id.ts';

describe('isFavId', () => {
  test('accepts event ids and POI ids (landmarks/places)', () => {
    for (const id of ['72c106091029', 'wd:Q1048820', 'osm:node/123', 'osm:way/456789', 'ovt:3f']) {
      assert.equal(isFavId(id), true, id);
    }
  });
  test('rejects junk, empty, over-long and non-strings', () => {
    assert.equal(isFavId(''), false);
    assert.equal(isFavId('a b'), false);
    assert.equal(isFavId('<script>'), false);
    assert.equal(isFavId('x'.repeat(81)), false);
    assert.equal(isFavId(42), false);
    assert.equal(isFavId(undefined), false);
  });
});
